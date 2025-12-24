import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import axios from "axios";
import Swal from "sweetalert2";
import "jspdf-autotable";
import jsPDF from "jspdf";
import "jspdf-autotable";
import genexlogo from "../../assests/images/logonewgenex.png";
import { API_URL } from "../../utils/apiConfig";

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

const CHEMICAL_KEYS = [
  "NaOCl",
  "PE",
  "PAC",
  "NaOH",
  "NaCl",
  "Biosol",
  "HCL_CITRIC",
];

const ChemicalConsumption = () => {
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
  const [loading, setLoading] = useState(false);

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
      const row = { date: formatDate(i, month, year) };
      CHEMICAL_KEYS.forEach((k) => (row[k] = ""));
      init.push(row);
    }

    setRows(init);
  }, [year, month]);

  /* ---------- GET REPORT ---------- */
  useEffect(() => {
    if (!targetUser) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_URL}/api/chemical-consumption/${targetUser.userName}/${year}/${
            month + 1
          }`
        );
        console.log("Fetched chemical consumption data:", res.data);
        if (res.data?.readings?.length) {
          setRows(res.data.readings);
        }
      } catch (err) {
        console.warn("No data for selected month");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetUser, year, month]);

  /* ---------- CHANGE ---------- */
  const handleChange = (i, field, val) => {
    const updated = [...rows];
    updated[i][field] = val;
    setRows(updated);
  };

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!targetUser) {
      Swal.fire("Select Site", "Please select site", "warning");
      return;
    }

    try {
      Swal.fire({
        title: "Saving Report",
        allowOutsideClick: false,
        showConfirmButton: false,
      });
      Swal.showLoading();

      await axios.post(`${API_URL}/api/chemical-consumption`, {
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
        title: "Saved Successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "Save failed", "error");
    }
  };

  const handleDownloadPDF = () => {
    if (!targetUser) {
      Swal.fire("Select Site", "Please select site", "warning");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    /* ===== HEADER ===== */
    doc.setFillColor(35, 106, 128); // THEME
    doc.rect(0, 0, 210, 30, "F");

    // ✅ GENEX LOGO (LEFT SIDE)
    doc.addImage(
      genexlogo,
      "PNG",
      12, // X position
      6, // Y position
      18, // WIDTH (increase to make bigger)
      18 // HEIGHT (increase to make bigger)
    );

    // ✅ TITLE
    doc.setTextColor("#fff");
    doc.setFontSize(14);
    doc.text("CHEMICAL CONSUMPTION REPORT", 105, 18, { align: "center" });

    // ✅ SUB HEADER
    doc.setFontSize(10);
    doc.text(`Site: ${targetUser.siteName} (${targetUser.userName})`, 14, 26);
    doc.text(`Month: ${monthNames[month]} ${year}`, 160, 26);

    /* ===== TABLE ===== */
    const head = [
      [
        { content: "SL.NO", rowSpan: 3 },
        { content: "DATE", rowSpan: 3 },
        {
          content: "Chemical Consumption",
          colSpan: 7,
          styles: { halign: "center" },
        },
      ],
      ["NaOCl", "PE", "PAC", "NaOH", "NaCl", "Biosol", "HCL / CITRIC"],
      ["Kg", "gm", "gm", "Kg", "Kg", "gm", "Kg"],
    ];

    const body = rows.map((r, i) => [
      i + 1,
      r.date,
      r.NaOCl || "",
      r.PE || "",
      r.PAC || "",
      r.NaOH || "",
      r.NaCl || "",
      r.Biosol || "",
      r.HCL_CITRIC || "",
    ]);

    doc.autoTable({
      startY: 36,
      head,
      body,
      theme: "grid",
      styles: { fontSize: 9, halign: "center" },
      headStyles: {
        fillColor: [35, 106, 128],
        textColor: 255,
        fontStyle: "bold",
      },
      margin: { left: 10, right: 10 },
    });

    /* ===== FOOTER ===== */
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 290);

    doc.save(
      `Chemical_Consumption_${targetUser.userName}_${monthNames[month]}_${year}.pdf`
    );
  };

  const handleEnterVertical = (e, rowIndex, colIndex) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const nextRow = rowIndex + 1;

    if (nextRow < rows.length) {
      const nextInput = document.querySelector(
        `[data-row="${nextRow}"][data-col="${colIndex}"]`
      );
      if (nextInput) nextInput.focus();
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="d-flex">
      {!isOperator && <DashboardSam />}

      <div
        style={{
          marginLeft: !isOperator ? 260 : 0,
          width: "100%",
          paddingTop: 80,
        }}
      >
        {!isOperator && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 330,
              width: "calc(100% - 330px)",
              zIndex: 1000,
            }}
          >
            <Header />
          </div>
        )}

        <div className="container-fluid px-5 mt-4">
          {/* ===== TOP HEADER BANNER ===== */}
          <div
            style={{
              background: THEME,
              color: "#fff",
              padding: "22px 26px",
              borderRadius: "16px",
              marginBottom: "20px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h2 style={{ margin: 0, fontWeight: 800 }}>
                  CHEMICAL CONSUMPTION
                </h2>
                <div style={{ marginTop: 6, fontSize: 14 }}>
                  <b>SITE:</b> {targetUser?.siteName || "-"} (
                  {targetUser?.userName || "-"}) | <b>MONTH:</b>{" "}
                  {monthNames[month]} {year}
                </div>
              </div>

              <div className="d-flex align-items-center mt-2 mt-md-0">
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="form-select me-2"
                  style={{ width: 160 }}
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
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="form-control"
                  style={{ width: 110 }}
                />
              </div>
            </div>
          </div>

          {/* ===== TABLE ===== */}
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th colSpan={9} style={{ fontSize: 18 }}>
                  Chemical Consumption For Month of {monthNames[month]} {year}
                </th>
              </tr>
              <tr>
                <th rowSpan={3}>SL.NO</th>
                <th rowSpan={3}>DATE</th>
                <th colSpan={7}>Chemical Consumption</th>
              </tr>
              <tr>
                <th>NaOCl</th>
                <th>PE</th>
                <th>PAC</th>
                <th>NaOH</th>
                <th>NaCl</th>
                <th>Biosol</th>
                <th>HCL / CITRIC</th>
              </tr>
              <tr>
                <th>Kg</th>
                <th>gm</th>
                <th>gm</th>
                <th>Kg</th>
                <th>Kg</th>
                <th>gm</th>
                <th>Kg</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.date}</td>
                  {CHEMICAL_KEYS.map((c, colIndex) => (
                    <td key={c}>
                      <input
                        className="form-control"
                        value={r[c]}
                        data-row={i}
                        data-col={colIndex}
                        onChange={(e) => handleChange(i, c, e.target.value)}
                        onKeyDown={(e) => handleEnterVertical(e, i, colIndex)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-center mb-5">
            <button
              className="btn  me-2"
              style={{
                backgroundColor: THEME,
                borderColor: THEME,
                color: "#fff",
              }}
              onClick={handleSave}
            >
              💾 Save Report
            </button>
            <button className="btn btn-danger" onClick={handleDownloadPDF}>
              📥 Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChemicalConsumption;
