"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import HeroBanner from "@/components/HeroBanner";
import StatCards from "@/components/StatCards";
import ThreatAlerts from "@/components/ThreatAlerts";
import InvestigationsTable from "@/components/InvestigationsTable";
import CyberCharts from "@/components/CyberCharts";
import InvestigationDrawer from "@/components/InvestigationDrawer";
import ThreatsView from "@/components/views/ThreatsView";
import ChokepointsView from "@/components/views/ChokepointsView";
import SpectrumView from "@/components/views/SpectrumView";
import SatelliteView from "@/components/views/SatelliteView";
import RulesView from "@/components/views/RulesView";
import LogsView from "@/components/views/LogsView";
import vesselsData from "@/data/vessels.json";
import { Vessel, RiskLevel } from "@/types/vessel";

// Dynamic client-only import for Leaflet map component
const FleetMap = dynamic(() => import("@/components/FleetMap"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[540px] lg:h-[620px] rounded-2xl overflow-hidden glass-card border border-cyan-500/25 shadow-md flex items-center justify-center bg-white/80">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-cyan-800 font-bold tracking-wider animate-pulse">
          INITIALIZING LEAFLET OPENSTREETMAP TELEMETRY...
        </span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [vessels, setVessels] = useState<Vessel[]>(vesselsData as Vessel[]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [drawerVessel, setDrawerVessel] = useState<Vessel | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("fleet");
  const [activeRiskFilter, setActiveRiskFilter] = useState<RiskLevel | "All">("All");

  // Fetch live vessels from AIS Backend API (CSV dataset)
  React.useEffect(() => {
    const fetchVessels = async () => {
      try {
        const res = await fetch("/api/vessels");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.vessels || [];
          if (list.length > 0) {
            setVessels(list);
          }
        }
      } catch (err) {
        console.warn("Could not fetch vessels from /api/vessels, using fallback:", err);
      }
    };
    fetchVessels();
  }, []);

  const highRiskCount = vessels.filter((v) => v.risk === "High").length;

  // When a vessel is selected (from map, search, or alerts), focus and optionally open investigation drawer
  const handleSelectVessel = (vessel: Vessel, openDrawer: boolean = false) => {
    setSelectedVessel(vessel);
    if (openDrawer) {
      setDrawerVessel(vessel);
      setIsDrawerOpen(true);
    }
  };

  const handleOpenDrawer = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setDrawerVessel(vessel);
    setIsDrawerOpen(true);
  };


  // Simulate a live spoofing attack event
  const handleSimulateSpoofAttack = () => {
    const safeVessels = vessels.filter((v) => v.risk === "Safe");
    if (safeVessels.length === 0) return;
    const target = safeVessels[0];

    const updated = vessels.map((v) => {
      if (v.id === target.id) {
        return {
          ...v,
          risk: "High" as RiskLevel,
          anomalyType: "SIMULATED: Circular GPS Drift Injection (Synthetic Multi-path)",
          spoofingConfidence: 99.2,
          speed: 28.5,
          lastContact: "Just now",
          aiSummary: "SIMULATED THREAT: High-gain terrestrial spoofing generator active. Synthetic coordinates injecting a 1.4 nm radius false circle drift.",
        };
      }
      return v;
    });

    const updatedTarget = {
      ...target,
      risk: "High" as RiskLevel,
      anomalyType: "SIMULATED: Circular GPS Drift Injection (Synthetic Multi-path)",
      spoofingConfidence: 99.2,
      speed: 28.5,
      aiSummary: "SIMULATED THREAT: High-gain terrestrial spoofing generator active. Synthetic coordinates injecting a 1.4 nm radius false circle drift.",
    };

    setVessels(updated);
    setSelectedVessel(updatedTarget);
    setDrawerVessel(updatedTarget);
    setIsDrawerOpen(true);
  };

  const handleExportIntel = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vessels, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `oceanshield-threat-intel-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRefresh = () => {
    setVessels([...(vesselsData as Vessel[])]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#edf6fc] via-[#f4f9fd] to-[#e6f1f9] text-slate-800 selection:bg-cyan-600 selection:text-white relative font-sans">
      {/* Subtle cyber ambient decorations */}
      <div className="fixed inset-0 bg-radar-grid opacity-35 pointer-events-none z-0"></div>
      <div className="fixed top-0 right-1/4 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-1/4 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl pointer-events-none z-0"></div>

      {/* 1. Top Navigation with Logo */}
      <Navbar vessels={vessels} onSelectVessel={(v) => handleSelectVessel(v, true)} />

      {/* Main Layout Body */}
      <div className="flex-1 flex flex-row relative z-10">
        {/* 4. Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          highRiskCount={highRiskCount}
        />

        {/* Center Dashboard Workspace - Dynamically Switched by activeTab */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1720px] mx-auto w-full overflow-y-auto">
          {/* TAB 1: FLEET MONITOR (Default Overview) */}
          {activeTab === "fleet" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 2. Hero Banner */}
              <HeroBanner
                onRefresh={handleRefresh}
                onExportIntel={handleExportIntel}
                onSimulateThreat={handleSimulateSpoofAttack}
              />

              {/* 3. Four Statistic Cards */}
              <StatCards
                totalShipsCount={vessels.length}
                activeThreatsCount={highRiskCount + 1}
                fleetRiskScore={78}
                incidentsTodayCount={14}
                onCardClick={(type) => {
                  if (type === "active-threats") {
                    setActiveRiskFilter("High");
                  } else if (type === "total-ships") {
                    setActiveRiskFilter("All");
                  }
                }}
              />

              {/* 5. World Map (Leaflet OpenStreetMap) & 6. Threat Alerts Panel */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
                {/* 5. Interactive Fleet Map */}
                <div className="xl:col-span-8 flex flex-col">
                  <FleetMap
                    vessels={vessels}
                    selectedVessel={selectedVessel}
                    onSelectVessel={(v) => handleSelectVessel(v, false)}
                    activeRiskFilter={activeRiskFilter}
                    onFilterChange={setActiveRiskFilter}

                  />
                </div>

                {/* 6. Threat Alerts Feed */}
                <div className="xl:col-span-4 flex flex-col">
                  <ThreatAlerts
                    vessels={vessels}
                    onSelectVessel={(v) => handleSelectVessel(v, true)}
                  />
                </div>
              </div>

              {/* 8. Beautiful Charts Placeholders */}
              <CyberCharts />

              {/* 7. Recent Investigations Table */}
              <InvestigationsTable
                vessels={vessels}
                onSelectVessel={(v) => handleSelectVessel(v, false)}
                onOpenForensicModal={handleOpenDrawer}
              />
            </div>
          )}

          {/* TAB 2: THREAT INTELLIGENCE */}
          {activeTab === "threats" && (
            <ThreatsView
              vessels={vessels}
              onSelectVessel={handleOpenDrawer}
              onNavigateToMap={() => setActiveTab("fleet")}
            />
          )}

          {/* TAB 3: SPOOFING CASES / INVESTIGATIONS */}
          {activeTab === "investigations" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="rounded-2xl p-6 glass-card border border-cyan-500/25 shadow-md">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Active Spoofing Investigations Center
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Full forensic case management cross-examining kinematic trajectory anomalies, reported velocity discontinuities, and electronic warfare signatures. Click any row to launch the deep-dive investigation dossier.
                </p>
              </div>

              <InvestigationsTable
                vessels={vessels}
                onSelectVessel={(v) => handleSelectVessel(v, false)}
                onOpenForensicModal={handleOpenDrawer}
              />
            </div>
          )}

          {/* TAB 4: CHOKEPOINTS & GEOFENCE */}
          {activeTab === "chokepoints" && (
            <ChokepointsView
              vessels={vessels}
              onFlyToCorridor={(lat, lng, zoom) => {
                if (selectedVessel) {
                  setSelectedVessel({ ...selectedVessel, latitude: lat, longitude: lng });
                }
              }}
              onNavigateToFleet={() => setActiveTab("fleet")}
            />
          )}

          {/* TAB 5: RF SPECTRUM & JAMMING */}
          {activeTab === "spectrum" && <SpectrumView />}

          {/* TAB 6: SAT-AIS CONSTELLATION */}
          {activeTab === "satellite" && <SatelliteView />}

          {/* TAB 7: AI ANOMALY MODELS */}
          {activeTab === "rules" && <RulesView />}

          {/* TAB 8: TELEMETRY & FORENSICS */}
          {activeTab === "logs" && <LogsView />}
        </main>
      </div>

      {/* Slide-over Investigation Drawer */}
      <InvestigationDrawer
        vessel={drawerVessel}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLocateOnMap={(v) => {
          setSelectedVessel(v);
          setActiveTab("fleet");
        }}
      />
    </div>
  );
}
