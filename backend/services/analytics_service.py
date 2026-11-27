"""
Analytics data computation service.

Aggregates detection results, alert data, and model information
into summary statistics consumed by the frontend dashboard.
"""

import json
import logging
import os
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List

from config import Config
from models.model_utils import get_model_info, is_model_loaded
from services.alert_service import get_alert_stats

logger = logging.getLogger(__name__)


def _load_all_results() -> List[Dict]:
    """Load every detection-result JSON file from the results folder."""
    results: List[Dict] = []
    results_dir = Config.RESULTS_FOLDER
    if not os.path.isdir(results_dir):
        return results
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


def get_summary() -> Dict[str, Any]:
    """
    Overall detection statistics for the dashboard summary card.

    Returns dict with:
        total_videos, total_anomalies, detection_breakdown, recent_detections
    """
    results = _load_all_results()
    total_videos = len(results)
    total_anomalies = sum(
        1 for r in results
        if r.get("dominant_class") in Config.ANOMALY_CLASSES
    )

    breakdown: Dict[str, int] = {lbl: 0 for lbl in Config.CLASS_LABELS}
    for r in results:
        cls = r.get("dominant_class")
        if cls and cls in breakdown:
            breakdown[cls] += 1

    recent = results[:10]  # newest 10
    recent_detections = [
        {
            "id": r.get("id"),
            "filename": r.get("filename"),
            "class": r.get("dominant_class"),
            "confidence": r.get("dominant_confidence"),
            "timestamp": r.get("timestamp"),
        }
        for r in recent
    ]

    return {
        "total_videos": total_videos,
        "total_anomalies": total_anomalies,
        "normal_count": breakdown.get("Normal Activity", 0),
        "detection_breakdown": breakdown,
        "recent_detections": recent_detections,
        "alert_stats": get_alert_stats(),
    }


def get_timeline() -> Dict[str, Any]:
    """
    Detection timeline — detections grouped by date.

    Returns:
        {dates: [str], counts: [int], anomaly_counts: [int], details: {date: [...]}}
    """
    results = _load_all_results()
    daily: Dict[str, Dict[str, Any]] = defaultdict(lambda: {"total": 0, "anomalies": 0, "items": []})

    for r in results:
        ts = r.get("timestamp", "")
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            date_str = dt.strftime("%Y-%m-%d")
        except Exception:
            date_str = "unknown"

        daily[date_str]["total"] += 1
        if r.get("dominant_class") in Config.ANOMALY_CLASSES:
            daily[date_str]["anomalies"] += 1
        daily[date_str]["items"].append({
            "id": r.get("id"),
            "class": r.get("dominant_class"),
            "confidence": r.get("dominant_confidence"),
            "timestamp": ts,
        })

    sorted_dates = sorted(daily.keys())
    return {
        "dates": sorted_dates,
        "counts": [daily[d]["total"] for d in sorted_dates],
        "anomaly_counts": [daily[d]["anomalies"] for d in sorted_dates],
        "details": {d: daily[d]["items"] for d in sorted_dates},
    }


def get_model_analytics() -> Dict[str, Any]:
    """Return model architecture info and current status."""
    return get_model_info(
        class_labels=Config.CLASS_LABELS,
        sequence_length=Config.SEQUENCE_LENGTH,
        image_size=Config.IMAGE_SIZE,
        num_channels=Config.NUM_CHANNELS,
    )


def get_performance() -> Dict[str, Any]:
    """
    Compute performance metrics from detection history.

    Since we have no ground-truth labels the metrics reflect the
    distribution of detected classes and confidences.
    """
    results = _load_all_results()
    if not results:
        return {
            "total_detections": 0,
            "model_loaded": is_model_loaded(),
            "average_confidence": 0.0,
            "class_distribution": {},
            "confidence_histogram": {},
            "note": "No detections available yet.",
        }

    confidences: List[float] = []
    class_dist: Dict[str, int] = {lbl: 0 for lbl in Config.CLASS_LABELS}
    conf_buckets: Dict[str, int] = {
        "0.0-0.2": 0, "0.2-0.4": 0, "0.4-0.6": 0, "0.6-0.8": 0, "0.8-1.0": 0,
    }

    for r in results:
        conf = r.get("dominant_confidence", 0.0)
        confidences.append(conf)
        cls = r.get("dominant_class", "Unknown")
        if cls in class_dist:
            class_dist[cls] += 1
        if conf < 0.2:
            conf_buckets["0.0-0.2"] += 1
        elif conf < 0.4:
            conf_buckets["0.2-0.4"] += 1
        elif conf < 0.6:
            conf_buckets["0.4-0.6"] += 1
        elif conf < 0.8:
            conf_buckets["0.6-0.8"] += 1
        else:
            conf_buckets["0.8-1.0"] += 1

    avg_conf = round(sum(confidences) / len(confidences), 4) if confidences else 0.0

    # Load training metrics if available
    training_metrics_path = os.path.join(Config.RESULTS_FOLDER, "training_metrics.json")
    training_data = None
    if os.path.isfile(training_metrics_path):
        try:
            with open(training_metrics_path, "r", encoding="utf-8") as fh:
                training_data = json.load(fh)
        except Exception:
            training_data = None

    return {
        "total_detections": len(results),
        "model_loaded": is_model_loaded(),
        "average_confidence": avg_conf,
        "class_distribution": class_dist,
        "confidence_histogram": conf_buckets,
        "training_metrics": training_data,
    }
