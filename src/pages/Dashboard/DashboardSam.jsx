import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./dashboard.css";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../utils/apiConfig";
import wipro from "../../assests/images/wiprologonew.png";
import { Modal, Button } from "react-bootstrap"; // Import Modal and Button

function DashboardSam() {
  const { userData, userType } = useSelector((state) => state.user);
  const validUser = userData?.validUserOne || {};
  const navigate = useNavigate(); // Hook for navigation
  console.log("userType:",userType)

  // --- State for the Modal ---
  const [showReportModal, setShowReportModal] = useState(false);
  const handleCloseReportModal = () => setShowReportModal(false);
  const handleShowReportModal = (e) => {
    e.preventDefault(); // Prevent the <a> tag's default behavior
    setShowReportModal(true);
  };

  // --- State for Button Hover Effects ---
  const [isPrimaryHovered, setIsPrimaryHovered] = useState(false);
  const [isSecondaryHovered, setIsSecondaryHovered] = useState(false);

  // --- Navigation Handler ---
  const handleModalClick = (path) => {
    navigate(path);
    handleCloseReportModal();
  };

  // Assuming 'adminType' is the field that holds the username
  const userName = validUser?.adminType;
  const name = validUser?.userName;
  console.log("username", name);

  // Check if the userName is specific for the diesel dashboard
  const isBBRole = name === "BBUSER" || name === "BBADMIN";
  const isSpecialUser = name === "admin1_001" || name === "CONTI";
  console.log("isSpecialUser", isSpecialUser);

  // Derive the user role from the user data
  const userRole = validUser.isTechnician
    ? "technician"
    : validUser.isTerritorialManager
    ? "territorialManager"
    : validUser.isOperator
    ? "operator"
    : "other";

  const [logoUrl, setLogoUrl] = useState(null);

  // Fetch the logo when the component mounts or when userName changes
  useEffect(() => {
    const fetchLogo = async () => {
      if (userName) {
        try {
          const response = await axios.get(`${API_URL}/api/logo/${userName}`);
          if (response.data?.data?.length > 0) {
            // Sort logos by createdAt to get the latest one
            const sorted = response.data.data.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setLogoUrl(sorted[0].logoUrl);
          }
        } catch (error) {
          console.error("Logo fetch failed:", error);
          toast.error("Failed to fetch logo", { position: "top-center" });
        }
      }
    };

    fetchLogo();
  }, [userName]);

  const heading = userName || "EBHOOM";

  // --- Style Objects for Modal ---
  const modalHeaderStyle = {
    backgroundColor: "#236a80",
    color: "white",
    borderBottom: "none",
    padding: "1rem 1.5rem",
  };

  const modalTitleStyle = {
    fontSize: "1.1rem", // Smaller font
    fontWeight: "600",
  };

  const modalBodyStyle = {
    padding: "1.5rem 2rem 2rem 2rem", // More padding
  };

  const buttonStylePrimary = {
    backgroundColor: "#236a80",
    border: "1px solid #236a80",
    fontSize: "0.9rem", // Smaller font
    width: "100%",
    padding: "12px",
    fontWeight: "600",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
  };

  const buttonStyleSecondary = {
    backgroundColor: "#ffffff",
    border: "2px solid #236a80",
    color: "#236a80",
    fontSize: "0.9rem", // Smaller font
    width: "100%",
    padding: "12px",
    fontWeight: "600",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  };

  const footerCloseButton = {
    fontSize: "0.9rem",
    color: "#555",
    border: "none",
    backgroundColor: "#f0f0f0",
  };

  return (
    <>
      <div className="dashboard-sam">
        <div className="navdash">
          <ul className="menu">
            <div className="text-center">
              {isSpecialUser ? (
                <img
                  src={logoUrl}
                  alt="Wipro Water Logo"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "150px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                  }}
                />
              ) : logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${userName} Logo`}
                  style={{
                    maxWidth: "120px",
                    maxHeight: "120px",
                    marginBottom: "10px",
                  }}
                />
              ) : (
                <span style={{ color: "#fff", fontSize: "12px" }}>
                  Loading logo...
                </span>
              )}
            </div>

            {isBBRole ? (
              <li className="list active text-center">
                <a
                  href="/diesel"
                  style={{ textDecoration: "none", color: "#ffffff" }}
                >
                  <span className="title">Fuel Dashboard</span>
                </a>
              </li>
            ) : (
              <>
                {/* Original Menu for all other users */}
                <li className="list active text-center">
                  <a
                    href="/water"
                    style={{ textDecoration: "none", color: "#ffffff" }}
                  >
                    <span className="title">Dashboard</span>
                  </a>
                </li>

                {/* Show limited menu for technician or territorial manager */}
                {userRole === "technician" ||
                userRole === "territorialManager" ? (
                  <>
                    <li className="list active text-center">
                      <a
                        href="/view-notification"
                        style={{ textDecoration: "none", color: "#ffffff" }}
                      >
                        <span className="title">Notification</span>
                      </a>
                    </li>
                    <li className="list active text-center">
                      <a
                        href="/inventory"
                        style={{ textDecoration: "none", color: "#ffffff" }}
                      >
                        <span className="title">Inventory & Service</span>
                      </a>
                    </li>
                    <li className="list active text-center">
                      <a
                        href="/services?tab=equipmentList"
                        style={{ textDecoration: "none", color: "#ffffff" }}
                      >
                        <span className="title">Assigned Work</span>
                      </a>
                    </li>
                  </>
                ) : null}

                {/* Show menu for operator */}
                {userRole === "operator" ? (
                  <>
                    <li className="list active text-center">
                      <a
                        href="/view-notification"
                        style={{ textDecoration: "none", color: "#ffffff" }}
                      >
                        <span className="title">Notification</span>
                      </a>
                    </li>
                    {/* --- MODIFIED LINK --- */}
                    <li className="list active text-center">
                      <a
                        href="#"
                        onClick={handleShowReportModal}
                        style={{ textDecoration: "none", color: "#ffffff" }}
                      >
                        <span className="title">Monthly Report</span>
                      </a>
                    </li>
                    <li className="list active text-center">
                      <a
                        href="/autonerve"
                        style={{ textDecoration: "none", color: "#ffffff" }}
                      >
                        <span className="title">AutoNerve</span>
                      </a>
                    </li>
                    <li className="list active text-center">
                      <a
                        href="/inventory"
                        style={{ textDecoration: "none", color: "#ffffff" }}
                      >
                        <span className="title">Inventory & Service</span>
                      </a>
                    </li>
                  </>
                ) : null}

                {/* Show full menu for admin or user (non-technician/territorial/operator) */}
                {userRole === "other" && (
                  <>
                    {(userType === "admin" || userType === "super_admin") && (
                      <>
                        <li className="list active text-center">
                          <a
                            href="/manage-user"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Manage Users</span>
                          </a>
                        </li>
                        <li className="list active text-center">
                          <a
                            href="/assign-technician"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Assign Users</span>
                          </a>
                        </li>
                        <li className="list active text-center">
                          <a
                            href="/diesel"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Fuel Dashboard</span>
                          </a>
                        </li>
                        <li className="list active text-center">
                          <a
                            href="/view-notification"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Notification</span>
                          </a>
                        </li>
                        {/* --- MODIFIED LINK --- */}
                        <li className="list active text-center">
                          <a
                            href="#"
                            onClick={handleShowReportModal}
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Monthly Report</span>
                          </a>
                        </li>
                        {isSpecialUser ? (
                          <li className="list active text-center">
                            <a
                              href="/pandd"
                              style={{
                                textDecoration: "none",
                                color: "#ffffff",
                              }}
                            >
                              <span className="title">UPW</span>
                            </a>
                          </li>
                        ) : (
                          <li className="list active text-center">
                            <a
                              href="/chat"
                              style={{
                                textDecoration: "none",
                                color: "#ffffff",
                              }}
                            >
                              <span className="title">Chat</span>
                            </a>
                          </li>
                        )}

                        <li className="list active text-center">
                          <a
                            href="/inventory"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Inventory & Service</span>
                          </a>
                        </li>
                        <li className="list active text-center">
                          <a
                            href="/autonerve"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">AutoNerve</span>
                          </a>
                        </li>
                        <li className="list active text-center">
                          <a
                            href="/attendence"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Attendence</span>
                          </a>
                        </li>
                        <li className="list active text-center">
                          <a
                            href="/live-emmision"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Live Emission Video</span>
                          </a>
                        </li>
                      </>
                    )}

                    {userType === "user" && (
                      <>
                        <li className="list active text-center">
                          <a
                            href="/view-report"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Report</span>
                          </a>
                        </li>
                        <li className="list active text-center">
                          <a
                            href="/diesel"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Fuel Dashboard</span>
                          </a>
                        </li>
                        <li className="list active text-center">
                          <a
                            href="/download"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Download</span>
                          </a>
                        </li>
                        {/* --- MODIFIED LINK --- */}
                        <li className="list active text-center">
                          <a
                            href="#"
                            onClick={handleShowReportModal}
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Monthly Report</span>
                          </a>
                        </li>
                        {isSpecialUser ? (
                          <li className="list active text-center">
                            <a
                              href="/pandd"
                              style={{
                                textDecoration: "none",
                                color: "#ffffff",
                              }}
                            >
                              <span className="title">UPW</span>
                            </a>
                          </li>
                        ) : (
                          <li className="list active text-center">
                            <a
                              href="/chat"
                              style={{
                                textDecoration: "none",
                                color: "#ffffff",
                              }}
                            >
                              <span className="title">Chat</span>
                            </a>
                          </li>
                        )}
                        <li className="list active text-center">
                          <a
                            href="/inventory"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Inventory & Service</span>
                          </a>
                        </li>
                        <li className="list active text-center">
                          <a
                            href="/transactions"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Payment</span>
                          </a>
                        </li>
                        <li className="list active text-center">
                          <a
                            href="/live-emmision"
                            style={{ textDecoration: "none", color: "#ffffff" }}
                          >
                            <span className="title">Live Emission Video</span>
                          </a>
                        </li>
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {/* Common Account link for all users */}
            <li className="list active text-center">
              <a
                href="/account"
                style={{ textDecoration: "none", color: "#ffffff" }}
              >
                <span className="title">Account</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* --- STYLED MODAL COMPONENT --- */}
      <Modal
        show={showReportModal}
        onHide={handleCloseReportModal}
        centered
        dialogClassName="modal-90w"
      >
        <Modal.Header style={modalHeaderStyle} closeButton>
          <Modal.Title style={modalTitleStyle}>Select Report Type</Modal.Title>
        </Modal.Header>

        <Modal.Body style={modalBodyStyle}>
          <div className="d-grid gap-3">
            <Button
              style={
                isPrimaryHovered
                  ? {
                      ...buttonStylePrimary,
                      opacity: 0.85,
                      transform: "scale(1.02)",
                    }
                  : buttonStylePrimary
              }
              onMouseEnter={() => setIsPrimaryHovered(true)}
              onMouseLeave={() => setIsPrimaryHovered(false)}
              onClick={() => handleModalClick("/monthly-report")}
            >
              {userType === "admin"
                ? "View PH & MLSS Reading"
                : "Add PH & MLSS Reading"}
            </Button>
            <Button
              style={
                isSecondaryHovered
                  ? {
                      ...buttonStyleSecondary,
                      backgroundColor: "#f8f9fa",
                      transform: "scale(1.02)",
                    }
                  : buttonStyleSecondary
              }
              onMouseEnter={() => setIsSecondaryHovered(true)}
              onMouseLeave={() => setIsSecondaryHovered(false)}
              onClick={() => handleModalClick("/inlet-outlet")}
            >
              {userType === "admin"
                ? "View Inlet & Outlet Reading"
                : "Add Inlet & Outlet Reading"}
            </Button>
          </div>
        </Modal.Body>

        <Modal.Footer
          style={{ borderTop: "none", padding: "0 1.5rem 1rem 1.5rem" }}
        >
          <Button style={footerCloseButton} onClick={handleCloseReportModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DashboardSam;
