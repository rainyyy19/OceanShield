import { NextRequest, NextResponse } from "next/server";
import { getVesselTrackFromDataset } from "@/lib/aisDataset";

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
