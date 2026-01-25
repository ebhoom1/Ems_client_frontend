import React, { useMemo } from "react";
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

export default function DashboardSpecial() {
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
        <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.35" />
      </filter>

      <clipPath id="tankClip">
        <rect x="18" y="26" width="124" height="168" rx="28" />
      </clipPath>
    </defs>

    {/* outer shadow */}
    <g filter="url(#softShadow)">
      {/* tank body */}
      <rect x="18" y="26" width="124" height="168" rx="28" fill="url(#tankBody)" stroke="rgba(255,255,255,0.20)" strokeWidth="2"/>

      
     

      {/* bottom rim */}
{/* bottom rim */}
<ellipse
  cx="80"
  cy="194"
  rx="62"
  ry="18"
  fill="rgba(10,18,30,0.55)"
  stroke="rgba(255,255,255,0.18)"
  strokeWidth="2"
/>

{/* legs */}
<g opacity="0.95">
  {/* left leg */}
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
  {/* right leg */}
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

  {/* small foot pads */}
  <rect x="34" y="218" width="22" height="6" rx="3" fill="rgba(0,0,0,0.45)" />
  <rect x="104" y="218" width="22" height="6" rx="3" fill="rgba(0,0,0,0.45)" />
</g>
    </g>

    {/* contents (layered media) */}
    <g clipPath="url(#tankClip)">
      {/* cyan water layer */}
      <rect x="18" y="36" width="124" height="46" fill="#0e7f8c" opacity="0.85" />
      {/* beige layer */}
      <rect x="18" y="82" width="124" height="40" fill="#b3a98f" opacity="0.92" />
      {/* green layer */}
      <rect x="18" y="122" width="124" height="26" fill="#9fd67b" opacity="0.9" />
      {/* sand layer */}
      <rect x="18" y="148" width="124" height="24" fill="#d8cf8a" opacity="0.95" />
      {/* purple bottom */}
      <rect x="18" y="172" width="124" height="22" fill="#7b2e8b" opacity="0.95" />

      {/* tiny “media stones” pattern */}
      {Array.from({ length: 11 }).map((_, i) => (
        <circle
          key={i}
          cx={30 + i * 11}
          cy={162 + (i % 2) * 4}
          r={3.2}
          fill="rgba(255,255,255,0.18)"
        />
      ))}

      {/* center dashed line */}
      <line
        x1="80"
        y1="32"
        x2="80"
        y2="192"
        stroke="rgba(20,25,35,0.55)"
        strokeWidth="2"
        strokeDasharray="6 6"
      />

      {/* gloss highlight */}
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

  const graphData = useMemo(
    () => [
      { time: 0, val: 10 },
      { time: 1, val: 6 },
      { time: 2, val: 5 },
      { time: 3, val: 5 },
      { time: 4, val: 6 },
      { time: 5, val: 7 },
      { time: 6, val: 8 },
      { time: 7, val: 25 },
      { time: 8, val: 22 },
      { time: 9, val: 30 },
      { time: 10, val: 34 },
      { time: 11, val: 31 },
      { time: 12, val: 40 },
      { time: 13, val: 46 },
      { time: 14, val: 38 },
      { time: 15, val: 28 },
      { time: 16, val: 24 },
      { time: 17, val: 32 },
      { time: 18, val: 20 },
      { time: 19, val: 12 },
      { time: 20, val: 14 },
      { time: 21, val: 15 },
      { time: 22, val: 12 },
      { time: 23, val: 10 },
      { time: 24, val: 8 },
    ],
    []
  );

  const xTicks = useMemo(() => Array.from({ length: 25 }, (_, i) => i), []);

  return (
    <div className="special-dashboard-wrapper container-fluid">
      <div className="dashboard-content">
        {/* ===== HEADER ===== */}
        <div className="top-header">
          <div className="top-header-center">
            48 KLD SBR STP - PLANT OVERVIEW SCREEN
          </div>

          <div className="top-header-right">
            <div className="hdr-pill">
              Power Supply:&nbsp;<span className="hdr-ok">EQ</span>
            </div>
            <div className="hdr-date">24-Apr-2026 10:45 AM</div>
          </div>
        </div>

        {/* ===== PROCESS PANEL (SINGLE BOX + COMPACT TANKS LIKE REF) ===== */}
        <div className="panel panel-process panel-process-flat">
          <div className="process-stage pf-fit pf-fit-compact">
            {/* INLET */}
            <div className="pf-inlet pf-node">
              <div className="pf-iconBox">
                <Gauge size={34} />
              </div>
              <div className="pf-label-top">Inlet</div>
              <div className="pf-label-sub">Inlet Flow: 12.5 m³/hr</div>
            </div>

            {/* PIPE inlet -> EQ */}
            <div className="pf-pipe pf-pipe-inlet pf-arrow" />

            {/* EQ TANK */}
            <div className="pf-tank pf-eq pf-tank-compact">
              <div className="pf-tank-title">EQ Tank</div>
              <div className="pf-tank-box">
                <div className="pf-tank-headspace" />
                <div className="pf-liquid" style={{ height: "75%" }} />
                <div className="pf-level-text">Level: 75%</div>
              </div>
              <div className="pf-tank-footer">
                {/* <div className="pf-footer-title-spl">EQ Tank</div> */}
              </div>
            </div>

            <div className="pf-pipe pf-pipe-eq-to-p1 pf-arrow" />

            {/* PUMP 1 */}
            <div className="pf-pump pf-pump1 pf-pump-compact">
              <div className="pf-pump-icon spin-slow">
                <Cog size={34} />
              </div>
              <div className="pf-pump-label">Pump</div>
            </div>

            {/* SBR TANK */}
            <div className="pf-tank  pf-sbr pf-tank-compact">
              <div className="pf-tank-title">SBR Tank</div>
              <div className="pf-tank-box">
                <div className="pf-tank-headspace" />
                <div className="pf-liquid" style={{ height: "60%" }} />
                <div className="pf-level-text">Level: 60%</div>
              </div>
              <div className="pf-tank-footer-sbr">
                {/* <div className="pf-footer-title-spl">SBR Tank</div> */}
                <div className="pf-footer-title">Cycle:'React'</div>
                <div className="pf-footer-title">Remaining Time:12 min</div>
              </div>
            </div>

            {/* PUMP 2 */}
            <div className="pf-pump pf-pump2 pf-pump-compact">
              <div className="pf-pump-icon spin-slow">
                <Cog size={34} />
              </div>
              <div className="pf-pump-label">Pump</div>
            </div>

            {/* PIPE Pump2 -> Filter */}
            <div className="pf-pipe pf-pipe-p2-to-filter pf-arrow" />

            {/* FILTER */}
            <div className="pf-filter pf-filter-compact">
              {/* <div className="pf-filter-box">
                <div className="pf-filter-col" />
                <div className="pf-filter-col" />
                <div className="pf-filter-u" />
              </div> */}
              <div className="pf-filter-box pf-filter-box-svg">
  <MediaFilterSVG className="pf-filter-svg" />
</div>


              <div className="pf-filter-title">Filter</div>
              <div className="pf-filter-sub">Cycle: 'Backwash'</div>
            </div>

            <div className="pf-pipe pf-pipe-p2-to-treated pf-arrow" />

            {/* TREATED WATER TANK */}
            <div className="pf-tank pf-treated pf-tank-compact">
              <div className="pf-tank-title">Treated Water Tank</div>
              <div className="pf-tank-box">
                <div className="pf-tank-headspace" />
                <div className="pf-liquid" style={{ height: "85%" }} />
                <div className="pf-level-text">Level: 85%</div>
              </div>
              <div className="pf-tank-footer">
                {/* <div className="pf-footer-title">Treated Water Tank</div> */}
              </div>
            </div>

            {/* PIPE treated -> outlet */}
            <div className="pf-pipe pf-pipe-treated-to-outlet pf-arrow" />

            {/* OUTLET */}
            <div className="pf-outlet pf-node">
              <div className="pf-label-top">Reuse / Discharge</div>
              <div className="pf-iconBox">
                <Recycle size={34} />
              </div>
              <div className="pf-label-sub-treated">
                Treated Water Flow: 10.8 m³/hr
              </div>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM GRID (LEFT | MIDDLE | RIGHT) ===== */}
        <div className="bottom-layout">
          {/* LEFT STACK */}
          <div className="stack-col">
            <div className="panel panel-card">
              <div className="panel-title">WATER QUALITY MONITORING</div>
              <div className="panel-body">
                <div className="kv">
                  <span>pH:</span> <strong>7.2</strong>
                </div>
                <div className="kv">
                  <span>Turbidity:</span> <strong>2.5 NTU</strong>
                </div>
                <div className="kv">
                  <span>Residual Chlorine:</span> <strong>0.6 mg/L</strong>
                </div>
                <div className="kv">
                  <span>TSS:</span> <strong>8 mg/L</strong>
                </div>
                <div className="kv">
                  <span>BOD / COD:</span> <strong>12 mg/L</strong>
                </div>
              </div>
            </div>

            <div className="panel panel-card">
              <div className="panel-title">ALARMS &amp; INTERLOCKS</div>
              <div className="panel-body alarms">
                <div className="alarm-row">
                  <div className="alarm-name">Blower Trip</div>
                  <div className="alarm-time">10:42 AM</div>
                  <div className="alarm-status active">Active</div>
                  <div className="alarm-led red" />
                </div>

                <div className="alarm-row">
                  <div className="alarm-name">High Level</div>
                  <div className="alarm-time">10:30 AM</div>
                  <div className="alarm-status ack">Acknowledged</div>
                  <div className="alarm-led yellow" />
                </div>

                <div className="alarm-row last">
                  <div className="alarm-name">Power Failure</div>
                  <div className="alarm-time">10:15 AM</div>
                  <div className="alarm-status active">Active</div>
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
                    data={graphData}
                    margin={{ top: 10, right: 12, bottom: 22, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="0" vertical={true} />
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
                        value: "Consumption (m³)",
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
                    />
                    <Legend wrapperStyle={{ display: "none" }} />
                    <Line
                      type="monotone"
                      dataKey="val"
                      strokeWidth={2.8}
                      dot={false}
                      isAnimationActive={false}
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
                  <strong className="ok">75% (Green)</strong>
                </div>
                <div className="kv">
                  <span>SBR Tank Level:</span>{" "}
                  <strong className="ok">60% (Green)</strong>
                </div>
                <div className="kv">
                  <span>Treated Water Tank Level:</span>{" "}
                  <strong className="ok">85% (Green)</strong>
                </div>
                <div className="kv">
                  <span>Blower Status:</span>{" "}
                  <strong className="ok">Running (Green)</strong>
                </div>
                <div className="kv">
                  <span>Disinfection System:</span>{" "}
                  <strong className="ok">ON (Green)</strong>
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
      </div>
    </div>
  );
}
