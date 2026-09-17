from typing import List, Tuple
from app.models.vessel import RiskLevel, VesselModel
from app.schemas.heatmap import (
    HeatmapRegionResponse,
    HeatmapPointResponse,
    HeatmapResponse,
)
from app.services.ais_service import AisService, ais_service


class HeatmapService:
    """Service to compute spatial clusters, maritime chokepoints, and risk heatmap regions."""

    # Strategic maritime chokepoints with boundary boxes: (min_lat, min_lng, max_lat, max_lng)
    REGIONS_CONFIG = [
        {
            "id": "reg-bab-el-mandeb",
            "name": "Bab-el-Mandeb Strait",
            "center": (12.65, 43.35),
            "bounds": (11.5, 42.0, 14.5, 44.5),
            "primary_threat": "AIS Teleportation Jumps & Land-Based RF Injection",
            "base_risk": 94.0,
            "description": "High-density chokepoint between Red Sea and Gulf of Aden experiencing severe kinematic displacement attacks.",
        },
        {
            "id": "reg-hormuz",
            "name": "Strait of Hormuz / Gulf of Oman",
            "center": (24.8, 57.5),
            "bounds": (22.5, 55.0, 27.5, 61.0),
            "primary_threat": "Synchronous GPS Circular Drift & GNSS Jamming",
            "base_risk": 88.0,
            "description": "Critical crude oil transit passage subject to state-sponsored electronic warfare and false echo synthesis.",
        },
        {
            "id": "reg-red-sea",
            "name": "Central Red Sea",
            "center": (19.8, 38.6),
            "bounds": (17.0, 36.0, 23.0, 41.0),
            "primary_threat": "Vertical Dilution Anomaly (Pseudo-Satellite Altitude Spikes)",
            "base_risk": 78.0,
            "description": "Littoral electronic jamming resulting in extreme calculated vessel altitude spikes above sea level.",
        },
        {
            "id": "reg-malacca",
            "name": "Malacca Strait",
            "center": (2.85, 101.2),
            "bounds": (1.5, 100.0, 4.5, 102.5),
            "primary_threat": "Dark Fleet Transponder Suppression & Shifted Injections",
            "base_risk": 62.0,
            "description": "High traffic maritime corridor with deliberate AIS transponder blanking and coordinate payload manipulation.",
        },
        {
            "id": "reg-singapore",
            "name": "Singapore Strait",
            "center": (1.25, 103.85),
            "bounds": (1.0, 103.4, 1.6, 104.4),
            "primary_threat": "Nominal Traffic with Sporadic Ephemeris Drift",
            "base_risk": 41.0,
            "description": "Heavily monitored Western traffic separation scheme maintained with multi-sensor VTS radar consensus.",
        },
        {
            "id": "reg-arabian-sea",
            "name": "Arabian Sea Approach",
            "center": (20.5, 61.5),
            "bounds": (15.0, 58.0, 24.0, 65.0),
            "primary_threat": "Wideband Carrier-to-Noise Fluctuations & Dual Identity Spoofs",
            "base_risk": 72.0,
            "description": "Open sea transit corridor exhibiting carrier-to-noise degradations and cloned MMSI transmitters.",
        },
    ]

    def __init__(self, ais_svc: AisService = ais_service):
        self.ais_svc = ais_svc

    def get_heatmap_regions(self) -> HeatmapResponse:
        vessels = self.ais_svc.get_all_vessels()

        regions_output: List[HeatmapRegionResponse] = []
        points_output: List[HeatmapPointResponse] = []

        # 1. Calculate regional metrics
        for reg in self.REGIONS_CONFIG:
            min_lat, min_lng, max_lat, max_lng = reg["bounds"]
            
            # Find vessels inside this boundary
            in_region: List[VesselModel] = [
                v for v in vessels
                if min_lat <= v.latitude <= max_lat and min_lng <= v.longitude <= max_lng
            ]

            threats = [v for v in in_region if v.risk in [RiskLevel.HIGH, RiskLevel.MEDIUM]]
            threat_count = len(threats)
            vessel_count = len(in_region)

            # Calculate dynamic risk score based on vessels present
            if in_region:
                avg_threat_conf = sum(v.spoofing_confidence for v in in_region) / vessel_count
                computed_risk = round(0.5 * reg["base_risk"] + 0.5 * avg_threat_conf, 1)
            else:
                computed_risk = reg["base_risk"]

            if computed_risk >= 85:
                risk_level = "CRITICAL"
            elif computed_risk >= 65:
                risk_level = "HIGH"
            elif computed_risk >= 40:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

            regions_output.append(
                HeatmapRegionResponse(
                    id=reg["id"],
                    name=reg["name"],
                    risk_level=risk_level,
                    risk_score=computed_risk,
                    vessel_count=vessel_count,
                    threat_count=threat_count,
                    center=reg["center"],
                    bounds=reg["bounds"],
                    primary_threat=reg["primary_threat"],
                    description=reg["description"],
                )
            )

        # 2. Build weighted heatmap points for all vessels
        for v in vessels:
            # High risk vessels emit higher intensity heat
            if v.risk == RiskLevel.HIGH:
                intensity = min(1.0, 0.7 + (v.spoofing_confidence / 300.0))
            elif v.risk == RiskLevel.MEDIUM:
                intensity = 0.55
            else:
                intensity = 0.25

            points_output.append(
                HeatmapPointResponse(
                    lat=v.latitude,
                    lng=v.longitude,
                    intensity=round(intensity, 2),
                    vessel_id=v.id,
                    risk=v.risk.value,
                    threat_type=v.anomaly_type,
                )
            )

        # Sort regions descending by risk score
        regions_output.sort(key=lambda r: r.risk_score, reverse=True)

        return HeatmapResponse(
            total_regions=len(regions_output),
            regions=regions_output,
            points=points_output,
        )


heatmap_service = HeatmapService()
