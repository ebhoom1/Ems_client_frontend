// src/components/PreviousQuantity.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { FiDownload } from "react-icons/fi";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { API_URL } from "../../utils/apiConfig";

export default function PreviousQuantity() {
  const [searchParams] = useSearchParams();
  const user  = searchParams.get("user");
  const month = searchParams.get("month");
  const year  = searchParams.get("year");

  const [flatData, setFlatData] = useState([]);
  const [loading, setLoading]   = useState(true);

  const [stackNames, setStackNames] = useState([]);
  const [rows, setRows]             = useState([]);

  // Fetch + filter
  useEffect(() => {
    if (!user || !month || !year) return;
    setLoading(true);

    axios
      .get(`${API_URL}/api/difference/month/${user}/${month}/${year}`)
      .then((res) => {
        let filtered = (res.data.data || [])
          .filter(d =>
            d.stationType === "effluent_flow" &&
            typeof d.cumulatingFlowDifference === "number"
          );
        if (user === "EGL1") {
          filtered = filtered.filter(
            d =>
              d.stackName !== "STP intlet" &&
              d.stackName !== "STP iutlet"
          );
        }
        setFlatData(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, month, year]);

  // Pivot
  useEffect(() => {
    if (!flatData.length) {
      setStackNames([]);
      setRows([]);
      return;
    }
    const uniqStacks = Array.from(new Set(flatData.map(d => d.stackName)))
      .sort((a, b) => a.localeCompare(b));
    setStackNames(uniqStacks);

    const uniqDates = Array.from(new Set(flatData.map(d => d.date)))
      .sort((a, b) =>
        moment(a, "DD/MM/YYYY").valueOf() -
        moment(b, "DD/MM/YYYY").valueOf()
      );

    const pivotRows = uniqDates.map(date => {
      const row = { date };
      uniqStacks.forEach(stack => {
        const entry = flatData.find(
          d => d.date === date && d.stackName === stack
        );
        row[stack] = entry ? entry.cumulatingFlowDifference : null;
      });
      return row;
    });
    setRows(pivotRows);
  }, [flatData]);

  // CSV download
  const handleDownloadCSV = () => {
    const header = ["Date", ...stackNames].join(",");
    const csvRows = rows.map(r =>
      [r.date, ...stackNames.map(s =>
        r[s] != null ? r[s].toFixed(2) : ""
      )].join(",")
    );
    const csv = [header, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${user}_flow_diff_${month}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF download
  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text(`Flow Differences for ${user} — ${month}/${year}`, 14, 16);
    doc.autoTable({
      startY: 22,
      head: [
        ["Date", ...stackNames]
      ],
      body: rows.map(r =>
        [r.date, ...stackNames.map(s =>
          r[s] != null ? r[s].toFixed(2) : ""
        )]
      ),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 150, 243] },
    });
    doc.save(`${user}_flow_diff_${month}_${year}.pdf`);
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0 py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-4">
        <h1 className="h4 m-0">
          {`Previous Quantity for ${user} — ${month}/${year}`}
        </h1>
        <div>
          <button
            onClick={handleDownloadCSV}
            disabled={!rows.length}
            className="btn btn-success me-2"
          >
            <FiDownload className="me-1" />
           Download CSV
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={!rows.length}
            className="btn btn-primary"
          >
            <FiDownload className="me-1" />
           Download PDF
          </button>
        </div>
      </div>

      {/* Full-width, responsive table */}
      {rows.length === 0 ? (
        <p className="px-4">No records found for that month.</p>
      ) : (
        <div className="table-responsive px-4">
          <table
            className="table table-bordered w-100"
            style={{ tableLayout: "fixed" }}
          >
            <thead className="table-light">
              <tr>
                <th>Date</th>
                {stackNames.map(stack => (
                  <th key={stack} className="text-truncate">
                    {stack}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "" : "table-active"}>
                  <td>{r.date}</td>
                  {stackNames.map(stack => (
                    <td key={stack}>
                      {r[stack] != null ? r[stack].toFixed(2) : "NA"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
