// src/components/PreviousQuality.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { FiDownload } from "react-icons/fi";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { API_URL } from "../../utils/apiConfig";

export default function PreviousQuality() {
  const [searchParams] = useSearchParams();
  const user  = searchParams.get("user");
  const month = searchParams.get("month");
  const year  = searchParams.get("year");

  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch on mount
  useEffect(() => {
    if (!user || !month || !year) return;
    setLoading(true);
    axios
      .get(
        `${API_URL}/api/average/user/${user}/daily/month/${year}/${month}`
      )
      .then((res) => {
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setData([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, month, year]);

  // derive columns from first entry
  const parameters = React.useMemo(() => {
    const first = data[0]?.stacks?.[0]?.avgParameters;
    return first ? Object.keys(first) : [];
  }, [data]);

  // CSV download
  const handleDownloadCSV = () => {
    const header = ["Date", ...parameters].join(",");
    const rows = data.map((r) => {
      const vals = parameters.map((p) =>
        r.stacks[0].avgParameters[p]?.toFixed(2)
      );
      return [r.date, ...vals].join(",");
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `${user}_water_quality_${month}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF download
  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text(
      `Water Quality for ${user} — ${month}/${year}`,
      14,
      16
    );
    doc.autoTable({
      startY: 22,
      head: [ ["Date", ...parameters.map((p) => p.toUpperCase())] ],
      body: data.map((r) => [
        r.date,
        ...parameters.map((p) =>
          r.stacks[0].avgParameters[p]?.toFixed(2) || ""
        )
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 150, 243] },
    });
    doc.save(
      `${user}_water_quality_${month}_${year}.pdf`
    );
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
        <h2>
          {`Previous Water Quality for ${user} — ${month}/${year}`}
        </h2>
        <div>
          <button
            className="btn btn-success me-2"
            onClick={handleDownloadCSV}
          >
            <FiDownload className="me-1" /> CSV
          </button>
          <button
            className="btn btn-success"
            onClick={handleDownloadPDF}
          >
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
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                {parameters.map((p) => (
                  <td key={p}>
                    {row.stacks[0].avgParameters[p]?.toFixed(2) ??
                      "NA"}
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
