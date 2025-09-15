// src/pages/Inventory/SafetyReportView.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import genexlogo from "../../assests/images/logonewgenex.png";

export default function SafetyReportView() {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/safetyreport/${equipmentId}`);
        if (data.success) setReport(data.report);
        else toast.info("No Safety Report found");
      } catch (err) {
        console.error("❌ Fetch error:", err);
        toast.error("Error loading safety report");
      }
    };
    fetchReport();
  }, [equipmentId]);

  const downloadPDF = async () => {
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Safety_Report_${report?.equipmentName || "site"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(reportRef.current).set(opt).save();
  };

  if (!report) return <p>No Safety Report available</p>;

  const td = {
    border: "1px solid #c8d2dc",
    padding: 8,
    fontSize: 12,
    color: "#2f4f66",
  };
  const th = {
    ...td,
    background: "#f5f8fb",
    fontWeight: "bold",
  };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        <button className="btn btn-success" onClick={downloadPDF}>⬇ Download PDF</button>
      </div>

      <div
        ref={reportRef}
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: 12,
          lineHeight: 1.4,
          background: "#fff",
          color: "#000",
          padding: 15,
          border: "1px solid #c8d2dc",
        }}
      >
        {/* HEADER */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
          <tbody>
            <tr>
              <td rowSpan={3} style={{ ...td, width: "22%", textAlign: "center", background: "#236a80" }}>
                <img src={genexlogo} alt="Genex" style={{ width: 90, margin: "auto", display: "block" }} />
              </td>
              <th style={th}>Ref No:</th>
              <td style={td}>{report.refNo || "—"}</td>
              <th style={th}>Date:</th>
              <td style={td}>{report.date ? new Date(report.date).toLocaleDateString("en-GB") : "—"}</td>
            </tr>
            <tr>
              <th style={th}>Customer:</th>
              <td style={td}>{report.customerName}</td>
              <th style={th}>Plant:</th>
              <td style={td}>{report.plantName || "—"}</td>
            </tr>
            <tr>
              <th style={th}>Capacity:</th>
              <td style={td}>{report.capacity || "—"}</td>
              <th style={th}>Engineer:</th>
              <td style={td}>{report.engineerName}</td>
            </tr>
          </tbody>
        </table>

        <h2
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 14,
            borderTop: "2px solid #d5dee7",
            borderBottom: "2px solid #d5dee7",
            margin: "10px 0",
            padding: "4px 0",
          }}
        >
          SAFETY AUDIT REPORT
        </h2>

        {/* Checklist */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
          <thead>
            <tr>
              <th style={th}>Checklist Item</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}>Workplace Condition</td>
              <td style={td}>{report.checklist?.workplaceCondition ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td style={td}>Safety PPEs</td>
              <td style={td}>{report.checklist?.safetyPPEs ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td style={td}>Operators Grooming</td>
              <td style={td}>{report.checklist?.operatorsGrooming ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td style={td}>Safety Equipments</td>
              <td style={td}>{report.checklist?.safetyEquipments ? "Yes" : "No"}</td>
            </tr>
          </tbody>
        </table>

        {/* Observation */}
        <div style={{ marginBottom: 12 }}>
          <strong>Observation:</strong>
          <p>{report.observation || "—"}</p>
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
                  <img src={report.customerSignatureImage} alt="Customer Signature" style={{ maxHeight: 60 }} />
                )}
                <div>Customer Signature</div>
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                {report.engineerSignatureImage && (
                  <img src={report.engineerSignatureImage} alt="Engineer Signature" style={{ maxHeight: 60 }} />
                )}
                <div>Engineer Signature</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
