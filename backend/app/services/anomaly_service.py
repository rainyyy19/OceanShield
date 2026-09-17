from typing import List, Optional
from app.models.anomaly import ThreatAlertModel, AnomalySeverity
from app.models.vessel import VesselModel, RiskLevel
from app.services.ais_service import AisService, ais_service


class AnomalyService:
    """Service to evaluate vessel anomalies and produce threat alerts."""

    def __init__(self, ais_svc: AisService = ais_service):
        self.ais_svc = ais_svc

    def detect_region_for_coordinates(self, lat: float, lon: float) -> str:
        """Heuristic to resolve geographic corridor name from coordinates."""
        if 11.0 <= lat <= 14.5 and 41.5 <= lon <= 45.0:
            return "Bab-el-Mandeb Strait"
        elif 22.5 <= lat <= 27.5 and 55.0 <= lon <= 61.0:
            return "Strait of Hormuz / Gulf of Oman"
        elif 1.0 <= lat <= 5.0 and 99.0 <= lon <= 104.5:
            return "Malacca Strait / Singapore"
        elif 15.0 <= lat <= 26.0 and 34.0 <= lon <= 41.0:
            return "Central Red Sea"
        elif 15.0 <= lat <= 24.0 and 58.0 <= lon <= 70.0:
            return "Arabian Sea Approach"
        elif 4.0 <= lat <= 10.0 and 75.0 <= lon <= 85.0:
            return "Sri Lanka / Indian Ocean Corridor"
        return "International Maritime Passage"

    def get_all_anomalies(
        self,
        severity: Optional[str] = None,
        region: Optional[str] = None,
        min_confidence: Optional[float] = None,
    ) -> List[ThreatAlertModel]:
        """Generates real-time threat alerts from all flagged vessels."""
        vessels = self.ais_svc.get_all_vessels()
        alerts: List[ThreatAlertModel] = []

        alert_counter = 1
        for v in vessels:
            if v.risk == RiskLevel.SAFE and (not v.spoofing_confidence or v.spoofing_confidence < 30.0):
                continue

            sev = AnomalySeverity.CRITICAL if v.risk == RiskLevel.HIGH and v.spoofing_confidence >= 90.0 \
                else AnomalySeverity.HIGH if v.risk == RiskLevel.HIGH \
                else AnomalySeverity.MEDIUM if v.risk == RiskLevel.MEDIUM \
                else AnomalySeverity.LOW

            reg = self.detect_region_for_coordinates(v.latitude, v.longitude)
            
            # Formulate technical description
            desc = v.ai_summary or f"Telemetry indicates active {v.anomaly_type or 'sensor divergence'} at {v.latitude}, {v.longitude}."
            
            alert = ThreatAlertModel(
                id=f"alt-{alert_counter:02d}",
                vessel_id=v.id,
                vessel_name=v.name,
                mmsi=v.mmsi,
                anomaly_type=v.anomaly_type or "Electronic Deception Anomaly",
                severity=sev,
                region=reg,
                timestamp="Just now",
                confidence=round(v.spoofing_confidence, 1),
                description=desc,
                coordinates=(v.longitude, v.latitude),  # [lng, lat]
            )
            alerts.append(alert)
            alert_counter += 1

        # Apply filters
        if severity and severity.upper() != "ALL":
            alerts = [a for a in alerts if a.severity.value.upper() == severity.upper()]

        if region:
            reg_q = region.lower()
            alerts = [a for a in alerts if reg_q in a.region.lower()]

        if min_confidence is not None:
            alerts = [a for a in alerts if a.confidence >= min_confidence]

        # Sort alerts descending by confidence
        alerts.sort(key=lambda a: a.confidence, reverse=True)
        return alerts

    def get_anomaly_by_id(self, anomaly_id: str) -> Optional[ThreatAlertModel]:
        alerts = self.get_all_anomalies()
        for a in alerts:
            if a.id == anomaly_id or a.vessel_id == anomaly_id:
                return a
        return None


anomaly_service = AnomalyService()
