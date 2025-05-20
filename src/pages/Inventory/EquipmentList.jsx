// src/pages/EquipmentList.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { useSelector } from "react-redux";
import QRCode from "react-qr-code";
import QRCodeLib from "qrcode";
import MaintenanceTypeModal from "./MaintenanceTypeModal";
import { useNavigate } from "react-router-dom";
import ReportTypeModal from "./ReportTypeModal";
import MonthSelectionModal from "./MonthSelectionModal"; // New component we'll create

export default function EquipmentList() {
  const { userData } = useSelector((state) => state.user);
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { validUserOne: type } = userData || {};
 const [users, setUsers] = useState([]);               // ← New
  const [selectedUserName, setSelectedUserName] = useState("all");  // ← New
  // modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedEquipmentName, setSelectedEquipmentName] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [reportType, setReportType] = useState(null); // 'mechanical' or 'electrical'
  const navigate = useNavigate();

  useEffect(() => {
    
    (async () => {

      if (type?.userType === "admin") {
      try {
        const res = await fetch(
          `${API_URL}/api/get-users-by-adminType/${type.adminType}`
        );
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        toast.error("Error fetching user list");
      }
    }
      try {
        let url = `${API_URL}/api/all-equipment`;
        if (type?.userType === "user")
          url = `${API_URL}/api/user/${type.userName}`;
        else if (type?.userType === "admin")
          url = `${API_URL}/api/admin-type-equipment/${type.adminType}`;

        const res = await fetch(url);
        const data = await res.json();
        const arr = data.equipment || data.inventoryItems || data;
        setList(Array.isArray(arr) ? arr : []);
      } catch {
        toast.error("Error fetching equipment list");
      }
    })();

    
  }, [type]);

  const downloadQR = async (value) => {
    try {
      const pngUrl = await QRCodeLib.toDataURL(value);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `qr-${value}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      toast.error("Failed to download QR code");
    }
  };

  const downloadReport = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/download-report/${id}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast.error("Failed to download report");
    }
  };

  const viewReport = (id) => {
    navigate(`/report/${id}`);
  };

  const handleMonthSelected = (year, month) => {
    setShowMonthModal(false);
    if (reportType === 'mechanical') {
      navigate(`/report/mechanical/download/${year}/${month}`);
    } else if (reportType === 'electrical') {
      navigate(`/report/electrical/download/${year}/${month}`);
    }
  };

  const openMergedReportModal = (type) => {
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
    setSelectedId(id);
    setSelectedEquipmentName(name);
    setShowModal(true);
  };
  
  const openReportModal = (id) => {
    setSelectedId(id);
    setShowReportModal(true);
  };

  return (
    <div className="p-3 border">
      {showModal && type?.userType === "user" && (
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
          onClose={() => setShowMonthModal(false)}
          onSelect={handleMonthSelected}
        />
      )}

      {/* Search bar */}
      <div className="mb-3 d-flex align-items-between justify-content-between">
       <select
  className="form-control me-2"
  style={{ maxWidth: 300 }}
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
        <div>
          <button
            className="btn btn-warning me-2"
            onClick={() => openMergedReportModal('mechanical')}
          >
            <i className="fa-solid fa-download" /> Download Merged Mechanical report
          </button>
          <button
            className="btn btn-warning"
            onClick={() => openMergedReportModal('electrical')}
          >
            <i className="fa-solid fa-download" /> Download Merged Electrical report
          </button>
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
                  <td>
                    {type?.userType === "user" ? (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => openModal(e._id, e.equipmentName)}
                      >
                        Report
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-success me-1"
                          onClick={() => openReportModal(e._id)}
                        >
                          View Report
                        </button>
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