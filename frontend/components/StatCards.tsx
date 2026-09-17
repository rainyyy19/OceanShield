"use client";

import React from "react";
import { 
  Ship, 
  ShieldAlert, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Radio, 
  Wifi, 
  Radar 
} from "lucide-react";

interface StatCardsProps {
  totalShipsCount: number;
  activeThreatsCount: number;
  fleetRiskScore: number; // e.g. 78
  incidentsTodayCount: number;
  onCardClick?: (type: string) => void;
}

export default function StatCards({
  totalShipsCount,
  activeThreatsCount,
  fleetRiskScore,
  incidentsTodayCount,
  onCardClick,
}: StatCardsProps) {
  const cards = [
    {
      id: "total-ships",
      title: "Total Ships",
      subtitle: "Active corridor & priority targets",
      value: "1,428",
      subValue: `${totalShipsCount} in active priority AOI`,
      icon: Ship,
      trend: "+5.4% vs last week",
      isPositive: true,
      accentColor: "cyan",
      borderColor: "border-cyan-500/25",
      glowClass: "shadow-cyan-glow",
      iconBg: "bg-cyan-500/15 text-cyan-400 border-cyan-400/30",
      progress: 74,
      details: "Monitored via 42 coastal L-Band receivers & 18 LEO AIS satellites",
    },
    {
      id: "active-threats",
      title: "Active Threats",
      subtitle: "Confirmed spoofing & tampering",
      value: `${activeThreatsCount}`,
      subValue: "6 Critical / 1 Severe Jamming",
      icon: ShieldAlert,
      trend: "+2 new in last 3h",
      isPositive: false,
      accentColor: "red",
      borderColor: "border-red-500/40",
      glowClass: "shadow-red-glow",
      iconBg: "bg-red-500/20 text-red-400 border-red-500/40",
      progress: 88,
      details: "Synthetic circle tracks identified in Arabian Sea & Bab-el-Mandeb",
    },
    {
      id: "fleet-risk",
      title: "Fleet Risk",
      subtitle: "Composite AI vulnerability score",
      value: `${fleetRiskScore}%`,
      subValue: "HIGH RISK / ELEVATED",
      icon: AlertTriangle,
      trend: "Index +14 pts today",
      isPositive: false,
      accentColor: "amber",
      borderColor: "border-amber-500/30",
      glowClass: "shadow-md",
      iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      progress: fleetRiskScore,
      details: "Red Sea & Malacca chokepoint transit vulnerability index elevated",
    },
    {
      id: "incidents-today",
      title: "Incidents Today",
      subtitle: "Spoofing events logged (24h)",
      value: `${incidentsTodayCount}`,
      subValue: "10 Circle Drift • 3 Jumps • 1 Clone",
      icon: Activity,
      trend: "+32% vs 30-day baseline",
      isPositive: false,
      accentColor: "teal",
      borderColor: "border-teal-500/25",
      glowClass: "shadow-teal-glow",
      iconBg: "bg-teal-500/15 text-teal-400 border-teal-500/30",
      progress: 62,
      details: "Average time to neural anomaly identification: 4.8 seconds",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onCardClick?.(card.id)}
            className={`relative rounded-2xl p-4 lg:p-5 glass-card glass-card-hover border ${card.borderColor} cursor-pointer group transition-all duration-300 flex flex-col justify-between shadow-sm`}
          >
            {/* Top Row: Title & Icon */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-slate-500">
                    {card.title}
                  </span>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{card.subtitle}</p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs transition-transform duration-300 group-hover:scale-110 flex-shrink-0 ${card.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Stat Value */}
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-slate-900 font-mono">
                  {card.value}
                </span>
                <span className="text-xs font-bold text-slate-600 font-mono">
                  {card.subValue}
                </span>
              </div>
            </div>

            {/* Bottom Row: Progress bar & Trend */}
            <div className="mt-4 pt-3 border-t border-slate-200/90">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                <span className="text-slate-600 flex items-center gap-1 font-medium">
                  {card.isPositive ? (
                    <TrendingDown className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-red-600" />
                  )}
                  <span className={card.isPositive ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                    {card.trend}
                  </span>
                </span>
                <span className="text-slate-500 font-medium">{card.progress}% Cap</span>
              </div>

              {/* Cyber Progress Indicator */}
              <div className="w-full bg-slate-200/90 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    card.accentColor === "red"
                      ? "bg-gradient-to-r from-red-600 to-rose-400"
                      : card.accentColor === "amber"
                      ? "bg-gradient-to-r from-amber-600 to-yellow-400"
                      : card.accentColor === "teal"
                      ? "bg-gradient-to-r from-teal-600 to-emerald-400"
                      : "bg-gradient-to-r from-cyan-600 to-cyan-400"
                  }`}
                  style={{ width: `${card.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
