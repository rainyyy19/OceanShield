from typing import Dict, List
from pydantic import Field
try:
    from schemas.common import BaseSchema
except ImportError:
    from backend.schemas.common import BaseSchema


class SpoofingFactorsBreakdown(BaseSchema):
    kinematic_jump_score: float = Field(alias="kinematicJumpScore")
    synthetic_drift_score: float = Field(alias="syntheticDriftScore")
    rf_carrier_drop_score: float = Field(alias="rfCarrierDropScore")
    transponder_blanking_score: float = Field(alias="transponderBlankingScore")
    altitude_anomaly_score: float = Field(alias="altitudeAnomalyScore")
    identity_clone_score: float = Field(alias="identityCloneScore")


class SpoofingConfidenceResponse(BaseSchema):
    vessel_id: str = Field(alias="vesselId")
    vessel_name: str = Field(alias="vesselName")
    mmsi: int
    confidence: float
    risk_level: str = Field(alias="riskLevel")
    primary_vector: str = Field(alias="primaryVector")
    ai_forensic_rationale: str = Field(alias="aiForensicRationale")
    factors: SpoofingFactorsBreakdown


class FleetConfidenceSummary(BaseSchema):
    average_confidence: float = Field(alias="averageConfidence")
    high_threat_count: int = Field(alias="highThreatCount")
    medium_threat_count: int = Field(alias="mediumThreatCount")
    safe_count: int = Field(alias="safeCount")
    confidence_distribution: Dict[str, int] = Field(alias="confidenceDistribution")
    top_threatened_vessels: List[SpoofingConfidenceResponse] = Field(alias="topThreatenedVessels")
