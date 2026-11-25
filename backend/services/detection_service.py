"""
Detection orchestration service.

Coordinates video processing, model inference, result persistence,
and alert generation for uploaded videos.
"""

import json
import logging
import os
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import numpy as np

from config import Config
from models.model_utils import is_model_loaded, predict
from services.alert_service import generate_alert
from services.video_processor import process_video

logger = logging.getLogger(__name__)


def _results_dir() -> str:
    os.makedirs(Config.RESULTS_FOLDER, exist_ok=True)
    return Config.RESULTS_FOLDER


def _save_result(result: Dict) -> None:
    """Persist a detection result as a JSON file."""
    path = os.path.join(_results_dir(), f"{result['id']}.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2, default=str)


def _load_result(result_id: str) -> Optional[Dict]:
    """Load a single detection result by ID."""
    path = os.path.join(_results_dir(), f"{result_id}.json")
    if not os.path.isfile(path):
        return None
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def run_detection(video_path: str, filename: str) -> Dict[str, Any]:
    """
    Run the full detection pipeline on an uploaded video.

    Steps:
        1. Process video into frame sequences.
        2. Run model inference on each sequence.
        3. Aggregate predictions.
        4. Generate alerts for anomalies.
        5. Persist the result.

    Args:
        video_path: Absolute path to the saved video file.
        filename: Original filename.

    Returns:
        Detection result dictionary.
    """
    detection_id = str(uuid.uuid4())
    start_time = time.time()

    try:
        # Step 1 — video processing
        sequences, video_info = process_video(
            video_path,
            sequence_length=Config.SEQUENCE_LENGTH,
            image_size=Config.IMAGE_SIZE,
        )

        # Step 2 — inference
        raw_predictions = predict(sequences, Config.CLASS_LABELS)

        # Step 3 — aggregate (majority vote weighted by confidence)
        class_scores: Dict[str, float] = {lbl: 0.0 for lbl in Config.CLASS_LABELS}
        for pred in raw_predictions:
            for lbl, prob in pred["all_probabilities"].items():
                class_scores[lbl] += prob

        total_seqs = len(raw_predictions)
        avg_scores = {lbl: round(score / total_seqs, 4) for lbl, score in class_scores.items()}
        dominant_class = max(avg_scores, key=avg_scores.get)  # type: ignore[arg-type]
        dominant_confidence = avg_scores[dominant_class]

        predictions_summary: List[Dict[str, Any]] = [
            {"class": lbl, "confidence": score}
            for lbl, score in sorted(avg_scores.items(), key=lambda x: x[1], reverse=True)
        ]

        elapsed = round(time.time() - start_time, 3)

        result: Dict[str, Any] = {
            "id": detection_id,
            "filename": filename,
            "video_url": f"/uploads/{os.path.basename(video_path)}",
            "status": "completed",
            "model_loaded": is_model_loaded(),
            "dominant_class": dominant_class,
            "dominant_confidence": dominant_confidence,
            "predictions": predictions_summary,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "duration": elapsed,
            "frames_analyzed": video_info.get("frames_processed", 0),
            "sequences_analyzed": total_seqs,
            "video_info": video_info,
            "per_sequence_predictions": raw_predictions,
        }

        # Step 4 — alert generation
        if dominant_class in Config.ANOMALY_CLASSES and dominant_confidence > Config.CONFIDENCE_THRESHOLD:
            alert = generate_alert(
                detection_id=detection_id,
                detection_class=dominant_class,
                confidence=dominant_confidence,
                filename=filename,
            )
            result["alert_id"] = alert["id"]

        # Step 5 — persist
        _save_result(result)

        logger.info(
            "Detection %s completed in %.2fs — %s (%.2f)",
            detection_id, elapsed, dominant_class, dominant_confidence,
        )
        return result

    except Exception as exc:
        logger.error("Detection failed for %s: %s", filename, exc, exc_info=True)
        error_result: Dict[str, Any] = {
            "id": detection_id,
            "filename": filename,
            "status": "failed",
            "error": str(exc),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "duration": round(time.time() - start_time, 3),
        }
        _save_result(error_result)
        return error_result


def get_all_results() -> List[Dict]:
    """Return all stored detection results, newest first."""
    results: List[Dict] = []
    results_dir = _results_dir()
    for fname in os.listdir(results_dir):
        if fname.endswith(".json") and fname not in ("alerts.json", "cameras.json"):
            path = os.path.join(results_dir, fname)
            try:
                with open(path, "r", encoding="utf-8") as fh:
                    results.append(json.load(fh))
            except Exception:
                continue
    results.sort(key=lambda r: r.get("timestamp", ""), reverse=True)
    return results


def get_result(result_id: str) -> Optional[Dict]:
    """Get a single detection result by ID."""
    return _load_result(result_id)


def delete_result(result_id: str) -> bool:
    """Delete a detection result by ID. Returns True if deleted."""
    path = os.path.join(_results_dir(), f"{result_id}.json")
    if os.path.isfile(path):
        os.remove(path)
        logger.info("Deleted detection result %s", result_id)
        return True
    return False
