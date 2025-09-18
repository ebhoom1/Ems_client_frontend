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
  const downloadQR = async (value) => {
    try {
      const pngUrl = await QRCodeLib.toDataURL(value);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `qr-${value}.png`;
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
        {/* <div className="col-md-4 d-flex justify-content-md-end gap-2">
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
        </div> */}
        <div className="col-md-6 d-flex justify-content-md-end gap-2">
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

          {/* Visit Report Buttons */}
          <button
            className="btn btn-info"
            onClick={() => setShowVisitReportModal({ kind: "engineer" })}
          >
            Engineer Visit Report
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowVisitReportModal({ kind: "safety" })}
          >
            Safety Report
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
                <th>Assign</th>
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
                  <td>
                    {assignedUserNames.includes(e.userName) && (
                      <>
                        {e.hasMechanical && e.hasElectrical && e.hasService ? (
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
