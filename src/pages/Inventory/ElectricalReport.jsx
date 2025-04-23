import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import { API_URL } from '../../utils/apiConfig';

export default function ElectricalReport() {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const adminType = useSelector(s => s.user.userData?.validUserOne?.adminType);

  const phases = ['RY','YB','BR'];
  const checklist = [
    { id:1,label:'Voltage V' },
    { id:2,label:'Current A' },
    { id:3,label:'Power kW' },
    { id:4,label:'Check starter controls and connection' },
    { id:5,label:'Check contactor for free movement and servicing' },
    { id:6,label:'Check OLR condition and note ampere set' },
    { id:7,label:'Check earthing' },
    { id:8,label:'Examine exposed cables, joints & bus bars' },
  ];

  // fetch report
  useEffect(() => {
    axios.get(`${API_URL}/api/get-electricalreport/${equipmentId}`)
      .then(r => {
        if (r.data.success) setReport(r.data.report);
        else toast.error('Report not found');
      })
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false));
  }, [equipmentId]);

  // fetch logo
 // at top: import useEffect, useState
 useEffect(() => {
    const fetchLogo = async () => {
      if (adminType) {
        console.log("Fetching logo for adminType:", adminType); // Log adminType for debugging
        try {
          const response = await axios.get(`${API_URL}/api/logo/${adminType}`);
          if (response.data?.data?.length > 0) {
            // Sort logos by createdAt to get the latest one
            const sortedLogos = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const latestLogoUrl = sortedLogos[0].logoUrl; // Get the latest logo URL
            setLogoUrl(latestLogoUrl);
            console.log("Latest logo URL:", latestLogoUrl); // Log the logo URL
          } else {
            console.warn("No logo found for the specified adminType.");
          }
        } catch (error) {
          console.error("Error fetching logo:", error);
          if (error.code === 'ERR_NETWORK') {
            toast.error("Network error: Unable to reach the server.", { position: "top-center" });
          } else {
            toast.error("Failed to fetch logo. Please try again later.", { position: "top-center" });
          }
        }
      } else {
        console.warn("AdminType is undefined or empty."); // Warn if adminType is not provided
      }
    };
  
    fetchLogo();
  }, [adminType]);

  // PDF download
  const downloadPDF = () => {
    const opt = {
      margin: [10,10,10,10],
      filename: `Electrical_Report_${equipmentId}.pdf`,
      image:    { type:'jpeg', quality:0.98 },
      html2canvas: { scale:2, useCORS:true },
      jsPDF:    { unit:'pt', format:'a4', orientation:'portrait' }
    };
    html2pdf().from(reportRef.current).set(opt).save();
  };
  

  if (loading) return <p>Loading report…</p>;
  if (!report) return <p>No report available.</p>;
  const { technician, equipment, responses, createdAt } = report;

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-secondary" onClick={()=>navigate('/services')}>
          ← Back
        </button>
        <button className="btn btn-success" onClick={downloadPDF}>
          ⬇ Download PDF
        </button>
      </div>

      {/* PDF content wrapper */}
      <div
        ref={reportRef}
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          lineHeight: 1.2,
          color: '#000',
          background: '#fff',
          padding: 10,
          border: '1px solid #000'
        }}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center mb-2"
          style={{ background: '#236a80', color: '#fff', padding: '10px' }}
        >
          {logoUrl ? (
    <img
      src={logoUrl}
      alt={`${adminType} Logo`}
      style={{ maxWidth: '120px', maxHeight: '120px', marginBottom: '10px' }}
    />
  ) : (
    <span>Loading logo...</span> // Optional loading indicator
  )}

          <div className="text-center flex-grow-1">
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              <i>Genex</i> Utility Management Pvt Ltd
            </div>
            <div>No:04, Suraj Nilaya, Sahyadri Layout, Shettihalli, Jalahalli West, Bangalore - 560015</div>
            <div>Phone: +91-92436-02152</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign:'center', margin:'10px 0', fontSize:'12px', fontWeight:'bold', borderTop:'2px solid #000', borderBottom:'2px solid #000', padding:'4px 0' }}>
          Electrical Engineer Report
        </div>

        {/* Date */}
        <div style={{ marginBottom: 8 }}><strong>Date:</strong> {new Date(createdAt).toLocaleDateString()}</div>

        {/* Equipment info */}
        <table style={{ width:'100%', border:'1px solid #000', borderCollapse:'collapse', marginBottom:12 }}>
          <tbody>
            {[
              ["Service Engineer's Name", `${technician.name} — ${technician.designation}`],
              ["Equipment Name", equipment.name],
              ["Model", equipment.model],
              ["Capacity in HP/KW", equipment.capacity],
              ["Rated Load in Amps", equipment.ratedLoad]
            ].map(([label,value]) => (
              <tr key={label}>
                <th style={{ border:'1px solid #000', padding:4, textAlign:'left', fontWeight:'normal' }}>{label}</th>
                <td style={{ border:'1px solid #000', padding:4 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Checklist table */}
        <table style={{ width:'100%', border:'1px solid #000', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Sl.no</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>ACTUAL</th>
              <th style={thStyle} colSpan={3}>MEASUREMENT</th>
              <th style={thStyle}>REMARKS</th>
            </tr>
            <tr>
              <th style={thStyle} colSpan={3}></th>
              {phases.map(p => <th key={p} style={thStyle}>{p}</th>)}
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {checklist.map(item => {
              const resp = responses[item.id] || {};
              if (item.id <= 3) {
                // two‑row subtable
                const headerRows = item.id === 1
                  ? ['RY','YB','BR']
                  : item.id === 2
                    ? ['R','Y','B']
                    : ['', '', ''];
                return (
                  <React.Fragment key={item.id}>
                    <tr>
                      <td rowSpan={2} style={tdStyle}>{item.id}</td>
                      <td rowSpan={2} style={tdStyle}>{item.label}</td>
                      <td rowSpan={2} style={tdStyle}>{resp.actual ?? '—'}</td>
                      {headerRows.map((h,i) => <td key={i} style={tdStyleCenter}><b>{h}</b></td>)}
                      <td rowSpan={2} style={tdStyle}>{resp.remark ?? '—'}</td>
                    </tr>
                    <tr>
                      {phases.map(p => (
                        <td key={p} style={tdStyleCenter}>{resp[p] ?? '—'}</td>
                      ))}
                    </tr>
                  </React.Fragment>
                );
              }
              // rows 4–8
              return (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.id}</td>
                  <td style={tdStyle} colSpan={5}>{item.label}</td>
                  <td style={tdStyle}>{resp.remark ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  border:'1px solid #000', padding:4, background:'#eee', textAlign:'center', fontSize:'12px'
};
const tdStyle = {
  border:'1px solid #000', padding:4, fontSize:'12px'
};
const tdStyleCenter = {
  ...tdStyle, textAlign:'center'
};
