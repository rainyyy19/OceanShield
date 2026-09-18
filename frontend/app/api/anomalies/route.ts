import { NextRequest, NextResponse } from "next/server";
import { getAllVesselsFromDataset } from "@/lib/aisDataset";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get("severity") || undefined;
  const region = searchParams.get("region") || undefined;
  const minConfidence = searchParams.get("min_confidence") || undefined;

  // 1. Try FastAPI backend
  try {
    const backendQuery = new URLSearchParams();
    if (severity) backendQuery.set("severity", severity);
    if (region) backendQuery.set("region", region);
    if (minConfidence) backendQuery.set("min_confidence", minConfidence);

    const qStr = backendQuery.toString();
    const targetUrl = `${BACKEND_URL}/api/anomalies${qStr ? `?${qStr}` : ""}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline; fallback below
  }

  // 2. Resilient local fallback synthesized from flagged vessels
  try {
    const vessels = getAllVesselsFromDataset();
    const flagged = vessels.filter((v) => v.risk === "High" || v.risk === "Medium");

    const alerts = flagged.map((v, i) => {
      const isCrit = v.risk === "High";
      return {
        id: `alt-fb-${v.mmsi || i}`,
        vesselId: v.id,
        vesselName: v.name,
        mmsi: v.mmsi,
        type: v.anomalyType || (isCrit ? "Kinematic Coordinate Discontinuity" : "Carrier Noise Fluctuation"),
        severity: isCrit ? "CRITICAL" : "MEDIUM",
        region: v.destination.includes("Red Sea") ? "Bab-el-Mandeb Strait" : "Arabian Sea / Chokepoint Corridor",
        timestamp: "Active",
        confidence: v.spoofingConfidence || (isCrit ? 95.5 : 68.0),
        description: v.aiSummary || `Kinematic telemetry anomaly detected on vessel ${v.name}.`,
        coordinates: [v.longitude, v.latitude],
      };
    });

    return NextResponse.json({
      total: alerts.length,
      criticalCount: alerts.filter((a) => a.severity === "CRITICAL").length,
      highCount: 0,
      mediumCount: alerts.filter((a) => a.severity === "MEDIUM").length,
      lowCount: 0,
      anomalies: alerts,
      source: "local_anomalies_fallback",
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load anomalies" }, { status: 500 });
  }
}
