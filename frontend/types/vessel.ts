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

