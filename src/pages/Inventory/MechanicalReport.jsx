

// src/pages/Inventory/MechanicalReport.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import { API_URL } from '../../utils/apiConfig';
import genexlogo from '../../assests/images/logonewgenex.png';

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
    const handlePopState = (event) => {
      navigate("/services?tab=equipmentList", { replace: true });
    };
    window.history.pushState(
      { mechanicalReport: true },
      "",
      window.location.href
    );

    window.addEventListener("popstate", handlePopState);

    // Cleanup: Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);


  // 1) fetch equipment metadata
  useEffect(() => {
    const equipmentApiUrl = `${API_URL}/api/equiment/${equipmentId}`;
    axios.get(equipmentApiUrl)
      .then(res => {
        const eq = res.data?.equipment || {};
        setUserName(eq.userName);
        setEquipmentInfo({
          capacity: eq.capacity || '—',
          model:    eq.modelSerial || '—',
          rateLoad: eq.ratedLoad || '—'
        });
      })
      .catch(err => {
        console.error("❌ Error fetching equipment info:", err);
        toast.error('Failed to load equipment info');
      });
  }, [equipmentId]);

  // 2) fetch companyName by userName
  useEffect(() => {
    if (!userName) return;
    const userApiUrl = `${API_URL}/api/get-user-by-userName/${userName}`;
    console.log(userApiUrl);
    
    axios.get(userApiUrl)
      .then(res => {
        const u = res.data?.user || {};
        setCompanyName(u.companyName || '—');
      })
      .catch(err => {
        console.error("❌ Error fetching company name:", err);
      });
  }, [userName]);

  // 3) fetch the mechanical report
  useEffect(() => {
    axios.get(`${API_URL}/api/mechanicalreports/${equipmentId}`)
      .then(res => {
        const { success, reports } = res.data;
        if (success && Array.isArray(reports) && reports.length) {
          setReport(reports[0]);
        } else {
          toast.error('No mechanical report found for this equipment.');
          setReport(null);
        }
      })
      .catch(err => {
        console.error("Error fetching mechanical report:", err);
        toast.error('Failed to load mechanical report');
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [equipmentId]);

  // PDF download
  const downloadPDF = async () => {
    const imgs = Array.from(reportRef.current.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
    const opt = {
      margin: [10,10,10,10],
      filename: `Mechanical_Report_${equipmentId}.pdf`,
      image:    { type:'jpeg', quality:0.98 },
      html2canvas: { scale:2, useCORS:true },
      jsPDF:    { unit:'pt', format:'a4', orientation:'portrait' },
      pagebreak: { mode: ["avoid-all"] },
    };
    html2pdf().from(reportRef.current).set(opt).save();
  };

  if (loading) return <p>Loading report…</p>;
  if (!report) return <p>No report available.</p>;

  // 4) destructure territorialManager instead of technician
  const {
    territorialManager,
    equipmentName,
    columns,
    entries,
    timestamp,
    isWorking,
    comments,
    photos
  } = report;

  const reportColumns = columns?.length ? columns : ['Status/Details'];

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-secondary" onClick={()=>navigate(-1)}>← Back</button>
        <button className="btn btn-success" onClick={downloadPDF}>⬇ Download PDF</button>
      </div>

      <div
        ref={reportRef}
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          lineHeight: 1.2,
          color: '#000',
          background: '#fff',
          padding: 10,
          border: '1px solid #000'
        }}
      >
        {/* Header */}
        <div className="d-flex align-items-center mb-2" style={{ background: '#236a80', color: '#fff', padding: '10px' }}>
          <img crossOrigin="anonymous" src={genexlogo} alt="Genex logo" style={{ maxWidth: 120, maxHeight: 120 }} />
          <div className="text-center flex-grow-1" style={{ fontFamily: 'Century Gothic, sans-serif' }}>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>
              <i style={{ fontFamily: '"Comic Sans MS", cursive', fontSize: 24 }}>Genex</i> Utility Management Pvt Ltd
            </div>
            <div style={{ fontSize: 14 }}>
           Sujatha Arcade, Second Floor, #32 Lake View Defence Colony, Shettihalli, Post, Jalahalli West, Bengaluru, Karnataka 560015
            </div>
            <div style={{ fontSize: 14 }}>Phone: +91-9663044156</div>
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

        {/* Date & Status */}
        <div style={{ marginBottom: 8 }}>
          <strong>Date:</strong> {new Date(timestamp).toLocaleDateString()}
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Equipment Working Status:</strong> {isWorking === "yes" ? "Yes" : "No"}
        </div>

        {/* Info Table */}
        <table style={{ width:'100%', border:'1px solid #000', borderCollapse:'collapse', marginBottom:12 }}>
          <tbody>
            {[
              ["Territorial Manager", territorialManager ? `${territorialManager.name} (${territorialManager.email})` : '—'],
              ["Equipment Name", equipmentName],
              ["Capacity", equipmentInfo.capacity],
              ["Model", equipmentInfo.model],
              ["Rated Load", equipmentInfo.rateLoad],
              ["Company Name", companyName]
            ].map(([label, value]) => (
              <tr key={label}>
                <th style={thStyle}>{label}</th>
                <td style={tdStyle}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Entries Table or Placeholder */}
        {isWorking === "yes" && entries?.length > 0 ? (
          <table style={{ width:'100%', border:'1px solid #000', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>SL. NO</th>
                <th style={thStyle}>WORK DESCRIPTION</th>
                {reportColumns.map((col,i) => (
                  <th key={i} style={thStyle}>{col}</th>
                ))}
                <th style={thStyle}>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => {
                const hasFail = entry.checks?.some(c => c.value === 'fail');
                const hasOk   = entry.checks?.some(c => c.value === 'ok');
                const remarksStyle = { ...tdStyle, color: hasFail ? 'red' : hasOk ? 'green' : tdStyle.color };

                return (
                  <tr key={entry._id || idx}>
                    <td style={tdStyleCenter}>{idx + 1}</td>
                    <td style={tdStyle}>{entry.category}</td>

                    {entry.checks && entry.checks.length > 0 ? (
                      entry.checks.map((chk, i) => (
                        <td key={i} style={{
                          ...tdStyleCenter,
                          color: chk.value === 'ok' ? 'green' : chk.value === 'fail' ? 'red' : tdStyle.color
                        }}>
                          {chk.value === 'ok' ? '✓' : chk.value === 'fail' ? '✕' : '—'}
                        </td>
                      ))
                    ) : (
                      <td style={tdStyleCenter} colSpan={reportColumns.length}>—</td>
                    )}

                    <td style={remarksStyle}>{entry.remarks || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign:'center', fontStyle:'italic', color:'#555' }}>
            No detailed checklist entries (Equipment not working).
          </p>
        )}

        {/* Comments */}
        <div style={{ marginTop:20, marginBottom:15 }}>
          <h4 style={{ fontSize:14, marginBottom:5, borderBottom:'1px solid #eee', paddingBottom:5 }}>Comments:</h4>
          <p style={tdStyle}>{comments || 'No additional comments.'}</p>
        </div>

        {/* Photos */}
        <div style={{ marginTop:20, marginBottom:15 }}>  
          <h4 style={{ fontSize:14, marginBottom:5, borderBottom:'1px solid #eee', paddingBottom:5 }}>Attached Photos:</h4>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
            {photos && photos.length > 0 ? (
              photos.map((url, i) => (
                <img
                  key={i}
                  crossOrigin="anonymous"
                  src={url}
                  alt={`Photo ${i+1}`}
                  style={{ maxWidth:150, maxHeight:150, border:'1px solid #ddd', borderRadius:4 }}
                  onError={e => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
                />
              ))
            ) : (
              <p style={{ fontStyle:'italic', color:'#555' }}>No photos attached.</p>
            )}
          </div>
        </div>
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
