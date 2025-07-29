// src/components/ElectricalReport.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
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

  // phases & checklist definitions
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

  // helper: build chart data
  const buildVoltageData = () => [
    {
      name: 'Voltage',
      RY: Number(report.responses[1]?.RY || 0),
      YB: Number(report.responses[1]?.YB || 0),
      BR: Number(report.responses[1]?.BR || 0),
    },
  ];
  const buildCurrentData = () => [
    {
      name: 'Current',
      R: Number(report.responses[2]?.R || 0),
      Y: Number(report.responses[2]?.Y || 0),
      B: Number(report.responses[2]?.B || 0),
    },
  ];

  // color helpers for measurements & remarks
  const getMeasurementColor = (rowId, phaseKey) => {
    const val = parseFloat(report.responses[rowId]?.[phaseKey] ?? '');
    const actual = parseFloat(report.responses[rowId]?.actual ?? '');
    if (isNaN(val) || isNaN(actual)) return 'black';
    return val > actual ? 'red' : 'green';
  };
  const renderStatusSymbol = (rowId) => {
    const status = report.responses[rowId]?.remarkStatus;
    if (status === 'pass') return <span style={{ color: 'green' }}>✓</span>;
    if (status === 'fail') return <span style={{ color: 'red' }}>✕</span>;
    return '—';
  };
  const getRemarkTextColor = (rowId) => {
    const status = report.responses[rowId]?.remarkStatus;
    if (status === 'pass') return 'text-success';
    if (status === 'fail') return 'text-danger';
    return '';
  };

  // 1) fetch report
  useEffect(() => {
    axios
      .get(`${API_URL}/api/get-electricalreport/${equipmentId}`)
      .then((r) => {
        if (r.data.success) setReport(r.data.report);
        else toast.error('Report not found');
      })
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false));
  }, [equipmentId]);

  // 2) fetch equipment → userName
  useEffect(() => {
    axios
      .get(`${API_URL}/api/equiment/${equipmentId}`)
      .then((r) => {
        const u = r.data.equipment?.userName;
        if (u) setUserName(u);
      })
      .catch(console.error);
  }, [equipmentId]);

  // 3) fetch user → companyName
  useEffect(() => {
    if (!userName) return;
    axios
      .get(`${API_URL}/api/get-user-by-userName/${userName}`)
      .then((r) => {
        const c = r.data.user?.companyName;
        if (c) setCompanyName(c);
      })
      .catch(console.error);
  }, [userName]);

  // 4) fetch logo
 /*  useEffect(() => {
    if (!adminType) return;
    axios
      .get(`${API_URL}/api/logo/${adminType}`)
      .then((r) => {
        const arr = r.data.data || [];
        if (arr.length) {
          arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLogoUrl(arr[0].logoUrl);
        }
      })
      .catch(console.error);
  }, [adminType]);
 */
  // 5) export PDF
  const downloadPDF = () => {
    html2pdf()
      .from(reportRef.current)
      .set({
        margin: [10, 10, 10, 10],
        filename: `Electrical_Report_${equipmentId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
      })
      .save();
  };

  if (loading) return <p>Loading report…</p>;
  if (!report) return <p>No report available.</p>;

  const { technician, equipment, createdAt } = report;

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between mb-3">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/services')}
        >
          ← Back
        </button>
        <button className="btn btn-success" onClick={downloadPDF}>
          ⬇ Download PDF
        </button>
      </div>

      <div
        ref={reportRef}
        style={{
          fontFamily: 'Century Gothic, sans-serif',
          fontSize: 12,
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
          <div
            className="text-center flex-grow-1"
            style={{ fontFamily: 'Century Gothic, sans-serif' }}
          >
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>
              <i
                style={{
                  fontFamily: '"Comic Sans MS", cursive',
                  fontSize: 24,
                }}
              >
                Genex
              </i>{' '}
              Utility Management Pvt Ltd
            </div>
            <div style={{ fontSize: 14 }}>
              No:04, Suraj Nilaya, Sahyadri Layout, Shettihalli, Jalahalli
              West, Bangalore - 560015
            </div>
            <div style={{ fontSize: 14 }}>Phone: +91-92436-02152</div>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            textAlign: 'center',
            margin: '10px 0',
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
          <strong>Date:</strong>{' '}
          {new Date(createdAt).toLocaleDateString()}
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
              [
                "Service Engineer's Name",
                `${technician.name} — ${technician.designation}`,
              ],
              ['Company Name', companyName || '—'],
              ['Equipment Name', equipment.name],
              ['Model', equipment.model],
              ['Capacity in HP/KW', equipment.capacity],
              ['Rated Load in Amps', equipment.ratedLoad],
            ].map(([label, val]) => (
              <tr key={label}>
                <th
                  style={{
                    border: '1px solid #000',
                    padding: 4,
                    textAlign: 'left',
                  }}
                >
                  {label}
                </th>
                <td style={{ border: '1px solid #000', padding: 4 }}>
                  {val}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Charts Row */}
      

        {/* Checklist Table */}
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
              <th style={thStyle} colSpan={3}></th>
              <th style={thStyle}></th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {checklist.map((item) => {
              const resp = report.responses[item.id] || {};
              // rows 1–3: two lines
              if (item.id <= 3) {
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
                        &mdash;
                      </td>
                      <td rowSpan={2} style={td}>
                        {resp.remark ?? '—'}
                      </td>
                    </tr>
                    <tr>
                      {phases.map((p) => {
                        const key =
                          item.id === 2
                            ? { RY: 'R', YB: 'Y', BR: 'B' }[p]
                            : p;
                        const val = resp[key] ?? '—';
                        const color = getMeasurementColor(item.id, key);
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
              // rows 4–8: single line
              return (
                <tr key={item.id}>
                  <td style={tdCenter}>{item.id}</td>
                  <td style={td} colSpan={5}>
                    {item.label}
                  </td>
                  <td style={tdCenter}>{renderStatusSymbol(item.id)}</td>
                  <td style={td}>
                    <span className={getRemarkTextColor(item.id)}>
                      {resp.remark ?? '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

          <div style={{ display: 'flex', gap: '4%', marginBottom: 16 }}>
          <div style={{ width: '48%', height: 180 }}>
            <h6 style={{ textAlign: 'center', marginBottom: 4 }}>
              Voltage (V)
            </h6>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildVoltageData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={24} />
                <Bar dataKey="RY" name="RY" fill="#1f77b4" />
                <Bar dataKey="YB" name="YB" fill="#d62728" />
                <Bar dataKey="BR" name="BR" fill="#2ca02c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: '48%', height: 180 }}>
            <h6 style={{ textAlign: 'center', marginBottom: 4 }}>
              Current (A)
            </h6>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildCurrentData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={24} />
                <Bar dataKey="R" name="R" fill="#d62728" />
                <Bar dataKey="Y" name="Y" fill="#ffbf00" />
                <Bar dataKey="B" name="B" fill="#1f77b4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const thStyle = {
  border: '1px solid #000',
  padding: 4,
  background: '#eee',
  textAlign: 'center',
  fontSize: 12,
};
const td = {
  border: '1px solid #000',
  padding: 4,
  fontSize: 12,
};
const tdCenter = {
  ...td,
  textAlign: 'center',
};




/*    <table
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
              <th style={thStyle} colSpan={3}></th>
              {phases.map((p) => (
                <th key={p} style={thStyle}>
                  {p}
                </th>
              ))}
              <th style={thStyle} colSpan={2}></th>
            </tr>
          </thead>
          <tbody>
            {checklist.map((item) => {
              const resp = responses[item.id] || {};

              // First three items are double‐row
              if (item.id <= 3) {
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
                      {phases.map((p) => (
                        <td key={p} style={tdCenter}>
                          {p}
                        </td>
                      ))}
                      <td rowSpan={2} style={tdCenter}>
                        —
                      </td>
                      <td rowSpan={2} style={td}>
                        {resp.remark ?? '—'}
                      </td>
                    </tr>
                    <tr>
                      {phases.map((p) => (
                        <td key={p} style={tdCenter}>
                          <span
                            style={{
                              color: getMeasurementColor(item.id, p),
                            }}
                          >
                            {resp[p] ?? '—'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                );
              }

              // Remaining single‐row items
              return (
                <tr key={item.id}>
                  <td style={tdCenter}>{item.id}</td>
                  <td style={td} colSpan={5}>
                    {item.label}
                  </td>
                  <td style={tdCenter}>{renderStatusSymbol(item.id)}</td>
                  <td style={td}>
                    <span className={remarkColorClass(item.id)}>
                      {resp.remark ?? '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table> */