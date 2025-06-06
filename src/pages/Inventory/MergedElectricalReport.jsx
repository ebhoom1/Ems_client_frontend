// src/components/MergedElectricalReport.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { useSelector } from 'react-redux';
import { API_URL } from '../../utils/apiConfig';
import { useParams } from 'react-router-dom';
import genexlogo from '../../assests/images/logonewgenex.png';

export default function MergedElectricalReport() {
  // Now we expect URL parameters: /report/electrical/download/:userName/:year/:month
  const { userName, year, month } = useParams();
  const [reports, setReports] = useState([]);
  const [logoMetaUrl, setLogoMetaUrl] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();
const [companyName, setCompanyName]= useState('')
  const adminType = useSelector(
    (s) => s.user.userData?.validUserOne?.adminType
  );

  // (A) static checklist definition
  const phases = ['RY', 'YB', 'BR'];
  const checklist = [
    { id: 1, label: 'Voltage (V)' },
    { id: 2, label: 'Current (A)' },
    { id: 3, label: 'Power (kW)' },
    { id: 4, label: 'Check starter controls and connection' },
    { id: 5, label: 'Check contractor for free movement and servicing' },
    { id: 6, label: 'Check OLR condition and note ampere set' },
    { id: 7, label: 'Check earthing' },
    { id: 8, label: 'Examine exposed cables, joints & bus bars' },
  ];

  // 1️⃣ Fetch all electrical reports filtered by userName/year/month
  useEffect(() => {
    if (!userName || !year || !month) {
      setLoading(false);
      return;
    }

    const url = `${API_URL}/api/electricalreports/user/${encodeURIComponent(
      userName
    )}/${year}/${month}`;

    axios
      .get(url)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.reports)) {
          setReports(res.data.reports);
        }
      })
      .catch((err) => {
        console.error('Error fetching merged electrical reports:', err);
      })
      .finally(() => setLoading(false));
  }, [userName, year, month]);
useEffect(() => {
  if (!userName) return;
  axios
    .get(`${API_URL}/api/get-user-by-userName/${encodeURIComponent(userName)}`)
    .then(res => {
      const user = res.data.user;
      setCompanyName(user?.companyName || '—');
    })
    .catch(err => {
      console.error('Error fetching company:', err);
      setCompanyName('—');
    });
}, [userName]);

  // 2️⃣ Fetch logo metadata (for embedded PDF)
  useEffect(() => {
    if (!adminType) return;

    axios
      .get(`${API_URL}/api/logo/${adminType}`)
      .then((res) => {
        const logos = res.data?.data || [];
        if (logos.length) {
          const latest = logos.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )[0];
          setLogoMetaUrl(latest.logoUrl);
        }
      })
      .catch((_) => {
        /* silently ignore */
      });
  }, [adminType]);

  // 3️⃣ Convert `logoMetaUrl` into a Base64 Data URL (so html2pdf can embed)
  useEffect(() => {
    if (!logoMetaUrl) return;
    fetch(logoMetaUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoDataUrl(reader.result);
        reader.readAsDataURL(blob);
      })
      .catch((_) => {
        /* silently ignore */
      });
  }, [logoMetaUrl]);

  if (loading) return <p>Loading…</p>;

  // (B) Helper: Decide color of a measurement cell based on “Actual”
  const getMeasurementColor = (rowId, phaseKey, respMap) => {
    const measured = parseFloat(respMap[rowId]?.[phaseKey] || '');
    const actual = parseFloat(respMap[rowId]?.actual || '');
    if (isNaN(measured) || isNaN(actual)) return 'black';
    return measured > actual ? 'red' : 'green';
  };

  // (C) Helper: Render ✓ or ✕ in “Process Status” cell, based on remarkStatus
  const renderStatusSymbol = (rowId, respMap) => {
    const status = respMap[rowId]?.remarkStatus;
    if (status === 'pass') {
      return <span style={{ color: 'green' }}>✓</span>;
    }
    if (status === 'fail') {
      return <span style={{ color: 'red' }}>✕</span>;
    }
    return '—';
  };

  // (D) Helper: Return CSS class for remark text (green if pass, red if fail)
  const getRemarkColorClass = (rowId, respMap) => {
    const status = respMap[rowId]?.remarkStatus;
    if (status === 'pass') return 'text-success';
    if (status === 'fail') return 'text-danger';
    return '';
  };

  // (E) Filter by equipment name / technician name / date string
  const filtered = reports.filter((r) => {
    const t = searchTerm.toLowerCase();
    const date = new Date(r.createdAt || r.timestamp || '').toLocaleDateString(
      'en-GB'
    );
    return (
      (r.equipment?.name || '').toLowerCase().includes(t) ||
      (r.technician?.name || '').toLowerCase().includes(t) ||
      date.includes(t)
    );
  });

  // (F) Group by equipment.name, then pick only the latest per equipment
  const grouped = Object.values(
    filtered.reduce((acc, r) => {
      const key = r.equipment?.name || 'Unknown';
      if (!acc[key] || new Date(r.createdAt) > new Date(acc[key].createdAt)) {
        acc[key] = r;
      }
      return acc;
    }, {})
  );

  // 5️⃣ html2pdf download handler
  const downloadPDF = () => {
    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: `Merged_Electrical_Report_${userName}_${year}_${month}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
      })
      .from(reportRef.current)
      .save();
  };

  // Table cell styles
  const th = {
    border: '1px solid #000',
    padding: 4,
    background: '#eee',
    textAlign: 'center',
    fontSize: '12px',
  };
  const td = { border: '1px solid #000', padding: 4, fontSize: '12px' };
  const tdC = { ...td, textAlign: 'center' };

  return (
    <div className="container py-3">
      {/* Search + Download */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        
        <button className="btn btn-success" onClick={downloadPDF}>
          ⬇ Download PDF
        </button>
      </div>

      {/* ---------- begin PDF container ---------- */}
      <div
        ref={reportRef}
        style={{ background: '#fff', padding: 10, border: '1px solid #000' }}
      >
        {/* — single header with logo — */}
       <div
             className="d-flex align-items-center mb-2"
             style={{ background: '#236a80', color: '#fff', padding: 10 }}
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
<h6 className='text-center'>Merged Report of  {companyName && ` — ${companyName}`}&nbsp;— Reports for{' '}
  ({userName})
 
  {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
</h6>
        {/* — title below header — */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 'bold',
            borderTop: '2px solid #000',
            borderBottom: '2px solid #000',
            padding: '4px 0',
            marginBottom: 16,
          }}
        >
          Electrical Engineer Report
        </div>

        {/* — loop through each “latest by equipment” — */}
        {grouped.map((report) => {
          const { technician, equipment, responses, createdAt } = report;
          const dateStr = new Date(createdAt).toLocaleDateString('en-GB');

          return (
            <div key={equipment?.name} style={{ marginBottom: 24 }}>
              {/* Date */}
              <div style={{ marginBottom: 8, fontSize: 12 }}>
                <strong>Date:</strong> {dateStr}
              </div>

              {/* Equipment info table */}
              <table
                style={{
                  width: '100%',
                  border: '1px solid #000',
                  borderCollapse: 'collapse',
                  marginBottom: 12,
                }}
              >
                <tbody>
                  {[
                    [
                      "Service Engineer's Name",
                      `${technician?.name} — ${technician?.designation}`,
                    ],
                    ['Equipment Name', equipment?.name],
                    ['Model', equipment?.model],
                    ['Capacity in HP/KW', equipment?.capacity],
                    ['Rated Load in Amps', equipment?.ratedLoad],
                  ].map(([lbl, val]) => (
                    <tr key={lbl}>
                      <th
                        style={{
                          ...th,
                          textAlign: 'left',
                          background: '#ddd',
                          fontWeight: 'normal',
                        }}
                      >
                        {lbl}
                      </th>
                      <td style={td}>{val || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Checklist table for THIS equipment */}
              <table
                style={{
                  width: '100%',
                  border: '1px solid #000',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr>
                    <th style={th}>Sl.no</th>
                    <th style={th}>Category</th>
                    <th style={th}>Actual</th>
                    <th style={th} colSpan={phases.length}>
                      Measurement
                    </th>
                    <th style={th}>Process Status</th>
                    <th style={th}>Remarks</th>
                  </tr>
                  <tr>
                    <th style={th} colSpan={3}></th>
                    {phases.map((p) => (
                      <th key={p} style={th}>
                        {p}
                      </th>
                    ))}
                    <th style={th}></th>
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {checklist.map((item) => {
                    const respMap = responses || {};
                    const resp = respMap[item.id] || {};

                    // Rows 1–3 get two‐row format
                    if (item.id <= 3) {
                      const headerRow =
                        item.id === 1
                          ? ['', '', '']
                          : item.id === 2
                          ? ['R', 'Y', 'B']
                          : ['', '', ''];

                      return (
                        <React.Fragment key={item.id}>
                          <tr>
                            <td rowSpan={2} style={tdC}>
                              {item.id}
                            </td>
                            <td rowSpan={2} style={td}>
                              {item.label}
                            </td>
                            <td rowSpan={2} style={tdC}>
                              {resp.actual || '—'}
                            </td>
                            {headerRow.map((h, i) => (
                              <td key={i} style={tdC}>
                                <b>{h}</b>
                              </td>
                            ))}
                            <td rowSpan={2} style={tdC}>
                              {renderStatusSymbol(item.id, respMap)}
                            </td>
                            <td rowSpan={2} style={td}>
                              <span
                                className={getRemarkColorClass(item.id, respMap)}
                              >
                                {resp.remark || '—'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            {phases.map((p) => {
                              // Determine which key is used: for row 2 map RY→R, YB→Y, BR→B
                              const phaseKey =
                                item.id === 2
                                  ? { RY: 'R', YB: 'Y', BR: 'B' }[p]
                                  : p;
                              const val = resp[phaseKey] ?? '—';
                              const color = getMeasurementColor(
                                item.id,
                                phaseKey,
                                respMap
                              );
                              return (
                                <td key={p} style={tdC}>
                                  <span style={{ color }}>{val}</span>
                                </td>
                              );
                            })}
                          </tr>
                        </React.Fragment>
                      );
                    }

                    // Rows 4–8 get single‐row format
                    return (
                      <tr key={item.id}>
                        <td style={tdC}>{item.id}</td>
                        <td style={td} colSpan={phases.length + 2}>
                          {item.label}
                        </td>
                        <td style={tdC}>
                          {renderStatusSymbol(item.id, respMap)}
                        </td>
                        <td style={td}>
                          <span
                            className={getRemarkColorClass(item.id, respMap)}
                          >
                            {resp.remark || '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
      {/* ---------- end PDF container ---------- */}
    </div>
  );
}
