"""
Detection routes — video upload, processing, and result management.
"""

import logging
import os
from typing import Any, Dict

from flask import Blueprint, current_app, jsonify, request

from config import Config
from services.detection_service import (
    delete_result,
    get_all_results,
    get_result,
    run_detection,
)
from utils.helpers import allowed_file, generate_unique_filename

logger = logging.getLogger(__name__)

detection_bp = Blueprint("detection", __name__, url_prefix="/api/detection")


@detection_bp.route("/upload", methods=["POST"])
def upload_video():
    """
    Upload a video file, run anomaly detection, and return the results.

    Expects multipart/form-data with a ``video`` file field.
    """
    if "video" not in request.files:
        return jsonify({"error": "No video file provided. Use form field 'video'."}), 400

    file = request.files["video"]
    if file.filename == "" or file.filename is None:
        return jsonify({"error": "Empty filename."}), 400

    if not allowed_file(file.filename, Config.ALLOWED_EXTENSIONS):
        return jsonify({
            "error": f"File type not allowed. Accepted: {', '.join(sorted(Config.ALLOWED_EXTENSIONS))}",
        }), 400

    original_filename: str = file.filename
    safe_filename: str = generate_unique_filename(original_filename)
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    save_path: str = os.path.join(Config.UPLOAD_FOLDER, safe_filename)

    try:
        file.save(save_path)
        logger.info("Video saved: %s", save_path)
    except Exception as exc:
        logger.error("Failed to save uploaded file: %s", exc)
        return jsonify({"error": "Failed to save the uploaded file."}), 500

    # Run detection pipeline
    result: Dict[str, Any] = run_detection(save_path, original_filename)
    status_code = 200 if result.get("status") == "completed" else 500
    return jsonify(result), status_code


@detection_bp.route("/results", methods=["GET"])
def list_results():
    """Return all detection results."""
    results = get_all_results()
    return jsonify({"results": results, "total": len(results)}), 200


@detection_bp.route("/results/<result_id>", methods=["GET"])
def get_single_result(result_id: str):
    """Return a specific detection result by ID."""
    result = get_result(result_id)
    if result is None:
        return jsonify({"error": "Detection result not found."}), 404
    return jsonify(result), 200


@detection_bp.route("/results/<result_id>", methods=["DELETE"])
def delete_single_result(result_id: str):
    """Delete a detection result."""
    if delete_result(result_id):
        return jsonify({"message": f"Result {result_id} deleted."}), 200
    return jsonify({"error": "Detection result not found."}), 404
