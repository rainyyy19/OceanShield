"use client";

import React, { useState } from "react";
import { 
  Crosshair, 
  Search, 
  Download, 
  Filter, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight,
  Shield,
  FileSpreadsheet
} from "lucide-react";
import { Vessel, RiskLevel } from "@/types/vessel";

interface InvestigationsTableProps {
  vessels: Vessel[];
  onSelectVessel: (vessel: Vessel) => void;
  onOpenForensicModal: (vessel: Vessel) => void;
}

export default function InvestigationsTable({
  vessels,
  onSelectVessel,
  onOpenForensicModal,
}: InvestigationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filter vessels based on search and status
  const filteredVessels = vessels.filter((vessel) => {
    const matchesSearch =
      vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.mmsi.toString().includes(searchTerm) ||
      (vessel.anomalyType && vessel.anomalyType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      vessel.destination.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "HIGH_RISK") return vessel.risk === "High";
    if (statusFilter === "MEDIUM_RISK") return vessel.risk === "Medium";
    if (statusFilter === "SAFE") return vessel.risk === "Safe";
    if (statusFilter === "SPOOF_CONFIRMED") return (vessel.spoofingConfidence || 0) > 85;

    return true;
  });

  const exportCSV = () => {
    const headers = "ID,Name,MMSI,Risk,Speed,Heading,Lat,Lng,Destination,Anomaly,Confidence\n";
    const rows = filteredVessels
      .map(
        (v) =>
          `"${v.id}","${v.name}","${v.mmsi}","${v.risk}",${v.speed},${v.heading},${v.latitude},${v.longitude},"${v.destination}","${v.anomalyType || "None"}",${v.spoofingConfidence || 0}%`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oceanshield-investigations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="rounded-2xl glass-card border border-cyan-500/25 shadow-md p-5 mb-6">
      {/* Top Header & Search/Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-wide flex items-center gap-2">
                Recent Spoofing Investigations
                <span className="text-xs font-mono text-cyan-800 bg-cyan-100 border border-cyan-300 px-2 py-0.5 rounded-full font-bold">
                  {filteredVessels.length} Cases
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Cross-referenced AIS Kinematics & GNSS Signal Telemetry Log
              </p>
            </div>
          </div>
        </div>

        {/* Search, Filter Pills & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-700" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by vessel, MMSI, anomaly..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white/95 border border-cyan-500/30 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono w-56 shadow-xs"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-white/95 p-1 rounded-xl border border-slate-300 text-[11px] font-mono shadow-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2 py-1 rounded-lg transition ${
                statusFilter === "ALL"
                  ? "bg-cyan-600 text-white font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("HIGH_RISK")}
              className={`px-2 py-1 rounded-lg transition ${
                statusFilter === "HIGH_RISK"
                  ? "bg-red-600 text-white font-bold"
                  : "text-red-700 hover:bg-red-50"
              }`}
            >
              High Risk ({vessels.filter((v) => v.risk === "High").length})
            </button>
            <button
              onClick={() => setStatusFilter("SPOOF_CONFIRMED")}
              className={`px-2 py-1 rounded-lg transition ${
                statusFilter === "SPOOF_CONFIRMED"
                  ? "bg-amber-500 text-slate-900 font-bold"
                  : "text-amber-800 hover:bg-amber-50"
              }`}
            >
              Spoof Confirmed
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-cyan-50 text-cyan-800 font-mono font-bold text-xs border border-cyan-500/30 transition shadow-xs"
            title="Download CSV Dossier"
          >
            <Download className="w-3.5 h-3.5 text-cyan-700" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-cyan-500/20 bg-white/80 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/90 text-slate-700 font-mono uppercase text-[10px] tracking-wider border-b border-cyan-500/20 font-bold">
            <tr>
              <th className="py-3 px-4">Vessel & Type</th>
              <th className="py-3 px-4">MMSI</th>
              <th className="py-3 px-4">Risk Level</th>
              <th className="py-3 px-4">Detected Anomaly Vector</th>
              <th className="py-3 px-4">Speed / Heading</th>
              <th className="py-3 px-4">Coordinates (Lat / Lng)</th>
              <th className="py-3 px-4">Destination</th>
              <th className="py-3 px-4 text-center">AI Confidence</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/90 font-sans">
            {filteredVessels.map((vessel) => {
              const isHighRisk = vessel.risk === "High";
              const isMedRisk = vessel.risk === "Medium";

              return (
                <tr
                  key={vessel.id}
                  className={`hover:bg-cyan-50/70 transition duration-150 group ${
                    isHighRisk ? "bg-red-50/50" : isMedRisk ? "bg-amber-50/30" : ""
                  }`}
                >
                  {/* Vessel Name & Type */}
                  <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-cyan-800">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isHighRisk
                            ? "bg-red-600 animate-ping"
                            : isMedRisk
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <div>
                        <span className="block font-bold">{vessel.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {vessel.vesselType || "Cargo Vessel"} &bull; {vessel.flag}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* MMSI */}
                  <td className="py-3 px-4 font-mono text-cyan-800 text-xs font-bold">
                    {vessel.mmsi}
                  </td>

                  {/* Risk Badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                        isHighRisk
                          ? "bg-red-100 text-red-700 border-red-300"
                          : isMedRisk
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-emerald-100 text-emerald-800 border-emerald-300"
                      }`}
                    >
                      {vessel.risk}
                    </span>
                  </td>

                  {/* Anomaly Vector */}
                  <td className="py-3 px-4 max-w-xs">
                    <span
                      className={`text-[11px] font-medium leading-tight line-clamp-1 ${
                        isHighRisk
                          ? "text-red-700 font-bold"
                          : isMedRisk
                          ? "text-amber-700 font-semibold"
                          : "text-slate-500 font-mono"
                      }`}
                    >
                      {vessel.anomalyType || "Nominal AIS broadcast"}
                    </span>
                  </td>

                  {/* Speed / Heading */}
                  <td className="py-3 px-4 font-mono text-slate-700 text-xs font-semibold">
                    {vessel.speed} kts &bull; {vessel.heading}°
                  </td>

                  {/* Coordinates */}
                  <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                    {vessel.latitude.toFixed(4)}°N, {vessel.longitude.toFixed(4)}°E
                  </td>

                  {/* Destination */}
                  <td className="py-3 px-4 text-slate-700 text-xs truncate max-w-[150px] font-medium">
                    {vessel.destination}
                  </td>

                  {/* AI Confidence */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-mono text-xs font-black ${
                        (vessel.spoofingConfidence || 0) > 80
                          ? "text-red-600"
                          : (vessel.spoofingConfidence || 0) > 50
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {vessel.spoofingConfidence ? `${vessel.spoofingConfidence}%` : "< 2%"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectVessel(vessel)}
                        className="px-2.5 py-1 rounded bg-white hover:bg-cyan-100 text-slate-700 hover:text-cyan-900 border border-slate-300 hover:border-cyan-400 text-[11px] font-mono transition shadow-xs font-semibold"
                        title="Locate on Map"
                      >
                        Map
                      </button>
                      <button
                        onClick={() => onOpenForensicModal(vessel)}
                        className="px-2.5 py-1 rounded bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-[11px] transition shadow-xs"
                        title="Open Deep Forensics"
                      >
                        Forensics
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
