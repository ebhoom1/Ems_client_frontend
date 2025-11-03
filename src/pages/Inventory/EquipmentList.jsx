// src/components/EquipmentList.jsx

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { useSelector } from "react-redux";
import QRCode from "react-qr-code";
import QRCodeLib from "qrcode";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import "./inventory.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Dropdown from "react-bootstrap/Dropdown";

import MaintenanceTypeModal from "./MaintenanceTypeModal";
import ReportTypeModal from "./ReportTypeModal";
import MonthSelectionModal from "./MonthSelectionModal";
import VisitReportTypeModal from "./VisitReportTypeModal";

export default function EquipmentList() {
  const { userData } = useSelector((state) => state.user);
  const currentUser = userData?.validUserOne || {};
  const type = userData?.validUserOne || {};
  const isOperator = type.isOperator;
  const isTechnician = type.isTechnician;
  const territorialManager = type.isTerritorialManager;

  // --- STATE MANAGEMENT ---
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // ✨ 1. ADDED LOADING STATE
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState(() => {
    return sessionStorage.getItem("selectedUserId") || "all";
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedEquipmentName, setSelectedEquipmentName] = useState(null);
  const [selectedEquipmentUserName, setSelectedEquipmentUserName] =
    useState(null);
  const [assignedUserNames, setAssignedUserNames] = useState([]);

  const [showReportModal, setShowReportModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [reportType, setReportType] = useState(null);
  const [showVisitReportModal, setShowVisitReportModal] = useState(false);

  const [selectedEquipments, setSelectedEquipments] = useState([]);

  // --- FUNCTION TO HANDLE CHECKBOX CHANGE ---
  const handleCheckboxChange = (equipment) => {
    setSelectedEquipments((prev) => {
      const exists = prev.find((e) => e._id === equipment._id);
      if (exists) {
        return prev.filter((e) => e._id !== equipment._id);
      } else {
        return [...prev, equipment];
      }
    });
  };

  // --- helper: build a QR image (PNG DataURL) with captions under it ---
  const buildQrWithCaption = async (value, { name, ratedLoad, capacity }) => {
    // 1) draw the QR to an offscreen canvas
    const qrCanvas = document.createElement("canvas");
    await QRCodeLib.toCanvas(qrCanvas, value, { width: 280, margin: 1 }); // big for crisp output

    // 2) measure caption width
    const padding = 20;
    const fontSize = 16;
    const lineGap = 6;
    const lines = [
      `Name: ${name || "N/A"}`,
      `Rated Load: ${ratedLoad || "–"}`,
      `Capacity: ${capacity || "–"}`,
    ];
    const meas = document.createElement("canvas").getContext("2d");
    meas.font = `${fontSize}px Arial`;
    const textW = Math.max(...lines.map((l) => meas.measureText(l).width));

    // 3) final canvas with white background, border, QR + centered text
    const canvasWidth =
      Math.max(qrCanvas.width, Math.ceil(textW)) + padding * 2;
    const canvasHeight =
      qrCanvas.height + padding * 2 + lines.length * (fontSize + lineGap) + 10;

    const out = document.createElement("canvas");
    out.width = canvasWidth;
    out.height = canvasHeight;

    const ctx = out.getContext("2d");
    // background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    // soft border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2);

    // QR centered at top
    const qrX = (canvasWidth - qrCanvas.width) / 2;
    ctx.drawImage(qrCanvas, qrX, padding);

    // captions (centered)
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "#111827";
    ctx.textAlign = "center";
    let y = padding + qrCanvas.height + 10 + fontSize;
    const cx = canvasWidth / 2;
    lines.forEach((line) => {
      ctx.fillText(line, cx, y);
      y += fontSize + lineGap;
    });

    return {
      dataUrl: out.toDataURL("image/png"),
      widthPx: out.width,
      heightPx: out.height,
    };
  };

  // --- FUNCTION TO DOWNLOAD MULTI-QR PDF ---
  // --- FUNCTION TO DOWNLOAD MULTI-QR PDF (styled two-column cards) ---
  const downloadSelectedQRCodes = async () => {
    if (selectedEquipments.length === 0) {
      toast.warn("Please select at least one equipment");
      return;
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const margin = 12;
    const cols = 3;
    const gap = 6;
    const headerH = 10;

    // Card size fits two columns nicely
    const cardW = (pageW - margin * 2 - gap * (cols - 1)) / cols;
    const cardH = 70;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Equipment QR Pack", margin, margin);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(new Date().toLocaleString("en-GB"), pageW - margin, margin, {
      align: "right",
    });

    let col = 0;
    let x = margin;
    let y = margin + headerH;

    for (let i = 0; i < selectedEquipments.length; i++) {
      const eq = selectedEquipments[i];

      // Build QR image with captions under it
      const img = await buildQrWithCaption(eq._id, {
        name: eq.equipmentName,
        ratedLoad: eq.ratedLoad,
        capacity: eq.capacity,
      });

      // New page if no vertical space left
      if (y + cardH > pageH - margin) {
        doc.addPage();
        // re-draw a small header for continuity
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Equipment QR Pack (cont.)", margin, margin);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(new Date().toLocaleString("en-GB"), pageW - margin, margin, {
          align: "right",
        });
        y = margin + headerH;
        col = 0;
        x = margin;
      }

      // Card outline
      doc.setDrawColor(220);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y, cardW, cardH, 3, 3);

      // Title (centered)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      // Center the QR+caption image INSIDE the card (fit by width/height, then center)
      const ratio = img.heightPx / img.widthPx;
      const maxW = cardW - 16; // horizontal padding inside card
      const maxH = cardH - 16; // vertical padding inside card
      let innerW = maxW;
      let innerH = innerW * ratio;
      if (innerH > maxH) {
        innerH = maxH;
        innerW = innerH / ratio;
      }
      const imgX = x + (cardW - innerW) / 2;
      const imgY = y + (cardH - innerH) / 2;
      doc.addImage(img.dataUrl, "PNG", imgX, imgY, innerW, innerH);

      // Optional tiny footer line (ID)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      // Next column/row
      col++;
      if (col === cols) {
        col = 0;
        x = margin;
        y += cardH + gap;
      } else {
        x += cardW + gap;
      }
    }

    doc.save("Selected_Equipments_QR.pdf");
  };

  const navigate = useNavigate();

  // --- DATA FETCHING ---

  // Fetch companies/users based on role (This logic is unchanged)
  const fetchUsers = useCallback(async () => {
    try {
      const currentUserId = type?._id;
      if (!currentUserId) return;

      const res = await fetch(`${API_URL}/api/getallusers`);
      const allUsers = (await res.json()).users || [];

      const isAssignedToAny = allUsers.some((u) => {
        const isOperator =
          Array.isArray(u.operators) &&
          u.operators.some((opId) => opId?.toString() === currentUserId);
        const isTechnician =
          Array.isArray(u.technicians) &&
          u.technicians.some((techId) => techId?.toString() === currentUserId);
        const isTerritorial =
          u.territorialManager?.toString() === currentUserId;
        return isOperator || isTechnician || isTerritorial;
      });

      let filtered = [];
      if (isAssignedToAny) {
        filtered = allUsers.filter((u) => {
          const isOperator =
            Array.isArray(u.operators) &&
            u.operators.some((opId) => opId?.toString() === currentUserId);
          const isTechnician =
            Array.isArray(u.technicians) &&
            u.technicians.some(
              (techId) => techId?.toString() === currentUserId
            );
          const isTerritorial =
            u.territorialManager?.toString() === currentUserId;
          return isOperator || isTechnician || isTerritorial;
        });
      } else {
        if (type.adminType === "EBHOOM") {
          filtered = allUsers.filter(
            (u) => !u.isOperator && !u.isTechnician && !u.isTerritorialManager
          );
        } else if (type.userType === "super_admin") {
          const myAdmins = allUsers.filter(
            (u) => u.createdBy === currentUserId && u.userType === "admin"
          );
          const adminIds = myAdmins.map((a) => a._id.toString());
          const allowed = allUsers.filter(
            (u) =>
              u.createdBy === currentUserId || adminIds.includes(u.createdBy)
          );
          filtered = allowed.filter(
            (u) => !u.isOperator && !u.isTechnician && !u.isTerritorialManager
          );
        } else if (type.userType === "admin") {
          const res = await fetch(
            `${API_URL}/api/get-users-by-creator/${currentUserId}`
          );
          const byCreator = (await res.json()).users || [];
          filtered = byCreator.filter((u) => u.userType === "user");
        }
      }
      setUsers(filtered);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  }, [type]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✨ 2. REWRITTEN & SIMPLIFIED EQUIPMENT FETCHING LOGIC
  useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoading(true); // Start loading
      try {
        let equipmentData = [];
        let url = "";

        if (isOperator || isTechnician || territorialManager) {
          if (users.length > 0) {
            // This case might need a new backend endpoint to be truly efficient
            const allEquipmentPromises = users.map((u) =>
              fetch(`${API_URL}/api/operator-equipment/${u.userName}`).then(
                (res) => res.json()
              )
            );
            const results = await Promise.all(allEquipmentPromises);
            equipmentData = results.flatMap(
              (data) => data.equipment || data.inventoryItems || []
            );
          }
        } else {
          if (type.userType === "admin") {
            url = `${API_URL}/api/admin-type-equipment/${type.adminType}`;
          } else if (type.userType === "user") {
            url = `${API_URL}/api/user/${type.userName}`;
          } else {
            url = `${API_URL}/api/all-equipment`;
          }
          const res = await fetch(url);
          equipmentData = (await res.json()).equipment || [];
        }

        setList(equipmentData);
      } catch (err) {
        toast.error("Error fetching equipment");
        console.error(err);
      } finally {
        setIsLoading(false); // Stop loading regardless of success or error
      }
    };

    // We only fetch equipment if the necessary prerequisite (users list) is loaded for certain roles
    if (isOperator || isTechnician || territorialManager) {
      if (users.length > 0) {
        fetchEquipment();
      }
    } else {
      fetchEquipment();
    }
  }, [type, isOperator, isTechnician, territorialManager, users]); // Dependencies for the effect

  // Fetch assigned usernames (unchanged)
  useEffect(() => {
    if (!currentUser._id) return;
    const fetchAssignedUserNames = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/assignments/by-assigned-to/${currentUser._id}`
        );
        if (res.data.success) {
          setAssignedUserNames(res.data.assignedUserNames);
        }
      } catch (err) {
        console.error(
          "Error fetching assigned usernames",
          err.response?.data || err.message
        );
      }
    };
    fetchAssignedUserNames();
  }, [currentUser._id]);

  // --- HELPER FUNCTIONS (mostly unchanged) ---
  // --- replace this function ---
  const downloadQR = async (equipment) => {
    try {
      const { dataUrl } = await buildQrWithCaption(equipment._id, {
        name: equipment.equipmentName,
        ratedLoad: equipment.ratedLoad,
        capacity: equipment.capacity,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qr-${equipment.equipmentName || equipment._id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast.error("Failed to download QR");
      console.error(err);
    }
  };

  const deleteEquipment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment?"))
      return;
    try {
      const res = await fetch(`${API_URL}/api/equipment/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setList((prev) => prev.filter((e) => e._id !== id));
        toast.success("Equipment deleted successfully");
      } else {
        const json = await res.json();
        toast.error(json.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Error deleting equipment");
      console.error(err);
    }
  };

  const openModal = (id, name, userName) => {
    setSelectedId(id);
    setSelectedEquipmentName(name);
    setSelectedEquipmentUserName(userName);
    setShowModal(true);
  };

  const openReportModal = (id) => {
    setSelectedId(id);
    setShowReportModal(true);
  };

  const openMergedReportModal = (t) => {
    setReportType(t);
    setShowMonthModal(true);
  };

  const handleMonthSelected = (year, month) => {
    setShowMonthModal(false);
    navigate(`/report/${reportType}/download/${year}/${month}`);
  };

  const editEquipment = (id) => {
    navigate(`/edit-equipment/${id}`);
  };

  const filtered = list.filter((e) => {
    if (selectedUserName !== "all" && e.userName !== selectedUserName)
      return false;
    const term = searchTerm.toLowerCase();
    const dateStr = e.installationDate
      ? new Date(e.installationDate).toLocaleDateString("en-GB")
      : "";
    return (
      e.equipmentName.toLowerCase().includes(term) ||
      e.userName.toLowerCase().includes(term) ||
      dateStr.includes(term)
    );
  });

  const openVisitReportModal = (id, name, userName) => {
    setSelectedId(id);
    setSelectedEquipmentName(name);
    setSelectedEquipmentUserName(userName);
    setShowVisitReportModal(true);
  };

  return (
    <div className="p-3 border">
      {showVisitReportModal && (
        <VisitReportTypeModal
          reportKind={showVisitReportModal.kind}
          role={type.userType}
          onClose={() => setShowVisitReportModal(false)}
        />
      )}

      {showModal && (isTechnician || territorialManager) && (
        <MaintenanceTypeModal
          equipmentId={selectedId}
          equipmentName={selectedEquipmentName}
          equipmentUserName={selectedEquipmentUserName}
          onClose={() => setShowModal(false)}
        />
      )}
      {showReportModal && type.userType === "admin" && (
        <ReportTypeModal
          equipmentId={selectedId}
          onClose={() => setShowReportModal(false)}
        />
      )}
      {showMonthModal && (
        <MonthSelectionModal
          reportType={reportType}
          onClose={() => setShowMonthModal(false)}
          onMonthSelected={handleMonthSelected}
        />
      )}

      {/* Search & Filter */}
      <div className="mb-3 row align-items-center g-2">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {(type.userType === "admin" ||
          isOperator ||
          isTechnician ||
          territorialManager) && (
          <div className="col-md-4">
            <select
              className="form-control"
              value={selectedUserName}
              onChange={(e) => setSelectedUserName(e.target.value)}
            >
              <option value="all">All Companies</option>
              {users.map((u) => (
                <option key={u._id} value={u.userName}>
                  {u.companyName}
                </option>
              ))}
            </select>
          </div>
        )}
        {/*Button section */}
        {/* Button Section */}
        <div className="col-md-6 d-flex justify-content-start gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-basic">
              All Reports
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {/* {type.userType === "admin" && ( */}
                {/* <> */}
                  <Dropdown.Item
                    onClick={() => openMergedReportModal("mechanical")}
                  >
                    Download Mechanical
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => openMergedReportModal("electrical")}
                  >
                    Download Electrical
                  </Dropdown.Item>
                {/* </> */}
              {/* )} */}
              <Dropdown.Item
                onClick={() => setShowVisitReportModal({ kind: "engineer" })}
              >
                Engineer Visit Report
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setShowVisitReportModal({ kind: "safety" })}
              >
                Safety Report
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setShowVisitReportModal({ kind: "service" })}
              >
                Service Report
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Keep Download QR separate */}
          <button className="btn btn-success" onClick={downloadSelectedQRCodes}>
            Download QR
          </button>
        </div>
      </div>

      {/* Equipment Table */}
      <div style={{ maxHeight: "60vh", overflow: "auto" }}>
        {/* ✨ 3. ADDED LOADING INDICATOR */}
        {isLoading ? (
          <p>Loading equipment...</p>
        ) : filtered.length === 0 ? (
          <p>No equipment found</p>
        ) : (
          <table className="table table-striped align-middle">
            <thead style={{ background: "#236a80", color: "#fff" }}>
              <tr>
                {/* Table headers (unchanged) */}
                <th>Select</th>
                <th>Name</th>
                <th>User</th>
                <th>Model</th>
                <th>Date</th>
                <th>Capacity</th>
                <th>Rated Load</th>
                <th>Location</th>
                <th>Notes</th>
                <th>QR</th>
                <th>Download QR</th>
                <th>Action</th>
                {/* <th>Assign</th> */}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                // ✨ 4. JSX USES NEW DATA STRUCTURE (e.g., !e.canMechanical)
                <tr
                  key={e._id}
                  className={
                    assignedUserNames.includes(e.userName)
                      ? (isTechnician && !e.canElectrical) ||
                        (territorialManager && !e.canMechanical)
                        ? "row-completed" // Report submitted
                        : "row-assigned" // Assigned but not submitted
                      : ""
                  }
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedEquipments.some(
                        (eq) => eq._id === e._id
                      )}
                      onChange={() => handleCheckboxChange(e)}
                    />
                  </td>
                  <td>{e.equipmentName || "N/A"}</td>
                  <td>{e.userName || "N/A"}</td>
                  <td>{e.modelSerial || "N/A"}</td>
                  <td>
                    {e.installationDate
                      ? new Date(e.installationDate).toLocaleDateString("en-GB")
                      : "N/A"}
                  </td>
                  <td>{e.capacity || "–"}</td>
                  <td>{e.ratedLoad || "–"}</td>
                  <td>{e.location || "N/A"}</td>
                  <td>{e.notes || "N/A"}</td>
                  <td>
                    <QRCode value={e._id} size={64} />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => downloadQR(e)}
                    >
                      Download
                    </button>
                  </td>
                  <td className="d-flex align-items-center gap-2">
                    {territorialManager ? (
                      <>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() =>
                            openModal(e._id, e.equipmentName, e.userName)
                          }
                        >
                          {/* {!e.canMechanical ? "Edit Report" : "Add Report"} */}
                          Add Report
                        </button>
                      </>
                    ) : isTechnician ? (
                      <>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() =>
                            openModal(e._id, e.equipmentName, e.userName)
                          }
                        >
                          {!e.canElectrical ? "Edit Report" : "Add Report"}
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => openReportModal(e._id)}
                      >
                        View Report
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => editEquipment(e._id)}
                      title="Edit Equipment"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteEquipment(e._id)}
                      title="Delete Equipment"
                    >
                      <FaTrash />
                    </button>
                  </td>
                  {/* <td>
                    {assignedUserNames.includes(e.userName) && (
                      <>
                        {(isTechnician && !e.canElectrical) ||
                        (territorialManager && !e.canMechanical) ? (
                          <span className="badge bg-success">Completed</span>
                        ) : (
                          <span className="badge bg-primary">Assigned</span>
                        )}
                      </>
                    )}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}