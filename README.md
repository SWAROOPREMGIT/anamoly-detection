# 🛡️ AnomalyGuard AI — Video-Based Anomaly & Violence Detection

> **Autonomous Deep Learning Surveillance and Optical Security Platform**  
> Powered by Convolutional Long Short-Term Memory (**ConvLSTM2D**) neural networks for real-time spatio-temporal video classification and anomaly alert dispatch.

---

## 🌟 Overview & Key Capabilities

**AnomalyGuard AI** is a production-grade, cyber-defense surveillance application designed for real-time optical anomaly detection, physical violence recognition, and perimeter intrusion alerting.

### 🎯 4 Core Classification Categories
1. **Normal Activity** — Standard civilian/pedestrian movement, routine behaviors.
2. **Fight / Physical Violence** — High-speed aggressive contact, hand-to-hand combat, rapid bodily clashes.
3. **Fall Hazard** — Sudden downward velocity collapse, medical slips, immobility.
4. **Intrusion / Breach** — Unauthorized zone access, perimeter threshold crossing.

---

## 💎 Design & UI/UX Features

- **Futuristic AI Command Center Aesthetic**: Midnight obsidian background (`#07070a`), neon cyan & electric blue telemetry accents, tactical red danger indicators.
- **3D Animated Neural Network Visualizer**: Interactive WebGL node graph built with Three.js & React Three Fiber featuring rotating synaptic layers and particle flows.
- **Glassmorphism & Depth**: Multi-layer frosted glass panels (`backdrop-blur-xl`), subtle radial glow effects, and dynamic hover depth.
- **Live Optical Stream HUD**: Simulated or live RTSP/webcam stream with real-time target bounding boxes, sweeping scanlines, and telemetry overlays.
- **Interactive Analytics**: Spatio-temporal category donut charts, timeline volume area charts, and confidence distribution histograms powered by Recharts.
- **Alert Dispatch Engine**: Instant anomaly alert generation with priority classification (High, Medium, Low) and acknowledgement lifecycle.

---

## 🏗️ System Architecture

```
anamoly detection/
├── backend/                       # Python & Flask Machine Learning Server
│   ├── app.py                    # Main API server & route registration
│   ├── config.py                 # System configuration, paths, thresholds
│   ├── requirements.txt          # Python dependencies
│   ├── models/
│   │   ├── convlstm_model.py     # ConvLSTM2D multi-layer neural architecture
│   │   └── model_utils.py        # Model loading, inference, & dynamic heuristics
│   ├── routes/
│   │   ├── detection.py          # Video upload & detection endpoints
│   │   ├── alerts.py             # Security incident alert management
│   │   ├── analytics.py          # Summary metrics & timeline analytics
│   │   ├── camera.py             # Sensor & camera fleet management
│   │   └── live.py               # SSE real-time streaming & live capture
│   ├── services/
│   │   ├── video_processor.py    # OpenCV frame extraction & normalization
│   │   ├── detection_service.py  # Inference orchestration & aggregation
│   │   ├── alert_service.py      # Automated alert generation & persistence
│   │   └── analytics_service.py  # Aggregate telemetry computation
│   ├── uploads/                  # Uploaded video archive
│   └── results/                  # Detection reports & alert storage
│
├── frontend/                      # React (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── api/                  # Axios HTTP client
│   │   ├── components/
│   │   │   ├── layout/           # Sidebar, Header, PageTransition, Layout
│   │   │   ├── three/            # 3D NeuralNetwork & ParticleField (Three.js)
│   │   │   ├── dashboard/        # StatCard, DetectionChart, ActivityFeed
│   │   │   ├── detection/        # VideoUploader, ResultCard
│   │   │   ├── alerts/           # AlertCard, AlertList
│   │   │   ├── monitoring/       # CameraFeed, LiveMonitor
│   │   │   └── common/           # GlassCard, AnimatedCounter, Badge, Spinner
│   │   ├── pages/                # Dashboard, Detection, Live, Alerts, Analytics, Cameras
│   │   ├── hooks/                # useApi, useAnimatedValue
│   │   └── utils/                # formatters, constants
│   ├── package.json
│   └── vite.config.ts
│
├── start_backend.bat              # One-click backend startup script
├── start_frontend.bat             # One-click frontend startup script
└── run_all.bat                    # One-click unified launcher (both servers)
```

---

## 🚀 Quick Start Guide

### Option 1: One-Click Unified Launcher (Windows)
Double-click `run_all.bat` in the project root folder. It will launch both the Flask backend and the React Vite frontend, and open your browser automatically!

### Option 2: Manual Terminal Execution

#### 1. Start the Flask Backend:
```bash
cd backend
py app.py
```
*Backend runs on `http://localhost:5000`*

#### 2. Start the React Frontend:
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/system/health` | Service health status |
| `GET` | `/api/system/status` | Model status & active monitoring info |
| `POST` | `/api/detection/upload` | Upload video file for ConvLSTM analysis |
| `GET` | `/api/detection/results` | Retrieve all historical detection reports |
| `DELETE` | `/api/detection/results/<id>` | Delete a specific detection report |
| `GET` | `/api/alerts/` | List security incident alerts |
| `PUT` | `/api/alerts/<id>/acknowledge` | Mark an alert as acknowledged |
| `DELETE` | `/api/alerts/<id>` | Remove an alert record |
| `GET` | `/api/alerts/stats` | Aggregated alert metrics |
| `GET` | `/api/analytics/summary` | Global dashboard statistics |
| `GET` | `/api/analytics/timeline` | Detection timeline volume trend |
| `GET` | `/api/analytics/model-info` | ConvLSTM model specifications |
| `GET` | `/api/analytics/performance` | Confidence distribution metrics |
| `GET` | `/api/cameras/` | List registered optical cameras |
| `POST` | `/api/cameras/` | Register a new camera or RTSP stream |
| `POST` | `/api/live/start` | Engage live optical surveillance |
| `POST` | `/api/live/stop` | Disengage live surveillance |
| `GET` | `/api/live/feed` | Server-Sent Events (SSE) live prediction stream |

