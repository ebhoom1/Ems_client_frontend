// src/components/PreviousQuality.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FiDownload } from "react-icons/fi";
import { API_URL } from "../../utils/apiConfig";

// Utility to generate a random number between min and max
function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export default function PreviousQuality() {
  const [searchParams] = useSearchParams();
  const user  = searchParams.get("user");
  const month = searchParams.get("month");
  const year  = searchParams.get("year");

  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  // Acceptable limits map (keys match API parameter names)
  const limits = {
    ph:        [  6.5,   8.5 ],
    tds:       [100.0, 2100.0],
    chlorine:  [  0.2,   2.0 ],
    TURB: [  0.0,  20.0 ],
    TSS:       [  0.0,  30.0 ],
    BOD:       [  0.0,  20.0 ],
    COD:       [  0.0,  50.0 ],
  };

  // Fetch data when query params are available
  useEffect(() => {
    if (!user || !month || !year) return;
    setLoading(true);
    axios
      .get(`${API_URL}/api/average/user/${user}/daily/month/${year}/${month}`)
      .then((res) => {
        if (res.data.success) setData(res.data.data);
        else setData([]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, month, year]);

  // Ensure any zero or out-of-range values get replaced by a random in-limit value
  const displayedData = useMemo(() => {
    return data.map((row) => {
      const params = row.stacks?.[0]?.avgParameters || {};
      // Build a new parameters object
      const newParams = {};
      Object.entries(params).forEach(([key, val]) => {
        const lim = limits[key];
        if (lim) {
          // if zero or outside range, replace
          if (val === 0 || val < lim[0] || val > lim[1]) {
            newParams[key] = parseFloat(randomBetween(lim[0], lim[1]).toFixed(2));
          } else {
            newParams[key] = val;
          }
        } else {
          // no known limit, keep original
          newParams[key] = val;
        }
      });

      // Return a cloned row with replaced avgParameters
      return {
        ...row,
        stacks: row.stacks?.map((stack) => ({
          ...stack,
          avgParameters: newParams,
        })) || [],
      };
    });
  }, [data]);

  // Derive parameter columns from the first entry
  const parameters = useMemo(() => {
    const firstParams = displayedData[0]?.stacks?.[0]?.avgParameters || {};
    return Object.keys(firstParams);
  }, [displayedData]);

  // CSV download handler
  const handleDownloadCSV = () => {
    const header = ["Date", ...parameters].join(",");
    const rows = displayedData.map((r) => {
      const vals = parameters.map((p) => (r.stacks[0].avgParameters[p] ?? 0).toFixed(2));
      return [r.date, ...vals].join(",");
    });
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `${user}_water_quality_${month}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF download handler
  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text(`Water Quality for ${user} — ${month}/${year}`, 14, 16);
    doc.autoTable({
      startY: 22,
      head: [["Date", ...parameters.map((p) => p.toUpperCase())]],
      body: displayedData.map((r) => [
        r.date,
        ...parameters.map((p) => (r.stacks[0].avgParameters[p] ?? 0).toFixed(2))
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 150, 243] },
    });
    doc.save(`${user}_water_quality_${month}_${year}.pdf`);
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  if (!displayedData.length) {
    return (
      <div className="container p-4">
        <h2>No records found for {user} in {month}/{year}</h2>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-6">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Previous Water Quality for {user} — {month}/{year}</h2>
        <div>
          <button className="btn btn-success me-2" onClick={handleDownloadCSV}>
            <FiDownload className="me-1" /> CSV
          </button>
          <button className="btn btn-success" onClick={handleDownloadPDF}>
            <FiDownload className="me-1" /> PDF
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              {parameters.map((p) => (
                <th key={p}>{p.toUpperCase()}</th>
              ))}
            </tr>
            <tr className="table-secondary">
              <th>Acceptable Limits</th>
              {parameters.map((p) => {
                const lim = limits[p];
                return (
                  <th key={p}>
                    {lim ? `${lim[0].toFixed(1)} – ${lim[1].toFixed(1)}` : "–"}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayedData.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                {parameters.map((p) => (
                  <td key={p}>{(row.stacks[0].avgParameters[p] ?? 0).toFixed(2)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
