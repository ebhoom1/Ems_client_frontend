// src/pages/VisitReportTypeModal.jsx
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
  const [actionType, setActionType] = useState(null);

  const { userData } = useSelector((state) => state.user);
  const type = userData?.validUserOne || {};
  const isTechnician = type.isTechnician;
  const isTerritorialManager = type.isTerritorialManager;
  const isPureAdmin =
    type.userType === "admin" && !isTechnician && !isTerritorialManager;
const user=type.userType==="user";
  const handleAction = (action) => {
    setActionType(action);
    setShowMonthModal(true);
  };

  // ✅ Receives checklistType only for safety reports
  const handleMonthSelected = (
    year,
    month,
    selectedCustomer,
    checklistType
  ) => {
    // setShowMonthModal(false);
    // onClose();
      const enc = (v) => encodeURIComponent(v || "");
  setShowMonthModal(false);

    if (actionType === "add") {
      if (reportKind === "engineer") {
    navigate(`/maintenance/engineer-visit/${selectedCustomer}`, {
      state: { selectedSite: selectedCustomer },
    });
  }else if (reportKind === "safety") {
        navigate(
          `/maintenance/safety/${selectedCustomer}?checklist=${checklistType}`
        );
      } else if (reportKind === "service") {
        navigate(`/maintenance/service/${enc(selectedCustomer)}`);
        // navigate(`/maintenance/service/${selectedCustomer}`);
      }
    } else if (actionType === "view") {
      if (reportKind === "engineer") {
        navigate(`/report/engineer/view/${selectedCustomer}/${year}/${month}`);
      } else if (reportKind === "safety") {
        navigate(
          `/report/safety/view/${selectedCustomer}/${year}/${month}?checklist=${checklistType}`
        );
      } else if (reportKind === "service") {
        // navigate(`/report/service/view/${selectedCustomer}/${year}/${month}`);
         navigate(`/report/service/view/${enc(selectedCustomer)}/${year}/${month}`);
      }
    }
    onClose();
  };

  return (
    <>
      <div style={overlayStyle}>
        <div style={boxStyle}>
          <h5>
            {reportKind === "engineer"
              ? "Engineer Visit Report"
              : reportKind === "safety"
              ? "Safety Report"
              : "Service Report"}
          </h5>

          <div className="d-grid gap-2">
            {/* Admins can only view */}
            {isPureAdmin && (
              <button
                className="btn btn-info"
                onClick={() => handleAction("view")}
              >
                View Report
              </button>
            )}

            {/* Technicians / Managers can add/view */}
            {(isTechnician || isTerritorialManager || user) && (
              <>
                <button
                  className="btn btn-success"
                  onClick={() => handleAction("add")}
                >
                  Add Report
                </button>
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
          reportType={reportKind}
          onClose={() => setShowMonthModal(false)}
          onMonthSelected={handleMonthSelected}
        />
      )}
    </>
  );
}
