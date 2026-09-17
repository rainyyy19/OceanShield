"use client";

import React, { useState } from "react";
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  Activity, 
  Download, 
  FileCheck, 
  ExternalLink, 
  Compass, 
  Navigation, 
  Satellite, 
  Cpu, 
  Copy, 
  Check, 
  Eye, 
  Crosshair
} from "lucide-react";
import { Vessel } from "@/types/vessel";

interface VesselDetailModalProps {
  vessel: Vessel | null;
  onClose: () => void;
  onLocateOnMap?: (vessel: Vessel) => void;
}

export default function VesselDetailModal({
  vessel,
  onClose,
  onLocateOnMap,
}: VesselDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"forensics" | "rf" | "advisory">("forensics");

  if (!vessel) return null;

  const isHighRisk = vessel.risk === "High";
  const isMedRisk = vessel.risk === "Medium";

  const copyMmsi = () => {
    navigator.clipboard.writeText(vessel.mmsi.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-card rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyan-500/20 bg-navy-950/70">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg ${
                isHighRisk
                  ? "bg-red-500/20 text-red-400 border-red-500/40 shadow-red-glow"
                  : isMedRisk
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {isHighRisk ? (
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              ) : isMedRisk ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white">
                  {vessel.name}
                </h2>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    isHighRisk
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : isMedRisk
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {vessel.risk} Risk Status
                </span>
              </div>
              <p className="text-xs text-cyan-400 font-mono">
                {vessel.vesselType || "Commercial Cargo"} &bull; Flag: {vessel.flag || "International"} &bull; DWT: {vessel.dwt || "120,000"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition border border-transparent hover:border-cyan-500/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-cyan-500/15 bg-navy-950/40 text-xs font-mono">
          <button
            onClick={() => setActiveTab("forensics")}
            className={`px-3 py-1.5 rounded-lg transition font-bold ${
              activeTab === "forensics"
                ? "bg-cyan-500 text-navy-950 shadow-cyan-glow"
                : "text-slate-400 hover:text-white hover:bg-navy-800"
            }`}
          >
            Forensic Telemetry
          </button>
          <button
            onClick={() => setActiveTab("rf")}
            className={`px-3 py-1.5 rounded-lg transition font-bold ${
              activeTab === "rf"
                ? "bg-cyan-500 text-navy-950 shadow-cyan-glow"
                : "text-slate-400 hover:text-white hover:bg-navy-800"
            }`}
          >
            GNSS / Ephemeris Verification
          </button>
          <button
            onClick={() => setActiveTab("advisory")}
            className={`px-3 py-1.5 rounded-lg transition font-bold ${
              activeTab === "advisory"
                ? "bg-cyan-500 text-navy-950 shadow-cyan-glow"
                : "text-slate-400 hover:text-white hover:bg-navy-800"
            }`}
          >
            Actionable Advisory
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Fast telemetry overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-xl bg-navy-950/70 border border-cyan-500/15">
              <span className="text-slate-400 font-mono text-[10px] block">MMSI IDENTIFIER</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-cyan-300 font-bold text-xs">{vessel.mmsi}</span>
                <button onClick={copyMmsi} className="text-slate-400 hover:text-cyan-400">
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-navy-950/70 border border-cyan-500/15">
              <span className="text-slate-400 font-mono text-[10px] block">SPEED OVER GROUND</span>
              <span className="font-mono text-white font-bold text-xs mt-1 block">
                {vessel.speed} kts
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-navy-950/70 border border-cyan-500/15">
              <span className="text-slate-400 font-mono text-[10px] block">COURSE / HEADING</span>
              <span className="font-mono text-white font-bold text-xs mt-1 block">
                {vessel.heading}° True
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-navy-950/70 border border-cyan-500/15">
              <span className="text-slate-400 font-mono text-[10px] block">REPORTED DESTINATION</span>
              <span className="font-sans text-slate-200 font-semibold text-xs mt-1 truncate block">
                {vessel.destination}
              </span>
            </div>
          </div>

          {/* Forensic details panel */}
          {activeTab === "forensics" && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border ${
                  isHighRisk
                    ? "bg-red-950/30 border-red-500/40"
                    : isMedRisk
                    ? "bg-amber-950/20 border-amber-500/30"
                    : "bg-navy-950/70 border-cyan-500/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
                    <Crosshair className="w-4 h-4 text-cyan-400" />
                    Detected Anomaly Vector
                  </span>
                  <span
                    className={`font-mono font-black px-2 py-0.5 rounded text-[11px] ${
                      isHighRisk
                        ? "bg-red-500 text-white"
                        : isMedRisk
                        ? "bg-amber-500 text-navy-950"
                        : "bg-emerald-500 text-navy-950"
                    }`}
                  >
                    {vessel.spoofingConfidence ? `${vessel.spoofingConfidence}% Spoofing Confidence` : "Normal"}
                  </span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed font-medium">
                  {vessel.anomalyType || "Nominal kinematic trajectory. No false coordinates or spoofing anomalies detected."}
                </p>
              </div>

              {/* Kinematics vs Ephemeris Graph Simulation */}
              <div className="p-4 rounded-xl bg-navy-950/80 border border-cyan-500/20">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  Reported AIS Speed vs Coastal Radar Doppler (kts)
                </h4>
                <div className="h-28 flex items-end gap-2 pt-2">
                  {[12, 14, 15, 14, 16, 18, 42, 15, 14, 15].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-navy-900 rounded-t h-20 flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t transition-all ${
                            val > 30 ? "bg-red-500 animate-pulse shadow-red-glow" : "bg-cyan-500/70"
                          }`}
                          style={{ height: `${(val / 45) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">t-{10 - i}m</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-2 flex items-center justify-between">
                  <span>Cyan: Reported AIS Position Rate</span>
                  <span className="text-red-400 font-bold">Red Peak: Kinematic Impossibility Spike (42 kts)</span>
                </p>
              </div>
            </div>
          )}

          {activeTab === "rf" && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-navy-950/80 border border-cyan-500/20 space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  Multi-Constellation Carrier Quality Check
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">GPS L1/L2 SNR (C/N0)</span>
                    <span className="text-emerald-400 font-bold">46.2 dB-Hz (Normal)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">HDOP (Horizontal Dilution)</span>
                    <span className="text-amber-400 font-bold">4.8 (Elevated Uncertainty)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Sat-AIS Reception Latency</span>
                    <span className="text-cyan-300 font-bold">3.2 seconds</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Coastal Radar Cross-Check</span>
                    <span className="text-red-400 font-bold">Offset by 14.8 nm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "advisory" && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-navy-950/80 border border-cyan-500/20 text-slate-300 space-y-2">
                <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Recommended Tactical Response
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                  <li>Notify Port Maritime Operations Center (VTS) of verified synthetic drift pattern.</li>
                  <li>Cross-examine vessel master via VHF Ch-16 to confirm visual dead reckoning position.</li>
                  <li>Tag vessel MMSI {vessel.mmsi} with automated anti-collision alert across littoral chokepoints.</li>
                  <li>Transmit raw RF recording to regional naval cyber defense unit for electronic warfare attribution.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-cyan-500/20 bg-navy-950/80">
          <div className="flex items-center gap-2">
            {onLocateOnMap && (
              <button
                onClick={() => {
                  onLocateOnMap(vessel);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-navy-800 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                Track On Map
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs font-semibold transition"
            >
              Close Dossier
            </button>
            <button
              onClick={() => {
                alert(`Exporting forensic evidence packet for vessel ${vessel.name} (MMSI: ${vessel.mmsi})`);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-navy-950 font-bold text-xs shadow-cyan-glow transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download Forensics Packet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
