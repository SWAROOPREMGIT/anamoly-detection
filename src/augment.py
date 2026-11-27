import random
import cv2

def augment_clip(frames):
    if random.random() < 0.5:
        frames = [cv2.flip(f, 1) for f in frames]
    h, w = frames[0].shape[:2]
    scale = random.uniform(0.8, 1.0)
    ch, cw = int(h * scale), int(w * scale)
    y, x = random.randint(0, h - ch), random.randint(0, w - cw)
    frames = [f[y:y + ch, x:x + cw] for f in frames]
    beta = random.uniform(-30, 30)
    frames = [cv2.convertScaleAbs(f, alpha=1.0, beta=beta) for f in frames]
    return frames