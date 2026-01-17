import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { API_URL } from "../../utils/apiConfig";
import genexlogo from "../../assests/images/logonewgenex.png";

const THEME = "#236a80";

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

const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const formatDate = (d, m, y) =>
  `${String(d).padStart(2, "0")}/${String(m + 1).padStart(2, "0")}/${y}`;

const PowerConsumption = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((s) => s.userLog);
  const selectedUserId = useSelector((s) => s.selectedUser.userId);
  const isOperator = useSelector(
    (s) => s.user?.userData?.validUserOne?.userType === "operator"
  );

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [rows, setRows] = useState([]);

  /* ---------- USERS ---------- */
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const targetUser = useMemo(() => {
    const u = users.find((x) => x.userName === selectedUserId);
    return u
      ? { userId: u._id, userName: u.userName, siteName: u.companyName }
      : null;
  }, [users, selectedUserId]);

  /* ---------- INIT MONTH ---------- */
  useEffect(() => {
    const days = getDaysInMonth(year, month);
    const init = [];
    for (let i = 1; i <= days; i++) {
      init.push({
        date: formatDate(i, month, year),
        initialReading: "",
        finalReading: "",
        consumption: "",
        unit: "",
      });
    }
    setRows(init);
  }, [year, month]);

  /* ---------- GET ---------- */
  useEffect(() => {
    if (!targetUser) return;

    const fetchReport = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/power-consumption/${targetUser.userName}/${year}/${
            month + 1
          }`
        );
        if (res.data.readings?.length) {
          setRows(res.data.readings);
        }
      } catch {
        // no report yet
      }
    };

    fetchReport();
  }, [targetUser, year, month]);

  /* ---------- CHANGE ---------- */
  const handleChange = (rowIndex, field, value) => {
    const updated = [...rows];
    updated[rowIndex][field] = value;

    const ini = Number(updated[rowIndex].initialReading);
    const fin = Number(updated[rowIndex].finalReading);

    if (!isNaN(ini) && !isNaN(fin)) {
      const consumption = +(fin - ini).toFixed(2);
      updated[rowIndex].consumption = consumption;
      updated[rowIndex].unit = +(consumption * 30).toFixed(2);

      // 🔁 Auto carry forward
      if (updated[rowIndex + 1]) {
        updated[rowIndex + 1].initialReading = fin;
      }
    }

    setRows(updated);
  };

  /* ---------- ENTER KEY (VERTICAL) ---------- */
  const handleKeyDown = (e, rowIndex, colIndex) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = document.querySelector(
        `[data-row="${rowIndex + 1}"][data-col="${colIndex}"]`
      );
      if (next) next.focus();
    }
  };

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!targetUser) {
      Swal.fire("Select Site", "Please select a site", "warning");
      return;
    }

    Swal.fire({ title: "Saving...", showConfirmButton: false });
    Swal.showLoading();

    await axios.post(`${API_URL}/api/power-consumption`, {
      userId: targetUser.userId,
      userName: targetUser.userName,
      siteName: targetUser.siteName,
      year,
      month: month + 1,
      readings: rows,
    });

    Swal.close();
    Swal.fire({
      icon: "success",
      title: "Saved",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const downloadPDF = () => {
    if (!targetUser) {
      Swal.fire("Select Site", "Please select a site", "warning");
      return;
    }

    const doc = new jsPDF();

    /* ---------- HEADER ---------- */
    doc.setFillColor(THEME);
    doc.rect(0, 0, 210, 28, "F");

    // ✅ GENEX LOGO (LEFT)
    doc.addImage(genexlogo, "PNG", 12, 4, 18, 18);

    // TITLE
    doc.setTextColor("#fff");
    doc.setFontSize(14);
    doc.text("STP POWER METER READING", 105, 12, { align: "center" });

    // SITE + MONTH
    doc.setFontSize(10);
    doc.text(
      `SITE: ${targetUser.siteName} | MONTH: ${monthNames[month]} ${year}`,
      105,
      20,
      { align: "center" }
    );

    /* ---------- TABLE ---------- */
    doc.setTextColor("#000");

    const tableBody = rows.map((r) => [
      r.date,
      r.initialReading,
      r.finalReading,
      r.consumption,
      r.unit,
    ]);

       doc.autoTable({
      startY: 35,
      head: [
        [
          "DATE",
          "INITIAL READING",
          "FINAL READING",
          "CONSUMPTION / DAY",
          "UNIT (kW)",
        ],
      ],
      body: tableBody,

      // ✅ TOTAL FOOTER ROW
      foot: [
        ["TOTAL", "", "", String(totals.totalConsumption), String(totals.totalUnit)],
      ],

      styles: { fontSize: 9, halign: "center" },
      headStyles: {
        fillColor: [35, 106, 128],
        textColor: 255,
        halign: "center",
      },

      // ✅ (optional but nice) style for total row
      footStyles: {
        fillColor: [255, 243, 205], // light yellow
        textColor: 0,
        fontStyle: "bold",
        halign: "center",
      },

      margin: { left: 14, right: 14 },
    });


    /* ---------- FOOTER ---------- */
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 290);

    /* ---------- SAVE ---------- */
    doc.save(
      `STP_Power_Consumption_${targetUser.siteName}_${monthNames[month]}_${year}.pdf`
    );
  };


    /* ---------- TOTALS ---------- */
  const totals = useMemo(() => {
    let totalConsumption = 0;
    let totalUnit = 0;

    for (const r of rows) {
      const c = parseFloat(r.consumption);
      const u = parseFloat(r.unit);

      if (!isNaN(c)) totalConsumption += c;
      if (!isNaN(u)) totalUnit += u;
    }

    return {
      totalConsumption: +totalConsumption.toFixed(2),
      totalUnit: +totalUnit.toFixed(2),
    };
  }, [rows]);

  return (
    <div className="d-flex">
      { <DashboardSam />}

      <div
        style={{
          marginLeft:260,
          width: "100%",
          paddingTop: 80,
        }}
      >
       
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 340,
              width: "calc(100% - 340px)",
              zIndex: 1000,
            }}
          >
            <Header />
          </div>
      

        <div className="container-fluid px-5 mt-4">
          {/* ===== HEADER (AS REQUESTED) ===== */}
          <div
            style={{
              background: THEME,
              color: "#fff",
              padding: "22px",
              borderRadius: "14px",
              marginBottom: 16,
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 style={{ margin: 0, fontWeight: 800 }}>
                  STP POWER METER READING
                </h3>
                <div>
                  <b>SITE:</b> {targetUser?.siteName} | <b>MONTH:</b>{" "}
                  {monthNames[month]} {year}
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

          {/* ===== TABLE ===== */}
          <table className="table table-bordered text-center">
            <thead style={{ background: "#ffd6d6" }}>
              <tr>
                <th>DATE</th>
                <th>INITIAL READING</th>
                <th>FINAL READING</th>
                <th>CONSUMPTION / DAY</th>
                <th>Unit (kW)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>

                  {["initialReading", "finalReading"].map((f, c) => (
                    <td key={f}>
                      <input
                        className="form-control"
                        value={r[f]}
                        data-row={i}
                        data-col={c}
                        onKeyDown={(e) => handleKeyDown(e, i, c)}
                        onChange={(e) => handleChange(i, f, e.target.value)}
                      />
                    </td>
                  ))}

                  <td>
                    <input
                      className="form-control"
                      value={r.consumption}
                      readOnly
                    />
                  </td>
                  <td>
                    <input className="form-control" value={r.unit} readOnly />
                  </td>
                </tr>
              ))}
            </tbody>
                        <tfoot>
              <tr style={{ background: "#fff3cd", fontWeight: 800 }}>
                <td>TOTAL</td>
                <td></td>
                <td></td>
                <td>
                  <input
                    className="form-control"
                    value={totals.totalConsumption}
                    readOnly
                  />
                </td>
                <td>
                  <input
                    className="form-control"
                    value={totals.totalUnit}
                    readOnly
                  />
                </td>
              </tr>
            </tfoot>

          </table>

          <div className="text-center mb-5">
            <button
              className="btn text-white me-3"
              style={{ background: THEME }}
              onClick={handleSave}
            >
              💾 Save Report
            </button>

            <button
              className="btn text-white"
              style={{ background: THEME }}
              onClick={downloadPDF}
            >
              📥 Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerConsumption;
