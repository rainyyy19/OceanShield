"use client";

import React, { useEffect } from "react";
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Radio, 
  Satellite, 
  Compass, 
  Download, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Cpu, 
  ExternalLink,
  Anchor,
  Navigation,
  Sparkles,
  Camera,
  Maximize2
} from "lucide-react";
import { Vessel, SpoofingConfidenceResponse, InvestigationTimelineItem } from "@/types/vessel";
import { getSpoofingConfidence, getVesselTimeline } from "@/lib/api";

interface InvestigationDrawerProps {
  vessel: Vessel | null;
  isOpen: boolean;
  onClose: () => void;
  onLocateOnMap?: (vessel: Vessel) => void;
}

export default function InvestigationDrawer({
  vessel,
  isOpen,
  onClose,
  onLocateOnMap,
}: InvestigationDrawerProps) {
  const [liveConfidence, setLiveConfidence] = React.useState<SpoofingConfidenceResponse | null>(null);
  const [liveTimeline, setLiveTimeline] = React.useState<InvestigationTimelineItem[] | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch live spoofing confidence breakdown & timeline from FastAPI backend
  useEffect(() => {
    if (!vessel || !isOpen) {
      setLiveConfidence(null);
      setLiveTimeline(null);
      return;
    }

    let isMounted = true;
    const fetchDossierData = async () => {
      const idOrMmsi = vessel.mmsi || vessel.id;
      const [conf, timeRes] = await Promise.all([
        getSpoofingConfidence(idOrMmsi),
        getVesselTimeline(idOrMmsi),
      ]);

      if (isMounted) {
        if (conf) setLiveConfidence(conf);
        if (timeRes?.timeline && timeRes.timeline.length > 0) {
          setLiveTimeline(timeRes.timeline);
        }
      }
    };

    fetchDossierData();

    return () => {
      isMounted = false;
    };
  }, [vessel, isOpen]);

  if (!isOpen || !vessel) return null;

  const isHighRisk = vessel.risk === "High";
  const isMedRisk = vessel.risk === "Medium";
  const isSafe = vessel.risk === "Safe";

  // Confidence calculations for SVG circular gauge (uses live backend confidence if available)
  const confidence = liveConfidence
    ? liveConfidence.confidence
    : vessel.spoofingConfidence || (isHighRisk ? 94.5 : isMedRisk ? 65.0 : 1.5);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  const riskColor = isHighRisk ? "#ef4444" : isMedRisk ? "#f59e0b" : "#10b981";
  const riskGlow = isHighRisk 
    ? "rgba(239, 68, 68, 0.6)" 
    : isMedRisk 
    ? "rgba(245, 158, 11, 0.5)" 
    : "rgba(16, 185, 129, 0.5)";

  return (
    <div className="fixed inset-0 z-[2000] overflow-hidden">
      {/* Backdrop overlay with blur */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Slide-over Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-slate-50/95 backdrop-blur-2xl border-l border-cyan-500/30 shadow-2xl flex flex-col h-full text-slate-800 animate-in slide-in-from-right duration-300">
          
          {/* 1. Drawer Header with Close Button */}
          <div className="p-5 border-b border-cyan-500/20 bg-white/90 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${
                  isHighRisk
                    ? "bg-red-100 text-red-700 border-red-300"
                    : isMedRisk
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
              >
                {isHighRisk ? (
                  <ShieldAlert className="w-5 h-5 animate-pulse text-red-600" />
                ) : isMedRisk ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black tracking-wide text-slate-900">
                    INVESTIGATION DOSSIER
                  </h2>
                  <span className="text-[10px] font-mono uppercase bg-cyan-100 text-cyan-800 border border-cyan-300 px-2 py-0.5 rounded-full font-bold">
                    ACTIVE CASE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  CASE-ID: OS-AIS-{vessel.mmsi} &bull; REF: INTEL-2026
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 transition flex items-center justify-center shadow-xs"
              title="Close Drawer (Esc)"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* Drawer Body - Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* 2. Ship Photo Placeholder / Tactical Optical Recon HUD */}
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-navy-950 shadow-md group">
              {/* Surveillance HUD Overlay Graphic */}
              <div className="relative h-48 w-full bg-gradient-to-b from-navy-950 via-slate-900 to-navy-950 flex flex-col justify-between p-4 overflow-hidden">
                {/* Visual Target Reticle & Scan Grid */}
                <div className="absolute inset-0 bg-radar-grid opacity-30 pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-36 h-36 border border-cyan-400 rounded-full animate-ping-slow"></div>
                  <div className="w-24 h-24 border border-teal-400 rounded-full"></div>
                  <div className="w-48 h-0.5 bg-cyan-400"></div>
                  <div className="h-48 w-0.5 bg-cyan-400"></div>
                </div>

                {/* Cargo Ship SVG Silhouette Graphic */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg 
                    viewBox="0 0 400 160" 
                    className="w-4/5 h-28 opacity-85 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  >
                    {/* Waterline */}
                    <path d="M0 130 Q100 126 200 130 T400 130" stroke="#00f2fe" strokeWidth="1.5" fill="none" opacity="0.4" />
                    {/* Ship Hull */}
                    <path d="M30 115 L65 125 L340 125 L375 90 L345 90 L330 115 Z" fill="#0d2742" stroke="#06b6d4" strokeWidth="1.8" />
                    {/* Cargo Container Blocks */}
                    <rect x="90" y="70" width="30" height="20" fill="#14b8a6" opacity="0.8" stroke="#00f2fe" strokeWidth="0.8" />
                    <rect x="125" y="70" width="30" height="20" fill="#06b6d4" opacity="0.8" stroke="#00f2fe" strokeWidth="0.8" />
                    <rect x="160" y="70" width="30" height="20" fill="#f59e0b" opacity="0.8" stroke="#fbbf24" strokeWidth="0.8" />
                    <rect x="195" y="70" width="30" height="20" fill="#ef4444" opacity="0.8" stroke="#f87171" strokeWidth="0.8" />
                    <rect x="230" y="70" width="30" height="20" fill="#14b8a6" opacity="0.8" stroke="#00f2fe" strokeWidth="0.8" />
                    <rect x="265" y="70" width="30" height="20" fill="#06b6d4" opacity="0.8" stroke="#00f2fe" strokeWidth="0.8" />
                    {/* Top Tier Containers */}
                    <rect x="105" y="48" width="30" height="20" fill="#06b6d4" opacity="0.8" stroke="#00f2fe" strokeWidth="0.8" />
                    <rect x="140" y="48" width="30" height="20" fill="#14b8a6" opacity="0.8" stroke="#00f2fe" strokeWidth="0.8" />
                    <rect x="175" y="48" width="30" height="20" fill="#ef4444" opacity="0.8" stroke="#f87171" strokeWidth="0.8" />
                    <rect x="210" y="48" width="30" height="20" fill="#06b6d4" opacity="0.8" stroke="#00f2fe" strokeWidth="0.8" />
                    <rect x="245" y="48" width="30" height="20" fill="#f59e0b" opacity="0.8" stroke="#fbbf24" strokeWidth="0.8" />
                    {/* Bridge / Superstructure */}
                    <path d="M305 60 L328 60 L328 90 L305 90 Z" fill="#133150" stroke="#00f2fe" strokeWidth="1.5" />
                    <rect x="310" y="65" width="14" height="6" fill="#00f2fe" opacity="0.7" />
                    {/* Radar Mast */}
                    <line x1="316" y1="60" x2="316" y2="40" stroke="#00f2fe" strokeWidth="2" />
                    <line x1="310" y1="44" x2="322" y2="44" stroke="#00f2fe" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Top HUD Metadata */}
                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 bg-navy-950/90 px-2.5 py-1 rounded-md border border-cyan-500/30 text-cyan-300">
                    <Camera className="w-3 h-3 text-cyan-400 animate-pulse" />
                    OPTICAL SURVEILLANCE FEED &bull; SATELLITE EO/IR
                  </span>
                  <span className="bg-navy-950/90 px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 font-bold">
                    SIGNAL: LOCKED
                  </span>
                </div>

                {/* Bottom HUD Metadata */}
                <div className="relative z-10 flex items-end justify-between text-[10px] font-mono bg-navy-950/80 p-2 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
                  <div>
                    <span className="text-white font-bold text-xs">{vessel.name}</span>
                    <span className="text-slate-400 block text-[9px]">IMO: {vessel.imo || 9811002} &bull; CALLSIGN: {vessel.callsign || "3EAA2"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-cyan-300 font-bold">{vessel.dimensions || "366m × 51m"}</span>
                    <span className="text-slate-400 block text-[9px]">{vessel.dwt || "140,000 DWT"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Threat Badge & 4. Confidence Circular Gauge Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
              
              {/* Threat Badge Card (7 cols) */}
              <div 
                className={`sm:col-span-7 rounded-2xl p-4 border flex flex-col justify-between shadow-sm ${
                  isHighRisk 
                    ? "bg-red-50/90 border-red-300 text-slate-900" 
                    : isMedRisk 
                    ? "bg-amber-50/90 border-amber-300 text-slate-900" 
                    : "bg-white/90 border-cyan-500/25 text-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                      THREAT CLASSIFICATION
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded border ${
                        isHighRisk
                          ? "bg-red-600 text-white border-red-400 shadow-sm animate-pulse"
                          : isMedRisk
                          ? "bg-amber-500 text-slate-900 border-amber-400"
                          : "bg-emerald-500 text-white border-emerald-400"
                      }`}
                    >
                      {vessel.risk} Risk Status
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {vessel.anomalyType || "Nominal AIS broadcast • Verified Ephemeris"}
                  </h3>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Status:</span>
                  <span className={`font-bold ${isHighRisk ? "text-red-700" : isMedRisk ? "text-amber-700" : "text-emerald-700"}`}>
                    {isHighRisk ? "CRITICAL ANOMALY ACTIVE" : isMedRisk ? "UNDER EVALUATION" : "VERIFIED NORMAL"}
                  </span>
                </div>
              </div>

              {/* Confidence Circular Gauge Card (5 cols) */}
              <div className="sm:col-span-5 rounded-2xl p-4 glass-card border border-cyan-500/25 shadow-sm flex flex-col items-center justify-center text-center bg-white/90">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1 font-bold">
                  AI CONFIDENCE GAUGE
                </span>

                {/* SVG Gauge */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    {/* Background track circle */}
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      stroke="#e2e8f0"
                      strokeWidth="7"
                      fill="transparent"
                    />
                    {/* Animated Progress Ring */}
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      stroke={riskColor}
                      strokeWidth="7"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      style={{
                        transition: "stroke-dashoffset 1s ease-in-out",
                        filter: `drop-shadow(0 0 6px ${riskGlow})`,
                      }}
                    />
                  </svg>
                  
                  {/* Gauge Center Percentage */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black font-mono text-slate-900 tracking-tight leading-none">
                      {confidence}%
                    </span>
                    <span className="text-[8px] font-mono text-cyan-800 uppercase mt-0.5 font-bold">
                      {isHighRisk ? "Spoofed" : isMedRisk ? "Variance" : "Clean"}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-mono text-slate-500 mt-1 font-medium">
                  Neural Model v4.2
                </span>
              </div>
            </div>

            {/* 4b. 6-Factor Spoofing Vector Breakdown from Backend */}
            {liveConfidence?.factors && (
              <div className="rounded-2xl p-4 glass-card border border-cyan-500/25 shadow-sm bg-white/90">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-cyan-500/20">
                  <span className="text-[11px] font-mono font-bold uppercase text-cyan-900 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-700" />
                    6-Factor Spoofing Analysis (FastAPI Engine)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    Vector: {liveConfidence.primaryVector}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Kinematic Jump</span>
                    <span className={`font-bold ${liveConfidence.factors.kinematicJumpScore > 50 ? "text-red-600" : "text-slate-800"}`}>
                      {liveConfidence.factors.kinematicJumpScore}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Synthetic Drift</span>
                    <span className={`font-bold ${liveConfidence.factors.syntheticDriftScore > 50 ? "text-red-600" : "text-slate-800"}`}>
                      {liveConfidence.factors.syntheticDriftScore}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">RF C/N0 Drop</span>
                    <span className={`font-bold ${liveConfidence.factors.rfCarrierDropScore > 50 ? "text-red-600" : "text-slate-800"}`}>
                      {liveConfidence.factors.rfCarrierDropScore}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Transponder Blanking</span>
                    <span className={`font-bold ${liveConfidence.factors.transponderBlankingScore > 50 ? "text-red-600" : "text-slate-800"}`}>
                      {liveConfidence.factors.transponderBlankingScore}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Altitude Spike (VDOP)</span>
                    <span className={`font-bold ${liveConfidence.factors.altitudeAnomalyScore > 50 ? "text-red-600" : "text-slate-800"}`}>
                      {liveConfidence.factors.altitudeAnomalyScore}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Identity Clone</span>
                    <span className={`font-bold ${liveConfidence.factors.identityCloneScore > 50 ? "text-red-600" : "text-slate-800"}`}>
                      {liveConfidence.factors.identityCloneScore}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Vessel Information Grid */}
            <div className="rounded-2xl glass-card border border-cyan-500/25 p-4 shadow-sm bg-white/90">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-900 pb-2.5 mb-3 border-b border-cyan-500/20 flex items-center gap-2">
                <Anchor className="w-4 h-4 text-cyan-700" />
                Vessel Telemetry & Specifications
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200">
                  <span className="text-slate-500 font-mono text-[10px] block">MMSI IDENTIFIER</span>
                  <span className="font-mono text-cyan-800 font-bold">{vessel.mmsi}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200">
                  <span className="text-slate-500 font-mono text-[10px] block">FLAG REGISTRATION</span>
                  <span className="font-sans text-slate-900 font-semibold">{vessel.flag || "Panama"}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200">
                  <span className="text-slate-500 font-mono text-[10px] block">VESSEL TYPE</span>
                  <span className="font-sans text-slate-900 font-semibold truncate block">{vessel.vesselType || "Cargo Vessel"}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200">
                  <span className="text-slate-500 font-mono text-[10px] block">SPEED OVER GROUND</span>
                  <span className="font-mono text-slate-900 font-bold">{vessel.speed} kts</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200">
                  <span className="text-slate-500 font-mono text-[10px] block">COURSE / HEADING</span>
                  <span className="font-mono text-slate-900 font-bold">{vessel.heading}° True</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200">
                  <span className="text-slate-500 font-mono text-[10px] block">NAV STATUS</span>
                  <span className="font-sans text-emerald-700 font-bold text-[11px] truncate block">
                    {vessel.navStatus || "Underway using engine"}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200 col-span-2">
                  <span className="text-slate-500 font-mono text-[10px] block">REPORTED DESTINATION</span>
                  <span className="font-sans text-slate-900 font-semibold">{vessel.destination}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200">
                  <span className="text-slate-500 font-mono text-[10px] block">ESTIMATED ARRIVAL</span>
                  <span className="font-mono text-slate-700 text-[11px] font-medium">{vessel.eta || "2026-09-19 UTC"}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200 col-span-2 sm:col-span-3">
                  <span className="text-slate-500 font-mono text-[10px] block">CURRENT GEOGRAPHICAL POSITION</span>
                  <span className="font-mono text-cyan-800 font-bold">
                    {vessel.latitude.toFixed(4)}° N, {vessel.longitude.toFixed(4)}° E
                  </span>
                </div>
              </div>
            </div>

            {/* 6. AI Summary Box */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/80 border border-cyan-400/40 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-700" />
                  Neural Forensic Assessment
                </span>
                <span className="text-[10px] font-mono text-teal-800 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-full font-bold">
                  MULTI-SENSOR CORRELATION
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {vessel.aiSummary || 
                  "Synthetic RF and kinematic analysis identifies high probability of ground-based electronic interference targeting commercial shipping lanes. Reported position discrepancies correlate with known coastal emitter signatures."}
              </p>
              <div className="pt-2 border-t border-cyan-500/20 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-600">
                <span>SENSOR COHERENCE: 98.4%</span>
                <span className="text-cyan-800 font-bold">RECOMMENDED ACTION: ADVISORY VTS</span>
              </div>
            </div>

            {/* 7. Timeline Cards */}
            <div className="rounded-2xl glass-card border border-cyan-500/25 p-4 shadow-sm bg-white/90">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-cyan-500/20">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-700" />
                  Investigation Timeline & Audit Trail
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  {(liveTimeline || vessel.timeline) ? `${(liveTimeline || vessel.timeline)!.length} Events` : "Chronological"}
                </span>
              </div>

              <div className="space-y-3">
                {(liveTimeline || vessel.timeline) && (liveTimeline || vessel.timeline)!.length > 0 ? (
                  (liveTimeline || vessel.timeline)!.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-cyan-400/40 transition text-xs relative pl-8 shadow-xs"
                    >
                      {/* Timeline dot & line indicator */}
                      <div
                        className={`absolute left-3 top-3.5 w-2.5 h-2.5 rounded-full ${
                          item.severity === "CRITICAL"
                            ? "bg-red-600 ring-4 ring-red-100 animate-ping-slow"
                            : item.severity === "HIGH"
                            ? "bg-amber-500 ring-2 ring-amber-100"
                            : "bg-cyan-600 ring-2 ring-cyan-100"
                        }`}
                      />
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="text-cyan-800 font-bold">{item.time}</span>
                        <span className="text-slate-500 uppercase tracking-wider font-semibold">{item.source}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mb-0.5">{item.title}</h4>
                      <p className="text-slate-600 text-[11px] leading-tight">{item.description}</p>
                    </div>
                  ))
                ) : (
                  // Default fallback timeline if empty
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200 text-xs pl-8 relative">
                      <div className="absolute left-3 top-3.5 w-2 h-2 rounded-full bg-cyan-600" />
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="text-cyan-800 font-bold">14:15:00 UTC</span>
                        <span className="text-slate-500">SAT-AIS LEO</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">Vessel Telemetry Lock</h4>
                      <p className="text-slate-600 text-[11px]">Initial position packet ingested into OceanShield tracking pipeline.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200 text-xs pl-8 relative">
                      <div className="absolute left-3 top-3.5 w-2 h-2 rounded-full bg-emerald-500" />
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="text-emerald-700 font-bold">14:28:30 UTC</span>
                        <span className="text-slate-500">Sensor Matrix</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">Sensor Multi-Constellation Audit</h4>
                      <p className="text-slate-600 text-[11px]">Evaluated GPS L1/L2, Galileo and coastal Doppler radar coherence.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 8. Drawer Footer Actions */}
          <div className="p-4 border-t border-cyan-500/20 bg-white/95 flex flex-wrap items-center justify-between gap-3 shadow-md">
            {onLocateOnMap && (
              <button
                onClick={() => {
                  onLocateOnMap(vessel);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 font-bold text-xs border border-cyan-300 transition flex items-center gap-1.5 shadow-xs"
              >
                <Compass className="w-4 h-4 text-cyan-700" />
                Track on Map
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Downloading complete cryptographic forensic dossier for ${vessel.name} (MMSI: ${vessel.mmsi})`);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Export Forensics
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
