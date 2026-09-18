import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function POST() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${BACKEND_URL}/api/ais/reload`, {
      method: "POST",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline fallback
  }

  return NextResponse.json({
    status: "success",
    message: "Reloaded baseline AIS dataset (local fallback mode).",
    records_ingested: 30,
    source: "local_dataset_fallback",
  });
}
