-- ==============================================================================
-- OceanShield AI - SQLite Portable Database Schema
-- Dialect: SQLite 3 (Ideal for local testing, CI/CD, or standalone deployment)
-- Tables: ships, incidents, alerts, hotspots, investigation_reports
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------------------------
-- 1. SHIPS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ships (
    id TEXT PRIMARY KEY,                                        -- UUID string
    mmsi INTEGER NOT NULL UNIQUE,                               -- 9-digit MMSI
    imo INTEGER UNIQUE,                                         -- 7-digit IMO
    name TEXT NOT NULL,
    callsign TEXT,
    flag TEXT,
    vessel_type TEXT,
    destination TEXT,
    eta TEXT,
    nav_status TEXT DEFAULT 'Underway using engine',
    dimensions TEXT,
    dwt TEXT,
    photo_url TEXT,
    
    -- Kinematics
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    speed REAL NOT NULL DEFAULT 0.0,
    heading REAL NOT NULL DEFAULT 0.0,
    
    -- Threat & Confidence
    risk_score REAL NOT NULL DEFAULT 0.0,
    confidence_score REAL NOT NULL DEFAULT 0.0,
    anomaly_type TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    ai_summary TEXT,

    -- RF & GNSS
    carrier_c_n0_db REAL,
    gps_altitude_m REAL,

    -- Timestamps
    last_contact TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    CHECK (latitude BETWEEN -90.0 AND 90.0),
    CHECK (longitude BETWEEN -180.0 AND 180.0),
    CHECK (speed >= 0.0),
    CHECK (heading >= 0.0 AND heading < 360.0),
    CHECK (risk_score BETWEEN 0.0 AND 100.0),
    CHECK (confidence_score BETWEEN 0.0 AND 100.0)
);

-- ------------------------------------------------------------------------------
-- 2. INCIDENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    incident_number TEXT NOT NULL UNIQUE,
    ship_id TEXT REFERENCES ships(id) ON DELETE SET NULL,
    mmsi INTEGER,
    imo INTEGER,
    title TEXT NOT NULL,
    incident_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'MEDIUM',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    
    -- Coordinates & Kinematics
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    speed REAL DEFAULT 0.0,
    heading REAL DEFAULT 0.0,
    destination TEXT,
    
    -- Scores
    risk_score REAL NOT NULL DEFAULT 0.0,
    confidence_score REAL NOT NULL DEFAULT 0.0,
    
    description TEXT,
    occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
    resolved_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    CHECK (latitude BETWEEN -90.0 AND 90.0),
    CHECK (longitude BETWEEN -180.0 AND 180.0),
    CHECK (speed >= 0.0),
    CHECK (heading >= 0.0 AND heading < 360.0),
    CHECK (risk_score BETWEEN 0.0 AND 100.0),
    CHECK (confidence_score BETWEEN 0.0 AND 100.0),
    CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    CHECK (status IN ('ACTIVE', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'))
);

-- ------------------------------------------------------------------------------
-- 3. ALERTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    ship_id TEXT NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
    incident_id TEXT REFERENCES incidents(id) ON DELETE SET NULL,
    mmsi INTEGER NOT NULL,
    imo INTEGER,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'HIGH',
    region TEXT,
    
    -- Coordinates & Kinematics
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    speed REAL NOT NULL DEFAULT 0.0,
    heading REAL NOT NULL DEFAULT 0.0,
    destination TEXT,
    
    -- Scores
    risk_score REAL NOT NULL DEFAULT 0.0,
    confidence_score REAL NOT NULL DEFAULT 0.0,
    
    description TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    is_acknowledged INTEGER NOT NULL DEFAULT 0,
    acknowledged_by TEXT,
    acknowledged_at TEXT,
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    CHECK (latitude BETWEEN -90.0 AND 90.0),
    CHECK (longitude BETWEEN -180.0 AND 180.0),
    CHECK (speed >= 0.0),
    CHECK (heading >= 0.0 AND heading < 360.0),
    CHECK (risk_score BETWEEN 0.0 AND 100.0),
    CHECK (confidence_score BETWEEN 0.0 AND 100.0),
    CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'))
);

-- ------------------------------------------------------------------------------
-- 4. HOTSPOTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hotspots (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    risk_level TEXT NOT NULL DEFAULT 'HIGH',
    
    -- Geolocation & Radius
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    radius_nm REAL NOT NULL DEFAULT 25.0,
    min_latitude REAL,
    min_longitude REAL,
    max_latitude REAL,
    max_longitude REAL,
    
    -- Corridor Characteristics & Telemetry Metrics
    speed REAL DEFAULT 0.0,
    heading REAL DEFAULT 0.0,
    destination TEXT,
    mmsi INTEGER,
    imo INTEGER,
    
    -- Threat Quantification
    risk_score REAL NOT NULL DEFAULT 0.0,
    confidence_score REAL NOT NULL DEFAULT 0.0,
    primary_threat TEXT NOT NULL,
    active_vessels_count INTEGER NOT NULL DEFAULT 0,
    active_threats_count INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    CHECK (latitude BETWEEN -90.0 AND 90.0),
    CHECK (longitude BETWEEN -180.0 AND 180.0),
    CHECK (speed >= 0.0),
    CHECK (heading >= 0.0 AND heading < 360.0),
    CHECK (risk_score BETWEEN 0.0 AND 100.0),
    CHECK (confidence_score BETWEEN 0.0 AND 100.0),
    CHECK (risk_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'))
);

-- ------------------------------------------------------------------------------
-- 5. INVESTIGATION_REPORTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investigation_reports (
    id TEXT PRIMARY KEY,
    report_number TEXT NOT NULL UNIQUE,
    ship_id TEXT REFERENCES ships(id) ON DELETE SET NULL,
    incident_id TEXT REFERENCES incidents(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    
    -- Telemetry Snapshot
    mmsi INTEGER NOT NULL,
    imo INTEGER,
    destination TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    speed REAL NOT NULL DEFAULT 0.0,
    heading REAL NOT NULL DEFAULT 0.0,
    
    -- Scores
    risk_score REAL NOT NULL DEFAULT 0.0,
    confidence_score REAL NOT NULL DEFAULT 0.0,
    
    -- Report Body
    investigator TEXT NOT NULL DEFAULT 'OceanShield AI Sentinel',
    classification TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
    status TEXT NOT NULL DEFAULT 'FINALIZED',
    executive_summary TEXT NOT NULL,
    findings TEXT DEFAULT '{}',
    recommendations TEXT,
    evidence_attachments TEXT DEFAULT '[]',
    
    generated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    CHECK (latitude BETWEEN -90.0 AND 90.0),
    CHECK (longitude BETWEEN -180.0 AND 180.0),
    CHECK (speed >= 0.0),
    CHECK (heading >= 0.0 AND heading < 360.0),
    CHECK (risk_score BETWEEN 0.0 AND 100.0),
    CHECK (confidence_score BETWEEN 0.0 AND 100.0),
    CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'FINALIZED', 'ARCHIVED'))
);

-- ------------------------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ships_mmsi ON ships(mmsi);
CREATE INDEX IF NOT EXISTS idx_ships_imo ON ships(imo);
CREATE INDEX IF NOT EXISTS idx_ships_risk ON ships(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_ships_coords ON ships(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_incidents_ship_id ON incidents(ship_id);
CREATE INDEX IF NOT EXISTS idx_incidents_mmsi ON incidents(mmsi);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_occurred_at ON incidents(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_ship_id ON alerts(ship_id);
CREATE INDEX IF NOT EXISTS idx_alerts_mmsi ON alerts(mmsi);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hotspots_risk_level ON hotspots(risk_level);
CREATE INDEX IF NOT EXISTS idx_hotspots_coords ON hotspots(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_reports_ship_id ON investigation_reports(ship_id);
CREATE INDEX IF NOT EXISTS idx_reports_mmsi ON investigation_reports(mmsi);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON investigation_reports(generated_at DESC);
