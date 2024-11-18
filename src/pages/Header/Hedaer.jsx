import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Outlet, useOutletContext } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName } from './../../redux/features/iotData/iotDataSlice';
import { fetchUser, logoutUser } from './../../redux/features/user/userSlice';
import { setSelectedUser } from '../../redux/features/selectedUsers/selectedUserSlice'; 

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Dropdown from 'react-bootstrap/Dropdown';
import DashboardSam from '../Dashboard/DashboardSam';
import axios from 'axios';
import './header.css';
import { API_URL } from '../../utils/apiConfig';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpenNotification, setIsDropdownOpenNotification] = useState(false);
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownAlignment, setDropdownAlignment] = useState('end');
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine ? 'Online' : 'Offline');

  const { userData } = useSelector((state) => state.user);
  const selectedUserId = useSelector((state) => state.selectedUser.userId);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleOnlineStatusChange = () => {
    setOnlineStatus(navigator.onLine ? 'Online' : 'Offline');
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/getallusers`);
        const filteredUsers = response.data.users.filter(user => user.userType === 'user');
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const validateUser = async () => {
      try {
        const response = await dispatch(fetchUser()).unwrap();
        if (!response) navigate('/');
      } catch (error) {
        console.error('Error validating user:', error);
        navigate('/');
      }
    };
    if (!userData) validateUser();
  }, [dispatch, navigate, userData]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userData && userData.validUserOne) {
        try {
          const response = await axios.get(`${API_URL}/api/get-notification-of-user/${userData.validUserOne.userName}`);
          setNotifications(response.data.userNotifications);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };
    fetchNotifications();
  }, [userData]);

  useEffect(() => {
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  const handleDropdownClick = () => {
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - dropdownRect.right;
    const neededSpace = 300;
    setDropdownAlignment(spaceOnRight < neededSpace ? 'start' : 'end');
  };

  const handleUserSelect = (userId) => {
    sessionStorage.setItem('selectedUserId', userId);
    dispatch(setSelectedUser(userId));
    setUserName(userId);
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSignOut = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const savedUserId = sessionStorage.getItem('selectedUserId');
  console.log(savedUserId);

  return (
    <div className="ms-0">
      <div className="mt-4 col-lg-12 ">
        <Navbar expand="lg" className=" header-navbar" style={{ position: 'fixed', top: '0', zIndex: '1000', backgroundColor: 'white' }}>
          <div className="w-100 px-2 d-flex align-items-center justify-content-between">
          <Navbar.Brand href="#home" className="brand-text">
      <span className="d-none d-lg-inline">User ID: </span>
      <span className="text-dark">
        <b>{userData?.validUserOne?.userName || 'Admin Developer'}</b>
        <span className="d-inline ms-2">
          {onlineStatus === 'Online' ? (
            <span className="online">Online</span>
          ) : (
            <span className="offline">Offline</span>
          )}
        </span>
      </span>
    </Navbar.Brand>

            <div className="d-flex">
              <Nav.Link className="me-3" href="#home" onClick={() => setIsDropdownOpenNotification(!isDropdownOpenNotification)}>
                <i className="fa-regular fa-bell fa-1x"></i>
                {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
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

              <Dropdown ref={dropdownRef} className="me-3" onToggle={handleDropdownClick}>
                <Dropdown.Toggle as={Nav.Link} bsPrefix="p-0" id="user-dropdown">
                  <i className="fa-solid fa-user"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu align={dropdownAlignment}>
                  <Dropdown.Item>
                    <img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png" width="100" alt="User Icon" />
                  </Dropdown.Item>
                  <Dropdown.Item>{userData?.validUserOne?.userName || 'Admin-Developer'}</Dropdown.Item>
                  <Dropdown.Item onClick={handleSignOut}>Sign Out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={handleShow} />
            </div>
          </div>
        </Navbar>

        {userData?.validUserOne?.userType !== 'user' && (
          <div className="ms-0 mb-3 " style={{marginTop:'70px'}}>
            <Dropdown show={isDropdownOpen} onToggle={toggleDropdown}>
              <Dropdown.Toggle id="dropdown-basic" style={{ backgroundColor: '#236a80' }}>
                {userName ? `Selected: ${userName}` : 'Select User'}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ maxHeight: '200px' }}>
                <input
                  type="text"
                  placeholder="Search user..."
                  className="form-control"
                  style={{ margin: '10px', width: '90%' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {filteredUsers.length > 0 ? (
                  filteredUsers.slice(0, 4).map((user, index) => (
                    <Dropdown.Item key={index} onClick={() => handleUserSelect(user.userName)}>
                      {user.userName}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No users found</Dropdown.Item>
                )}
                {filteredUsers.length > 4 && (
                  <Dropdown.Item disabled>{`${filteredUsers.length - 4} more users available...`}</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}

        <Outlet context={{ searchTerm: userName, isSearchTriggered: true }} />
        <Outlet />

        <Offcanvas show={show} onHide={handleClose} className="full-screen-offcanvas">
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
