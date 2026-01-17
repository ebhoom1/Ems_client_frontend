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
const THEMEPDF = "#802323ff";
const LOGO_URL = "/genex-logo.png";

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

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const fmtDate = (d, m, y) =>
  `${String(d).padStart(2, "0")}-${monthNames[m].slice(0, 3)}-${String(y).slice(
    -2
  )}`;

const emptyRow = (d, m, y) => ({
  date: fmtDate(d, m, y),

  greyInit: "",
  greyFinal: "",
  greyTotal: "",
  soilLine: "",
  equalization: "",
  totalGreySoil: "",

  inletInit: "",
  inletFinal: "",
  inletTotal: "",
  permeateInit: "",
  permeateFinal: "",
  permeateTotal: "",

  finalTank: "",

  cInit: "",
  cFinal: "",
  cTotal: "",
  mInit: "",
  mFinal: "",
  mTotal: "",
  gInit: "",
  gFinal: "",
  gTotal: "",

  gardenInit: "",
  gardenFinal: "",
  gardenTotal: "",
  treatedViaG: "",
});

const WaterBalanceReport = () => {
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
    const days = daysInMonth(year, month);
    const data = [];
    for (let i = 1; i <= days; i++) data.push(emptyRow(i, month, year));
    setRows(data);
  }, [year, month]);

  /* ---------- CALCULATIONS ---------- */
  const calc = (ini, fin) =>
    !isNaN(ini) && !isNaN(fin) ? +(fin - ini).toFixed(2) : "";

  const handleBlur = (r, field) => {
    if (!field.endsWith("Final")) return;
    if (!rows[r + 1]) return;

    const nextInit = field.replace("Final", "Init");

    setRows((prev) => {
      const copy = [...prev];

      if (copy[r + 1][nextInit] === "") {
        copy[r + 1][nextInit] = copy[r][field]; // FULL VALUE
      }

      return copy;
    });
  };

  const handleChange = (r, field, value) => {
    const updated = [...rows];

    // ALWAYS store raw input as STRING
    updated[r][field] = value;

    const toNum = (v) => {
      if (v === "" || v === null || v === undefined) return NaN;
      return Number(v);
    };

    const calc = (ini, fin) =>
      !isNaN(ini) && !isNaN(fin) ? (fin - ini).toFixed(2) : "";

    // ---- Calculations (read-only fields) ----
    updated[r].greyTotal = calc(
      toNum(updated[r].greyInit),
      toNum(updated[r].greyFinal)
    );

    updated[r].inletTotal = calc(
      toNum(updated[r].inletInit),
      toNum(updated[r].inletFinal)
    );

    updated[r].permeateTotal = calc(
      toNum(updated[r].permeateInit),
      toNum(updated[r].permeateFinal)
    );

    updated[r].cTotal = calc(toNum(updated[r].cInit), toNum(updated[r].cFinal));

    updated[r].mTotal = calc(toNum(updated[r].mInit), toNum(updated[r].mFinal));

    updated[r].gTotal = calc(toNum(updated[r].gInit), toNum(updated[r].gFinal));

    updated[r].gardenTotal = calc(
      toNum(updated[r].gardenInit),
      toNum(updated[r].gardenFinal)
    );

    // ---- Derived field ----
    const grey = toNum(updated[r].greyTotal);
    const soil = toNum(updated[r].soilLine);

    updated[r].totalGreySoil =
      !isNaN(grey) || !isNaN(soil)
        ? ((grey || 0) + (soil || 0)).toFixed(2)
        : "";

    setRows(updated);
  };

  /* ---------- ENTER KEY NAV ---------- */
  const onKeyDown = (e, r, c) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = document.querySelector(
        `[data-row="${r + 1}"][data-col="${c}"]`
      );
      if (next) next.focus();
    }
  };

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!targetUser) {
      Swal.fire("Select Site", "Please select site", "warning");
      return;
    }

    Swal.fire({ title: "Saving...", showConfirmButton: false });
    Swal.showLoading();

    const res = await axios.post(`${API_URL}/api/water-balance`, {
      userId: targetUser.userId,
      userName: targetUser.userName,
      siteName: targetUser.siteName,
      year,
      month: month + 1,
      readings: rows,
    });
    console.log("response:", res.data);

    Swal.close();
    Swal.fire({
      icon: "success",
      title: "Saved",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const loadImage = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
    });

  const handleDownloadPDF = async () => {
    if (!targetUser) {
      Swal.fire("Select Site", "Please select site", "warning");
      return;
    }

    const logoImg = await loadImage(genexlogo);

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    /* ================= HEADER (PAGE 1 ONLY) ================= */
    const drawHeader = () => {
      doc.setFillColor(38, 104, 118); // Genex teal
      doc.rect(0, 0, pageWidth, 28, "F");

      doc.addImage(logoImg, "PNG", 10, 6, 18, 16);

      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Genex Utility Management Pvt Ltd", pageWidth / 2, 12, {
        align: "center",
      });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Monthly Maintenance Activities Report", pageWidth / 2, 20, {
        align: "center",
      });

      doc.setTextColor(0);
    };

    /* ============ COLUMN GROUPS (SPLIT ACROSS PAGES) ============ */
    const columnGroups = [
      [
        "Date",
        "Grey Init",
        "Grey Final",
        "Grey Total",
        "Soil",
        "Equalization %",
        "Total Grey+Soil",
      ],
      [
        "Inlet Init",
        "Inlet Final",
        "Inlet Total",
        "Permeate Init",
        "Permeate Final",
        "Permeate Total",
        "Final Tank %",
      ],
      ["C Init", "C Final", "C Total", "M Init", "M Final", "M Total"],
      [
        "G Init",
        "G Final",
        "G Total",
        "Garden Init",
        "Garden Final",
        "Garden Total",
        "Treated via G",
      ],
    ];

    const valueMap = (r) => ({
      Date: r.date,

      "Grey Init": r.greyInit,
      "Grey Final": r.greyFinal,
      "Grey Total": r.greyTotal,
      Soil: r.soilLine,
      "Equalization %": r.equalization,
      "Total Grey+Soil": r.totalGreySoil,

      "Inlet Init": r.inletInit,
      "Inlet Final": r.inletFinal,
      "Inlet Total": r.inletTotal,
      "Permeate Init": r.permeateInit,
      "Permeate Final": r.permeateFinal,
      "Permeate Total": r.permeateTotal,
      "Final Tank %": r.finalTank,

      "C Init": r.cInit,
      "C Final": r.cFinal,
      "C Total": r.cTotal,
      "M Init": r.mInit,
      "M Final": r.mFinal,
      "M Total": r.mTotal,

      "G Init": r.gInit,
      "G Final": r.gFinal,
      "G Total": r.gTotal,
      "Garden Init": r.gardenInit,
      "Garden Final": r.gardenFinal,
      "Garden Total": r.gardenTotal,
      "Treated via G": r.treatedViaG,
    });

        const pdfTotalMap = {
      "Grey Total": totals.greyTotal,
      "Total Grey+Soil": totals.totalGreySoil,

      "Inlet Total": totals.inletTotal,
      "Permeate Total": totals.permeateTotal,

      "C Total": totals.cTotal,
      "M Total": totals.mTotal,

      "G Total": totals.gTotal,
      "Garden Total": totals.gardenTotal,
      "Treated via G": totals.treatedViaG,
    };

    /* ============ RENDER TABLES ============ */
    columnGroups.forEach((cols, index) => {
      if (index !== 0) doc.addPage();

      // Header ONLY on first page
      const startY = index === 0 ? 32 : 14;
      if (index === 0) drawHeader();

            doc.autoTable({
        startY,
        head: [cols],
        body: rows.map((r) => cols.map((c) => valueMap(r)[c])),
        theme: "grid",

        // ✅ FOOTER TOTAL ROW (per page/group)
        foot: [
          cols.map((c, idx) =>
            idx === 0 ? "TOTAL" : pdfTotalMap[c] ?? ""
          ),
        ],

        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: "visible",
          whiteSpace: "nowrap",
          halign: "center",
          valign: "middle",
        },

        headStyles: {
          fillColor: [38, 104, 118],
          textColor: 255,
          fontStyle: "bold",
          whiteSpace: "nowrap",
        },

        // ✅ make total row stand out
        footStyles: {
          fillColor: [255, 243, 205],
          textColor: 0,
          fontStyle: "bold",
          halign: "center",
        },

        columnStyles: cols.reduce((acc, _, i) => {
          acc[i] = { cellWidth: "auto", minCellWidth: 22 };
          return acc;
        }, {}),
      });

    });

    doc.save(
      `STP_Water_Balance_${targetUser.siteName}_${monthNames[month]}_${year}.pdf`
    );
  };

  useEffect(() => {
    if (!targetUser) return;

    const fetchReport = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/water-balance/${targetUser.userName}/${year}/${
            month + 1
          }`
        );
        console.log("fetched water balance:", res.data);
        if (res.data?.readings?.length) {
          setRows(res.data.readings);
        } else {
          // If no data → fresh month
          const days = daysInMonth(year, month);
          const data = [];
          for (let i = 1; i <= days; i++) {
            data.push(emptyRow(i, month, year));
          }
          setRows(data);
        }
      } catch (err) {
        console.error("Failed to load water balance", err);
      }
    };

    fetchReport();
  }, [targetUser, year, month]);

    /* ---------- TOTALS (ONLY TOTAL COLUMNS) ---------- */
  const totalKeys = [
    "greyTotal",
    "totalGreySoil",
    "inletTotal",
    "permeateTotal",
    "cTotal",
    "mTotal",
    "gTotal",
    "gardenTotal",
    "treatedViaG",
  ];

  const totals = useMemo(() => {
    const sum = {};
    totalKeys.forEach((k) => (sum[k] = 0));

    rows.forEach((r) => {
      totalKeys.forEach((k) => {
        const n = parseFloat(r?.[k]);
        if (!isNaN(n)) sum[k] += n;
      });
    });

    // keep as 2 decimals (string is fine for display)
    totalKeys.forEach((k) => (sum[k] = sum[k].toFixed(2)));

    return sum;
  }, [rows]);

    const fieldKeys = useMemo(() => {
    return rows[0] ? Object.keys(rows[0]).filter((k) => k !== "date") : [];
  }, [rows]);

  return (
    <div className="d-flex">
      { <DashboardSam />}

      <div
        style={{
          marginLeft:260,
          width: "100%",
          paddingTop: 80,
          overflowX: "hidden", // ✅ KEY LINE
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
        

        <div className="container-fluid px-2 mt-4">
          {/* ===== HEADER ===== */}
          <div
            style={{
              background: THEME,
              color: "#fff",
              padding: 22,
              borderRadius: 14,
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 style={{ margin: 0, fontWeight: 800 }}>
                  STP WATER BALANCE REPORT
                </h3>
                <div>
                  <b>SITE:</b> {targetUser?.siteName} | <b>MONTH:</b>{" "}
                  {monthNames[month]} {year}
                </div>
              </div>
              <div className="d-flex">
                <select
                  className="form-select me-2"
                  value={month}
                  onChange={(e) => setMonth(+e.target.value)}
                >
                  {monthNames.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="form-control"
                  value={year}
                  onChange={(e) => setYear(+e.target.value)}
                  style={{ width: 120 }}
                />
              </div>
            </div>
          </div>

          {/* ===== TABLE ===== */}
          <div
            className="mt-3"
            style={{
              overflowX: "auto",
              width: "100%",
              whiteSpace: "nowrap",
            }}
          >
            <table
              className="table table-bordered text-center"
              style={{ fontSize: 12 }}
            >
              {/* HEADER INSERTED HERE – EXACT SAME AS PREVIOUS MESSAGE */}
              <thead style={{ background: "#ffd6d6" }}>
                {/* -------- ROW 1 -------- */}
                <tr>
                  <th rowSpan={3}>DATE</th>

                  <th colSpan={3}>Grey water line</th>
                  <th rowSpan={3}>Soil Line</th>
                  <th rowSpan={3}>Equalization Tank Level (%)</th>
                  <th rowSpan={3}>Total Grey &amp; Soil Water</th>

                  <th colSpan={3}>Inlet Feed Meter</th>
                  <th colSpan={3}>Permeate Water Meter</th>

                  <th rowSpan={3}>Final Tank Level (%)</th>

                  <th colSpan={3}>C-Block Meter</th>
                  <th colSpan={3}>M-Block Meter</th>
                  <th colSpan={3}>G-Block Meter</th>

                  <th colSpan={3}>Garden Meter Reading</th>
                  <th rowSpan={3}>Treated Water via G-Block (KL)</th>
                </tr>

                {/* -------- ROW 2 -------- */}
                <tr>
                  <th colSpan={3}></th>
                  <th colSpan={3}></th>
                  <th colSpan={3}></th>
                  <th colSpan={3}></th>
                  <th colSpan={3}></th>
                  <th colSpan={3}></th>
                </tr>

                {/* -------- ROW 3 -------- */}
                <tr>
                  {/* Grey water */}
                  <th>Initial Reading</th>
                  <th>Final Reading</th>
                  <th>Total KL</th>

                  {/* Inlet */}
                  <th>Initial Reading</th>
                  <th>Final Reading</th>
                  <th>Total KL</th>

                  {/* Permeate */}
                  <th>Initial Reading</th>
                  <th>Final Reading</th>
                  <th>Total KL</th>

                  {/* C Block */}
                  <th>Initial Reading</th>
                  <th>Final Reading</th>
                  <th>Total KL</th>

                  {/* M Block */}
                  <th>Initial Reading</th>
                  <th>Final Reading</th>
                  <th>Total KL</th>

                  {/* G Block */}
                  <th>Initial Reading</th>
                  <th>Final Reading</th>
                  <th>Total KL</th>

                  {/* Garden */}
                  <th>Initial Reading</th>
                  <th>Final Reading</th>
                  <th>Total KL</th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.date}</td>
                   {fieldKeys.map((k, c) => (

                        <td key={`${i}-${k}`}>
                          <input
                            className="form-control"
                            type="text"
                            style={{ minWidth: 90 }} // 👈 prevents squeezing
                            value={r[k]}
                            data-row={i}
                            data-col={c}
                            onKeyDown={(e) => onKeyDown(e, i, c)}
                            onChange={(e) => handleChange(i, k, e.target.value)}
                            onBlur={() => handleBlur(i, k)}
                          />
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
                            <tfoot>
                <tr style={{ background: "#fff3cd", fontWeight: 800 }}>
                  <td>TOTAL</td>

                  {fieldKeys.map((k) => (
                    <td key={`total-${k}`}>
                      {totalKeys.includes(k) ? (
                        <input
                          className="form-control"
                          style={{ minWidth: 90 }}
                          value={totals[k]}
                          readOnly
                        />
                      ) : (
                        ""
                      )}
                    </td>
                  ))}
                </tr>
              </tfoot>

            </table>
          </div>

          <div className="text-center my-4 d-flex justify-content-center gap-3">
            <button
              className="btn text-white"
              style={{ background: THEME }}
              onClick={handleSave}
            >
              💾 Save Report
            </button>

            <button
              className="btn text-white"
              style={{ background: THEMEPDF }}
              onClick={handleDownloadPDF}
            >
              📄 Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterBalanceReport;
