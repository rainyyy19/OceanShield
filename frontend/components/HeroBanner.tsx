"use client";

import React from "react";
import { 
  ShieldAlert, 
  Cpu, 
  Radar, 
  Zap, 
  Download, 
  RefreshCw, 
  SlidersHorizontal,
  Layers,
  Sparkles
} from "lucide-react";

interface HeroBannerProps {
  onRefresh?: () => void;
  onExportIntel?: () => void;
  onSimulateThreat?: () => void;
}

export default function HeroBanner({
  onRefresh,
  onExportIntel,
  onSimulateThreat,
}: HeroBannerProps) {
  return (
    <div className="relative w-full rounded-2xl p-5 lg:p-6 mb-6 overflow-hidden glass-card border border-cyan-500/30 shadow-md">
      {/* Ambient background glow & radial gradient */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-teal-500/10 blur-2xl pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-red-500/10 blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Text & Badges */}
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-800 bg-cyan-100/90 border border-cyan-400/50 px-2.5 py-0.8 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3 text-cyan-600" />
              NEURAL MARITIME SURVEILLANCE v4.2
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-700 bg-slate-100/90 border border-slate-300 px-2.5 py-0.8 rounded-full font-medium">
              <Radar className="w-3 h-3 text-teal-600 animate-spin" style={{ animationDuration: "8s" }} />
              25 PRIORITY CORRIDOR VESSELS TRACKED
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-red-700 bg-red-100/90 border border-red-300 px-2.5 py-0.8 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              ACTIVE SPOOF CLUSTERS: BAB-EL-MANDEB & ARABIAN GULF
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            AI Maritime GPS/AIS Spoofing Investigation Platform
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-normal">
            Autonomous multi-sensor correlation cross-examining kinematic vessel trajectories against satellite AIS, coastal radar sweeps, and GNSS raw ephemeris data to neutralize dark fleet deception, circle-spoofing vectors, and phantom AIS teleportation.
          </p>
        </div>

        {/* Right: Operational Actions & Telemetry Summary */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[220px]">
          <button
            onClick={onSimulateThreat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs tracking-wider uppercase shadow-md border border-red-400/50 transition duration-200 transform hover:-translate-y-0.5"
          >
            <Zap className="w-4 h-4 text-white animate-bounce" />
            Simulate Spoof Attack
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExportIntel}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 font-bold text-[11px] border border-cyan-500/30 transition duration-150 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-cyan-600" />
              Export Intel
            </button>
            <button
              onClick={onRefresh}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold text-[11px] border border-teal-500/30 transition duration-150 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
              Sync Sensors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
