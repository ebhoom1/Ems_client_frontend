import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { fetchUser, logoutUser } from './../../redux/features/user/userSlice';
import { fetchIotDataByUserName } from './../../redux/features/iotData/iotDataSlice'; 
import axios from 'axios';
import './index.css';
import { API_URL } from '../../utils/apiConfig';

const PrivateLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData, loading, error } = useSelector((state) => state.user);
  const [isDropdownOpenNotification, setIsDropdownOpenNotification] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine ? 'Online' : 'Offline');
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);

  useEffect(() => {
    const validateUser = async () => {
      try {
        const response = await dispatch(fetchUser()).unwrap();
        console.log('User Data:', response);
        if (!response) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error Validating user:', error);
        navigate('/');
      }
    };

    if (!userData) {
      validateUser();
    }

    const handleOnlineStatusChange = () => {
      setOnlineStatus(navigator.onLine ? 'Online' : 'Offline');
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container-scroller">
      <div className="container-fluid page-body-wrapper">
        <Outlet context={{ searchTerm: submittedSearchTerm, searchStatus, handleSearch, isSearchTriggered }} />
      </div>
    </div>
  );
};

export default PrivateLayout;
