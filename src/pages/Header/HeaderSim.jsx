import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import DashboardSam from '../Dashboard/DashboardSam';
import './headersam.css';
import Dropdown from 'react-bootstrap/Dropdown';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName } from './../../redux/features/iotData/iotDataSlice';
import { fetchUser, logoutUser } from './../../redux/features/user/userSlice';
import { setSelectedUser } from '../../redux/features/selectedUsers/selectedUserSlice'; 
import { toast } from 'react-toastify';

function  HeaderSim() {
  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userName, setUserName] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine ? 'Online' : 'Offline');
  const [users, setUsers] = useState([]);
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
 const handleSignOut = async () => {
    try {
      // Clear session storage
      sessionStorage.removeItem('selectedUserId'); // Remove stored selected user ID
      sessionStorage.clear(); // Optionally clear all session storage
  
      // Dispatch logout action
      await dispatch(logoutUser()).unwrap();
  
      // Clear Redux state for selected user
      dispatch(setSelectedUser(null));
  
      // Clear local state
      setUserName('');
      setUsers([]);
  
      toast.success('Logged out successfully.', { position: 'top-center' });
  
      // Navigate to login page
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out. Please try again.', { position: 'top-center' });
    }
  };
  

  const handleSearch = async (event) => {
    event.preventDefault();
    setSubmittedSearchTerm(searchTerm);
    setSearchStatus('loading');
    setIsSearchTriggered(true);
    try {
      const response = await dispatch(fetchIotDataByUserName(searchTerm)).unwrap();
      setSearchResults(response);
      setSearchStatus('success');
    } catch (error) {
      console.error('Error fetching IoT data:', error);
      setSearchStatus('error');
    }
  };

  return (
    <div className='ms-0'>
      <div className='mt-4 col-lg-12'>
        <Navbar expand="lg" className="mb-4 header-navbarhead">
          <div  className='w-100 px-2 d-flex align-items-center justify-content-between'>
            {/* Left aligned brand */}
            <Navbar.Brand href="#home" className="brand-text">
              <span className="d-none d-lg-inline">User ID : </span>
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
            
            <div className='d-flex'>
              {/* Icons pushed to the right */}
              <div className="d-flex align-items-center icons">
                <Nav.Link className='me-2' href="#home">
                  <i className="fa-regular fa-bell fa-1x"></i>
                </Nav.Link>
                <Dropdown className="">
                  <Dropdown.Toggle as={Nav.Link} bsPrefix="p-0" id="user-dropdown">
                    <i className="fa-solid fa-user"></i>
                  </Dropdown.Toggle>
  
                  <Dropdown.Menu align="end">
                    <Dropdown.Item href="#signout" className='align-items-center justify-content-center d-flex'>
                      <img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png" width={'50px'} alt="" />
                    </Dropdown.Item>
                    <Dropdown.Item href="#signout">Admin-Developer</Dropdown.Item>
                    <Dropdown.Item  onClick={handleSignOut}>Sign Out</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
  
              {/* Hamburger menu */}
              <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={handleShow} />
            </div>
          </div>
        </Navbar>

        {/* Search bar */}
      
        {/* Offcanvas for DashboardSam */}
        <Offcanvas show={show} onHide={handleClose} className="full-screen-offcanvas">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title></Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className='d-flex align-items-center justify-content-center'>
            <DashboardSam />
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </div>
  );
}

export default HeaderSim;
