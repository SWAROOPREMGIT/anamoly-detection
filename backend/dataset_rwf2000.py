"""
RWF-2000 Dataset Loader and Video Preprocessing Pipeline.

RWF-2000 Directory Structure Expected:
    RWF-2000/
    ├── train/
    │   ├── Fight/      (~800 videos)
    │   └── NonFight/   (~800 videos)
    └── val/
        ├── Fight/      (~200 videos)
        └── NonFight/   (~200 videos)
"""

import os
import random
from typing import List, Tuple, Generator, Optional
import cv2
import numpy as np


class RWF2000Dataset:
    """
    Video sequence dataset generator for RWF-2000 violence detection.
    """

    def __init__(
        self,
        root_dir: str,
        split: str = "train",
        sequence_length: int = 16,
        image_size: int = 64,
        batch_size: int = 8,
        num_classes: int = 4,
        augment: bool = True,
    ):
        """
        Args:
            root_dir: Path to the RWF-2000 dataset folder.
            split: 'train' or 'val'.
            sequence_length: Number of frames extracted per video clip.
            image_size: Target frame resolution (image_size x image_size).
            batch_size: Mini-batch size for training.
            num_classes: 4 classes (Normal=0, Fight=1, Fall=2, Intrusion=3) or 2 classes (NonFight=0, Fight=1).
            augment: Whether to apply spatial/temporal data augmentation.
        """
        self.root_dir = root_dir
        self.split = split
        self.sequence_length = sequence_length
        self.image_size = image_size
        self.batch_size = batch_size
        self.num_classes = num_classes
        self.augment = augment and (split == "train")

        self.split_dir = os.path.join(root_dir, split)
        self.samples: List[Tuple[str, int]] = []
        self._load_samples()

    def _load_samples(self):
        """Scans the directory for Fight and NonFight videos."""
        if not os.path.isdir(self.split_dir):
            return

        fight_dir = os.path.join(self.split_dir, "Fight")
        nonfight_dir = os.path.join(self.split_dir, "NonFight")

        # In 4-class system: Normal Activity = 0, Fight = 1
        # In 2-class system: NonFight = 0, Fight = 1
        label_nonfight = 0
        label_fight = 1

        if os.path.isdir(fight_dir):
            for fname in os.listdir(fight_dir):
                if fname.lower().endswith((".mp4", ".avi", ".mkv", ".mov")):
                    self.samples.append((os.path.join(fight_dir, fname), label_fight))

        if os.path.isdir(nonfight_dir):
            for fname in os.listdir(nonfight_dir):
                if fname.lower().endswith((".mp4", ".avi", ".mkv", ".mov")):
                    self.samples.append((os.path.join(nonfight_dir, fname), label_nonfight))

        random.seed(42)
        random.shuffle(self.samples)

    def __len__(self) -> int:
        return len(self.samples)

    def extract_uniform_frames(self, video_path: str) -> Optional[np.ndarray]:
        """
        Extracts exactly `self.sequence_length` uniformly spaced frames from a video.
        Returns:
            np.ndarray of shape (sequence_length, image_size, image_size, 3) normalized to [0, 1].
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return None

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            cap.release()
            return None

        # Calculate sample indices uniformly across the video
        if total_frames >= self.sequence_length:
            step = total_frames / float(self.sequence_length)
            indices = [int(i * step) for i in range(self.sequence_length)]
        else:
            indices = list(range(total_frames))
            # Pad by repeating the last frame
            while len(indices) < self.sequence_length:
                indices.append(indices[-1])

        frames = []
        curr_idx = 0
        target_idx_pos = 0

        flip = self.augment and (random.random() > 0.5)
        bright_shift = random.uniform(0.85, 1.15) if self.augment else 1.0

        while target_idx_pos < len(indices):
            ret, frame = cap.read()
            if not ret:
                break

            if curr_idx == indices[target_idx_pos]:
                # Resize
                resized = cv2.resize(frame, (self.image_size, self.image_size))
                # BGR to RGB
                rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)

                # Augmentation
                if flip:
                    rgb = cv2.flip(rgb, 1)
                if self.augment and bright_shift != 1.0:
                    rgb = np.clip(rgb.astype(np.float32) * bright_shift, 0, 255).astype(np.uint8)

                # Normalize 0-1
                norm = rgb.astype(np.float32) / 255.0
                frames.append(norm)
                target_idx_pos += 1
                while target_idx_pos < len(indices) and indices[target_idx_pos] == curr_idx:
                    frames.append(norm)
                    target_idx_pos += 1

            curr_idx += 1

        cap.release()

        # Fallback padding if video ended early
        if not frames:
            return None
        while len(frames) < self.sequence_length:
            frames.append(frames[-1])

        return np.array(frames[: self.sequence_length], dtype=np.float32)

    def flow(self) -> Generator[Tuple[np.ndarray, np.ndarray], None, None]:
        """
        Yields batches of (X, y) infinitely for model training / validation.
        """
        num_samples = len(self.samples)
        if num_samples == 0:
            raise ValueError(f"No video samples found in {self.split_dir}")

        indices = list(range(num_samples))

        while True:
            if self.augment:
                random.shuffle(indices)

            batch_x, batch_y = [], []
            for idx in indices:
                video_path, label = self.samples[idx]
                sequence = self.extract_uniform_frames(video_path)
                if sequence is None:
                    continue

                batch_x.append(sequence)

                # One-hot encoding
                one_hot = np.zeros(self.num_classes, dtype=np.float32)
                one_hot[label] = 1.0
                batch_y.append(one_hot)

                if len(batch_x) == self.batch_size:
                    yield np.array(batch_x, dtype=np.float32), np.array(batch_y, dtype=np.float32)
                    batch_x, batch_y = [], []

            if batch_x:
                yield np.array(batch_x, dtype=np.float32), np.array(batch_y, dtype=np.float32)

