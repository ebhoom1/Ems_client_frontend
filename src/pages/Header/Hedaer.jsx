import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchIotDataByUserName } from "./../../redux/features/iotData/iotDataSlice";
import { fetchUser, logoutUser } from "./../../redux/features/user/userSlice";
import { setSelectedUser } from "../../redux/features/selectedUsers/selectedUserSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import Dropdown from "react-bootstrap/Dropdown";
import DashboardSam from "../Dashboard/DashboardSam";
import axios from "axios";
import "./header.css";
import { API_URL } from "../../utils/apiConfig";

// Ensure the sound file exists at the path specified.
import notificationSound from "../../assests/notification.mp3";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpenNotification, setIsDropdownOpenNotification] =
    useState(false);
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownAlignment, setDropdownAlignment] = useState("end");
  const [onlineStatus, setOnlineStatus] = useState(
    navigator.onLine ? "Online" : "Offline"
  );

  const { userData } = useSelector((state) => state.user);

  const selectedUserId = useSelector((state) => state.selectedUser.userId);

  // Create an audio instance for the notification sound.
  const audioRef = useRef(new Audio(notificationSound));
  // Keep track of previous notifications count.
  const prevNotificationsCount = useRef(notifications.length);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleOnlineStatusChange = () => {
    setOnlineStatus(navigator.onLine ? "Online" : "Offline");
  };

  // Fetch users data.
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const currentUser = userData?.validUserOne;
      if (!currentUser) return;

      let response;

      if (currentUser.adminType === "EBHOOM") {
        response = await axios.get(`${API_URL}/api/getallusers`);
      } else {
        const url = `${API_URL}/api/get-users-by-creator/${currentUser._id}`;
        response = await axios.get(url);
      }

      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  fetchUsers();
}, [userData]);


  console.log(users);

  useEffect(() => {
    const validateUser = async () => {
      try {
        const response = await dispatch(fetchUser()).unwrap();
        if (!response) navigate("/");
      } catch (error) {
        console.error("Error validating user:", error);
        navigate("/");
      }
    };
    if (!userData) validateUser();
  }, [dispatch, navigate, userData]);

  // Define a function to fetch notifications.
  const fetchNotifications = async () => {
    if (userData && userData.validUserOne) {
      try {
        const response = await axios.get(
          `${API_URL}/api/get-notification-of-user/${userData.validUserOne.userName}`
        );
        setNotifications(response.data.userNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
  };

  // Poll for notifications every 60 seconds.
  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // Change the interval as needed.
    return () => clearInterval(intervalId);
  }, [userData]);

  // Play a sound if new notifications have been added.
  useEffect(() => {
    if (notifications.length > prevNotificationsCount.current) {
      audioRef.current
        .play()
        .catch((error) => console.error("Audio play prevented:", error));
    }
    prevNotificationsCount.current = notifications.length;
  }, [notifications]);

  useEffect(() => {
    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  const handleDropdownClick = () => {
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - dropdownRect.right;
    const neededSpace = 300;
    setDropdownAlignment(spaceOnRight < neededSpace ? "start" : "end");
  };

  const handleUserSelect = (userId) => {
    sessionStorage.setItem("selectedUserId", userId);
    dispatch(setSelectedUser(userId));
    setUserName(userId);
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSignOut = async () => {
    try {
      sessionStorage.removeItem("selectedUserId");
      sessionStorage.clear();
      await dispatch(logoutUser()).unwrap();
      dispatch(setSelectedUser(null));
      setUserName("");
      setUsers([]);
      toast.success("Logged out successfully.", { position: "top-center" });
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.", {
        position: "top-center",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.userType === "user" &&
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const savedUserId = sessionStorage.getItem("selectedUserId");
  console.log(savedUserId);

  return (
    <div className="ms-0">
      <div className="mt-4 col-lg-12">
        <Navbar
          expand="lg"
          className="header-navbar"
          style={{
            position: "fixed",
            top: "0",
            zIndex: "1000",
            backgroundColor: "white",
          }}
        >
          <div className="w-100 px-2 d-flex align-items-center justify-content-between">
            <Navbar.Brand href="#home" className="brand-text">
              <span className="d-none d-lg-inline">Username: </span>
              <span className="text-dark">
                <b style={{fontSize:'19px'}}>{userData?.validUserOne?.userName || "Admin Developer"}</b>
                <span className="d-inline ms-2">
                  {onlineStatus === "Online" ? (
                    <span className="online"   style={{ fontSize: "10px" }}>Online</span>
                  ) : (
                    <span className="offline">Offline</span>
                  )}
                </span>
              </span>
            </Navbar.Brand>
            <div className="d-flex align-items-center">
              {/* ✅ Show selected company name */}
              {userData?.validUserOne?.userType !== "user" &&
                sessionStorage.getItem("selectedUserId") && (
                  <div
                    className="me-4 mt-2 text-dark fw-semibold"
                    style={{ fontSize: "12px" }}
                  >
                   <b> {users.find(
                      (u) =>
                        u.userName === sessionStorage.getItem("selectedUserId")
                    )?.companyName || ""}</b>
                  </div>
                )}

              <Nav.Link
                className="me-3 mt-2"
                href="#home"
                onClick={() =>
                  setIsDropdownOpenNotification(!isDropdownOpenNotification)
                }
              >
                <i className="fa-regular fa-bell fa-1x"></i>
                {notifications.length > 0 && (
                  <span className="notification-badge">
                    {notifications.length}
                  </span>
                )}
              </Nav.Link>
              {isDropdownOpenNotification && (
                <div className="dropdown-container-notification">
                  {notifications.map((notification, index) => (
                    <div key={index} className="notification-item">
                      <h5>{notification.subject}</h5>
                      <p>{notification.message}</p>
                      <p>{notification.dateOfNotificationAdded}</p>
                    </div>
                  ))}
                </div>
              )}
              <Dropdown
                ref={dropdownRef}
                className="me-2 mt-2"
                onToggle={handleDropdownClick}
              >
                <Dropdown.Toggle
                  as={Nav.Link}
                  bsPrefix="p-0"
                  id="user-dropdown"
                >
                  <i className="fa-solid fa-user"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu
                  align="end"
                  style={{
                    zIndex: 1100,
                    position: "absolute",
                    right: 0,
                    minWidth: "150px",
                    overflow: "visible",
                  }}
                  className="user-dropdown-menu"

                >
                  <Dropdown.Item>
                    <img
                      src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png"
                      width="100"
                      alt="User Icon"
                    />
                  </Dropdown.Item>
                  <Dropdown.Item>
                    {userData?.validUserOne?.userName || "Admin-Developer"}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleSignOut}>
                    Sign Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Navbar.Toggle
                aria-controls="basic-navbar-nav"
                onClick={handleShow}
              />
            </div>
          </div>
        </Navbar>

        {userData?.validUserOne?.userType !== "user" && (
          <div className="ms-0 mb-3" style={{ marginTop: "70px" }}>
            <Dropdown show={isDropdownOpen} onToggle={toggleDropdown}>
              <Dropdown.Toggle
                id="dropdown-basic"
                style={{ backgroundColor: "#236a80", border: "none" }}
              >
                {userName ? `Selected: ${userName}` : "Select User"}
              </Dropdown.Toggle>
              <Dropdown.Menu
                style={{
                  maxHeight: "200px",
                  overflowY: "scroll",
                  width: "300px",
                }}
              >
                <input
                  type="text"
                  placeholder="Search by user or company..."
                  className="form-control"
                  style={{
                    margin: "10px auto",
                    width: "90%",
                    padding: "8px",
                    borderRadius: "5px",
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                />
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <Dropdown.Item
                      key={index}
                      onClick={() => handleUserSelect(user.userName)}
                      style={{
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                      title={`${user.userName}: ${user.companyName}`}
                    >
                      {user.userName}: {user.companyName}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>
                    No users or companies found
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}

        <Outlet context={{ searchTerm: userName, isSearchTriggered: true }} />
        <Outlet />

        <Offcanvas
          show={show}
          onHide={handleClose}
          className="full-screen-offcanvas"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title />
          </Offcanvas.Header>
          <Offcanvas.Body className="d-flex align-items-center justify-content-center">
            <DashboardSam />
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </div>
  );
}

export default Header;
