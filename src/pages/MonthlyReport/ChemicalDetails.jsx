// FILE: src/Components/Chemical/ChemicalDetails.jsx
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

/* ---------- helpers ---------- */
const getDaysInMonth = (year, monthIndex0) => {
  const d = new Date(year, monthIndex0, 1);
  const out = [];
  while (d.getMonth() === monthIndex0) {
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

const numOrZero = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const buildBlankRowsForMonth = (year, monthIndex0) => {
  const days = getDaysInMonth(year, monthIndex0);
  return days.map((d) => ({
    dateObj: d,
    initialQty: "",
    receivedQty: "",
    usedQty: "",
    finalQty: "",
  }));
};

const wrap = (text, max = 12) => {
  const s = String(text || "").trim();
  if (!s) return "";
  const words = s.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= max) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.join("\n"); // ✅ IMPORTANT
};

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
  const [month, setMonth] = useState(today.getMonth()); // 0-11

  // ✅ default: no chemicals
  const [chemicals, setChemicals] = useState([]);
  // ✅ single input to add chemicals
  const [newChemicalName, setNewChemicalName] = useState("");

  const [saving, setSaving] = useState(false);

  // ✅ stop whole-page horizontal scroll
  useEffect(() => {
    const prev = document.body.style.overflowX;
    document.body.style.overflowX = "hidden";
    return () => (document.body.style.overflowX = prev || "auto");
  }, []);

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

  /* ---------- when month/year changes, rebuild rows for all existing chemicals ---------- */
  useEffect(() => {
    setChemicals((prev) =>
      prev.map((c) => ({
        ...c,
        rows: buildBlankRowsForMonth(year, month),
      }))
    );
  }, [year, month]);

  /* ---------- fetch saved report ---------- */
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
        const days = getDaysInMonth(year, month);

        const loaded = (report.chemicals || []).map((chem) => {
          const rows = days.map((dateObj) => {
            const dateStr = formatFullDate(dateObj);
            const saved = (chem.readings || []).find((r) => r.date === dateStr);
            return {
              dateObj,
              initialQty: saved?.initialQty ?? "",
              receivedQty: saved?.receivedQty ?? "",
              usedQty: saved?.usedQty ?? "",
              finalQty: saved?.finalQty ?? "",
            };
          });

          return { chemicalName: chem.chemicalName || "", rows };
        });

        setChemicals(loaded);
      } catch (err) {
        if (err.response?.status === 404) {
          setChemicals([]);
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

  /* ---------- add chemical ---------- */
  const addChemical = () => {
    const name = String(newChemicalName || "").trim();
    if (!name) return;

    const exists = chemicals.some(
      (c) => c.chemicalName?.trim().toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      Swal.fire("Already Added", "This chemical is already added", "info");
      return;
    }

    setChemicals((prev) => [
      ...prev,
      { chemicalName: name, rows: buildBlankRowsForMonth(year, month) },
    ]);
    setNewChemicalName("");
  };

  const removeChemical = (chemIdx) => {
    setChemicals((prev) => prev.filter((_, i) => i !== chemIdx));
  };

  /* ---------- cell change ---------- */
  const handleChange = (chemIdx, rowIdx, field, value) => {
    setChemicals((prev) => {
      const copy = [...prev];
      const chem = { ...copy[chemIdx] };
      const rows = [...chem.rows];

      const cur = { ...rows[rowIdx], [field]: value };

      const initial = numOrZero(cur.initialQty);
      const received = numOrZero(cur.receivedQty);
      const used = numOrZero(cur.usedQty);

      const final = initial + received - used;
      cur.finalQty = final >= 0 ? final.toFixed(2) : "0.00";
      rows[rowIdx] = cur;

      // propagate next day initial
      if (rows[rowIdx + 1]) {
        const next = { ...rows[rowIdx + 1], initialQty: cur.finalQty };

        const nInitial = numOrZero(next.initialQty);
        const nReceived = numOrZero(next.receivedQty);
        const nUsed = numOrZero(next.usedQty);
        const nFinal = nInitial + nReceived - nUsed;

        next.finalQty = nFinal >= 0 ? nFinal.toFixed(2) : "0.00";
        rows[rowIdx + 1] = next;
      }

      chem.rows = rows;
      copy[chemIdx] = chem;
      return copy;
    });
  };

  /* ---------- save ---------- */
  const handleSave = async () => {
    if (!targetUser) {
      Swal.fire("Site Not Selected", "Please select a site", "warning");
      return;
    }

    if (chemicals.length === 0) {
      Swal.fire("No Chemicals", "Please add at least one chemical", "warning");
      return;
    }

    const payload = {
      userId: targetUser.userId,
      userName: targetUser.userName,
      siteName: targetUser.siteName,
      year,
      month: month + 1,
      chemicals: chemicals.map((c) => ({
        chemicalName: c.chemicalName,
        readings: c.rows.map((r) => ({
          date: formatFullDate(r.dateObj),
          initialQty: numOrZero(r.initialQty),
          receivedQty: numOrZero(r.receivedQty),
          usedQty: numOrZero(r.usedQty),
          finalQty: numOrZero(r.finalQty),
        })),
      })),
    };

    try {
      setSaving(true);

      Swal.fire({
        title: "Saving Report",
        text: "Please wait...",
        timer: 1800,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.post(`${API_URL}/api/chemical-report`, payload);

      Swal.fire(
        "Saved Successfully",
        "Monthly Chemical Stock saved",
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

  /* ---------- CSV (✅ with chemicals grouped like the UI table) ---------- */
  const downloadCSV = () => {
    if (!targetUser) return;
    if (chemicals.length === 0) {
      Swal.fire("No Chemicals", "Please add at least one chemical", "warning");
      return;
    }

    // header row 1: Date + chemical names repeated 4 cols
    const header1 = ["Date"];
    chemicals.forEach((c) => {
      header1.push(
        `${c.chemicalName} - Initial`,
        `${c.chemicalName} - Received`,
        `${c.chemicalName} - Used`,
        `${c.chemicalName} - Final`
      );
    });

    let csv = header1.join(",") + "\n";

    const days = getDaysInMonth(year, month);
    days.forEach((dateObj, dayIdx) => {
      const row = [formatFullDate(dateObj)];
      chemicals.forEach((c) => {
        const r = c.rows?.[dayIdx] || {};
        row.push(
          r.initialQty ?? "",
          r.receivedQty ?? "",
          r.usedQty ?? "",
          r.finalQty ?? ""
        );
      });
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetUser.siteName}_ChemicalStock_${monthNames[month]}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- PDF (✅ 2 CHEMICALS PER PAGE + ✅ chemical name inside table head + ✅ wrapped TH) ---------- */
  const downloadPDF = () => {
    if (!targetUser) return;

    if (chemicals.length === 0) {
      Swal.fire("No Chemicals", "Please add at least one chemical", "warning");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const drawTopHeader = () => {
      doc.setFillColor(THEME);
      doc.rect(0, 0, pageW, 30, "F");
      doc.addImage(genexlogo, "PNG", 10, 6, 18, 18);

      doc.setTextColor("#fff");
      doc.setFontSize(16);
      doc.text("Chemical Stock Report", pageW / 2, 18, { align: "center" });

      doc.setTextColor("#000");
      doc.setFontSize(12);
      doc.text(`Site: ${targetUser.siteName}`, 12, 42);
      doc.text(`Month: ${monthNames[month]} ${year}`, 12, 50);
    };

    // widths tuned for 2 chemicals per page (A4 portrait)
    const dateW = 25;
    const colW = 20;
for (let i = 0, pageIndex = 0; i < chemicals.length; i += 2, pageIndex++) {
  if (pageIndex > 0) doc.addPage();

  // ✅ Only first page has header + site + month
  if (pageIndex === 0) {
    drawTopHeader();
  }

  // ✅ Start table higher for pages without header
  const startY = pageIndex === 0 ? 58 : 12;

  const subset = chemicals.slice(i, i + 2);
  const daysCount = subset[0]?.rows?.length || 0;

  const headRow1 = [
    { content: "Date", rowSpan: 2, styles: { halign: "center", valign: "middle" } },
  ];
  subset.forEach((c) => {
    headRow1.push({
      content: c.chemicalName,
      colSpan: 4,
      styles: { halign: "center", valign: "middle" },
    });
  });

  const headRow2 = [];
  subset.forEach(() => {
    headRow2.push(
      { content: wrap("Initial Quantity in KG", 11), styles: { cellWidth: colW, overflow: "linebreak", halign: "center" } },
      { content: wrap("Received Quantity in KG", 11), styles: { cellWidth: colW, overflow: "linebreak", halign: "center" } },
      { content: wrap("Used in KG", 11), styles: { cellWidth: colW, overflow: "linebreak", halign: "center" } },
      { content: wrap("Final Quantity in KG", 11), styles: { cellWidth: colW, overflow: "linebreak", halign: "center" } }
    );
  });

  const body = Array.from({ length: daysCount }).map((_, dayIdx) => {
    const dateObj = subset[0].rows[dayIdx].dateObj;
    const row = [formatFullDate(dateObj)];
    subset.forEach((c) => {
      const r = c.rows?.[dayIdx] || {};
      row.push(r.initialQty ?? "", r.receivedQty ?? "", r.usedQty ?? "", r.finalQty ?? "");
    });
    return row;
  });

  doc.autoTable({
    startY,
    head: [headRow1, headRow2],
    body,
    theme: "grid",
    margin: { left: 10, right: 10 },
    styles: { fontSize: 8, cellPadding: 1.5, valign: "middle", overflow: "linebreak" },
    headStyles: { fillColor: THEME, textColor: 255, fontStyle: "bold", halign: "center" },
    columnStyles: {
      0: { cellWidth: dateW, halign: "left" },
      1: { cellWidth: colW }, 2: { cellWidth: colW }, 3: { cellWidth: colW }, 4: { cellWidth: colW },
      5: { cellWidth: colW }, 6: { cellWidth: colW }, 7: { cellWidth: colW }, 8: { cellWidth: colW },
    },
  });
}


    doc.save(
      `${targetUser.siteName}_ChemicalStock_${monthNames[month]}_${year}.pdf`
    );
  };

  /* ---------- UI ---------- */
  const dates = useMemo(() => getDaysInMonth(year, month), [year, month]);

  return (
    <div className="d-flex">
      { <DashboardSam />}

      <div
        style={{
          marginLeft:  "260px" ,
          width: "100%",
          paddingTop: "70px",
          overflowX: "hidden",
        }}
      >
       
          <div
            style={{
              position: "fixed",
              top: 0,
              left: "320px",
              width: "calc(100% - 260px)",
              zIndex: 1000,
            }}
          >
            <Header />
          </div>
        

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
                  CHEMICAL STOCK LIST
                </h3>
                <div style={{ marginTop: 6 }}>
                  <b>SITE:</b> {targetUser?.siteName || "-"} | <b>MONTH:</b>{" "}
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

          {/* ADD CHEMICAL */}
          <div className="mt-3 d-flex gap-2 align-items-center">
            <input
              className="form-control"
              placeholder="Type chemical name and press Add (eg: Sodium Hypo Chlorite)"
              value={newChemicalName}
              onChange={(e) => setNewChemicalName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addChemical();
              }}
            />
            <button className="btn btn-outline-primary" onClick={addChemical}>
              ➕ Add
            </button>

            <div style={{ marginLeft: "auto", fontSize: 13, color: "#444" }}>
              Total: <b>{chemicals.length}</b>
            </div>
          </div>

          {/* chips */}
          {chemicals.length > 0 && (
            <div className="mt-2 d-flex flex-wrap gap-2">
              {chemicals.map((c, idx) => (
                <span
                  key={idx}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <b>{c.chemicalName}</b>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeChemical(idx)}
                    title="Remove"
                    style={{ padding: "2px 8px" }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* TABLE SCROLL ONLY */}
          <div
            className="mt-3"
            style={{
              width: "100%",
              overflowX: "auto",
              overflowY: "hidden",
            }}
          >
            <div style={{ minWidth: "max-content" }}>
              <table
                className="table table-bordered"
                style={{ marginBottom: 0 }}
              >
                <thead>
                  <tr style={{ background: THEME, color: "#fff" }}>
                    <th
                      rowSpan={2}
                      style={{
                        minWidth: 120,
                        textAlign: "center",
                        verticalAlign: "middle",
                        position: "sticky",
                        left: 0,
                        background: THEME,
                        zIndex: 2,
                      }}
                    >
                      Date
                    </th>

                    {chemicals.map((c, idx) => (
                      <th
                        key={idx}
                        colSpan={4}
                        style={{ textAlign: "center", minWidth: 4 * 140 }}
                      >
                        {c.chemicalName}
                      </th>
                    ))}
                  </tr>

                  <tr style={{ background: THEME, color: "#fff" }}>
                    {chemicals.map((_, idx) => (
                      <React.Fragment key={idx}>
                        <th style={{ minWidth: 140 }}>
                          Initial Quantity in KG
                        </th>
                        <th style={{ minWidth: 140 }}>
                          Received Quantity in KG
                        </th>
                        <th style={{ minWidth: 140 }}>Used in KG</th>
                        <th style={{ minWidth: 140 }}>Final Quantity in KG</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {dates.map((dateObj, dayIdx) => (
                    <tr key={dayIdx}>
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          position: "sticky",
                          left: 0,
                          background: "#fff",
                          zIndex: 1,
                        }}
                      >
                        {formatFullDate(dateObj)}
                      </td>

                      {chemicals.map((chem, chemIdx) => {
                        const r = chem.rows[dayIdx] || {};
                        return (
                          <React.Fragment key={`${chemIdx}-${dayIdx}`}>
                            <td>
                              <input
                                className="form-control"
                                value={r.initialQty ?? ""}
                                onChange={(e) =>
                                  handleChange(
                                    chemIdx,
                                    dayIdx,
                                    "initialQty",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                className="form-control"
                                value={r.receivedQty ?? ""}
                                onChange={(e) =>
                                  handleChange(
                                    chemIdx,
                                    dayIdx,
                                    "receivedQty",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                className="form-control"
                                value={r.usedQty ?? ""}
                                onChange={(e) =>
                                  handleChange(
                                    chemIdx,
                                    dayIdx,
                                    "usedQty",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                className="form-control"
                                value={r.finalQty ?? ""}
                                readOnly
                              />
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {chemicals.length === 0 && (
                <div style={{ padding: 12, color: "#555" }}>
                  Add chemicals using the input above to start entering stock
                  values.
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="text-center mb-5 mt-4">
            <button
              className="btn btn-primary me-2"
              onClick={handleSave}
              disabled={saving}
            >
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
