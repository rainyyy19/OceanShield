"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Vessel, RiskLevel, VesselTrackPoint, VesselTrackResponse } from "@/types/vessel";
import { 
  Radio, 
  Crosshair, 
  RefreshCw, 
  Layers, 
  Zap, 
  Repeat, 
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  Compass,
  Navigation,
  AlertCircle,
  CheckCircle2,
  X,
  Gauge
} from "lucide-react";

interface FleetMapProps {
  vessels: Vessel[];
  selectedVessel: Vessel | null;
  onSelectVessel: (vessel: Vessel) => void;
  activeRiskFilter?: RiskLevel | "All";
  onFilterChange?: (filter: RiskLevel | "All") => void;
}

type TileProvider = "carto-light" | "osm-standard" | "carto-dark" | "satellite";

export default function FleetMap({
  vessels: propVessels,
  selectedVessel,
  onSelectVessel,
  activeRiskFilter = "All",
  onFilterChange,
}: FleetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const trackLayerRef = useRef<any>(null);
  const replayMarkerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  // Vessels state (from API or prop)
  const [vessels, setVessels] = useState<Vessel[]>(propVessels || []);
  const [mapReady, setMapReady] = useState(false);
  const [internalFilter, setInternalFilter] = useState<RiskLevel | "All">(activeRiskFilter);
  const [currentTileProvider, setCurrentTileProvider] = useState<TileProvider>("carto-light");

  // Track & Replay state
  const [activeTrack, setActiveTrack] = useState<VesselTrackResponse | null>(null);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [replayStep, setReplayStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x
  const replayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentFilter = onFilterChange ? activeRiskFilter : internalFilter;
  const handleFilterSelect = (filter: RiskLevel | "All") => {
    if (onFilterChange) {
      onFilterChange(filter);
    } else {
      setInternalFilter(filter);
    }
  };

  // 1. Tile Provider configurations (100% Free - NO API KEY REQUIRED)
  const tileProviders: Record<TileProvider, { url: string; attribution: string; maxZoom: number }> = {
    "carto-light": {
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    },
    "osm-standard": {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
    "carto-dark": {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    },
    "satellite": {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; Esri &mdash; Earthstar Geographics',
      maxZoom: 18,
    },
  };

  // Switch Tile Provider
  const changeTileProvider = (provider: TileProvider) => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const cfg = tileProviders[provider];
    const newLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      subdomains: provider === "satellite" ? [] : "abc",
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
    setCurrentTileProvider(provider);
  };

  // Fetch vessels from API if prop is empty or to sync latest
  useEffect(() => {
    let isMounted = true;
    const fetchVessels = async () => {
      try {
        const res = await fetch("/api/vessels");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.vessels || [];
          if (isMounted && list.length > 0) {
            setVessels(list);
          }
        }
      } catch (err) {
        console.warn("Using prop vessels fallback:", err);
      }
    };

    if (!propVessels || propVessels.length === 0) {
      fetchVessels();
    } else {
      setVessels(propVessels);
    }

    return () => {
      isMounted = false;
    };
  }, [propVessels]);

  // Tactical corridor navigation helper
  const flyToCorridor = (lat: number, lng: number, zoom: number = 6) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.5,
    });
  };

  // Force map container layout recalculation
  const handleRecenterAndInvalidate = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.invalidateSize();
    mapInstanceRef.current.setView([13.0, 72.0], 4);
  };

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = await import("leaflet");
      (window as any).L = L;

      if (!isMounted || !mapContainerRef.current) return;

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Create Leaflet map centered on Indian Ocean / Arabian Sea / SE Asia corridor
      const map = L.map(mapContainerRef.current, {
        center: [13.0, 72.0],
        zoom: 4,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: true,
      });

      // Add default Lighter Ocean CartoDB Positron tiles
      const cfg = tileProviders["carto-light"];
      const tileLayer = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        maxZoom: cfg.maxZoom,
        subdomains: "abc",
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Layer group for track polylines & replay
      const trackLayer = L.layerGroup().addTo(map);
      trackLayerRef.current = trackLayer;

      // Layer group for vessel markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;

      // Invalidate size after mount to ensure tiles render immediately
      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 400);
      setTimeout(() => map.invalidateSize(), 900);

      setMapReady(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 3. Render color-coded Vessel Markers & Popups (with MMSI, Speed, Course, Timestamp)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !markersLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Clear previous markers
    markersLayerRef.current.clearLayers();

    const filteredVessels = vessels.filter((v) => {
      if (currentFilter === "All") return true;
      return v.risk === currentFilter;
    });

    filteredVessels.forEach((vessel) => {
      const isSelected = selectedVessel?.mmsi === vessel.mmsi;

      // Risk colors
      const colorHex =
        vessel.risk === "High"
          ? "#ef4444"
          : vessel.risk === "Medium"
          ? "#f59e0b"
          : "#10b981";

      const glowColor =
        vessel.risk === "High"
          ? "rgba(239, 68, 68, 0.7)"
          : vessel.risk === "Medium"
          ? "rgba(245, 158, 11, 0.6)"
          : "rgba(16, 185, 129, 0.6)";

      // Pulsing circles for High Risk vessels
      let pulsingHtml = "";
      if (vessel.risk === "High") {
        pulsingHtml = `
          <div class="absolute -inset-3 rounded-full bg-red-500/30 pulsing-circle-outer pointer-events-none border border-red-500/50"></div>
          <div class="absolute -inset-1.5 rounded-full bg-red-500/40 pulsing-circle-inner pointer-events-none"></div>
        `;
      } else if (vessel.risk === "Medium") {
        pulsingHtml = `
          <div class="absolute -inset-1 rounded-full bg-amber-500/30 animate-pulse pointer-events-none"></div>
        `;
      }

      const selectedHalo = isSelected 
        ? `<div class="absolute -inset-4 rounded-full border-2 border-cyan-400 animate-ping pointer-events-none opacity-80"></div>`
        : "";

      // Custom HTML Marker with Lucide Ship Icon rotated by heading
      const customHtml = `
        <div class="relative flex items-center justify-center w-10 h-10 cursor-pointer group" style="pointer-events: auto;">
          ${pulsingHtml}
          ${selectedHalo}
          <div 
            class="relative flex items-center justify-center w-8 h-8 rounded-full transition-transform duration-300 transform group-hover:scale-125 shadow-xl"
            style="
              background: ${isSelected ? "#0369a1" : "#0a1e32"}; 
              border: 2px solid ${isSelected ? "#38bdf8" : colorHex}; 
              box-shadow: 0 0 14px ${glowColor};
            "
          >
            <div style="transform: rotate(${vessel.heading}deg); display: flex; align-items: center; justify-content: center;">
              <!-- Ship Icon -->
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="${isSelected ? "#ffffff" : colorHex}" 
                stroke-width="2.2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              >
                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
                <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
                <path d="M12 10V2"/>
                <path d="M12 2h5"/>
              </svg>
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: "vessel-leaflet-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22],
      });

      // Build rich Popup HTML with required fields: MMSI, speed, course, timestamp, and select button
      const popupHtml = `
        <div class="text-slate-900 p-4 rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-xl min-w-[290px] max-w-[330px] font-sans" style="background: rgba(255, 255, 255, 0.98); box-shadow: 0 16px 36px -8px rgba(2, 132, 199, 0.25);">
          <div class="flex items-start justify-between gap-2 border-b border-cyan-500/20 pb-2 mb-2.5">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${colorHex};"></span>
                <h4 class="font-extrabold tracking-wide text-sm text-navy-950">${vessel.name}</h4>
              </div>
              <p class="text-[11px] text-cyan-700 font-mono font-semibold mt-0.5">${vessel.vesselType || "Commercial Cargo"} • ${vessel.flag || "International"}</p>
            </div>
            <span class="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded border" style="background-color: ${
              vessel.risk === "High" ? "rgba(239, 68, 68, 0.15)" : vessel.risk === "Medium" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)"
            }; color: ${colorHex}; border-color: ${colorHex};">
              ${vessel.risk} Risk
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px] mb-3">
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span class="text-slate-500 block text-[10px] font-mono uppercase font-bold">MMSI</span>
              <span class="font-mono text-cyan-800 font-black text-xs">${vessel.mmsi}</span>
            </div>
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span class="text-slate-500 block text-[10px] font-mono uppercase font-bold">Speed & Course</span>
              <span class="font-mono text-slate-800 font-black text-xs">${vessel.speed} kts • ${vessel.heading}°</span>
            </div>
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200 col-span-2">
              <span class="text-slate-500 block text-[10px] font-mono uppercase font-bold">Latest Timestamp</span>
              <span class="font-mono text-slate-800 font-semibold text-xs flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${vessel.lastContact || "2026-09-17 14:31:00 UTC"}
              </span>
            </div>
            <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-200 col-span-2">
              <span class="text-slate-500 block text-[10px] font-mono">Coordinates</span>
              <span class="font-mono text-slate-700 text-[10px] font-medium">${vessel.latitude.toFixed(4)}°N, ${vessel.longitude.toFixed(4)}°E</span>
            </div>
          </div>

          ${
            vessel.anomalyType
              ? `
            <div class="p-2.5 rounded-xl bg-red-50 border border-red-200 mb-3 text-[11px]">
              <div class="flex items-center justify-between text-red-600 font-bold text-[10px] mb-0.5 uppercase tracking-wide">
                <span>Anomaly Vector</span>
                <span>${vessel.spoofingConfidence || 85}% Conf</span>
              </div>
              <p class="text-slate-700 text-[11px] leading-tight font-medium">${vessel.anomalyType}</p>
            </div>
          `
              : ""
          }

          <button 
            id="popup-leaflet-btn-${vessel.mmsi}"
            class="w-full py-2 px-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
            Select Vessel & Replay Track
          </button>
        </div>
      `;

      const marker = L.marker([vessel.latitude, vessel.longitude], { icon: customIcon })
        .bindPopup(popupHtml, {
          maxWidth: 340,
          className: "cyber-leaflet-popup",
        });

      // Bind button click inside popup when opened
      marker.on("popupopen", () => {
        const btn = document.getElementById(`popup-leaflet-btn-${vessel.mmsi}`);
        if (btn) {
          btn.onclick = () => {
            onSelectVessel(vessel);
            fetchAndDrawTrack(vessel);
          };
        }
      });

      marker.on("click", () => {
        onSelectVessel(vessel);
        fetchAndDrawTrack(vessel);
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [vessels, currentFilter, mapReady, selectedVessel, onSelectVessel]);

  // 4. Fetch vessel track from GET /api/vessels/{mmsi}/track and draw polyline
  const fetchAndDrawTrack = useCallback(async (vessel: Vessel) => {
    if (!vessel || !vessel.mmsi) return;
    setIsLoadingTrack(true);
    setIsPlaying(false);

    try {
      const res = await fetch(`/api/vessels/${vessel.mmsi}/track`);
      if (!res.ok) {
        throw new Error(`Failed to load track for MMSI ${vessel.mmsi}`);
      }
      const data: VesselTrackResponse = await res.json();
      setActiveTrack(data);
      setReplayStep(data.track.length - 1); // Default to latest point
    } catch (err) {
      console.error("Error fetching vessel track:", err);
    } finally {
      setIsLoadingTrack(false);
    }
  }, []);

  // When selectedVessel changes from outside, trigger track load
  useEffect(() => {
    if (selectedVessel) {
      fetchAndDrawTrack(selectedVessel);
    }
  }, [selectedVessel, fetchAndDrawTrack]);

  // 5. Draw track polylines on Leaflet map (Blue = Original AIS, Red = Spoofed trajectory)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !trackLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    trackLayerRef.current.clearLayers();

    if (!activeTrack || activeTrack.track.length === 0) return;

    const currentPts = activeTrack.track.slice(0, replayStep + 1);
    if (currentPts.length === 0) return;

    // Separate into original vs spoofed up to current replay step
    const origPoints: [number, number][] = [];
    const spoofPoints: [number, number][] = [];

    currentPts.forEach((pt) => {
      if (pt.is_spoofed) {
        if (spoofPoints.length === 0 && origPoints.length > 0) {
          // Connect to the last legitimate point
          spoofPoints.push(origPoints[origPoints.length - 1]);
        }
        spoofPoints.push([pt.latitude, pt.longitude]);
      } else {
        origPoints.push([pt.latitude, pt.longitude]);
      }
    });

    // 🔵 BLUE PATH: Original AIS (nominal / verified trajectory)
    if (origPoints.length >= 2) {
      const bluePolyline = L.polyline(origPoints, {
        color: "#2563eb",
        weight: 4.5,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
        className: "trace-line-original",
      }).addTo(trackLayerRef.current);

      bluePolyline.bindTooltip("<b>🔵 Original AIS Path</b><br>Nominal broadcast telemetry (Verified Doppler & Ephemeris)", {
        sticky: true,
      });
    }

    // 🔴 RED PATH: Spoofed Trajectory (synthetic / discontinuous coordinates)
    if (spoofPoints.length >= 2) {
      const redPolyline = L.polyline(spoofPoints, {
        color: "#ef4444",
        weight: 5,
        opacity: 0.95,
        dashArray: "8, 6",
        lineCap: "round",
        lineJoin: "round",
        className: "trace-line-spoofed",
      }).addTo(trackLayerRef.current);

      redPolyline.bindTooltip("<b>🔴 Spoofed Trajectory</b><br>Synthetic injection / Discontinuous kinematics violation", {
        sticky: true,
      });
    }

    // Render waypoint markers for each step
    currentPts.forEach((pt, idx) => {
      const isCurrent = idx === currentPts.length - 1;
      const isSpoof = pt.is_spoofed;
      const color = isSpoof ? "#ef4444" : "#2563eb";

      if (isCurrent) {
        // Current Animated Vessel Position Marker
        const currentIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute -inset-3 rounded-full ${isSpoof ? "bg-red-500/40 pulsing-circle-outer" : "bg-blue-500/40 animate-pulse"}"></div>
              <div 
                class="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white"
                style="background: ${color};"
              >
                <div style="transform: rotate(${pt.course}deg);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 19 21 12 17 5 21 12 2"/>
                  </svg>
                </div>
              </div>
              <div class="absolute -top-7 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap border ${
                isSpoof ? "bg-red-950 text-red-200 border-red-500" : "bg-blue-950 text-blue-200 border-blue-500"
              }">
                ${pt.speed} kts • ${pt.course}°
              </div>
            </div>
          `,
          className: "replay-active-marker",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const activeMarker = L.marker([pt.latitude, pt.longitude], { icon: currentIcon }).addTo(trackLayerRef.current);
        replayMarkerRef.current = activeMarker;
      } else {
        // Subtle waypoint dot
        const dotIcon = L.divIcon({
          html: `<div class="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style="background: ${color};"></div>`,
          className: "replay-waypoint-dot",
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker([pt.latitude, pt.longitude], { icon: dotIcon })
          .bindTooltip(`<b>${pt.timestamp}</b><br>${pt.speed} kts • ${pt.course}°<br>${isSpoof ? "🔴 Spoofed Point" : "🔵 Nominal Point"}`, {
            sticky: true,
          })
          .addTo(trackLayerRef.current);
      }
    });

    // Auto-fit bounds on initial track load (when at full path or first selected)
    if (replayStep === activeTrack.track.length - 1) {
      const allCoords: [number, number][] = activeTrack.track.map((p) => [p.latitude, p.longitude]);
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 12,
        });
      }
    }
  }, [activeTrack, replayStep, mapReady]);

  // 6. Play / Pause Replay Animation Engine
  useEffect(() => {
    if (!isPlaying || !activeTrack || activeTrack.track.length <= 1) {
      if (replayTimerRef.current) {
        clearInterval(replayTimerRef.current);
        replayTimerRef.current = null;
      }
      return;
    }

    const intervalMs = Math.max(300, 1000 / playbackSpeed);

    replayTimerRef.current = setInterval(() => {
      setReplayStep((prev) => {
        if (prev >= activeTrack.track.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (replayTimerRef.current) {
        clearInterval(replayTimerRef.current);
        replayTimerRef.current = null;
      }
    };
  }, [isPlaying, activeTrack, playbackSpeed]);

  const togglePlayPause = () => {
    if (!activeTrack) return;
    if (replayStep >= activeTrack.track.length - 1) {
      setReplayStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleResetReplay = () => {
    setIsPlaying(false);
    setReplayStep(0);
  };

  const handleCloseTrack = () => {
    setIsPlaying(false);
    setActiveTrack(null);
    if (trackLayerRef.current) {
      trackLayerRef.current.clearLayers();
    }
  };

  const currentReplayPoint: VesselTrackPoint | undefined = activeTrack?.track[replayStep];

  return (
    <div className="relative w-full h-[580px] lg:h-[660px] rounded-2xl overflow-hidden glass-card border border-cyan-500/25 shadow-2xl flex flex-col">
      {/* Top Header Overlay: Map Status, Risk Filter Pills */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Live Status Tag */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 shadow-lg">
          <Radio className="w-4 h-4 text-cyan-600 animate-pulse" />
          <div>
            <span className="text-xs font-bold tracking-wider text-slate-900 flex items-center gap-1.5">
              LEAFLET ARCTIC CYBER TELEMETRY
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </span>
            <span className="text-[10px] text-cyan-700 font-mono font-semibold block">
              AIS BACKEND CONNECTED &bull; {vessels.length} MONITORED VESSELS
            </span>
          </div>
        </div>

        {/* Right: Layer Switcher & Risk Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
          {/* Tile Layer Switcher */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-cyan-500/30 shadow-lg text-xs font-mono">
            <button
              onClick={() => changeTileProvider("carto-light")}
              className={`px-2 py-1 rounded-lg transition font-semibold ${
                currentTileProvider === "carto-light"
                  ? "bg-cyan-600 text-white font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="CartoDB Positron Light Ocean Style"
            >
              Light Ocean
            </button>
            <button
              onClick={() => changeTileProvider("osm-standard")}
              className={`px-2 py-1 rounded-lg transition font-semibold ${
                currentTileProvider === "osm-standard"
                  ? "bg-cyan-600 text-white font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="OpenStreetMap Standard Tiles"
            >
              OSM
            </button>
            <button
              onClick={() => changeTileProvider("carto-dark")}
              className={`px-2 py-1 rounded-lg transition font-semibold ${
                currentTileProvider === "carto-dark"
                  ? "bg-cyan-600 text-white font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="CARTO Dark Matter Style"
            >
              Dark Ocean
            </button>
            <button
              onClick={() => changeTileProvider("satellite")}
              className={`px-2 py-1 rounded-lg transition font-semibold ${
                currentTileProvider === "satellite"
                  ? "bg-cyan-600 text-white font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Esri Satellite Imagery"
            >
              Satellite
            </button>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-cyan-500/30 shadow-lg text-xs font-medium">
            <button
              onClick={() => handleFilterSelect("All")}
              className={`px-2.5 py-1 rounded-lg transition ${
                currentFilter === "All"
                  ? "bg-cyan-600 text-white font-bold shadow-cyan-glow"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              All ({vessels.length})
            </button>
            <button
              onClick={() => handleFilterSelect("High")}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                currentFilter === "High"
                  ? "bg-red-600 text-white font-bold shadow-md"
                  : "text-red-600 hover:bg-red-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              High ({vessels.filter((v) => v.risk === "High").length})
            </button>
            <button
              onClick={() => handleFilterSelect("Medium")}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                currentFilter === "Medium"
                  ? "bg-amber-600 text-white font-bold shadow-md"
                  : "text-amber-700 hover:bg-amber-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Medium ({vessels.filter((v) => v.risk === "Medium").length})
            </button>
            <button
              onClick={() => handleFilterSelect("Safe")}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                currentFilter === "Safe"
                  ? "bg-emerald-600 text-white font-bold shadow-md"
                  : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Safe ({vessels.filter((v) => v.risk === "Safe").length})
            </button>
          </div>
        </div>
      </div>

      {/* Trajectory Replay Control Bar Overlay (Appears when a vessel is selected/replay active) */}
      {activeTrack && (
        <div className="absolute top-16 left-3 right-3 z-[1000] pointer-events-auto bg-white/95 backdrop-blur-xl p-3 rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col gap-2.5 transition-all duration-300">
          {/* Top Row: Vessel Telemetry Header & Status Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-600 animate-ping"></span>
              <h3 className="font-extrabold text-slate-900 text-sm font-sans flex items-center gap-1.5">
                {activeTrack.name}
                <span className="font-mono text-xs text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-300">
                  MMSI: {activeTrack.mmsi}
                </span>
              </h3>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                activeTrack.risk === "High" ? "bg-red-50 text-red-600 border-red-300" : activeTrack.risk === "Medium" ? "bg-amber-50 text-amber-600 border-amber-300" : "bg-emerald-50 text-emerald-600 border-emerald-300"
              }`}>
                {activeTrack.risk} Risk
              </span>
            </div>

            {/* Path Identification Legend & Close Button */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1.5 rounded-full bg-blue-600 inline-block shadow-sm"></span>
                <span className="text-blue-900 font-bold text-[11px]">Blue Path: Original AIS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1.5 rounded-full bg-red-600 inline-block shadow-sm"></span>
                <span className="text-red-700 font-bold text-[11px]">Red Path: Spoofed Trajectory</span>
              </div>
              <button 
                onClick={handleCloseTrack}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                title="Exit Trajectory Replay"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Middle Row: Play/Pause, Timeline Slider, Current Step Readout */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Play / Pause Toggle Button */}
            <button
              onClick={togglePlayPause}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-md cursor-pointer ${
                isPlaying 
                  ? "bg-amber-500 hover:bg-amber-600 text-white" 
                  : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-glow"
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isPlaying ? "PAUSE" : "PLAY REPLAY"}
            </button>

            {/* Reset Replay Button */}
            <button
              onClick={handleResetReplay}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Reset Timeline to Start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Timeline Slider */}
            <div className="flex-1 flex items-center gap-2 min-w-[180px]">
              <span className="text-[10px] font-mono text-slate-500 font-bold whitespace-nowrap">
                T-0
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, activeTrack.track.length - 1)}
                value={replayStep}
                onChange={(e) => {
                  setIsPlaying(false);
                  setReplayStep(Number(e.target.value));
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 focus:outline-none"
              />
              <span className="text-[10px] font-mono text-slate-500 font-bold whitespace-nowrap">
                T-{activeTrack.track.length - 1}
              </span>
            </div>

            {/* Playback Speed Multiplier */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-mono font-bold">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded ${
                    playbackSpeed === spd
                      ? "bg-cyan-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Bottom HUD: Live Kinematics at Replay Step */}
          {currentReplayPoint && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-700" />
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-bold text-slate-900">{currentReplayPoint.timestamp}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-700" />
                <span className="text-slate-500">Speed:</span>
                <span className="font-bold text-slate-900">{currentReplayPoint.speed} kts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-700" />
                <span className="text-slate-500">Course:</span>
                <span className="font-bold text-slate-900">{currentReplayPoint.course}°</span>
              </div>
              <div className="flex items-center gap-1.5">
                {currentReplayPoint.is_spoofed ? (
                  <span className="flex items-center gap-1 text-red-600 font-black">
                    <AlertCircle className="w-3.5 h-3.5" /> SPOOFED INJECTION
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-blue-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> NOMINAL AIS FIX
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full min-h-[520px] flex-1 relative z-10" 
        style={{ minHeight: "520px", height: "100%", width: "100%" }}
      />

      {/* Bottom Floating Tactical Corridor Shortcuts & Quick Track Selectors */}
      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/30 text-[11px] font-mono shadow-xl max-w-[90%] overflow-x-auto pointer-events-auto">
        <span className="text-slate-500 px-1.5 font-sans font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1">
          <Crosshair className="w-3 h-3 text-cyan-600" /> Tracks:
        </span>

        {/* Quick Vessel Trajectory Launchers */}
        <button
          onClick={() => {
            const v = vessels.find((x) => x.name.includes("VALIANT") || x.mmsi === 352984123);
            if (v) {
              onSelectVessel(v);
              fetchAndDrawTrack(v);
            }
          }}
          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 transition whitespace-nowrap flex items-center gap-1 font-bold"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          ⚡ EVER VALIANT (Teleport Jump)
        </button>

        <button
          onClick={() => {
            const v = vessels.find((x) => x.name.includes("ANTARES") || x.mmsi === 228392100);
            if (v) {
              onSelectVessel(v);
              fetchAndDrawTrack(v);
            }
          }}
          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 transition whitespace-nowrap flex items-center gap-1 font-bold"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          ⭕ CMA CGM ANTARES (Circular Loop)
        </button>

        <button
          onClick={() => {
            const v = vessels.find((x) => x.name.includes("MERCURY") || x.mmsi === 371928471);
            if (v) {
              onSelectVessel(v);
              fetchAndDrawTrack(v);
            }
          }}
          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition whitespace-nowrap flex items-center gap-1 font-bold"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          🕶️ OCEAN MERCURY (Blank Gap)
        </button>

        <button
          onClick={handleRecenterAndInvalidate}
          className="px-2 py-1 rounded bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-200 hover:border-cyan-400 transition whitespace-nowrap flex items-center gap-1 font-semibold"
        >
          <RefreshCw className="w-3 h-3 text-cyan-600" />
          Recenter
        </button>
      </div>

      {/* Bottom Right Legend */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-cyan-500/30 text-[11px] shadow-xl pointer-events-auto">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5 font-mono">
          AIS Trajectory & Threat Legend
        </div>
        <div className="flex flex-col gap-1.5 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 rounded-full bg-blue-600 inline-block shadow-sm"></span>
            <span className="text-blue-900 text-[10px] font-mono font-bold">Blue Path: Original AIS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 rounded-full bg-red-600 inline-block shadow-sm"></span>
            <span className="text-red-700 text-[10px] font-mono font-bold">Red Path: Spoofed Trajectory</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-slate-800 text-[10px]">High Risk (Pulsing Concentric Ring)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-800 text-[10px]">Medium Risk (Kinematic Variance)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-800 text-[10px]">Safe Vessel (Nominal Track)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
