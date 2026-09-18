export type RiskLevel = "Safe" | "Medium" | "High";

export interface InvestigationTimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  source: string;
}

export interface Vessel {
  id: string;
  name: string;
  mmsi: number;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  risk: RiskLevel;
  destination: string;
  vesselType?: string;
  flag?: string;
  anomalyType?: string;
  spoofingConfidence?: number;
  dwt?: string;
  lastContact?: string;
  imo?: number;
  callsign?: string;
  dimensions?: string;
  eta?: string;
  navStatus?: string;
  photoUrl?: string;
  aiSummary?: string;
  timeline?: InvestigationTimelineItem[];
}

export interface ThreatAlert {
  id: string;
  vesselId: string;
  vesselName: string;
  mmsi: number;
  type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  region: string;
  timestamp: string;
  confidence: number;
  description: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface VesselTrackPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  is_spoofed: boolean;
}

export interface VesselTrackResponse {
  mmsi: number;
  name: string;
  risk: RiskLevel;
  anomaly_type?: string;
  track: VesselTrackPoint[];
  original_track: [number, number][]; // [lat, lng]
  spoofed_track: [number, number][];  // [lat, lng]
}

export interface FleetOverviewStats {
  total_ships_count: number;
  active_threats_count: number;
  fleet_risk_score: number;
  incidents_today_count: number;
  high_risk_count: number;
  medium_risk_count: number;
  safe_count: number;
  timestamp: string;
}

export interface BackendHealth {
  status: string;
  version: string;
  ais_records_loaded: number;
  vessels_tracked: number;
  active_threats: number;
}

export interface SpoofingFactorBreakdown {
  kinematicJumpScore: number;
  syntheticDriftScore: number;
  rfCarrierDropScore: number;
  transponderBlankingScore: number;
  altitudeAnomalyScore: number;
  identityCloneScore: number;
}

export interface SpoofingConfidenceResponse {
  vesselId: string;
  vesselName: string;
  mmsi: number;
  confidence: number;
  riskLevel: RiskLevel;
  primaryVector: string;
  factors: SpoofingFactorBreakdown;
  rationale: string;
}

export interface HeatmapRegion {
  id: string;
  name: string;
  coordinates: string;
  lat: number;
  lng: number;
  zoom: number;
  riskLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "MODERATE" | "LOW";
  riskScore: number;
  activeThreats: string;
  vesselsInZone: number;
  geofenceStatus: string;
  bufferRadius: string;
  description: string;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface HeatmapResponse {
  totalRegions: number;
  regions: HeatmapRegion[];
  points: HeatmapPoint[];
}

export interface AisStatusResponse {
  status: string;
  last_source: string;
  total_records_ingested: number;
  vessels_tracked: number;
}

