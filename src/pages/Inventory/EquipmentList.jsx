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

import MaintenanceTypeModal from "./MaintenanceTypeModal";
import ReportTypeModal from "./ReportTypeModal";
import MonthSelectionModal from "./MonthSelectionModal";

export default function EquipmentList() {
  const { userData } = useSelector((state) => state.user);
  const currentUser = userData?.validUserOne || {};
  console.log("new currentuser:", currentUser._id);
  const type = userData?.validUserOne || {};
  const isOperator = type.isOperator;
  const isTechnician = type.isTechnician;
  const territorialManager = type.isTerritorialManager;
  const [mechanicalReportStatus, setMechanicalReportStatus] = useState({});
  const [list, setList] = useState([]);
  const [electricalReportStatus, setElectricalReportStatus] = useState({});
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

  const navigate = useNavigate();

  // 1) Fetch companies/users based on role
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
        // Only show companies assigned to this user
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
        // Default logic (admin/super_admin/EBHOOM)
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

  // 2) Fetch equipment + report statuses
  // src/components/EquipmentList.jsx

  // 2) Fetch equipment + report statuses
  useEffect(() => {
    const fetchEquipmentAndStatus = async () => {
      try {
        let equipmentData = [];

        // Part 1: Fetch the list of equipment (This part is unchanged)
        if (isOperator || isTechnician || territorialManager) {
          if (users.length > 0) {
            const all = [];
            for (const u of users) {
              const res = await fetch(
                `${API_URL}/api/operator-equipment/${u.userName}`
              );
              const data = await res.json();
              all.push(...(data.equipment || data.inventoryItems || []));
            }
            equipmentData = all;
          }
        } else if (type.userType === "admin") {
          const res = await fetch(
            `${API_URL}/api/admin-type-equipment/${type.adminType}`
          );
          equipmentData = (await res.json()).equipment || [];
        } else if (type.userType === "user") {
          const res = await fetch(`${API_URL}/api/user/${type.userName}`);
          equipmentData = (await res.json()).equipment || [];
        } else {
          const res = await fetch(`${API_URL}/api/all-equipment`);
          equipmentData = (await res.json()).equipment || [];
        }

        setList(equipmentData);

        // Part 2: For each piece of equipment, check if reports exist for the CURRENT MONTH
        const electricalStatusMap = {};
        const mechanicalStatusMap = {};

        // ✨ CORRECTED LOGIC: Calculate the CURRENT month and year
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // JS months are 0-11. For July, this is 7.

        await Promise.all(
          equipmentData.map(async (e) => {
            // Check for Electrical Report using the current month
            try {
              const elecRes = await fetch(
                `${API_URL}/api/electricalreport/exists/${e._id}?year=${currentYear}&month=${currentMonth}`
              );
              const elecJson = await elecRes.json();
              electricalStatusMap[e._id] = Boolean(elecJson.exists);
            } catch {
              electricalStatusMap[e._id] = false;
            }

            // Check for Mechanical Report using the current month
            try {
              const mechRes = await fetch(
                `${API_URL}/api/mechanicalreport/exists/${e._id}?year=${currentYear}&month=${currentMonth}`
              );
              const mechJson = await mechRes.json();
              mechanicalStatusMap[e._id] = Boolean(mechJson.exists);
            } catch {
              mechanicalStatusMap[e._id] = false;
            }
          })
        );

        // Part 3: Set the state for both report statuses
        setElectricalReportStatus(electricalStatusMap);
        setMechanicalReportStatus(mechanicalStatusMap);
      } catch (err) {
        toast.error("Error fetching equipment");
        console.error(err);
      }
    };

    fetchEquipmentAndStatus();
  }, [type, isOperator, isTechnician, territorialManager, users]); // Dependencies for the effect

  // Helpers
  const downloadQR = async (value) => {
    try {
      const png = await QRCodeLib.toDataURL(value);
      const a = document.createElement("a");
      a.href = png;
      a.download = `qr-${value}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toast.error("Failed to download QR");
      console.error(err);
    }
  };

  const deleteEquipment = async (id) => {
    if (!window.confirm("Delete this equipment?")) return;
    try {
      const res = await fetch(`${API_URL}/api/equipment/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setList((prev) => prev.filter((e) => e._id !== id));
        setElectricalReportStatus((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setMechanicalReportStatus((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        toast.success("Deleted");
      } else {
        const json = await res.json();
        toast.error(json.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Error deleting");
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

  useEffect(() => {
    const fetchAssignedUserNames = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/assignments/by-assigned-to/${currentUser._id}`
        );
        const data = res.data;
        console.log("assigned usernames:", data);
        if (data.success) {
          setAssignedUserNames(data.assignedUserNames);
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
  return (
    <div className="p-3 border">
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
        <div className="col-md-4 d-flex justify-content-md-end gap-2">
          {type.userType === "admin" && (
            <>
              <button
                className="btn btn-warning"
                onClick={() => openMergedReportModal("mechanical")}
              >
                Download Mechanical
              </button>
              <button
                className="btn btn-warning"
                onClick={() => openMergedReportModal("electrical")}
              >
                Download Electrical
              </button>
            </>
          )}
        </div>
      </div>

      {/* Equipment Table */}
      <div style={{ maxHeight: "60vh", overflow: "auto" }}>
        {filtered.length === 0 ? (
          <p>No equipment found</p>
        ) : (
          <table className="table table-striped align-middle">
            <thead style={{ background: "#236a80", color: "#fff" }}>
              <tr>
                <th style={{ background: "#236a80", color: "#fff" }}>Name</th>
                <th style={{ background: "#236a80", color: "#fff" }}>User</th>
                <th style={{ background: "#236a80", color: "#fff" }}>Model</th>
                <th style={{ background: "#236a80", color: "#fff" }}>Date</th>
                <th style={{ background: "#236a80", color: "#fff" }}>
                  Capacity
                </th>
                <th style={{ background: "#236a80", color: "#fff" }}>
                  Rated Load
                </th>
                <th style={{ background: "#236a80", color: "#fff" }}>
                  Location
                </th>
                <th style={{ background: "#236a80", color: "#fff" }}>Notes</th>
                <th style={{ background: "#236a80", color: "#fff" }}>QR</th>
                <th style={{ background: "#236a80", color: "#fff" }}>
                  Download QR
                </th>
                <th style={{ background: "#236a80", color: "#fff" }}>Action</th>
                <th style={{ background: "#236a80", color: "#fff" }}>Assign</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                key={e._id}
                className={
                  assignedUserNames.includes(e.userName)
                    ? (isTechnician && electricalReportStatus[e._id]) ||
                      (territorialManager && mechanicalReportStatus[e._id])
                      ? "row-completed"
                      : "row-assigned"
                    : ""
                }
              >
              
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
                      onClick={() => downloadQR(e._id)}
                    >
                      Download
                    </button>
                  </td>

                  <td className="d-flex align-items-center gap-2">
                    {territorialManager ? (
                      <>
                        <button
                          disabled
                          className={`btn btn-sm ${
                            mechanicalReportStatus[e._id]
                              ? "btn-primary"
                              : "btn-danger"
                          }`}
                        >
                          {mechanicalReportStatus[e._id]
                            ? "Submitted"
                            : "Not Submitted"}
                        </button>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() =>
                            openModal(e._id, e.equipmentName, e.userName)
                          }
                        >
                          {mechanicalReportStatus[e._id]
                            ? "Edit Report"
                            : "Add Report"}
                        </button>
                      </>
                    ) : isTechnician ? (
                      <>
                        <button
                          disabled
                          className={`btn btn-sm ${
                            electricalReportStatus[e._id]
                              ? "btn-primary"
                              : "btn-danger"
                          }`}
                        >
                          {electricalReportStatus[e._id]
                            ? "Submitted"
                            : "Not Submitted"}
                        </button>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() =>
                            openModal(e._id, e.equipmentName, e.userName)
                          }
                        >
                          {electricalReportStatus[e._id]
                            ? "Edit Report"
                            : "Add Report"}
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

                  <td>
                    {assignedUserNames.includes(e.userName) && (
                      <>
                        {(isTechnician && electricalReportStatus[e._id]) ||
                        (territorialManager &&
                          mechanicalReportStatus[e._id]) ? (
                          <span className="badge bg-success">Completed</span>
                        ) : (
                          <span className="badge bg-primary">Assigned</span>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
