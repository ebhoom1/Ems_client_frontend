

// src/pages/Inventory/MergedMechanicalReport.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/apiConfig";
import genexlogo from "../../assests/images/logonewgenex.png";

export default function MergedMechanicalReport() {
  const navigate = useNavigate();
  const { userName, year, month } = useParams();
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();
  const [companyName, setCompanyName] = useState("");
  const adminType = useSelector(
    (s) => s.user.userData?.validUserOne?.adminType
  );
  const [logoUrl, setLogoUrl] = useState("");
  console.log("useranme in model ", userName);

 
  useEffect(() => {
    if (!userName || !year || !month) {
      setReports([]);
      setLoading(false);
      return;
    }

    const url = `${API_URL}/api/mechanicalreports/user/${userName}/month/${year}/${month}`;
    setLoading(true);
    axios
      .get(url)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.reports)) {
          setReports(res.data.reports);
        } else {
          setReports([]);
        }
      })
      .catch((err) => {
        console.error("✖ Error fetching reports:", err);
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, [userName, year, month]);
  useEffect(() => {
    if (!userName) return;
    axios
      .get(
        `${API_URL}/api/get-user-by-userName/${encodeURIComponent(userName)}`
      )
      .then((res) => {
        const user = res.data.user;
        setCompanyName(user?.companyName || "—");
      })
      .catch((err) => {
        console.error("Error fetching company:", err);
        setCompanyName("—");
      });
  }, [userName]);

  useEffect(() => {
    if (!adminType) return;
    axios
      .get(`${API_URL}/api/logo/${encodeURIComponent(adminType)}`)
      .then((r) => {
        const logos = r.data?.data || [];
        if (logos.length) {
          const latest = logos.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )[0];
          setLogoUrl(latest.logoUrl);
        }
      })
      .catch(() => {});
  }, [adminType]);

  const filteredReports = reports.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.equipmentName || "").toLowerCase().includes(term) ||
      (r.territorialManager?.name || "").toLowerCase().includes(term) ||
      new Date(r.timestamp).toLocaleDateString("en-GB").includes(term)
    );
  });

  console.log("mechanicalReports:", reports);

  const downloadPDF = () => {
    html2pdf()
      .set({
        margin: [30, 10, 30, 10],
        filename: `MechanicalReport_${userName}_${month}_${year}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all"] },
      })
      .from(reportRef.current)
      .save();
  };

  if (loading) return <p>Loading.…</p>;

  const th = {
    border: "1px solid #000",
    padding: 4,
    background: "#eee",
    textAlign: "center",
    fontSize: 12,
  };
  const td = { border: "1px solid #000", padding: 4, fontSize: 12 };
  const tdC = { ...td, textAlign: "center" };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
        {userName && year && month && (
          <h4>
            {userName} — Reports for{" "}
            {new Date(year, month - 1).toLocaleString("default", {
              month: "long",
            })}{" "}
            {year}
          </h4>
        )}
        <button className="btn btn-success" onClick={downloadPDF}>
          ⬇ Download PDF
        </button>
      </div>

      <div ref={reportRef} style={{ background: "#fff", padding: 10 }}>
        <div
          className="d-flex align-items-center mb-2"
          style={{ background: "#236a80", color: "#fff", padding: "10px" }}
        >
          <img
            crossOrigin="anonymous"
            src={genexlogo}
            alt="Genex logo"
            style={{ maxWidth: 120, maxHeight: 120 }}
          />
          <div
            className="text-center flex-grow-1"
            style={{ fontFamily: "Century Gothic, sans-serif" }}
          >
            <div style={{ fontSize: 20, fontWeight: "bold" }}>
              <i
                style={{ fontFamily: '"Comic Sans MS", cursive', fontSize: 24 }}
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
          Merged Report of {companyName && ` — ${companyName}`}&nbsp;— Reports
          for ({userName})
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
          Mechanical Preventive Maintenance Report
        </div>

        {filteredReports.length > 0 ? (
          filteredReports.map((report, idx, arr) => {
            const dateStr = new Date(report.timestamp).toLocaleDateString(
              "en-GB"
            );
            return (
              <div
                key={report._id}
                style={{
                  marginBottom: idx < arr.length - 1 ? 20 : 0,
                  /*  pageBreakAfter: idx < arr.length - 1 ? 'always' : 'auto' */
                }}
              >
                <div style={{ marginBottom: 8, fontSize: 12 }}>
                  <strong>Date:</strong> {dateStr}
                  {report.siteName && (
                    <>
                      {" "}
                      &nbsp;|&nbsp; <strong>Site:</strong> {report.siteName}
                    </>
                  )}
                  {report.capacity && (
                    <>
                      {" "}
                      &nbsp;|&nbsp; <strong>Capacity:</strong> {report.capacity}
                    </>
                  )}
                </div>
                <div
                  style={{
                    marginBottom: 8,
                    fontSize: 12,
                    color: report.isWorking === "yes" ? "green" : "red",
                  }}
                >
                  <strong>Equipment Working Status:</strong>{" "}
                  {report.isWorking === "yes" ? "Yes" : "No"}
                </div>

                <table
                  style={{
                    width: "100%",
                    border: "1px solid #000",
                    borderCollapse: "collapse",
                    marginBottom: 12,
                  }}
                >
                  <tbody>
                    <tr>
                      <th style={th}>Service Engineer</th>
                      <td style={td}>{report.territorialManager?.name}</td>
                    </tr>
                    <tr>
                      <th style={th}>Equipment Name</th>
                      <td style={td}>{report.equipmentName}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Comments in one line, small font */}
                <div
                  style={{
                    fontSize: "13px",
                    margin: "4px 0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <strong style={{ marginRight: 4 }}>Comments:</strong>
                  <span>{report.comments || <i>No comments provided.</i>}</span>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <strong>Photos:</strong>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    {report.photos && report.photos.length > 0 ? (
                      report.photos.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          crossOrigin="anonymous"
                          alt={`Photo ${i + 1}`}
                          style={{
                            maxWidth: 120,
                            maxHeight: 120,
                            border: "1px solid #ddd",
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />
                      ))
                    ) : (
                      <i>No photos attached.</i>
                    )}
                  </div>
                </div>

                {report.isWorking === "yes" && report.entries.length > 0 ? (
                  <table
                    style={{
                      width: "100%",
                      border: "1px solid #000",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={th}>SL. NO</th>
                        <th style={th}>CATEGORY</th>
                        <th style={th}>WORK DESCRIPTION</th>
                        {report.columns.map((col, i) => (
                          <th key={i} style={th}>
                            {col}
                          </th>
                        ))}
                        <th style={th}>REMARKS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.entries.map((e, i) => (
                        <tr key={`${report._id}-${e.id}`}>
                          <td style={tdC}>{i + 1}</td>
                          <td style={tdC}>Mechanical</td>
                          <td style={td}>{e.category}</td>
                          {e.checks.map((c, j) => {
                            const val =
                              c.value === "ok"
                                ? "✓"
                                : c.value === "fail"
                                ? "✕"
                                : "—";
                            const style = {
                              ...tdC,
                              color:
                                c.value === "ok"
                                  ? "green"
                                  : c.value === "fail"
                                  ? "red"
                                  : undefined,
                            };
                            return (
                              <td key={j} style={style}>
                                {val}
                              </td>
                            );
                          })}
                          <td
                            style={{
                              ...td,
                              color: e.checks.some((c) => c.value === "fail")
                                ? "red"
                                : e.checks.some((c) => c.value === "ok")
                                ? "green"
                                : undefined,
                            }}
                          >
                            {e.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontStyle: "italic", color: "#555" }}>
                    {report.isWorking === "no"
                      ? "Equipment is not working, so no checklist was recorded."
                      : "No checklist entries for this report."}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <p>
            No mechanical reports found for the selected user, month, and year.
          </p>
        )}
      </div>
    </div>
  );
}
