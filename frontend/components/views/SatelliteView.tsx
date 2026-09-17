"use client";

import React from "react";
import { Satellite, Activity, Wifi, CheckCircle2, Clock, Globe2, Radio } from "lucide-react";

export default function SatelliteView() {
  const constellations = [
    { name: "Spire Global LEMUR-2 Constellation", satellites: 28, band: "VHF Marine L-Band", packetRate: "14,820 msg/sec", latency: "1.4s", status: "HEALTHY", statusColor: "text-emerald-400" },
    { name: "Iridium NEXT Cross-Linked LEO Mesh", satellites: 66, band: "L-Band 1621 MHz", packetRate: "11,200 msg/sec", latency: "0.9s", status: "OPTIMAL", statusColor: "text-emerald-400" },
    { name: "exactEarth / exactView RT", satellites: 18, band: "VHF Marine A/B", packetRate: "4,650 msg/sec", latency: "2.1s", status: "HEALTHY", statusColor: "text-emerald-400" },
    { name: "ORBCOMM Generation 2 (OG2)", satellites: 12, band: "VHF Downlink", packetRate: "2,400 msg/sec", latency: "3.5s", status: "DEGRADED (ORBIT DRIFT)", statusColor: "text-amber-400" },
  ];

  const upcomingPasses = [
    { satId: "LEMUR-2-SP-104", aoi: "Bab-el-Mandeb & Southern Red Sea", elev: "78° Max Elevation", window: "In 4 min 12s", duration: "11m 40s" },
    { satId: "IRIDIUM-NEXT-142", aoi: "Strait of Hormuz & Arabian Sea", elev: "84° Max Elevation", window: "In 9 min 30s", duration: "14m 10s" },
    { satId: "EXACTVIEW-9", aoi: "Malacca Strait & Singapore Approaches", elev: "65° Max Elevation", window: "In 16 min 45s", duration: "9m 50s" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-2xl p-6 glass-card border border-cyan-500/25 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-cyan-700" />
                SPACE SEGMENT & SATELLITE AIS MESH
              </span>
              <span className="text-xs font-mono text-emerald-700 font-bold">
                124 LEO SATELLITES CORRELATED
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Satellite AIS Constellation & Ephemeris Telemetry
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Global Low Earth Orbit (LEO) satellite constellation telemetry cross-referencing RF Doppler shifts with reported vessel kinematics to ensure zero single-point-of-failure spoofing resilience.
            </p>
          </div>
        </div>
      </div>

      {/* Constellation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl glass-card border border-cyan-500/25 p-5 shadow-md space-y-4 bg-white/90">
          <h3 className="text-sm font-black text-slate-900 tracking-wide pb-2 border-b border-cyan-500/20 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-700" />
              Active LEO Constellations Status
            </span>
            <span className="text-[10px] font-mono text-cyan-800 font-bold">MEAN LATENCY: 1.8S</span>
          </h3>

          <div className="space-y-3">
            {constellations.map((c) => (
              <div key={c.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{c.name}</span>
                  <span className={`font-mono font-bold text-[11px] ${c.statusColor}`}>{c.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-500 mt-2">
                  <div>Satellites: <span className="text-cyan-800 font-bold">{c.satellites}</span></div>
                  <div>Band: <span className="text-slate-700">{c.band}</span></div>
                  <div>Packet Rate: <span className="text-teal-700 font-bold">{c.packetRate}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Orbital Passes */}
        <div className="rounded-2xl glass-card border border-cyan-500/25 p-5 shadow-md space-y-4 bg-white/90">
          <h3 className="text-sm font-black text-slate-900 tracking-wide pb-2 border-b border-cyan-500/20 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-700" />
              Chokepoint Satellite Overflight Schedule
            </span>
            <span className="text-[10px] font-mono text-teal-800 font-bold">NEXT 30 MIN</span>
          </h3>

          <div className="space-y-3">
            {upcomingPasses.map((pass) => (
              <div key={pass.satId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-cyan-800">{pass.satId}</span>
                  <span className="font-mono text-emerald-700 font-bold text-[11px] bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    {pass.window}
                  </span>
                </div>
                <div className="text-slate-800 text-xs mt-1 mb-1 font-semibold">{pass.aoi}</div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Pass Duration: <strong className="text-slate-700">{pass.duration}</strong></span>
                  <span>{pass.elev}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
