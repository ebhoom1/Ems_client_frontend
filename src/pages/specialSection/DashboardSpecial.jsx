import React, { useMemo, useEffect, useRef, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CheckCircle2, Gauge, Cog, Recycle } from "lucide-react";
import "./DashboardSpecial.css";
import genexlogo from "../../assests/images/logonewgenex.png";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";
import { getSocket } from "../../Autonerve/socketService"; // ✅ adjust path if needed

export default function DashboardSpecial() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  // ---------------------------
  // ✅ ProductId selection (same idea as CanvasComponent)
  // ---------------------------
  const getEffectiveProductId = useCallback(() => {
    const ui = userData?.validUserOne;
    const type = String(ui?.userType || "").toLowerCase();

    if (type === "admin" || type === "operator") {
      try {
        const fromSession = sessionStorage.getItem("selectedProductId");
        if (fromSession && fromSession.trim()) return fromSession.trim();
      } catch {
        // ignore
      }
    }
    return String(ui?.productID || "");
  }, [userData]);

  const effectiveProductId = getEffectiveProductId();
  const selectedProductIdRef = useRef("");

  useEffect(() => {
    selectedProductIdRef.current = String(effectiveProductId || "");
  }, [effectiveProductId]);

  // ---------------------------
  // ✅ Real-time states to show in UI
  // ---------------------------
  const [flow, setFlow] = useState({
    inletCum: null,
    outletCum: null,
    inletRate: null,
    outletRate: null,
    lastUpdated: null,
  });

  const [quality, setQuality] = useState({
    turbidity: null,
    pressure: null,
    lastUpdated: null,
  });

  const [tanks, setTanks] = useState({
    equalization: null,
    aeration: null,
    decant: null,
    sludge: null,
    treated: null,
    lastUpdated: null,
  });

  const SBR_EXPECTED_MIN = {
  Filling: 20,
  Aeration: 60,
  Settling: 30,
  Decanting: 15,
};

const FILTER_EXPECTED_MIN = {
  Filtration: 60,
  Backwash: 10,
  Rinse: 5,
};

  const [cycleStatus, setCycleStatus] = useState(null);
  const [cycleUpdatedAt, setCycleUpdatedAt] = useState(null);

  // ===== SBR Cycle (cycle_status) =====
  const [sbrPhase, setSbrPhase] = useState("--");
  const [sbrSince, setSbrSince] = useState(null); // Date
  const [sbrElapsedMin, setSbrElapsedMin] = useState(0);

  // ===== Filter Cycle (filling_status) =====
  const [filterPhase, setFilterPhase] = useState("--");
  const [filterSince, setFilterSince] = useState(null); // Date
  const [filterElapsedMin, setFilterElapsedMin] = useState(0);


  // ---------------------------
  // ✅ Socket setup (same pattern)
  // ---------------------------
  const socket = useRef(null);
  const backendUrl = API_URL || "http://localhost:5555";

  useEffect(() => {
    socket.current = getSocket(backendUrl);

    socket.current.on("connect", () => {
      console.log("✅ Dashboard Socket connected:", socket.current.id);
      if (effectiveProductId) {
        console.log("[DASHBOARD] joinRoom:", effectiveProductId);
        socket.current.emit("joinRoom", effectiveProductId);
      }
    });

    socket.current.on("reconnect", () => {
      console.log("🔁 Dashboard reconnected");
      if (effectiveProductId) socket.current.emit("joinRoom", effectiveProductId);
    });

    // ---------------------------
    // ✅ Handle Flow + Quality: flometervalveData
    // payload: { product_id, stacks: [...] }
    // ---------------------------
    const handleSensorData = (payload) => {
      console.log("Received flometervalveData payload:", payload);

      if (!payload || !Array.isArray(payload.stacks)) return;

      const incomingProductId = String(payload.product_id || payload.productId || "");
      if (!incomingProductId) return;

      // Optional guard (keeps noise away if other products are streaming)
      const selectedPid = String(selectedProductIdRef.current || "");
      if (selectedPid && incomingProductId !== selectedPid) return;

      // STP stack for TURB / PRESSUERE
      const stpStack = payload.stacks.find(
        (s) =>
          String(s.stackName || "").trim().toLowerCase() === "stp" &&
          String(s.stationType || "").trim().toLowerCase() === "effluent"
      );

      // STP inlet & outlet flow stacks
      const inletStack = payload.stacks.find(
        (s) => String(s.stackName || "").trim().toLowerCase() === "stp inlet"
      );
      const outletStack = payload.stacks.find(
        (s) => String(s.stackName || "").trim().toLowerCase() === "stp outlet"
      );

      const nowIso = new Date().toISOString();

      // Quality
      if (stpStack) {
        const nextTurb =
          typeof stpStack.TURB === "number" ? stpStack.TURB : null;

        const nextPressure =
          typeof stpStack.PRESSUERE === "number"
            ? stpStack.PRESSUERE
            : typeof stpStack.PRESSURE === "number"
              ? stpStack.PRESSURE
              : null;

        setQuality((prev) => {
          const changed =
            prev.turbidity !== nextTurb || prev.pressure !== nextPressure;
          if (!changed) return prev;
          return {
            turbidity: nextTurb,
            pressure: nextPressure,
            lastUpdated: nowIso,
          };
        });
      }

      // Flow
      const nextInletCum =
        inletStack && typeof inletStack.cumulatingFlow === "number"
          ? inletStack.cumulatingFlow
          : null;

      const nextOutletCum =
        outletStack && typeof outletStack.cumulatingFlow === "number"
          ? outletStack.cumulatingFlow
          : null;

      const nextInletRate =
        inletStack && typeof inletStack.flowRate === "number"
          ? inletStack.flowRate
          : null;

      const nextOutletRate =
        outletStack && typeof outletStack.flowRate === "number"
          ? outletStack.flowRate
          : null;

      setFlow((prev) => {
        const changed =
          prev.inletCum !== nextInletCum ||
          prev.outletCum !== nextOutletCum ||
          prev.inletRate !== nextInletRate ||
          prev.outletRate !== nextOutletRate;
        if (!changed) return prev;
        return {
          inletCum: nextInletCum,
          outletCum: nextOutletCum,
          inletRate: nextInletRate,
          outletRate: nextOutletRate,
          lastUpdated: nowIso,
        };
      });
    };

    // ---------------------------
    // ✅ Handle Tanks: data
    // payload: { product_id, tankData:[{tankName,percentage}] }
    // ---------------------------
    const handleTankData = (payload) => {
      console.log("Processing tank payload:", payload);

      if (!payload || !Array.isArray(payload.tankData)) return;

      const incomingProductId = String(payload.product_id || payload.productId || "");
      if (!incomingProductId) return;

      // Optional guard
      const selectedPid = String(selectedProductIdRef.current || "");
      if (selectedPid && incomingProductId !== selectedPid) return;

      const nowIso = new Date().toISOString();

      const getPctByNameIncludes = (keyword) => {
        const m = payload.tankData.find((t) =>
          String(t.tankName || "")
            .toLowerCase()
            .includes(keyword.toLowerCase())
        );
        const pct = Number(m?.percentage);
        return Number.isFinite(pct) ? Math.round(pct * 100) / 100 : null;
      };

      const next = {
        equalization: getPctByNameIncludes("equal"),
        aeration: getPctByNameIncludes("aerat"),
        decant: getPctByNameIncludes("decant"),
        sludge: getPctByNameIncludes("sludge"),
        treated: getPctByNameIncludes("treated"),
        lastUpdated: nowIso,
      };

      setTanks((prev) => {
        const changed =
          prev.equalization !== next.equalization ||
          prev.aeration !== next.aeration ||
          prev.decant !== next.decant ||
          prev.sludge !== next.sludge ||
          prev.treated !== next.treated;
        if (!changed) return prev;
        return next;
      });
    };

    const handlePumpUpdates = (payload) => {
      console.log("Dashboard pump update:", payload);

      const now = getPayloadTime(payload);

      const cycleObj = Array.isArray(payload?.cycle_status)
        ? payload.cycle_status[0]
        : payload?.cycle_status;

      if (cycleObj) {
        setCycleStatus(cycleObj);
        setCycleUpdatedAt(new Date().toISOString());
      }

      // ---- SBR (cycle_status) ----
      const activeSbr = getActiveOnKey(payload?.cycle_status);
      if (activeSbr) {
        setSbrPhase((prev) => {
          if (prev !== activeSbr) {
            setSbrSince(now);
            setSbrElapsedMin(0);
          }
          return activeSbr;
        });
        setSbrSince((prev) => prev || now);
      }

      // ---- FILTER (filling_status) ----
      const activeFilter = getActiveOnKey(payload?.filling_status);
      if (activeFilter) {
        setFilterPhase((prev) => {
          if (prev !== activeFilter) {
            setFilterSince(now);
            setFilterElapsedMin(0);
          }
          return activeFilter;
        });
        setFilterSince((prev) => prev || now);
      }
    };

    socket.current.on("pumpAck", handlePumpUpdates);
    socket.current.on("pumpStateUpdate", handlePumpUpdates);


    socket.current.on("flometervalveData", handleSensorData);
    socket.current.on("data", handleTankData);

    return () => {
      if (!socket.current) return;
      socket.current.off("flometervalveData", handleSensorData);
      socket.current.off("data", handleTankData);
      socket.current?.off("pumpAck", handlePumpUpdates);
      socket.current?.off("pumpStateUpdate", handlePumpUpdates);

    };
  }, [backendUrl, effectiveProductId]);

  // If productId changes, re-join
  useEffect(() => {
    if (socket.current && socket.current.connected && effectiveProductId) {
      console.log("[DASHBOARD] product changed -> joinRoom:", effectiveProductId);
      socket.current.emit("joinRoom", effectiveProductId);
    }
  }, [effectiveProductId]);

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      if (sbrSince) setSbrElapsedMin(minsBetween(sbrSince, now));
      if (filterSince) setFilterElapsedMin(minsBetween(filterSince, now));
    }, 10000); // every 10s

    return () => clearInterval(t);
  }, [sbrSince, filterSince]);


  // ---------------------------
  // Helpers
  // ---------------------------
  const fmt = (v, suffix = "") => {
    if (v === null || typeof v === "undefined") return "--";
    if (typeof v === "number") return `${v}${suffix}`;
    return `${v}${suffix}`;
  };

  const getActiveOnKey = (objOrArr) => {
    const obj = Array.isArray(objOrArr) ? objOrArr[0] : objOrArr;
    if (!obj || typeof obj !== "object") return null;

    for (const [k, v] of Object.entries(obj)) {
      const s = String(v).trim().toUpperCase();
      if (s === "ON" || v === 1 || v === true) return k;
    }
    return null;
  };

  const getPayloadTime = (payload) => {
    if (payload?.timestamp) {
      const d = new Date(payload.timestamp);
      if (!Number.isNaN(d.getTime())) return d;
    }
    if (payload?.ntpTime && typeof payload.ntpTime === "string") {
      const d = new Date(payload.ntpTime.trim().replace(" ", "T"));
      if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  const minsBetween = (a, b) => Math.max(0, Math.floor((b - a) / 60000));


  // ---------------------------
  // Your SVG
  // ---------------------------
  const MediaFilterSVG = ({ className = "", style = {} }) => (
    <svg
      className={className}
      style={style}
      viewBox="0 0 160 220"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Filter media tank"
      role="img"
    >
      <defs>
        <linearGradient id="tankBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eaf2ff" stopOpacity="0.22" />
          <stop offset="0.45" stopColor="#b7c7dc" stopOpacity="0.08" />
          <stop offset="1" stopColor="#0b1322" stopOpacity="0.28" />
        </linearGradient>

        <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef6ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#93a7be" stopOpacity="0.18" />
        </linearGradient>

        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="8"
            floodColor="#000"
            floodOpacity="0.35"
          />
        </filter>

        <clipPath id="tankClip">
          <rect x="18" y="26" width="124" height="168" rx="28" />
        </clipPath>
      </defs>

      <g filter="url(#softShadow)">
        <rect
          x="18"
          y="26"
          width="124"
          height="168"
          rx="28"
          fill="url(#tankBody)"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="2"
        />

        <ellipse
          cx="80"
          cy="194"
          rx="62"
          ry="18"
          fill="rgba(10,18,30,0.55)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
        />

        <g opacity="0.95">
          <rect
            x="38"
            y="202"
            width="14"
            height="18"
            rx="4"
            fill="rgba(15,24,40,0.9)"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1.5"
          />
          <rect
            x="108"
            y="202"
            width="14"
            height="18"
            rx="4"
            fill="rgba(15,24,40,0.9)"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1.5"
          />

          <rect
            x="34"
            y="218"
            width="22"
            height="6"
            rx="3"
            fill="rgba(0,0,0,0.45)"
          />
          <rect
            x="104"
            y="218"
            width="22"
            height="6"
            rx="3"
            fill="rgba(0,0,0,0.45)"
          />
        </g>
      </g>

      <g clipPath="url(#tankClip)">
        <rect x="18" y="36" width="124" height="46" fill="#0e7f8c" opacity="0.85" />
        <rect x="18" y="82" width="124" height="40" fill="#b3a98f" opacity="0.92" />
        <rect x="18" y="122" width="124" height="26" fill="#9fd67b" opacity="0.9" />
        <rect x="18" y="148" width="124" height="24" fill="#d8cf8a" opacity="0.95" />
        <rect x="18" y="172" width="124" height="22" fill="#7b2e8b" opacity="0.95" />

        {Array.from({ length: 11 }).map((_, i) => (
          <circle
            key={i}
            cx={30 + i * 11}
            cy={162 + (i % 2) * 4}
            r={3.2}
            fill="rgba(255,255,255,0.18)"
          />
        ))}

        <line
          x1="80"
          y1="32"
          x2="80"
          y2="192"
          stroke="rgba(20,25,35,0.55)"
          strokeWidth="2"
          strokeDasharray="6 6"
        />

        <path
          d="M38 36 C30 70, 30 140, 40 194"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      </g>
    </svg>
  );

  // ---------------------------
  // Existing chart demo data
  // ---------------------------
  const graphData = useMemo(
    () => [
      { time: 0, inlet: 12, outlet: 10 },
      { time: 2, inlet: 15, outlet: 11 },
      { time: 4, inlet: 18, outlet: 14 },
      { time: 6, inlet: 25, outlet: 20 },
      { time: 8, inlet: 35, outlet: 28 },
      { time: 10, inlet: 42, outlet: 35 },
      { time: 12, inlet: 40, outlet: 32 },
      { time: 14, inlet: 38, outlet: 30 },
      { time: 16, inlet: 30, outlet: 24 },
      { time: 18, inlet: 22, outlet: 18 },
      { time: 20, inlet: 15, outlet: 12 },
      { time: 22, inlet: 12, outlet: 9 },
      { time: 24, inlet: 10, outlet: 8 },
    ],
    []
  );

  const xTicks = useMemo(() => Array.from({ length: 25 }, (_, i) => i), []);

  return (
    <div className="special-dashboard-wrapper container-fluid">
      <div className="dashboard-content">
        {/* ===== HEADER ===== */}
        <div className="top-header">
          <div className="top-header-left">
            <img className="hdr-logo" src={genexlogo} alt="Genex" width={100} height={100} />
          </div>

          <div className="top-header-center">
            48 KLD SBR STP - PLANT OVERVIEW SCREEN
          </div>

          <div className="top-header-right">
            <button
              type="button"
              onClick={() => navigate("/autonerve")}
              style={{
                backgroundColor: "#ffffff",
                color: "#1f9d55",
                fontWeight: "700",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #1f9d55",
                cursor: "pointer",
                letterSpacing: "0.4px",
                boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
              }}
            >
              Control Panel
            </button>

            <div className="hdr-pill">
              Product:&nbsp;<span className="hdr-ok">{fmt(effectiveProductId)}</span>
            </div>

            <div className="hdr-date">
              RT Updated: {fmt(flow.lastUpdated || tanks.lastUpdated || quality.lastUpdated)}
            </div>
          </div>
        </div>

        {/* ===== PROCESS PANEL ===== */}
        <div className="panel panel-process panel-process-flat">
          <div className="process-stage pf-fit pf-fit-compact">
            {/* INLET */}
            <div className="pf-inlet pf-node">
              <div className="pf-iconBox">
                <Gauge size={34} />
              </div>
              <div className="pf-label-top">Inlet</div>

              {/* ✅ Showing what you asked: STP inlet cumulative flow */}
              <div className="pf-label-sub">
                Inlet Cum: <b>{fmt(flow.inletCum, " m³")}</b>
              </div>

              {/* Optional: flow rate (keeps useful if you want) */}
              <div className="pf-label-sub" style={{ opacity: 0.85 }}>
                Inlet Rate: <b>{fmt(flow.inletRate, " m³/hr")}</b>
              </div>
            </div>

            <div className="pf-pipe pf-pipe-inlet pf-arrow" />

            {/* EQ TANK */}
            <div className="pf-tank pf-eq pf-tank-compact">
              <div className="pf-tank-title">EQ Tank</div>
              <div className="pf-tank-box">
                <div className="pf-tank-headspace" />
                <div
                  className="pf-liquid"
                  style={{ height: `${tanks.equalization ?? 0}%` }}
                />
                <div className="pf-level-text">
                  Level: {fmt(tanks.equalization, "%")}
                </div>
              </div>
              <div className="pf-tank-footer" />
            </div>

            <div className="pf-pipe pf-pipe-eq-to-p1 pf-arrow" />

            {/* PUMP 1 */}
            <div className="pf-pump pf-pump1 pf-pump-compact">
              <div className="pf-pump-icon spin-slow">
                <Cog size={34} />
              </div>
              <div className="pf-pump-label">Pump</div>
            </div>

            {/* SBR TANK (mapped to aeration if needed) */}
            <div className="pf-tank  pf-sbr pf-tank-compact">
              <div className="pf-tank-title">SBR Tank</div>
              <div className="pf-tank-box">
                <div className="pf-tank-headspace" />
                <div
                  className="pf-liquid"
                  style={{ height: `${tanks.aeration ?? 0}%` }}
                />
                <div className="pf-level-text">
                  Level: {fmt(tanks.aeration, "%")}
                </div>
              </div>
              <div className="pf-tank-footer-sbr">
                <div className="pf-footer-title">Cycle: '{sbrPhase}'</div>

                <div className="pf-footer-title">
                  {(() => {
                    const expected = SBR_EXPECTED_MIN[sbrPhase];
                    if (!expected) return `Running: ${sbrElapsedMin} min`;

                    const remaining = Math.max(0, expected - sbrElapsedMin);
                    return `Elapsed: ${sbrElapsedMin} min | Remaining: ${remaining} min`;
                  })()}
                </div>
              </div>
            </div>

            {/* PUMP 2 */}
            <div className="pf-pump pf-pump2 pf-pump-compact">
              <div className="pf-pump-icon spin-slow">
                <Cog size={34} />
              </div>
              <div className="pf-pump-label">Pump</div>
            </div>

            <div className="pf-pipe pf-pipe-p2-to-filter pf-arrow" />

            {/* FILTER */}
            <div className="pf-filter pf-filter-compact">
              <div className="pf-filter-box pf-filter-box-svg">
                <MediaFilterSVG className="pf-filter-svg" />
              </div>

              <div className="pf-filter-title">Filter</div>
              <div className="pf-filter-sub">Cycle: '{filterPhase}'</div>
            </div>

            <div className="pf-pipe pf-pipe-p2-to-treated pf-arrow" />

            {/* TREATED WATER TANK */}
            <div className="pf-tank pf-treated pf-tank-compact">
              <div className="pf-tank-title">Treated Water Tank</div>
              <div className="pf-tank-box">
                <div className="pf-tank-headspace" />
                <div
                  className="pf-liquid"
                  style={{ height: `${tanks.treated ?? 0}%` }}
                />
                <div className="pf-level-text">
                  Level: {fmt(tanks.treated, "%")}
                </div>
              </div>
              <div className="pf-tank-footer" />
            </div>

            <div className="pf-pipe pf-pipe-treated-to-outlet pf-arrow" />

            {/* OUTLET */}
            <div className="pf-outlet pf-node">
              <div className="pf-label-top">Reuse / Discharge</div>
              <div className="pf-iconBox">
                <Recycle size={34} />
              </div>

              {/* ✅ Showing what you asked: STP outlet cumulative flow */}
              <div className="pf-label-sub-treated">
                Outlet Cum: <b>{fmt(flow.outletCum, " m³")}</b>
              </div>

              {/* Optional: outlet rate */}
              <div className="pf-label-sub-treated" style={{ opacity: 0.85 }}>
                Outlet Rate: <b>{fmt(flow.outletRate, " m³/hr")}</b>
              </div>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM GRID ===== */}
        <div className="bottom-layout">
          {/* LEFT STACK */}
          <div className="stack-col">
            <div className="panel panel-card">
              <div className="panel-title">WATER QUALITY MONITORING</div>
              <div className="panel-body">
                <div className="kv">
                  <span>pH:</span> <strong>{fmt(6.8, " S.U")}</strong>
                </div>

                {/* ✅ Real Turbidity from STP stack */}
                <div className="kv">
                  <span>Turbidity:</span>{" "}
                  <strong>{fmt(quality.turbidity, " NTU")}</strong>
                </div>

                {/* <div className="kv">
                  <span>Pressure:</span>{" "}
                  <strong>{fmt(quality.pressure, "")}</strong>
                </div> */}

                <div className="kv">
                  <span>Chlorine:</span> <strong>--</strong>
                </div>
                <div className="kv">
                  <span>TSS:</span> <strong>{fmt(300, " mg/L")}</strong>
                </div>
                <div className="kv">
                  <span>BOD</span> <strong>{fmt(260, " mg/L")}</strong>
                </div>
                <div className="kv">
                  <span>COD</span> <strong>{fmt(500, " mg/L")}</strong>
                </div>
              </div>
            </div>

            <div className="panel panel-card">
              <div className="panel-title">ALARMS &amp; INTERLOCKS</div>
              <div className="panel-body alarms">
                <div className="alarm-row">
                  <div className="alarm-name">Blower Trip</div>
                  <div className="alarm-time">--</div>
                  <div className="alarm-status active">--</div>
                  <div className="alarm-led red" />
                </div>

                <div className="alarm-row">
                  <div className="alarm-name">High Level</div>
                  <div className="alarm-time">--</div>
                  <div className="alarm-status ack">--</div>
                  <div className="alarm-led yellow" />
                </div>

                <div className="alarm-row last">
                  <div className="alarm-name">Power Failure</div>
                  <div className="alarm-time">--</div>
                  <div className="alarm-status active">--</div>
                  <div className="alarm-led red" />
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE (TREND) */}
          <div className="mid-col">
            <div className="panel panel-card h100">
              <div className="panel-title center">DAILY CONSUMPTION TREND</div>

              <div className="chart-legend-strip">
                <div className="legend-line" />
                <div className="legend-text">Daily Water Consumption</div>
              </div>

              <div className="panel-body chart-body">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={graphData} // Ensure graphData has { time, inlet, outlet }
                    margin={{ top: 10, right: 12, bottom: 22, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={true} opacity={0.4} />
                    <XAxis
                      dataKey="time"
                      type="number"
                      domain={[0, 24]}
                      ticks={xTicks}
                      tick={{ fontSize: 11 }}
                      label={{
                        value: "Time (Hrs)",
                        position: "insideBottom",
                        offset: -10,
                      }}
                    />
                    <YAxis
                      domain={[0, 50]}
                      ticks={[0, 10, 20, 30, 40, 50]}
                      tick={{ fontSize: 11 }}
                      label={{
                        value: "Flow (m³)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10,16,28,0.95)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 8,
                        color: "#e2e8f0",
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "#e2e8f0" }}
                    /* Tooltip will now show both Inlet and Outlet automatically */
                    />
                    <Legend wrapperStyle={{ display: "none" }} />

                    {/* CHANGE 2: The Inlet Line (Blue) */}
                    <Line
                      name="STP Inlet"
                      type="monotone"
                      dataKey="inlet"
                      stroke="#3b82f6"
                      strokeWidth={2.8}
                      dot={false}
                      isAnimationActive={true}
                    />

                    {/* CHANGE 3: The Outlet Line (Green) */}
                    <Line
                      name="STP Outlet"
                      type="monotone"
                      dataKey="outlet"
                      stroke="#10b981"
                      strokeWidth={2.8}
                      dot={false}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* RIGHT STACK */}
          <div className="stack-col">
            <div className="panel panel-card">
              <div className="panel-title">TANK &amp; EQUIPMENT STATUS</div>
              <div className="panel-body">
                <div className="kv">
                  <span>EQ Tank Level:</span>{" "}
                  <strong className="ok">{fmt(tanks.equalization, "%")}</strong>
                </div>

                {/* If you really want SBR specifically, you can map to aeration for now */}
                <div className="kv">
                  <span>Aeration Tank Level:</span>{" "}
                  <strong className="ok">{fmt(tanks.aeration, "%")}</strong>
                </div>

                <div className="kv">
                  <span>Decant Tank Level:</span>{" "}
                  <strong className="ok">{fmt(tanks.decant, "%")}</strong>
                </div>

                <div className="kv">
                  <span>Sludge Tank Level:</span>{" "}
                  <strong className="ok">{fmt(tanks.sludge, "%")}</strong>
                </div>

                <div className="kv">
                  <span>Treated Tank Level:</span>{" "}
                  <strong className="ok">{fmt(tanks.treated, "%")}</strong>
                </div>

                <div className="kv" style={{ opacity: 0.75 }}>
                  <span>Updated:</span> <strong>{fmt(tanks.lastUpdated)}</strong>
                </div>
              </div>
            </div>

            <div className="panel panel-card status-card">
              <div className="panel-title center">OVERALL PLANT STATUS</div>
              <div className="status-body">
                <div className="status-left">
                  <div className="status-badge">
                    <span className="status-check">
                      <CheckCircle2 size={44} />
                    </span>
                  </div>
                </div>
                <div className="status-right">
                  <div className="status-led" />
                  <div className="status-text">Normal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional debug strip */}
        {/* <pre style={{ color: "#fff" }}>{JSON.stringify({ flow, quality, tanks }, null, 2)}</pre> */}
      </div>
    </div>
  );
}
