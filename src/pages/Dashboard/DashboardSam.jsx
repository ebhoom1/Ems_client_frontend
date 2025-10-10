import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./dashboard.css";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../utils/apiConfig";
import wipro from '../../assests/images/wipro.png'
function DashboardSam() {
  const { userData, userType } = useSelector((state) => state.user);
  const validUser = userData?.validUserOne || {};
  // Assuming 'adminType' is the field that holds the username
  const userName = validUser?.adminType;
  const name = validUser?.userName;
  console.log('username', name)

  // Check if the userName is specific for the diesel dashboard
  const isBBRole = name === 'BBUSER' || name === 'BBADMIN';

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

  // Check if the user is an 'admin' and the userName is 'EMBASSY_ADMIN'
  const isEmbassyAdmin = userType === 'admin' && name === 'EMBASSY_ADMIN';

  return (
    <div className="dashboard-sam">
      <div className="navdash">
        <ul className="menu">
          <div className="text-center">
            {logoUrl ? (
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
              <span>Loading logo...</span>
            )}
          </div>
{/*  <div>
  <img src={wipro} alt="" width={'200px'} height={'50px'} className="ms-3" />
</div>  */}
          {/* If user is BBUSER or BBADMIN, show only Fuel Dashboard */}
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
              {userRole === "technician" || userRole === "territorialManager" ? (
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
                      <li className="list active text-center">
                        <a
                          href="/chat"
                          style={{ textDecoration: "none", color: "#ffffff" }}
                        >
                          <span className="title">Chat</span>
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
                          href="/chat"
                          style={{ textDecoration: "none", color: "#ffffff" }}
                        >
                          <span className="title">Chat</span>
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
  );
}

export default DashboardSam;