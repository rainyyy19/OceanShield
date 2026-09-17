"use client";

import React, { useState } from "react";
import {
  Ship,
  ShieldAlert,
  Crosshair,
  Anchor,
  Radio,
  Satellite,
  Cpu,
  Terminal,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  Sliders,
  AlertTriangle
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  highRiskCount: number;
}

export default function Sidebar({ activeTab, onTabChange, highRiskCount }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: "fleet", label: "Fleet Monitor", icon: Ship, badge: null },
    { 
      id: "threats", 
      label: "Threat Intelligence", 
      icon: ShieldAlert, 
      badge: highRiskCount > 0 ? `${highRiskCount}` : null,
      badgeColor: "bg-red-500 text-white" 
    },
    { id: "investigations", label: "Spoofing Cases", icon: Crosshair, badge: "7 Active" },
    { id: "chokepoints", label: "Chokepoints & Geofence", icon: Anchor, badge: null },
    { id: "spectrum", label: "RF Spectrum & Jamming", icon: Radio, badge: "Live" },
    { id: "satellite", label: "Sat-AIS Constellation", icon: Satellite, badge: null },
    { id: "rules", label: "AI Anomaly Models", icon: Cpu, badge: "v4.2" },
    { id: "logs", label: "Telemetry & Forensics", icon: Terminal, badge: null },
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col justify-between bg-white/85 backdrop-blur-2xl border-r border-cyan-500/25 shadow-sm transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } min-h-[calc(100vh-61px)] p-3`}
    >
      {/* Top Menu Items */}
      <div className="space-y-4">
        {/* Toggle Collapse Button */}
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
          {!collapsed && (
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-800 font-extrabold">
              Command Suite
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-700 hover:bg-cyan-50 transition mx-auto border border-transparent hover:border-cyan-200"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition group relative text-left ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-sky-500/15 text-cyan-900 border border-cyan-400/50 shadow-sm font-bold"
                    : "text-slate-600 hover:text-cyan-900 hover:bg-cyan-50/70 border border-transparent font-medium"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 flex-shrink-0 ${
                    isActive ? "text-cyan-700" : "text-slate-500 group-hover:text-cyan-700"
                  }`}
                />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="text-xs truncate tracking-wide">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                          item.badgeColor || "bg-cyan-100 text-cyan-800 border border-cyan-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Active cyan indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-600 rounded-r shadow-cyan-glow"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="pt-4 border-t border-cyan-500/20">
        {!collapsed ? (
          <div className="glass-card p-3 rounded-xl border border-cyan-500/25 bg-white/70 text-xs shadow-xs">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-600 font-mono font-bold">NEURAL ENGINE</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden mb-2">
              <div className="bg-gradient-to-r from-cyan-600 to-teal-500 h-full w-4/5"></div>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              RF Discrepancy Rate: <span className="text-cyan-700 font-bold">0.034%</span>
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" title="Engine Operational" />
          </div>
        )}
      </div>
    </aside>
  );
}
