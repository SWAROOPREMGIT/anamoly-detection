"""
Alert management routes.
"""

import logging
from typing import Optional

from flask import Blueprint, jsonify, request

from services.alert_service import (
    acknowledge_alert,
    delete_alert,
    get_alert,
    get_alert_stats,
    get_alerts,
)
from utils.helpers import safe_int

logger = logging.getLogger(__name__)

alerts_bp = Blueprint("alerts", __name__, url_prefix="/api/alerts")


@alerts_bp.route("/", methods=["GET"])
def list_alerts():
    """
    List alerts with optional filtering.

    Query params:
        limit (int): max number of alerts.
        severity (str): filter by severity (high|medium|low).
    """
    limit: int = safe_int(request.args.get("limit"), default=0)
    severity: Optional[str] = request.args.get("severity")

    if severity and severity not in ("high", "medium", "low"):
        return jsonify({"error": "severity must be one of: high, medium, low"}), 400

    alerts = get_alerts(limit=limit, severity=severity)
    return jsonify({"alerts": alerts, "total": len(alerts)}), 200


@alerts_bp.route("/<alert_id>", methods=["GET"])
def get_single_alert(alert_id: str):
    """Get a specific alert."""
    alert = get_alert(alert_id)
    if alert is None:
        return jsonify({"error": "Alert not found."}), 404
    return jsonify(alert), 200


@alerts_bp.route("/<alert_id>/acknowledge", methods=["PUT"])
def acknowledge(alert_id: str):
    """Mark an alert as acknowledged."""
    alert = acknowledge_alert(alert_id)
    if alert is None:
        return jsonify({"error": "Alert not found."}), 404
    return jsonify({"message": "Alert acknowledged.", "alert": alert}), 200


@alerts_bp.route("/<alert_id>", methods=["DELETE"])
def remove_alert(alert_id: str):
    """Delete an alert."""
    if delete_alert(alert_id):
        return jsonify({"message": f"Alert {alert_id} deleted."}), 200
    return jsonify({"error": "Alert not found."}), 404


@alerts_bp.route("/stats", methods=["GET"])
def alert_statistics():
    """Return aggregate alert statistics."""
    stats = get_alert_stats()
    return jsonify(stats), 200
