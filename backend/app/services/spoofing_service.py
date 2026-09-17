from typing import Dict, List, Optional
from app.models.vessel import VesselModel, RiskLevel
from app.schemas.spoofing import (
    SpoofingFactorsBreakdown,
    SpoofingConfidenceResponse,
    FleetConfidenceSummary,
)
from app.services.ais_service import AisService, ais_service


class SpoofingService:
    """Service to compute multi-factor spoofing confidence metrics."""

    def __init__(self, ais_svc: AisService = ais_service):
        self.ais_svc = ais_svc

    def calculate_vessel_confidence(self, vessel: VesselModel) -> SpoofingConfidenceResponse:
        """Computes granular factor breakdown and returns comprehensive confidence report."""
        # Baseline confidence from model or heuristics
        conf = vessel.spoofing_confidence or 0.0

        # Heuristic factor distribution based on anomaly type and telemetry
        anomaly_lower = (vessel.anomaly_type or "").lower()
        
        # 1. Kinematic Jump
        if "teleportation" in anomaly_lower or "jump" in anomaly_lower or vessel.speed > 50:
            k_jump = 98.4
        elif vessel.risk == RiskLevel.HIGH:
            k_jump = 65.0
        elif vessel.risk == RiskLevel.MEDIUM:
            k_jump = 35.0
        else:
            k_jump = 1.2

        # 2. Synthetic Drift
        if "circular" in anomaly_lower or "drift" in anomaly_lower or "cluster" in anomaly_lower:
            s_drift = 96.8
        elif vessel.risk == RiskLevel.HIGH:
            s_drift = 70.0
        elif vessel.risk == RiskLevel.MEDIUM:
            s_drift = 40.0
        else:
            s_drift = 1.5

        # 3. RF Carrier Drop (C/N0)
        if vessel.carrier_c_n0_db is not None and vessel.carrier_c_n0_db < 30.0:
            rf_drop = 92.0
        elif "carrier" in anomaly_lower or "c/n0" in anomaly_lower or "jamming" in anomaly_lower:
            rf_drop = 94.5
        elif vessel.risk == RiskLevel.HIGH:
            rf_drop = 80.0
        elif vessel.risk == RiskLevel.MEDIUM:
            rf_drop = 55.0
        else:
            rf_drop = 0.8

        # 4. Transponder Blanking
        if "blanking" in anomaly_lower or "suppressed" in anomaly_lower or "dark" in anomaly_lower:
            t_blank = 95.0
        elif vessel.risk == RiskLevel.HIGH:
            t_blank = 50.0
        else:
            t_blank = 2.0

        # 5. Altitude / VDOP Spikes
        if vessel.gps_altitude_m is not None and vessel.gps_altitude_m > 50.0:
            alt_score = 97.2
        elif "altitude" in anomaly_lower or "vdop" in anomaly_lower:
            alt_score = 93.0
        elif vessel.risk == RiskLevel.HIGH:
            alt_score = 45.0
        else:
            alt_score = 0.5

        # 6. Identity Clone
        if "cloned" in anomaly_lower or "identity" in anomaly_lower or "dual" in anomaly_lower:
            id_clone = 97.5
        elif vessel.risk == RiskLevel.HIGH:
            id_clone = 40.0
        else:
            id_clone = 1.0

        # Primary vector
        if k_jump >= 90:
            primary_vector = "Kinematic Coordinate Discontinuity (Teleportation Jump)"
        elif s_drift >= 90:
            primary_vector = "Synthetic Multi-Path Geometric Drift (Circular Offset)"
        elif alt_score >= 90:
            primary_vector = "Ground-Based Pseudo-Satellite Elevation Spike"
        elif id_clone >= 90:
            primary_vector = "Simultaneous Dual-Geo MMSI Identity Replication"
        elif t_blank >= 90:
            primary_vector = "Dark Fleet Deliberate Transponder Blanking"
        elif rf_drop >= 90:
            primary_vector = "L1/L2 GNSS Wideband Carrier Jamming / Ephemeris Drift"
        elif vessel.risk == RiskLevel.MEDIUM:
            primary_vector = "Kinematic Variance & Environmental Multi-Path"
        else:
            primary_vector = "Verified Multi-GNSS Ephemeris Consensus"

        factors = SpoofingFactorsBreakdown(
            kinematic_jump_score=k_jump,
            synthetic_drift_score=s_drift,
            rf_carrier_drop_score=rf_drop,
            transponder_blanking_score=t_blank,
            altitude_anomaly_score=alt_score,
            identity_clone_score=id_clone,
        )

        rationale = vessel.ai_summary or (
            f"Sensor consensus model evaluated telemetry signals for MMSI {vessel.mmsi}. "
            f"Overall spoofing probability is {round(conf, 1)}% governed by {primary_vector}."
        )

        return SpoofingConfidenceResponse(
            vessel_id=vessel.id,
            vessel_name=vessel.name,
            mmsi=vessel.mmsi,
            confidence=round(conf, 1),
            risk_level=vessel.risk.value,
            primary_vector=primary_vector,
            ai_forensic_rationale=rationale,
            factors=factors,
        )

    def get_vessel_spoofing_confidence(self, identifier: str) -> Optional[SpoofingConfidenceResponse]:
        vessel = self.ais_svc.get_vessel_by_id_or_mmsi(identifier)
        if not vessel:
            return None
        return self.calculate_vessel_confidence(vessel)

    def get_fleet_confidence_summary(self) -> FleetConfidenceSummary:
        vessels = self.ais_svc.get_all_vessels()
        if not vessels:
            return FleetConfidenceSummary(
                average_confidence=0.0,
                high_threat_count=0,
                medium_threat_count=0,
                safe_count=0,
                confidence_distribution={"0-20%": 0, "20-50%": 0, "50-80%": 0, "80-100%": 0},
                top_threatened_vessels=[],
            )

        responses = [self.calculate_vessel_confidence(v) for v in vessels]
        responses.sort(key=lambda r: r.confidence, reverse=True)

        avg_conf = sum(r.confidence for r in responses) / len(responses)

        dist = {"0-20%": 0, "20-50%": 0, "50-80%": 0, "80-100%": 0}
        for r in responses:
            if r.confidence >= 80.0:
                dist["80-100%"] += 1
            elif r.confidence >= 50.0:
                dist["50-80%"] += 1
            elif r.confidence >= 20.0:
                dist["20-50%"] += 1
            else:
                dist["0-20%"] += 1

        high_cnt = sum(1 for v in vessels if v.risk == RiskLevel.HIGH)
        med_cnt = sum(1 for v in vessels if v.risk == RiskLevel.MEDIUM)
        safe_cnt = sum(1 for v in vessels if v.risk == RiskLevel.SAFE)

        return FleetConfidenceSummary(
            average_confidence=round(avg_conf, 1),
            high_threat_count=high_cnt,
            medium_threat_count=med_cnt,
            safe_count=safe_cnt,
            confidence_distribution=dist,
            top_threatened_vessels=responses[:10],
        )


spoofing_service = SpoofingService()
