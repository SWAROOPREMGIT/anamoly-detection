import cv2
import numpy as np

NUM_FRAMES = 16
SIZE = 112
MEAN = np.array([0.43216, 0.394666, 0.37645], dtype=np.float32)
STD = np.array([0.22803, 0.22145, 0.216989], dtype=np.float32)

def read_video(path):
    cap = cv2.VideoCapture(path)
    frames = []
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    cap.release()
    if len(frames) == 0:
        raise ValueError("No frames read from " + path)
    return frames

def sample_frames(frames, num=NUM_FRAMES):
    idx = np.linspace(0, len(frames) - 1, num).astype(int)
    return [frames[i] for i in idx]

def preprocess_clip(frames, num=NUM_FRAMES, size=SIZE):
    sampled = sample_frames(frames, num)
    out = []
    for f in sampled:
        f = cv2.resize(f, (size, size)).astype(np.float32) / 255.0
        out.append((f - MEAN) / STD)
    clip = np.stack(out)
    return clip.transpose(3, 0, 1, 2)