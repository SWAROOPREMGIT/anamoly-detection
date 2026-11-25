"""
Utility script to generate synthetic surveillance test videos for demonstration.

Generates:
1. sample_normal_patrol.mp4 (Smooth linear movement)
2. sample_violence_incident.mp4 (Erratic rapid clash movement)
"""

import math
import os
import cv2
import numpy as np

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "samples")
os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTH, HEIGHT = 320, 240
FPS = 25
DURATION_SEC = 3
TOTAL_FRAMES = FPS * DURATION_SEC


def generate_normal_video():
    path = os.path.join(OUTPUT_DIR, "sample_normal_patrol.mp4")
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(path, fourcc, FPS, (WIDTH, HEIGHT))

    for i in range(TOTAL_FRAMES):
        frame = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
        # Background grid
        cv2.line(frame, (0, HEIGHT - 40), (WIDTH, HEIGHT - 40), (40, 40, 50), 2)

        # Smooth pedestrian movement across frame
        x = int(30 + (i / TOTAL_FRAMES) * (WIDTH - 60))
        y = HEIGHT - 70

        # Draw "person" (circle head, body line)
        cv2.circle(frame, (x, y - 20), 10, (100, 200, 100), -1)
        cv2.line(frame, (x, y - 10), (x, y + 15), (100, 200, 100), 3)
        cv2.line(frame, (x, y + 15), (x - 6, y + 30), (100, 200, 100), 2)
        cv2.line(frame, (x, y + 15), (x + 6, y + 30), (100, 200, 100), 2)

        # HUD Timestamp
        cv2.putText(
            frame,
            f"SECTOR-01 SECURE // F:{i:03d}",
            (10, 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.4,
            (180, 180, 180),
            1,
        )
        out.write(frame)

    out.release()
    print(f"Generated: {path}")


def generate_violence_video():
    path = os.path.join(OUTPUT_DIR, "sample_violence_incident.mp4")
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(path, fourcc, FPS, (WIDTH, HEIGHT))

    for i in range(TOTAL_FRAMES):
        frame = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
        cv2.line(frame, (0, HEIGHT - 40), (WIDTH, HEIGHT - 40), (50, 40, 40), 2)

        # Violent clash in center with erratic shake
        jitter_x = int(math.sin(i * 1.8) * 18)
        jitter_y = int(math.cos(i * 2.2) * 12)

        center_x = WIDTH // 2 + jitter_x
        center_y = HEIGHT - 70 + jitter_y

        # Figure 1
        cv2.circle(frame, (center_x - 12, center_y - 20), 10, (80, 80, 240), -1)
        cv2.line(frame, (center_x - 12, center_y - 10), (center_x - 5, center_y + 15), (80, 80, 240), 3)

        # Figure 2
        cv2.circle(frame, (center_x + 12, center_y - 20), 10, (240, 80, 80), -1)
        cv2.line(frame, (center_x + 12, center_y - 10), (center_x + 5, center_y + 15), (240, 80, 80), 3)

        # Clash indicator
        if i % 4 < 2:
            cv2.circle(frame, (center_x, center_y), 24, (0, 0, 255), 2)

        cv2.putText(
            frame,
            f"SECTOR-04 ANOMALY EVENT // F:{i:03d}",
            (10, 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.4,
            (0, 0, 255),
            1,
        )
        out.write(frame)

    out.release()
    print(f"Generated: {path}")


if __name__ == "__main__":
    generate_normal_video()
    generate_violence_video()
    print("Sample generation complete!")

