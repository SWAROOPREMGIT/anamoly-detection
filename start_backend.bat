@echo off
title AnomalyGuard AI - Backend Server
echo ========================================================
echo   AnomalyGuard AI - Deep Learning Surveillance Server
echo ========================================================
echo.
cd /d "%~dp0backend"
echo Starting Flask API server on http://localhost:5000 ...
py app.py
pause

