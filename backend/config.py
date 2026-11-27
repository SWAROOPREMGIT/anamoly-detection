"""
Configuration settings for the Anomaly Detection backend.
"""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    """Application configuration."""

    # Flask settings
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "anomaly-detection-secret-key-2024")
    DEBUG: bool = os.environ.get("FLASK_DEBUG", "True").lower() == "true"

    # Server settings
    HOST: str = os.environ.get("HOST", "0.0.0.0")
    PORT: int = int(os.environ.get("PORT", "5000"))

    # File upload settings
    UPLOAD_FOLDER: str = os.path.join(BASE_DIR, "uploads")
    RESULTS_FOLDER: str = os.path.join(BASE_DIR, "results")
    LOGS_FOLDER: str = os.path.join(BASE_DIR, "logs")
    MAX_CONTENT_LENGTH: int = 500 * 1024 * 1024  # 500 MB
    ALLOWED_EXTENSIONS: set = {"mp4", "avi", "mov", "mkv", "wmv", "flv", "webm"}

    # Model settings
    MODEL_PATH: str = os.path.join(BASE_DIR, "models", "convlstm_model.h5")
    SEQUENCE_LENGTH: int = 16
    IMAGE_SIZE: int = 64
    NUM_CHANNELS: int = 3
    CLASS_LABELS: list = ["Normal Activity", "Fight", "Fall", "Intrusion"]
    NUM_CLASSES: int = 4

    # Detection settings
    CONFIDENCE_THRESHOLD: float = 0.5
    ANOMALY_CLASSES: list = ["Fight", "Fall", "Intrusion"]
    SEVERITY_MAP: dict = {
        "Fight": "high",
        "Intrusion": "high",
        "Fall": "medium",
        "Normal Activity": "low",
    }

    # CORS settings
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    @staticmethod
    def init_directories() -> None:
        """Create required directories if they don't exist."""
        dirs = [Config.UPLOAD_FOLDER, Config.RESULTS_FOLDER, Config.LOGS_FOLDER]
        for directory in dirs:
            os.makedirs(directory, exist_ok=True)
