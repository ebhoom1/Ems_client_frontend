import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./inventory.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import genexlogo from "../../assests/images/logonewgenex.png";
import SBRChecklistView from "./SBRChecklistView";
import ASPChecklistView from "./ASPChecklistView";
import MBRChecklistView from "./MBRChecklistView";

export default function SafetyReportView() {
  const location = useLocation();
  const { user, year, month } = useParams();
  const checklistType = new URLSearchParams(location.search).get("checklist");
  const navigate = useNavigate();
  const reportRef = useRef();
  const [reports, setReports] = useState([]);

  // ✅ Fetch reports with dynamicChecklist
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/safetyreport/user/${user}/${year}/${month}?checklistType=${checklistType}`
        );
        console.log("reports:", data.data);
        if (data.success && data.reports?.length) setReports(data.reports);
        else toast.info("No Safety Report found");
      } catch (err) {
        console.error("❌ Fetch error:", err);
        toast.error("Error loading safety report");
      }
    };
    fetchReport();
  }, [user, year, month, checklistType]);

  // ✅ PDF Download
  // const downloadPDF = async () => {
  //   const opt = {
  //     margin: [10, 10, 10, 10],
  //     filename: `Safety_Report_${user}_${month}_${year}.pdf`,
  //     image: { type: "jpeg", quality: 0.98 },
  //     html2canvas: { scale: 2, useCORS: true },
  //     jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
  //   };
  //   html2pdf().from(reportRef.current).set(opt).save();
  // };

  const downloadPDF = async () => {
    try {
      // 🔹 Step 1: Hide all elements with .no-print before generating
      const elements = document.querySelectorAll(".no-print");
      elements.forEach((el) => (el.style.display = "none"));

      // const opt = {
      //   margin: [10, 10, 10, 10],
      //   filename: `Safety_Report_${user}_${month}_${year}.pdf`,
      //   image: { type: "jpeg", quality: 0.98 },
      //   html2canvas: { scale: 2, useCORS: true },
      //   jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      // };
      const opt = {
        margin: [30, 10, 30, 10],
        filename: `Safety_Report_${user}_${month}_${year}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all"] },
      };

      // 🔹 Step 2: Generate and save the PDF
      await html2pdf().from(reportRef.current).set(opt).save();

      // 🔹 Step 3: Restore visibility after PDF is generated
      elements.forEach((el) => (el.style.display = ""));
    } catch (error) {
      console.error("❌ PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    }
  };

  if (!reports.length) return <p>No Safety Reports available</p>;

  const td = {
    border: "1px solid #434548ff",
    padding: 8,
    fontSize: 16,
    color: "#101112ff",
    verticalAlign: "top",
  };
  const th = {
    ...td,
    background: "#f5f8fb",
    fontWeight: "bold",
    width: "25%",
  };

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
        {reports.map((report, idx) => (
          <div
            key={report._id || idx}
            style={{ marginBottom: 60 }}
            className={idx > 0 ? "report-page-break" : ""}
          >
            <div className="d-flex justify-content-end mb-2">
              <button
                className="btn btn-warning no-print"
                onClick={() =>
                  navigate(
                    `/maintenance/safety/${report.customerName}?editId=${report._id}&checklist=${report.checklistType}`
                  )
                }
              >
                ✏ Edit Report
              </button>
            </div>
            {/* ========================
                1️⃣ Dynamic Checklist Section
            ========================= */}
            {report.dynamicChecklist &&
              Object.keys(report.dynamicChecklist).length > 0 && (
                <>
                  {report.checklistType === "SBR" && (
                    <SBRChecklistView checklist={report.dynamicChecklist} />
                  )}
                  {report.checklistType === "ASP" && (
                    <ASPChecklistView checklist={report.dynamicChecklist} />
                  )}
                  {report.checklistType === "MBR" && (
                    <MBRChecklistView checklist={report.dynamicChecklist} />
                  )}
                  <hr
                    style={{
                      borderTop: "3px solid #236a80",
                      margin: "25px 0",
                    }}
                  />
                </>
              )}

            {/* ========================
                2️⃣ Safety Report Section
            ========================= */}
            <div
              className="d-flex align-items-center mb-3"
              style={{
                background: "#236a80",
                color: "#fff",
                padding: "10px",
              }}
            >
              <img
                crossOrigin="anonymous"
                src={genexlogo}
                alt="Genex logo"
                style={{ maxWidth: 120, maxHeight: 120 }}
              />
              <div
                className="text-center flex-grow-1"
                style={{
                  fontFamily: "Century Gothic, sans-serif",
                  lineHeight: 1.5,
                }}
              >
                <div
                  style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}
                >
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
                  Sujatha Arcade, Second Floor, #32 Lake View Defence Colony,
                  Shettihalli, Post, Jalahalli West, Bengaluru, Karnataka 560015
                </div>
                <div style={{ fontSize: 14 }}>Phone: 9663044156</div>
                <div style={{ fontSize: 14 }}>
                  E-mail: services@genexutility.com
                </div>
                <div style={{ fontSize: 14 }}>
                  Website: www.genexutility.com
                </div>
              </div>
            </div>

            <h2
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 16,
                borderTop: "2px solid #1a1b1cff",
                borderBottom: "2px solid #1a1b1cff",
                margin: "10px 0",
                padding: "4px 0",
              }}
            >
              SAFETY AUDIT REPORT
            </h2>

            {/* Header Details */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: 12,
              }}
            >
              <tbody>
                <tr>
                  <th style={th}>Ref No:</th>
                  <td style={td}>{report.refNo || "—"}</td>
                  <th style={th}>Date:</th>
                  <td style={td}>
                    {report.date
                      ? new Date(report.date).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                </tr>
                <tr>
                  <th style={th}>Customer Name:</th>
                  <td style={td} colSpan={3}>
                    {report.customerSigName || "—"}
                  </td>
                </tr>
                <tr>
                  <th style={th}>Plant Name:</th>
                  <td style={td}>{report.plantName || "—"}</td>
                  <th style={th}>Capacity:</th>
                  <td style={td}>{report.capacity || "—"}</td>
                </tr>
                <tr>
                  <th style={th}>Engineer/Technician:</th>
                  <td style={td} colSpan={3}>
                    {report.engineerName || "—"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Audit Details */}
            <div style={{ marginBottom: 12 }}>
              <strong style={{ fontSize: 16 }}>
                Details of Safety Audit Done:
              </strong>
              <p style={{ fontSize: 14 }}>{report.auditDetails || "—"}</p>
            </div>

            {/* Static Checklist */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: 12,
              }}
            >
              <thead>
                <tr>
                  <th style={th}>Checklist Item</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={td}>Safety Working Condition at Workplace</td>
                  <td style={td}>
                    {report.checklist?.workplaceCondition ? "Yes" : "No"}
                  </td>
                </tr>
                <tr>
                  <td style={td}>
                    Safety PPEs (Gloves, Helmet, Goggles, Mask, Apron, Ear
                    Plugs)
                  </td>
                  <td style={td}>
                    {report.checklist?.safetyPPEs ? "Yes" : "No"}
                  </td>
                </tr>
                <tr>
                  <td style={td}>Operators Well Grooming</td>
                  <td style={td}>
                    {report.checklist?.operatorsGrooming ? "Yes" : "No"}
                  </td>
                </tr>
                <tr>
                  <td style={td}>
                    Safety Equipments (Ladders, Life Tubes, Ropes, Eye Washer)
                  </td>
                  <td style={td}>
                    {report.checklist?.safetyEquipments ? "Yes" : "No"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Observation */}
            <div style={{ marginBottom: 12 }}>
              <strong style={{ fontSize: 16 }}>Observation:</strong>
              <p style={{ fontSize: 14 }}>{report.observation || "—"}</p>
            </div>

            {/* Remarks & Signatures */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 12,
              }}
            >
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
                    {(report.customerSignatureImageUrl ||
                      report.customerSignatureImage ||
                      report.customerSignatureUrl ||
                      report.customerSignature) && (
                      <img
                        crossOrigin="anonymous"
                        src={
                          report.customerSignatureImageUrl ||
                          report.customerSignatureImage ||
                          report.customerSignatureUrl ||
                          report.customerSignature
                        }
                        alt="Customer Signature"
                        style={{ maxHeight: 80 }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div>
                      {report.customerSigName || "Customer"} <br />
                      {report.customerSigDesignation || ""}
                    </div>
                  </td>

                  <td style={{ ...td, textAlign: "center" }}>
                    {(report.engineerSignatureImageUrl ||
                      report.engineerSignatureImage ||
                      report.engineerSignatureUrl ||
                      report.engineerSignature) && (
                      <img
                        crossOrigin="anonymous"
                        src={
                          report.engineerSignatureImageUrl ||
                          report.engineerSignatureImage ||
                          report.engineerSignatureUrl ||
                          report.engineerSignature
                        }
                        alt="Engineer Signature"
                        style={{ maxHeight: 80 }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div>
                      {report.engineerSigName || "Engineer"} <br />
                      {report.engineerSigDesignation || ""}
                    </div>
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
