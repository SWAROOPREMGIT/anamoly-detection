@echo off
title AnomalyGuard AI - Frontend Dashboard
echo ========================================================
echo   AnomalyGuard AI - Cyber Surveillance Frontend
echo ========================================================
echo.
cd /d "%~dp0frontend"
echo Starting Vite Dev Server on http://localhost:5173 ...
npm run dev
pause

