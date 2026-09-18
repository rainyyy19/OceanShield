"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  AlertOctagon, 
  AlertTriangle, 
  Radio, 
  Eye, 
  ExternalLink, 
  Clock, 
  Filter,
  CheckCircle2,
  Volume2,
  VolumeX,
  Zap
} from "lucide-react";
import { Vessel, ThreatAlert } from "@/types/vessel";
import { getAnomalies } from "@/lib/api";

interface ThreatAlertsProps {
  vessels: Vessel[];
  onSelectVessel: (vessel: Vessel) => void;
  onFocusCorridor?: (lng: number, lat: number) => void;
}

export default function ThreatAlerts({
  vessels,
  onSelectVessel,
  onFocusCorridor,
}: ThreatAlertsProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<ThreatAlert[]>([]);

  // Synthesize alerts from high/medium risk vessels + known attacks
  const rawAlerts: ThreatAlert[] = [
    {
      id: "alt-01",
      vesselId: "vsl-015",
      vesselName: "STENA IMPERATOR",
      mmsi: 310892301,
      type: "Synchronous GPS Spoofing Cluster",
      severity: "CRITICAL",
      region: "Strait of Hormuz / Gulf of Oman",
      timestamp: "Just now",
      confidence: 98.1,
      description: "Multiple false vessel AIS echoes injected with synchronized circular drift pattern. Carrier C/N0 dropped 18 dB.",
      coordinates: [57.6512, 24.4124],
    },
    {
      id: "alt-02",
      vesselId: "vsl-001",
      vesselName: "EVER VALIANT",
      mmsi: 352984123,
      type: "AIS Teleportation Jump (18 nm offset)",
      severity: "CRITICAL",
      region: "Bab-el-Mandeb Strait",
      timestamp: "2m ago",
      confidence: 96.4,
      description: "Vessel position jumped 18 nautical miles in under 12 seconds. Kinematic speed equivalent to 540 knots (Physically impossible).",
      coordinates: [43.4512, 12.7145],
    },
    {
      id: "alt-03",
      vesselId: "vsl-011",
      vesselName: "OCEAN MERCURY",
      mmsi: 371928471,
      type: "Dark Fleet Transponder Blanking",
      severity: "CRITICAL",
      region: "Malacca Strait",
      timestamp: "5m ago",
      confidence: 95.2,
      description: "Transponder intentionally suppressed during high-traffic chokepoint transit. Re-injected with shifted coordinate payload.",
      coordinates: [101.2145, 2.8512],
    },
    {
      id: "alt-04",
      vesselId: "vsl-003",
      vesselName: "CMA CGM ANTARES",
      mmsi: 228392100,
      type: "Circular GPS Drift Pattern",
      severity: "HIGH",
      region: "Arabian Sea Approach",
      timestamp: "12m ago",
      confidence: 93.8,
      description: "Reported GPS track forms unnatural static geometric circle (radius 1.2 nm) while vessel propulsion telemetry indicates steady passage.",
      coordinates: [58.7421, 23.9412],
    },
    {
      id: "alt-05",
      vesselId: "vsl-023",
      vesselName: "GULF EMIRATES",
      mmsi: 470129845,
      type: "Cloned MMSI / Dual Geo-Location",
      severity: "HIGH",
      region: "Gulf of Oman",
      timestamp: "18m ago",
      confidence: 97.3,
      description: "Identical MMSI broadcast received simultaneously from two locations separated by 420 nautical miles.",
      coordinates: [59.9821, 22.8124],
    },
    {
      id: "alt-06",
      vesselId: "vsl-005",
      vesselName: "AL MIRQAB TANKER",
      mmsi: 466381000,
      type: "Carrier-to-Noise Fluctuation",
      severity: "MEDIUM",
      region: "Central Arabian Sea",
      timestamp: "32m ago",
      confidence: 68.2,
      description: "Wideband GNSS L1/L2 frequency interference detected on starboard satellite receiver.",
      coordinates: [62.4819, 18.2415],
    },
    {
      id: "alt-07",
      vesselId: "vsl-013",
      vesselName: "MSC ILONA",
      mmsi: 255806490,
      type: "Vertical Dilution Anomaly (VDOP)",
      severity: "MEDIUM",
      region: "Central Red Sea",
      timestamp: "45m ago",
      confidence: 64.9,
      description: "Calculated vessel altitude spiked to +140m above sea level, indicating ground-based pseudo-satellite spoofing transmitter.",
      coordinates: [38.6412, 19.8124],
    },
  ];

  React.useEffect(() => {
    const fetchLive = async () => {
      const res = await getAnomalies();
      if (res && res.anomalies && res.anomalies.length > 0) {
        setLiveAlerts(res.anomalies);
      }
    };
    fetchLive();
  }, []);

  const activeAlerts = liveAlerts.length > 0 ? liveAlerts : rawAlerts;

  const filteredAlerts = activeAlerts.filter((alert) => {
    if (selectedSeverity === "ALL") return true;
    return alert.severity === selectedSeverity;
  });

  const handleInspect = (alert: ThreatAlert) => {
    const vessel = vessels.find((v) => v.id === alert.vesselId || v.mmsi === alert.mmsi);
    if (vessel) {
      onSelectVessel(vessel);
    }
  };

  return (
    <div className="rounded-2xl glass-card border border-cyan-500/25 shadow-md p-4 lg:p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-cyan-500/20 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-100 border border-red-300 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-wide text-slate-900 flex items-center gap-1.5">
              LIVE THREAT INTEL FEED
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            </h3>
            <p className="text-[10px] font-mono text-cyan-800 font-bold">
              REAL-TIME ANOMALY DETECTIONS
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-white/90 text-slate-600 hover:text-cyan-800 border border-slate-300 transition shadow-xs"
            title={soundEnabled ? "Mute alert chime" : "Enable alert chime"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-600" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Severity filter pills */}
      <div className="flex items-center gap-1.5 mb-3 text-[10px] font-mono">
        <span className="text-slate-500 flex items-center gap-1 mr-1 font-semibold">
          <Filter className="w-3 h-3 text-cyan-600" /> Filter:
        </span>
        {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`px-2 py-0.5 rounded-md font-bold transition uppercase ${
              selectedSeverity === sev
                ? sev === "CRITICAL"
                  ? "bg-red-600 text-white shadow-xs"
                  : sev === "HIGH"
                  ? "bg-amber-500 text-slate-900"
                  : sev === "MEDIUM"
                  ? "bg-yellow-500 text-slate-900"
                  : "bg-cyan-600 text-white font-extrabold shadow-xs"
                : "bg-white/90 text-slate-600 hover:text-slate-900 border border-slate-300"
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alert items stream */}
      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[500px]">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === "CRITICAL";
          const isHigh = alert.severity === "HIGH";

          return (
            <div
              key={alert.id}
              className={`p-3 rounded-xl transition duration-200 border text-xs group shadow-xs ${
                isCritical
                  ? "bg-red-50/90 hover:bg-red-100/90 border-red-300"
                  : isHigh
                  ? "bg-amber-50/90 hover:bg-amber-100/90 border-amber-300"
                  : "bg-white/90 hover:bg-cyan-50/90 border-cyan-500/20"
              }`}
            >
              {/* Top meta row */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCritical
                        ? "bg-red-600 animate-ping"
                        : isHigh
                        ? "bg-amber-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  <span className="font-bold text-slate-900 group-hover:text-cyan-800 transition">
                    {alert.vesselName}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-800 font-semibold">
                    #{alert.mmsi}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded border ${
                      isCritical
                        ? "bg-red-100 text-red-700 border-red-300"
                        : isHigh
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-yellow-100 text-yellow-800 border-yellow-300"
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 font-medium">
                    {alert.timestamp}
                  </span>
                </div>
              </div>

              {/* Anomaly Type & Region */}
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-red-700 flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3 text-red-600" />
                  {alert.type}
                </span>
                <span className="text-[10px] font-mono text-teal-700 font-bold">
                  {alert.confidence}% AI Conf
                </span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-600 leading-tight mb-2 font-normal">
                {alert.description}
              </p>

              {/* Bottom footer: Location & CTA */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/90 text-[10px]">
                <span className="font-mono text-slate-600 truncate max-w-[170px] font-medium">
                  📍 {alert.region}
                </span>
                <button
                  onClick={() => handleInspect(alert)}
                  className="px-2.5 py-1 rounded bg-cyan-100/90 hover:bg-cyan-200 text-cyan-900 font-bold border border-cyan-400 transition flex items-center gap-1 shadow-xs"
                >
                  <Eye className="w-3 h-3 text-cyan-700" />
                  Investigate
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
