-- Seed Data for OceanShield AI Database (PostgreSQL / SQLite compatible)

-- 1. Insert Sample Ships
INSERT INTO ships (
    id, mmsi, imo, name, callsign, flag, vessel_type, destination, 
    nav_status, latitude, longitude, speed, heading, risk_score, confidence_score, anomaly_type, is_active, ai_summary
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    211334000, 9412345, 'SENTINEL VOYAGER', 'DFGH2', 'Marshall Islands', 'Crude Oil Tanker', 'SINGAPORE',
    'Underway using engine', 26.5671, 56.2412, 14.8, 115.0, 88.5, 94.2, 'GNSS Spoofing (Circular Drift)', 1,
    'Vessel exhibiting artificial circular position drift characteristic of land-based GNSS spoofing emitters in the Strait of Hormuz.'
),
(
    '00000000-0000-0000-0000-000000000002',
    413456789, 9823412, 'PACIFIC GLORY', 'VRKL9', 'Panama', 'Container Ship', 'ROTTERDAM',
    'Underway using engine', 1.2833, 103.8500, 18.2, 280.0, 12.0, 98.0, NULL, 1,
    'Nominal AIS telemetry with verified terrestrial and satellite receivers in Singapore Strait.'
),
(
    '00000000-0000-0000-0000-000000000003',
    636019821, 9123847, 'NEVA STAR', 'A8KL3', 'Liberia', 'Chemical Tanker', 'NOVOROSSIYSK',
    'Engaged in STS Transfer', 44.5210, 37.8921, 0.5, 45.0, 92.0, 91.5, 'Transponder Blanking (Dark Fleet)', 1,
    'Unannounced 72-hour AIS silence followed by impossible coordinate leap in Black Sea.'
);

-- 2. Insert Sample Incidents
INSERT INTO incidents (
    id, incident_number, ship_id, mmsi, imo, title, incident_type, severity, status,
    latitude, longitude, speed, heading, destination, risk_score, confidence_score, description
) VALUES 
(
    '10000000-0000-0000-0000-000000000001',
    'INC-2026-EW-0041', '00000000-0000-0000-0000-000000000001', 211334000, 9412345,
    'Electronic Warfare GNSS Spoofing in Strait of Hormuz', 'GNSS_SPOOFING', 'CRITICAL', 'ACTIVE',
    26.5671, 56.2412, 14.8, 115.0, 'SINGAPORE', 88.5, 94.2,
    'Telemetry captured GPS altitude anomaly (+120m) and circular track displacement indicating high-power RF spoofing.'
),
(
    '10000000-0000-0000-0000-000000000002',
    'INC-2026-DF-0012', '00000000-0000-0000-0000-000000000003', 636019821, 9123847,
    'Dark Fleet Covert Ship-to-Ship Oil Transfer', 'DARK_FLEET_STS', 'HIGH', 'UNDER_INVESTIGATION',
    44.5210, 37.8921, 0.5, 45.0, 'NOVOROSSIYSK', 92.0, 91.5,
    'Transponder blanked for 3 days before reappearing adjacent to unsanctioned crude feeder vessel.'
);

-- 3. Insert Sample Alerts
INSERT INTO alerts (
    id, ship_id, incident_id, mmsi, imo, alert_type, severity, region,
    latitude, longitude, speed, heading, destination, risk_score, confidence_score, description, is_acknowledged
) VALUES 
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 211334000, 9412345,
    'CIRCULAR_DRIFT_SPOOFING', 'CRITICAL', 'Strait of Hormuz',
    26.5671, 56.2412, 14.8, 115.0, 'SINGAPORE', 88.5, 94.2,
    'Calculated turn-rate exceeds mechanical vessel capabilities. Kinematic drift speed: 4.2 kts tangential.', 0
),
(
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 636019821, 9123847,
    'TRANSPONDER_BLANKING', 'HIGH', 'Black Sea',
    44.5210, 37.8921, 0.5, 45.0, 'NOVOROSSIYSK', 92.0, 91.5,
    'AIS signal lost in territorial waters without distress beacon transmission.', 0
);

-- 4. Insert Sample Hotspots
INSERT INTO hotspots (
    id, name, region, risk_level, latitude, longitude, radius_nm,
    min_latitude, min_longitude, max_latitude, max_longitude,
    speed, heading, destination, mmsi, imo,
    risk_score, confidence_score, primary_threat, active_vessels_count, active_threats_count, description
) VALUES 
(
    '30000000-0000-0000-0000-000000000001',
    'Strait of Hormuz EW Zone', 'Persian Gulf / Arabian Sea', 'CRITICAL',
    26.5000, 56.3000, 35.0, 26.0000, 55.8000, 27.0000, 56.8000,
    13.5, 110.0, 'FUJAIRAH / SINGAPORE', 211334000, 9412345,
    94.0, 96.0, 'High-power terrestrial GNSS spoofing & AIS ghost tracks', 142, 18,
    'Heavy electronic warfare activity causing civilian navigators to report false airport positions.'
),
(
    '30000000-0000-0000-0000-000000000002',
    'Malacca Chokepoint & Singapore Strait', 'Southeast Asia', 'MEDIUM',
    1.2500, 103.8000, 20.0, 1.1000, 103.5000, 1.4000, 104.1000,
    15.2, 275.0, 'EAST ASIA CORRIDOR', 413456789, 9823412,
    35.0, 92.0, 'Traffic congestion & potential AIS transponder spoofing', 310, 4,
    'Dense commercial traffic corridor with occasional cloned MMSI beacons.'
);

-- 5. Insert Sample Investigation Reports
INSERT INTO investigation_reports (
    id, report_number, ship_id, incident_id, title,
    mmsi, imo, destination, latitude, longitude, speed, heading,
    risk_score, confidence_score, investigator, classification, status,
    executive_summary, recommendations
) VALUES 
(
    '40000000-0000-0000-0000-000000000001',
    'REP-2026-HORMUZ-089', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
    'Forensic Analysis of False Kinematic Loop Attack on SENTINEL VOYAGER',
    211334000, 9412345, 'SINGAPORE', 26.5671, 56.2412, 14.8, 115.0,
    88.5, 94.2, 'OceanShield AI Automated Sentinel', 'CONFIDENTIAL', 'FINALIZED',
    'At 14:22 UTC, SENTINEL VOYAGER entered the northern coverage zone of Bandar Abbas EW transmitter. Telemetry demonstrates synthetic circular velocity deviation. Visual radar cross-correlation reveals physical hull was 14.2 NM southwest of reported AIS locus.',
    'Issue advisory to merchant vessels in sector 4B. Switch primary bridge navigation to celestial/inertial dead reckoning and monitor multi-frequency Galileo E1/E5 signals.'
);
