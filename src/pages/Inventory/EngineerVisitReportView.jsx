// import React, { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import html2pdf from "html2pdf.js";
// import { API_URL } from "../../utils/apiConfig";

// export default function EngineerVisitReportView() {
//   const { equipmentId } = useParams();
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const reportRef = useRef();
//   const navigate = useNavigate();

//   useEffect(() => {
//     axios.get(`${API_URL}/api/engineerreport/${equipmentId}`).then((res) => {
//       if (res.data.success) setReport(res.data.report);
//       setLoading(false);
//     });
//   }, [equipmentId]);

//   const downloadPDF = () => {
//     const opt = {
//       margin: [10, 10, 10, 10],
//       filename: `EngineerVisitReport_${new Date().toLocaleDateString()}.pdf`,
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true },
//       jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
//     };
//     html2pdf().from(reportRef.current).set(opt).save();
//   };

//   if (loading) return <p>Loading…</p>;
//   if (!report) return <p>No Engineer Visit Report found.</p>;

//   return (
//     <div className="container py-3">
//       <div className="d-flex justify-content-between mb-3">
//         <button className="btn btn-secondary" onClick={() => navigate(-1)}>
//           ← Back
//         </button>
//         <button className="btn btn-success" onClick={downloadPDF}>
//           ⬇ Download PDF
//         </button>
//       </div>

//       <div ref={reportRef} style={{ fontSize: 12, background: "#fff", padding: 10 }}>
//         <h2 style={{ textAlign: "center" }}>ENGINEER VISIT REPORT</h2>

//         <p><b>Customer:</b> {report.customerName}</p>
//         <p><b>Engineer:</b> {report.engineerName}</p>
//         <p><b>Reference:</b> {report.refNo}</p>
//         <p><b>Date:</b> {new Date(report.date).toLocaleDateString()}</p>
//         <p><b>Plant Capacity:</b> {report.plantCapacity}</p>
//         <p><b>Technology:</b> {report.technology}</p>

//         <h5>Parameters</h5>
//         <ul>
//           <li>pH Raw: {report.parameters?.phRaw}</li>
//           <li>pH Treated: {report.parameters?.phTreated}</li>
//           <li>MLSS: {report.parameters?.mlss}</li>
//           <li>FRC: {report.parameters?.frc}</li>
//           <li>TDS: {report.parameters?.tds}</li>
//           <li>Hardness: {report.parameters?.hardness}</li>
//         </ul>

//         <h5>Key Points</h5>
//         <ul>
//           {Object.entries(report.keyPoints || {}).map(([k, v]) => (
//             <li key={k}>{k}: {v ? "Yes" : "No"}</li>
//           ))}
//         </ul>

//         <h5>Consumables</h5>
//         <ul>
//           {Object.entries(report.consumables || {}).map(([k, v]) => (
//             <li key={k}>{k}: {v}</li>
//           ))}
//         </ul>

//         <h5>Details of Visit</h5>
//         <p>{report.visitDetails}</p>

//         <h5>Engineer Remarks</h5>
//         <p>{report.engineerRemarks}</p>

//         <h5>Customer Remarks</h5>
//         <p>{report.customerRemarks}</p>

//         <h5>Photos</h5>
//         <div className="d-flex flex-wrap">
//           {report.photos?.map((p, i) => (
//             <img key={i} src={p} alt="report" style={{ width: 120, margin: 5 }} />
//           ))}
//         </div>

//         <div className="mt-3">
//           <p><b>Engineer Signature:</b></p>
//           {report.engineerSignatureImage && <img src={report.engineerSignatureImage} alt="Engineer Sign" style={{ width: 150 }} />}
//         </div>
//         <div className="mt-3">
//           <p><b>Customer Signature:</b></p>
//           {report.customerSignatureImage && <img src={report.customerSignatureImage} alt="Customer Sign" style={{ width: 150 }} />}
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { API_URL } from "../../utils/apiConfig";

export default function EngineerVisitReportView() {
  const { equipmentId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/engineerreport/${equipmentId}`).then((res) => {
      if (res.data.success) setReport(res.data.report);
      setLoading(false);
    });
  }, [equipmentId]);

  const downloadPDF = () => {
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `EngineerVisitReport_${new Date().toLocaleDateString()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(reportRef.current).set(opt).save();
  };

  if (loading) return <p>Loading…</p>;
  if (!report) return <p>No Engineer Visit Report found.</p>;

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
        style={{ fontSize: 12, background: "#fff", padding: 20, border: "1px solid #ccc" }}
      >
        <h2 style={{ textAlign: "center", color: "#236a80" }}>ENGINEER VISIT REPORT</h2>

        {/* Header */}
        <p><b>Reference No:</b> {report.referenceNo}</p>
        <p><b>Date:</b> {new Date(report.date).toLocaleDateString()}</p>
        <p><b>Customer Name & Address:</b> {report.customerName}</p>
        <p><b>Plant Capacity:</b> {report.plantCapacity}</p>
        <p><b>Technology:</b> {report.technology}</p>

        {/* Parameters */}
        <h5 style={{ marginTop: 15, color: "#236a80" }}>Parameters During Visit</h5>
        <table className="table table-bordered">
          <tbody>
            <tr><td>pH (Raw Water)</td><td>{report.parameters?.phRaw}</td></tr>
            <tr><td>pH (Treated Water)</td><td>{report.parameters?.phTreated}</td></tr>
            <tr><td>MLSS (mg/l)</td><td>{report.parameters?.mlss}</td></tr>
            <tr><td>FRC (PPM)</td><td>{report.parameters?.frc}</td></tr>
            <tr><td>TDS (mg/l)</td><td>{report.parameters?.tds}</td></tr>
            <tr><td>Hardness (PPM)</td><td>{report.parameters?.hardness}</td></tr>
          </tbody>
        </table>

        {/* Key Points */}
        <h5 style={{ marginTop: 15, color: "#236a80" }}>Key Points Checked (YES/NO)</h5>
        <ul>
          {Object.entries(report.keyPoints || {}).map(([k, v]) => (
            <li key={k}>{k}: <b>{v ? "Yes" : "No"}</b></li>
          ))}
        </ul>

        {/* Consumables */}
        <h5 style={{ marginTop: 15, color: "#236a80" }}>Consumables Stock</h5>
        <ul>
          {Object.entries(report.consumables || {}).map(([k, v]) => (
            <li key={k}>{k}: {v}</li>
          ))}
        </ul>

        {/* Remarks */}
        <h5 style={{ marginTop: 15, color: "#236a80" }}>Details of Visit Done</h5>
        <p>{report.visitDetails}</p>

        <h5 style={{ marginTop: 15, color: "#236a80" }}>Engineer Remarks</h5>
        <p>{report.engineerRemarks}</p>

        <h5 style={{ marginTop: 15, color: "#236a80" }}>Customer Remarks</h5>
        <p>{report.customerRemarks}</p>

        {/* Signatures */}
        <div className="row mt-4">
          <div className="col-md-6 text-center">
            <p><b>Engineer Signature</b></p>
            {report.engineerSignatureImage && (
              <img src={report.engineerSignatureImage} alt="Engineer Sign" style={{ width: 150 }} />
            )}
            <p>{report.engineerSigName}</p>
            <p>{report.engineerSigDesignation}</p>
          </div>
          <div className="col-md-6 text-center">
            <p><b>Customer Signature</b></p>
            {report.customerSignatureImage && (
              <img src={report.customerSignatureImage} alt="Customer Sign" style={{ width: 150 }} />
            )}
            <p>{report.customerSigName}</p>
            <p>{report.customerSigDesignation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
