import {
  Vessel,
  ThreatAlert,
  VesselTrackResponse,
  FleetOverviewStats,
  BackendHealth,
  SpoofingConfidenceResponse,
  InvestigationTimelineItem,
  HeatmapResponse,
  HeatmapPoint,
  AisStatusResponse,
} from "@/types/vessel";

/**
 * OceanShield Unified API Client
 * Connects directly through Next.js proxy/rewrites to the FastAPI backend.
 */

const API_BASE = "/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      ...options,
    });
    if (!res.ok) {
      console.warn(`[OceanShield API] Non-OK response for ${url}:`, res.status, res.statusText);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[OceanShield API] Error fetching ${url}:`, err);
    return null;
  }
}

/**
 * 1. Health & Executive Stats
 */
export async function getBackendHealth(): Promise<BackendHealth | null> {
  return fetchJson<BackendHealth>(`${API_BASE}/health`);
}

export async function getFleetStats(): Promise<FleetOverviewStats | null> {
  return fetchJson<FleetOverviewStats>(`${API_BASE}/stats`);
}

/**
 * 2. Vessel Telemetry & Tracks
 */
export async function getVessels(params?: {
  risk?: string;
  search?: string;
  has_anomaly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; filtered: number; vessels: Vessel[] } | null> {
  const query = new URLSearchParams();
  if (params?.risk && params.risk !== "All") query.set("risk", params.risk);
  if (params?.search) query.set("search", params.search);
  if (params?.has_anomaly !== undefined) query.set("has_anomaly", String(params.has_anomaly));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));

  const qStr = query.toString();
  const url = `${API_BASE}/vessels${qStr ? `?${qStr}` : ""}`;
  return fetchJson<{ total: number; filtered: number; vessels: Vessel[] }>(url);
}

export async function getVessel(vesselId: string | number): Promise<Vessel | null> {
  return fetchJson<Vessel>(`${API_BASE}/vessels/${vesselId}`);
}

export async function getVesselTrack(mmsi: string | number): Promise<VesselTrackResponse | null> {
  return fetchJson<VesselTrackResponse>(`${API_BASE}/vessels/${mmsi}/track`);
}

/**
 * 3. Anomaly Detections & Threat Alerts
 */
export async function getAnomalies(params?: {
  severity?: string;
  region?: string;
  min_confidence?: number;
}): Promise<{
  total: number;
  criticalCount?: number;
  highCount?: number;
  mediumCount?: number;
  lowCount?: number;
  anomalies: ThreatAlert[];
} | null> {
  const query = new URLSearchParams();
  if (params?.severity && params.severity !== "ALL") query.set("severity", params.severity);
  if (params?.region) query.set("region", params.region);
  if (params?.min_confidence) query.set("min_confidence", String(params.min_confidence));

  const qStr = query.toString();
  const url = `${API_BASE}/anomalies${qStr ? `?${qStr}` : ""}`;
  return fetchJson<{
    total: number;
    criticalCount?: number;
    highCount?: number;
    mediumCount?: number;
    lowCount?: number;
    anomalies: ThreatAlert[];
  }>(url);
}

/**
 * 4. Spoofing Confidence Scoring
 */
export async function getSpoofingConfidence(vesselId: string | number): Promise<SpoofingConfidenceResponse | null> {
  return fetchJson<SpoofingConfidenceResponse>(`${API_BASE}/spoofing/confidence/${vesselId}`);
}

export async function getFleetConfidenceSummary(): Promise<any | null> {
  return fetchJson<any>(`${API_BASE}/spoofing/confidence`);
}

/**
 * 5. Forensic Investigations & Audit Timelines
 */
export async function getFleetTimeline(params?: {
  severity?: string;
  only_anomalies?: boolean;
  limit?: number;
}): Promise<InvestigationTimelineItem[] | null> {
  const query = new URLSearchParams();
  if (params?.severity && params.severity !== "ALL") query.set("severity", params.severity);
  if (params?.only_anomalies) query.set("only_anomalies", "true");
  if (params?.limit) query.set("limit", String(params.limit));

  const qStr = query.toString();
  const url = `${API_BASE}/investigations/timeline${qStr ? `?${qStr}` : ""}`;
  return fetchJson<InvestigationTimelineItem[]>(url);
}

export async function getVesselTimeline(vesselId: string | number): Promise<{
  vesselId: string;
  vesselName: string;
  mmsi: number;
  timeline: InvestigationTimelineItem[];
} | null> {
  return fetchJson<{
    vesselId: string;
    vesselName: string;
    mmsi: number;
    timeline: InvestigationTimelineItem[];
  }>(`${API_BASE}/investigations/timeline/${vesselId}`);
}

/**
 * 6. Strategic Chokepoints & Risk Heatmap
 */
export async function getHeatmapRegions(): Promise<HeatmapResponse | null> {
  return fetchJson<HeatmapResponse>(`${API_BASE}/heatmap/regions`);
}

export async function getHeatmapPoints(): Promise<HeatmapPoint[] | null> {
  return fetchJson<HeatmapPoint[]>(`${API_BASE}/heatmap/points`);
}

/**
 * 7. AIS CSV Ingestion & Controls
 */
export async function reloadAisTelemetry(): Promise<{
  status: string;
  message: string;
  records_ingested: number;
  source: string;
} | null> {
  return fetchJson<{
    status: string;
    message: string;
    records_ingested: number;
    source: string;
  }>(`${API_BASE}/ais/reload`, {
    method: "POST",
  });
}

export async function getAisStatus(): Promise<AisStatusResponse | null> {
  return fetchJson<AisStatusResponse>(`${API_BASE}/ais/status`);
}
