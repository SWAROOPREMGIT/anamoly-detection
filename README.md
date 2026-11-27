# Video Based Anomaly and Violence Detection: Data Pipeline & Evaluation
Group 15, AJIET (VTU). Owner of this part: Akshay S A.

## Folder layout
```
violence-detection/
  data/RWF-2000/{train,val}/{Fight,NonFight}/*.avi   <- dataset (not pushed to Git)
  data/flow_cache/                                     <- created by flow.py
  results/                                             <- graphs + metrics.csv
  src/
    config.py          shared settings (frames, size, normalization) - change only with the team
    preprocess.py      shared preprocessing (also used by Abhishek's live pipeline)
    explore_data.py    dataset summary
    dataset.py         PyTorch Dataset / DataLoader (RGB and RGB+flow)
    flow.py            optical flow caching
    evaluate.py        metrics, confusion matrix, ROC, model comparison
    make_dummy_data.py tiny fake dataset for early testing
    test_pipeline.py   sanity check
```

## Setup (from the project folder, in the VS Code terminal)
```
python -m venv venv
venv\Scripts\activate            (Windows)   |   source venv/bin/activate   (Linux/Mac)
pip install -r requirements.txt
```

## How teammates use it
```python
# Abhijith (3D CNN)                      # Premswaroop (two-stream)
from dataset import get_loaders          from dataset import get_loaders
train, val = get_loaders(batch_size=8)   train, val = get_loaders(batch_size=8, flow=True)
# batches: (rgb, label)                  # batches: (rgb, flow, label)

# Abhishek (live)
from preprocess import preprocess_live   # 16 BGR frames -> array (1,3,16,112,112)

# Everyone (evaluation)
from evaluate import evaluate, predict_dataset, compare_models
y_true, y_prob = predict_dataset(model, val_loader)       # model outputs 2 logits
evaluate("3D CNN", y_true, y_prob, latency_ms=25)
```
Shapes: RGB `(3, 16, 112, 112)`, flow `(2, 16, 112, 112)`, label 1 = Fight, 0 = NonFight.
