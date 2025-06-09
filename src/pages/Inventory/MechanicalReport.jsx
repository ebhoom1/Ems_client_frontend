// src/pages/Inventory/MechanicalReport.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import { API_URL } from '../../utils/apiConfig';
import genexlogo from '../../assests/images/logonewgenex.png'

export default function MechanicalReport() {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const adminType = useSelector(s => s.user.userData?.validUserOne?.adminType);
  const [userName, setUserName] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [equipmentInfo, setEquipmentInfo] = useState({});

  useEffect(() => {
    const equipmentApiUrl = `${API_URL}/api/equiment/${equipmentId}`;
    console.log("📡 Fetching equipment from:", equipmentApiUrl);

    axios.get(equipmentApiUrl)
      .then(res => {
        const equipment = res.data?.equipment;
        if (equipment) {
          console.log("👤 Equipment Data:", equipment);
          setUserName(equipment.userName);
          setEquipmentInfo({
            capacity: equipment.capacity || '—',
            model: equipment.modelSerial || '—',
            rateLoad: equipment.ratedLoad || '—'
          });
        }
      })
      .catch(err => {
        console.error("❌ Error fetching equipment info:", err);
      });
  }, [equipmentId]);

  useEffect(() => {
    if (!userName) return;

    const userApiUrl = `${API_URL}/api/get-user-by-userName/${userName}`;
    console.log("📡 Fetching user from:", userApiUrl);

    axios.get(userApiUrl)
      .then(res => {
        console.log("✅ User API Response:", res.data);

        const user = res.data?.user;
        if (user && user.companyName) {
          console.log("🏢 companyName is:", user.companyName);
          setCompanyName(user.companyName);
        } else {
          console.warn("⚠️ User found but no companyName present");
        }
      })
      .catch(err => {
        console.error("❌ Error fetching company name:", err);
      });
  }, [userName]);

  console.log("📍 userName is:", userName);
  console.log("🏢 companyName is:", companyName);


  // fetch mechanical report
  useEffect(() => {
    axios.get(`${API_URL}/api/mechanicalreports/${equipmentId}`)
      .then(res => {
        const { success, reports } = res.data;
        if (success && Array.isArray(reports) && reports.length) {
          setReport(reports[0]); // Assuming you want to display the first report found
        } else {
          toast.error('No mechanical report found for this equipment.');
          setReport(null); // Explicitly set to null if no report
        }
      })
      .catch((err) => {
        console.error("Error fetching mechanical report:", err);
        toast.error('Failed to load mechanical report');
        setReport(null); // Ensure report is null on error
      })
      .finally(() => setLoading(false));
  }, [equipmentId]);

  // fetch logo
 /*  useEffect(() => {
    if (!adminType) return;
    axios.get(`${API_URL}/api/logo/${adminType}`)
      .then(r => {
        const logos = r.data?.data || [];
        if (logos.length) {
          const latest = logos.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0];
          setLogoUrl(latest.logoUrl);
        }
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to fetch logo');
      });
  }, [adminType]); */

  // PDF download
const downloadPDF = async () => {
  // 1) Find all images under your report container
  const imgs = Array.from(reportRef.current.querySelectorAll('img'));

  // 2) Wait for each to load (or error), so html2canvas can read its pixels
  await Promise.all(imgs.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload  = resolve;
      img.onerror = resolve;
    });
  }));

  // 3) Now snapshot to PDF
  const opt = {
    margin: [10,10,10,10],
    filename: `Mechanical_Report_${equipmentId}.pdf`,
    image:    { type:'jpeg', quality:0.98 },
    html2canvas: { scale:2, useCORS:true },
    jsPDF:    { unit:'pt', format:'a4', orientation:'portrait' }
  };
  html2pdf().from(reportRef.current).set(opt).save();
};


  if (loading) return <p>Loading report…</p>;
  if (!report) return <p>No report available.</p>;

  const { technician, equipmentName, columns, entries, timestamp, isWorking, comments, photos } = report;

  // Define column headers, defaulting if `columns` is empty (for 'no' reports)
  // This assumes 'columns' array exists in the report, which it should if isWorking is 'yes'
  const reportColumns = columns && columns.length > 0 ? columns : ["Status/Details"];

  return (
    <div className="container py-3" >
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-secondary" onClick={()=>navigate(-1)}>
          ← Back
        </button>
        <button className="btn btn-success" onClick={downloadPDF}>
          ⬇ Download PDF
        </button>
      </div>

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
     {/* Header */}
<div
  className="d-flex align-items-center mb-2"
  style={{ background: '#236a80', color: '#fff', padding: '10px' }}
>
  <img
    crossOrigin="anonymous"
    src={genexlogo}
    alt="Genex logo"
    style={{ maxWidth: 120, maxHeight: 120 }}
  />
  <div className="text-center flex-grow-1" style={{ fontFamily: 'Century Gothic, sans-serif' }}>
    <div style={{ fontSize: 20, fontWeight: 'bold' }}>
      <i style={{ fontFamily: '"Comic Sans MS", cursive',fontSize: 24, }}>Genex</i>{' '}
      Utility Management Pvt Ltd
    </div>
    <div style={{ fontSize: 14 }}>
      No:04, Suraj Nilaya, Sahyadri Layout, Shettihalli, Jalahalli West, Bangalore - 560015
    </div>
    <div style={{ fontSize: 14 }}>
      Phone: +91-92436-02152
    </div>
  </div>
</div>


        {/* Title */}
        <div style={{
          textAlign:'center',
          margin:'10px 0',
          fontSize:12,
          fontWeight:'bold',
          borderTop:'2px solid #000',
          borderBottom:'2px solid #000',
          padding:'4px 0'
        }}>
          Mechanical Preventive Maintenance Report
        </div>

        {/* Date and Working Status */}
        <div style={{ marginBottom: 8 }}>
          <strong>Date:</strong> {new Date(timestamp).toLocaleDateString()}
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Equipment Working Status:</strong> {isWorking === "yes" ? "Yes" : "No"}
        </div>


        {/* Equipment & Technician Info */}
        <table style={{ width:'100%', border:'1px solid', borderCollapse:'collapse', marginBottom:12 }}>
          <tbody>
            {[
              ["Service Engineer", `${technician.name} — ${technician.designation}`],
              ["Equipment Name", equipmentName],
              ["Capacity", equipmentInfo.capacity],
              ["Model", equipmentInfo.model],
              ["Rated Load", equipmentInfo.rateLoad],
              ["Company Name", companyName || "—"]
            ].map(([label, value]) => (
              <tr key={label}>
                <th style={thStyle}>{label}</th>
                <td style={tdStyle}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Conditional Maintenance entries table */}
        {isWorking === "yes" && entries && entries.length > 0 ? (
          <table style={{ width:'100%', border:'1px solid #000', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>SL. NO</th>
                <th style={thStyle}>WORK DESCRIPTION</th>
                {reportColumns.map((col,i)=>(
                  <th key={i} style={thStyle}>{col}</th>
                ))}
                <th style={thStyle}>REMARKS</th>
              </tr>
            </thead>
          <tbody>
  {entries.map((entry, idx) => {
    // determine if any check failed or passed
    const hasFail = entry.checks?.some(chk => chk.value === 'fail');
    const hasOk   = entry.checks?.some(chk => chk.value === 'ok');

    // build the style for the remarks cell
    const remarksStyle = {
      ...tdStyle,
      color: hasFail ? 'red' : hasOk ? 'green' : tdStyle.color
    };

    return (
      <tr key={entry._id || idx}>
        <td style={tdStyle}>{idx + 1}</td>
        <td style={tdStyle}>{entry.category}</td>

        {entry.checks && entry.checks.length > 0 ? (
          entry.checks.map((chk, i) => {
            let content = '—';
            let extraStyle = {};

            if (chk.value === 'ok') {
              content = '✓';
              extraStyle.color = 'green';
            } else if (chk.value === 'fail') {
              content = '✕';
              extraStyle.color = 'red';
            }

            return (
              <td key={i} style={{ ...tdStyleCenter, ...extraStyle }}>
                {content}
              </td>
            );
          })
        ) : (
          <td style={tdStyleCenter} colSpan={reportColumns.length}>—</td>
        )}

        {/* REMARKS column, now colored */}
        <td style={remarksStyle}>
          {entry.remarks || '—'}
        </td>
      </tr>
    );
  })}
</tbody>


          </table>
        ) : (
          <p style={{ textAlign: 'center', margin: '20px 0', fontStyle: 'italic', color: '#555' }}>
            No detailed checklist entries for this report (Equipment status: Not Working).
          </p>
        )}

        {/* Comments Section (Always visible) */}
        <div style={{ marginTop: 20, marginBottom: 15 }}>
          <h4 style={{ fontSize: 14, marginBottom: 5, borderBottom: '1px solid #eee', paddingBottom: 5 }}>Comments:</h4>
          <p style={tdStyle}>{comments || 'No additional comments.'}</p>
        </div>

        {/* Photos Section */}
        <div style={{ marginTop: 20, marginBottom: 15 }}>
          <h4 style={{ fontSize: 14, marginBottom: 5, borderBottom: '1px solid #eee', paddingBottom: 5 }}>Attached Photos:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {photos && photos.length > 0 ? (
              // Iterate over the photos array received from the backend
          photos.map((photoUrl, index) => (
  <img
    key={index}
    crossOrigin="anonymous"
     src={photoUrl}
    alt={`Equipment Photo ${index + 1}`}
    style={{ maxWidth: '150px', maxHeight: '150px', border: '1px solid #ddd', borderRadius: '4px' }}
     onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
   />
 ))
            ) : (
              <p style={{ fontStyle: 'italic', color: '#555' }}>No photos attached.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Styles (unchanged)
const thStyle = {
  border:'1px solid #000',
  padding:4,
  background:'#effbfc',
  textAlign:'center',
  fontSize:12
};
const tdStyle = {
  border:'1px solid #000',
  padding:4,
  fontSize:12
};
const tdStyleCenter = {
  ...tdStyle,
  textAlign:'center'
};