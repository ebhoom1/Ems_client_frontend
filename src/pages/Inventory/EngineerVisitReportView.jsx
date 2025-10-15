


// src/pages/Inventory/EngineerVisitReportView.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import genexlogo from "../../assests/images/logonewgenex.png";

export default function EngineerVisitReportView() {
  const { user, year, month } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();

  const [reports, setReports] = useState([]);

  // 🔹 Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/engineerreport/user/${user}/${year}/${month}`
        );
        console.log("reports:",data);
        if (data.success && data.reports?.length) {
          setReports(data.reports);
        } else {
          toast.info("No Engineer Visit Reports found");
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        toast.error("Error loading engineer visit reports");
      }
    };
    fetchReports();
  }, [user, year, month]);

  // 🔹 Download PDF
  const downloadPDF = () => {
    const opt = {
      margin: [30, 10, 30, 10],//top,left,bottom,right
      filename: `Engineer_Visit_Reports_${user}_${month}-${year}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all"] },
    };
    html2pdf().from(reportRef.current).set(opt).save();
  };

  if (!reports.length) return <p>No Engineer Visit Reports available</p>;

  const td = {
    border: "1px solid #c8d2dc",
    padding: 6,
    fontSize: 16,
    color: "#101112ff",
    
  };
  const th = {
    ...td,
    background: "#f5f8fb",
    fontWeight: "bold",
  };

  return (
    <div className="container py-3">
      {/* Actions */}
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button className="btn btn-success" onClick={downloadPDF}>
          ⬇ Download PDF
        </button>
      </div>

      {/* Reports */}
      <div
        ref={reportRef}
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: 14,
          background: "#fff",
          color: "#0c141aff",
          padding: 15,
          border: "1px solid #c8d2dc",
        }}
      >
        {reports.map((report, idx) => (
          <div
            key={report._id || idx}
            style={{
              marginBottom: 40,
              pageBreakAfter: "always", // each report in new page in PDF
            }}
          >
            {/* STATIC HEADER */}
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
                style={{ fontFamily: "Century Gothic, sans-serif", lineHeight: 1.5 }}
              >
                <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>
                  <i style={{ fontFamily: '"Comic Sans MS", cursive', fontSize: 24 }}>
                    Genex
                  </i>{" "}
                  Utility Management Pvt Ltd
                </div>
                <div style={{ fontSize: 14 }}>
                  Sujatha Arcade, Second Floor, #32 Lake View Defence Colony, Shettihalli, Post, Jalahalli West, Bengaluru, Karnataka 560015
                </div>
                <div style={{ fontSize: 14 }}>Phone: 9663044156</div>
                <div style={{ fontSize: 14 }}>E-mail: services@genexutility.com</div>
                <div style={{ fontSize: 14 }}>Website: www.genexutility.com</div>
              </div>
            </div>

            {/* Report Info */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
              <tbody>
                <tr>
                  <th style={th}>Ref No:</th>
                  <td style={td}>{report.referenceNo || "—"}</td>
                  <th style={th}>Date:</th>
                  <td style={td}>
                    {report.date ? new Date(report.date).toLocaleDateString("en-GB") : "—"}
                  </td>
                </tr>
                <tr>
                  <th style={th}>Customer:</th>
                  <td style={td}>{report.customerName}</td>
                  <th style={th}>Plant:</th>
                  <td style={td}>{report.plantName || "—"}</td>
                </tr>
                <tr>
                  <th style={th}>Capacity:</th>
                  <td style={td}>{report.plantCapacity || "—"}</td>
                  <th style={th}>Engineer:</th>
                  <td style={td}>{report.engineerName}</td>
                </tr>
              </tbody>
            </table>

            <h3
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 16,
                borderTop: "2px solid #191b1cff",
                borderBottom: "2px solid #191b1cff",
                margin: "10px 0",
                padding: "4px 0",
              }}
            >
              ENGINEER VISIT REPORT
            </h3>

            {/* Parameters + Plant Details */}
            <div style={{ display: "flex", gap: "10px", marginBottom: 12 }}>
              <table style={{ flex: 1, borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>S No</th>
                    <th style={th}>Parameters</th>
                    <th style={th}>Readings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={td}>1</td><td style={td}>pH (Raw)</td><td style={td}>{report.parameters?.phRaw || "—"}</td></tr>
                  <tr><td style={td}>2</td><td style={td}>pH (Treated)</td><td style={td}>{report.parameters?.phTreated || "—"}</td></tr>
                  <tr><td style={td}>3</td><td style={td}>MLSS</td><td style={td}>{report.parameters?.mlss || "—"}</td></tr>
                  <tr><td style={td}>4</td><td style={td}>FRC</td><td style={td}>{report.parameters?.frc || "—"}</td></tr>
                  <tr><td style={td}>5</td><td style={td}>TDS</td><td style={td}>{report.parameters?.tds || "—"}</td></tr>
                  <tr><td style={td}>6</td><td style={td}>Hardness</td><td style={td}>{report.parameters?.hardness || "—"}</td></tr>
                </tbody>
              </table>

              <table style={{ flex: 1, borderCollapse: "collapse" }}>
                <thead>
                  <tr><th style={th} colSpan={2}>Plant Details</th></tr>
                </thead>
                <tbody>
                  <tr><td style={td}>Capacity</td><td style={td}>{report.plantCapacity || "—"}</td></tr>
                  <tr><td style={td}>Technology</td><td style={td}>{report.technology || "—"}</td></tr>
                  <tr><td style={td}>Sodium Hypo</td><td style={td}>{report.consumables?.sodiumHypo || "—"}</td></tr>
                  <tr><td style={td}>Blower Oil</td><td style={td}>{report.consumables?.blowerOil || "—"}</td></tr>
                  <tr><td style={td}>Pump Oil</td><td style={td}>{report.consumables?.pumpOil || "—"}</td></tr>
                  <tr><td style={td}>PPE Stock</td><td style={td}>{report.consumables?.ppeStock || "—"}</td></tr>
                  <tr><td style={td}>Cotton Waste</td><td style={td}>{report.consumables?.cottonWaste || "—"}</td></tr>
                  <tr><td style={td}>Grease</td><td style={td}>{report.consumables?.grease || "—"}</td></tr>
                  <tr><td style={td}>Antiscalant</td><td style={td}>{report.consumables?.antiscalant || "—"}</td></tr>
                  <tr><td style={td}>Salt</td><td style={td}>{report.consumables?.salt || "—"}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Key Points */}
            <strong style={{fontSize:"18px"}}>Key Points Checked (Yes/No)</strong>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
              <tbody>
                <tr><td style={td}>Log Book Entry</td><td style={td}>{report.keyPoints?.logBookEntry ? "Yes" : "No"}</td></tr>
                <tr><td style={td}>History Cards</td><td style={td}>{report.keyPoints?.historyCards ? "Yes" : "No"}</td></tr>
                <tr><td style={td}>Grooming</td><td style={td}>{report.keyPoints?.grooming ? "Yes" : "No"}</td></tr>
                <tr><td style={td}>Housekeeping</td><td style={td}>{report.keyPoints?.housekeeping ? "Yes" : "No"}</td></tr>
                <tr><td style={td}>Training Conducted</td><td style={td}>{report.keyPoints?.training ? "Yes" : "No"}</td></tr>
                <tr><td style={td}>Checklist Updated</td><td style={td}>{report.keyPoints?.checklist ? "Yes" : "No"}</td></tr>
                <tr><td style={td}>Notice Board Update</td><td style={td}>{report.keyPoints?.noticeBoard ? "Yes" : "No"}</td></tr>
              </tbody>
            </table>

            {/* Details */}
            <div style={{ marginBottom: 12 }}>
              <strong style={{fontSize:"18px"}}>Details of Visit Done:</strong>
              <p>{report.visitDetails || "—"}</p>
            </div>

            {/* Remarks & Signatures */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
              <tbody>
                <tr>
                  <th style={th}>Customer Remarks</th>
                  <th style={th}>Engineer Remarks</th>
                </tr>
                <tr>
                  <td style={td}>{report.customerRemarks || "—"}</td>
                  <td style={td}>{report.engineerRemarks || "—"}</td>
                </tr>
                <tr>
                  <td style={{ ...td, textAlign: "center" }}>
                    {report.customerSignatureImage && (
                      <img  crossOrigin="anonymous" src={report.customerSignatureImage} alt="Customer Signature" style={{ maxHeight: 60 }} />
                    )}
                    <div>{report.customerSigName || "Customer Name"}</div>
                    <div>{report.customerSigDesignation || "Designation"}</div>
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>
                    {report.engineerSignatureImage && (
                      <img  crossOrigin="anonymous" src={report.engineerSignatureImage} alt="Engineer Signature" style={{ maxHeight: 60 }} />
                    )}
                    <div>{report.engineerSigName || "Engineer Name"}</div>
                    <div>{report.engineerSigDesignation || "Designation"}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
