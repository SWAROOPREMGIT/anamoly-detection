import cv2
from pathlib import Path

root = Path(r"C:\datasets\RWF-2000")
for split in ["train", "val"]:
    for cls in ["Fight", "NonFight"]:
        files = [p for p in (root / split / cls).glob("*") if p.suffix.lower() in {".avi", ".mp4"}]
        bad, frames = 0, []
        for p in files:
            cap = cv2.VideoCapture(str(p))
            ok, _ = cap.read()
            if not ok:
                bad += 1
                print("Cannot open:", p)
            frames.append(int(cap.get(cv2.CAP_PROP_FRAME_COUNT)))
            cap.release()
        avg = sum(frames) / max(len(frames), 1)
        print(f"{split}/{cls}: {len(files)} clips, {bad} unreadable, avg frames {avg:.0f}")