"""
Alert generation and management service.

Alerts are stored in a single JSON file (results/alerts.json).
"""

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from config import Config

logger = logging.getLogger(__name__)

_ALERTS_FILE: str = os.path.join(Config.RESULTS_FOLDER, "alerts.json")


def _ensure_file() -> None:
    os.makedirs(Config.RESULTS_FOLDER, exist_ok=True)
    if not os.path.isfile(_ALERTS_FILE):
        with open(_ALERTS_FILE, "w", encoding="utf-8") as fh:
            json.dump([], fh)


def _load_alerts() -> List[Dict]:
    _ensure_file()
    with open(_ALERTS_FILE, "r", encoding="utf-8") as fh:
        try:
            return json.load(fh)
        except json.JSONDecodeError:
            return []


def _save_alerts(alerts: List[Dict]) -> None:
    _ensure_file()
    with open(_ALERTS_FILE, "w", encoding="utf-8") as fh:
        json.dump(alerts, fh, indent=2, default=str)


# ------------------------------------------------------------------ #
# Public API
# ------------------------------------------------------------------ #

def generate_alert(
    detection_id: str,
    detection_class: str,
    confidence: float,
    filename: str,
) -> Dict[str, Any]:
    """
    Create a new alert from a detection event and persist it.

    Args:
        detection_id: ID of the detection that triggered the alert.
        detection_class: Predicted class label.
        confidence: Prediction confidence.
        filename: Original video filename.

    Returns:
        The newly created alert dict.
    """
    alert: Dict[str, Any] = {
        "id": str(uuid.uuid4()),
        "detection_id": detection_id,
        "type": detection_class,
        "severity": Config.SEVERITY_MAP.get(detection_class, "low"),
        "confidence": round(confidence, 4),
        "filename": filename,
        "message": f"{detection_class} detected with {confidence:.1%} confidence in {filename}",
        "acknowledged": False,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    alerts = _load_alerts()
    alerts.insert(0, alert)
    _save_alerts(alerts)
    logger.info("Alert %s generated: %s (%s)", alert["id"], detection_class, alert["severity"])
    return alert


def get_alerts(
    limit: int = 0,
    severity: Optional[str] = None,
) -> List[Dict]:
    """
    Retrieve alerts with optional filtering.

    Args:
        limit: Max number of alerts to return (0 = all).
        severity: Filter by severity level.
    """
    alerts = _load_alerts()
    if severity:
        alerts = [a for a in alerts if a.get("severity") == severity]
    if limit > 0:
        alerts = alerts[:limit]
    return alerts


def get_alert(alert_id: str) -> Optional[Dict]:
    """Get a single alert by ID."""
    for alert in _load_alerts():
        if alert["id"] == alert_id:
            return alert
    return None


def acknowledge_alert(alert_id: str) -> Optional[Dict]:
    """Mark an alert as acknowledged."""
    alerts = _load_alerts()
    for alert in alerts:
        if alert["id"] == alert_id:
            alert["acknowledged"] = True
            alert["acknowledged_at"] = datetime.now(timezone.utc).isoformat()
            _save_alerts(alerts)
            logger.info("Alert %s acknowledged", alert_id)
            return alert
    return None


def delete_alert(alert_id: str) -> bool:
    """Delete an alert by ID."""
    alerts = _load_alerts()
    original_len = len(alerts)
    alerts = [a for a in alerts if a["id"] != alert_id]
    if len(alerts) < original_len:
        _save_alerts(alerts)
        logger.info("Alert %s deleted", alert_id)
        return True
    return False


def get_alert_stats() -> Dict[str, Any]:
    """Compute aggregate alert statistics."""
    alerts = _load_alerts()
    total = len(alerts)
    acknowledged = sum(1 for a in alerts if a.get("acknowledged"))
    unacknowledged = total - acknowledged

    severity_counts: Dict[str, int] = {"high": 0, "medium": 0, "low": 0}
    type_counts: Dict[str, int] = {}

    for alert in alerts:
        sev = alert.get("severity", "low")
        severity_counts[sev] = severity_counts.get(sev, 0) + 1
        atype = alert.get("type", "Unknown")
        type_counts[atype] = type_counts.get(atype, 0) + 1

    return {
        "total": total,
        "acknowledged": acknowledged,
        "unacknowledged": unacknowledged,
        "by_severity": severity_counts,
        "by_type": type_counts,
    }
