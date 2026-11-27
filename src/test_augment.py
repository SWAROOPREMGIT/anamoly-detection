from pathlib import Path
from preprocess import read_video
from augment import augment_clip

p = next(Path(r"C:\datasets\RWF-2000\train\Fight").glob("*"))
f = augment_clip(read_video(str(p)))
print(len(f), f[0].shape)