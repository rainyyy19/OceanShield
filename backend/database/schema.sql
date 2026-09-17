-- ==============================================================================
-- OceanShield AI - Maritime Threat Intelligence Platform Database Schema
-- Dialect: PostgreSQL 14+ (with optional PostGIS spatial extension)
-- Tables: ships, incidents, alerts, hotspots, investigation_reports
-- ==============================================================================

-- Enable UUID extension for cryptographic primary keys
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. SHIPS TABLE
-- Master registry of monitored vessels and their latest telemetry state
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mmsi BIGINT NOT NULL UNIQUE,                                -- 9-digit Maritime Mobile Service Identity
    imo INTEGER UNIQUE,                                         -- 7-digit International Maritime Organization number
    name VARCHAR(255) NOT NULL,
    callsign VARCHAR(64),
    flag VARCHAR(100),                                         -- Country of registry / flag state
    vessel_type VARCHAR(100),                                   -- Cargo, Tanker, Fishing, Military, Passenger, Tug, etc.
    destination VARCHAR(255),                                  -- Reported AIS destination port/waypoint
    eta TIMESTAMPTZ,                                            -- Estimated Time of Arrival
    nav_status VARCHAR(100) DEFAULT 'Underway using engine',   -- AIS Navigational Status
    dimensions VARCHAR(64),                                     -- Length x Beam (e.g., "300m x 48m")
    dwt VARCHAR(64),                                            -- Deadweight tonnage
    photo_url TEXT,
    
    -- Real-time Telemetry & Kinematics
    latitude DOUBLE PRECISION NOT NULL,                         -- WGS84 Latitude (-90.0 to 90.0)
    longitude DOUBLE PRECISION NOT NULL,                        -- WGS84 Longitude (-180.0 to 180.0)
    speed DOUBLE PRECISION NOT NULL DEFAULT 0.0,                -- Speed Over Ground (SOG) in knots
    heading DOUBLE PRECISION NOT NULL DEFAULT 0.0,              -- Course/Heading in degrees (0.0 to 359.9)
    
    -- Threat Assessment & Confidence Scores
    risk_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,           -- Composite threat risk (0.0 to 100.0)
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,     -- Anomaly/spoofing confidence (0.0 to 100.0)
    anomaly_type VARCHAR(128),                                  -- e.g., 'GPS Spoofing', 'Teleportation Jump', 'Dark Fleet'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ai_summary TEXT,

    -- RF / Ephemeris Telemetry (optional EW telemetry)
    carrier_c_n0_db DOUBLE PRECISION,                           -- Carrier-to-noise ratio in dB
    gps_altitude_m DOUBLE PRECISION,                            -- Marine antenna altitude above sea level

    -- Timestamps
    last_contact TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Integrity Constraints
    CONSTRAINT chk_ships_lat CHECK (latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_ships_lng CHECK (longitude BETWEEN -180.0 AND 180.0),
    CONSTRAINT chk_ships_speed CHECK (speed >= 0.0),
    CONSTRAINT chk_ships_heading CHECK (heading >= 0.0 AND heading < 360.0),
    CONSTRAINT chk_ships_risk CHECK (risk_score BETWEEN 0.0 AND 100.0),
    CONSTRAINT chk_ships_confidence CHECK (confidence_score BETWEEN 0.0 AND 100.0)
);

-- ------------------------------------------------------------------------------
-- 2. INCIDENTS TABLE
-- Maritime security, electronic warfare, collision hazard, and sovereignty incidents
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number VARCHAR(64) NOT NULL UNIQUE,                -- e.g. "INC-2026-0042"
    ship_id UUID REFERENCES ships(id) ON DELETE SET NULL,       -- Associated vessel (nullable if unidentified)
    mmsi BIGINT,                                                -- MMSI snapshot at incident time
    imo INTEGER,                                                -- IMO snapshot at incident time
    title VARCHAR(255) NOT NULL,
    incident_type VARCHAR(128) NOT NULL,                        -- e.g., 'GNSS_SPOOFING', 'AIS_TRANSPONDER_BLANKING', 'COLLISION_RISK'
    severity VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',             -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',               -- 'ACTIVE', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'
    
    -- Telemetry & Coordinates at Incident Origin
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION DEFAULT 0.0,
    heading DOUBLE PRECISION DEFAULT 0.0,
    destination VARCHAR(255),
    
    -- Threat & Confidence Scores
    risk_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,           -- 0.0 to 100.0
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,     -- 0.0 to 100.0
    
    description TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Integrity Constraints
    CONSTRAINT chk_incidents_lat CHECK (latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_incidents_lng CHECK (longitude BETWEEN -180.0 AND 180.0),
    CONSTRAINT chk_incidents_speed CHECK (speed >= 0.0),
    CONSTRAINT chk_incidents_heading CHECK (heading >= 0.0 AND heading < 360.0),
    CONSTRAINT chk_incidents_risk CHECK (risk_score BETWEEN 0.0 AND 100.0),
    CONSTRAINT chk_incidents_confidence CHECK (confidence_score BETWEEN 0.0 AND 100.0),
    CONSTRAINT chk_incidents_severity CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    CONSTRAINT chk_incidents_status CHECK (status IN ('ACTIVE', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'))
);

-- ------------------------------------------------------------------------------
-- 3. ALERTS TABLE
-- Automated signals generated by the real-time AI anomaly detection pipeline
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id UUID NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL, -- Optional link to parent incident
    mmsi BIGINT NOT NULL,
    imo INTEGER,
    alert_type VARCHAR(128) NOT NULL,                           -- 'TELEPORTATION_JUMP', 'CIRCULAR_DRIFT', 'CARRIER_DROP', etc.
    severity VARCHAR(32) NOT NULL DEFAULT 'HIGH',               -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    region VARCHAR(128),                                        -- e.g. 'Strait of Hormuz', 'Black Sea'
    
    -- Telemetry Snapshot at Alert Trigger
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    heading DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    destination VARCHAR(255),
    
    -- Scoring
    risk_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,                         -- Raw detection telemetry (delta knots, C/N0, etc.)
    is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by VARCHAR(128),
    acknowledged_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Integrity Constraints
    CONSTRAINT chk_alerts_lat CHECK (latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_alerts_lng CHECK (longitude BETWEEN -180.0 AND 180.0),
    CONSTRAINT chk_alerts_speed CHECK (speed >= 0.0),
    CONSTRAINT chk_alerts_heading CHECK (heading >= 0.0 AND heading < 360.0),
    CONSTRAINT chk_alerts_risk CHECK (risk_score BETWEEN 0.0 AND 100.0),
    CONSTRAINT chk_alerts_confidence CHECK (confidence_score BETWEEN 0.0 AND 100.0),
    CONSTRAINT chk_alerts_severity CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'))
);

-- ------------------------------------------------------------------------------
-- 4. HOTSPOTS TABLE
-- Strategic high-risk maritime zones, EW theaters, chokepoints, and cluster centers
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,                                 -- e.g. "Strait of Hormuz EW Corridor"
    region VARCHAR(128) NOT NULL,                               -- e.g. "Persian Gulf / Arabian Sea"
    risk_level VARCHAR(32) NOT NULL DEFAULT 'HIGH',             -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    
    -- Center Geolocation & Corridors
    latitude DOUBLE PRECISION NOT NULL,                         -- Center latitude
    longitude DOUBLE PRECISION NOT NULL,                        -- Center longitude
    radius_nm DOUBLE PRECISION NOT NULL DEFAULT 25.0,           -- Radius of impact in Nautical Miles
    min_latitude DOUBLE PRECISION,                              -- Bounding box south
    min_longitude DOUBLE PRECISION,                             -- Bounding box west
    max_latitude DOUBLE PRECISION,                              -- Bounding box north
    max_longitude DOUBLE PRECISION,                             -- Bounding box east
    
    -- Corridor Characteristics & Telemetry Metrics
    speed DOUBLE PRECISION DEFAULT 0.0,                         -- Average flow speed of vessels in hotspot (knots)
    heading DOUBLE PRECISION DEFAULT 0.0,                       -- Predominant shipping corridor heading
    destination VARCHAR(255),                                  -- Primary target transit destination/port
    mmsi BIGINT,                                                -- Reference beacon or flagship MMSI (if applicable)
    imo INTEGER,                                                -- Reference IMO (if applicable)
    
    -- Threat Quantification
    risk_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,           -- 0.0 to 100.0
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,     -- 0.0 to 100.0
    primary_threat VARCHAR(128) NOT NULL,                       -- e.g., 'GPS Spoofing & AIS Cloning'
    active_vessels_count INTEGER NOT NULL DEFAULT 0,
    active_threats_count INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Integrity Constraints
    CONSTRAINT chk_hotspots_lat CHECK (latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_hotspots_lng CHECK (longitude BETWEEN -180.0 AND 180.0),
    CONSTRAINT chk_hotspots_speed CHECK (speed >= 0.0),
    CONSTRAINT chk_hotspots_heading CHECK (heading >= 0.0 AND heading < 360.0),
    CONSTRAINT chk_hotspots_risk CHECK (risk_score BETWEEN 0.0 AND 100.0),
    CONSTRAINT chk_hotspots_confidence CHECK (confidence_score BETWEEN 0.0 AND 100.0),
    CONSTRAINT chk_hotspots_risk_level CHECK (risk_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'))
);

-- ------------------------------------------------------------------------------
-- 5. INVESTIGATION_REPORTS TABLE
-- In-depth forensic investigation dossiers and maritime intelligence outputs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investigation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number VARCHAR(64) NOT NULL UNIQUE,                  -- e.g., "REP-2026-EW-009"
    ship_id UUID REFERENCES ships(id) ON DELETE SET NULL,       -- Target vessel
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL, -- Linked incident
    title VARCHAR(255) NOT NULL,
    
    -- Vessel & Mission Snapshot
    mmsi BIGINT NOT NULL,
    imo INTEGER,
    destination VARCHAR(255),
    latitude DOUBLE PRECISION NOT NULL,                         -- Coordinates where anomaly occurred/investigated
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    heading DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    
    -- Evaluated Threat Scores
    risk_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    
    -- Report Body & Intelligence
    investigator VARCHAR(128) NOT NULL DEFAULT 'OceanShield AI Sentinel',
    classification VARCHAR(64) NOT NULL DEFAULT 'CONFIDENTIAL', -- 'UNCLASSIFIED', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'
    status VARCHAR(32) NOT NULL DEFAULT 'FINALIZED',            -- 'DRAFT', 'UNDER_REVIEW', 'FINALIZED', 'ARCHIVED'
    executive_summary TEXT NOT NULL,
    findings JSONB DEFAULT '{}'::jsonb,                         -- Chronological spoofing logs, jump deltas, radar cross-verification
    recommendations TEXT,
    evidence_attachments JSONB DEFAULT '[]'::jsonb,
    
    generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Integrity Constraints
    CONSTRAINT chk_reports_lat CHECK (latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_reports_lng CHECK (longitude BETWEEN -180.0 AND 180.0),
    CONSTRAINT chk_reports_speed CHECK (speed >= 0.0),
    CONSTRAINT chk_reports_heading CHECK (heading >= 0.0 AND heading < 360.0),
    CONSTRAINT chk_reports_risk CHECK (risk_score BETWEEN 0.0 AND 100.0),
    CONSTRAINT chk_reports_confidence CHECK (confidence_score BETWEEN 0.0 AND 100.0),
    CONSTRAINT chk_reports_status CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'FINALIZED', 'ARCHIVED'))
);

-- ==============================================================================
-- PERFORMANCE INDEXES
-- Optimized for high-throughput AIS feeds, GIS bounding-box queries, and searches
-- ==============================================================================

-- Ships Indexes
CREATE INDEX IF NOT EXISTS idx_ships_mmsi ON ships(mmsi);
CREATE INDEX IF NOT EXISTS idx_ships_imo ON ships(imo);
CREATE INDEX IF NOT EXISTS idx_ships_risk_score ON ships(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_ships_last_contact ON ships(last_contact DESC);
CREATE INDEX IF NOT EXISTS idx_ships_coordinates ON ships(latitude, longitude);

-- Incidents Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_ship_id ON incidents(ship_id);
CREATE INDEX IF NOT EXISTS idx_incidents_mmsi ON incidents(mmsi);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_occurred_at ON incidents(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_coordinates ON incidents(latitude, longitude);

-- Alerts Indexes
CREATE INDEX IF NOT EXISTS idx_alerts_ship_id ON alerts(ship_id);
CREATE INDEX IF NOT EXISTS idx_alerts_incident_id ON alerts(incident_id);
CREATE INDEX IF NOT EXISTS idx_alerts_mmsi ON alerts(mmsi);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_alerts_coordinates ON alerts(latitude, longitude);

-- Hotspots Indexes
CREATE INDEX IF NOT EXISTS idx_hotspots_risk_level ON hotspots(risk_level);
CREATE INDEX IF NOT EXISTS idx_hotspots_coordinates ON hotspots(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_hotspots_bounds ON hotspots(min_latitude, min_longitude, max_latitude, max_longitude);

-- Investigation Reports Indexes
CREATE INDEX IF NOT EXISTS idx_reports_ship_id ON investigation_reports(ship_id);
CREATE INDEX IF NOT EXISTS idx_reports_incident_id ON investigation_reports(incident_id);
CREATE INDEX IF NOT EXISTS idx_reports_mmsi ON investigation_reports(mmsi);
CREATE INDEX IF NOT EXISTS idx_reports_status ON investigation_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON investigation_reports(generated_at DESC);

-- ==============================================================================
-- AUTOMATIC updated_at TIMESTAMP TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ships_updated_at ON ships;
CREATE TRIGGER trg_ships_updated_at BEFORE UPDATE ON ships
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_incidents_updated_at ON incidents;
CREATE TRIGGER trg_incidents_updated_at BEFORE UPDATE ON incidents
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_alerts_updated_at ON alerts;
CREATE TRIGGER trg_alerts_updated_at BEFORE UPDATE ON alerts
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_hotspots_updated_at ON hotspots;
CREATE TRIGGER trg_hotspots_updated_at BEFORE UPDATE ON hotspots
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_reports_updated_at ON investigation_reports;
CREATE TRIGGER trg_reports_updated_at BEFORE UPDATE ON investigation_reports
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
