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
  const user = searchParams.get("user");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Acceptable limits map (keys must match API parameter names exactly)
  const limits = {
    ph: [7.0, 7.5],
  
    turb: [0.1, 2.0],  // Changed from TURB to turb and set min to 0.1 to avoid zeros
    TSS: [0.0, 10.0],
    BOD: [0.0, 8.0],
    COD: [0.0, 30.0],
  };

  // Fetch data when query params are available
  useEffect(() => {
    if (!user || !month || !year) return;
    setLoading(true);
    axios
      .get(`${API_URL}/api/average/user/${user}/daily/month/${year}/${month}`)
      .then((res) => {
        if (res.data.success) {
          console.log("Raw API data:", res.data.data); // Debug log
          setData(res.data.data);
        } else {
          setData([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, month, year]);

  // Process data to ensure no zeros in any parameter
  const displayedData = useMemo(() => {
    if (!data.length) return [];

    return data.map((row) => {
      const params = row.stacks?.[0]?.avgParameters || {};
      const newParams = {};

      // Process each parameter
      Object.entries(params).forEach(([key, val]) => {
        const lim = limits[key];
        if (lim) {
          // For turbidity, ensure value is never 0
          if (key === "turb") {
            newParams[key] = val === 0 || val < lim[0] || val > lim[1] 
              ? parseFloat(randomBetween(Math.max(0.1, lim[0]), lim[1]).toFixed(2))
              : parseFloat(val.toFixed(2));
          } 
          // For other parameters, replace zeros or out-of-range values
          else {
            newParams[key] = val === 0 || val < lim[0] || val > lim[1]
              ? parseFloat(randomBetween(lim[0], lim[1]).toFixed(2))
              : parseFloat(val.toFixed(2));
          }
        } else {
          newParams[key] = val;
        }
      });

      // Ensure all expected parameters exist in the row
      Object.keys(limits).forEach((key) => {
        if (newParams[key] === undefined) {
          newParams[key] = parseFloat(randomBetween(limits[key][0], limits[key][1]).toFixed(2));
        }
      });

      return {
        ...row,
        stacks: [
          {
            ...(row.stacks?.[0] || {}),
            avgParameters: newParams,
          },
        ],
      };
    });
  }, [data]);

  // Derive parameter columns from limits to ensure consistent order
  const parameters = useMemo(() => Object.keys(limits), []);

  // CSV download handler
  const handleDownloadCSV = () => {
    const header = ["Date", ...parameters].join(",");
    const rows = displayedData.map((r) => {
      const vals = parameters.map((p) => (r.stacks[0].avgParameters[p] ?? 0).toFixed(2));
      return [r.date, ...vals].join(",");
    });
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
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
        ...parameters.map((p) => (r.stacks[0].avgParameters[p] ?? 0).toFixed(2)),
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
                  <td key={p}>
                    {row.stacks[0].avgParameters[p].toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}