"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Radio, 
  Zap, 
  Filter, 
  ExternalLink, 
  Clock, 
  Activity, 
  Crosshair, 
  Eye, 
  CheckCircle2 
} from "lucide-react";
import { Vessel } from "@/types/vessel";

interface ThreatsViewProps {
  vessels: Vessel[];
  onSelectVessel: (vessel: Vessel) => void;
  onNavigateToMap: () => void;
}

export default function ThreatsView({
  vessels,
  onSelectVessel,
  onNavigateToMap,
}: ThreatsViewProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");

  const highRiskVessels = vessels.filter((v) => v.risk === "High");
  const mediumRiskVessels = vessels.filter((v) => v.risk === "Medium");

  const threatClusters = [
    {
      id: "cl-01",
      name: "Bab-el-Mandeb Spoofing Vector",
      region: "Southern Red Sea / Gulf of Aden",
      severity: "CRITICAL",
      vesselsImpacted: 3,
      anomalyType: "AIS Teleportation Jump & False Grounding Offsets",
      activeSince: "4h 12m",
      description: "Land-based RF emitters injecting synthetic coordinate jumps into AIS transponders of northbound commercial container vessels.",
    },
    {
      id: "cl-02",
      name: "Hormuz Synthetic Orbit Cluster",
      region: "Strait of Hormuz / Gulf of Oman",
      severity: "CRITICAL",
      vesselsImpacted: 4,
      anomalyType: "Synchronous Circular GPS Drift (Radius 1.2 nm)",
      activeSince: "2h 45m",
      description: "Multiple commercial crude tankers displaying synchronized false geometric circles while vessel gyroscopes confirm steady course.",
    },
    {
      id: "cl-03",
      name: "Malacca Strait Dark Fleet Activity",
      region: "Central Malacca Chokepoint",
      severity: "HIGH",
      vesselsImpacted: 2,
      anomalyType: "Transponder Blanking & Duplicate MMSI Injection",
      activeSince: "6h 30m",
      description: "Vessels deliberately disabling transponders followed by re-injection of shifted positions to mask illicit ship-to-ship transfers.",
    },
    {
      id: "cl-04",
      name: "Central Red Sea Vertical Dilution (VDOP)",
      region: "King Abdullah Port Approach",
      severity: "MEDIUM",
      vesselsImpacted: 2,
      anomalyType: "Geometric Altitude Spike (+140m ASL)",
      activeSince: "1h 15m",
      description: "Ground-based pseudo-satellite spoofing creating unnatural vertical altitude anomalies on commercial marine GPS receivers.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 glass-card border border-red-500/30 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-red-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                DEFCON 2 &bull; ELEVATED CYBER THREAT
              </span>
              <span className="text-xs font-mono text-slate-600 font-semibold">
                ACTIVE CLUSTERS: 4 IDENTIFIED
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Maritime Threat Intelligence & Spoofing Clusters
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Continuous neural correlation identifying active electronic warfare nodes, synthetic GPS coordinate generators, and dark fleet identity manipulation across strategic chokepoints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToMap}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
            >
              <Crosshair className="w-4 h-4" />
              View Threat Map
            </button>
          </div>
        </div>
      </div>

      {/* Threat Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-red-300 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1 font-semibold">
            <span>CONFIRMED HIGH RISK</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          </div>
          <div className="text-3xl font-black font-mono text-red-600">{highRiskVessels.length} Vessels</div>
          <p className="text-[11px] text-slate-500 mt-1">Under active electronic spoofing</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-amber-300 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1 font-semibold">
            <span>MEDIUM RISK / VARIANCE</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-3xl font-black font-mono text-amber-600">{mediumRiskVessels.length} Vessels</div>
          <p className="text-[11px] text-slate-500 mt-1">SNR drop or kinematic jitter</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-cyan-300 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1 font-semibold">
            <span>ATTACK VECTORS ACTIVE</span>
            <Zap className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-3xl font-black font-mono text-cyan-800">5 Vectors</div>
          <p className="text-[11px] text-slate-500 mt-1">Circle, Teleport, Blank, Jam, Clone</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-teal-300 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1 font-semibold">
            <span>NEURAL DETECTION CONF</span>
            <Activity className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-3xl font-black font-mono text-teal-700">98.9%</div>
          <p className="text-[11px] text-slate-500 mt-1">Kinematics vs Ephemeris model</p>
        </div>
      </div>

      {/* Active Threat Clusters */}
      <div className="rounded-2xl glass-card border border-cyan-500/25 p-5 shadow-md">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/20">
          <h3 className="text-sm font-black text-slate-900 tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            Active Regional Spoofing Clusters
          </h3>
          <span className="text-[11px] font-mono text-cyan-800 font-bold">
            {threatClusters.length} Clusters Enforced
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {threatClusters.map((cluster) => {
            const isCrit = cluster.severity === "CRITICAL";
            return (
              <div
                key={cluster.id}
                className={`p-4 rounded-xl border transition shadow-xs ${
                  isCrit
                    ? "bg-white/95 border-red-300 hover:border-red-400"
                    : "bg-white/95 border-amber-300 hover:border-amber-400"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCrit ? "bg-red-600 animate-ping" : "bg-amber-500"
                        }`}
                      />
                      {cluster.name}
                    </h4>
                    <span className="text-[11px] font-mono text-cyan-800 font-semibold">
                      📍 {cluster.region} &bull; Active: {cluster.activeSince}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                      isCrit
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}
                  >
                    {cluster.severity}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 mb-3 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 mb-1">
                    <span className="text-red-700 font-bold">Vector: {cluster.anomalyType}</span>
                    <span className="font-mono text-cyan-800 font-bold">{cluster.vesselsImpacted} Vessels Targeted</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {cluster.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono font-medium">DEFENSE: COUNTERMEASURE ACTIVE</span>
                  <button
                    onClick={onNavigateToMap}
                    className="px-3 py-1 rounded-lg bg-cyan-100 hover:bg-cyan-200 text-cyan-900 font-bold border border-cyan-300 transition text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-700" />
                    Inspect Zone
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Risk Targets Spotlight */}
      <div className="rounded-2xl glass-card border border-cyan-500/25 p-5 shadow-md">
        <h3 className="text-sm font-black text-slate-900 tracking-wide pb-3 mb-4 border-b border-cyan-500/20 flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-red-600" />
          High-Priority Targeted Vessels ({highRiskVessels.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {highRiskVessels.map((vessel) => (
            <div
              key={vessel.id}
              onClick={() => onSelectVessel(vessel)}
              className="p-3.5 rounded-xl bg-white/95 hover:bg-red-50/40 border border-red-300 hover:border-red-400 transition cursor-pointer group shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-red-700 transition flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                      {vessel.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">
                      MMSI: {vessel.mmsi} &bull; {vessel.flag}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded">
                    {vessel.spoofingConfidence}% Conf
                  </span>
                </div>

                <p className="text-[11px] text-red-700 font-semibold line-clamp-2 mt-1">
                  {vessel.anomalyType}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500 font-medium">Dest: {vessel.destination}</span>
                <span className="text-cyan-800 font-bold group-hover:underline flex items-center gap-1">
                  Launch Dossier &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
