import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FiDownload } from "react-icons/fi";
import { API_URL } from "../../utils/apiConfig";

export default function PreviousQuality() {
  const [searchParams] = useSearchParams();
  const user = searchParams.get("user");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const [data, setData] = useState([]);
  const [parameters, setParameters] = useState([]); // State to hold dynamic parameters
  const [loading, setLoading] = useState(true);

  // A master map of all possible parameters and their acceptable limits.
  // Keys are lowercase for consistent matching.
  const allLimits = {
    ph: [7.0, 7.5],
    turb: [0.1, 2.0],
    tss: [0.0, 10.0],
    bod: [0.0, 8.0],
    cod: [0.0, 30.0],
    temp: [25.0, 35.0], // Example for Temperature
  };

  useEffect(() => {
    if (!user || !month || !year) return;
    setLoading(true);
    axios
      .get(`${API_URL}/api/average/user/${user}/daily/month/${year}/${month}`)
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          // Process data to normalize parameter keys to lowercase
          const processedData = res.data.data.map(item => {
            const avgParams = item.stacks?.[0]?.avgParameters || {};
            const normalizedParams = Object.keys(avgParams).reduce((acc, key) => {
              acc[key.toLowerCase()] = avgParams[key];
              return acc;
            }, {});
            
            return {
              ...item,
              stacks: [{ ...(item.stacks?.[0] || {}), avgParameters: normalizedParams }]
            };
          });
          
          setData(processedData);

          // Dynamically determine the parameters from the first record
          const firstRecordParams = processedData[0]?.stacks?.[0]?.avgParameters || {};
          const availableParams = Object.keys(firstRecordParams);
          setParameters(availableParams); // Set the dynamic parameters for the table
          
        } else {
          setData([]);
          setParameters([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, month, year]);

  // CSV download handler
  const handleDownloadCSV = () => {
    const header = ["Date", ...parameters.map(p => p.toUpperCase())].join(",");
    const rows = data.map((r) => {
      const vals = parameters.map((p) => (r.stacks[0].avgParameters[p] ?? "N/A").toFixed(2));
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
      body: data.map((r) => [
        r.date,
        ...parameters.map((p) => (r.stacks[0].avgParameters[p] ?? "N/A").toFixed(2)),
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

  if (!data.length) {
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
                const lim = allLimits[p]; // Look up limits in the master list
                return (
                  <th key={p}>
                    {lim ? `${lim[0].toFixed(1)} – ${lim[1].toFixed(1)}` : "–"}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                {parameters.map((p) => (
                  <td key={p}>
                    {(row.stacks[0].avgParameters[p] ?? "N/A").toFixed(2)}
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