"""
Analytics and statistics routes.
"""

import logging

from flask import Blueprint, jsonify

from services.analytics_service import (
    get_model_analytics,
    get_performance,
    get_summary,
    get_timeline,
)

logger = logging.getLogger(__name__)

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


@analytics_bp.route("/summary", methods=["GET"])
def summary():
    """Overall detection statistics."""
    data = get_summary()
    return jsonify(data), 200


@analytics_bp.route("/timeline", methods=["GET"])
def timeline():
    """Detection timeline data (detections grouped by date)."""
    data = get_timeline()
    return jsonify(data), 200


@analytics_bp.route("/model-info", methods=["GET"])
def model_info():
    """Model architecture info, status, input shape, and class labels."""
    data = get_model_analytics()
    return jsonify(data), 200


@analytics_bp.route("/performance", methods=["GET"])
def performance():
    """Model performance metrics computed from detection history."""
    data = get_performance()
    return jsonify(data), 200
