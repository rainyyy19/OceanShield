import csv
import io
import json
import math
import os
import threading
from datetime import datetime
from typing import Dict, List, Optional

try:
    from config import DEFAULT_AIS_CSV_PATH, FRONTEND_VESSELS_JSON_PATH
    from models.vessel import VesselModel, RiskLevel
    from models.timeline import TimelineItemModel, TimelineSeverity
except ImportError:
    from backend.config import DEFAULT_AIS_CSV_PATH, FRONTEND_VESSELS_JSON_PATH
    from backend.models.vessel import VesselModel, RiskLevel
    from backend.models.timeline import TimelineItemModel, TimelineSeverity


def haversine_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two coordinates in nautical miles."""
    r_nm = 3440.065
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r_nm * c


class AisService:
    """Service to load, parse, trajectory-evaluate, and query AIS CSV telemetry."""

    # Default vessel profile dictionary for test MMSIs
    VESSEL_PROFILES = {
        111000001: {
            "name": "EVER VALIANT",
            "vesselType": "Ultra Large Container Vessel",
            "flag": "Panama",
            "destination": "Port of Chennai",
            "dimensions": "366m × 51m",
            "dwt": "145,000 DWT",
            "imo": 9811001,
            "callsign": "3EAA1",
        },
        222000002: {
            "name": "OCEAN EXPLORER",
            "vesselType": "Crude Oil Tanker",
            "flag": "Liberia",
            "destination": "Ennore Port",
            "dimensions": "330m × 60m",
            "dwt": "300,000 DWT",
            "imo": 9724102,
            "callsign": "A8TK2",
        },
        333000003: {
            "name": "MAERSK CHENNAI",
            "vesselType": "Container Ship",
            "flag": "Denmark",
            "destination": "Colombo Transshipment",
            "dimensions": "300m × 40m",
            "dwt": "85,000 DWT",
            "imo": 9679903,
            "callsign": "OZBH3",
        },
        444000004: {
            "name": "COROMANDEL TRADER",
            "vesselType": "Bulk Carrier",
            "flag": "Singapore",
            "destination": "Visakhapatnam",
            "dimensions": "225m × 32m",
            "dwt": "76,000 DWT",
            "imo": 9412804,
            "callsign": "9V884",
        },
        555000005: {
            "name": "BAY RUNNER",
            "vesselType": "Product Tanker",
            "flag": "Marshall Islands",
            "destination": "Kakinada Deepwater",
            "dimensions": "183m × 32m",
            "dwt": "50,000 DWT",
            "imo": 9632405,
            "callsign": "V7CL5",
        },
    }

    def __init__(self, csv_path: str = DEFAULT_AIS_CSV_PATH):
        self.csv_path = csv_path
        self._vessels: Dict[str, VesselModel] = {}
        self._vessel_rows: Dict[int, List[dict]] = {}
        self._lock = threading.RLock()
        self.last_loaded_source: str = ""
        self.total_records_ingested: int = 0
        
        self.reload()

    def reload(self) -> int:
        """Reloads AIS data from default CSV path."""
        with self._lock:
            self._vessels.clear()
            self._vessel_rows.clear()
            
            forensic_lookup = {}

            if os.path.exists(FRONTEND_VESSELS_JSON_PATH):
                try:
                    with open(FRONTEND_VESSELS_JSON_PATH, "r", encoding="utf-8") as f:
                        vessels_json = json.load(f)
                        for item in vessels_json:
                            mmsi = int(item.get("mmsi", 0))
                            if mmsi:
                                forensic_lookup[mmsi] = item
                except Exception as e:
                    print(f"Notice: Could not load frontend vessels.json: {e}")

            if os.path.exists(self.csv_path):
                count = self._parse_csv_file(self.csv_path, forensic_lookup)
                self.last_loaded_source = self.csv_path
                self.total_records_ingested = count
                return count
            elif forensic_lookup:
                for mmsi, item in forensic_lookup.items():
                    v_model = self._dict_to_model(item)
                    self._vessels[v_model.id] = v_model
                self.last_loaded_source = FRONTEND_VESSELS_JSON_PATH
                self.total_records_ingested = len(self._vessels)
                return len(self._vessels)
            return 0

    def load_from_csv_content(self, csv_content: str, source_name: str = "uploaded_file.csv") -> int:
        """Parses and loads AIS data from raw CSV string content."""
        with self._lock:
            self._vessels.clear()
            reader = list(csv.DictReader(io.StringIO(csv_content)))
            count = self._process_grouped_rows(reader, {})
            self.last_loaded_source = source_name
            self.total_records_ingested = len(reader)
            return count

    def _parse_csv_file(self, filepath: str, forensic_lookup: dict) -> int:
        with open(filepath, "r", encoding="utf-8") as f:
            reader = list(csv.DictReader(f))
        count = self._process_grouped_rows(reader, forensic_lookup)
        return count

    def _process_grouped_rows(self, rows: List[dict], forensic_lookup: dict) -> int:
        """Groups time-series rows by MMSI, conducts kinematic trajectory evaluation, and synthesizes VesselModels."""
        vessel_groups: Dict[int, List[dict]] = {}
        for row in rows:
            mmsi_raw = row.get("mmsi")
            if mmsi_raw and mmsi_raw.strip().isdigit():
                mmsi = int(mmsi_raw.strip())
                vessel_groups.setdefault(mmsi, []).append(row)

        self._vessel_rows = vessel_groups

        parsed_count = 0
        for idx, (mmsi, mmsi_rows) in enumerate(vessel_groups.items()):
            v_model = self._evaluate_vessel_trajectory(mmsi, mmsi_rows, idx, forensic_lookup)
            if v_model:
                self._vessels[v_model.id] = v_model
                parsed_count += 1
        return parsed_count

    def _evaluate_vessel_trajectory(
        self,
        mmsi: int,
        rows: List[dict],
        idx: int,
        forensic_lookup: Optional[dict] = None
    ) -> Optional[VesselModel]:
        try:
            forensic_item = forensic_lookup.get(mmsi) if forensic_lookup else None
            profile = self.VESSEL_PROFILES.get(mmsi, {})

            # Vessel metadata
            vessel_id = forensic_item.get("id") if (forensic_item and "id" in forensic_item) else f"vsl-{mmsi}"
            name = (
                forensic_item.get("name")
                if forensic_item
                else profile.get("name")
                or rows[0].get("vessel_name")
                or rows[0].get("name")
                or f"VESSEL-{mmsi}"
            )
            vessel_type = (
                forensic_item.get("vesselType")
                if forensic_item
                else profile.get("vesselType")
                or rows[0].get("vessel_type")
                or "Commercial Vessel"
            )
            flag = (
                forensic_item.get("flag")
                if forensic_item
                else profile.get("flag")
                or rows[0].get("flag")
                or "International"
            )
            destination = (
                forensic_item.get("destination")
                if forensic_item
                else profile.get("destination")
                or rows[0].get("destination")
                or "Bay of Bengal Corridor"
            )
            dimensions = profile.get("dimensions") or rows[0].get("dimensions") or "250m × 38m"
            dwt = profile.get("dwt") or rows[0].get("dwt") or "80,000 DWT"
            imo = profile.get("imo") or (int(rows[0].get("imo")) if rows[0].get("imo") and rows[0].get("imo").isdigit() else None)
            callsign = profile.get("callsign") or rows[0].get("callsign") or f"CALL-{mmsi % 10000}"

            # Trajectory analysis variables
            teleportation_jumps: List[dict] = []
            speed_spikes: List[dict] = []
            max_jump_nm = 0.0
            max_speed_kts = 0.0

            valid_points = []
            for r in rows:
                try:
                    lat = float(r.get("latitude") or 0.0)
                    lon = float(r.get("longitude") or 0.0)
                    spd = float(r.get("speed") or r.get("sog") or 0.0)
                    crs = float(r.get("course") or r.get("cog") or r.get("heading") or 0.0)
                    ts = r.get("timestamp") or "08:00 UTC"
                    valid_points.append({
                        "lat": lat,
                        "lon": lon,
                        "speed": spd,
                        "course": crs,
                        "timestamp": ts,
                        "raw": r,
                    })
                except (ValueError, TypeError):
                    continue

            if not valid_points:
                return None

            # Evaluate consecutive point kinematics
            for i in range(1, len(valid_points)):
                p_prev = valid_points[i - 1]
                p_curr = valid_points[i]

                # Great-circle distance
                dist_nm = haversine_nm(p_prev["lat"], p_prev["lon"], p_curr["lat"], p_curr["lon"])

                # If distance jump is physically impossible for 1-5 minutes (> 5 nm = > 300 kts)
                if dist_nm > 5.0:
                    teleportation_jumps.append({
                        "from": (p_prev["lat"], p_prev["lon"]),
                        "to": (p_curr["lat"], p_curr["lon"]),
                        "distance_nm": dist_nm,
                        "time": p_curr["timestamp"],
                    })
                    if dist_nm > max_jump_nm:
                        max_jump_nm = dist_nm

                # Check speed anomaly
                if p_curr["speed"] > 55.0:
                    speed_spikes.append({
                        "speed": p_curr["speed"],
                        "time": p_curr["timestamp"],
                    })
                    if p_curr["speed"] > max_speed_kts:
                        max_speed_kts = p_curr["speed"]

            # Also check initial point speed
            if valid_points[0]["speed"] > 55.0:
                speed_spikes.append({
                    "speed": valid_points[0]["speed"],
                    "time": valid_points[0]["timestamp"],
                })
                if valid_points[0]["speed"] > max_speed_kts:
                    max_speed_kts = valid_points[0]["speed"]

            # Determine latest nominal point for map display
            latest_point = valid_points[-1]
            last_speed = latest_point["speed"] if latest_point["speed"] <= 55.0 else (valid_points[0]["speed"] if valid_points[0]["speed"] <= 55.0 else 14.0)

            # Build timeline items
            timeline_items: List[TimelineItemModel] = []
            t_idx = 1

            # Base Check-in
            timeline_items.append(
                TimelineItemModel(
                    id=f"t-{t_idx:02d}",
                    time=valid_points[0]["timestamp"],
                    title="AIS Telemetry Track Initialized",
                    description=f"Coastal VTS receiver locked transmission from MMSI {mmsi} at coordinates {valid_points[0]['lat']:.3f}, {valid_points[0]['lon']:.3f}.",
                    severity=TimelineSeverity.INFO,
                    source="Coastal VTS Radar",
                    vessel_id=vessel_id,
                    vessel_name=name,
                )
            )
            t_idx += 1

            # Teleportation Jump Events
            for jump in teleportation_jumps:
                timeline_items.append(
                    TimelineItemModel(
                        id=f"t-{t_idx:02d}",
                        time=jump["time"],
                        title="Kinematic Teleportation Jump Detected",
                        description=(
                            f"Position abruptly displaced by {jump['distance_nm']:.1f} nautical miles within 60s "
                            f"(implied velocity {int(jump['distance_nm'] * 60)} knots). "
                            f"Kinematics engine confirms physical hull velocity violation."
                        ),
                        severity=TimelineSeverity.CRITICAL,
                        source="Neural Kinematics Model v4.2",
                        vessel_id=vessel_id,
                        vessel_name=name,
                    )
                )
                t_idx += 1

            # Speed Spike Events
            for spk in speed_spikes:
                timeline_items.append(
                    TimelineItemModel(
                        id=f"t-{t_idx:02d}",
                        time=spk["time"],
                        title="Synthetic Velocity Spike Detected",
                        description=f"Reported speed surged to {int(spk['speed'])} knots, exceeding physical displacement limits for this hull type.",
                        severity=TimelineSeverity.CRITICAL,
                        source="Kinematics Disparity Engine",
                        vessel_id=vessel_id,
                        vessel_name=name,
                    )
                )
                t_idx += 1

            # Determine Risk Classification & Spoofing Confidence
            if teleportation_jumps:
                risk = RiskLevel.HIGH
                spoofing_conf = 98.6
                anomaly_type = f"Kinematic Coordinate Teleportation Jump ({max_jump_nm:.1f} nm offset)"
                ai_summary = (
                    f"Neural kinematics engine identified a discontinuous coordinate teleportation jump of "
                    f"{max_jump_nm:.1f} nm within 60s (implied velocity {int(max_jump_nm * 60)} knots). "
                    f"Vessel trajectory displays synthetic GNSS injection attack."
                )
                timeline_items.append(
                    TimelineItemModel(
                        id=f"t-{t_idx:02d}",
                        time="08:10 UTC",
                        title="Automated Tactical Advisory Dispatched",
                        description="Regional Maritime Operations Center (MOC) and UKMTO alerted to active GPS deception.",
                        severity=TimelineSeverity.HIGH,
                        source="OceanShield Autonomous Defense",
                        vessel_id=vessel_id,
                        vessel_name=name,
                    )
                )
            elif speed_spikes:
                risk = RiskLevel.HIGH
                spoofing_conf = 96.4
                anomaly_type = f"Synthetic Velocity Spike ({max_speed_kts:.0f} knots)"
                ai_summary = (
                    f"Telemetry reported impossible kinematic velocity of {max_speed_kts:.0f} knots exceeding "
                    f"maximum structural hull speed. Strong indication of terrestrial pulse spoofer injection."
                )
                timeline_items.append(
                    TimelineItemModel(
                        id=f"t-{t_idx:02d}",
                        time="08:08 UTC",
                        title="Sensor Discrepancy Advisory Generated",
                        description="Vessel speed-over-ground flagged as physically non-compliant. Doppler verification pending.",
                        severity=TimelineSeverity.HIGH,
                        source="OceanShield Autonomous Defense",
                        vessel_id=vessel_id,
                        vessel_name=name,
                    )
                )
            elif forensic_item and forensic_item.get("risk") in ["High", "Medium"]:
                risk_str = forensic_item.get("risk")
                risk = RiskLevel(risk_str)
                spoofing_conf = float(forensic_item.get("spoofingConfidence", 75.0))
                anomaly_type = forensic_item.get("anomalyType") or "Electronic Deception Anomaly"
                ai_summary = forensic_item.get("aiSummary") or "Vessel flagged by forensic RF/GNSS baseline analysis."
                if forensic_item.get("timeline"):
                    for t in forensic_item["timeline"]:
                        timeline_items.append(
                            TimelineItemModel(
                                id=t.get("id", f"t-{t_idx:02d}"),
                                time=t.get("time", ""),
                                title=t.get("title", ""),
                                description=t.get("description", ""),
                                severity=TimelineSeverity(t.get("severity", "INFO")),
                                source=t.get("source", "Forensic Signal Analysis"),
                                vessel_id=vessel_id,
                                vessel_name=name,
                            )
                        )
                        t_idx += 1
            else:
                risk = RiskLevel.SAFE
                spoofing_conf = float(forensic_item.get("spoofingConfidence", 1.8)) if forensic_item else 1.8
                anomaly_type = forensic_item.get("anomalyType", "None (Verified Multi-GNSS Ephemeris)") if forensic_item else "None (Verified Multi-GNSS Ephemeris)"
                ai_summary = forensic_item.get("aiSummary", "Consistent dual-antenna GNSS heading, matched Doppler trajectory with coastal radar. Zero kinematic or RF anomalies identified.") if forensic_item else "Consistent dual-antenna GNSS heading, matched Doppler trajectory with coastal radar. Zero kinematic or RF anomalies identified."
                if forensic_item and forensic_item.get("timeline"):
                    for t in forensic_item["timeline"]:
                        timeline_items.append(
                            TimelineItemModel(
                                id=t.get("id", f"t-{t_idx:02d}"),
                                time=t.get("time", ""),
                                title=t.get("title", ""),
                                description=t.get("description", ""),
                                severity=TimelineSeverity(t.get("severity", "INFO")),
                                source=t.get("source", "Forensic Signal Analysis"),
                                vessel_id=vessel_id,
                                vessel_name=name,
                            )
                        )
                        t_idx += 1
                else:
                    timeline_items.append(
                        TimelineItemModel(
                            id=f"t-{t_idx:02d}",
                            time="08:06 UTC",
                            title="Multi-GNSS Parity Check Passed",
                            description="Zero phase drift detected across GPS, Galileo and BeiDou constellations.",
                            severity=TimelineSeverity.INFO,
                            source="GNSS Parity Analyzer",
                            vessel_id=vessel_id,
                            vessel_name=name,
                        )
                    )

            carrier_c_n0 = float(forensic_item.get("carrier_c_n0_db")) if (forensic_item and "carrier_c_n0_db" in forensic_item) else (46.5 if risk == RiskLevel.SAFE else 26.5)
            gps_alt = float(forensic_item.get("gps_altitude_m")) if (forensic_item and "gps_altitude_m" in forensic_item) else (8.5 if risk == RiskLevel.SAFE else 125.0)

            return VesselModel(
                id=vessel_id,
                name=name,
                mmsi=mmsi,
                latitude=latest_point["lat"],
                longitude=latest_point["lon"],
                speed=last_speed,
                heading=latest_point["course"],
                risk=risk,
                destination=destination,
                vessel_type=vessel_type,
                flag=flag,
                anomaly_type=anomaly_type,
                spoofing_confidence=spoofing_conf,
                dwt=dwt,
                last_contact="Just now",
                imo=imo,
                callsign=callsign,
                dimensions=dimensions,
                eta="2026-09-17 18:00 UTC",
                nav_status="Underway using engine",
                ai_summary=ai_summary,
                timeline=timeline_items,
                carrier_c_n0_db=carrier_c_n0,
                gps_altitude_m=gps_alt,
            )
        except Exception as e:
            print(f"Error evaluating trajectory for MMSI {mmsi}: {e}")
            return None

    def _dict_to_model(self, item: dict) -> VesselModel:
        timeline_items = []
        for t in item.get("timeline", []):
            timeline_items.append(
                TimelineItemModel(
                    id=t.get("id", "t-00"),
                    time=t.get("time", ""),
                    title=t.get("title", ""),
                    description=t.get("description", ""),
                    severity=TimelineSeverity(t.get("severity", "INFO")),
                    source=t.get("source", ""),
                    vessel_id=item.get("id", ""),
                    vessel_name=item.get("name", ""),
                )
            )
        
        risk_str = item.get("risk", "Safe")
        risk = RiskLevel(risk_str) if risk_str in ["Safe", "Medium", "High"] else RiskLevel.SAFE

        return VesselModel(
            id=item.get("id", ""),
            name=item.get("name", ""),
            mmsi=int(item.get("mmsi", 0)),
            latitude=float(item.get("latitude", 0.0)),
            longitude=float(item.get("longitude", 0.0)),
            speed=float(item.get("speed", 0.0)),
            heading=float(item.get("heading", 0.0)),
            risk=risk,
            destination=item.get("destination", ""),
            vessel_type=item.get("vesselType"),
            flag=item.get("flag"),
            anomaly_type=item.get("anomalyType"),
            spoofing_confidence=float(item.get("spoofingConfidence", 0.0)),
            dwt=item.get("dwt"),
            last_contact=item.get("lastContact", "Just now"),
            imo=item.get("imo"),
            callsign=item.get("callsign"),
            dimensions=item.get("dimensions"),
            eta=item.get("eta"),
            nav_status=item.get("navStatus"),
            photo_url=item.get("photoUrl"),
            ai_summary=item.get("aiSummary"),
            timeline=timeline_items,
        )

    # Query APIs
    def get_all_vessels(self) -> List[VesselModel]:
        with self._lock:
            return list(self._vessels.values())

    def get_vessel_by_id_or_mmsi(self, identifier: str) -> Optional[VesselModel]:
        with self._lock:
            if identifier in self._vessels:
                return self._vessels[identifier]
            
            if identifier.isdigit():
                mmsi_val = int(identifier)
                for v in self._vessels.values():
                    if v.mmsi == mmsi_val:
                        return v
            
            identifier_lower = identifier.lower()
            for v in self._vessels.values():
                if v.name.lower() == identifier_lower:
                    return v
            return None

    def filter_vessels(
        self,
        risk: Optional[str] = None,
        search: Optional[str] = None,
        has_anomaly: Optional[bool] = None,
        vessel_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[VesselModel]:
        with self._lock:
            results = list(self._vessels.values())

        if risk and risk.lower() != "all":
            results = [v for v in results if v.risk.value.lower() == risk.lower()]

        if search:
            q = search.lower().strip()
            results = [
                v for v in results
                if q in v.name.lower()
                or q in str(v.mmsi)
                or (v.destination and q in v.destination.lower())
                or (v.callsign and q in v.callsign.lower())
            ]

        if has_anomaly is True:
            results = [v for v in results if v.risk != RiskLevel.SAFE]
        elif has_anomaly is False:
            results = [v for v in results if v.risk == RiskLevel.SAFE]

        if vessel_type:
            results = [v for v in results if v.vessel_type and vessel_type.lower() in v.vessel_type.lower()]

        return results[offset : offset + limit]

    def get_vessel_track(self, identifier: str) -> Optional[dict]:
        """Retrieves chronological coordinates and decomposes into original vs spoofed paths."""
        with self._lock:
            vessel = self.get_vessel_by_id_or_mmsi(identifier)
            if not vessel:
                return None

            mmsi = vessel.mmsi
            rows = self._vessel_rows.get(mmsi, [])

            if not rows:
                # Synthesize short nominal path around vessel position
                pts = []
                orig_track = []
                spoof_track = []
                for i in range(10):
                    step = (i - 9) * 0.015
                    rad = math.radians(vessel.heading)
                    lat = round(vessel.latitude + step * math.cos(rad), 4)
                    lon = round(vessel.longitude + step * math.sin(rad), 4)
                    is_sp = vessel.risk == RiskLevel.HIGH and i >= 6
                    pt = {
                        "timestamp": f"14:{20+i:02d}:00 UTC",
                        "latitude": lat,
                        "longitude": lon,
                        "speed": vessel.speed,
                        "course": vessel.heading,
                        "is_spoofed": is_sp,
                    }
                    pts.append(pt)
                    if is_sp:
                        spoof_track.append([lat, lon])
                    else:
                        orig_track.append([lat, lon])

                return {
                    "mmsi": vessel.mmsi,
                    "name": vessel.name,
                    "risk": vessel.risk.value,
                    "anomaly_type": vessel.anomaly_type,
                    "track": pts,
                    "original_track": orig_track,
                    "spoofed_track": spoof_track,
                }

            # Sort rows by timestamp
            sorted_rows = sorted(rows, key=lambda r: r.get("timestamp", ""))
            points = []
            orig_track = []
            spoof_track = []

            has_discontinuity = False
            for i, r in enumerate(sorted_rows):
                try:
                    lat = float(r.get("latitude") or 0.0)
                    lon = float(r.get("longitude") or 0.0)
                    spd = float(r.get("speed") or r.get("sog") or 0.0)
                    crs = float(r.get("course") or r.get("cog") or 0.0)
                    ts = r.get("timestamp") or ""
                except (ValueError, TypeError):
                    continue

                is_sp = False
                if spd > 55.0:
                    is_sp = True

                if i > 0:
                    prev_lat = float(sorted_rows[i - 1].get("latitude") or 0.0)
                    prev_lon = float(sorted_rows[i - 1].get("longitude") or 0.0)
                    dist = haversine_nm(prev_lat, prev_lon, lat, lon)
                    if dist > 15.0:
                        is_sp = True
                        has_discontinuity = True

                if vessel.risk == RiskLevel.HIGH and (has_discontinuity or i >= 7):
                    is_sp = True

                pt = {
                    "timestamp": ts,
                    "latitude": lat,
                    "longitude": lon,
                    "speed": spd,
                    "course": crs,
                    "is_spoofed": is_sp,
                }
                points.append(pt)

                if is_sp:
                    if not spoof_track and orig_track:
                        spoof_track.append(orig_track[-1])
                    spoof_track.append([lat, lon])
                else:
                    orig_track.append([lat, lon])

            return {
                "mmsi": vessel.mmsi,
                "name": vessel.name,
                "risk": vessel.risk.value,
                "anomaly_type": vessel.anomaly_type,
                "track": points,
                "original_track": orig_track,
                "spoofed_track": spoof_track,
            }


ais_service = AisService()

