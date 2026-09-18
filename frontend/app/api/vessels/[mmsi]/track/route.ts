import { NextRequest, NextResponse } from "next/server";
import { getVesselTrackFromDataset } from "@/lib/aisDataset";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mmsi: string }> }
) {
  try {
    const { mmsi } = await params;

    if (!mmsi) {
      return NextResponse.json(
        { error: "MMSI or vessel identifier parameter is required" },
        { status: 400 }
      );
    }

    // 1. Attempt to fetch track from FastAPI backend
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${BACKEND_URL}/api/vessels/${mmsi}/track`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend is down or timed out; fall back to local dataset
    }

    // 2. Resilient local fallback from aisDataset.ts
    const trackData = getVesselTrackFromDataset(mmsi);

    if (!trackData) {
      return NextResponse.json(
        { error: `Track telemetry for MMSI '${mmsi}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(trackData);
  } catch (error) {
    console.error("Failed to retrieve vessel track:", error);
    return NextResponse.json(
      { error: "Internal error retrieving vessel track" },
      { status: 500 }
    );
  }
}
