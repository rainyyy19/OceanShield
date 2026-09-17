"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Search, 
  Satellite, 
  Bell, 
  Activity, 
  Terminal, 
  Radio, 
  Layers,
  ChevronDown,
  Globe2,
  Lock,
  Sun,
  Moon,
  Sparkles
} from "lucide-react";
import { Vessel } from "@/types/vessel";

interface NavbarProps {
  vessels: Vessel[];
  onSelectVessel: (vessel: Vessel) => void;
  onOpenAuditLog?: () => void;
}

export default function Navbar({ vessels, onSelectVessel }: NavbarProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcString = now.toUTCString().replace("GMT", "UTC");
      setCurrentTime(utcString);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const searchResults = searchQuery.trim()
    ? vessels.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.mmsi.toString().includes(searchQuery) ||
          v.destination.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-cyan-500/25 px-4 lg:px-8 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/40 shadow-sm">
            {/* Animated Radar Pulse effect */}
            <div className="absolute inset-0 rounded-xl border border-cyan-500/40 animate-ping opacity-25"></div>
            <ShieldAlert className="w-5 h-5 text-cyan-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider text-slate-900 flex items-center gap-1.5">
                OCEAN<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">SHIELD</span>
                <span className="text-[10px] font-mono uppercase bg-cyan-600 text-white font-black px-1.5 py-0.5 rounded tracking-widest shadow-sm">
                  AI
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE C2 FEED
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 tracking-wider font-semibold">
              MARITIME CYBER DEFENSE &bull; ARCTIC GNSS/AIS ANOMALY LAB
            </p>
          </div>
        </div>

        {/* Center: Search & DEFCON Status */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-4">
          {/* Quick Search Vessel / MMSI */}
          <div className="relative w-full">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-cyan-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search vessel by name, MMSI (e.g. 352984123) or destination..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50/90 border border-cyan-500/30 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition font-mono shadow-inner"
              />
            </div>

            {/* Search Dropdown Results */}
            {isSearchOpen && searchResults.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-cyan-500/30 shadow-2xl p-2 z-50 max-h-72 overflow-y-auto"
                onMouseLeave={() => setIsSearchOpen(false)}
              >
                <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 flex justify-between">
                  <span>Found {searchResults.length} vessels</span>
                  <span className="text-cyan-700 font-bold">Click to inspect</span>
                </div>
                {searchResults.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onSelectVessel(v);
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-cyan-50 transition flex items-center justify-between group border border-transparent hover:border-cyan-300"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            v.risk === "High"
                              ? "bg-red-500 animate-ping"
                              : v.risk === "Medium"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-700">
                          {v.name}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-700 font-semibold">
                          MMSI: {v.mmsi}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 pl-3.5">
                        Dest: {v.destination} &bull; {v.speed} kts
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        v.risk === "High"
                          ? "bg-red-50 text-red-700 border-red-300 font-bold"
                          : v.risk === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-300 font-bold"
                          : "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
                      }`}
                    >
                      {v.risk} Risk
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DEFCON / Threat Alert Badge */}
          <div className="hidden xl:flex items-center gap-2 bg-red-50 border border-red-300 px-3 py-1.5 rounded-xl shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-red-700 leading-none">
                DEFCON 2 : ELEVATED
              </div>
              <div className="text-[9px] font-mono text-red-600 font-bold">
                ACTIVE SPOOF TRACES ON MAP
              </div>
            </div>
          </div>
        </div>

        {/* Right: Constellation Status & UTC Clock */}
        <div className="flex items-center gap-3">
          {/* Satellite Constellations telemetry */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono bg-slate-50 px-2.5 py-1.5 rounded-xl border border-cyan-500/25 text-slate-700 shadow-sm">
            <Satellite className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-slate-500">GNSS:</span>
            <span className="text-emerald-700 font-bold">GPS ✓</span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-700 font-bold">GLONASS ⚠</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-bold">GALILEO ✓</span>
          </div>

          {/* UTC Clock */}
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono font-bold text-cyan-800 tracking-wider">
              {currentTime || "LOADING UTC..."}
            </div>
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              ARCTIC NODE: SGP-01
            </div>
          </div>

          {/* User profile / Security clearance */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
              CY
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
