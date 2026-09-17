import { NextRequest, NextResponse } from "next/server";
import { getAllVesselsFromDataset } from "@/lib/aisDataset";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const risk = searchParams.get("risk") || undefined;
    const search = searchParams.get("search") || undefined;

    const vessels = getAllVesselsFromDataset(risk, search);

    return NextResponse.json({
      total: vessels.length,
      filtered: vessels.length,
      vessels: vessels,
    });
  } catch (error) {
    console.error("Failed to fetch vessels from AIS dataset:", error);
    return NextResponse.json(
      { error: "Failed to retrieve vessel telemetry" },
      { status: 500 }
    );
  }
}
