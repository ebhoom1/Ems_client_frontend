// src/components/EquipmentList.jsx

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { useSelector } from "react-redux";
import QRCode from "react-qr-code";
import QRCodeLib from "qrcode";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

import MaintenanceTypeModal from "./MaintenanceTypeModal";
import ReportTypeModal from "./ReportTypeModal";
import MonthSelectionModal from "./MonthSelectionModal";

export default function EquipmentList() {
  const { userData } = useSelector((state) => state.user);
  const type = userData?.validUserOne || {};
  const isOperator = type.isOperator;
  const isTechnician = type.isTechnician;
  const territorialManager = type.isTerritorialManager;

  const [list, setList] = useState([]);
  const [electricalReportStatus, setElectricalReportStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedEquipmentName, setSelectedEquipmentName] = useState(null);
  const [selectedEquipmentUserName, setSelectedEquipmentUserName] = useState(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [reportType, setReportType] = useState(null);

  const navigate = useNavigate();

  // 1) Fetch companies/users based on role
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let fetched = [];

        if (isTechnician) {
          const res = await fetch(
            `${API_URL}/api/get-companies-by-technician/${type._id}`
          );
          fetched = (await res.json()).companies || [];
        } else if (territorialManager) {
          const res = await fetch(
            `${API_URL}/api/get-companies-by-territorialManager/${type._id}`
          );
          fetched = (await res.json()).companies || [];
        } else if (isOperator) {
          const res = await fetch(
            `${API_URL}/api/get-companies-by-operator/${type._id}`
          );
          fetched = (await res.json()).companies || [];
        } else if (type.userType === "admin") {
          const res = await fetch(
            `${API_URL}/api/get-users-by-adminType/${type.adminType}`
          );
          fetched = (await res.json()).users || [];
        } else if (type.userType === "user") {
          const res = await fetch(`${API_URL}/api/user/${type.userName}`);
          const data = await res.json();
          fetched = data.userName
            ? [{ _id: type._id, userName: data.userName, companyName: data.companyName }]
            : [];
        }

        setUsers(fetched);
      } catch (err) {
        toast.error("Error fetching users/companies");
        console.error(err);
      }
    };
    fetchUsers();
  }, [type, isOperator, isTechnician, territorialManager]);

  // 2) Fetch equipment + electrical report status
  useEffect(() => {
    const fetchEquipmentAndStatus = async () => {
      try {
        let equipmentData = [];

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

        // fetch /exists for each
        const statusMap = {};
        await Promise.all(
          equipmentData.map(async (e) => {
            try {
              const res = await fetch(
                `${API_URL}/api/electricalreport/exists/${e._id}`
              );
              const json = await res.json();
              statusMap[e._id] = Boolean(json.exists);
            } catch {
              statusMap[e._id] = false;
            }
          })
        );
        setElectricalReportStatus(statusMap);
      } catch (err) {
        toast.error("Error fetching equipment");
        console.error(err);
      }
    };
    fetchEquipmentAndStatus();
  }, [type, isOperator, isTechnician, territorialManager, users]);

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
                <th  style={{ background: "#236a80", color: "#fff" }}>Name</th>
                <th  style={{ background: "#236a80", color: "#fff" }}>User</th>
                <th  style={{ background: "#236a80", color: "#fff" }}>Model</th>
                <th  style={{ background: "#236a80", color: "#fff" }}>Date</th>
                <th  style={{ background: "#236a80", color: "#fff" }}>Capacity</th>
                <th  style={{ background: "#236a80", color: "#fff" }}>Rated Load</th>
                <th  style={{ background: "#236a80", color: "#fff" }}>Location</th>
                <th  style={{ background: "#236a80", color: "#fff" }}>Notes</th>
                <th  style={{ background: "#236a80", color: "#fff" }}>QR</th>
                <th  style={{ background: "#236a80", color: "#fff" }}>Download QR</th>
                <th  style={{ background: "#236a80", color: "#fff" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e._id}>
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
                    {isTechnician ? (
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
                            openModal(
                              e._id,
                              e.equipmentName,
                              e.userName
                            )
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
                    {type.userType === "admin" && !territorialManager && (
                      <>
                        <button
                          className="btn btn-sm text-blue-600"
                          onClick={() => editEquipment(e._id)}
                          title="Edit Equipment"
                        >
                          <FaEdit />
                        </button>
                       {userData?.validUserOne?.userType === "admin" && !isTechnician && !territorialManager && (
  <>
    <button
      className="btn btn-sm text-blue-600"
      onClick={() => editEquipment(e._id)}
      title="Edit Equipment"
    >
      <FaEdit />
    </button>
    <button
      className="btn btn-sm text-red-600"
      onClick={() => deleteEquipment(e._id)}
      title="Delete Equipment"
    >
      <FaTrash />
    </button>
  </>
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
