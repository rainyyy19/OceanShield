@echo off
echo ===================================================
echo   OceanShield AI - Full-Stack Launcher (Windows)
echo ===================================================
echo Starting FastAPI Backend on Port 8000...
start "OceanShield Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Next.js Frontend on Port 3000...
start "OceanShield Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo OceanShield AI is launching:
echo   - Backend API Docs: http://127.0.0.1:8000/docs
echo   - Operations Cockpit: http://localhost:3000
echo ===================================================
