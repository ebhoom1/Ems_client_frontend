// src/pages/Inventory/ServiceReportView.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";
import { API_URL } from "../../utils/apiConfig";
import genexlogo from "../../assests/images/logonewgenex.png";

export default function ServiceReportView() {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line no-unused-vars
  const adminType = useSelector(
    (s) => s.user.userData?.validUserOne?.adminType
  );
  const [userName, setUserName] = useState(null);
  const [companyName, setCompanyName] = useState("—");
  const [equipmentInfo, setEquipmentInfo] = useState({});

  const thStyle = {
    border: "1px solid #1c1e1fff",
    padding: 8,
    background: "#f5f8fb",
    textAlign: "left",
    fontSize: 15,
   color: "#101112ff",
    fontWeight: "bold"
  };
  const tdStyle = {
    border: "1px solid #141414ff",
    padding: 8,
    fontSize: 14,
    color: "#101112ff",
  };
  const sectionHeaderStyle = {
    textAlign: "center",
    margin: "10px 0",
    fontSize: 14,
    fontWeight: "bold",
    borderTop: "2px solid #1b1c1cff",
    borderBottom: "2px solid #181919ff",
    padding: "4px 0",
    color: "#0e181fff",
  };
  const subSectionTitleStyle = {
    // fontWeight: "bold",
    // fontSize: 14,
    // marginBottom: 5,
    // borderBottom: "1px solid #eee",
    // paddingBottom: 5,
    // color: "#2f4f66",
    fontWeight: "700", // or "bold"
    fontSize: 14, // was 14 → increase to 16 (or 18 if you want larger)
    marginBottom: 8, // add a little more spacing
    borderBottom: "1px solid #181818ff",
    paddingBottom: 6,
    color: "#101b23ff",
    textTransform: "uppercase",
  };

  const pageBreakStyle = {
  // Standard CSS property for page break avoidance
  breakInside: "avoid",
  // CSS for older WebKit (Chrome, Safari) - recommended for html2pdf
  WebkitColumnBreakInside: "avoid",
  // CSS for older Firefox/IE/Edge
  pageBreakInside: "avoid",
};

  // back button behavior
  useEffect(() => {
    const handlePopState = () =>
      navigate("/services?tab=equipmentList", { replace: true });
    window.history.pushState(
      { serviceReportView: true },
      "",
      window.location.href
    );
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  // 1) equipment metadata (userName, etc.)
  useEffect(() => {
    const fetchEquipmentMetadata = async () => {
      if (!equipmentId) {
        setLoading(false);
        return;
      }
      try {
        // NOTE: many projects use a legacy typo '/api/equiment' — keeping it.
        const res = await axios.get(`${API_URL}/api/equiment/${equipmentId}`);
        const eq = res.data?.equipment || {};
        setUserName(eq.userName);
        setEquipmentInfo({
          capacity: eq.capacity || "—",
          model: eq.modelSerial || "—",
          rateLoad: eq.ratedLoad || "—",
          equipmentName: eq.equipmentName || "—",
        });
      } catch (err) {
        console.error("❌ Equipment fetch failed:", err);
        toast.error("Failed to load equipment info for report");
        setLoading(false);
      }
    };
    fetchEquipmentMetadata();
  }, [equipmentId]);

  // 2) company name from userName
  useEffect(() => {
    const fetchCompanyName = async () => {
      if (!userName) return;
      try {
        const res = await axios.get(
          `${API_URL}/api/get-user-by-userName/${userName}`
        );
        const u = res.data?.user || {};
        setCompanyName(u.companyName || "—");
      } catch (err) {
        console.error("❌ Company fetch failed:", err);
      }
    };
    fetchCompanyName();
  }, [userName]);

  // 3) service report for current month
  useEffect(() => {
    const fetchServiceReport = async () => {
      if (!equipmentId || (userName === null && !loading)) return;
      const now = new Date();
      const y = now.getFullYear(),
        m = now.getMonth() + 1;
      try {
        // In routes we exposed GET /api/equipment/:equipmentId?year=&month=
        const res = await axios.get(
          `${API_URL}/api/equipment/${equipmentId}?year=${y}&month=${m}`
        );
        const { success, reports } = res.data;
        if (success && Array.isArray(reports) && reports.length > 0) {
          setReport(reports[0]);
        } else {
          toast.info(
            "No service report found for this equipment for the current month."
          );
          setReport(null);
        }
      } catch (err) {
        console.error(
          "Error fetching service report:",
          err.response?.data || err.message
        );
        if (!(err.response && err.response.status === 404))
          toast.error("Failed to load service report details.");
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchServiceReport();
  }, [equipmentId, userName, loading]);

  const downloadPDF = async () => {
    const imgs = Array.from(reportRef.current.querySelectorAll("img"));
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((r) => {
              img.onload = r;
              img.onerror = r;
            })
      )
    );
    const opt = {
      margin: [30, 10, 30, 10],
      filename: `Service_Report_${
        report?.equipmentName || equipmentInfo.equipmentName
      }_${new Date(report?.reportDate || Date.now())
        .toLocaleDateString()
        .replace(/\//g, "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all"] },
    };
    html2pdf().from(reportRef.current).set(opt).save();
  };

  if (loading) return <p>Loading Service Report…</p>;
  if (!report)
    return (
      <p>
        No Service Report available for this equipment for the current month.
      </p>
    );

  const {
    reportDate,
    technician,
    equipmentDetails,
    detailsOfServiceDone,
    equipmentWorkingStatus,
    suggestionsFromEngineer,
    customerRemarks,
    classificationCode,
    customerSignoffText,
    technicianSignatureText,
    photos = [],
    header = {},
    issueReported,
    issuePhotos = [],
    beforeImages = [],
    beforeCaptions = [],
    afterImages = [],
    afterCaptions = [],
    customerSigName,
    customerSigDesignation,
    technicianSigName,
    technicianSigDesignation,
  } = report;

  const customerSigUrl =
    report.customerSignatureImageUrl ||
    report.customerSignatureUrl ||
    report.customerSignature ||
    null;

  const technicianSigUrl =
    report.technicianSignatureImageUrl ||
    report.technicianSignatureUrl ||
    report.technicianSignature ||
    null;

  const classificationCodesDesc = {
    C1: "Not in Working Condition/Replacement With New Equipment Required. Immediate action required.",
    C2: "Not in Working Condition Equipment/Part Replacement Required. Immediate action required.",
    C3: "Not In Working Condition Service Required. Immediate action required.",
    C4: "In Working Condition but Service Required. Immediate action required.",
    C5: "Minor service required and it is completed.",
  };

  // Header Grid (with Plant Capacity; no Analyzed by)
  const HeaderGrid = () => (
    <table
      style={{
        width: "100%",
        border: "1px solid #242629ff",
        borderCollapse: "collapse",
        marginBottom: 12,
        background: "#236a80",
        ...pageBreakStyle
      }}
    >
      <tbody>
        <tr>
          <td
            rowSpan={3}
            style={{
              ...tdStyle,
              width: "22%",
              textAlign: "center",
              background: "#236a80",
            }}
          >
            <img
              crossOrigin="anonymous"
              src={genexlogo}
              alt="Genex"
              style={{
                width: 90,
                height: "auto",
                display: "block",
                margin: "4px auto 6px",
              }}
            />
          </td>
          <th style={{ ...thStyle, width: "20%" }}>Site:</th>
          <td style={{ ...tdStyle, width: "28%" }}>
            {header.site || companyName || "—"}
          </td>
          <th style={{ ...thStyle, width: "14%" }}>Date:</th>
          <td style={{ ...tdStyle, width: "16%" }}>
            {header.date
              ? new Date(header.date).toLocaleDateString("en-GB")
              : reportDate
              ? new Date(reportDate).toLocaleDateString("en-GB")
              : "—"}
          </td>
          <th style={{ ...thStyle, width: "14%" }}>Report No:</th>
          <td style={{ ...tdStyle, width: "16%" }}>{header.reportNo || "—"}</td>
        </tr>
        <tr>
          <th style={thStyle}>Plant Capacity:</th>
          <td style={tdStyle}>
            {header.plantCapacity || equipmentDetails?.capacity || "—"}
          </td>
          <th style={thStyle}>Reference:</th>
          <td style={tdStyle}>{header.reference || "—"}</td>
          <th style={thStyle}>Incident Date:</th>
          <td style={tdStyle}>{header.incidentDate || "—"}</td>
        </tr>
        <tr>
          <th style={thStyle}>Type of Service:</th>
          <td style={tdStyle}>{header.typeOfService || "—"}</td>
          <th style={thStyle}>Prepared by:</th>
          <td style={tdStyle}>{header.preparedBy || "—"}</td>
          <th style={thStyle}></th>
          <td style={tdStyle}></td>
        </tr>
      </tbody>
    </table>
  );

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
          lineHeight: 1.2,
          color: "#000",
          background: "#fff",
          padding: 10,
          border: "1px solid #171819ff",
        }}
      >
        {/* Header */}
        <HeaderGrid />

        <h2 style={sectionHeaderStyle}>SERVICE REPORT</h2>

        {/* Customer Name & Address (company) + Technician */}
        <table
          style={{
            width: "100%",
            border: "1px solid #17181aff",
            borderCollapse: "collapse",
            marginBottom: 12,
          }}
        >
          <tbody>
            <tr>
              <th style={thStyle}>Customer Name & Address:</th>
              <td style={tdStyle}>{companyName || "—"}</td>
            </tr>
            <tr>
              <th style={thStyle}>Engineer/Technician Name:</th>
              <td style={tdStyle}>{technician?.name || "—"}</td>
            </tr>
          </tbody>
        </table>

        {/* Equipment Details */}
        <div style={{ marginBottom: 12 }}>
          <h4 style={subSectionTitleStyle}>EQUIPMENT DETAILS:</h4>
          <table
            style={{
              width: "100%",
              border: "1px solid #121315ff",
              borderCollapse: "collapse",
            }}
          >
            <tbody>
              <tr>
                <th style={thStyle}>Name:</th>
                <td style={tdStyle}>
                  {equipmentDetails?.name ||
                    equipmentInfo?.equipmentName ||
                    "—"}
                </td>
                <th style={thStyle}>Description:</th>
                <td style={tdStyle}>{equipmentDetails?.description || "—"}</td>
              </tr>
              <tr>
                <th style={thStyle}>Capacity:</th>
                <td style={tdStyle}>
                  {equipmentDetails?.capacity || equipmentInfo?.capacity || "—"}
                </td>
                <th style={thStyle}>Make:</th>
                <td style={tdStyle}>{equipmentDetails?.make || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Classification Code */}
        <div style={{ marginBottom: 12 ,...pageBreakStyle}}>
          <h4 style={subSectionTitleStyle}>CLASSIFICATION CODE:</h4>
          <div
            style={{
              padding: 8,
              border: "1px solid #181717ff",
              borderRadius: 4,
              background: "#f9f9f9",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {Object.keys(classificationCodesDesc).map((code) => (
                <div
                  key={code}
                  style={{
                    flex: "1 1 45%",
                    padding: 5,
                    border: "1px dashed #121212ff",
                    borderRadius: 3,
                    background:
                      classificationCode === code ? "#e0ffe0" : "none",
                  }}
                >
                  <strong
                    style={{
                      color: classificationCode === code ? "green" : "#333",
                    }}
                  >
                    {classificationCode === code ? "☑ " : "☐ "} {code}:
                  </strong>{" "}
                  {classificationCodesDesc[code]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Issue Reported + Photos */}
        <div style={{ marginBottom: 12 }}>
          <h4 style={subSectionTitleStyle}>ISSUE REPORTED:</h4>
          <p style={tdStyle}>{issueReported || "—"}</p>
          {Array.isArray(issuePhotos) && issuePhotos.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 6,
              }}
            >
              {issuePhotos.map((url, i) => (
                <img
                  key={`issue-${i}`}
                  crossOrigin="anonymous"
                  src={url}
                  alt={`Issue ${i + 1}`}
                  style={{
                    maxWidth: 280,
                    maxHeight: 280,
                    border: "1px solid #171717ff",
                    borderRadius: 4,
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details of Service Done */}
        <div style={{ marginBottom: 12 }}>
          <h4 style={subSectionTitleStyle}>DETAILS OF SERVICE DONE:</h4>
          <p style={tdStyle}>{detailsOfServiceDone || "—"}</p>
        </div>

        {/* Current Equipment Working Status */}
        <div style={{ marginBottom: 12 }}>
          <h4 style={subSectionTitleStyle}>
            CURRENT EQUIPMENT WORKING STATUS:
          </h4>
          <p
            style={{
              ...tdStyle,
              color:
                equipmentWorkingStatus === "Normal conditions"
                  ? "green"
                  : "red",
            }}
          >
            {equipmentWorkingStatus || "—"}
          </p>
        </div>

        {/* Suggestions */}
        <div style={{ marginBottom: 12 }}>
          <h4 style={subSectionTitleStyle}>
            SUGGESTIONS FROM ENGINEER/TECHNICIAN:
          </h4>
          <p style={tdStyle}>{suggestionsFromEngineer || "—"}</p>
        </div>

        {/* Before / After with captions */}
        {(beforeImages.length > 0 || afterImages.length > 0) && (
          <div style={{ marginBottom: 12 }}>
            <h4 style={subSectionTitleStyle}>BEFORE / AFTER</h4>
            {beforeImages.length > 0 && (
              <>
                <div style={{ fontWeight: "bold", margin: "6px 0" }}>
                  Before:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {beforeImages.map((url, i) => (
                    <div key={`before-${i}`} style={{ textAlign: "center" }}>
                      <img
                        crossOrigin="anonymous"
                        src={url}
                        alt={`Before ${i + 1}`}
                        style={{
                          maxWidth: 280,
                          maxHeight: 280,
                          border: "1px solid #1a1919ff",
                          borderRadius: 4,
                          display: "block",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                      <div
                        style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}
                      >
                        {beforeCaptions?.[i] || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {afterImages.length > 0 && (
              <>
                <div style={{ fontWeight: "bold", margin: "10px 0 6px" }}>
                  After:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {afterImages.map((url, i) => (
                    <div key={`after-${i}`} style={{ textAlign: "center" }}>
                      <img
                        crossOrigin="anonymous"
                        src={url}
                        alt={`After ${i + 1}`}
                        style={{
                          maxWidth: 280,
                          maxHeight: 280,
                          border: "1px solid #121212ff",
                          borderRadius: 4,
                          display: "block",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                      <div
                        style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}
                      >
                        {afterCaptions?.[i] || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Customer Remarks & Signature */}
        {/* <div style={{ marginBottom: 12 }}>
          <h4 style={subSectionTitleStyle}>CUSTOMER REMARKS & SIGNATURE:</h4>
          <p style={tdStyle}>{customerRemarks || '—'}</p>
          {customerSigUrl ? (
            <div style={{ ...tdStyle, marginTop: 6 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Signature:</div>
              <img crossOrigin="anonymous" src={customerSigUrl} alt="Customer Signature" style={{ maxWidth: 220, maxHeight: 110, border: '1px solid #ddd' }} />
            </div>
          ) : (
            <p style={{ ...tdStyle, fontWeight: 'bold', marginTop: 5 }}>Signature: {customerSignoffText || '—'}</p>
          )}
        </div> */}
        <div style={{ marginBottom: 12 }}>
          <h4 style={subSectionTitleStyle}>CUSTOMER REMARKS & SIGNATURE:</h4>
          <p style={tdStyle}>{customerRemarks || "—"}</p>
          {customerSigUrl ? (
            <div style={{ ...tdStyle, marginTop: 6 }}>
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                Signature:
              </div>
              <img
                crossOrigin="anonymous"
                src={customerSigUrl}
                alt="Customer Signature"
                style={{
                  maxWidth: 310,
                  maxHeight: 310,
                  border: "1px solid #1b1a1aff",
                }}
              />
            </div>
          ) : (
            <p style={{ ...tdStyle, fontWeight: "bold", marginTop: 5 }}>
              Signature: {customerSignoffText || "—"}
            </p>
          )}
          <div style={{ marginTop: 6, fontSize: 12 }}>
            <div>
              <strong>Name:</strong> {customerSigName || "—"}
            </div>
            <div>
              <strong>Designation:</strong> {customerSigDesignation || "—"}
            </div>
          </div>
        </div>

        {/* Engineer/Technician Signature */}
        {/* <div style={{ marginBottom: 12 }}>
          <h4 style={subSectionTitleStyle}>ENGINEER/TECHNICIAN SIGNATURE:</h4>
          {technicianSigUrl ? (
            <div style={tdStyle}>
              <img crossOrigin="anonymous" src={technicianSigUrl} alt="Technician Signature" style={{ maxWidth: 220, maxHeight: 110, border: '1px solid #ddd' }} />
            </div>
          ) : (
            <p style={{ ...tdStyle, fontWeight: 'bold' }}>Signature: {technicianSignatureText || '—'}</p>
          )}
        </div> */}

        <div style={{ marginBottom: 12 }}>
          <h4 style={subSectionTitleStyle}>ENGINEER/TECHNICIAN SIGNATURE:</h4>
          {technicianSigUrl ? (
            <div style={tdStyle}>
              <img
                crossOrigin="anonymous"
                src={technicianSigUrl}
                alt="Technician Signature"
                style={{
                  maxWidth: 310,
                  maxHeight: 310,
                  border: "1px solid #121212ff",
                }}
              />
            </div>
          ) : (
            <p style={{ ...tdStyle, fontWeight: "bold" }}>
              Signature: {technicianSignatureText || "—"}
            </p>
          )}
          <div style={{ marginTop: 6, fontSize: 12 }}>
            <div>
              <strong>Name:</strong>{" "}
              {technicianSigName || technician?.name || "—"}
            </div>
            <div>
              <strong>Designation:</strong> {technicianSigDesignation || "—"}
            </div>
          </div>
        </div>

        {/* Additional Photos */}
        {/* <div style={{ marginBottom: 12 }}>
          <h4 style={subSectionTitleStyle}>ATTACHED PHOTOS:</h4>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {Array.isArray(photos) && photos.length > 0 ? (
              photos.map((url, i) => (
                <img
                  key={`photo-${i}`}
                  crossOrigin="anonymous"
                  src={url}
                  alt={`Photo ${i+1}`}
                  style={{ maxWidth:200, maxHeight:200, border:'1px solid #ddd', borderRadius:4 }}
                  onError={e => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
                />
              ))
            ) : (
              <p style={{ fontStyle:'italic', color:'#555', ...tdStyle }}>No photos attached.</p>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
}
