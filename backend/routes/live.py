"""
Live monitoring / streaming routes.

Provides endpoints to start/stop live camera monitoring and an
SSE (Server-Sent Events) stream that pushes frame-by-frame predictions
to the frontend in real time.
"""

import json
import logging
import threading
import time
from datetime import datetime, timezone
from typing import Any, Dict, Generator, Optional

import cv2
import numpy as np
from flask import Blueprint, Response, jsonify, request

from config import Config
from models.model_utils import is_model_loaded, predict
from services.alert_service import generate_alert
from services.video_processor import preprocess_frames

logger = logging.getLogger(__name__)

live_bp = Blueprint("live", __name__, url_prefix="/api/live")


# ------------------------------------------------------------------ #
# Module-level monitoring state
# ------------------------------------------------------------------ #

class LiveMonitor:
    """Encapsulates the state of the live monitoring thread."""

    def __init__(self) -> None:
        self.active: bool = False
        self.source: Optional[Any] = None
        self.thread: Optional[threading.Thread] = None
        self.latest_result: Optional[Dict] = None
        self.frame_count: int = 0
        self.started_at: Optional[str] = None
        self._lock = threading.Lock()
        self._stop_event = threading.Event()
        self._results_buffer: list = []

    def start(self, source: Any) -> bool:
        if self.active:
            return False
        self._stop_event.clear()
        self.source = source
        self.frame_count = 0
        self.latest_result = None
        self._results_buffer = []
        self.started_at = datetime.now(timezone.utc).isoformat()
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.active = True
        self.thread.start()
        return True

    def stop(self) -> bool:
        if not self.active:
            return False
        self._stop_event.set()
        if self.thread:
            self.thread.join(timeout=5)
        self.active = False
        self.source = None
        self.thread = None
        return True

    def push_result(self, result: Dict) -> None:
        with self._lock:
            self.latest_result = result
            self._results_buffer.append(result)
            # Keep only last 500 results in memory
            if len(self._results_buffer) > 500:
                self._results_buffer = self._results_buffer[-500:]

    def pop_results(self) -> list:
        with self._lock:
            results = list(self._results_buffer)
            self._results_buffer.clear()
            return results

    # ---- internal monitoring loop ---- #

    def _run(self) -> None:
        """Background thread: read frames, build sequences, run inference."""
        try:
            source_val = int(self.source) if str(self.source).isdigit() else self.source
        except (TypeError, ValueError):
            source_val = self.source

        cap = cv2.VideoCapture(source_val)
        if not cap.isOpened():
            logger.error("Cannot open video source: %s", self.source)
            self.active = False
            return

        frame_buffer: list = []
        seq_len = Config.SEQUENCE_LENGTH
        img_size = Config.IMAGE_SIZE

        logger.info("Live monitoring started on source: %s", self.source)

        try:
            while not self._stop_event.is_set():
                ret, frame = cap.read()
                if not ret:
                    time.sleep(0.05)
                    continue

                self.frame_count += 1

                # Preprocess single frame
                processed = preprocess_frames([frame], image_size=img_size)
                frame_buffer.extend(processed)

                # Once we have a full sequence, run prediction
                if len(frame_buffer) >= seq_len:
                    sequence = np.array([frame_buffer[:seq_len]], dtype=np.float32)
                    frame_buffer = frame_buffer[seq_len // 2:]  # overlap by half

                    preds = predict(sequence, Config.CLASS_LABELS)
                    if preds:
                        pred = preds[0]
                        result: Dict[str, Any] = {
                            "frame": self.frame_count,
                            "class": pred["class"],
                            "confidence": pred["confidence"],
                            "probabilities": pred["all_probabilities"],
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "model_loaded": is_model_loaded(),
                        }
                        self.push_result(result)

                        # Auto-alert on anomalies
                        if (
                            pred["class"] in Config.ANOMALY_CLASSES
                            and pred["confidence"] > Config.CONFIDENCE_THRESHOLD
                        ):
                            generate_alert(
                                detection_id=f"live-{self.frame_count}",
                                detection_class=pred["class"],
                                confidence=pred["confidence"],
                                filename=f"live_source_{self.source}",
                            )

                # Throttle to ~15 fps
                time.sleep(0.033)
        except Exception as exc:
            logger.error("Live monitoring error: %s", exc, exc_info=True)
        finally:
            cap.release()
            self.active = False
            logger.info("Live monitoring stopped.")


_monitor = LiveMonitor()


# ------------------------------------------------------------------ #
# Routes
# ------------------------------------------------------------------ #

@live_bp.route("/start", methods=["POST"])
def start_monitoring():
    """
    Start live monitoring on a camera source.

    JSON body:
        source (str): Webcam index ("0") or RTSP URL.
    """
    data = request.get_json(silent=True) or {}
    source = data.get("source", "0")

    if _monitor.active:
        return jsonify({"error": "Live monitoring is already active.", "status": "active"}), 409

    success = _monitor.start(source)
    if success:
        return jsonify({
            "message": "Live monitoring started.",
            "source": source,
            "status": "active",
        }), 200
    return jsonify({"error": "Failed to start monitoring."}), 500


@live_bp.route("/stop", methods=["POST"])
def stop_monitoring():
    """Stop the active live monitoring session."""
    if not _monitor.active:
        return jsonify({"message": "No active monitoring session.", "status": "inactive"}), 200

    _monitor.stop()
    return jsonify({"message": "Live monitoring stopped.", "status": "inactive"}), 200


@live_bp.route("/status", methods=["GET"])
def monitoring_status():
    """Return current live monitoring status."""
    return jsonify({
        "active": _monitor.active,
        "source": str(_monitor.source) if _monitor.source is not None else None,
        "frame_count": _monitor.frame_count,
        "started_at": _monitor.started_at,
        "latest_result": _monitor.latest_result,
    }), 200


@live_bp.route("/feed", methods=["GET"])
def live_feed():
    """
    SSE stream for live detection results.

    The client should connect with ``EventSource`` and listen for
    ``data`` events containing JSON detection payloads.
    """

    def event_stream() -> Generator[str, None, None]:
        while _monitor.active:
            results = _monitor.pop_results()
            for r in results:
                yield f"data: {json.dumps(r)}\n\n"
            if not results:
                # Send heartbeat every second
                yield f"data: {json.dumps({'heartbeat': True})}\n\n"
            time.sleep(0.5)
        yield f"data: {json.dumps({'status': 'stopped'})}\n\n"

    return Response(
        event_stream(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
