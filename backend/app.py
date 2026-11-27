"""
Main entry point for the Video Anomaly and Violence Detection backend.
"""

import logging
import os
import sys
from datetime import datetime, timezone

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from config import Config
from models.model_utils import is_model_loaded, load_model
from routes.alerts import alerts_bp
from routes.analytics import analytics_bp
from routes.camera import camera_bp
from routes.detection import detection_bp
from routes.live import _monitor, live_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


def create_app() -> Flask:
    """Create and configure the Flask application instance."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize folders
    Config.init_directories()

    # Enable CORS for frontend clients
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "*",
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization", "Accept"],
            }
        },
    )

    # Register blueprints
    app.register_blueprint(detection_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(camera_bp)
    app.register_blueprint(live_bp)

    # Load machine learning model (gracefully handles absence of trained weights)
    logger.info("Initializing anomaly detection model...")
    try:
        load_model(
            model_path=Config.MODEL_PATH,
            sequence_length=Config.SEQUENCE_LENGTH,
            image_size=Config.IMAGE_SIZE,
            num_channels=Config.NUM_CHANNELS,
            num_classes=Config.NUM_CLASSES,
        )
    except Exception as exc:
        logger.warning("Could not initialize model at startup: %s", exc)

    # ---------------------------------------------------------------- #
    # System endpoints
    # ---------------------------------------------------------------- #

    @app.route("/api/system/health", methods=["GET"])
    def health_check():
        """Basic health check endpoint."""
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": "Video Anomaly & Violence Detection Backend",
            "version": "1.0.0",
        }), 200

    @app.route("/api/system/status", methods=["GET"])
    def system_status():
        """High-level system status endpoint."""
        return jsonify({
            "status": "online",
            "model_loaded": is_model_loaded(),
            "monitoring_active": _monitor.active,
            "classes_supported": Config.CLASS_LABELS,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }), 200

    @app.route("/uploads/<path:filename>")
    def serve_upload(filename: str):
        """Serve uploaded videos if requested."""
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    # ---------------------------------------------------------------- #
    # Error Handlers
    # ---------------------------------------------------------------- #

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad request", "details": str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({"error": "Uploaded file is too large (max 500 MB)"}), 413

    @app.errorhandler(500)
    def internal_server_error(error):
        logger.error("Internal Server Error: %s", error, exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    logger.info("Starting Anomaly Detection API Server on %s:%d", Config.HOST, Config.PORT)
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG,
    )
