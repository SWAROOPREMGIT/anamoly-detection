from pathlib import Path
from preprocess import read_video, preprocess_clip

p = next(Path(r"C:\datasets\RWF-2000\train\Fight").glob("*"))
print(preprocess_clip(read_video(str(p))).shape)