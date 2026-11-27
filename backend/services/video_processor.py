"""
Video preprocessing service.

Handles frame extraction, resizing, normalization, and batching of video
files into sequences suitable for the ConvLSTM model.
"""

import logging
import os
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np

logger = logging.getLogger(__name__)


def get_video_info(video_path: str) -> Dict:
    """
    Extract metadata from a video file.

    Returns:
        Dict with keys: fps, frame_count, duration, width, height, codec.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video file: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = int(cap.get(cv2.CAP_PROP_FOURCC))
    codec = "".join([chr((fourcc >> 8 * i) & 0xFF) for i in range(4)])
    duration = frame_count / fps if fps > 0 else 0.0
    cap.release()

    return {
        "fps": round(fps, 2),
        "frame_count": frame_count,
        "duration": round(duration, 2),
        "width": width,
        "height": height,
        "codec": codec.strip(),
    }


def extract_frames(
    video_path: str,
    max_frames: int = 0,
    sample_rate: int = 1,
) -> List[np.ndarray]:
    """
    Extract frames from a video file.

    Args:
        video_path: Path to the video.
        max_frames: Maximum number of frames to extract (0 = all).
        sample_rate: Extract every Nth frame.

    Returns:
        List of BGR numpy arrays (raw OpenCV frames).
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video file: {video_path}")

    frames: List[np.ndarray] = []
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % sample_rate == 0:
            frames.append(frame)

        frame_idx += 1

        if 0 < max_frames <= len(frames):
            break

    cap.release()
    logger.info("Extracted %d frames from %s", len(frames), os.path.basename(video_path))
    return frames


def preprocess_frames(
    frames: List[np.ndarray],
    image_size: int = 64,
) -> List[np.ndarray]:
    """
    Resize frames to (image_size, image_size) and normalize to [0, 1].

    Args:
        frames: List of BGR numpy arrays.
        image_size: Target height and width.

    Returns:
        List of float32 numpy arrays, shape (image_size, image_size, 3), values 0-1.
    """
    processed: List[np.ndarray] = []
    for frame in frames:
        resized = cv2.resize(frame, (image_size, image_size))
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        normalized = rgb.astype(np.float32) / 255.0
        processed.append(normalized)
    return processed


def create_sequences(
    frames: List[np.ndarray],
    sequence_length: int = 16,
    overlap: int = 8,
) -> np.ndarray:
    """
    Split a list of preprocessed frames into overlapping sequences.

    Args:
        frames: Preprocessed frames (each shape (H, W, C), float32 0-1).
        sequence_length: Number of frames per sequence.
        overlap: Number of overlapping frames between consecutive sequences.

    Returns:
        numpy array of shape (num_sequences, sequence_length, H, W, C).
        Returns an empty array with shape (0, ...) when not enough frames.
    """
    if len(frames) < sequence_length:
        # Pad by repeating last frame
        while len(frames) < sequence_length:
            frames.append(frames[-1] if frames else np.zeros_like(frames[0]))

    step = max(1, sequence_length - overlap)
    sequences: List[np.ndarray] = []

    for start in range(0, len(frames) - sequence_length + 1, step):
        seq = np.array(frames[start : start + sequence_length])
        sequences.append(seq)

    if not sequences:
        # Edge case: return single sequence from the available frames
        sequences.append(np.array(frames[:sequence_length]))

    return np.array(sequences, dtype=np.float32)


def process_video(
    video_path: str,
    sequence_length: int = 16,
    image_size: int = 64,
    sample_rate: int = 1,
) -> Tuple[np.ndarray, Dict]:
    """
    Full pipeline: extract → preprocess → create sequences.

    Args:
        video_path: Path to the video file.
        sequence_length: Frames per sequence.
        image_size: Target spatial resolution.
        sample_rate: Frame sampling rate.

    Returns:
        Tuple of (sequences array, video_info dict).
    """
    video_info = get_video_info(video_path)

    raw_frames = extract_frames(video_path, sample_rate=sample_rate)
    if not raw_frames:
        raise ValueError("No frames could be extracted from the video.")

    processed = preprocess_frames(raw_frames, image_size=image_size)
    sequences = create_sequences(processed, sequence_length=sequence_length)

    video_info["frames_extracted"] = len(raw_frames)
    video_info["frames_processed"] = len(processed)
    video_info["sequences_created"] = sequences.shape[0]

    logger.info(
        "Video processed: %d sequences of %d frames each.",
        sequences.shape[0],
        sequence_length,
    )
    return sequences, video_info
