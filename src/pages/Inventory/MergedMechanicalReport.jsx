// src/components/MergedMechanicalReport.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { useSelector } from 'react-redux';
import { API_URL } from '../../utils/apiConfig';

export default function MergedMechanicalReport() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();

  const adminType = useSelector(s => s.user.userData?.validUserOne?.adminType);
  const [logoUrl, setLogoUrl] = useState('');

  // load all reports
  useEffect(() => {
    axios.get(`${API_URL}/api/mechanicalreports`)
      .then(res => {
        if (res.data.success && Array.isArray(res.data.reports))
          setReports(res.data.reports);
      })
      .finally(() => setLoading(false));
  }, []);

  // load logo
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
      .catch(()=>{/*silent*/});
  }, [adminType]);

  // filter & group
  const filtered = reports.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      (r.equipmentName||'').toLowerCase().includes(term) ||
      (r.technician?.name||'').toLowerCase().includes(term) ||
      new Date(r.timestamp||'').toLocaleDateString('en-GB').includes(term)
    );
  });
  const grouped = filtered.reduce((acc, r) => {
    const key = r.equipmentName || 'Unknown';
    (acc[key] = acc[key]||[]).push(r);
    return acc;
  }, {});

  // download
  const downloadPDF = () => {
    html2pdf().set({
      margin: [10,10,10,10],
      filename: 'Merged_Mechanical_Report.pdf',
      image: { type:'jpeg', quality:0.98 },
      html2canvas: { scale:2, useCORS:true },
      jsPDF: { unit:'pt', format:'a4', orientation:'portrait' }
    }).from(reportRef.current).save();
  };

  if (loading) return <p>Loading…</p>;

  const th = { border:'1px solid #000', padding:4, background:'#eee', textAlign:'center', fontSize:12 };
  const td = { border:'1px solid #000', padding:4, fontSize:12 };
  const tdC = { ...td, textAlign:'center' };

  return (
    <div className="container py-3">
      {/* Search + Download */}
      <div className="d-flex justify-content-between align-items-center mb-3">
       
        <button className="btn btn-success" onClick={downloadPDF}>
          ⬇ Download PDF
        </button>
      </div>

      {/* Entire Report */}
      <div ref={reportRef} style={{ background:'#fff', padding:10 }}>
        {/* ——— HEADER (only once) ——— */}
        <div style={{ background:'#236a80', color:'#fff', padding:10, marginBottom:12 }}
             className="d-flex align-items-center">
          {logoUrl
            ? <img src={logoUrl} alt="logo" style={{ maxWidth:120, maxHeight:120 }} />
            : <div style={{ width:120, height:120 }} />
          }
          <div className="text-center flex-grow-1" style={{ lineHeight:1.2 }}>
            <div style={{ fontSize:14, fontWeight:'bold' }}>
              <i>Genex</i> Utility Management Pvt Ltd
            </div>
            <div>No:04, Suraj Nilaya, Sahyadri Layout, Shettihalli,</div>
            <div>Jalahalli West, Bangalore – 560015 | +91-92436-02152</div>
          </div>
        </div>
        <div style={{
          textAlign:'center',
          fontSize:12,
          fontWeight:'bold',
          borderTop:'2px solid #000',
          borderBottom:'2px solid #000',
          padding:'4px 0',
          marginBottom:16
        }}>
          Mechanical Preventive Maintenance Report
        </div>

        {/* ——— One section per equipment ——— */}
        {Object.entries(grouped).map(([equipName, reps], idx, arr) => {
          const rpt = reps[0];
          const dateStr = new Date(rpt.timestamp).toLocaleDateString('en-GB');
          return (
            <div key={equipName} style={{ marginBottom: idx < arr.length-1 ? 20 : 0, pageBreakAfter: idx < arr.length-1 ? 'always' : 'auto' }}>
              {/* Date / Site / Capacity */}
              <div style={{ marginBottom:8, fontSize:12 }}>
                <strong>Date:</strong> {dateStr}
                {rpt.siteName && <> &nbsp;|&nbsp; <strong>Site:</strong> {rpt.siteName}</>}
                {rpt.capacity && <> &nbsp;|&nbsp; <strong>Capacity:</strong> {rpt.capacity}</>}
              </div>

              {/* Engineer & Equipment */}
              <table style={{ width:'100%', border:'1px solid #000', borderCollapse:'collapse', marginBottom:12 }}>
                <tbody>
                  <tr>
                    <th style={th}>Service Engineer</th>
                    <td style={td}>{rpt.technician?.name} — {rpt.technician?.designation}</td>
                  </tr>
                  <tr>
                    <th style={th}>Equipment Name</th>
                    <td style={td}>{equipName}</td>
                  </tr>
                </tbody>
              </table>

              {/* Entries */}
              <table style={{ width:'100%', border:'1px solid #000', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>SL. NO</th>
                    <th style={th}>CATEGORY</th>
                    <th style={th}>WORK DESCRIPTION</th>
                    {rpt.columns.map((col,i) => <th key={i} style={th}>{col}</th>)}
                    <th style={th}>REMARKS</th>
                  </tr>
                </thead>
                <tbody>
                  {reps.flatMap(rep =>
                    rep.entries.map((e, i) => (
                      <tr key={`${rep._id}-${e.id}`}>
                        <td style={tdC}>{i+1}</td>
                        <td style={tdC}>Mechanical</td>
                        <td style={td}>{e.category}</td>
                        {e.checks.map((c,j) => <td key={j} style={tdC}>{c.value ?? '—'}</td>)}
                        <td style={td}>{e.remarks || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          );
        })}

      </div>
    </div>
  );
}
