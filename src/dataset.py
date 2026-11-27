from pathlib import Path
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from preprocess import read_video, preprocess_clip
from augment import augment_clip

ROOT = r"C:\datasets\RWF-2000"
CLASSES = ["NonFight", "Fight"]

class VideoDataset(Dataset):
    def __init__(self, root=ROOT, split="train"):
        self.train = (split == "train")
        self.samples = []
        for label, cls in enumerate(CLASSES):
            for p in sorted((Path(root) / split / cls).glob("*")):
                if p.suffix.lower() in {".avi", ".mp4"}:
                    self.samples.append((str(p), label))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, i):
        path, label = self.samples[i]
        frames = read_video(path)
        if self.train:
            frames = augment_clip(frames)
        clip = preprocess_clip(frames)
        return torch.from_numpy(clip).float(), label

class FlowDataset(Dataset):
    def __init__(self, root=ROOT, split="train"):
        self.samples = []
        for label, cls in enumerate(CLASSES):
            for p in sorted((Path(root) / "flow_cache" / split / cls).glob("*.npy")):
                self.samples.append((str(p), label))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, i):
        path, label = self.samples[i]
        flow = np.load(path).astype(np.float32)
        return torch.from_numpy(flow), label

def get_loaders(root=ROOT, batch_size=8, num_workers=2):
    train = DataLoader(VideoDataset(root, "train"), batch_size=batch_size,
                       shuffle=True, num_workers=num_workers, pin_memory=True)
    val = DataLoader(VideoDataset(root, "val"), batch_size=batch_size,
                     shuffle=False, num_workers=num_workers, pin_memory=True)
    return train, val

if __name__ == "__main__":
    train, val = get_loaders()
    x, y = next(iter(train))
    print(x.shape, y)