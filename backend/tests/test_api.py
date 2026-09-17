import io
import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from main import app
    from services.ais_service import ais_service, haversine_nm
except ImportError:
    from backend.main import app
    from backend.services.ais_service import ais_service, haversine_nm

client = TestClient(app)


@pytest.fixture(autouse=True)
def ensure_baseline_loaded():
    """Ensure baseline AIS telemetry is loaded before each test runs."""
    ais_service.reload()


# ==========================================
# 1. UNIT TESTS: MATHEMATICAL & KINEMATICS
# ==========================================

def test_haversine_distance_calculation():
    """Verify spherical distance calculation between known coordinates."""
    # Distance between Chennai (13.0827, 80.2707) and Singapore (1.3521, 103.8198) is ~1570 nm
    dist = haversine_nm(13.0827, 80.2707, 1.3521, 103.8198)
    assert 1500.0 < dist < 1650.0

    # Distance to the same point should be 0
    zero_dist = haversine_nm(13.05, 80.28, 13.05, 80.28)
    assert zero_dist == 0.0


# ==========================================
# 2. SYSTEM HEALTH & FLEET STATS TESTS
# ==========================================

def test_health():
    """Test /api/health endpoint returns status, record count, and tracked vessels."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["vessels_tracked"] == 30
    assert data["ais_records_loaded"] == 30
    assert data["active_threats"] == 15


def test_stats():
    """Test /api/stats executive dashboard metrics."""
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_ships_count"] == 30
    assert data["active_threats_count"] == 15
    assert data["high_risk_count"] == 9
    assert data["medium_risk_count"] == 6
    assert data["safe_count"] == 15
    assert data["fleet_risk_score"] > 0
    assert "timestamp" in data


# ==========================================
# 3. VESSEL FLEET REST API TESTS
# ==========================================

def test_list_vessels():
    """Test GET /api/vessels retrieves complete vessel fleet."""
    response = client.get("/api/vessels")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 30
    assert data["filtered"] == 30
    assert len(data["vessels"]) == 30

    first_vessel = data["vessels"][0]
    assert "id" in first_vessel
    assert "name" in first_vessel
    assert "mmsi" in first_vessel
    assert "latitude" in first_vessel
    assert "longitude" in first_vessel
    assert "speed" in first_vessel
    assert "risk" in first_vessel


def test_list_vessels_filtering():
    """Test filtering vessels by risk level (High, Medium, Safe)."""
    # High risk vessels
    res_high = client.get("/api/vessels?risk=High")
    assert res_high.status_code == 200
    data_high = res_high.json()
    assert data_high["filtered"] == 9
    for v in data_high["vessels"]:
        assert v["risk"] == "High"

    # Medium risk vessels
    res_med = client.get("/api/vessels?risk=Medium")
    assert res_med.status_code == 200
    data_med = res_med.json()
    assert data_med["filtered"] == 6
    for v in data_med["vessels"]:
        assert v["risk"] == "Medium"

    # Safe vessels
    res_safe = client.get("/api/vessels?risk=Safe")
    assert res_safe.status_code == 200
    data_safe = res_safe.json()
    assert data_safe["filtered"] == 15
    for v in data_safe["vessels"]:
        assert v["risk"] == "Safe"


def test_list_vessels_search():
    """Test searching vessels by name, destination, and MMSI."""
    # Search by name
    res_name = client.get("/api/vessels?search=VALIANT")
    assert res_name.status_code == 200
    assert len(res_name.json()["vessels"]) >= 1
    assert any("VALIANT" in v["name"] for v in res_name.json()["vessels"])

    # Search by MMSI
    res_mmsi = client.get("/api/vessels?search=222000002")
    assert res_mmsi.status_code == 200
    assert len(res_mmsi.json()["vessels"]) == 1
    assert res_mmsi.json()["vessels"][0]["mmsi"] == 222000002


def test_list_vessels_pagination():
    """Test pagination limit and offset parameters."""
    res = client.get("/api/vessels?limit=5&offset=0")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 30
    assert data["filtered"] == 5
    assert len(data["vessels"]) == 5

    # Next page
    res_offset = client.get("/api/vessels?limit=5&offset=5")
    assert res_offset.status_code == 200
    data_offset = res_offset.json()
    assert len(data_offset["vessels"]) == 5
    first_ids = {v["id"] for v in data["vessels"]}
    second_ids = {v["id"] for v in data_offset["vessels"]}
    assert first_ids.isdisjoint(second_ids)


def test_get_vessel_by_id():
    """Test retrieving a single vessel by ID and MMSI."""
    response = client.get("/api/vessels/vsl-001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "vsl-001"
    assert data["risk"] == "High"

    # Fetch by user vessel MMSI
    res_mmsi = client.get("/api/vessels/111000001")
    assert res_mmsi.status_code == 200
    assert res_mmsi.json()["mmsi"] == 111000001
    assert res_mmsi.json()["risk"] == "High"


def test_get_vessel_not_found():
    """Test 404 returned for unknown vessel ID."""
    response = client.get("/api/vessels/non-existent-vsl-99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_vessel_track():
    """Test retrieving chronological track telemetry and original/spoofed segments."""
    response = client.get("/api/vessels/111000001/track")
    assert response.status_code == 200
    data = response.json()
    assert "track" in data
    assert "original_track" in data
    assert "spoofed_track" in data
    assert data["mmsi"] == 111000001
    assert len(data["track"]) > 0


def test_get_vessel_track_not_found():
    """Test 404 for track of non-existent vessel."""
    response = client.get("/api/vessels/non-existent-vsl-99999/track")
    assert response.status_code == 404


# ==========================================
# 4. ANOMALY DETECTION & THREAT ALERT TESTS
# ==========================================

def test_list_anomalies():
    """Test GET /api/anomalies returns threat alerts for flagged vessels."""
    response = client.get("/api/anomalies")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 15
    assert data["criticalCount"] == 9
    assert len(data["anomalies"]) == 15

    first_alert = data["anomalies"][0]
    assert "id" in first_alert
    assert "vesselId" in first_alert
    assert "type" in first_alert
    assert "severity" in first_alert
    assert "region" in first_alert
    assert "confidence" in first_alert
    assert "coordinates" in first_alert


def test_anomalies_severity_filter():
    """Test filtering threat alerts by severity level."""
    response = client.get("/api/anomalies?severity=CRITICAL")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 9
    for a in data["anomalies"]:
        assert a["severity"] == "CRITICAL"

    # Filter with no matches
    res_low = client.get("/api/anomalies?severity=LOW")
    assert res_low.status_code == 200
    assert res_low.json()["total"] == 0


def test_anomalies_min_confidence_filter():
    """Test filtering anomalies by minimum spoofing confidence."""
    response = client.get("/api/anomalies?min_confidence=97.0")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 5
    for a in data["anomalies"]:
        assert a["confidence"] >= 97.0


def test_get_anomaly_by_id():
    """Test retrieving an anomaly by alert ID and by vessel ID."""
    list_res = client.get("/api/anomalies")
    first_id = list_res.json()["anomalies"][0]["id"]

    response = client.get(f"/api/anomalies/{first_id}")
    assert response.status_code == 200
    assert response.json()["id"] == first_id

    # Retrieve by vessel ID
    vsl_res = client.get("/api/anomalies/vsl-001")
    assert vsl_res.status_code == 200
    assert vsl_res.json()["vesselId"] == "vsl-001"


def test_get_anomaly_not_found():
    """Test 404 for non-existent anomaly ID."""
    response = client.get("/api/anomalies/non-existent-alt-99")
    assert response.status_code == 404


# ==========================================
# 5. SPOOFING CONFIDENCE SCORING TESTS
# ==========================================

def test_spoofing_confidence_fleet():
    """Test GET /api/spoofing/confidence fleet summary."""
    response = client.get("/api/spoofing/confidence")
    assert response.status_code == 200
    data = response.json()
    assert "averageConfidence" in data
    assert data["highThreatCount"] == 9
    assert data["mediumThreatCount"] == 6
    assert data["safeCount"] == 15
    assert "confidenceDistribution" in data
    assert len(data["topThreatenedVessels"]) > 0


def test_spoofing_confidence_vessel():
    """Test GET /api/spoofing/confidence/{vessel_id} 6-factor breakdown."""
    response = client.get("/api/spoofing/confidence/vsl-001")
    assert response.status_code == 200
    data = response.json()
    assert data["vesselId"] == "vsl-001"
    assert data["confidence"] >= 95.0
    assert data["riskLevel"] == "High"
    assert "factors" in data

    factors = data["factors"]
    assert factors["kinematicJumpScore"] >= 90.0
    assert "syntheticDriftScore" in factors
    assert "rfCarrierDropScore" in factors
    assert "transponderBlankingScore" in factors
    assert "altitudeAnomalyScore" in factors
    assert "identityCloneScore" in factors

    # User test vessel MMSI 111000001
    res_user = client.get("/api/spoofing/confidence/111000001")
    assert res_user.status_code == 200
    data_user = res_user.json()
    assert data_user["confidence"] >= 95.0
    assert data_user["factors"]["kinematicJumpScore"] >= 90.0


def test_spoofing_confidence_not_found():
    """Test 404 returned for unknown vessel."""
    response = client.get("/api/spoofing/confidence/unknown-vsl-999")
    assert response.status_code == 404


# ==========================================
# 6. INVESTIGATION TIMELINE TESTS
# ==========================================

def test_investigations_timeline_fleet():
    """Test GET /api/investigations/timeline returns chronologically ordered events."""
    response = client.get("/api/investigations/timeline")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    event = data[0]
    assert "id" in event
    assert "time" in event
    assert "title" in event
    assert "severity" in event
    assert "source" in event


def test_investigations_timeline_filter_anomalies():
    """Test filtering fleet timeline by anomaly events only."""
    response = client.get("/api/investigations/timeline?only_anomalies=true")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    for e in data:
        assert e["severity"] in ["CRITICAL", "HIGH", "MEDIUM", "INFO"]


def test_investigations_timeline_vessel():
    """Test single vessel forensic timeline for teleportation jump detection."""
    response = client.get("/api/investigations/timeline/111000001")
    assert response.status_code == 200
    data = response.json()
    assert data["vesselId"] == "vsl-111000001"
    assert "timeline" in data
    assert len(data["timeline"]) >= 3

    # Check that critical teleportation jump event exists
    titles = [t["title"] for t in data["timeline"]]
    assert any("Teleportation Jump" in t for t in titles)


def test_investigations_timeline_not_found():
    """Test 404 returned for unknown vessel timeline."""
    response = client.get("/api/investigations/timeline/unknown-vsl-999")
    assert response.status_code == 404


# ==========================================
# 7. HEATMAP & REGIONS TESTS
# ==========================================

def test_heatmap_regions():
    """Test GET /api/heatmap/regions returns chokepoint boundaries and risk metrics."""
    response = client.get("/api/heatmap/regions")
    assert response.status_code == 200
    data = response.json()
    assert data["totalRegions"] >= 6
    assert len(data["regions"]) >= 6

    # Verify Coromandel Coast region exists
    coromandel = next((r for r in data["regions"] if "Coromandel" in r["name"]), None)
    assert coromandel is not None
    assert coromandel["vesselCount"] == 6
    assert coromandel["threatCount"] == 3
    assert coromandel["riskScore"] > 50.0


def test_heatmap_points():
    """Test GET /api/heatmap/points returns weighted intensity coordinates."""
    response = client.get("/api/heatmap/points")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 30
    pt = data[0]
    assert "lat" in pt
    assert "lng" in pt
    assert 0.0 <= pt["intensity"] <= 1.0


# ==========================================
# 8. AIS CSV UPLOAD, RELOAD & ERROR HANDLING
# ==========================================

def test_ais_upload_invalid_file_type():
    """Test 400 Bad Request error when uploading non-CSV file."""
    fake_txt = io.BytesIO(b"timestamp,mmsi\n1,2\n")
    files = {"file": ("data.txt", fake_txt, "text/plain")}
    response = client.post("/api/ais/upload", files=files)
    assert response.status_code == 400
    assert "only csv files" in response.json()["detail"].lower()


def test_ais_upload_and_reload():
    """Test uploading a new custom AIS CSV and resetting back to baseline."""
    sample_csv = (
        "timestamp,mmsi,latitude,longitude,speed,course\n"
        "2026-09-17 08:00,999111222,12.5,43.2,14.5,320\n"
        "2026-09-17 08:01,999111222,12.501,43.201,14.5,320\n"
    )
    upload_file = io.BytesIO(sample_csv.encode("utf-8"))
    files = {"file": ("test_upload.csv", upload_file, "text/csv")}

    # Upload
    res = client.post("/api/ais/upload", files=files)
    assert res.status_code == 200
    assert res.json()["records_ingested"] == 1

    # Verify vessel in repository
    v_res = client.get("/api/vessels?search=999111222")
    assert v_res.status_code == 200
    assert len(v_res.json()["vessels"]) == 1

    # Reload baseline
    reload_res = client.post("/api/ais/reload")
    assert reload_res.status_code == 200
    assert reload_res.json()["records_ingested"] == 30

