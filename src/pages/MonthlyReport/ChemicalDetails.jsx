import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import genexlogo from "../../assests/images/logonewgenex.png";
import { API_URL } from "../../utils/apiConfig";

const THEME = "#236a80";

/* ---------- helpers ---------- */
const getDaysInMonth = (year, month) => {
  const d = new Date(year, month, 1);
  const out = [];
  while (d.getMonth() === month) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
};

const formatFullDate = (dateObj) => {
  const d = String(dateObj.getDate()).padStart(2, "0");
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const y = dateObj.getFullYear();
  return `${d}/${m}/${y}`;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ChemicalDetails = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((s) => s.user);
  const selectedUserId = useSelector((s) => s.selectedUser.userId);
  const { users } = useSelector((s) => s.userLog);

  const currentUser = userData?.validUserOne;
  const isOperator = currentUser?.userType === "operator";
  const isAdmin =
    ["admin", "super_admin"].includes(currentUser?.userType) ||
    currentUser?.adminType === "EBHOOM";

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [chemicalName, setChemicalName] = useState("");
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);

  /* ---------- users ---------- */
  useEffect(() => {
    if (isAdmin || isOperator) dispatch(fetchUsers());
  }, [dispatch, isAdmin, isOperator]);

  const targetUser = useMemo(() => {
    if (!selectedUserId) return null;
    const u = users.find((x) => x.userName === selectedUserId);
    if (!u) return null;
    return {
      userId: u._id,
      userName: u.userName,
      siteName: u.companyName || "Selected Site",
    };
  }, [users, selectedUserId]);

  /* ---------- fetch saved report on month/year change ---------- */
  useEffect(() => {
    if (!targetUser || !year || month === null) return;

    const fetchReport = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/chemical-report/${targetUser.userName}/${year}/${
            month + 1
          }`
        );

        const report = res.data;

        // set chemical name
        setChemicalName(report.chemicalName || "");

        // rebuild rows from saved data
        const days = getDaysInMonth(year, month);

        const updatedRows = days.map((dateObj) => {
          const dateStr = formatFullDate(dateObj);

          const saved = report.readings.find((r) => r.date === dateStr);

          return {
            dateObj,
            received: saved?.received ?? "",
            opening: saved?.openingStock ?? "",
            consumption: saved?.consumption ?? "",
            closing: saved?.closedStock ?? "",
          };
        });

        setRows(updatedRows);
      } catch (err) {
        if (err.response?.status === 404) {
          // no report → reset month
          const days = getDaysInMonth(year, month);
          setRows(
            days.map((d) => ({
              dateObj: d,
              received: "",
              opening: "",
              consumption: "",
              closing: "",
            }))
          );
        } else {
          console.error("FETCH ERROR:", err);
          Swal.fire({
            icon: "error",
            title: "Load Failed",
            text: "Unable to load chemical report",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }
    };

    fetchReport();
  }, [targetUser, year, month]);

  /* ---------- init rows ---------- */
  useEffect(() => {
    const days = getDaysInMonth(year, month);
    setRows(
      days.map((d) => ({
        dateObj: d,
        received: "",
        opening: "",
        consumption: "",
        closing: "",
      }))
    );
  }, [year, month]);

  /* ---------- input change ---------- */
  const handleChange = (idx, field, value) => {
    const updated = [...rows];
    updated[idx][field] = value;

    const opening = parseFloat(updated[idx].opening) || 0;
    const received = parseFloat(updated[idx].received) || 0;
    const consumption = parseFloat(updated[idx].consumption) || 0;

    const closed = opening + received - consumption;
    updated[idx].closing = closed >= 0 ? closed.toFixed(2) : "0.00";

    if (updated[idx + 1]) {
      updated[idx + 1].opening = updated[idx].closing;
    }

    setRows(updated);
  };

  /* ---------- save ---------- */
  const handleSave = async () => {
    if (!chemicalName.trim()) {
      Swal.fire("Missing Chemical", "Please enter Chemical Name", "warning");
      return;
    }
    if (!targetUser) {
      Swal.fire("Site Not Selected", "Please select a site", "warning");
      return;
    }

    const payload = {
      userId: targetUser.userId,
      userName: targetUser.userName,
      siteName: targetUser.siteName,
      chemicalName,
      year,
      month: month + 1,
      readings: rows.map((r) => ({
        date: formatFullDate(r.dateObj),
        received: r.received || 0,
        openingStock: r.opening || 0,
        consumption: r.consumption || 0,
        closedStock: r.closing || 0,
      })),
    };

    try {
      setSaving(true);

      Swal.fire({
        title: "Saving Report",
        text: "Please wait...",
        timer: 1800, // ⏱ auto close in 1.8 sec
        showConfirmButton: false, // ❌ no OK button
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(`${API_URL}/api/chemical-report`, payload);
      console.log("CHEMICAL REPORT response:", res.message);

      Swal.fire(
        "Saved Successfully",
        "Chemical Consumption Report saved",
        "success"
      );
    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err.message);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: err.response?.data?.message || "Unable to save report",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- PDF ---------- */
  const downloadPDF = () => {
    if (!targetUser) return;

    const doc = new jsPDF();
    doc.setFillColor(THEME);
    doc.rect(0, 0, 210, 32, "F");
    doc.addImage(genexlogo, "PNG", 12, 6, 20, 20);
    doc.setTextColor("#fff");
    doc.setFontSize(14);
    doc.text("Chemical Consumption Report", 105, 16, { align: "center" });

    doc.setTextColor("#000");
    doc.setFontSize(11);
    doc.text(`Site: ${targetUser.siteName} (${targetUser.userName})`, 14, 42);
    doc.text(
      `Chemical: ${chemicalName} | ${monthNames[month]} ${year}`,
      14,
      50
    );

    doc.autoTable({
      startY: 58,
      head: [
        [
          "DATE",
          "RECEIVED",
          "OPENING STOCK IN KGS",
          "CONSUMPTION IN KGS / DAY",
          "CLOSED STOCK IN KGS",
        ],
      ],
      body: rows.map((r) => [
        formatFullDate(r.dateObj),
        r.received || "",
        r.opening || "",
        r.consumption || "",
        r.closing || "",
      ]),
      headStyles: { fillColor: THEME },
      styles: { fontSize: 8 },
    });

    doc.save(
      `${targetUser.siteName}_${chemicalName}_${monthNames[month]}_${year}.pdf`
    );
  };

  /* ---------- CSV ---------- */
  const downloadCSV = () => {
    let csv =
      "DATE,RECEIVED,OPENING STOCK IN KGS,CONSUMPTION IN KGS / DAY,CLOSED STOCK IN KGS\n";
    rows.forEach((r) => {
      csv += `${formatFullDate(r.dateObj)},${r.received || ""},${
        r.opening || ""
      },${r.consumption || ""},${r.closing || ""}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chemicalName}_${monthNames[month]}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- UI ---------- */
  return (
    <div className="d-flex">
      {!isOperator && <DashboardSam />}

      <div
        style={{
          marginLeft: !isOperator ? "260px" : 0,
          width: "100%",
          paddingTop: !isOperator ? "70px" : "0px",
        }}
      >
        {!isOperator && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: "320px", // 👈 same as sidebar width
              width: "calc(100% - 260px)", // 👈 key line
              zIndex: 1000,
            }}
          >
            <Header />
          </div>
        )}

        <div className="container-fluid px-5 mt-6">
          {/* HEADER */}
          <div
            style={{
              background: THEME,
              color: "#fff",
              padding: "24px",
              borderRadius: "14px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 style={{ margin: 0, fontWeight: 800 }}>
                  CHEMICAL CONSUMPTION DETAILS
                </h3>
                <div style={{ marginTop: 6 }}>
                  <b>SITE:</b> {targetUser?.siteName} ({targetUser?.userName}) |{" "}
                  <b>MONTH:</b> {monthNames[month]} {year}
                </div>
              </div>

              <div className="d-flex">
                <select
                  value={month}
                  onChange={(e) => setMonth(+e.target.value)}
                  className="form-select me-2"
                >
                  {monthNames.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(+e.target.value)}
                  className="form-control"
                  style={{ width: 120 }}
                />
              </div>
            </div>
          </div>

          {/* CHEMICAL NAME */}
          <div className="mt-3 mb-3">
            <input
              className="form-control"
              placeholder="Chemical Name"
              value={chemicalName}
              onChange={(e) => setChemicalName(e.target.value)}
            />
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead style={{ background: THEME, color: "#fff" }}>
                <tr>
                  <th>DATE</th>
                  <th>RECEIVED</th>
                  <th>OPENING STOCK IN KGS</th>
                  <th>CONSUMPTION IN KGS / DAY</th>
                  <th>CLOSED STOCK IN KGS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{formatFullDate(r.dateObj)}</td>
                    <td>
                      <input
                        className="form-control"
                        value={r.received}
                        onChange={(e) =>
                          handleChange(i, "received", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="form-control"
                        value={r.opening}
                        onChange={(e) =>
                          handleChange(i, "opening", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="form-control"
                        value={r.consumption}
                        onChange={(e) =>
                          handleChange(i, "consumption", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="form-control"
                        value={r.closing}
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ACTIONS */}
          <div className="text-center mb-5">
            <button className="btn btn-primary me-2" onClick={handleSave}>
              💾 Save Report
            </button>
            <button className="btn btn-danger me-2" onClick={downloadPDF}>
              📥 PDF
            </button>
            <button className="btn btn-success" onClick={downloadCSV}>
              📊 CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChemicalDetails;
