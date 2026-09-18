#!/usr/bin/env bash
set -euo pipefail

echo "==============================================================================="
echo "               OceanShield AI - Production Docker Deployment"
echo "==============================================================================="

if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed. Please install Docker before deploying."
    exit 1
fi

echo "[1/3] Building production containers..."
docker compose build

echo "[2/3] Starting OceanShield services (FastAPI Backend + Next.js Cockpit)..."
docker compose up -d

echo "[3/3] Deployment complete!"
echo "-------------------------------------------------------------------------------"
echo " * Operations Cockpit UI:  http://localhost:3000"
echo " * Threat Intelligence API: http://localhost:8000/docs"
echo "-------------------------------------------------------------------------------"
echo ""
echo "To view live container logs:"
echo "  docker compose logs -f"
echo ""
echo "To stop services:"
echo "  docker compose down"
