# OceanShield AI - FastAPI Backend

Production-grade FastAPI backend for **OceanShield AI**, an electronic warfare and maritime threat intelligence system. The system monitors vessel traffic, ingests AIS CSV telemetry, analyzes multi-GNSS anomalies, computes multi-factor spoofing confidence scores, reconstructs forensic investigation audit trails, and provides spatial threat heatmap clusters.

---

## Architecture & Code Organization

The backend is strictly organized into clean architectural layers:

```
backend/
├── main.py                   # FastAPI app entrypoint, CORS, lifespan & router mounting
├── config.py                 # Global application configuration, paths & constants
├── api/                      # Central API router aggregator & endpoints
│   ├── __init__.py           # Re-exports api_router and submodules
│   ├── api.py                # Aggregates routers under /api
│   └── main.py               # Alternative app entrypoint (api.main:app)
├── routers/                  # REST API route handlers
│   ├── vessels.py            # /api/vessels endpoints
│   ├── anomalies.py          # /api/anomalies endpoints
│   ├── spoofing.py           # /api/spoofing endpoints
│   ├── investigations.py     # /api/investigations endpoints
│   ├── heatmap.py            # /api/heatmap endpoints
│   ├── ais.py                # /api/ais CSV upload & reload endpoints
│   └── stats.py              # /api/stats & /api/health endpoints
├── services/                 # Business logic & threat detection engines
│   ├── ais_service.py        # Ingests and parses AIS CSV, maintains thread-safe store
│   ├── anomaly_service.py    # Analyzes anomalies and synthesizes threat alerts
│   ├── spoofing_service.py   # Computes 6-factor spoofing confidence score & rationale
│   ├── timeline_service.py   # Reconstructs chronological forensic event logs
│   └── heatmap_service.py    # Computes chokepoint risk density & coordinate heat points
├── models/                   # Domain models / internal entities
│   ├── vessel.py             # VesselModel, RiskLevel enum
│   ├── anomaly.py            # ThreatAlertModel, AnomalySeverity enum
│   ├── timeline.py           # TimelineItemModel, TimelineSeverity enum
│   └── heatmap.py            # HeatmapRegionModel, HeatmapPointModel
├── schemas/                  # Pydantic request & response schemas (1:1 with frontend)
│   ├── common.py             # HealthResponse, FleetOverviewStats, PaginatedResponse
│   ├── vessel.py             # VesselResponse, VesselListResponse
│   ├── anomaly.py            # ThreatAlertResponse, AnomalyListResponse
│   ├── spoofing.py           # SpoofingConfidenceResponse, FactorScoreBreakdown
│   ├── timeline.py           # TimelineItemResponse, InvestigationTimelineResponse
│   └── heatmap.py            # HeatmapRegionResponse, HeatmapPointResponse, HeatmapResponse
├── data/
│   └── ais_telemetry.csv     # Standard AIS CSV dataset with simulated spoofing vectors
├── tests/
│   └── test_api.py           # Automated pytest test suite (15 unit & integration tests)
└── requirements.txt          # Python dependencies
```

---

## Quickstart

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Launch FastAPI with Uvicorn
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- Interactive Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive ReDoc Documentation: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 2. Run Automated Tests

```bash
python -m pytest -v backend/tests
```

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/api/vessels` | List all tracked vessels with filtering (`risk`, `search`, `has_anomaly`, `vessel_type`, `limit`, `offset`) |
| **GET** | `/api/vessels/{vessel_id}` | Fetch vessel detail by ID or MMSI |
| **GET** | `/api/anomalies` | List maritime anomalies and threat alerts (`severity`, `region`, `min_confidence`) |
| **GET** | `/api/anomalies/{anomaly_id}` | Fetch threat alert detail by ID |
| **GET** | `/api/spoofing/confidence` | Fleet-wide spoofing confidence summary, risk distributions, and top threatened vessels |
| **GET** | `/api/spoofing/confidence/{vessel_id}` | Detailed 6-factor spoofing confidence breakdown for a single vessel |
| **GET** | `/api/investigations/timeline` | Aggregated forensic timeline events across the fleet |
| **GET** | `/api/investigations/timeline/{vessel_id}` | Forensic event sequence for a specific vessel |
| **GET** | `/api/heatmap/regions` | Strategic chokepoint regions (Bab-el-Mandeb, Hormuz, Malacca, Singapore, etc.) with risk scores and bounds |
| **GET** | `/api/heatmap/points` | Weighted coordinate points `[lat, lng, intensity]` for Leaflet heatmaps (`L.heatLayer`) |
| **POST** | `/api/ais/upload` | Ingest a custom AIS CSV file via multipart upload |
| **POST** | `/api/ais/reload` | Reload baseline AIS dataset |
| **GET** | `/api/ais/status` | Current AIS ingestion telemetry status |
| **GET** | `/api/stats` | Dashboard executive summary stats (total vessels, active threats, fleet risk score) |
| **GET** | `/api/health` | Health check endpoint |

---

## Spoofing Confidence Scoring Engine

The spoofing confidence algorithm computes a composite score ($0.0\%$ to $100.0\%$) across 6 critical electronic warfare vectors:
1. **Kinematic Jump Score**: Detects discontinuous positional jumps implying impossible physical speeds ($> 55\text{ knots}$).
2. **Synthetic Drift Score**: Identifies artificial circular or geometric patterns indicative of land-based RF spoofers.
3. **RF Carrier-to-Noise ($C/N_0$) Drop Score**: Flags wideband GNSS jamming and L1/L2 receiver degradation ($< 30\text{ dB-Hz}$).
4. **Deliberate Transponder Blanking**: Detects dark fleet gap transmissions followed by shifted injections.
5. **Altitude / VDOP Spikes**: Identifies pseudo-satellite elevation spikes ($> 50\text{m ASL}$) on surface vessels.
6. **MMSI Identity Replication**: Flags simultaneous duplicate broadcasts across disjoint locations.
