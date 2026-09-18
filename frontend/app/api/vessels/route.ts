import { NextRequest, NextResponse } from "next/server";
import { getAllVesselsFromDataset } from "@/lib/aisDataset";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const risk = searchParams.get("risk") || undefined;
  const search = searchParams.get("search") || undefined;
  const hasAnomaly = searchParams.get("has_anomaly") || undefined;
  const limit = searchParams.get("limit") || undefined;
  const offset = searchParams.get("offset") || undefined;

  // 1. Attempt to fetch from FastAPI backend
  try {
    const backendQuery = new URLSearchParams();
    if (risk) backendQuery.set("risk", risk);
    if (search) backendQuery.set("search", search);
    if (hasAnomaly) backendQuery.set("has_anomaly", hasAnomaly);
    if (limit) backendQuery.set("limit", limit);
    if (offset) backendQuery.set("offset", offset);

    const queryString = backendQuery.toString();
    const targetUrl = `${BACKEND_URL}/api/vessels${queryString ? `?${queryString}` : ""}`;

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
    // FastAPI backend is not running or timed out; fall back to local dataset
  }

  // 2. Resilient local fallback from aisDataset.ts
  try {
    const vessels = getAllVesselsFromDataset(risk, search);
    return NextResponse.json({
      total: vessels.length,
      filtered: vessels.length,
      vessels: vessels,
      source: "local_dataset_fallback",
    });
  } catch (error) {
    console.error("Failed to fetch vessels from AIS dataset:", error);
    return NextResponse.json(
      { error: "Failed to retrieve vessel telemetry" },
      { status: 500 }
    );
  }
}
