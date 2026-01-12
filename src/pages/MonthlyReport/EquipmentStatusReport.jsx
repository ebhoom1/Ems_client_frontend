// FILE: src/Components/MonthlyMaintenance/EquipmentStatusReport.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import { toast } from "react-toastify";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import genexlogo from "../../assests/images/logonewgenex.png";

const MySwal = withReactContent(Swal);

// Load equipment list for userName
const fetchEquipmentList = async (userName) => {
  try {
    const res = await axios.get(`${API_URL}/api/user/${userName}`);
    console.log("response:", res.data);
    return res.data.equipment || [];
  } catch (err) {
    console.error("Error loading equipment list:", err);
    return [];
  }
};

const EquipmentStatusReport = () => {
  const dispatch = useDispatch();

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
  const [month, setMonth] = useState(today.getMonth()); // 0–11

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(true);

  // --- Load users ---
  useEffect(() => {
    if (isAdmin || isOperator) {
      dispatch(fetchUsers());
    }
  }, [dispatch, isAdmin, isOperator]);

  // Resolve selected user
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
  }, [isOperator, isAdmin, selectedUserId, allUsers]);

  // 🔥 Load equipment dynamically and load saved report if exists
  useEffect(() => {
    const load = async () => {
      if (!targetUser.userName || !targetUser.userId) return;

      setLoading(true);
      try {
        // Load equipment list for this site
        const equipments = await fetchEquipmentList(targetUser.userName);

        // Convert DB equipment → table rows (MAKE EMPTY)
        const baseRows = equipments.map((eq, idx) => ({
          slNo: idx + 1,
          equipmentName: eq.equipmentName || "",
          capacity: eq.capacity || "",
          make: "",
          status: "WORKING",
          comment: "",
        }));

        // Try loading existing saved report
        const { data } = await axios.get(
          `${API_URL}/api/equipment-status/${targetUser.userId}/${year}/${
            month + 1
          }`
        );

        if (data?.entries?.length > 0) {
          setRows(
            data.entries.map((e) => ({
              slNo: e.slNo,
              equipmentName: e.equipmentName,
              capacity: e.capacity || "",
              make: e.make || "",
              status: e.status || "WORKING",
              comment: e.comment || "",
            }))
          );
          const loadedNote = data.note || "";
          setNote(loadedNote);
          setShowNote(Boolean(loadedNote)); // if empty => hide note automatically
        } else {
          setRows(baseRows);
          setNote("");
          setShowNote(false);
        }
      } catch (err) {
        console.error("Error fetching report:", err);

        // fallback: load equipment list only
        const equipments = await fetchEquipmentList(targetUser.userName);
        setRows(
          equipments.map((eq, idx) => ({
            slNo: idx + 1,
            equipmentName: eq.equipmentName || "",
            capacity: eq.capacity || "",
            make: "",
            status: "WORKING",
            comment: "",
            notes: "",
          }))
        );
        setNote("");
        setShowNote(false);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [targetUser.userName, targetUser.userId, year, month]);

  // --- Field update handler ---
  const handleCellChange = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // const handleAddRow = () => {
  //   setRows((prev) => [
  //     ...prev,
  //     {
  //       slNo: prev.length + 1,
  //       equipmentName: "",
  //       capacity: "",
  //       make: "",
  //       status: "WORKING",
  //       comment: "",
  //       notes: "",
  //     },
  //   ]);
  // };

  const handleAddRow = () => {
    setRows((prev) => {
      const nextSl =
        prev.length > 0
          ? Math.max(...prev.map((r) => Number(r.slNo) || 0)) + 1
          : 1;

      return [
        ...prev,
        {
          slNo: nextSl,
          equipmentName: "",
          capacity: "",
          make: "",
          status: "WORKING",
          comment: "",
          notes: "",
        },
      ];
    });
  };

  const handleDeleteRow = (indexToDelete) => {
    const ok = window.confirm("Delete this row?");
    if (!ok) return;

    setRows((prev) => prev.filter((_, idx) => idx !== indexToDelete));
  };

  // Build rows for saving
  const buildExportRows = () =>
    rows.map((r, idx) => ({
      slNo: r.slNo || idx + 1,
      equipmentName: r.equipmentName || "",
      capacity: r.capacity || "",
      make: r.make || "",
      status: r.status || "",
      comment: r.comment || "",
    }));

  // --- Save Report ---
  const handleSaveReport = async () => {
    if (!targetUser.userId) {
      toast.error("Cannot save. Select a site first.");
      return;
    }

    const entriesToSave = buildExportRows();
    setSaving(true);

    MySwal.fire({
      title: "Saving Report...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await axios.post(`${API_URL}/api/equipment-status`, {
        userId: targetUser.userId,
        userName: targetUser.userName,
        siteName: targetUser.siteName,
        year,
        month: month + 1,
        entries: entriesToSave,
        note: showNote ? note : "",
      });

      MySwal.fire({
        icon: "success",
        title: "Saved Successfully",
        confirmButtonColor: "#236a80",
      });

      toast.success("Report saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save report");
      MySwal.fire({
        icon: "error",
        title: "Save Failed",
      });
    } finally {
      setSaving(false);
    }
  };

  // --- CSV ---
  const handleDownloadCSV = () => {
    if (!targetUser.userId) return toast.error("Select a site first.");
    const exportRows = buildExportRows();

    let csv = "SL.No,Asset List,Capacity,Make,Status,Comment\n";
    exportRows.forEach((r) => {
      csv += `${r.slNo},"${r.equipmentName}","${r.capacity}","${r.make}","${r.status}","${r.comment}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetUser.siteName}_${month + 1}-${year}_AssetList.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("CSV downloaded!");
  };

  // --- PDF ---
  const handleDownloadPDF = async () => {
    if (!targetUser.userId) return toast.error("Select a site first.");
    const exportRows = buildExportRows();

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      const logoImg = new Image();
      logoImg.src = genexlogo;
      await new Promise((res) => (logoImg.onload = res));

      doc.setFillColor("#236a80");
      doc.rect(0, 0, pageWidth, 35, "F");
      doc.addImage(logoImg, "PNG", 15, 5, 25, 25);

      doc.setTextColor("#fff");
      doc.setFontSize(14);
      doc.text("Asset List Report", pageWidth / 2 + 10, 15, {
        align: "center",
      });

      doc.setTextColor("#000");
      doc.setFontSize(10);
      doc.text(`Site: ${targetUser.siteName}`, 15, 45);
      doc.text(`Month: ${month + 1}/${year}`, 15, 52);

      doc.autoTable({
        startY: 58,
        head: [
          ["SL.No", "Asset List", "Capacity", "Make", "Status", "Comment"],
        ],
        body: exportRows.map((r) => [
          r.slNo,
          r.equipmentName,
          r.capacity,
          r.make,
          r.status,
          r.comment,
        ]),
        theme: "grid",
        headStyles: { fillColor: "#236a80", textColor: "#fff" },
        styles: { fontSize: 8 },

        // ✅ ADD THIS
        didParseCell: function (data) {
          // Status column index = 4 (0-based)
          if (data.section === "body" && data.column.index === 4) {
            const statusText = String(data.cell.raw || "").toLowerCase();
            if (statusText.includes("not")) {
              data.cell.styles.textColor = [255, 0, 0]; // red
              data.cell.styles.fontStyle = "bold"; // optional
            }
          }
        },
      });
      const finalY = doc.lastAutoTable.finalY || 58;

      if (showNote && String(note || "").trim()) {
        const pageHeight = doc.internal.pageSize.getHeight();

        const boxX = 15;
        const boxW = pageWidth - 30;
        const paddingX = 4;
        const paddingY = 4;

        // ✅ Preserve new lines from textarea + wrap long lines
        const rawNote = (note || "").toString();
        const maxTextWidth = boxW - paddingX * 2;

        let noteLines = ["Note:"];
        rawNote.split(/\r?\n/).forEach((line) => {
          if (line.trim() === "") {
            noteLines.push(""); // keep blank lines
          } else {
            noteLines.push(...doc.splitTextToSize(line, maxTextWidth));
          }
        });

        // ✅ Calculate required height for the yellow box
        doc.setFontSize(10);
        const textDims = doc.getTextDimensions(noteLines);
        const boxH = textDims.h + paddingY * 2;

        let boxY = finalY + 10;

        // ✅ If note doesn't fit remaining space, move it to next page
        if (boxY + boxH > pageHeight - 15) {
          doc.addPage();
          boxY = 20;
        }

        // ✅ Draw FULL yellow background for all lines
        doc.setFillColor(255, 230, 128);
        doc.rect(boxX, boxY, boxW, boxH, "F");

        // ✅ Print the note inside the box
        doc.setTextColor(0);
        doc.text(noteLines, boxX + paddingX, boxY + paddingY + 2);
      }

      doc.save(`${targetUser.siteName}_${month + 1}_${year}_AssetList.pdf`);

      toast.success("PDF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("PDF failed!");
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

  // Styling
  const CONTENT_WIDTH = "1100px";
  const inputStyle = {
    border: "2px dotted #3498db",
    borderRadius: "6px",
    padding: "6px",
    fontSize: "0.85rem",
    color: "#2c3e50",
  };

  const cardStyle = {
    border: "3px dotted #3498db",
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
  };
  const promptStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    textAlign: "center",
    color: "#236a80",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    border: "3px dotted #236a80",
  };

  return (
    <>
      <div className="d-flex">
        {!isOperator && (
          <div>
            <DashboardSam />
          </div>
        )}

        <div
          style={{
            marginLeft: !isOperator ? "260px" : "0",
            width: "100%",
            minHeight: "100vh",
          }}
        >
          {!isOperator && (
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
          )}

          <div className="container-fluid py-4 px-4">
            <div className="row" style={{ marginTop: "0", padding: "0" }}>
              <div className="col-12">
                {/* If no user selected */}
                {!targetUser.userName ? (
                  <div style={cardStyle}>
                    <div style={promptStyle}>
                      <i
                        className="fas fa-hand-pointer"
                        style={{
                          fontSize: "3rem",
                          marginBottom: "1.5rem",
                          color: "#236a80",
                        }}
                      ></i>
                      <h3 style={{ fontWeight: "600", color: "#236a80" }}>
                        Please Select a User
                      </h3>
                      <p
                        style={{
                          fontSize: "1.1rem",
                          color: "#34495e",
                          maxWidth: "400px",
                        }}
                      >
                        Use the dropdown in the header to select a user to view
                        or add their monthly maintenance report.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div
                      style={{
                        background: "#236a80",
                        color: "white",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        marginBottom: "1.5rem",
                        maxWidth: CONTENT_WIDTH, // ✅ same width
                        width: "100%", // ✅ responsive
                        margin: "0 auto 1.5rem", // ✅ centered
                        marginTop: "20px",
                      }}
                    >
                      <h3 style={{ fontWeight: "bold" }}>ASSET LIST REPORT</h3>
                      <div>
                        <strong>SITE:</strong> {targetUser.siteName}{" "}
                        <span className="mx-3">|</span>
                        <strong>MONTH:</strong> {monthNames[month]} {year}
                      </div>

                      <div className="d-flex mt-3">
                        <select
                          className="form-select me-2"
                          value={month}
                          onChange={(e) => setMonth(Number(e.target.value))}
                          style={{ ...inputStyle, backgroundColor: "white" }}
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

                    {/* Table */}
                    <div
                      style={{
                        ...cardStyle,
                        maxWidth: CONTENT_WIDTH, // ✅ same width
                        width: "100%",
                        margin: "0 auto", // ✅ centered
                      }}
                    >
                      <div
                        style={{
                          height: "550px",
                          overflowY: "auto",
                          border: "3px dotted #236a80",
                          borderRadius: "10px",
                          padding: "10px",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        {loading && (
                          <div className="text-center mb-2">
                            Loading equipment...
                          </div>
                        )}

                        <table
                          className="table table-hover"
                          style={{ minWidth: "1000px" }}
                        >
                          <thead
                            style={{
                              backgroundColor: "#236a80",
                              color: "white",
                            }}
                          >
                            <tr>
                              <th>SL.No</th>
                              <th>Asset List</th>
                              <th>Capacity</th>
                              <th>Make</th>
                              <th>Status</th>
                              <th>Comment</th>
                              <th>Delete Row</th>
                            </tr>
                          </thead>

                          <tbody>
                            {rows.map((row, index) => (
                              <tr key={index}>
                                <td>
                                  <input
                                    type="number"
                                    value={row.slNo}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "slNo",
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      ...inputStyle,
                                      width: "60px", // ⬅️ SMALLER
                                      textAlign: "center",
                                    }}
                                  />
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    value={row.equipmentName}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "equipmentName",
                                        e.target.value
                                      )
                                    }
                                    style={inputStyle}
                                  />
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    value={row.capacity}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "capacity",
                                        e.target.value
                                      )
                                    }
                                    style={inputStyle}
                                  />
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    value={row.make}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "make",
                                        e.target.value
                                      )
                                    }
                                    style={inputStyle}
                                  />
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    value={row.status}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "status",
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      ...inputStyle,
                                      color: String(row.status || "")
                                        .toLowerCase()
                                        .includes("not")
                                        ? "red"
                                        : inputStyle.color,
                                      fontWeight: String(row.status || "")
                                        .toLowerCase()
                                        .includes("not")
                                        ? 800
                                        : 400,
                                    }}
                                  />
                                </td>

                                <td>
                                  <textarea
                                    value={row.comment}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "comment",
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      ...inputStyle,
                                      width: "200px",
                                      minHeight: "50px",
                                      color: String(row.comment || "").trim()
                                        ? "red"
                                        : inputStyle.color,
                                      fontWeight: String(
                                        row.comment || ""
                                      ).trim()
                                        ? 700
                                        : inputStyle.fontWeight || 400,
                                    }}
                                  />
                                </td>

                                <td style={{ textAlign: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRow(index)}
                                    disabled={loading || saving}
                                    title="Delete this row"
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      cursor: "pointer",
                                      fontSize: "18px",
                                      lineHeight: 1,
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {showNote && (
                        <div
                          style={{
                            marginTop: "15px",
                            padding: "12px",
                            border: "2px solid #c9a100",
                            background: "#ffe680",
                            borderRadius: "6px",
                            fontWeight: 600,
                            position: "relative",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div style={{ marginBottom: "6px" }}>Note:</div>

                            <button
                              type="button"
                              onClick={() => {
                                const ok = window.confirm(
                                  "Delete the note section?"
                                );
                                if (!ok) return;
                                setNote("");
                                setShowNote(false);
                              }}
                              title="Delete note section"
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                fontSize: "18px",
                                lineHeight: 1,
                              }}
                            >
                              🗑️
                            </button>
                          </div>

                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Enter site note..."
                            style={{
                              width: "100%",
                              minHeight: "50px",
                              border: "1px solid #b58d00",
                              borderRadius: "6px",
                              padding: "8px",
                              fontWeight: 500,
                              background: "white",
                            }}
                          />
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="d-flex justify-content-between mt-3">
                        {/* LEFT SIDE: Add Row + Add Note in one line */}
                        <div className="d-flex align-items-center gap-2">
                          <button
                            onClick={handleAddRow}
                            style={{
                              padding: "10px 24px",
                              borderRadius: "8px",
                              border: "2px dotted #0c5a2dff",
                              backgroundColor: "#27ae60",
                              color: "white",
                              fontWeight: "600",
                            }}
                          >
                            + Add Row
                          </button>

                          {!showNote && (
                            <button
                              type="button"
                              onClick={() => setShowNote(true)}
                              style={{
                                padding: "10px 24px", // ✅ same height as Add Row
                                borderRadius: "8px",
                                border: "2px dotted #c9a100",
                                backgroundColor: "#ffe680",
                                fontWeight: 700,
                              }}
                            >
                              + Add Note
                            </button>
                          )}
                        </div>

                        {/* RIGHT SIDE */}
                        <div>
                          <button
                            onClick={handleSaveReport}
                            style={{
                              padding: "10px 24px",
                              borderRadius: "8px",
                              backgroundColor: "#236a80",
                              color: "white",
                              marginRight: "10px",
                            }}
                          >
                            Save Report
                          </button>

                          <button
                            onClick={handleDownloadPDF}
                            style={{
                              padding: "10px 24px",
                              borderRadius: "8px",
                              backgroundColor: "#e74c3c",
                              color: "white",
                              marginRight: "10px",
                            }}
                          >
                            Download PDF
                          </button>

                          <button
                            onClick={handleDownloadCSV}
                            style={{
                              padding: "10px 24px",
                              borderRadius: "8px",
                              backgroundColor: "#27ae60",
                              color: "white",
                            }}
                          >
                            Download CSV
                          </button>
                        </div>
                      </div>
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

export default EquipmentStatusReport;
