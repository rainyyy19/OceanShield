@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo                OceanShield AI - Production Docker Deployment
echo ===============================================================================

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not found in system PATH.
    echo Please install Docker Desktop for Windows: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [1/3] Building OceanShield production containers...
docker compose build
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed.
    pause
    exit /b 1
)

echo [2/3] Starting OceanShield services (FastAPI Backend + Next.js Cockpit)...
docker compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Docker services.
    pause
    exit /b 1
)

echo [3/3] Deployment complete!
echo.
echo -------------------------------------------------------------------------------
echo  * Operations Cockpit UI:  http://localhost:3000
echo  * Threat Intelligence API: http://localhost:8000/docs
echo -------------------------------------------------------------------------------
echo.
echo To view live container logs:
echo   docker compose logs -f
echo.
echo To stop services:
echo   docker compose down
echo.
pause
