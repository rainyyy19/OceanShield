import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${BACKEND_URL}/api/health`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        ...data,
        backend_connected: true,
      });
    }
  } catch {
    // Backend offline
  }

  return NextResponse.json({
    status: "standalone",
    version: "1.0.0",
    ais_records_loaded: 30,
    vessels_tracked: 30,
    active_threats: 7,
    backend_connected: false,
    mode: "frontend_local_fallback",
  });
}
