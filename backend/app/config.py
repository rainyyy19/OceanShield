import os
from pathlib import Path

# Base Directories
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent

# Default Data Paths
DEFAULT_AIS_CSV_PATH = str(BACKEND_DIR / "data" / "ais_telemetry.csv")
FRONTEND_VESSELS_JSON_PATH = str(PROJECT_ROOT / "data" / "vessels.json")

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "*",
]

# Detection Thresholds
HIGH_RISK_THRESHOLD = 80.0
MEDIUM_RISK_THRESHOLD = 40.0
IMPOSSIBLE_SPEED_KNOTS = 55.0  # Speeds > 55 kts indicate teleportation jumps for merchant ships
ALTITUDE_SPOOF_METERS = 50.0   # Marine GPS antenna altitude above 50m ASL indicates ground spoofers
CARRIER_JAM_THRESHOLD_DB = 30.0  # C/N0 below 30 dB indicates RF degradation or jamming
