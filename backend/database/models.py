import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from sqlalchemy import (
    Column,
    String,
    Integer,
    BigInteger,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def current_utc_time():
    return datetime.now(timezone.utc)


class Ship(Base):
    __tablename__ = "ships"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mmsi = Column(BigInteger, unique=True, nullable=False, index=True)
    imo = Column(Integer, unique=True, nullable=True, index=True)
    name = Column(String(255), nullable=False)
    callsign = Column(String(64), nullable=True)
    flag = Column(String(100), nullable=True)
    vessel_type = Column(String(100), nullable=True)
    destination = Column(String(255), nullable=True)
    eta = Column(DateTime(timezone=True), nullable=True)
    nav_status = Column(String(100), default="Underway using engine")
    dimensions = Column(String(64), nullable=True)
    dwt = Column(String(64), nullable=True)
    photo_url = Column(Text, nullable=True)

    # Telemetry & Kinematics
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, nullable=False, default=0.0)
    heading = Column(Float, nullable=False, default=0.0)

    # Intelligence & Risk Scores
    risk_score = Column(Float, nullable=False, default=0.0, index=True)
    confidence_score = Column(Float, nullable=False, default=0.0)
    anomaly_type = Column(String(128), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    ai_summary = Column(Text, nullable=True)

    # RF / EW signals
    carrier_c_n0_db = Column(Float, nullable=True)
    gps_altitude_m = Column(Float, nullable=True)

    # Timestamps
    last_contact = Column(DateTime(timezone=True), nullable=False, default=current_utc_time, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=current_utc_time)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=current_utc_time, onupdate=current_utc_time)

    # Relationships
    incidents = relationship("Incident", back_populates="ship", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="ship", cascade="all, delete-orphan")
    investigation_reports = relationship("InvestigationReport", back_populates="ship")

    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90.0 AND 90.0", name="chk_ships_lat"),
        CheckConstraint("longitude BETWEEN -180.0 AND 180.0", name="chk_ships_lng"),
        CheckConstraint("speed >= 0.0", name="chk_ships_speed"),
        CheckConstraint("heading >= 0.0 AND heading < 360.0", name="chk_ships_heading"),
        CheckConstraint("risk_score BETWEEN 0.0 AND 100.0", name="chk_ships_risk"),
        CheckConstraint("confidence_score BETWEEN 0.0 AND 100.0", name="chk_ships_confidence"),
        Index("idx_ships_coords", "latitude", "longitude"),
    )


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_number = Column(String(64), unique=True, nullable=False, index=True)
    ship_id = Column(String(36), ForeignKey("ships.id", ondelete="SET NULL"), nullable=True, index=True)
    mmsi = Column(BigInteger, nullable=True, index=True)
    imo = Column(Integer, nullable=True)
    title = Column(String(255), nullable=False)
    incident_type = Column(String(128), nullable=False)
    severity = Column(String(32), nullable=False, default="MEDIUM", index=True)
    status = Column(String(32), nullable=False, default="ACTIVE", index=True)

    # Telemetry Snapshot
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, nullable=True, default=0.0)
    heading = Column(Float, nullable=True, default=0.0)
    destination = Column(String(255), nullable=True)

    # Threat & Confidence
    risk_score = Column(Float, nullable=False, default=0.0)
    confidence_score = Column(Float, nullable=False, default=0.0)

    description = Column(Text, nullable=True)
    occurred_at = Column(DateTime(timezone=True), nullable=False, default=current_utc_time, index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=current_utc_time)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=current_utc_time, onupdate=current_utc_time)

    # Relationships
    ship = relationship("Ship", back_populates="incidents")
    alerts = relationship("Alert", back_populates="incident")
    investigation_reports = relationship("InvestigationReport", back_populates="incident")

    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90.0 AND 90.0", name="chk_incidents_lat"),
        CheckConstraint("longitude BETWEEN -180.0 AND 180.0", name="chk_incidents_lng"),
        CheckConstraint("speed >= 0.0", name="chk_incidents_speed"),
        CheckConstraint("heading >= 0.0 AND heading < 360.0", name="chk_incidents_heading"),
        CheckConstraint("risk_score BETWEEN 0.0 AND 100.0", name="chk_incidents_risk"),
        CheckConstraint("confidence_score BETWEEN 0.0 AND 100.0", name="chk_incidents_confidence"),
        Index("idx_incidents_coords", "latitude", "longitude"),
    )


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ship_id = Column(String(36), ForeignKey("ships.id", ondelete="CASCADE"), nullable=False, index=True)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True, index=True)
    mmsi = Column(BigInteger, nullable=False, index=True)
    imo = Column(Integer, nullable=True)
    alert_type = Column(String(128), nullable=False)
    severity = Column(String(32), nullable=False, default="HIGH", index=True)
    region = Column(String(128), nullable=True)

    # Telemetry Snapshot
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, nullable=False, default=0.0)
    heading = Column(Float, nullable=False, default=0.0)
    destination = Column(String(255), nullable=True)

    # Scores
    risk_score = Column(Float, nullable=False, default=0.0)
    confidence_score = Column(Float, nullable=False, default=0.0)

    description = Column(Text, nullable=False)
    metadata_json = Column("metadata", JSON, default=dict)
    is_acknowledged = Column(Boolean, nullable=False, default=False, index=True)
    acknowledged_by = Column(String(128), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, default=current_utc_time, index=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=current_utc_time, onupdate=current_utc_time)

    # Relationships
    ship = relationship("Ship", back_populates="alerts")
    incident = relationship("Incident", back_populates="alerts")

    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90.0 AND 90.0", name="chk_alerts_lat"),
        CheckConstraint("longitude BETWEEN -180.0 AND 180.0", name="chk_alerts_lng"),
        CheckConstraint("speed >= 0.0", name="chk_alerts_speed"),
        CheckConstraint("heading >= 0.0 AND heading < 360.0", name="chk_alerts_heading"),
        CheckConstraint("risk_score BETWEEN 0.0 AND 100.0", name="chk_alerts_risk"),
        CheckConstraint("confidence_score BETWEEN 0.0 AND 100.0", name="chk_alerts_confidence"),
        Index("idx_alerts_coords", "latitude", "longitude"),
    )


class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    region = Column(String(128), nullable=False)
    risk_level = Column(String(32), nullable=False, default="HIGH", index=True)

    # Coordinates & Radius
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_nm = Column(Float, nullable=False, default=25.0)
    min_latitude = Column(Float, nullable=True)
    min_longitude = Column(Float, nullable=True)
    max_latitude = Column(Float, nullable=True)
    max_longitude = Column(Float, nullable=True)

    # Corridor Characteristics & Telemetry Metrics
    speed = Column(Float, default=0.0)
    heading = Column(Float, default=0.0)
    destination = Column(String(255), nullable=True)
    mmsi = Column(BigInteger, nullable=True)
    imo = Column(Integer, nullable=True)

    # Scoring & Status
    risk_score = Column(Float, nullable=False, default=0.0)
    confidence_score = Column(Float, nullable=False, default=0.0)
    primary_threat = Column(String(128), nullable=False)
    active_vessels_count = Column(Integer, nullable=False, default=0)
    active_threats_count = Column(Integer, nullable=False, default=0)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, default=current_utc_time)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=current_utc_time, onupdate=current_utc_time)

    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90.0 AND 90.0", name="chk_hotspots_lat"),
        CheckConstraint("longitude BETWEEN -180.0 AND 180.0", name="chk_hotspots_lng"),
        CheckConstraint("speed >= 0.0", name="chk_hotspots_speed"),
        CheckConstraint("heading >= 0.0 AND heading < 360.0", name="chk_hotspots_heading"),
        CheckConstraint("risk_score BETWEEN 0.0 AND 100.0", name="chk_hotspots_risk"),
        CheckConstraint("confidence_score BETWEEN 0.0 AND 100.0", name="chk_hotspots_confidence"),
        Index("idx_hotspots_coords", "latitude", "longitude"),
        Index("idx_hotspots_bounds", "min_latitude", "min_longitude", "max_latitude", "max_longitude"),
    )


class InvestigationReport(Base):
    __tablename__ = "investigation_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_number = Column(String(64), unique=True, nullable=False, index=True)
    ship_id = Column(String(36), ForeignKey("ships.id", ondelete="SET NULL"), nullable=True, index=True)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)

    # Snapshot Telemetry
    mmsi = Column(BigInteger, nullable=False, index=True)
    imo = Column(Integer, nullable=True)
    destination = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, nullable=False, default=0.0)
    heading = Column(Float, nullable=False, default=0.0)

    # Threat & Confidence
    risk_score = Column(Float, nullable=False, default=0.0)
    confidence_score = Column(Float, nullable=False, default=0.0)

    # Forensic details
    investigator = Column(String(128), nullable=False, default="OceanShield AI Sentinel")
    classification = Column(String(64), nullable=False, default="CONFIDENTIAL")
    status = Column(String(32), nullable=False, default="FINALIZED", index=True)
    executive_summary = Column(Text, nullable=False)
    findings = Column(JSON, default=dict)
    recommendations = Column(Text, nullable=True)
    evidence_attachments = Column(JSON, default=list)

    generated_at = Column(DateTime(timezone=True), nullable=False, default=current_utc_time, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=current_utc_time)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=current_utc_time, onupdate=current_utc_time)

    # Relationships
    ship = relationship("Ship", back_populates="investigation_reports")
    incident = relationship("Incident", back_populates="investigation_reports")

    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90.0 AND 90.0", name="chk_reports_lat"),
        CheckConstraint("longitude BETWEEN -180.0 AND 180.0", name="chk_reports_lng"),
        CheckConstraint("speed >= 0.0", name="chk_reports_speed"),
        CheckConstraint("heading >= 0.0 AND heading < 360.0", name="chk_reports_heading"),
        CheckConstraint("risk_score BETWEEN 0.0 AND 100.0", name="chk_reports_risk"),
        CheckConstraint("confidence_score BETWEEN 0.0 AND 100.0", name="chk_reports_confidence"),
        Index("idx_reports_coords", "latitude", "longitude"),
    )
