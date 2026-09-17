import fs from "fs";
import path from "path";
import { Vessel, VesselTrackPoint, VesselTrackResponse, RiskLevel } from "@/types/vessel";

const CSV_PATH = path.join(process.cwd(), "data", "ais_telemetry.csv");
const VESSELS_JSON_PATH = path.join(process.cwd(), "data", "vessels.json");

interface CsvRow {
  timestamp: string;
  mmsi: number;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
}

function haversineNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const rNm = 3440.065;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return rNm * c;
}

function readCsvRows(): CsvRow[] {
  if (!fs.existsSync(CSV_PATH)) {
    return [];
  }
  const content = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const rows: CsvRow[] = [];
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length >= 6) {
      const timestamp = parts[0].trim();
      const mmsi = parseInt(parts[1].trim(), 10);
      const latitude = parseFloat(parts[2].trim());
      const longitude = parseFloat(parts[3].trim());
      const speed = parseFloat(parts[4].trim());
      const course = parseFloat(parts[5].trim());
      if (!isNaN(mmsi) && !isNaN(latitude) && !isNaN(longitude)) {
        rows.push({ timestamp, mmsi, latitude, longitude, speed, course });
      }
    }
  }
  return rows;
}

function readVesselsJson(): Vessel[] {
  if (!fs.existsSync(VESSELS_JSON_PATH)) {
    return [];
  }
  try {
    const content = fs.readFileSync(VESSELS_JSON_PATH, "utf-8");
    return JSON.parse(content) as Vessel[];
  } catch (err) {
    console.error("Error reading vessels.json:", err);
    return [];
  }
}

export function getAllVesselsFromDataset(
  riskFilter?: string,
  searchQuery?: string
): Vessel[] {
  const csvRows = readCsvRows();
  const jsonVessels = readVesselsJson();

  const vesselMap = new Map<string | number, Vessel>();
  jsonVessels.forEach((v) => {
    vesselMap.set(v.mmsi, v);
    vesselMap.set(v.id, v);
  });

  // Group CSV rows by MMSI
  const grouped = new Map<number, CsvRow[]>();
  csvRows.forEach((row) => {
    if (!grouped.has(row.mmsi)) {
      grouped.set(row.mmsi, []);
    }
    grouped.get(row.mmsi)!.push(row);
  });

  const resultVessels: Vessel[] = [];

  // Build vessel objects using latest row from CSV
  grouped.forEach((rows, mmsi) => {
    rows.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const latest = rows[rows.length - 1];
    const existing = vesselMap.get(mmsi);

    const baseVessel: Vessel = existing
      ? {
          ...existing,
          latitude: latest.latitude,
          longitude: latest.longitude,
          speed: latest.speed,
          heading: latest.course,
          lastContact: latest.timestamp,
        }
      : {
          id: `vsl-mmsi-${mmsi}`,
          name: `VESSEL-${mmsi}`,
          mmsi: mmsi,
          latitude: latest.latitude,
          longitude: latest.longitude,
          speed: latest.speed,
          heading: latest.course,
          risk: "Safe",
          destination: "Sea Route",
          lastContact: latest.timestamp,
        };

    resultVessels.push(baseVessel);
  });

  // Add any json vessels not in CSV
  jsonVessels.forEach((jv) => {
    if (!grouped.has(jv.mmsi)) {
      resultVessels.push(jv);
    }
  });

  // Apply filters
  let filtered = resultVessels;
  if (riskFilter && riskFilter.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (v) => v.risk.toLowerCase() === riskFilter.toLowerCase()
    );
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.mmsi.toString().includes(q) ||
        (v.destination && v.destination.toLowerCase().includes(q)) ||
        (v.callsign && v.callsign.toLowerCase().includes(q))
    );
  }

  return filtered;
}

export function getVesselTrackFromDataset(
  identifier: string | number
): VesselTrackResponse | null {
  const csvRows = readCsvRows();
  const jsonVessels = readVesselsJson();

  // Find target vessel by MMSI or ID
  let targetVessel: Vessel | undefined;
  const numId = typeof identifier === "number" ? identifier : parseInt(identifier, 10);

  if (!isNaN(numId)) {
    targetVessel = jsonVessels.find((v) => v.mmsi === numId);
  }
  if (!targetVessel && typeof identifier === "string") {
    targetVessel = jsonVessels.find(
      (v) => v.id.toLowerCase() === identifier.toLowerCase()
    );
  }

  const targetMmsi = targetVessel ? targetVessel.mmsi : numId;
  const matchingRows = csvRows.filter((r) => r.mmsi === targetMmsi);

  if (matchingRows.length === 0) {
    // If no CSV rows, generate a synthetic chronological track around the vessel's current coordinates
    if (targetVessel) {
      const headingRad = (targetVessel.heading * Math.PI) / 180;
      const points: VesselTrackPoint[] = [];
      const origTrack: [number, number][] = [];
      const spoofTrack: [number, number][] = [];

      for (let i = 0; i < 10; i++) {
        const step = (i - 9) * 0.015;
        const lat = Number((targetVessel.latitude + step * Math.cos(headingRad)).toFixed(4));
        const lon = Number((targetVessel.longitude + step * Math.sin(headingRad)).toFixed(4));
        const pt: VesselTrackPoint = {
          timestamp: `14:${20 + i}:00 UTC`,
          latitude: lat,
          longitude: lon,
          speed: targetVessel.speed,
          course: targetVessel.heading,
          is_spoofed: targetVessel.risk === "High" && i >= 6,
        };
        points.push(pt);
        if (pt.is_spoofed) {
          spoofTrack.push([lat, lon]);
        } else {
          origTrack.push([lat, lon]);
        }
      }

      return {
        mmsi: targetVessel.mmsi,
        name: targetVessel.name,
        risk: targetVessel.risk,
        anomaly_type: targetVessel.anomalyType,
        track: points,
        original_track: origTrack,
        spoofed_track: spoofTrack,
      };
    }
    return null;
  }

  // Sort matching rows chronologically
  matchingRows.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const points: VesselTrackPoint[] = [];
  const originalTrack: [number, number][] = [];
  const spoofedTrack: [number, number][] = [];

  let hasEncounteredSpoof = false;

  for (let i = 0; i < matchingRows.length; i++) {
    const row = matchingRows[i];
    let isSpoofed = false;

    // Check for speed spike
    if (row.speed > 55.0) {
      isSpoofed = true;
    }

    // Check distance jump from previous point
    if (i > 0) {
      const prev = matchingRows[i - 1];
      const dist = haversineNm(prev.latitude, prev.longitude, row.latitude, row.longitude);
      if (dist > 15.0) {
        isSpoofed = true;
        hasEncounteredSpoof = true;
      }
    }

    const isHighRiskVessel = targetVessel?.risk === "High";
    if (isHighRiskVessel && (hasEncounteredSpoof || i >= 7)) {
      isSpoofed = true;
    }

    const pt: VesselTrackPoint = {
      timestamp: row.timestamp,
      latitude: row.latitude,
      longitude: row.longitude,
      speed: row.speed,
      course: row.course,
      is_spoofed: isSpoofed,
    };

    points.push(pt);

    if (isSpoofed) {
      if (spoofedTrack.length === 0 && originalTrack.length > 0) {
        spoofedTrack.push(originalTrack[originalTrack.length - 1]);
      }
      spoofedTrack.push([row.latitude, row.longitude]);
    } else {
      originalTrack.push([row.latitude, row.longitude]);
    }
  }

  return {
    mmsi: targetMmsi,
    name: targetVessel ? targetVessel.name : `VESSEL-${targetMmsi}`,
    risk: targetVessel ? targetVessel.risk : points.some((p) => p.is_spoofed) ? "High" : "Safe",
    anomaly_type: targetVessel?.anomalyType,
    track: points,
    original_track: originalTrack,
    spoofed_track: spoofedTrack,
  };
}
