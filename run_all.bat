@echo off
title AnomalyGuard AI - Unified Launcher
echo ======================================================================
echo    ANOMALYGUARD AI - VIDEO-BASED ANOMALY AND VIOLENCE DETECTION
echo    Deep Learning Surveillance and Optical Security Platform
echo ======================================================================
echo.
echo [1/2] Launching Flask Machine Learning API Server (Port 5000)...
start "AnomalyGuard Backend" cmd /c "cd /d "%~dp0backend" && py app.py"

echo [2/2] Launching React Vite Command Center (Port 5173)...
start "AnomalyGuard Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ======================================================================
echo  Servers initialized!
echo  - Frontend Dashboard: http://localhost:5173
echo  - Backend API:        http://localhost:5000
echo ======================================================================
echo.
timeout /t 5 >nul
start http://localhost:5173

