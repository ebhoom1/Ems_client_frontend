import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { useSelector } from "react-redux";
import QRCode from "react-qr-code";
import QRCodeLib from "qrcode";
import MaintenanceTypeModal from "./MaintenanceTypeModal";
import { useNavigate } from "react-router-dom";
import ReportTypeModal from "./ReportTypeModal";
import MonthSelectionModal from "./MonthSelectionModal";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function EquipmentList() {
  const { userData } = useSelector((state) => state.user);
  const userType = userData?.validUserOne?.userType;
  const isOperator = userData?.validUserOne?.isOperator;
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { validUserOne: type } = userData || {};
  const technician = userData?.validUserOne?.isTechnician;
  const [users, setUsers] = useState([]); // This state will hold company info for operators/admins
  const [selectedUserName, setSelectedUserName] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedEquipmentName, setSelectedEquipmentName] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [reportType, setReportType] = useState(null);
  const navigate = useNavigate();
console.log("Current userData:", userData);
console.log("Is Technician:", userData?.validUserOne?.isTechnician);
console.log("Type object:", type); // <-- Add this line
console.log("Type userType:", type?.userType); // <-- Add this line
  // Effect to fetch users/companies (runs once or when type/isOperator changes)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (type?.userType === "admin") {
          const url = `${API_URL}/api/get-users-by-adminType/${type.adminType}`;
          console.log("Fetching users for admin:", url);
          const res = await fetch(url);
          const data = await res.json();
          console.log("Users fetched (admin):", data);
          setUsers(data.users || []);
        } else if (isOperator) {
          const url = `${API_URL}/api/get-companies-by-operator/${type._id}`;
          console.log("Fetching companies for operator:", url);
          const res = await fetch(url);
          const data = await res.json();
          console.log("Companies fetched (operator):", data);
          setUsers(data.companies || []);
        }
      } catch (err) {
        toast.error("Error fetching users/companies");
        console.error("Fetch users/companies error:", err);
      }
    };

    fetchUsers();
  }, [type, isOperator]); // Only run when user type or operator status changes

  // Effect to fetch equipment (runs when type, isOperator, or users change)
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        let equipmentData = [];
        if (type?.userType === "user") {
          const url = `${API_URL}/api/user/${type.userName}`;
          console.log("Fetching equipment for user:", url);
          const res = await fetch(url);
          const data = await res.json();
          console.log("Equipment fetched (user):", data);
          equipmentData = data.equipment || data.inventoryItems || data;
        } else if (type?.userType === "admin") {
          const url = `${API_URL}/api/admin-type-equipment/${type.adminType}`;
          console.log("Fetching equipment for admin:", url);
          const res = await fetch(url);
          const data = await res.json();
          console.log("Equipment fetched (admin):", data);
          equipmentData = data.equipment || data.inventoryItems || data;
        } else if (isOperator) {
          // This ensures `users` has been populated before proceeding
          if (users.length > 0) {
            let allOperatorEquipment = [];
            for (const user of users) {
              const url = `${API_URL}/api/operator-equipment/${user.userName}`;
              console.log("Fetching equipment for operator company:", url);
              const res = await fetch(url);
              const data = await res.json();
              console.log(`Equipment fetched for ${user.userName}:`, data);
              const companyEquipment = data.equipment || data.inventoryItems || data;
              if (Array.isArray(companyEquipment)) {
                allOperatorEquipment = [...allOperatorEquipment, ...companyEquipment];
              }
            }
            equipmentData = allOperatorEquipment;
          } else {
              // If operator but no users fetched yet, do nothing until 'users' is populated
              console.log("Operator is active, but companies not yet loaded. Waiting...");
              return;
          }
        } else {
          // Default case for all equipment if no specific user type is matched
          const url = `${API_URL}/api/all-equipment`;
          console.log("Fetching all equipment (default):", url);
          const res = await fetch(url);
          const data = await res.json();
          console.log("All equipment fetched (default):", data);
          equipmentData = data.equipment || data.inventoryItems || data;
        }

        setList(Array.isArray(equipmentData) ? equipmentData : []);
      } catch (err) {
        toast.error("Error fetching equipment");
        console.error("Fetch equipment error:", err);
      }
    };

    fetchEquipment();
  }, [type, isOperator, users]); // This effect now correctly depends on `users` being populated

  const downloadQR = async (value) => {
    try {
      console.log("Generating QR code for value:", value);
      const pngUrl = await QRCodeLib.toDataURL(value);
      console.log("QR code PNG URL generated.");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `qr-${value}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log("QR code downloaded successfully.");
    } catch (error) {
      toast.error("Failed to download QR code");
      console.error("Download QR code error:", error);
    }
  };

  const downloadReport = async (id) => {
    try {
      console.log("Downloading report for ID:", id);
      const res = await fetch(`${API_URL}/api/download-report/${id}`);
      const blob = await res.blob();
      console.log("Report blob received:", blob);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Report downloaded successfully");
      console.log("Report downloaded successfully.");
    } catch (error) {
      toast.error("Failed to download report");
      console.error("Download report error:", error);
    }
  };

  const viewReport = (id) => {
    console.log("Navigating to report for ID:", id);
    navigate(`/report/${id}`);
  };

  const handleMonthSelected = (year, month) => {
    setShowMonthModal(false);
    if (reportType === 'mechanical') {
      console.log("Navigating to mechanical report download for year/month:", year, month);
      navigate(`/report/mechanical/download/${year}/${month}`);
    } else if (reportType === 'electrical') {
      console.log("Navigating to electrical report download for year/month:", year, month);
      navigate(`/report/electrical/download/${year}/${month}`);
    }
  };

  const openMergedReportModal = (type) => {
    console.log("Opening merged report modal for type:", type);
    setReportType(type);
    setShowMonthModal(true);
  };

  const filtered = list.filter((e) => {
    // 1) if a user is selected, skip everything else:
    if (selectedUserName !== "all" && e.userName !== selectedUserName) {
      return false;
    }

    // 2) then apply your existing searchTerm match:
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

  const openModal = (id, name) => {
    console.log("Opening maintenance type modal for equipment:", id, name);
    setSelectedId(id);
    setSelectedEquipmentName(name);
    setShowModal(true);
  };

  const openReportModal = (id) => {
    console.log("Opening report type modal for equipment ID:", id);
    setSelectedId(id);
    setShowReportModal(true);
  };

  const deleteEquipment = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this equipment?");
    if (!confirm) {
      console.log("Equipment deletion cancelled by user.");
      return;
    }

    try {
      console.log("Deleting equipment with ID:", id);
      const res = await fetch(`${API_URL}/api/equipment/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      console.log("Delete equipment response:", result);
      if (res.ok) {
        toast.success("Equipment deleted successfully");
        setList((prev) => prev.filter((item) => item._id !== id));
      } else {
        toast.error(result.message || "Failed to delete equipment");
      }
    } catch (err) {
      toast.error("Something went wrong while deleting");
      console.error("Delete equipment error:", err);
    }
  };

  const editEquipment = (id) => {
    console.log("Navigating to edit equipment for ID:", id);
    navigate(`/edit-equipment/${id}`);
  };

  return (
    <div className="p-3 border">
      {showModal && (type?.userType === "user" || technician === true) && (
        <MaintenanceTypeModal
          equipmentId={selectedId}
          equipmentName={selectedEquipmentName}
          onClose={() => setShowModal(false)}
        />
      )}

      {showReportModal && type?.userType === "admin" && (
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

      {/* Search bar */}
      <div className="mb-3 row align-items-center g-2">
        {/* Search Input Column */}
        <div className="col-12 col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dropdown Column - Only show if admin or operator */}
        {(type?.userType === "admin" || isOperator) && (
          <div className="col-12 col-md-4">
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

        {/* Buttons Column */}
        <div className="col-12 col-md-4 d-flex flex-wrap justify-content-md-end justify-content-start gap-2 mt-2 mt-md-0">
          {type?.userType === "admin" && (
            <>
              <button
                className="btn btn-warning"
                onClick={() => openMergedReportModal("mechanical")}
              >
                <i className="fa-solid fa-download" /> Mechanical Report
              </button>
              <button
                className="btn btn-warning"
                onClick={() => openMergedReportModal("electrical")}
              >
                <i className="fa-solid fa-download" /> Electrical Report
              </button>
            </>
          )}
        </div>
      </div>

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
                <th style={{ background: "#236a80", color: "#fff" }}>Capacity</th>
                <th style={{ background: "#236a80", color: "#fff" }}>Rated Load</th>
                <th style={{ background: "#236a80", color: "#fff" }}>Location</th>
                <th style={{ background: "#236a80", color: "#fff" }}>Notes</th>
                <th style={{ background: "#236a80", color: "#fff" }}>QR</th>
                <th style={{ background: "#236a80", color: "#fff" }}>Download QR</th>
                <th style={{ background: "#236a80", color: "#fff" }}>Action</th>
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
                  <td><QRCode value={e._id} size={64} /></td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => downloadQR(e._id)}
                    >
                      Download
                    </button>
                  </td>
                  <td className="d-flex gap-1">
                    {(type?.userType === "user" || technician === true) ? (
                      <>
                        <button
                          className="btn btn-sm btn-success me-1 mt-3"
                          onClick={() => openModal(e._id, e.equipmentName)}
                        >
                          Add Report
                        </button>
                       {type?.userType === "admin" && 
 !(userData?.validUserOne?.isTechnician || !userData?.validUserOne?.isTerritorialManager) && (
    <>
        <button
            className="btn btn-sm me-1"
            style={{ color: "blue" }}
            title="Edit Equipment"
            onClick={() => editEquipment(e._id)}
        >
              <FaEdit/>
        </button>
        <button
            style={{ color: "red" }}
            className="btn btn-sm"
            title="Delete Equipment"
            onClick={() => deleteEquipment(e._id)}
        >
            <FaTrash />
        </button>
    </>
)}
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-success me-1 mt-3"
                          onClick={() => openReportModal(e._id)}
                        >
                          View Report
                        </button>

                     {type?.userType === "admin" && 
 !(userData?.validUserOne?.isTechnician || userData?.validUserOne?.isTerritorialManager) && (
    <>
        <button
            className="btn btn-sm me-1"
            style={{ color: "blue" }}
            title="Edit Equipment"
            onClick={() => editEquipment(e._id)}
        >
            Edit
        </button>
        <button
            style={{ color: "red" }}
            className="btn btn-sm"
            title="Delete Equipment"
            onClick={() => deleteEquipment(e._id)}
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