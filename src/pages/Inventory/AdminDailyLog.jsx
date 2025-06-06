/*  */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { API_URL } from "../../utils/apiConfig";
import Dashboard from "../Dashboard/Dashboard";
import DashboardSam from "../Dashboard/DashboardSam";
import HeaderSim from "../Header/HeaderSim";

export default function AdminReport() {
  const { username } = useParams();
  const { userData } = useSelector((s) => s.user);
  const adminType = userData?.validUserOne?.adminType;
  const isAdmin = userData?.validUserOne?.userType === "admin";
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  const reportRef = useRef();

  // fetch logs and equipment & logo on mount
  useEffect(() => {
    if (!isAdmin) {
      setError("Access denied");
      return;
    }

    // fetch all logs
    axios
      .get(`${API_URL}/api/dailyLog/getdailylogByUsername/${username}`)
      .then((r) => {
        const data = r.data;
        if (data.message) throw new Error(data.message);
        setLogs(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e.message));

    // fetch equipment list
    axios
      .get(`${API_URL}/api/user/${username}`)
      .then((r) => {
        if (r.data.equipment) {
          setEquipmentList(r.data.equipment.map((eq) => eq.equipmentName));
        }
      })
      .catch(console.error);

    // fetch logo
    if (adminType) {
      axios
        .get(`${API_URL}/api/logo/${adminType}`)
        .then((res) => {
          const arr = res.data?.data || [];
          if (arr.length) {
            const latest = arr.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
            setLogoUrl(latest.logoUrl);
          }
        })
        .catch(console.error);
    }
  }, [username, isAdmin, adminType]);

  const downloadPDF = async () => {
    if (!reportRef.current || !selectedLog) return;

    // Wait for all images in the container to load
    const imgs = reportRef.current.querySelectorAll("img");
    await Promise.all(
      Array.from(imgs).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve();
            else img.onload = img.onerror = resolve;
          })
      )
    );

    // Now take screenshot
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
    const imgW = canvas.width * ratio;
    const imgH = canvas.height * ratio;
    const xOffset = (pdfWidth - imgW) / 2;
    const yOffset = (pdfHeight - imgH) / 2;

    pdf.addImage(imgData, "PNG", xOffset, yOffset, imgW, imgH);
    pdf.save(`DailyLog_${username}_${selectedLog.date.slice(0, 10)}.pdf`);
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!logs.length) return <div>Loading…</div>;

  // List view
  if (!selectedLog) {
    return (
      <div className="container-fluid">
        <div className="row" style={{ backgroundColor: "white" }}>
          <div className="col-lg-3 d-none d-lg-block ">
            <DashboardSam />
          </div>
          <div className="col-lg-9 col-12 ">
            <div className="row">
              <div className="col-12">
                <HeaderSim />
              </div>
            </div>
            <div className="container py-3">
              <h4>Daily Logs for {username}</h4>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Date
                    </th>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Username
                    </th>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Company Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log._id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedLog(log)}
                    >
                      <td>{new Date(log.date).toLocaleDateString()}</td>
                      <td>{log.username}</td>
                      <td>{log.companyName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      /*   <div className="container py-3">
        <h4>Daily Logs for {username}</h4>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Username</th>
              <th>Company Name</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log._id}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedLog(log)}
              >
                <td>{new Date(log.date).toLocaleDateString()}</td>
                <td>{log.username}</td>
                <td>{log.companyName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */
    );
  }

  // Detail view
  const log = selectedLog;
  const flowReadings = log.flowReadings || [];
  const flowTotals = log.flowTotals || {};
  const inlet = flowTotals.inlet || {};
  const outlet = flowTotals.outlet || {};
  const images = selectedLog.images || [];

  return (
    <div className="container py-3">
      {/* top controls */}
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button className="btn btn-success" onClick={downloadPDF}>
          ⬇ Download PDF
        </button>
      </div>

      {/* PDF CONTENT */}
      <div
        ref={reportRef}
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          lineHeight: 1.2,
          color: "#000",
          background: "#fff",
          padding: 10,
          border: "1px solid #000",
        }}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center mb-2"
          style={{ background: "#236a80", color: "#fff", padding: "10px" }}
        >
          {/* Logo on the left */}
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${adminType} Logo`}
              style={{
                maxWidth: "120px",
                maxHeight: "120px",
                marginRight: "20px",
                flexShrink: 0,
              }}
            />
          ) : (
            <div style={{ width: "120px", height: "80px", flexShrink: 0 }}>
              Loading logo…
            </div>
          )}

          {/* Centered content that takes remaining space */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h5 style={{ margin: 0 }}>
              {selectedLog.capacity} KLD SEWAGE TREATMENT PLANT – Hilton Manyata
            </h5>
            <p style={{ margin: "5px 0 0 0" }}>
              STP Operation &amp; Maintenance By{" "}
              <strong>
                {userData?.validUserOne?.adminType} Utility Management Pvt Ltd
              </strong>
            </p>
            {equipmentList.length > 0 && (
              <p style={{ margin: "5px 0 0 0", fontSize: "11px" }}>
                <strong>Equipment:</strong> {equipmentList.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            textAlign: "center",
            margin: "10px 0",
            fontSize: "14px",
            fontWeight: "bold",
            borderTop: "2px solid #000",
            borderBottom: "2px solid #000",
            padding: "4px 0",
          }}
        >
          Daily Log Report
        </div>

        {/* Date */}
        <div style={{ marginBottom: 8 }}>
          <strong>Date:</strong> {new Date(log.date).toLocaleDateString()}
        </div>

        {/* MAIN TABLE */}
        <div
          style={{
            overflowX: "auto",
            maxHeight: "60vh",
            border: "1px solid #000",
            padding: "5px",
          }}
        >
          <table
            className="table table-bordered table-sm mb-4"
            style={{ borderCollapse: "collapse" }}
          >
            <thead className="text-center align-middle">
              <tr>
                <th rowSpan="2">Time</th>
                {equipmentList.map((eq) => (
                  <th key={eq} colSpan="2">
                    {eq}
                  </th>
                ))}
                <th rowSpan="2">Remarks</th>
              </tr>
              <tr>
                {equipmentList.map((eq) => (
                  <React.Fragment key={eq}>
                    <th>ON</th>
                    <th>OFF</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.timeEntries.map((entry, idx) => {
                let remarksCell = null;
                if (idx === 0) {
                  // Treated water
                  remarksCell = (
                    <td rowSpan={6} style={{ padding: 0 }}>
                      <table
                        className="table table-sm mb-0 text-center"
                        style={{
                          border: "1px solid #000",
                          borderCollapse: "collapse",
                        }}
                      >
                        <thead>
                          <tr>
                            <th colSpan="2">TREATED WATER</th>
                          </tr>
                        </thead>
                        {/* <tbody>
                          {log.treatedWater.map(tw => (
                            <tr key={tw.key}>
                              <td style={{ border:'1px solid #000', padding:4, textAlign:'left' }}>{tw.key}</td>
                              <td style={{ border:'1px solid #000', padding:4 }}>{tw.value}</td>
                            </tr>
                          ))}
                        </tbody> */}
                        <tbody>
                          {log.treatedWater
                            .filter((tw) => {
                              const key = (tw.key || "").toLowerCase().trim();
                              return (
                                key !== "+ add parameter" &&
                                key !== "+ add image" &&
                                !key.includes("fakepath") &&
                                key !== ""
                              );
                            })
                            .map((tw) => (
                              <tr key={tw.key}>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    padding: 4,
                                    textAlign: "left",
                                  }}
                                >
                                  {tw.key}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    padding: 4,
                                  }}
                                >
                                  {tw.value}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </td>
                  );
                }
                if (idx === 6) {
                  // Bulk remarks
                  remarksCell = (
                    <td
                      rowSpan={6}
                      style={{ verticalAlign: "top", padding: 4 }}
                    >
                      <strong>Remarks</strong>
                      <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                        {log.remarks}
                      </div>
                    </td>
                  );
                }
                if (idx === 12) {
                  // Chemical consumption
                  remarksCell = (
                    <td rowSpan={4} style={{ padding: 0 }}>
                      <table
                        className="table table-sm mb-0 text-center"
                        style={{
                          border: "1px solid #000",
                          borderCollapse: "collapse",
                        }}
                      >
                        <thead>
                          <tr>
                            <th colSpan="2">Chemical Consumption</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* {log.chemicalConsumption.map(c => (
                            <tr key={c.key}>
                              <td style={{ border:'1px solid #000', padding:4, textAlign:'left' }}>{c.key}</td>
                              <td style={{ border:'1px solid #000', padding:4 }}>{c.value}</td>
                            </tr>
                          ))} */}
                          {log.chemicalConsumption
                            .filter(
                              (c) =>
                                c.key &&
                                c.key.toLowerCase() !== "+ add chemical"
                            )
                            .map((c) => (
                              <tr key={c.key}>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    padding: 4,
                                    textAlign: "left",
                                  }}
                                >
                                  {c.key}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    padding: 4,
                                  }}
                                >
                                  {c.value}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </td>
                  );
                }
                if (idx === 16) {
                  // Back wash
                  remarksCell = (
                    <td rowSpan={4} style={{ padding: 0 }}>
                      <table
                        className="table table-sm mb-0 text-center"
                        style={{
                          border: "1px solid #000",
                          borderCollapse: "collapse",
                        }}
                      >
                        <thead>
                          <tr>
                            <th>Back wash timings:</th>
                          </tr>
                        </thead>
                        <tbody>
                          {log.backwashTimings.map((bw) => (
                            <tr key={bw.stage}>
                              <td
                                style={{
                                  border: "1px solid #000",
                                  padding: 4,
                                  textAlign: "left",
                                }}
                              >
                                {bw.stage}
                              </td>
                              <td
                                style={{ border: "1px solid #000", padding: 4 }}
                              >
                                {bw.time}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  );
                }

                return (
                  <tr key={entry.time}>
                    <td style={{ border: "1px solid #000", padding: 4 }}>
                      {entry.time}
                    </td>
                    {entry.statuses.map((st) => (
                      <React.Fragment key={st.equipment}>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: 4,
                            textAlign: "center",
                          }}
                        >
                          {st.status === "on" && (
                            <>
                              <div>✔</div>
                              <div
                                style={{ fontSize: "0.6rem", marginTop: "2px" }}
                              >
                                {st.onTime}
                              </div>
                            </>
                          )}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: 4,
                            textAlign: "center",
                          }}
                        >
                          {st.status === "off" && (
                            <>
                              <div>✔</div>
                              <div
                                style={{ fontSize: "0.6rem", marginTop: "2px" }}
                              >
                                {st.offTime}
                              </div>
                            </>
                          )}
                        </td>
                      </React.Fragment>
                    ))}
                    {remarksCell}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* RUNNING HOURS */}
        <table
          className="table table-bordered table-sm w-75 mx-auto mt-3"
          style={{ borderCollapse: "collapse" }}
        >
          <thead className="text-center">
            <tr>
              <th colSpan="2">RUNNING HOURS READING</th>
            </tr>
          </thead>
          <tbody>
            {log.runningHoursReading.map((rh) => (
              <tr key={rh.equipment}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: 4,
                    textAlign: "left",
                  }}
                >
                  {rh.equipment}
                </td>
                <td style={{ border: "1px solid #000", padding: 4 }}>
                  {rh.hours}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FLOW READINGS TABLE */}
        <table
          className="table table-bordered table-sm w-100 mx-auto mt-3"
          style={{ borderCollapse: "collapse" }}
        >
          <thead className="text-center align-middle">
            <tr>
              <th rowSpan="2">Shift</th>
              <th rowSpan="2">Operator’s Name</th>
              <th colSpan="3">Inlet Flow</th>
              <th colSpan="3">Outlet Flow</th>
            </tr>
            <tr>
              <th>Initial</th>
              <th>Final</th>
              <th>Total L</th>
              <th>Initial</th>
              <th>Final</th>
              <th>Total L</th>
            </tr>
          </thead>
          <tbody>
            {flowReadings.map((r) => (
              <tr key={r.shift}>
                <td>{r.shift}</td>
                <td>{r.operatorName || "—"}</td>
                <td>{r.inlet?.initial || "—"}</td>
                <td>{r.inlet?.final || "—"}</td>
                <td>{r.inlet?.total || "—"}</td>
                <td>{r.outlet?.initial || "—"}</td>
                <td>{r.outlet?.final || "—"}</td>
                <td>{r.outlet?.total || "—"}</td>
              </tr>
            ))}

            {(inlet.initial ||
              inlet.final ||
              outlet.initial ||
              outlet.final) && (
              <tr className="fw-bold text-center bg-light">
                <td colSpan={2}>TOTAL</td>
                <td>{inlet.initial || "—"}</td>
                <td>{inlet.final || "—"}</td>
                <td>{inlet.total || "—"}</td>
                <td>{outlet.initial || "—"}</td>
                <td>{outlet.final || "—"}</td>
                <td>{outlet.total || "—"}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Uploaded Images */}
        {images.length > 0 ? (
          <div className="mt-3">
            <h6 className="text-center mb-2">Water Quality Uploaded Images</h6>
            <div className="d-flex flex-wrap justify-content-center">
              {images.map((url, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #ccc",
                    margin: "5px",
                    padding: "4px",
                    width: "140px",
                    height: "140px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={url}
                    alt={`Uploaded-${idx}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      cursor: "pointer",
                    }}
                    onClick={() => window.open(url, "_blank")}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center mt-2 text-muted">
            No images uploaded for this log
          </div>
        )}
      </div>
    </div>
  );
}
