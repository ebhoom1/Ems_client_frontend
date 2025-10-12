import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardSam from "../Dashboard/DashboardSam";
import HeaderSim from "../Header/Hedaer"; // Fixed typo 'Hedaer' to 'Header'
import AddEquipment from "./AddEquipment";
import EquipmentList from "./EquipmentList";
import AdminServiceRequests from "./AdminServiceRequests";
import ServiceHistory from "./ServiceHistory";
import ReportFault from "./ReportFault";
import { API_URL } from "../../utils/apiConfig"; // Make sure this path is correct
import wipro from "../../assests/images/wipro.png"; // Correct path to wipro logo

const Services = () => {
  const { userData } = useSelector((state) => state.user);
  const userType = userData?.validUserOne?.userType;
  const currentUserName = userData?.validUserOne?.userName;
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const defaultTabFromUrl = searchParams.get("tab");

  const initialTab =
    defaultTabFromUrl || (userType === "admin" ? "adminView" : "reportFault");
  const [selectedTab, setSelectedTab] = useState(initialTab);

  // --- START: MODIFICATIONS FOR MODAL ---
  const [showDailyLogModal, setShowDailyLogModal] = useState(false); // State to control modal visibility
  const [modalUsers, setModalUsers] = useState([]);
  const [selectedModalUser, setSelectedModalUser] = useState("");
  // --- END: MODIFICATIONS FOR MODAL ---

  useEffect(() => {
    // This effect fetches the list of users for the admin's daily log modal.
    const fetchUsers = async () => {
      try {
        let usersToShow = [];
        if (userData?.validUserOne?.userName === "admin1_001") {
          // Special case for admin1_001 to only show RMZLTD
          usersToShow = ["RMZLTD"];
        } else {
          // For other admins, fetch all users and extract their usernames
          const res = await fetch(`${API_URL}/api/get-users`);
          const body = await res.json();
          // Ensure we get a consistent array of strings (usernames)
          usersToShow = (body.users || []).map(user => user.userName);
        }
        setModalUsers(usersToShow);
      } catch (error) {
        toast.error("Error fetching users for modal");
      }
    };
    // Only run this logic if the logged-in user is an admin
    if (userType === "admin") {
      fetchUsers();
    }
  }, [userData, userType]);


  const renderTabs = () => {
    const tabStyle = (tabKey) =>
      selectedTab === tabKey
        ? { color: "#236a80", fontWeight: "bold" }
        : { color: "black" };

    const adminNav = (
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className="nav-link"
            style={tabStyle("adminView")}
            onClick={() => setSelectedTab("adminView")}
          >
            Admin Service Requests
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link"
            style={tabStyle("serviceHistory")}
            onClick={() => setSelectedTab("serviceHistory")}
          >
            Service History
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link"
            style={tabStyle("addEquipment")}
            onClick={() => setSelectedTab("addEquipment")}
          >
            Add Equipment
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link"
            style={tabStyle("equipmentList")}
            onClick={() => setSelectedTab("equipmentList")}
          >
            Equipment List
          </button>
        </li>
      </ul>
    );

    const userNav = (
      <ul className="nav nav-tabs mb-3 mt-3">
        <li className="nav-item">
          <button
            className="nav-link"
            style={tabStyle("addEquipment")}
            onClick={() => setSelectedTab("addEquipment")}
          >
            Add Equipment
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link"
            style={tabStyle("equipmentList")}
            onClick={() => setSelectedTab("equipmentList")}
          >
            Equipment List
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link"
            style={tabStyle("reportFault")}
            onClick={() => setSelectedTab("reportFault")}
          >
            Report Fault
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link"
            style={tabStyle("serviceHistory")}
            onClick={() => setSelectedTab("serviceHistory")}
          >
            Service History
          </button>
        </li>
      </ul>
    );

    return userType === "admin" ? adminNav : userNav;
  };

  // --- START: MODIFIED DAILY LOG CLICK HANDLER ---
  const handleDailyLogClick = () => {
    if (userType === "admin") {
      // For any admin, show the modal to select a user
      setShowDailyLogModal(true);
    } else {
      // For non-admins, navigate directly to their own daily log
      navigate("/dailylogs");
    }
  };
  // --- END: MODIFIED DAILY LOG CLICK HANDLER ---

  const renderContent = () => {
    switch (selectedTab) {
      case "adminView":
        return <AdminServiceRequests />;
      case "serviceHistory":
        return <ServiceHistory />;
      case "addEquipment":
        return <AddEquipment />;
      case "equipmentList":
        return <EquipmentList />;
      case "reportFault":
        return (
          <ReportFault
            equipmentList={[]}
            onFaultReported={() => toast.success("Fault reported")}
            defaultUsername={userType !== "admin" ? currentUserName : undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: "white" }}>
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <HeaderSim />
            </div>
            <div className="col-12" style={{ marginTop: "80px" }}>
              {(userData?.validUserOne?.userName === "admin1_001" ||
                userData?.validUserOne?.userName === "CONTI" ||
                currentUserName === "CONTI") && (
                <div className="d-flex justify-content-end">
                  <img src={wipro} alt="Logo" width={"220px"} height={"70px"} />
                </div>
              )}
              <div className="row gx-3 gy-2 justify-content-center">
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <button
                    onClick={() => navigate("/inventory")}
                    className="btn btn-outline-success w-100"
                  >
                    Inventory
                  </button>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <button
                    onClick={() => navigate("/services")}
                    className="btn btn-success w-100" // Set to active since we are on the services page
                  >
                    Services
                  </button>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <button
                    onClick={handleDailyLogClick} // Use the updated handler
                    className="btn btn-outline-success w-100"
                  >
                    Daily Log
                  </button>
                </div>
              </div>
            </div>

            <h3 className="text-center mt-3">SERVICES</h3>
            <div className="col-12 m-3">{renderTabs()}</div>
            <div className="col-12">{renderContent()}</div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- START: MODIFIED MODAL RENDERING --- */}
      {showDailyLogModal && (
        <div
          className="modal show"
          tabIndex={-1}
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select User for Daily Log</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDailyLogModal(false)} // Close modal
                />
              </div>
              <div className="modal-body">
                <select
                  className="form-select"
                  value={selectedModalUser}
                  onChange={(e) => setSelectedModalUser(e.target.value)}
                >
                  <option value="">-- Select a user --</option>
                  {modalUsers.map((username) => (
                    <option key={username} value={username}>
                      {username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-danger"
                  onClick={() => setShowDailyLogModal(false)} // Close modal
                >
                  Cancel
                </button>
                <button
                  style={{ backgroundColor: "#236a80", color: "#fff" }}
                  className="btn"
                  disabled={!selectedModalUser}
                  onClick={() => {
                    navigate(`/admin/report/${selectedModalUser}`);
                    setShowDailyLogModal(false); // Close modal after selection
                  }}
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* --- END: MODIFIED MODAL RENDERING --- */}
    </div>
  );
};

export default Services;