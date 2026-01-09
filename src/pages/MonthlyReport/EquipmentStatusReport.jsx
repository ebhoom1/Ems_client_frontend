 
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
          notes: "",
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
              notes: e.notes || "",
            }))
          );
        } else {
          setRows(baseRows);
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
      notes: r.notes || "",
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

    let csv = "SL.No,Equipment,Capacity,Make,Status,Comment,Notes\n";
    exportRows.forEach((r) => {
      csv += `${r.slNo},"${r.equipmentName}","${r.capacity}","${r.make}","${r.status}","${r.comment}","${r.notes}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetUser.siteName}_${
      month + 1
    }-${year}_EquipmentStatus.csv`;
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
      doc.text("Equipment Status Report", pageWidth / 2 + 10, 15, {
        align: "center",
      });

      doc.setTextColor("#000");
      doc.setFontSize(10);
      doc.text(`Site: ${targetUser.siteName} (${targetUser.userName})`, 15, 45);
      doc.text(`Month: ${month + 1}/${year}`, 15, 52);

      doc.autoTable({
        startY: 58,
        head: [
          [
            "SL.No",
            "Equipment",
            "Capacity",
            "Make",
            "Status",
            "Comment",
            "Notes",
          ],
        ],
        body: exportRows.map((r) => [
          r.slNo,
          r.equipmentName,
          r.capacity,
          r.make,
          r.status,
          r.comment,
          r.notes,
        ]),
        theme: "grid",
        headStyles: { fillColor: "#236a80", textColor: "#fff" },
        styles: { fontSize: 8 },
      });

      doc.save(
        `${targetUser.siteName}_${month + 1}_${year}_EquipmentStatus.pdf`
      );

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
            <div className="row" style={{ marginTop: "0", padding: "0 68px" }}>
              <div className="col-12">
                {/* If no user selected */}
                {!targetUser.userName ? (
                  <div style={cardStyle}>
                    <h3>Please Select a User</h3>
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
                      }}
                    >
                      <h3 style={{ fontWeight: "bold" }}>
                        EQUIPMENT STATUS REPORT
                      </h3>
                      <div>
                        <strong>SITE:</strong> {targetUser.siteName} (
                        {targetUser.userName})<span className="mx-3">|</span>
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
                    <div style={cardStyle}>
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

                        <table className="table table-hover">
                          <thead
                            style={{
                              backgroundColor: "#236a80",
                              color: "white",
                            }}
                          >
                            <tr>
                              <th>SL.No</th>
                              <th>Equipment</th>
                              <th>Capacity</th>
                              <th>Make</th>
                              <th>Status</th>
                              <th>Comment</th>
                              <th>Notes</th>
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
                                    style={inputStyle}
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
                                      width: "200px", // ⬅️ BIGGER COMMENT WIDTH
                                      minHeight: "50px",
                                    }}
                                  />
                                </td>
                                <td>
                                  <textarea
                                    value={row.notes}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "notes",
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      ...inputStyle,
                                      width: "200px",
                                      minHeight: "50px",
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

                      {/* Buttons */}
                      <div className="d-flex justify-content-between mt-3">
                        <button
                          onClick={handleAddRow}
                          style={{
                            padding: "10px 24px",
                            borderRadius: "8px",
                            border: "2px dotted #27ae60",
                            backgroundColor: "#27ae60",
                            color: "white",
                            fontWeight: "600",
                          }}
                        >
                          + Add Row
                        </button>

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
