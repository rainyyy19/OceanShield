"use client";

import React, { useState } from "react";
import { 
  Anchor, 
  ShieldAlert, 
  Radio, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  MapPin, 
  Eye, 
  SlidersHorizontal 
} from "lucide-react";
import { Vessel } from "@/types/vessel";
import { getHeatmapRegions } from "@/lib/api";

interface ChokepointsViewProps {
  vessels: Vessel[];
  onFlyToCorridor: (lat: number, lng: number, zoom?: number) => void;
  onNavigateToFleet: () => void;
}

export default function ChokepointsView({
  vessels,
  onFlyToCorridor,
  onNavigateToFleet,
}: ChokepointsViewProps) {
  const [selectedZone, setSelectedZone] = useState<string>("bab-el-mandeb");
  const [liveRegions, setLiveRegions] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchRegions = async () => {
      const data = await getHeatmapRegions();
      if (data?.regions && data.regions.length > 0) {
        setLiveRegions(data.regions);
      }
    };
    fetchRegions();
  }, []);

  const chokepoints = [
    {
      id: "bab-el-mandeb",
      name: "Bab-el-Mandeb Strait",
      coordinates: "12.58° N, 43.35° E",
      lat: 12.6,
      lng: 43.35,
      zoom: 7,
      riskLevel: "CRITICAL",
      riskScore: 94,
      riskColor: "text-red-400",
      borderColor: "border-red-500/40",
      bgClass: "bg-red-950/20",
      activeThreats: "AIS Teleportation Jumps (18.4 nm offset), Synthetic False Groundings",
      vesselsInZone: 142,
      geofenceStatus: "ARMED (Red Level Alert)",
      bufferRadius: "25 nm",
      description: "Littoral electronic warfare hotspot connecting Red Sea and Gulf of Aden. High frequency of terrestrial GPS spoofing and signal interception targeting commercial shipping lanes.",
    },
    {
      id: "hormuz",
      name: "Strait of Hormuz",
      coordinates: "26.56° N, 56.25° E",
      lat: 24.5,
      lng: 58.5,
      zoom: 6,
      riskLevel: "CRITICAL",
      riskScore: 88,
      riskColor: "text-red-400",
      borderColor: "border-red-500/40",
      bgClass: "bg-red-950/20",
      activeThreats: "Synchronous Circular GPS Spoofing, High L-band Carrier Noise",
      vesselsInZone: 210,
      geofenceStatus: "ARMED (Red Level Alert)",
      bufferRadius: "30 nm",
      description: "Critical crude oil maritime corridor. Commercial vessels regularly report GPS receivers entering synthetic circular drift patterns with 1.2 nm radius.",
    },
    {
      id: "malacca",
      name: "Strait of Malacca",
      coordinates: "2.85° N, 101.21° E",
      lat: 2.85,
      lng: 101.21,
      zoom: 6.5,
      riskLevel: "ELEVATED",
      riskScore: 62,
      riskColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      bgClass: "bg-amber-950/20",
      activeThreats: "Transponder Disablement (Dark Fleet Transits), Replay Timing Spoofs",
      vesselsInZone: 384,
      geofenceStatus: "ENFORCED (Orange Alert)",
      bufferRadius: "20 nm",
      description: "World's busiest container shipping lane. Primary cyber threats include intentional AIS blanking during nocturnal chokepoint transit and MMSI cloning.",
    },
    {
      id: "singapore",
      name: "Singapore Strait",
      coordinates: "1.25° N, 103.85° E",
      lat: 1.25,
      lng: 103.85,
      zoom: 8,
      riskLevel: "MODERATE",
      riskScore: 41,
      riskColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgClass: "bg-navy-950/70",
      activeThreats: "Occasional NMEA Jitter, Dense Vessel Separation Alerts",
      vesselsInZone: 490,
      geofenceStatus: "NORMAL WATCH",
      bufferRadius: "15 nm",
      description: "Ultra-dense anchorage and separation fairway with active coastal VTS radar cross-correlation and precision differential GPS coverage.",
    },
    {
      id: "suez",
      name: "Suez Canal Southern Approach",
      coordinates: "27.85° N, 34.25° E",
      lat: 27.85,
      lng: 34.25,
      zoom: 6.5,
      riskLevel: "HIGH",
      riskScore: 78,
      riskColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      bgClass: "bg-amber-950/20",
      activeThreats: "Wideband Jamming, GPS Vertical Dilution (Altitude Spikes)",
      vesselsInZone: 195,
      geofenceStatus: "ENFORCED (Orange Alert)",
      bufferRadius: "25 nm",
      description: "Northern Red Sea transit bottleneck. Vessels experience intermittent loss of GNSS carrier lock prior to canal convoy staging.",
    },
  ];

  const mergedChokepoints = chokepoints.map((choke) => {
    const liveMatch = liveRegions.find(
      (r) => r.id === choke.id || r.name?.toLowerCase().includes(choke.id.replace("-", " "))
    );
    if (liveMatch) {
      return {
        ...choke,
        riskScore: Math.round(liveMatch.riskScore || liveMatch.risk_score || choke.riskScore),
        vesselsInZone: liveMatch.vesselCount || liveMatch.vessel_count || choke.vesselsInZone,
        activeThreats: liveMatch.primaryThreat || liveMatch.primary_threat || choke.activeThreats,
      };
    }
    return choke;
  });

  const activeZoneData = mergedChokepoints.find((c) => c.id === selectedZone) || mergedChokepoints[0];

  const handleInspectOnMap = (choke: typeof chokepoints[0]) => {
    onFlyToCorridor(choke.lat, choke.lng, choke.zoom);
    onNavigateToFleet();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-2xl p-6 glass-card border border-cyan-500/25 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                GEOFENCE & CHOKEPOINT SURVEILLANCE
              </span>
              <span className="text-xs font-mono text-emerald-700 font-bold">
                5 CORRIDORS MONITORED
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Strategic Maritime Chokepoints & Geofencing Matrix
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Automated virtual perimeter geofencing cross-checking kinetic AIS trajectories with coastal Doppler radar barriers to instantly detect spoofing intrusions and transponder tampering.
            </p>
          </div>

          <button
            onClick={() => handleInspectOnMap(activeZoneData)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Inspect on Map
          </button>
        </div>
      </div>

      {/* Chokepoint Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chokepoints List (1 col) */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold block">
            Select Chokepoint Zone
          </span>
          {mergedChokepoints.map((choke) => {
            const isSelected = selectedZone === choke.id;
            return (
              <div
                key={choke.id}
                onClick={() => setSelectedZone(choke.id)}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between group shadow-xs ${
                  isSelected
                    ? "bg-cyan-50/95 border-cyan-400 text-slate-900 shadow-sm"
                    : "bg-white/95 border-slate-200 hover:border-cyan-400"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${isSelected ? "text-cyan-700" : "text-slate-400"}`} />
                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-cyan-800 transition">
                      {choke.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 pl-6 block">
                    {choke.coordinates}
                  </span>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-mono font-black ${choke.riskColor}`}>
                    {choke.riskScore}% Risk
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    {choke.vesselsInZone} vessels
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Columns: Deep Chokepoint Dossier (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl glass-card border border-cyan-500/25 p-5 shadow-md bg-white/90">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-cyan-500/20 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-black text-slate-900">{activeZoneData.name}</h3>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border bg-red-100 text-red-700 border-red-300">
                    {activeZoneData.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-cyan-800 font-mono font-semibold">
                  GEOGRAPHICAL CENTROID: {activeZoneData.coordinates} &bull; BUFFER: {activeZoneData.bufferRadius}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleInspectOnMap(activeZoneData)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-100 hover:bg-cyan-200 text-cyan-900 font-bold text-xs border border-cyan-300 shadow-xs transition flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-700" />
                  Fly to Corridor
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-700 leading-relaxed mb-4">
              {activeZoneData.description}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
              <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200">
                <span className="text-slate-500 font-mono text-[10px] block font-semibold">COMPOSITE RISK</span>
                <span className="font-mono text-red-600 font-black text-lg">{activeZoneData.riskScore}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200">
                <span className="text-slate-500 font-mono text-[10px] block font-semibold">VESSELS MONITORED</span>
                <span className="font-mono text-slate-900 font-black text-lg">{activeZoneData.vesselsInZone}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200">
                <span className="text-slate-500 font-mono text-[10px] block font-semibold">GEOFENCE BUFFER</span>
                <span className="font-mono text-cyan-800 font-black text-lg">{activeZoneData.bufferRadius}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200">
                <span className="text-slate-500 font-mono text-[10px] block font-semibold">STATUS</span>
                <span className="font-mono text-emerald-700 font-bold text-xs">ARMED</span>
              </div>
            </div>

            {/* Active Threats in Zone */}
            <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-300 text-xs mb-4">
              <span className="text-red-700 font-bold block mb-1 font-mono uppercase text-[11px]">
                Active Threat Vectors in this Sector:
              </span>
              <p className="text-slate-700 font-medium leading-relaxed">
                {activeZoneData.activeThreats}
              </p>
            </div>

            {/* Geofencing Rules Matrix */}
            <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5 font-mono uppercase">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-700" />
                Autonomous Geofence Rules
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Flag velocity vector discontinuous jumps exceeding 25 knots delta.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Immediate notification to regional Coast Guard upon transponder blanking &gt; 3 minutes.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Multi-antenna GNSS C/N0 threshold trigger set at 28 dB-Hz.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
