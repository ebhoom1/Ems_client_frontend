// src/components/MergedElectricalReport.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { useSelector } from 'react-redux';
import { API_URL } from '../../utils/apiConfig';

export default function MergedElectricalReport() {
  const [reports, setReports] = useState([]);
  const [logoMetaUrl, setLogoMetaUrl] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();

  const adminType = useSelector(s => s.user.userData?.validUserOne?.adminType);

  // static checklist definition
  const phases = ['RY','YB','BR'];
  const checklist = [
    { id:1, label:'Voltage V'                      },
    { id:2, label:'Current A'                      },
    { id:3, label:'Power kW'                       },
    { id:4, label:'Check starter controls and connection' },
    { id:5, label:'Check contactor for free movement and servicing' },
    { id:6, label:'Check OLR condition and note ampere set' },
    { id:7, label:'Check earthing'                  },
    { id:8, label:'Examine exposed cables, joints & bus bars' }
  ];

  // 1️⃣ fetch all electrical reports
  useEffect(() => {
    axios.get(`${API_URL}/api/all-electricalreports`)
      .then(res => {
        if (res.data.success && Array.isArray(res.data.reports)) {
          setReports(res.data.reports);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // 2️⃣ fetch logo metadata
  useEffect(() => {
    if (!adminType) return;
    axios.get(`${API_URL}/api/logo/${adminType}`)
      .then(res => {
        const logos = res.data?.data || [];
        if (logos.length) {
          const latest = logos
            .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0];
          setLogoMetaUrl(latest.logoUrl);
        }
      })
      .catch(()=>{/*silent*/});
  }, [adminType]);

  // 3️⃣ convert logo to base64 for html2pdf
  useEffect(() => {
    if (!logoMetaUrl) return;
    fetch(logoMetaUrl)
      .then(r=>r.blob())
      .then(blob=>{
        const reader = new FileReader();
        reader.onloadend = ()=>setLogoDataUrl(reader.result);
        reader.readAsDataURL(blob);
      })
      .catch(()=>{/*silent*/});
  }, [logoMetaUrl]);

  if (loading) return <p>Loading…</p>;

  // 4️⃣ filter & group by equipmentName, pick latest per group
  const filtered = reports.filter(r => {
    const t = searchTerm.toLowerCase();
    const date = new Date(r.createdAt||r.timestamp||'').toLocaleDateString('en-GB');
    return (
      (r.equipment?.name||'').toLowerCase().includes(t) ||
      (r.technician?.name||'').toLowerCase().includes(t) ||
      date.includes(t)
    );
  });
  const grouped = Object.values(
    filtered.reduce((acc,r) => {
      const key = r.equipment?.name || 'Unknown';
      if (!acc[key] || new Date(r.createdAt) > new Date(acc[key].createdAt)) {
        acc[key] = r; // keep latest
      }
      return acc;
    }, {})
  );

  // 5️⃣ html2pdf download handler
  const downloadPDF = () => {
    html2pdf().set({
      margin:       [10,10,10,10],
      filename:     'Merged_Electrical_Report.pdf',
      image:        { type:'jpeg', quality:0.98 },
      html2canvas:  { scale:2, useCORS:true, allowTaint:true },
      jsPDF:        { unit:'pt', format:'a4', orientation:'portrait' }
    }).from(reportRef.current).save();
  };

  // table styles
  const th = { border:'1px solid #000', padding:4, background:'#eee', textAlign:'center', fontSize:'12px' };
  const td = { border:'1px solid #000', padding:4, fontSize:'12px' };
  const tdC = { ...td, textAlign:'center' };

  return (
    <div className="container py-3">
      {/* Search + Download */}
      <div className="d-flex justify-content-between align-items-center mb-3">
      
        <button className="btn btn-success" onClick={downloadPDF}>
          ⬇ Download PDF
        </button>
      </div>

      {/* Continuous report */}
      <div ref={reportRef} style={{ background:'#fff', padding:10 }}>
        {/* — single header — */}
        <div className="d-flex align-items-center mb-4" style={{ background:'#236a80', color:'#fff', padding:10 }}>
          {logoDataUrl
            ? <img src={logoDataUrl} alt="logo" style={{ maxWidth:120, maxHeight:120, marginRight:10 }} />
            : <div style={{ width:120, height:120, marginRight:10 }} />
          }
          <div style={{ flex:1, textAlign:'center', lineHeight:1.2 }}>
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
          Electrical Engineer Report
        </div>

        {/* — one section per equipment — */}
        {grouped.map(report => {
          const {
            technician,
            equipment,
            responses,
            createdAt
          } = report;
          const dateStr = new Date(createdAt).toLocaleDateString('en-GB');

          return (
            <div key={equipment?.name} style={{ marginBottom:24 }}>
              {/* Date */}
              <div style={{ marginBottom:8, fontSize:12 }}>
                <strong>Date:</strong> {dateStr}
              </div>

              {/* Equipment info */}
              <table style={{ width:'100%', border:'1px solid #000', borderCollapse:'collapse', marginBottom:12 }}>
                <tbody>
                  {[
                    ["Service Engineer's Name", `${technician?.name} — ${technician?.designation}`],
                    ["Equipment Name", equipment?.name],
                    ["Model", equipment?.model],
                    ["Capacity in HP/KW", equipment?.capacity],
                    ["Rated Load in Amps", equipment?.ratedLoad]
                  ].map(([lbl,val])=>(
                    <tr key={lbl}>
                      <th style={{ ...th, textAlign:'left', background:'#ddd' }}>{lbl}</th>
                      <td style={td}>{val||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Checklist */}
              <table style={{ width:'100%', border:'1px solid #000', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Sl.no</th>
                    <th style={th}>Category</th>
                    <th style={th}>Actual</th>
                    <th style={th} colSpan={phases.length}>Measurement</th>
                    <th style={th}>Remarks</th>
                  </tr>
                  <tr>
                    <th style={th} colSpan={3}></th>
                    {phases.map(p=>
                      <th key={p} style={th}>{p}</th>
                    )}
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {checklist.map(item=>{
                    const resp = responses[item.id]||{};
                    if (item.id <= 3) {
                      const headerRow = item.id===1?['','','']: item.id===2?['R','Y','B']:['','',''];
                      return (
                        <React.Fragment key={item.id}>
                          <tr>
                            <td rowSpan={2} style={td}>{item.id}</td>
                            <td rowSpan={2} style={td}>{item.label}</td>
                            <td rowSpan={2} style={td}>{resp.actual||'—'}</td>
                            {headerRow.map((h,i)=>
                              <td key={i} style={tdC}><b>{h}</b></td>
                            )}
                            <td rowSpan={2} style={td}>{resp.remark||'—'}</td>
                          </tr>
                          <tr>
                            {phases.map(p=>
                              <td key={p} style={tdC}>{resp[p]||'—'}</td>
                            )}
                          </tr>
                        </React.Fragment>
                      );
                    }
                    return (
                      <tr key={item.id}>
                        <td style={td}>{item.id}</td>
                        <td style={td} colSpan={phases.length+2}>{item.label}</td>
                        <td style={td}>{resp.remark||'—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
