// FILE: src/Components/MonthlyMaintenance/EquipmentStatusWeeklyReport.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import jsPDF from "jspdf";
import "jspdf-autotable";
import genexlogo from "../../assests/images/logonewgenex.png"; // optional (use your logo path)
import { API_URL } from "../../utils/apiConfig";

const MySwal = withReactContent(Swal);

const daysInMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0).getDate();

const weekBuckets = (year, monthIndex) => {
  const dim = daysInMonth(year, monthIndex);
  return [
    { week: 1, label: "1 - 7", start: 1, end: 7 },
    { week: 2, label: "8 - 14", start: 8, end: 14 },
    { week: 3, label: "15 - 21", start: 15, end: 21 },
    { week: 4, label: `22 - ${dim}`, start: 22, end: dim },
  ];
};

const EquipmentStatusWeeklyReport = () => {
  const dispatch = useDispatch();
  const DEBUG = true;

  const { userData } = useSelector((state) => state.user);
  const selectedUserId = useSelector((state) => state.selectedUser.userId);
  const { users: allUsers } = useSelector((state) => state.userLog);

  const currentUser = userData?.validUserOne;
  const isOperator = currentUser?.userType === "operator";
  const isAdmin =
    ["admin", "super_admin"].includes(currentUser?.userType) ||
    currentUser?.adminType === "EBHOOM";

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11
  const [week, setWeek] = useState(1);

  const [entries, setEntries] = useState([]);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAdmin || isOperator) dispatch(fetchUsers());
  }, [dispatch, isAdmin, isOperator]);

  const targetUser = useMemo(() => {
    if ((isAdmin || isOperator) && selectedUserId) {
      const found = allUsers.find((u) => u.userName === selectedUserId);
      if (found) {
        return {
          userName: found.userName,
          siteName: found.companyName || "Selected Site",
          userId: found._id,
        };
      }
      return {
        userName: selectedUserId,
        siteName: "Loading Site...",
        userId: null,
      };
    }
    return { userName: null, siteName: "N/A", userId: null };
  }, [isAdmin, isOperator, selectedUserId, allUsers]);

  // initialize blank rows (optional: start with 10 rows)
  const initBlank = () =>
    Array.from({ length: 10 }).map((_, i) => ({
      slNo: i + 1,
      equipmentName: "",
      capacity: "",
      make: "",
      status: "",
      comment: "",
    }));

  // fetch weekly report
  useEffect(() => {
    if (!targetUser.userId) return;

    const fetchWeekly = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/api/equipment-status-weekly/${targetUser.userId}/${year}/${month + 1}/${week}?prefill=1`,
        );

        if (DEBUG) {
          console.groupCollapsed(
            `🟦 Equipment Weekly GET ✅ ${year}-${month + 1} week-${week}`,
          );
          console.log("data:", data);
          console.groupEnd();
        }

        setEntries(data?.entries?.length ? data.entries : initBlank());
        setNote(data?.note || "");
      } catch (err) {
        if (err.response?.status === 404) {
          setEntries(initBlank());
          setNote("");
        } else {
          console.error("Weekly equipment fetch failed:", err);
          toast.error("Failed to fetch weekly equipment status report");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeekly();
  }, [targetUser.userId, year, month, week]);

  const handleChange = (idx, field, value) => {
    setEntries((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      // auto slNo fix
      if (field !== "slNo") copy[idx].slNo = idx + 1;
      return copy;
    });
  };

  const addRow = () => {
    setEntries((prev) => [
      ...prev,
      {
        slNo: prev.length + 1,
        equipmentName: "",
        capacity: "",
        make: "",
        status: "",
        comment: "",
      },
    ]);
  };

  const deleteRow = (idx) => {
    setEntries((prev) => {
      const copy = prev.filter((_, i) => i !== idx);
      return copy.map((r, i) => ({ ...r, slNo: i + 1 }));
    });
  };

  const handleSave = async () => {
    if (!targetUser.userId) return toast.error("Select a user/site first.");

    setSaving(true);

    MySwal.fire({
      title: "Saving Weekly Report...",
      html: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const payload = {
        userId: targetUser.userId,
        userName: targetUser.userName || "",
        siteName: targetUser.siteName || "",
        year,
        month: month + 1,
        week,
        note,
        entries,
      };

      const { data } = await axios.post(
        `${API_URL}/api/equipment-status-weekly`,
        payload,
      );

      setEntries(data?.entries?.length ? data.entries : initBlank());
      setNote(data?.note || "");

      MySwal.fire({
        icon: "success",
        title: "Weekly Report Saved",
        html: `<p><b>${targetUser.siteName}</b> (${targetUser.userName})</p><p>Week: ${week}</p>`,
        confirmButtonColor: "#236a80",
      });

      toast.success("Weekly equipment status saved");
    } catch (err) {
      console.error("Save weekly equipment failed:", err);
      MySwal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Something went wrong while saving. Please try again.",
        confirmButtonColor: "#d33",
      });
      toast.error("Failed to save weekly equipment status");
    } finally {
      setSaving(false);
    }
  };

  const handleClearNote = async () => {
    const ok = window.confirm("Clear note for this week?");
    if (!ok) return;

    setNote("");

    // Save immediately so it is cleared in DB
    try {
      const payload = {
        userId: targetUser.userId,
        userName: targetUser.userName || "",
        siteName: targetUser.siteName || "",
        year,
        month: month + 1,
        week,
        note: "", // ✅ cleared
        entries, // keep current entries
      };

      await axios.post(`${API_URL}/api/equipment-status-weekly`, payload);
      toast.success("Note cleared");
    } catch (err) {
      console.error("Clear note failed:", err);
      toast.error("Failed to clear note");
    }
  };

  const getWeekRangeLabel = (year, monthIndex, weekNum) => {
    const dim = new Date(year, monthIndex + 1, 0).getDate();
    const ranges = [
      { week: 1, start: 1, end: 7 },
      { week: 2, start: 8, end: 14 },
      { week: 3, start: 15, end: 21 },
      { week: 4, start: 22, end: dim },
    ];
    const r = ranges.find((x) => x.week === Number(weekNum)) || ranges[0];
    return `${String(r.start).padStart(2, "0")} - ${String(r.end).padStart(2, "0")}`;
  };

  const safeText = (v) => (v === null || v === undefined ? "" : String(v));

 const handleDownloadPDF = async () => {
  if (!targetUser.userId) {
    toast.error("Select a user/site first.");
    return;
  }

  const safeText = (v) => (v === null || v === undefined ? "" : String(v));

  const hasAnyRow = (entries || []).some((e) => {
    if (!e) return false;
    return (
      safeText(e.equipmentName).trim() ||
      safeText(e.capacity).trim() ||
      safeText(e.make).trim() ||
      safeText(e.status).trim() ||
      safeText(e.comment).trim()
    );
  });

  if (!hasAnyRow && !(note || "").trim()) {
    toast.info("No data to export in this week.");
    return;
  }

  const getWeekRangeLabel = (year, monthIndex, weekNum) => {
    const dim = new Date(year, monthIndex + 1, 0).getDate();
    const ranges = [
      { week: 1, start: 1, end: 7 },
      { week: 2, start: 8, end: 14 },
      { week: 3, start: 15, end: 21 },
      { week: 4, start: 22, end: dim },
    ];
    const r = ranges.find((x) => x.week === Number(weekNum)) || ranges[0];
    return `${String(r.start).padStart(2, "0")} - ${String(r.end).padStart(
      2,
      "0",
    )}`;
  };

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ---------- Header (Logo + Company) ----------
    const logoImg = new Image();
    logoImg.src = genexlogo;

    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve; // continue even if logo fails
    });

    doc.setFillColor(35, 106, 128); // #236a80
    doc.rect(0, 0, pageWidth, 32, "F");

    try {
      doc.addImage(logoImg, "PNG", 12, 5, 20, 20);
    } catch {}

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Genex Utility Management Pvt Ltd", pageWidth / 2, 12, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Equipment Status Report (Weekly)", pageWidth / 2, 27, {
      align: "center",
    });

    // ---------- Meta ----------
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    const weekRange = getWeekRangeLabel(year, month, week);

    doc.text(`Site: ${safeText(targetUser.siteName)}`, 12, 42);
    doc.text(`Month: ${monthNames[month]} ${year}`, 12, 49);
    doc.text(`Week: ${week} (${weekRange})`, 12, 56);

    // Start table after meta
    let startY = 63;

    // ---------- Table ----------
    const cleaned = (entries || [])
      .map((e, i) => ({
        slNo: i + 1,
        equipmentName: safeText(e?.equipmentName).trim(),
        capacity: safeText(e?.capacity).trim(),
        make: safeText(e?.make).trim(),
        status: safeText(e?.status).trim(),
        comment: safeText(e?.comment).trim(),
      }))
      .filter(
        (r) =>
          r.equipmentName || r.capacity || r.make || r.status || r.comment,
      );

    doc.autoTable({
      startY,
      head: [
        ["SL No", "Equipment Name", "Capacity", "Make", "Status", "Comment"],
      ],
      body: cleaned.length
        ? cleaned.map((r) => [
            r.slNo,
            r.equipmentName,
            r.capacity,
            r.make,
            r.status,
            r.comment,
          ])
        : [["", "", "", "", "", ""]],
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        valign: "top",
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [35, 106, 128],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 55 },
        2: { cellWidth: 22 },
        3: { cellWidth: 26 },
        4: { cellWidth: 18 },
        5: { cellWidth: pageWidth - (12 + 55 + 22 + 26 + 18) - 20 },
      },
      didDrawPage: () => {
        const pageCount = doc.internal.getNumberOfPages();
        const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(
          `Page ${pageCurrent} of ${pageCount}`,
          pageWidth - 12,
          pageHeight - 8,
          { align: "right" },
        );
      },
    });

    // ---------- NOTE BOX (below the table) ----------
    // ---------- NOTE BOX (yellow filled like screenshot) ----------
const noteText = safeText(note).trim();
if (noteText) {
  let y = (doc.lastAutoTable?.finalY || startY) + 10;

  const boxX = 12;
  const boxW = pageWidth - 24;
  const paddingX = 6;
  const paddingTop = 6;

  // Wrap note text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const wrapped = doc.splitTextToSize(noteText, boxW - paddingX * 2);

  // Heights
  const labelH = 6;          // "Note:" line
  const lineH = 6;           // each wrapped line height
  const boxH = paddingTop + labelH + wrapped.length * lineH + 6;

  // Page break if needed
  if (y + boxH > pageHeight - 15) {
    doc.addPage();
    y = 20;
  }

  // Yellow filled background (like screenshot)
  doc.setFillColor(255, 235, 140); // soft yellow
  doc.rect(boxX, y, boxW, boxH, "F");



  // "Note:" label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Note:", boxX + paddingX, y + paddingTop + 4);

  // Note content below label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(wrapped, boxX + paddingX, y + paddingTop + labelH + 4);
}

    const fileName = `${safeText(targetUser.siteName)}_${monthNames[month]}_${year}_Week-${week}_EquipmentStatus.pdf`;
    doc.save(fileName);

    toast.success("PDF downloaded!");
  } catch (err) {
    console.error("PDF export failed:", err);
    toast.error("Failed to generate PDF");
  }
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

  // styles (match your current pattern)
  const headerStyle = {
    background: "linear-gradient(135deg, #236a80 0%, #236a80 100%)",
    color: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginTop: "2rem",
  };

  const cardStyle = {
    border: "3px dotted #3498db",
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  };

  const inputStyle = {
    border: "2px dotted #3498db",
    borderRadius: "6px",
    padding: "8px",
    fontSize: "0.9rem",
    color: "#2c3e50",
  };

  const buttonStyle = {
    padding: "10px 22px",
    borderRadius: "8px",
    border: "2px dotted #236a80",
    backgroundColor: "#236a80",
    color: "white",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginRight: "10px",
  };

  return (
    <>
      <div className="d-flex">
        <div>
          <DashboardSam />
        </div>

        <div style={{ marginLeft: "260px", width: "100%", minHeight: "100vh" }}>
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 5,
              marginLeft: "100px",
            }}
          >
            <Header />
          </div>

          <div className="container-fluid py-4 px-4">
            <div className="row" style={{ marginTop: "0", padding: "0 68px" }}>
              <div className="col-12">
                {!targetUser.userName ? (
                  <div style={cardStyle}>
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#236a80",
                      }}
                    >
                      <h3>Please Select a User</h3>
                      <p>Use the dropdown in the header to select a user.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={headerStyle}>
                      <div className="d-flex flex-wrap justify-content-between align-items-center">
                        <div>
                          <h3
                            className="mb-2"
                            style={{ fontWeight: "bold", fontSize: "1.8rem" }}
                          >
                            EQUIPMENT STATUS (WEEKLY)
                          </h3>
                          <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
                            <strong>SITE:</strong>{" "}
                            {targetUser.siteName || "N/A"}
                            <span className="mx-3">|</span>
                            <strong>MONTH:</strong> {monthNames[month]} {year}
                            <span className="mx-3">|</span>
                            <strong>WEEK:</strong> {week}
                          </div>
                        </div>

                        <div
                          className="d-flex align-items-center mt-3 mt-md-0"
                          style={{ gap: 8 }}
                        >
                          <select
                            className="form-select"
                            value={week}
                            onChange={(e) => setWeek(Number(e.target.value))}
                            style={{
                              ...inputStyle,
                              backgroundColor: "white",
                              minWidth: "160px",
                            }}
                          >
                            {weekBuckets(year, month).map((w) => (
                              <option key={w.week} value={w.week}>
                                Week {w.week} ({w.label})
                              </option>
                            ))}
                          </select>

                          <select
                            className="form-select"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            style={{
                              ...inputStyle,
                              backgroundColor: "white",
                              minWidth: "140px",
                            }}
                          >
                            {monthNames.map((name, idx) => (
                              <option key={idx} value={idx}>
                                {name}
                              </option>
                            ))}
                          </select>

                          <input
                            type="number"
                            className="form-control"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            style={{
                              ...inputStyle,
                              width: "110px",
                              backgroundColor: "white",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      {loading && (
                        <div style={{ color: "#236a80", marginBottom: 10 }}>
                          Loading weekly data...
                        </div>
                      )}

                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead
                            style={{
                              background:
                                "linear-gradient(135deg, #236a80 0%, #3498db 100%)",
                              color: "white",
                            }}
                          >
                            <tr>
                              <th style={{ minWidth: 70 }}>SL NO</th>
                              <th style={{ minWidth: 200 }}>EQUIPMENT NAME</th>
                              <th style={{ minWidth: 120 }}>CAPACITY</th>
                              <th style={{ minWidth: 140 }}>MAKE</th>
                              <th style={{ minWidth: 120 }}>STATUS</th>
                              <th style={{ minWidth: 220 }}>COMMENT</th>
                              {(isAdmin || isOperator) && (
                                <th style={{ minWidth: 90 }}>ACTION</th>
                              )}
                            </tr>
                          </thead>

                          <tbody>
                            {entries.map((row, idx) => (
                              <tr key={idx}>
                                <td>{idx + 1}</td>

                                <td>
                                  <input
                                    value={row.equipmentName || ""}
                                    onChange={(e) =>
                                      handleChange(
                                        idx,
                                        "equipmentName",
                                        e.target.value,
                                      )
                                    }
                                    style={inputStyle}
                                    className="form-control"
                                  />
                                </td>

                                <td>
                                  <input
                                    value={row.capacity || ""}
                                    onChange={(e) =>
                                      handleChange(
                                        idx,
                                        "capacity",
                                        e.target.value,
                                      )
                                    }
                                    style={inputStyle}
                                    className="form-control"
                                  />
                                </td>

                                <td>
                                  <input
                                    value={row.make || ""}
                                    onChange={(e) =>
                                      handleChange(idx, "make", e.target.value)
                                    }
                                    style={inputStyle}
                                    className="form-control"
                                  />
                                </td>

                                <td>
                                  <input
                                    value={row.status || ""}
                                    onChange={(e) =>
                                      handleChange(
                                        idx,
                                        "status",
                                        e.target.value,
                                      )
                                    }
                                    style={inputStyle}
                                    className="form-control"
                                  />
                                </td>

                                <td>
                                  <input
                                    value={row.comment || ""}
                                    onChange={(e) =>
                                      handleChange(
                                        idx,
                                        "comment",
                                        e.target.value,
                                      )
                                    }
                                    style={inputStyle}
                                    className="form-control"
                                  />
                                </td>

                                {(isAdmin || isOperator) && (
                                  <td>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => deleteRow(idx)}
                                      disabled={saving || loading}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <label style={{ fontWeight: 700, color: "#236a80" }}>
                          Note
                        </label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="form-control"
                          style={{
                            ...inputStyle,
                            minHeight: 80,
                            resize: "vertical",
                            marginTop: 6,
                          }}
                          placeholder="Add weekly note..."
                        />
                      </div>

                      {(isAdmin || isOperator) && (
                        <div
                          className="mt-4 d-flex justify-content-center"
                          style={{ gap: 12, flexWrap: "wrap" }}
                        >
                          <button
                            style={buttonStyle}
                            onClick={addRow}
                            disabled={saving || loading}
                          >
                            ➕ Add Row
                          </button>

                          <button
                            style={{
                              ...buttonStyle,
                              backgroundColor: "#f39c12",
                              borderColor: "#f39c12",
                            }}
                            onClick={handleClearNote}
                            disabled={saving || loading}
                          >
                            🗑️ Clear Note
                          </button>

                          <button
                            style={{
                              ...buttonStyle,
                              backgroundColor: "#e74c3c",
                              borderColor: "#e74c3c",
                            }}
                            onClick={handleDownloadPDF}
                            disabled={loading || saving || !targetUser.userId}
                          >
                            📥 Download PDF
                          </button>

                          <button
                            style={buttonStyle}
                            onClick={handleSave}
                            disabled={saving || loading}
                          >
                            {saving ? "Saving..." : "💾 Save Week"}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EquipmentStatusWeeklyReport;
