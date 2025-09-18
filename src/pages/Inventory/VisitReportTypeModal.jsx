import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MonthSelectionModal from "./MonthSelectionModal";
import { useSelector } from "react-redux";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const boxStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  maxWidth: "400px",
  width: "90%",
  textAlign: "center",
};

export default function VisitReportTypeModal({ reportKind, onClose }) {
  const navigate = useNavigate();
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [actionType, setActionType] = useState(null); // "view" | "edit"

  // 🔹 Role flags from Redux
  const { userData } = useSelector((state) => state.user);
  const type = userData?.validUserOne || {};
  const isTechnician = type.isTechnician;
  const isTerritorialManager = type.isTerritorialManager;

  // Only "plain" admin (not technician or territorial manager)
  const isPureAdmin =
    type.userType === "admin" && !isTechnician && !isTerritorialManager;

//   const handleAction = (action) => {
//     if (action === "add") {
//       onClose();
//       if (reportKind === "engineer") {
//         navigate(`/maintenance/engineer-visit/new`);
//       } else if (reportKind === "safety") {
//         navigate(`/maintenance/safety/new`);
//       }
//     } else {
//       setActionType(action);
//       setShowMonthModal(true);
//     }
//   };
const handleAction = (action) => {
    setActionType(action);
    setShowMonthModal(true); // ✅ Always open month modal
  };

//   const handleMonthSelected = (year, month, user) => {
//     setShowMonthModal(false);
//     onClose();
//     if (actionType === "view") {
//       navigate(`/report/${reportKind}/view/${user}/${year}/${month}`);
//     } else if (actionType === "edit") {
//       navigate(`/report/${reportKind}/edit/${user}/${year}/${month}`);
//     }
//   };
 const handleMonthSelected = (year, month, user) => {
    setShowMonthModal(false);
    onClose();

    if (actionType === "add") {
      if (reportKind === "engineer") {
        navigate(`/maintenance/engineer-visit/${user}`);
      } else if (reportKind === "safety") {
        navigate(`/maintenance/safety/${user}`);
      }
    } else if (actionType === "view") {
      navigate(`/report/${reportKind}/view/${user}/${year}/${month}`);
    } else if (actionType === "edit") {
      navigate(`/report/${reportKind}/edit/${user}/${year}/${month}`);
    }
  };

  return (
    <>
      <div style={overlayStyle}>
        <div style={boxStyle}>
          <h5>
            {reportKind === "engineer"
              ? "Engineer Visit Report"
              : "Safety Report"}
          </h5>
          <div className="d-grid gap-2">
            {/* 🔹 Pure Admin → Only View */}
            {isPureAdmin && (
              <button
                className="btn btn-info"
                onClick={() => handleAction("view")}
              >
                View Report
              </button>
            )}

            {/* 🔹 Technician / Territorial Manager → Add, Edit, View */}
            {(isTechnician || isTerritorialManager) && (
              <>
                <button
                  className="btn btn-success"
                  onClick={() => handleAction("add")}
                >
                  Add Report
                </button>
                {/* <button
                  className="btn btn-warning"
                  onClick={() => handleAction("edit")}
                >
                  Edit Report
                </button> */}
                <button
                  className="btn btn-info"
                  onClick={() => handleAction("view")}
                >
                  View Report
                </button>
              </>
            )}

            <button className="btn btn-link text-danger" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showMonthModal && (
        <MonthSelectionModal
          reportType={reportKind} // "engineer" or "safety"
          onClose={() => setShowMonthModal(false)}
          onMonthSelected={handleMonthSelected}
        />
      )}
    </>
  );
}
