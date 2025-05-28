// src/pages/Inventory/MechanicalReport.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import { API_URL } from '../../utils/apiConfig';

export default function MechanicalReport() {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
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
          setReport(reports[0]);
        } else {
          toast.error('No mechanical report found for this equipment.');
        }
      })
      .catch(() => toast.error('Failed to load mechanical report'))
      .finally(() => setLoading(false));
  }, [equipmentId]);

  // fetch logo
  useEffect(() => {
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
  }, [adminType]);

  // PDF download
  const downloadPDF = () => {
    const opt = {
      margin: [10,10,10,10],
      filename: `Mechanical_Report_${equipmentId}.pdf`,
      image: { type:'jpeg', quality:0.98 },
      html2canvas: { scale:2, useCORS:true },
      jsPDF: { unit:'pt', format:'a4', orientation:'portrait' }
    };
    html2pdf().from(reportRef.current).set(opt).save();
  };

  if (loading) return <p>Loading report…</p>;
  if (!report) return <p>No report available.</p>;

  const { technician, equipmentName, columns, entries, timestamp } = report;

  return (
    <div className="container py-3">
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
        <div
          className="d-flex align-items-center mb-2"
          style={{ background: '#236a80', color: '#fff', padding: '10px' }}
        >
          {logoUrl
            ? <img src={logoUrl} alt={`${adminType} logo`} style={{ maxWidth:120, maxHeight:120 }} />
            : <span>Loading logo...</span>
          }
          <div className="text-center flex-grow-1">
            <div style={{ fontSize:14, fontWeight:'bold' }}>
              <i>Genex</i> Utility Management Pvt Ltd
            </div>
            <div>No:04, Suraj Nilaya, Sahyadri Layout, Shettihalli, Jalahalli West, Bangalore - 560015</div>
            <div>Phone: +91-92436-02152</div>
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

        {/* Date */}
        <div style={{ marginBottom: 8 }}>
          <strong>Date:</strong> {new Date(timestamp).toLocaleDateString()}
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

        {/* Maintenance entries */}
        <table style={{ width:'100%', border:'1px solid #000', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>SL. NO</th>
             
              <th style={thStyle}>WORK DESCRIPTION</th>
              {columns.map((col,i)=>(
                <th key={i} style={thStyle}>{col}</th>
              ))}
              <th style={thStyle}>REMARKS</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx)=>(
              <tr key={entry._id || idx}>
                <td style={tdStyle}>{idx+1}</td>
               
                <td style={tdStyle}>{entry.category}</td>
                {entry.checks.map((chk,i)=>(
                  <td key={i} style={tdStyleCenter}>{chk.value || '—'}</td>
                ))}
                <td style={tdStyle}>{entry.remarks || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles
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
