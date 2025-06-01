// src/components/ElectricalReport.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import { API_URL } from '../../utils/apiConfig';
import genexlogo from '../../assests/images/logonewgenex.png';

export default function ElectricalReport() {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const adminType = useSelector((s) => s.user.userData?.validUserOne?.adminType);
  const [userName, setUserName] = useState(null);
  const [companyName, setCompanyName] = useState(null);

  // The 8 steps/checks in the Electrical checklist
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

  // 1) Fetch the saved report from backend
  useEffect(() => {
    axios
      .get(`${API_URL}/api/get-electricalreport/${equipmentId}`)
      .then((r) => {
        if (r.data.success) {
          setReport(r.data.report);
        } else {
          toast.error('Report not found');
        }
      })
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false));
  }, [equipmentId]);

  // 2) Fetch the equipment to get userName
  useEffect(() => {
    const equipmentApiUrl = `${API_URL}/api/equiment/${equipmentId}`;
    axios
      .get(equipmentApiUrl)
      .then((res) => {
        const equipment = res.data?.equipment;
        if (equipment?.userName) {
          setUserName(equipment.userName);
        }
      })
      .catch((err) => console.error('Error fetching equipment:', err));
  }, [equipmentId]);

  // 3) Fetch the user to get companyName
  useEffect(() => {
    if (!userName) return;
    const userApiUrl = `${API_URL}/api/get-user-by-userName/${userName}`;
    axios
      .get(userApiUrl)
      .then((res) => {
        const user = res.data?.user;
        if (user?.companyName) {
          setCompanyName(user.companyName);
        }
      })
      .catch((err) => console.error('Error fetching user/company:', err));
  }, [userName]);

  // 4) Fetch logo based on adminType
  useEffect(() => {
    const fetchLogo = async () => {
      if (!adminType) {
        console.warn('AdminType is undefined or empty.');
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/api/logo/${adminType}`);
        if (response.data?.data?.length > 0) {
          // Sort logos by createdAt descending, take the latest
          const sortedLogos = response.data.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setLogoUrl(sortedLogos[0].logoUrl);
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
        toast.error('Failed to fetch logo. Please try again later.', {
          position: 'top-center',
        });
      }
    };
    fetchLogo();
  }, [adminType]);

  // 5) PDF download
  const downloadPDF = () => {
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Electrical_Report_${equipmentId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().from(reportRef.current).set(opt).save();
  };

  if (loading) return <p>Loading report…</p>;
  if (!report) return <p>No report available.</p>;

  const { technician, equipment, responses, createdAt } = report;

  // Helper: return text color for a given measurement cell
  const getMeasurementColor = (rowId, phaseKey) => {
    const val = parseFloat(responses[rowId]?.[phaseKey] ?? '');
    const actual = parseFloat(responses[rowId]?.actual ?? '');
    if (isNaN(val) || isNaN(actual)) return 'black';
    return val > actual ? 'red' : 'green';
  };

  // Helper: return a colored ✓ or ✕ based on remarkStatus
  const renderStatusSymbol = (rowId) => {
    const status = responses[rowId]?.remarkStatus;
    if (status === 'pass') {
      return <span style={{ color: 'green' }}>✓</span>;
    }
    if (status === 'fail') {
      return <span style={{ color: 'red' }}>✕</span>;
    }
    return '—';
  };

  // Helper: return CSS class for remarks cell (green text if pass, red if fail)
  const getRemarkTextColor = (rowId) => {
    const status = responses[rowId]?.remarkStatus;
    if (status === 'pass') return 'text-success';
    if (status === 'fail') return 'text-danger';
    return '';
  };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-secondary" onClick={() => navigate('/services')}>
          ← Back
        </button>
        <button className="btn btn-success" onClick={downloadPDF}>
          ⬇ Download PDF
        </button>
      </div>

      {/* ---------- PDF CONTENT WRAPPER ---------- */}
      <div
        ref={reportRef}
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          lineHeight: 1.2,
          color: '#000',
          background: '#fff',
          padding: 10,
          border: '1px solid #000',
        }}
      >
        {/* Header */}
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
          <div className="text-center flex-grow-1">
            <div style={{ fontSize: 14, fontWeight: 'bold' }}>
              <i>Genex</i> Utility Management Pvt Ltd
            </div>
            <div>
              No:04, Suraj Nilaya, Sahyadri Layout, Shettihalli, Jalahalli West,
              Bangalore - 560015
            </div>
            <div>Phone: +91-92436-02152</div>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            textAlign: 'center',
            margin: '10px 0',
            fontSize: '12px',
            fontWeight: 'bold',
            borderTop: '2px solid #000',
            borderBottom: '2px solid #000',
            padding: '4px 0',
          }}
        >
          Electrical Engineer Report
        </div>

        {/* Date */}
        <div style={{ marginBottom: 8 }}>
          <strong>Date:</strong> {new Date(createdAt).toLocaleDateString()}
        </div>

        {/* Equipment & Technician Info */}
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
              ["Service Engineer's Name", `${technician.name} — ${technician.designation}`],
              ['Company Name', companyName || '—'],
              ['Equipment Name', equipment.name],
              ['Model', equipment.model],
              ['Capacity in HP/KW', equipment.capacity],
              ['Rated Load in Amps', equipment.ratedLoad],
            ].map(([label, value]) => (
              <tr key={label}>
                <th
                  style={{
                    border: '1px solid #000',
                    padding: 4,
                    textAlign: 'left',
                    fontWeight: 'normal',
                  }}
                >
                  {label}
                </th>
                <td style={{ border: '1px solid #000', padding: 4 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ---------- Checklist Table ---------- */}
        <table
          style={{
            width: '100%',
            border: '1px solid #000',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Sl.no</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>ACTUAL</th>
              <th style={thStyle} colSpan={3}>
                MEASUREMENT
              </th>
              <th style={thStyle}>Process Status</th>
              <th style={thStyle}>Remarks</th>
            </tr>
            <tr>
              {/* Empty headers under Sl.no, Category, ACTUAL */}
              <th style={thStyle} colSpan={3}></th>
            
              <th style={thStyle}></th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {checklist.map((item) => {
              const resp = responses[item.id] || {};

              // Rows 1–3: double‐row format
              if (item.id <= 3) {
                // For row 1 (Voltage): label "RY"/"YB"/"BR" in the header of the second row
                // For row 2 (Current): map RY→R, YB→Y, BR→B
                // For row 3 (Power): just display computed values
                const subHeaders =
                  item.id === 1
                    ? phases.slice()
                    : item.id === 2
                    ? phases.map((p, i) => ['R', 'Y', 'B'][i])
                    : ['', '', ''];

                return (
                  <React.Fragment key={item.id}>
                    <tr>
                      <td rowSpan={2} style={tdCenter}>
                        {item.id}
                      </td>
                      <td rowSpan={2} style={td}>
                        {item.label}
                      </td>
                      <td rowSpan={2} style={tdCenter}>
                        {resp.actual ?? '—'}
                      </td>
                      {subHeaders.map((sh, i) => (
                        <td key={i} style={tdCenter}>
                          <b>{sh}</b>
                        </td>
                      ))}
                      <td rowSpan={2} style={tdCenter}>
                        {/* Row 1–3 has no Process Status */}
                        &mdash;
                      </td>
                      <td rowSpan={2} style={td}>
                        {resp.remark ?? '—'}
                      </td>
                    </tr>
                    <tr>
                      {phases.map((p) => {
                        // Decide which key to read: for row 2 use R/Y/B; else use RY/YB/BR
                        const phaseKey = item.id === 2 ? { RY: 'R', YB: 'Y', BR: 'B' }[p] : p;
                        const val = resp[phaseKey] ?? '—';
                        const color = getMeasurementColor(item.id, phaseKey);
                        return (
                          <td key={p} style={tdCenter}>
                            <span style={{ color }}>{val}</span>
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              }

              // Rows 4–8: single row, with “Process Status” and “Remarks”
              return (
                <tr key={item.id}>
                  <td style={tdCenter}>{item.id}</td>
                  <td style={td} colSpan={5}>
                    {item.label}
                  </td>
                  <td style={tdCenter}>{renderStatusSymbol(item.id)}</td>
                  <td style={{ ...td, ...{ color: getRemarkTextColor(item.id) ? undefined : 'black' } }}>
                    <span className={getRemarkTextColor(item.id)}>
                      {resp.remark ?? '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles for table cells
const thStyle = {
  border: '1px solid #000',
  padding: 4,
  background: '#eee',
  textAlign: 'center',
  fontSize: '12px',
};
const td = {
  border: '1px solid #000',
  padding: 4,
  fontSize: '12px',
};
const tdCenter = {
  ...td,
  textAlign: 'center',
};
