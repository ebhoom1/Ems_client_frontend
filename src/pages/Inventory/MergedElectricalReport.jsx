// src/components/MergedElectricalReport.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";
import { useParams } from "react-router-dom";
import genexlogo from "../../assests/images/logonewgenex.png";
import { useNavigate } from "react-router-dom";

// Recharts imports for bar charts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function MergedElectricalReport() {
  const navigate = useNavigate();
  const { userName, year, month } = useParams();
  const adminType = useSelector(
    (s) => s.user.userData?.validUserOne?.adminType
  );

  const [reports, setReports] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();

  const phases = ["RY", "YB", "BR"];
  const checklist = [
    { id: 1, label: "Voltage (V)" },
    { id: 2, label: "Current (A)" },
    { id: 3, label: "Power (kW)" },
    { id: 4, label: "Check starter controls and connection" },
    { id: 5, label: "Check contractor for free movement and servicing" },
    { id: 6, label: "Check OLR condition and note ampere set" },
    { id: 7, label: "Check earthing" },
    { id: 8, label: "Examine exposed cables, joints & bus bars" },
  ];

  // Load merged reports
  useEffect(() => {
    const url = `${API_URL}/api/electricalreports/user/${encodeURIComponent(
      userName
    )}/${year}/${month}`;
    console.log("api ", url);

    axios
      .get(url)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.reports)) {
          setReports(res.data.reports);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userName, year, month]);

  // Load company name
  useEffect(() => {
    if (!userName) return;
    axios
      .get(
        `${API_URL}/api/get-user-by-userName/${encodeURIComponent(userName)}`
      )
      .then((res) => setCompanyName(res.data.user?.companyName || "—"))
      .catch(() => setCompanyName("—"));
  }, [userName]);

  if (loading) return <p>Loading…</p>;

  // pick latest per equipment
  const latestByEquipment = Object.values(
    reports.reduce((acc, r) => {
      const key = r.equipment?.name || "Unknown";
      if (!acc[key] || new Date(r.createdAt) > new Date(acc[key].createdAt)) {
        acc[key] = r;
      }
      return acc;
    }, {})
  );

  // Helpers for ticks & coloring
  const getMeasurementColor = (rowId, phaseKey, resp) => {
    const measured = parseFloat(resp[rowId]?.[phaseKey] || "");
    const actual = parseFloat(resp[rowId]?.actual || "");
    if (isNaN(measured) || isNaN(actual)) return "black";
    return measured > actual ? "red" : "green";
  };
  const renderStatusSymbol = (rowId, resp) => {
    const status = resp[rowId]?.remarkStatus;
    if (status === "pass") return <span style={{ color: "green" }}>✓</span>;
    if (status === "fail") return <span style={{ color: "red" }}>✕</span>;
    return "—";
  };
  const getRemarkColorClass = (rowId, resp) => {
    const status = resp[rowId]?.remarkStatus;
    if (status === "pass") return "text-success";
    if (status === "fail") return "text-danger";
    return "";
  };

  // Build chart data
  const buildVoltageData = (resp) => [
    {
      name: "Voltage",
      RY: Number(resp[1]?.RY || 0),
      YB: Number(resp[1]?.YB || 0),
      BR: Number(resp[1]?.BR || 0),
    },
  ];
  const buildCurrentData = (resp) => [
    {
      name: "Current",
      R: Number(resp[2]?.R || 0),
      Y: Number(resp[2]?.Y || 0),
      B: Number(resp[2]?.B || 0),
    },
  ];

  // PDF export
  const downloadPDF = () => {
    console.log("clicked")
    html2pdf()
      .set({
        margin: [30, 10, 30, 10],
        filename: `Merged_Electrical_Report_${userName}_${year}_${month}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      })
      .from(reportRef.current)
      .save();
  };

  // Table cell styles
  const th = {
    border: "1px solid #000",
    padding: 4,
    background: "#eee",
    textAlign: "center",
    fontSize: "12px",
  };
  const td = { border: "1px solid #000", padding: 4, fontSize: "12px" };
  const tdC = { ...td, textAlign: "center" };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button className="btn btn-success" onClick={downloadPDF}>
          ⬇ Download PDF
        </button>
      </div>

      <div
        ref={reportRef}
        style={{ background: "#fff", padding: 10, border: "1px solid #000" }}
      >
        {/* Single merged header */}
        <div
          className="d-flex align-items-center mb-2"
          style={{ background: "#236a80", color: "#fff", padding: 10 }}
        >
          <img
            src={genexlogo}
            crossOrigin="anonymous"
            alt="Genex logo"
            style={{ maxWidth: 120, maxHeight: 120 }}
          />
          <div
            className="text-center flex-grow-1"
            style={{ fontFamily: "Century Gothic, sans-serif" }}
          >
            <div style={{ fontSize: 20, fontWeight: "bold" }}>
              <i
                style={{
                  fontFamily: '"Comic Sans MS", cursive',
                  fontSize: 24,
                }}
              >
                Genex
              </i>{" "}
              Utility Management Pvt Ltd
            </div>
            <div style={{ fontSize: 14 }}>
             Sujatha Arcade, Second Floor, #32 Lake View Defence Colony, Shettihalli, Post, Jalahalli West, Bengaluru, Karnataka 560015
            </div>
            <div style={{ fontSize: 14 }}>Phone: +91-9663044156</div>
          </div>
        </div>
        <h6 className="text-center">
          Merged Report — {companyName} — ({userName}){" "}
          {new Date(year, month - 1).toLocaleString("default", {
            month: "long",
          })}{" "}
          {year}
        </h6>
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            fontWeight: "bold",
            borderTop: "2px solid #000",
            borderBottom: "2px solid #000",
            padding: "4px 0",
            marginBottom: 16,
          }}
        >
          Electrical Engineer Report
        </div>

        {latestByEquipment.map((r) => {
          const dateStr = new Date(r.createdAt).toLocaleDateString("en-GB");
          const resp = r.responses || {};

          return (
            <div key={r.equipment.name} style={{ marginBottom: 32 }}>
              {/* Date */}
              <div style={{ marginBottom: 8 }}>
                <strong>Date:</strong> {dateStr}
              </div>

              {/* Equipment info */}
              <table
                style={{
                  width: "100%",
                  border: "1px solid #000",
                  borderCollapse: "collapse",
                  marginBottom: 12,
                }}
              >
                <tbody>
                  {[
                    [
                      "Service Engineer's Name",
                      `${r.technician.name} — ${r.technician.designation}`,
                    ],
                    ["Equipment Name", r.equipment.name],
                    ["Model", r.equipment.model],
                    ["Capacity in HP/KW", r.equipment.capacity],
                    ["Rated Load in Amps", r.equipment.ratedLoad],
                  ].map(([lbl, val]) => (
                    <tr key={lbl}>
                      <th
                        style={{
                          ...th,
                          textAlign: "left",
                          background: "#ddd",
                          fontWeight: "normal",
                        }}
                      >
                        {lbl}
                      </th>
                      <td style={td}>{val || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* — inline bar charts — */}
              <div style={{ display: "flex", gap: "4%", marginBottom: 16 }}>
                {/* Voltage chart */}
                <div style={{ width: "48%", height: 180 }}>
                  <h6 style={{ textAlign: "center", marginBottom: 4 }}>
                    Voltage (V)
                  </h6>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buildVoltageData(resp)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend verticalAlign="top" height={24} />
                      <Bar dataKey="RY" name="RY" fill="#1f77b4" />
                      <Bar dataKey="YB" name="YB" fill="#d62728" />
                      <Bar dataKey="BR" name="BR" fill="#2ca02c" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Current chart */}
                <div style={{ width: "48%", height: 180 }}>
                  <h6 style={{ textAlign: "center", marginBottom: 4 }}>
                    Current (A)
                  </h6>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buildCurrentData(resp)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend verticalAlign="top" height={24} />
                      <Bar dataKey="R" name="R" fill="#d62728" />
                      <Bar dataKey="Y" name="Y" fill="#ffbf00" />
                      <Bar dataKey="B" name="B" fill="#1f77b4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Checklist table */}
              <table
                style={{
                  width: "100%",
                  border: "1px solid #000",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={th}>Sl.no</th>
                    <th style={th}>Category</th>
                    <th style={th}>Actual</th>
                    <th style={th} colSpan={phases.length}>
                      Measurement
                    </th>
                    <th style={th}>Process Status</th>
                    <th style={th}>Remarks</th>
                  </tr>
                  <tr>
                    <th style={th} colSpan={3}></th>

                    <th style={th}></th>
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {checklist.map((item) => {
                    const rresp = resp[item.id] || {};

                    // Rows 1–3: two-row format
                    if (item.id <= 3) {
                      const headers =
                        item.id === 1
                          ? phases
                          : item.id === 2
                          ? ["R", "Y", "B"]
                          : ["", "", ""];
                      return (
                        <React.Fragment key={item.id}>
                          <tr>
                            <td rowSpan={2} style={tdC}>
                              {item.id}
                            </td>
                            <td rowSpan={2} style={td}>
                              {item.label}
                            </td>
                            <td rowSpan={2} style={tdC}>
                              {rresp.actual ?? "—"}
                            </td>
                            {headers.map((h, i) => (
                              <td key={i} style={tdC}>
                                <b>{h}</b>
                              </td>
                            ))}
                            <td rowSpan={2} style={tdC}>
                              {renderStatusSymbol(item.id, resp)}
                            </td>
                            <td rowSpan={2} style={td}>
                              <span
                                className={getRemarkColorClass(item.id, resp)}
                              >
                                {rresp.remark ?? "—"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            {phases.map((p) => {
                              const key =
                                item.id === 2
                                  ? { RY: "R", YB: "Y", BR: "B" }[p]
                                  : p;
                              const val = rresp[key] ?? "—";
                              const color = getMeasurementColor(
                                item.id,
                                key,
                                resp
                              );
                              return (
                                <td key={p} style={tdC}>
                                  <span style={{ color }}>{val}</span>
                                </td>
                              );
                            })}
                          </tr>
                        </React.Fragment>
                      );
                    }

                    // Rows 4–8: single-row format
                    return (
                      <tr key={item.id}>
                        <td style={tdC}>{item.id}</td>
                        <td style={td} colSpan={phases.length + 2}>
                          {item.label}
                        </td>
                        <td style={tdC}>{renderStatusSymbol(item.id, resp)}</td>
                        <td style={td}>
                          <span className={getRemarkColorClass(item.id, resp)}>
                            {rresp.remark ?? "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
