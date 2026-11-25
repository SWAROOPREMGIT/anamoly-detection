"""
Utility / helper functions used across the application.
"""

import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from werkzeug.utils import secure_filename


def allowed_file(filename: str, allowed_extensions: set) -> bool:
    """Check whether *filename* has one of the allowed extensions."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions


def generate_unique_filename(original_filename: str) -> str:
    """
    Produce a unique, filesystem-safe filename preserving the original extension.

    Example: ``fight_clip.mp4`` → ``a3b1c2d4_fight_clip.mp4``
    """
    safe = secure_filename(original_filename)
    name, ext = os.path.splitext(safe)
    short_id = uuid.uuid4().hex[:8]
    return f"{short_id}_{name}{ext}"


def utc_now_iso() -> str:
    """Return the current UTC time as an ISO-8601 string."""
    return datetime.now(timezone.utc).isoformat()


def safe_int(value: Optional[str], default: int = 0) -> int:
    """Parse *value* as int, returning *default* on failure."""
    try:
        return int(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return default


def format_bytes(size: int) -> str:
    """Human-readable file size."""
    for unit in ("B", "KB", "MB", "GB"):
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024  # type: ignore[assignment]
    return f"{size:.1f} TB"
