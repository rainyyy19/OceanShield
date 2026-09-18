"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Download, Play, Pause, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { getAisStatus } from "@/lib/api";
import { AisStatusResponse } from "@/types/vessel";

export default function LogsView() {
  const [isStreaming, setIsStreaming] = useState(true);
  const [aisStatus, setAisStatus] = useState<AisStatusResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      const s = await getAisStatus();
      if (isMounted && s) setAisStatus(s);
    };
    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const [logEntries, setLogEntries] = useState([
    { id: 1, time: "14:42:01.218", type: "!AIVDM", channel: "A", mmsi: 352984123, raw: "!AIVDM,1,1,,A,15N8i`001jP006R7?mF`0?wN0812,0*26", decode: "MSG 1: EVER VALIANT, Pos: 12.7145N 43.4512E, SOG: 18.4kts, COG: 322 deg, ROT: 0, NavStatus: 0" },
    { id: 2, time: "14:42:02.842", type: "ANOMALY", channel: "SYS", mmsi: 352984123, raw: "NEURAL_ERR: KINEMATICS_DISCONTINUITY_SPIKE delta=18.4nm conf=96.4%", decode: "TRIGGER: Coordinate jump violates maximum vessel kinematic speed envelope (540 kts implied)" },
    { id: 3, time: "14:42:03.110", type: "!AIVDM", channel: "B", mmsi: 636019482, raw: "!AIVDM,1,1,,B,15N7fP001TP007H7?l800?wL0800,0*1A", decode: "MSG 1: MAERSK BOSPHORUS, Pos: 1.2354N 103.8841E, SOG: 13.8kts, COG: 85 deg, ROT: 0" },
    { id: 4, time: "14:42:04.567", type: "!AIVDM", channel: "A", mmsi: 228392100, raw: "!AIVDM,1,1,,A,15N9h0001WP004L7?m000?wN0798,0*3B", decode: "MSG 1: CMA CGM ANTARES, Pos: 23.9412N 58.7421E, SOG: 16.2kts, COG: 305 deg, Status: Underway" },
    { id: 5, time: "14:42:05.102", type: "ANOMALY", channel: "SYS", mmsi: 228392100, raw: "NEURAL_ERR: SYNTHETIC_CIRCLE_DETECTED radius=1.2nm variance=0.003", decode: "TRIGGER: Reported track fits circle equation (x-h)^2+(y-k)^2=r^2 while gyro heading remains constant" },
    { id: 6, time: "14:42:06.490", type: "!AIVDM", channel: "A", mmsi: 477192834, raw: "!AIVDM,1,1,,A,15N8eP001RP003P7?l100?wM0811,0*2C", decode: "MSG 1: COSCO SHIPPING INDUS, Pos: 5.8214N 80.5124E, SOG: 19.1kts, COG: 92 deg, Normal fix" },
    { id: 7, time: "14:42:07.820", type: "RF_SDR", channel: "L1", mmsi: 310892301, raw: "C/N0_DROP: Sat=GPS-PRN14 freq=1575.42MHz snr_drop=18.2dB threshold=30dB", decode: "RF ALERT: Wideband carrier interference detected on STENA IMPERATOR" },
  ]);

  const exportLogs = () => {
    const text = logEntries.map((e) => `[${e.time}] [${e.channel}] ${e.raw} --> ${e.decode}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oceanshield-telemetry-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="rounded-2xl p-6 glass-card border border-cyan-500/25 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-700" />
                RAW TELEMETRY & NMEA SENSOR STREAM
              </span>
              <span className="text-xs font-mono text-emerald-700 font-bold">
                {aisStatus
                  ? `SOURCE: ${aisStatus.last_source} (${aisStatus.total_records_ingested} RECORDS)`
                  : "RATE: 28,400 MSG/SEC"}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Telemetry Forensics & Raw NMEA/AIS Stream
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Real-time packet-level inspection of raw NMEA 0183 / AIVDM sentences, satellite demodulation timestamps, and cryptographic sensor anomaly triggers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                isStreaming
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                  : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isStreaming ? "Streaming Active" : "Stream Paused"}
            </button>
            <button
              onClick={exportLogs}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs shadow-xs hover:from-cyan-500 hover:to-teal-500 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Logs
            </button>
          </div>
        </div>
      </div>

      {/* Terminal View */}
      <div className="rounded-2xl glass-card border border-cyan-500/25 shadow-md overflow-hidden font-mono text-xs">
        <div className="bg-navy-950 px-4 py-2.5 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-[11px] text-slate-400 ml-2">oceanshield-core@sgp-01: /var/log/ais/stream.raw</span>
          </div>
          <span className="text-[10px] text-cyan-400">BUFFER: 10,000 LINES</span>
        </div>

        <div className="p-4 bg-navy-950/95 space-y-2 max-h-[540px] overflow-y-auto">
          {logEntries.map((log) => {
            const isAnomaly = log.type === "ANOMALY";
            const isRF = log.type === "RF_SDR";

            return (
              <div
                key={log.id}
                className={`p-2 rounded border leading-relaxed ${
                  isAnomaly
                    ? "bg-red-950/30 border-red-500/40 text-red-300"
                    : isRF
                    ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                    : "bg-navy-900/50 border-slate-800 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="text-cyan-400">{log.time}</span>
                  <span className="font-bold uppercase px-1.5 py-0.2 rounded bg-navy-950 border border-slate-800 text-[9px]">
                    {log.type} &bull; CH-{log.channel}
                  </span>
                </div>
                <div className="text-[11px] font-semibold select-all">{log.raw}</div>
                <div className="text-[10px] text-slate-400 mt-1 pl-2 border-l border-cyan-500/30">
                  {log.decode}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
