"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  Activity, 
  PieChart, 
  Layers, 
  Radio, 
  Zap, 
  ShieldCheck, 
  Compass, 
  AlertTriangle 
} from "lucide-react";

export default function CyberCharts() {
  const [activeTab, setActiveTab] = useState<"vectors" | "timeline" | "chokepoints">("vectors");

  // Anomaly Vector Data
  const vectorsData = [
    { label: "Circular GPS Drift Patterns", count: 18, percentage: 38, color: "bg-red-500", glow: "shadow-red-glow" },
    { label: "Kinematic AIS Jump / Teleportation", count: 12, percentage: 25, color: "bg-rose-500", glow: "" },
    { label: "Dark Fleet Transponder Blanking", count: 9, percentage: 19, color: "bg-amber-500", glow: "" },
    { label: "GNSS Carrier Jamming (L1/L2 Drop)", count: 5, percentage: 11, color: "bg-cyan-500", glow: "shadow-cyan-glow" },
    { label: "Cloned MMSI / Identity Spoofing", count: 3, percentage: 7, color: "bg-teal-500", glow: "" },
  ];

  // 24h Timeline Data (attacks per 2-hour window)
  const timelineData = [
    { time: "00:00", attacks: 2, jamming: 15 },
    { time: "02:00", attacks: 1, jamming: 12 },
    { time: "04:00", attacks: 3, jamming: 24 },
    { time: "06:00", attacks: 6, jamming: 48 },
    { time: "08:00", attacks: 9, jamming: 72 },
    { time: "10:00", attacks: 14, jamming: 95 },
    { time: "12:00", attacks: 11, jamming: 80 },
    { time: "14:00", attacks: 12, jamming: 88 },
    { time: "16:00", attacks: 16, jamming: 99 },
    { time: "18:00", attacks: 8, jamming: 60 },
    { time: "20:00", attacks: 5, jamming: 42 },
    { time: "22:00", attacks: 4, jamming: 30 },
  ];

  // Strategic Chokepoints Vulnerability
  const chokepoints = [
    { name: "Bab-el-Mandeb Strait", risk: 94, status: "CRITICAL SPOOFING", vessels: 142, icon: "🔴" },
    { name: "Strait of Hormuz", risk: 88, status: "GPS INTERFERENCE", vessels: 210, icon: "🟠" },
    { name: "Malacca Strait", risk: 62, status: "TRANSPONDER BLANKING", vessels: 384, icon: "🟡" },
    { name: "Singapore Strait", risk: 41, status: "NOMINAL TO MODERATE", vessels: 490, icon: "🟢" },
    { name: "Suez Canal Approach", risk: 78, status: "HIGH ELECTRONIC WARFARE", vessels: 195, icon: "🟠" },
  ];

  const maxAttacks = Math.max(...timelineData.map((d) => d.attacks));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Card 1: Spoofing Anomaly Vectors Breakdown */}
      <div className="rounded-2xl glass-card border border-cyan-500/25 shadow-md p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-cyan-500/20 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Anomaly Attack Vectors
                </h4>
                <p className="text-[10px] font-mono text-slate-500">
                  Last 48 Hours Breakdown
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded border border-cyan-300 font-bold">
              47 Detected
            </span>
          </div>

          {/* Vectors Bars */}
          <div className="space-y-3 mt-2">
            {vectorsData.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-700 font-semibold truncate max-w-[200px]">
                    {item.label}
                  </span>
                  <span className="font-mono text-cyan-800 font-bold text-[10px]">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200/90 rounded-full h-2 overflow-hidden border border-slate-300/80">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${item.color} ${item.glow}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/90 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>CLASSIFICATION ENGINE: v4.2-RF</span>
          <span className="text-emerald-700 font-bold">98.9% ACCURACY</span>
        </div>
      </div>

      {/* Card 2: 24h Attack Frequency Timeline */}
      <div className="rounded-2xl glass-card border border-cyan-500/25 shadow-md p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-cyan-500/20 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-800">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  24H Spoofing & Jamming Wave
                </h4>
                <p className="text-[10px] font-mono text-slate-500">
                  Temporal Density & Surge Analysis
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300 flex items-center gap-1 font-bold">
              <Zap className="w-2.5 h-2.5" /> Surge at 16:00
            </span>
          </div>

          {/* Bar / Column visualization */}
          <div className="h-40 flex items-end justify-between gap-1.5 pt-4 pb-1">
            {timelineData.map((d, index) => {
              const heightPercent = (d.attacks / maxAttacks) * 100;
              const isPeak = d.attacks === maxAttacks;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-slate-900 text-white border border-cyan-400 px-1.5 py-0.5 rounded text-[9px] font-mono whitespace-nowrap z-20 shadow-md">
                    {d.attacks} attacks ({d.jamming}% Jam)
                  </div>

                  {/* Bar */}
                  <div className="w-full bg-slate-200/90 rounded-t h-28 flex items-end overflow-hidden border-b border-slate-300">
                    <div
                      className={`w-full rounded-t transition-all duration-500 ${
                        isPeak
                          ? "bg-gradient-to-t from-red-600 to-rose-400 shadow-md"
                          : d.attacks > 8
                          ? "bg-gradient-to-t from-amber-500 to-yellow-400"
                          : "bg-gradient-to-t from-cyan-600 to-teal-500"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  {/* Label */}
                  <span className="text-[8px] font-mono text-slate-500 rotate-45 sm:rotate-0 mt-1 font-semibold">
                    {d.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/90 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600"></span> High
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-2"></span> Elevated
            <span className="w-2 h-2 rounded-full bg-cyan-600 ml-2"></span> Normal
          </span>
          <span className="text-cyan-800 font-bold">Peak: 16 incidents/hr</span>
        </div>
      </div>

      {/* Card 3: Strategic Chokepoints Vulnerability Index */}
      <div className="rounded-2xl glass-card border border-cyan-500/25 shadow-md p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-cyan-500/20 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-100 border border-red-300 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Chokepoints Vulnerability
                </h4>
                <p className="text-[10px] font-mono text-slate-500">
                  Corridor Risk & Congestion Index
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300 font-bold">
              2 CRITICAL
            </span>
          </div>

          {/* Chokepoint Items */}
          <div className="space-y-2.5 mt-1">
            {chokepoints.map((choke) => (
              <div
                key={choke.name}
                className="p-2 rounded-xl bg-white/90 border border-slate-200/90 hover:border-cyan-500/40 transition text-xs shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                    <span>{choke.icon}</span>
                    {choke.name}
                  </span>
                  <span
                    className={`font-mono font-bold text-[10px] ${
                      choke.risk > 80
                        ? "text-red-700"
                        : choke.risk > 60
                        ? "text-amber-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {choke.risk}% Risk
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span className="font-medium">{choke.status}</span>
                  <span>{choke.vessels} vessels</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/90 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>GEOFENCE: ARMED</span>
          <span className="text-cyan-800 font-bold">5 ZONES ENFORCED</span>
        </div>
      </div>
    </div>
  );
}
