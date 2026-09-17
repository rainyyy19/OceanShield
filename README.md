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

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
* **Mapping**: Leaflet, OpenStreetMap, CartoDB Positron, Esri Satellite.
* **Backend**: Next.js App Router dynamic API routes + FastAPI Python backend.
* **Data**: AIS CSV telemetry dataset (`data/ais_telemetry.csv`), `data/vessels.json`.

---

## 🚦 Getting Started

### 1. Prerequisites
* **Node.js** (v18.18+ or v20+)
* **npm** or **pnpm** / **yarn**

### 2. Installation
```bash
git clone https://github.com/rainyyy19/OceanShield.git
cd OceanShield
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or specified port) in your browser.

### 4. Production Build
```bash
npm run build
npm run start
```

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/vessels` | List all monitored vessels with latest telemetry and risk classification. |
| `GET` | `/api/vessels/{mmsi}/track` | Retrieve chronological coordinates, original AIS path, and spoofed trajectory. |

---

## 📄 License
MIT License. Commercial maritime cybersecurity and GNSS threat intelligence research.
