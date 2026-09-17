"use client";

import React from "react";
import { Radio, Activity, Zap, AlertTriangle, ShieldCheck, Wifi, Sliders } from "lucide-react";

export default function SpectrumView() {
  const bands = [
    { name: "GPS L1 (1575.42 MHz)", snr: "32.4 dB-Hz", status: "INTERFERENCE DETECTED", statusColor: "text-red-400", level: 68, color: "bg-red-500" },
    { name: "GPS L2 (1227.60 MHz)", snr: "28.1 dB-Hz", status: "MODERATE JAMMING", statusColor: "text-amber-400", level: 55, color: "bg-amber-500" },
    { name: "GPS L5 (1176.45 MHz)", snr: "46.8 dB-Hz", status: "NOMINAL", statusColor: "text-emerald-400", level: 92, color: "bg-emerald-500" },
    { name: "Galileo E1 (1575.42 MHz)", snr: "44.2 dB-Hz", status: "LOCKED & VERIFIED", statusColor: "text-emerald-400", level: 88, color: "bg-teal-500" },
    { name: "GLONASS G1 (1602.00 MHz)", snr: "22.5 dB-Hz", status: "SEVERE NOISE INJECTION", statusColor: "text-red-400", level: 42, color: "bg-red-500" },
    { name: "BeiDou B1C (1575.42 MHz)", snr: "45.0 dB-Hz", status: "NOMINAL", statusColor: "text-emerald-400", level: 90, color: "bg-cyan-500" },
  ];

  const emitters = [
    { id: "em-01", location: "Southern Red Sea Coast (Yemen)", freq: "1575.42 MHz", eirp: "~50 Watts", type: "Chirp Jammer & Circular Spoof", confidence: "98.4%" },
    { id: "em-02", location: "Bandar Abbas Naval Base Sector", freq: "1575.42 & 1602 MHz", eirp: "~120 Watts", type: "Synchronous Multi-target Spoof", confidence: "96.2%" },
    { id: "em-03", location: "Malacca Strait Mobile Vessel Transceiver", freq: "VHF Ch 87B (161.975 MHz)", eirp: "~25 Watts", type: "AIS Power Overdrive / Phantom Injection", confidence: "94.8%" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="rounded-2xl p-6 glass-card border border-cyan-500/25 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-700 animate-pulse" />
                RF SPECTRUM & GNSS JAMMING SURVEILLANCE
              </span>
              <span className="text-xs font-mono text-amber-700 font-bold">
                L-BAND NOISE ELEVATED (+14 dB)
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Electronic Warfare & RF Signal Integrity Analyzer
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Multi-band Carrier-to-Noise spectral monitoring tracking wideband GNSS jamming, chirp interference, and synthetic pseudo-satellite transmitters across littoral chokepoint corridors.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Band Spectral Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl glass-card border border-cyan-500/25 p-5 shadow-md space-y-4 bg-white/90">
          <h3 className="text-sm font-black text-slate-900 tracking-wide pb-2 border-b border-cyan-500/20 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-700" />
              Multi-Constellation Carrier Quality (C/N0)
            </span>
            <span className="text-[10px] font-mono text-cyan-800 font-bold">REAL-TIME SDR FEED</span>
          </h3>

          <div className="space-y-3.5">
            {bands.map((band) => (
              <div key={band.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-slate-900 font-bold">{band.name}</span>
                  <span className={`font-mono font-bold text-[11px] ${band.statusColor}`}>{band.status}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1.5 border border-slate-300">
                  <div className={`h-full rounded-full ${band.color}`} style={{ width: `${band.level}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Carrier SNR: <strong className="text-slate-800">{band.snr}</strong></span>
                  <span>Threshold: 30 dB-Hz</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detected Ground Emitters */}
        <div className="rounded-2xl glass-card border border-cyan-500/25 p-5 shadow-md flex flex-col justify-between bg-white/90">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-wide pb-2 border-b border-cyan-500/20 flex items-center justify-between mb-4">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-600" />
                Triangulated Ground Electronic Warfare Emitters
              </span>
              <span className="text-[10px] font-mono text-red-700 font-bold">3 IDENTIFIED</span>
            </h3>

            <div className="space-y-3">
              {emitters.map((em) => (
                <div key={em.id} className="p-3.5 rounded-xl bg-red-50/85 border border-red-300 text-xs shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">{em.location}</span>
                    <span className="text-red-700 font-mono font-black text-[10px] bg-red-100 px-1.5 py-0.5 rounded border border-red-300">
                      {em.confidence} CONF
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700 mt-2 mb-1.5 font-medium">
                    <div>Freq: <span className="text-cyan-800 font-bold">{em.freq}</span></div>
                    <div>Est. EIRP: <span className="text-amber-800 font-bold">{em.eirp}</span></div>
                  </div>
                  <p className="text-[11px] text-slate-600 font-sans">{em.type}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>TRIANGULATION: TDOA / FDOA MULTI-SATELLITE PASS</span>
            <span className="text-cyan-800 font-bold">ACCURACY: &plusmn;2.4 NM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
