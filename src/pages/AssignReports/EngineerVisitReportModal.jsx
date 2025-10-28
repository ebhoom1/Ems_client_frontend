// import React, { useRef } from "react";
// import { Modal, Button } from "react-bootstrap";
// import html2pdf from "html2pdf.js";
// import genexlogo from "../../assests/images/logonewgenex.png"; // Update this path accordingly
// import "./assign.css";

// const EngineerVisitReportModal = ({
//   show,
//   handleClose,
//   report,
//   userName,
//   year,
//   month,
// }) => {
//   console.log("received report:", report);
//   const reportRef = useRef();

//   // 🔹 Download PDF
//   const downloadPDF = () => {
//     if (!report) {
//       console.error("Report is not available to download");
//       return;
//     }

//     const opt = {
//       margin: [30, 10, 30, 10], // top, left, bottom, right
//       filename: `Engineer_Visit_Reports_${userName}_${month}-${year}.pdf`,
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true },
//       jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
//       pagebreak: { mode: ["avoid-all"] },
//     };
//     html2pdf().from(reportRef.current).set(opt).save();
//   };

//   if (!report) {
//     return (
//       <Modal show={show} onHide={handleClose} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Engineer Visit Report</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>Loading report data...</p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleClose}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     );
//   }

//   // Define styles for table header and data cells
//   const th = {
//     border: "1px solid #c8d2dc",
//     padding: "6px",
//     fontSize: "16px",
//     color: "#101112ff",
//     backgroundColor: "#f5f8fb", // Background color for the headers
//     fontWeight: "bold", // Bold text for the headers
//   };

//   const td = {
//     border: "1px solid #c8d2dc",
//     padding: "6px",
//     fontSize: "16px",
//     color: "#101112ff",
//   };

//   return (
//     <Modal
//       show={show}
//       onHide={handleClose}
//       dialogClassName="engineer-report-modal"
//       centered
//     >
//       <Modal.Header closeButton>
//         <Modal.Title>Engineer Visit Report - {userName}</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {/* Render the report content here */}
//         <div
//           ref={reportRef}
//           style={{
//             fontFamily: "Arial, sans-serif",
//             fontSize: 14,
//             background: "#fff",
//             color: "#0c141aff",
//             padding: 15,
//             border: "1px solid #c8d2dc",
//           }}
//         >
//           {/* STATIC HEADER */}
//           <div
//             className="d-flex align-items-center mb-2"
//             style={{ background: "#236a80", color: "#fff", padding: "10px" }}
//           >
//             <img
//               crossOrigin="anonymous"
//               src={genexlogo}
//               alt="Genex logo"
//               style={{ maxWidth: 120, maxHeight: 120 }}
//             />
//             <div
//               className="text-center flex-grow-1"
//               style={{
//                 fontFamily: "Century Gothic, sans-serif",
//                 lineHeight: 1.5,
//               }}
//             >
//               <div
//                 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}
//               >
//                 <i
//                   style={{
//                     fontFamily: '"Comic Sans MS", cursive',
//                     fontSize: 24,
//                   }}
//                 >
//                   Genex
//                 </i>{" "}
//                 Utility Management Pvt Ltd
//               </div>
//               <div style={{ fontSize: 14 }}>
//                 Sujatha Arcade, Second Floor, #32 Lake View Defence Colony,
//                 Shettihalli, Post, Jalahalli West, Bengaluru, Karnataka 560015
//               </div>
//               <div style={{ fontSize: 14 }}>Phone: 9663044156</div>
//               <div style={{ fontSize: 14 }}>
//                 E-mail: services@genexutility.com
//               </div>
//               <div style={{ fontSize: 14 }}>Website: www.genexutility.com</div>
//             </div>
//           </div>

//           {/* Report Information and Details */}
//           <table
//             style={{
//               width: "100%",
//               borderCollapse: "collapse",
//               marginBottom: 12,
//             }}
//           >
//             <tbody>
//               <tr>
//                 <th style={th}>Ref No:</th>
//                 <td style={td}>{report.referenceNo || "—"}</td>
//                 <th style={th}>Date:</th>
//                 <td style={td}>
//                   {report.date
//                     ? new Date(report.date).toLocaleDateString("en-GB")
//                     : "—"}
//                 </td>
//               </tr>
//               <tr>
//                 <th style={th}>Customer:</th>
//                 <td style={td}>{report.customerName}</td>
//                 <th style={th}>Plant:</th>
//                 <td style={td}>{report.plantName || "—"}</td>
//               </tr>
//               <tr>
//                 <th style={th}>Capacity:</th>
//                 <td style={td}>{report.plantCapacity || "—"}</td>
//                 <th style={th}>Engineer:</th>
//                 <td style={td}>{report.engineerName}</td>
//               </tr>
//             </tbody>
//           </table>

//           <h3
//             style={{
//               textAlign: "center",
//               fontWeight: "bold",
//               fontSize: 16,
//               borderTop: "2px solid #191b1cff",
//               borderBottom: "2px solid #191b1cff",
//               margin: "10px 0",
//               padding: "4px 0",
//             }}
//           >
//             ENGINEER VISIT REPORT
//           </h3>

//           {/* Parameters + Plant Details */}
//           <div style={{ display: "flex", gap: "10px", marginBottom: 12 }}>
//             <table style={{ flex: 1, borderCollapse: "collapse" }}>
//               <thead>
//                 <tr>
//                   <th style={th}>S No</th>
//                   <th style={th}>Parameters</th>
//                   <th style={th}>Readings</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td style={td}>1</td>
//                   <td style={td}>pH (Raw)</td>
//                   <td style={td}>{report.parameters?.phRaw || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>2</td>
//                   <td style={td}>pH (Treated)</td>
//                   <td style={td}>{report.parameters?.phTreated || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>3</td>
//                   <td style={td}>MLSS</td>
//                   <td style={td}>{report.parameters?.mlss || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>4</td>
//                   <td style={td}>FRC</td>
//                   <td style={td}>{report.parameters?.frc || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>5</td>
//                   <td style={td}>TDS</td>
//                   <td style={td}>{report.parameters?.tds || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>6</td>
//                   <td style={td}>Hardness</td>
//                   <td style={td}>{report.parameters?.hardness || "—"}</td>
//                 </tr>
//               </tbody>
//             </table>

//             <table style={{ flex: 1, borderCollapse: "collapse" }}>
//               <thead>
//                 <tr>
//                   <th style={th} colSpan={2}>
//                     Plant Details
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td style={td}>Capacity</td>
//                   <td style={td}>{report.plantCapacity || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>Technology</td>
//                   <td style={td}>{report.technology || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>Sodium Hypo</td>
//                   <td style={td}>{report.consumables?.sodiumHypo || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>Blower Oil</td>
//                   <td style={td}>{report.consumables?.blowerOil || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>Pump Oil</td>
//                   <td style={td}>{report.consumables?.pumpOil || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>PPE Stock</td>
//                   <td style={td}>{report.consumables?.ppeStock || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>Cotton Waste</td>
//                   <td style={td}>{report.consumables?.cottonWaste || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>Grease</td>
//                   <td style={td}>{report.consumables?.grease || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>Antiscalant</td>
//                   <td style={td}>{report.consumables?.antiscalant || "—"}</td>
//                 </tr>
//                 <tr>
//                   <td style={td}>Salt</td>
//                   <td style={td}>{report.consumables?.salt || "—"}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           {/* Key Points */}
//           <strong style={{ fontSize: "18px" }}>
//             Key Points Checked (Yes/No)
//           </strong>
//           <table
//             style={{
//               width: "100%",
//               borderCollapse: "collapse",
//               marginBottom: 12,
//             }}
//           >
//             <tbody>
//               <tr>
//                 <td style={td}>Log Book Entry</td>
//                 <td style={td}>
//                   {report.keyPoints?.logBookEntry ? "Yes" : "No"}
//                 </td>
//               </tr>
//               <tr>
//                 <td style={td}>History Cards</td>
//                 <td style={td}>
//                   {report.keyPoints?.historyCards ? "Yes" : "No"}
//                 </td>
//               </tr>
//               <tr>
//                 <td style={td}>Grooming</td>
//                 <td style={td}>{report.keyPoints?.grooming ? "Yes" : "No"}</td>
//               </tr>
//               <tr>
//                 <td style={td}>Housekeeping</td>
//                 <td style={td}>
//                   {report.keyPoints?.housekeeping ? "Yes" : "No"}
//                 </td>
//               </tr>
//               <tr>
//                 <td style={td}>Training Conducted</td>
//                 <td style={td}>{report.keyPoints?.training ? "Yes" : "No"}</td>
//               </tr>
//               <tr>
//                 <td style={td}>Checklist Updated</td>
//                 <td style={td}>{report.keyPoints?.checklist ? "Yes" : "No"}</td>
//               </tr>
//               <tr>
//                 <td style={td}>Notice Board Update</td>
//                 <td style={td}>
//                   {report.keyPoints?.noticeBoard ? "Yes" : "No"}
//                 </td>
//               </tr>
//             </tbody>
//           </table>

//           {/* Details */}
//           <div style={{ marginBottom: 12 }}>
//             <strong style={{ fontSize: "18px" }}>Details of Visit Done:</strong>
//             <p>{report.visitDetails || "—"}</p>
//           </div>

//           {/* Remarks & Signatures */}
//           <table
//             style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}
//           >
//             <tbody>
//               <tr>
//                 <th style={th}>Customer Remarks</th>
//                 <th style={th}>Engineer Remarks</th>
//               </tr>
//               <tr>
//                 <td style={td}>{report.customerRemarks || "—"}</td>
//                 <td style={td}>{report.engineerRemarks || "—"}</td>
//               </tr>
//               <tr>
//                 <td style={{ ...td, textAlign: "center" }}>
//                   {report.customerSignatureImage && (
//                     <img
//                       crossOrigin="anonymous"
//                       src={report.customerSignatureImage}
//                       alt="Customer Signature"
//                       style={{ maxHeight: 60 }}
//                     />
//                   )}
//                   <div>{report.customerSigName || "Customer Name"}</div>
//                   <div>{report.customerSigDesignation || "Designation"}</div>
//                 </td>
//                 <td style={{ ...td, textAlign: "center" }}>
//                   {report.engineerSignatureImage && (
//                     <img
//                       crossOrigin="anonymous"
//                       src={report.engineerSignatureImage}
//                       alt="Engineer Signature"
//                       style={{ maxHeight: 60 }}
//                     />
//                   )}
//                   <div>{report.engineerSigName || "Engineer Name"}</div>
//                   <div>{report.engineerSigDesignation || "Designation"}</div>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={handleClose}>
//           Close
//         </Button>
//         <Button variant="primary" onClick={downloadPDF}>
//           Download Report
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default EngineerVisitReportModal;


import React, { useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import html2pdf from "html2pdf.js";
import genexlogo from "../../assests/images/logonewgenex.png";
import "./assign.css";

const EngineerVisitReportModal = ({
  show,
  handleClose,
  report,
  userName,
  year,
  month,
}) => {
  const reportRef = useRef();

  // 🔹 PDF Download
  const downloadPDF = () => {
    if (!report) return;
    const opt = {
      margin: [30, 10, 30, 10],
      filename: `Engineer_Visit_Reports_${userName}_${month}-${year}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all"] },
    };
    html2pdf().from(reportRef.current).set(opt).save();
  };

  if (!report) {
    return (
      <Modal show={show} onHide={handleClose} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Engineer Visit Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Loading report data...</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // Table cell styles
  const th = {
    border: "1px solid #c8d2dc",
    padding: "6px 10px",
    fontSize: "15px",
    color: "#101112ff",
    backgroundColor: "#f5f8fb",
    fontWeight: "bold",
    textAlign: "left",
  };

  const td = {
    border: "1px solid #c8d2dc",
    padding: "6px 10px",
    fontSize: "15px",
    color: "#101112ff",
    verticalAlign: "top",
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="custom-wide-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Engineer Visit Report - {userName}</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ overflowX: "auto", backgroundColor: "#fdfdfd" }}>
        <div
          ref={reportRef}
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 14,
            background: "#fff",
            color: "#0c141aff",
            padding: 20,
            border: "1px solid #c8d2dc",
            borderRadius: 8,
            width: "100%",
            maxWidth: "1200px",
            margin: "auto",
          }}
        >
          {/* HEADER */}
          <div
            className="d-flex align-items-center mb-3"
            style={{
              background: "#236a80",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 6,
              alignItems: "center",
              gap: "20px",
            }}
          >
            <img
              crossOrigin="anonymous"
              src={genexlogo}
              alt="Genex logo"
              style={{ maxWidth: 120, maxHeight: 120 }}
            />
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  marginBottom: 4,
                  fontFamily: "Century Gothic, sans-serif",
                }}
              >
                <i
                  style={{
                    fontFamily: '"Comic Sans MS", cursive',
                    fontSize: 26,
                  }}
                >
                  Genex
                </i>{" "}
                Utility Management Pvt Ltd
              </div>
              <div style={{ fontSize: 14 }}>
                Sujatha Arcade, #32 Lake View Defence Colony, Jalahalli West,
                Bengaluru, Karnataka 560015
              </div>
              <div style={{ fontSize: 14 }}>Phone: 9663044156</div>
              <div style={{ fontSize: 14 }}>E-mail: services@genexutility.com</div>
              <div style={{ fontSize: 14 }}>Website: www.genexutility.com</div>
            </div>
          </div>

          {/* REPORT INFO */}
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
                <td style={td}>{report.referenceNo || "—"}</td>
                <th style={th}>Date:</th>
                <td style={td}>
                  {report.date
                    ? new Date(report.date).toLocaleDateString("en-GB")
                    : "—"}
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

          {/* TITLE */}
          <h3
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 18,
              borderTop: "2px solid #191b1cff",
              borderBottom: "2px solid #191b1cff",
              margin: "15px 0",
              padding: "6px 0",
            }}
          >
            ENGINEER VISIT REPORT
          </h3>

          {/* PARAMETERS + PLANT DETAILS */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <table
              style={{
                flex: "1 1 48%",
                borderCollapse: "collapse",
                minWidth: 400,
              }}
            >
              <thead>
                <tr>
                  <th style={th}>S No</th>
                  <th style={th}>Parameters</th>
                  <th style={th}>Readings</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["pH (Raw)", report.parameters?.phRaw],
                  ["pH (Treated)", report.parameters?.phTreated],
                  ["MLSS", report.parameters?.mlss],
                  ["FRC", report.parameters?.frc],
                  ["TDS", report.parameters?.tds],
                  ["Hardness", report.parameters?.hardness],
                ].map(([label, value], i) => (
                  <tr key={i}>
                    <td style={td}>{i + 1}</td>
                    <td style={td}>{label}</td>
                    <td style={td}>{value || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table
              style={{
                flex: "1 1 48%",
                borderCollapse: "collapse",
                minWidth: 400,
              }}
            >
              <thead>
                <tr>
                  <th style={th} colSpan={2}>
                    Plant Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Capacity", report.plantCapacity],
                  ["Technology", report.technology],
                  ["Sodium Hypo", report.consumables?.sodiumHypo],
                  ["Blower Oil", report.consumables?.blowerOil],
                  ["Pump Oil", report.consumables?.pumpOil],
                  ["PPE Stock", report.consumables?.ppeStock],
                  ["Cotton Waste", report.consumables?.cottonWaste],
                  ["Grease", report.consumables?.grease],
                  ["Antiscalant", report.consumables?.antiscalant],
                  ["Salt", report.consumables?.salt],
                ].map(([label, value], i) => (
                  <tr key={i}>
                    <td style={td}>{label}</td>
                    <td style={td}>{value || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* KEY POINTS */}
          <h5 style={{ fontWeight: "bold" }}>Key Points Checked (Yes/No)</h5>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 12,
            }}
          >
            <tbody>
              {Object.entries({
                "Log Book Entry": report.keyPoints?.logBookEntry,
                "History Cards": report.keyPoints?.historyCards,
                Grooming: report.keyPoints?.grooming,
                Housekeeping: report.keyPoints?.housekeeping,
                "Training Conducted": report.keyPoints?.training,
                "Checklist Updated": report.keyPoints?.checklist,
                "Notice Board Update": report.keyPoints?.noticeBoard,
              }).map(([label, val], i) => (
                <tr key={i}>
                  <td style={td}>{label}</td>
                  <td style={td}>{val ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* VISIT DETAILS */}
          <div style={{ marginBottom: 12 }}>
            <strong style={{ fontSize: "18px" }}>Details of Visit Done:</strong>
            <p style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
              {report.visitDetails || "—"}
            </p>
          </div>

          {/* REMARKS */}
          <table
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}
          >
            <thead>
              <tr>
                <th style={th}>Customer Remarks</th>
                <th style={th}>Engineer Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>{report.customerRemarks || "—"}</td>
                <td style={td}>{report.engineerRemarks || "—"}</td>
              </tr>
              <tr>
                <td style={{ ...td, textAlign: "center" }}>
                  {report.customerSignatureImage && (
                    <img
                      crossOrigin="anonymous"
                      src={report.customerSignatureImage}
                      alt="Customer Signature"
                      style={{ maxHeight: 60 }}
                    />
                  )}
                  <div>{report.customerSigName || "Customer Name"}</div>
                  <div>{report.customerSigDesignation || "Designation"}</div>
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  {report.engineerSignatureImage && (
                    <img
                      crossOrigin="anonymous"
                      src={report.engineerSignatureImage}
                      alt="Engineer Signature"
                      style={{ maxHeight: 60 }}
                    />
                  )}
                  <div>{report.engineerSigName || "Engineer Name"}</div>
                  <div>{report.engineerSigDesignation || "Designation"}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={downloadPDF}>
          Download Report
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EngineerVisitReportModal;
