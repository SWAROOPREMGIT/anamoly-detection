"""
Camera management routes.

Camera configurations are persisted in ``results/cameras.json``.
"""

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import cv2
from flask import Blueprint, jsonify, request

from config import Config

logger = logging.getLogger(__name__)

camera_bp = Blueprint("cameras", __name__, url_prefix="/api/cameras")

_CAMERAS_FILE: str = os.path.join(Config.RESULTS_FOLDER, "cameras.json")


# ------------------------------------------------------------------ #
# Internal persistence helpers
# ------------------------------------------------------------------ #

def _ensure_file() -> None:
    os.makedirs(Config.RESULTS_FOLDER, exist_ok=True)
    if not os.path.isfile(_CAMERAS_FILE):
        with open(_CAMERAS_FILE, "w", encoding="utf-8") as fh:
            json.dump([], fh)


def _load_cameras() -> List[Dict]:
    _ensure_file()
    with open(_CAMERAS_FILE, "r", encoding="utf-8") as fh:
        try:
            return json.load(fh)
        except json.JSONDecodeError:
            return []


def _save_cameras(cameras: List[Dict]) -> None:
    _ensure_file()
    with open(_CAMERAS_FILE, "w", encoding="utf-8") as fh:
        json.dump(cameras, fh, indent=2, default=str)


def _find_camera(camera_id: str) -> Optional[Dict]:
    for cam in _load_cameras():
        if cam["id"] == camera_id:
            return cam
    return None


# ------------------------------------------------------------------ #
# Routes
# ------------------------------------------------------------------ #

@camera_bp.route("/", methods=["GET"])
def list_cameras():
    """List all configured cameras."""
    cameras = _load_cameras()
    return jsonify({"cameras": cameras, "total": len(cameras)}), 200


@camera_bp.route("/", methods=["POST"])
def add_camera():
    """
    Add a new camera.

    JSON body:
        name (str): Display name.
        url (str): RTSP URL or webcam index (as string, e.g. "0").
        type (str): "rtsp" | "webcam" | "ip" (default "webcam").
    """
    data: Dict[str, Any] = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    url = data.get("url", "").strip()
    cam_type = data.get("type", "webcam").strip().lower()

    if not name:
        return jsonify({"error": "'name' is required."}), 400
    if not url:
        return jsonify({"error": "'url' is required (RTSP URL or webcam index)."}), 400
    if cam_type not in ("rtsp", "webcam", "ip"):
        return jsonify({"error": "'type' must be one of: rtsp, webcam, ip"}), 400

    camera: Dict[str, Any] = {
        "id": str(uuid.uuid4()),
        "name": name,
        "url": url,
        "type": cam_type,
        "status": "disconnected",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    cameras = _load_cameras()
    cameras.append(camera)
    _save_cameras(cameras)

    logger.info("Camera added: %s (%s)", name, camera["id"])
    return jsonify({"message": "Camera added.", "camera": camera}), 201


@camera_bp.route("/<camera_id>", methods=["PUT"])
def update_camera(camera_id: str):
    """Update an existing camera's configuration."""
    data: Dict[str, Any] = request.get_json(silent=True) or {}
    cameras = _load_cameras()

    for cam in cameras:
        if cam["id"] == camera_id:
            if "name" in data:
                cam["name"] = data["name"].strip()
            if "url" in data:
                cam["url"] = data["url"].strip()
            if "type" in data:
                cam["type"] = data["type"].strip().lower()
            cam["updated_at"] = datetime.now(timezone.utc).isoformat()
            _save_cameras(cameras)
            return jsonify({"message": "Camera updated.", "camera": cam}), 200

    return jsonify({"error": "Camera not found."}), 404


@camera_bp.route("/<camera_id>", methods=["DELETE"])
def delete_camera(camera_id: str):
    """Delete a camera."""
    cameras = _load_cameras()
    original_len = len(cameras)
    cameras = [c for c in cameras if c["id"] != camera_id]
    if len(cameras) < original_len:
        _save_cameras(cameras)
        return jsonify({"message": f"Camera {camera_id} deleted."}), 200
    return jsonify({"error": "Camera not found."}), 404


@camera_bp.route("/<camera_id>/status", methods=["GET"])
def camera_status(camera_id: str):
    """
    Check if a camera source is reachable.

    Attempts to open the video source briefly with OpenCV.
    """
    cam = _find_camera(camera_id)
    if cam is None:
        return jsonify({"error": "Camera not found."}), 404

    source = cam["url"]
    # If source looks like a webcam index, convert to int
    try:
        source_val: Any = int(source)
    except ValueError:
        source_val = source

    status = "disconnected"
    try:
        cap = cv2.VideoCapture(source_val)
        if cap.isOpened():
            ret, _ = cap.read()
            status = "connected" if ret else "disconnected"
        cap.release()
    except Exception as exc:
        logger.warning("Camera %s status check failed: %s", camera_id, exc)

    # Update stored status
    cameras = _load_cameras()
    for c in cameras:
        if c["id"] == camera_id:
            c["status"] = status
            c["last_checked"] = datetime.now(timezone.utc).isoformat()
    _save_cameras(cameras)

    return jsonify({"camera_id": camera_id, "status": status}), 200
