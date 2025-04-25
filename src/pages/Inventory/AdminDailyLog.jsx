// AdminReport.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate }             from "react-router-dom";
import { useSelector }                        from "react-redux";
import axios                                  from "axios";
import html2pdf                               from "html2pdf.js";
import { API_URL }                            from "../../utils/apiConfig";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
const times = [
  "7.00","8.00","9.00","10.00","11.00","12.00",
  "13.00","14.00","15.00","16.00","17.00","18.00",
  "19.00","20.00","21.00","22.00","23.00","24.00",
  "1.00","2.00","3.00","4.00","5.00","6.00"
];

const equipmentList = [
  "Raw Sewage Pump-1","Raw Sewage Pump-2",
  "AT & ET Blower-1","AT & ET Blower-2",
  "MBR Blower-1","MBR Blower-2",
  "RAS Pump-1","RAS Pump-2",
  "Permeate Pump-1","Permeate Pump-2",
  "Softener Feed Pump-1","Softener Feed Pump-2",
  "Flash Mixer Pump-1","Flash Mixer Pump-2",
  "Filter Press Feed Pump-1","Filter Press Feed Pump-2",
  "Dosing Pump"
];

const treatedWaterParams = ["Quality","Color","Odour","P.H","MLSS","Hardness"];
const chemicals        = ["NaOCl","NaCl","Lime Powder"];
const backwashItems    = ["PSF-","ASF-","Softener-"];
const runningHours     = [
  "MBR Permeate Pump Main →",
  "MBR Permeate Pump Standby →",
  "MBR Back wash Pump →",
  "MBR Chemical Cleaning Pump →",
  "Filter Press Operating Time →"
];

export default function AdminReport() {
  const { username } = useParams();
  const navigate     = useNavigate();
  const { userData } = useSelector(s => s.user);
  const adminType    = userData?.validUserOne?.adminType;
  const isAdmin      = userData?.validUserOne?.userType === "admin";

  const [log, setLog]       = useState(null);
  const [error, setError]   = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const reportRef           = useRef();

  // fetch daily log
  useEffect(() => {
    if (!isAdmin) {
      setError("Access denied");
      return;
    }
    axios.get(`${API_URL}/api/getdailylogByUsername/${username}`)
      .then(r => {
        const data = r.data;
        if (data.message) throw new Error(data.message);
        setLog(Array.isArray(data) ? data[0] : data);
      })
      .catch(e => setError(e.message));
  }, [username, isAdmin]);

  // fetch logo
  useEffect(() => {
    if (!adminType) return;
    axios.get(`${API_URL}/api/logo/${adminType}`)
      .then(res => {
        const arr = res.data?.data || [];
        if (arr.length) {
          const latest = arr.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          setLogoUrl(latest.logoUrl);
        }
      })
      .catch(console.error);
  }, [adminType]);

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    // 1. capture at high resolution
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
  
    // 2. create jsPDF in landscape A4
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
  
    // 3. calculate dimensions
    const pdfWidth  = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth  = canvas.width;
    const imgHeight = canvas.height;
  
    // fit the image into the PDF (maintaining aspect ratio)
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgPDFWidth  = imgWidth * ratio;
    const imgPDFHeight = imgHeight * ratio;
  
    // 4. center image if there's margin
    const xOffset = (pdfWidth - imgPDFWidth) / 2;
    const yOffset = (pdfHeight - imgPDFHeight) / 2;
  
    // 5. add to PDF and save
    pdf.addImage(imgData, "PNG", xOffset, yOffset, imgPDFWidth, imgPDFHeight);
    pdf.save(`DailyLog_${username}_${log.date.slice(0,10)}.pdf`);
  };
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!log)    return <div>Loading…</div>;

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
          fontFamily: 'Arial, sans-serif',
          fontSize:   '12px',
          lineHeight: 1.2,
          color:      '#000',
          background: '#fff',
          padding:    10,
          border:     '1px solid #000'
        }}
      >
        {/* Header */}
        <div 
  className="d-flex align-items-center mb-2" 
  style={{ background: '#236a80', color: '#fff', padding: '10px' }}
>
  {/* Logo on the left */}
  {logoUrl ? (
    <img
      src={logoUrl}
      alt={`${adminType} Logo`}
      style={{ 
        maxWidth: '120px', 
        maxHeight: '120px', 
        marginRight: '20px',  // Added more margin for better spacing
        flexShrink: 0  // Prevent logo from shrinking
      }}
    />
  ) : (
    <div style={{ width: '120px', height: '80px', flexShrink: 0 }}>
      Loading logo…
    </div>
  )}

  {/* Centered content that takes remaining space */}
  <div 
    style={{
      flex: 1,  // Takes remaining space
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',  // Center horizontally
      justifyContent: 'center'  // Center vertically
    }}
  >
    <h5 style={{ margin: 0 }}>350 KLD SEWAGE TREATMENT PLANT – Hilton Manyata</h5>
    <p style={{ margin: '5px 0 0 0' }}>
      STP Operation &amp; Maintenance By{" "}
      <strong>{userData?.validUserOne?.adminType} Utility Management Pvt Ltd</strong>
    </p>
  </div>
</div>

        {/* Title */}
        <div
          style={{
            textAlign: 'center',
            margin:    '10px 0',
            fontSize:  '14px',
            fontWeight:'bold',
            borderTop:  '2px solid #000',
            borderBottom:'2px solid #000',
            padding:   '4px 0'
          }}
        >
          Daily Log Report
        </div>

        {/* Date */}
        <div style={{ marginBottom: 8 }}>
          <strong>Date:</strong> {new Date(log.date).toLocaleDateString()}
        </div>

        {/* MAIN TABLE */}
        <div style={{ overflowX:'auto', maxHeight:'60vh', border:'1px solid #000', padding:'5px' }}>
          <table className="table table-bordered table-sm mb-4" style={{ borderCollapse:'collapse' }}>
            <thead className="text-center align-middle">
              <tr>
                <th rowSpan="2">Time</th>
                {equipmentList.map(eq => (
                  <th key={eq} colSpan="2">{eq}</th>
                ))}
                <th rowSpan="2">Remarks</th>
              </tr>
              <tr>
                {equipmentList.map(eq => (
                  <React.Fragment key={eq}>
                    <th>ON</th><th>OFF</th>
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
                    <td rowSpan={6} style={{ padding:0 }}>
                      <table className="table table-sm mb-0 text-center" style={{ border:'1px solid #000', borderCollapse:'collapse' }}>
                        <thead>
                          <tr><th colSpan="2">TREATED WATER</th></tr>
                        </thead>
                        <tbody>
                          {log.treatedWater.map(tw => (
                            <tr key={tw.key}>
                              <td style={{ border:'1px solid #000', padding:4, textAlign:'left' }}>{tw.key}</td>
                              <td style={{ border:'1px solid #000', padding:4 }}>{tw.value}</td>
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
                    <td rowSpan={6} style={{ verticalAlign:'top', padding:4 }}>
                      <strong>Remarks</strong>
                      <div style={{ whiteSpace:'pre-wrap', marginTop:4 }}>
                        {log.remarks}
                      </div>
                    </td>
                  );
                }
                if (idx === 12) {
                  // Chemical consumption
                  remarksCell = (
                    <td rowSpan={4} style={{ padding:0 }}>
                      <table className="table table-sm mb-0 text-center" style={{ border:'1px solid #000', borderCollapse:'collapse' }}>
                        <thead>
                          <tr><th colSpan="2">Chemical Consumption</th></tr>
                        </thead>
                        <tbody>
                          {log.chemicalConsumption.map(c => (
                            <tr key={c.key}>
                              <td style={{ border:'1px solid #000', padding:4, textAlign:'left' }}>{c.key}</td>
                              <td style={{ border:'1px solid #000', padding:4 }}>{c.value}</td>
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
                    <td rowSpan={4} style={{ padding:0 }}>
                      <table className="table table-sm mb-0 text-center" style={{ border:'1px solid #000', borderCollapse:'collapse' }}>
                        <thead><tr><th>Back wash timings:</th></tr></thead>
                        <tbody>
                          {log.backwashTimings.map(bw => (
                            <tr key={bw.stage}>
                              <td style={{ border:'1px solid #000', padding:4, textAlign:'left' }}>{bw.stage}</td>
                              <td style={{ border:'1px solid #000', padding:4 }}>{bw.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  );
                }

                return (
                  <tr key={entry.time}>
                    <td style={{ border:'1px solid #000', padding:4 }}>{entry.time}</td>
                    {entry.statuses.map(st => (
                      <React.Fragment key={st.equipment}>
                        <td style={{ border:'1px solid #000', padding:4, textAlign:'center' }}>
                          {st.status === "on" ? "✔" : ""}
                        </td>
                        <td style={{ border:'1px solid #000', padding:4, textAlign:'center' }}>
                          {st.status === "off" ? "✔" : ""}
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
        <table className="table table-bordered table-sm w-75 mx-auto mt-3" style={{ borderCollapse:'collapse' }}>
          <thead className="text-center"><tr><th colSpan="2">RUNNING HOURS READING</th></tr></thead>
          <tbody>
            {log.runningHoursReading.map(rh => (
              <tr key={rh.equipment}>
                <td style={{ border:'1px solid #000', padding:4, textAlign:'left' }}>{rh.equipment}</td>
                <td style={{ border:'1px solid #000', padding:4 }}>{rh.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SIGN-OFF */}
        <table className="table table-bordered table-sm w-75 mx-auto mt-2" style={{ borderCollapse:'collapse' }}>
          <thead className="text-center">
            <tr>
              <th style={{ border:'1px solid #000', padding:4 }}>Shift</th>
              <th style={{ border:'1px solid #000', padding:4 }}>Engineer Sign</th>
              <th style={{ border:'1px solid #000', padding:4 }}>Remarks</th>
              <th style={{ border:'1px solid #000', padding:4 }}>Operator’s Name</th>
              <th style={{ border:'1px solid #000', padding:4 }}>Sign</th>
            </tr>
          </thead>
          <tbody>
            {log.signOff.map(so => (
              <tr key={so.shift}>
                <td style={{ border:'1px solid #000', padding:4 }}>{so.shift}</td>
                <td style={{ border:'1px solid #000', padding:4 }}>{so.engineerSign}</td>
                <td style={{ border:'1px solid #000', padding:4 }}>{so.remarks}</td>
                <td style={{ border:'1px solid #000', padding:4 }}>{so.operatorName}</td>
                <td style={{ border:'1px solid #000', padding:4 }}>{so.sign}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
