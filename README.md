# 🛡️ OceanShield AI


> **AI Maritime GPS/AIS Spoofing Investigation Platform**  
> Real-time detection, kinematic trajectory evaluation, electronic warfare anomaly analysis, and forensic replay across critical maritime chokepoints.

---

## 🌟 Overview

**OceanShield AI** is an advanced maritime cybersecurity and C2 intelligence platform engineered to detect, classify, and visualize GNSS/AIS electronic warfare attacks, kinematic coordinate discontinuities (teleportation jumps), circular multi-path spoofing drift, dark fleet transponder blanking, and multi-GNSS ephemeris parity drops.

Designed with a high-contrast **arctic cyber / tech-savvy lighter theme**, pearlescent glassmorphism, glowing telemetry indicators, and interactive tactical mapping.

---

## 🚀 Key Features

* **Interactive Leaflet Fleet Map**:
  * High-resolution zero-API-key **CartoDB Positron (Light Ocean)**, OpenStreetMap, Dark Ocean, and Esri Satellite hybrid tiles.
  * Real-time monitoring of commercial cargo vessels across the Red Sea, Gulf of Aden, Arabian Sea, Strait of Hormuz, Bay of Bengal, and Singapore Strait.
  * Dynamic heading-rotated vessel chevrons and risk-coded markers:
    * 🟢 **Safe (`#10b981`)**: Nominal verified kinematics.
    * 🟡 **Medium Risk (`#f59e0b`)**: Minor heading jitter / transponder clock drift.
    * 🔴 **High Risk (`#ef4444`)**: Active spoofing targets with animated **dual-concentric pulsing rings**.

* **Animated Trajectory Replay Engine**:
  * 🔵 **Blue Path**: Original AIS (verified nominal broadcast trajectory).
  * 🔴 **Red Path**: Spoofed Trajectory (synthetic injection / discontinuous kinematic jumps).
  * **Interactive Timeline Scrubber**: Drag slider to inspect vessel positions at any chronological time-step.
  * **Play / Pause Controls**: Automated step-by-step playback with 1x, 2x, and 4x speed multipliers.
  * **Live Kinematics HUD**: Displays real-time speed, course, timestamp, and status indicator.
  * **Auto-Fit Viewport**: Automatically calculates bounding box and fits camera to the vessel's track.

* **Backend AIS CSV Telemetry & APIs**:
  * Connects to `data/ais_telemetry.csv` containing chronological telemetry points.
  * `GET /api/vessels`: Retrieves live fleet positions, speed, course, and risk classifications.
  * `GET /api/vessels/{mmsi}/track`: Retrieves ordered chronological track coordinates decomposed into nominal vs spoofed segments.
  * Zero hard-coded coordinates in the frontend.

* **Forensic Investigation Slide-Over Drawer**:
  * Tactical optical reconnaissance satellite feed HUD with wireframe reticle.
  * Circular SVG AI confidence gauge ($98\%$ probability on active spoofing attacks).
  * Comprehensive vessel telemetry (MMSI, IMO, Call Sign, Flag, Lat/Long, Draught).
  * AI summary of kinematic physics violations and chronological incident event timeline.

* **8 Dedicated C2 Command Modules**:
  1. **Fleet Monitor (`fleet`)**: Primary operations cockpit with Hero banner, stat cards, map, alerts, and charts.
  2. **Threat Intelligence (`threats`)**: DEFCON 2 threat banner and regional attack clusters.
  3. **Spoofing Cases (`investigations`)**: Forensic case management table with search and filters.
  4. **Chokepoints & Geofence (`chokepoints`)**: Strategic dossiers for Bab-el-Mandeb, Hormuz, Malacca, Singapore, and Suez.
  5. **RF Spectrum & Jamming (`spectrum`)**: Real-time C/N0 spectrum gauges for GPS, Galileo, GLONASS, and BeiDou.
  6. **Sat-AIS Constellation (`satellite`)**: LEO satellite orbital constellation tracker (Spire, Iridium NEXT, exactEarth, ORBCOMM).
  7. **AI Anomaly Models (`rules`)**: Deep learning classifiers with interactive parameter tuning sliders.
  8. **Telemetry & Forensics (`logs`)**: Live raw `!AIVDM` NMEA sentence stream terminal.

## 📂 Repository Structure

```
OceanShield/
├── frontend/                 # Next.js 15 C2 Operations Dashboard & Tactical Maps
│   ├── app/                  # App Router & API routes
│   ├── components/           # React 19 UI & Tactical Leaflet Components
│   ├── data/                 # AIS telemetry & forensic JSON data
│   ├── lib/                  # Dataset parser & kinematic utilities
│   ├── types/                # Vessel & threat TypeScript interfaces
│   └── package.json          # Frontend dependencies
├── backend/                  # FastAPI Maritime Threat Intelligence Backend
│   ├── api/                  # API router aggregation
│   ├── routers/              # Endpoints: vessels, anomalies, spoofing, heatmap, ais
│   ├── services/             # Kinematics engine, anomaly detection, confidence scoring
│   ├── models/               # Domain models
│   ├── schemas/              # Pydantic v2 schemas
│   ├── data/                 # Ingested AIS time-series CSV
│   ├── tests/                # Automated pytest test suite (27 passing tests)
│   └── requirements.txt      # Python backend dependencies
├── data/                     # Root AIS CSV and forensic JSON telemetry
├── ARCHITECTURE.md           # End-to-end system architecture & kinematics equations
└── README.md                 # Project documentation
```

---

## 🚦 Getting Started (Full-Stack)

### 1. Prerequisites
* **Node.js** (v18.18+ or v20+) & **npm**
* **Python** (v3.10+) & **pip**

### 2. Installation
```bash
# Clone repository
git clone https://github.com/rainyyy19/OceanShield.git
cd OceanShield

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### 3. Running Both Backend & Frontend

#### Option A: Unified Concurrent Launcher (Recommended)
```bash
npm run dev
```
This concurrently spins up:
- 🚀 **FastAPI Backend**: `http://127.0.0.1:8000` (Interactive docs: `http://127.0.0.1:8000/docs`)
- 🌐 **Next.js Frontend**: `http://localhost:3000`

#### Option B: Windows One-Click Launcher
Double-click or run:
```cmd
start.bat
# or in PowerShell
.\start.ps1
```

#### Option C: Separate Terminals
```bash
# Terminal 1: Backend
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend
npm run dev:frontend
```

### 4. Running Backend Automated Tests
```bash
npm run test:backend
# or: cd backend && pytest
```

---

## 📡 Complete REST API Reference (FastAPI Backend & Next.js Gateway)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/vessels` | List all monitored vessels with filters (`risk`, `search`, `limit`, `offset`). |
| `GET` | `/api/vessels/{id}` | Retrieve individual vessel profile by ID or MMSI. |
| `GET` | `/api/vessels/{mmsi}/track` | Chronological track coordinates, original AIS path, and spoofed trajectory. |
| `GET` | `/api/stats` | Executive fleet dashboard metrics (total ships, active threats, risk index). |
| `GET` | `/api/anomalies` | Maritime threat alerts feed with severity & confidence filters. |
| `GET` | `/api/spoofing/confidence` | Fleet-wide spoofing confidence distributions & top threatened vessels. |
| `GET` | `/api/spoofing/confidence/{id}` | Granular 6-factor electronic warfare confidence score breakdown for a vessel. |
| `GET` | `/api/investigations/timeline` | Fleet-wide chronological forensic investigation event audit trail. |
| `GET` | `/api/investigations/timeline/{id}`| Vessel-specific chronological forensic incident sequence. |
| `GET` | `/api/heatmap/regions` | Strategic chokepoints (Bab-el-Mandeb, Hormuz, Malacca, etc.) & risk bounds. |
| `GET` | `/api/heatmap/points` | Weighted coordinate intensity points for tactical heatmaps. |
| `POST`| `/api/ais/reload` | Re-sync and reload baseline AIS CSV telemetry across the platform. |
| `GET` | `/api/ais/status` | Real-time AIS telemetry ingestion status & total records tracked. |
| `GET` | `/api/health` | Comprehensive full-stack backend & sensor health check. |

---

## 🚀 Production Deployment

OceanShield AI supports multi-target production deployments out of the box. Complete instructions are documented in [**`DEPLOYMENT.md`**](file:///c:/Users/rainy/Documents/antigravity/charming-brahmagupta/DEPLOYMENT.md).

### Quickstart: Docker & Docker Compose
```bash
# 1-click build & launch (runs FastAPI on :8000 and Next.js standalone on :3000)
docker compose up --build -d

# Windows 1-click launcher
deploy.bat

# Linux/macOS 1-click launcher
./deploy.sh
```

### Cloud PaaS (Zero-Config)
* **Render.com**: Connect the repository and click **Apply** using [`render.yaml`](file:///c:/Users/rainy/Documents/antigravity/charming-brahmagupta/render.yaml).
* **Railway.app**: Deploy with [`railway.json`](file:///c:/Users/rainy/Documents/antigravity/charming-brahmagupta/railway.json).
* **Vercel**: Deploy frontend with [`vercel.json`](file:///c:/Users/rainy/Documents/antigravity/charming-brahmagupta/vercel.json).

---

## 📄 License
MIT License. Commercial maritime cybersecurity and GNSS threat intelligence research.

