import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import DashboardSam from '../Dashboard/DashboardSam';
import HeaderSim from '../Header/HeaderSim';
import { Button } from 'react-bootstrap';
import { API_URL } from '../../utils/apiConfig';
import './notification.css';
import notificationSound from '../../assests/notification.mp3';

function ViewNotification() {
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Create an audio instance for the sound effect.
  const audioRef = useRef(new Audio(notificationSound));
  // Track the previous number of notifications.
  const prevNotificationCount = useRef(0);

  // Fetch notifications from the API
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/view-notification`);
      console.log("Fetched notifications:", response.data);
      // If your API returns { success, message, notification: [...] }
      // then the array is in response.data.notification
      const userNotifications = response.data.notification || [];
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error fetching notifications');
    }
  };

  // Poll notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Play sound if new notifications have been added
  useEffect(() => {
    if (notifications.length > prevNotificationCount.current) {
      audioRef.current.play().catch((err) => console.error('Audio play error:', err));
    }
    prevNotificationCount.current = notifications.length;
  }, [notifications]);

  // Handle search input
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Show all if no search term; otherwise filter by userName, adminID, subject, or message
  const filteredNotifications = notifications.filter((notification) => {
    if (!searchTerm) return true; // No searchTerm => show all
    const term = searchTerm.toLowerCase();
    const userName = notification.userName?.toLowerCase() || '';
    const adminID = notification.adminID?.toLowerCase() || '';
    const subject = notification.subject?.toLowerCase() || '';
    const message = notification.message?.toLowerCase() || '';
    return (
      userName.includes(term) ||
      adminID.includes(term) ||
      subject.includes(term) ||
      message.includes(term)
    );
  });

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      const res = await axios.delete(`${API_URL}/api/delete-notification/${notificationId}`);
      if (res.status === 200) {
        setNotifications((prev) =>
          prev.filter((notification) => notification._id !== notificationId)
        );
        toast.success('Notification deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchNotifications();
    toast.info("Notifications refreshed");
  };

  // Navigate to "Add Notification" page (optional)
  const handleAddNotification = () => {
    navigate('/notification');
  };

  return (
    <div className="container-fluid mb-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>

        {/* Main Content */}
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <HeaderSim />
            </div>
          </div>

          {/* Buttons */}
          <div className="align-items-center justify-content-center d-flex mt-5 mb-4">
            <Button
              onClick={handleAddNotification}
              className="p-3 btn parameterbtn align-items-center justify-content-center d-flex"
              style={{ border: 'none', color: 'black' }}
            >
              <b>Add Notification</b>
            </Button>
            <Button
              onClick={handleRefresh}
              className="p-3 btn parameterbtn align-items-center justify-content-center d-flex ms-2"
              style={{ border: 'none', color: 'black' }}
            >
              <b>Refresh</b>
            </Button>
          </div>

          {/* Notification Table */}
          <div className="row">
            <div className="col-12 col-md-12 grid-margin">
              <div className="col-12 d-flex justify-content-between align-items-center m-3">
                <h1 className="text-center mt-3">Previous Notification Data</h1>
              </div>

              <div className="card last-trips-card mt-2" style={{ overflowX: 'auto' }}>
                <div className="card-header p-3 pt-4 d-flex align-items-center search-container m-3">
                  <input
                    type="text"
                    placeholder="Search by Username, Admin ID, Subject, or Message"
                    className="p-2 search-input"
                    style={{ borderRadius: '10px' }}
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <button className="btn btn-outline-primary ms-2 search-button">
                    Search
                  </button>
                </div>

                <div className="card-body">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Date Added</th>
                        <th>Time Added</th>
                        <th>Admin ID / User ID</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                          <tr key={notification._id}>
                            {/* Show 'N/A' if the date/time fields are missing */}
                            <td>{notification.dateOfNotificationAdded || 'N/A'}</td>
                            <td>{notification.timeOfNotificationAdded || 'N/A'}</td>
                            <td>{notification.adminID || notification.userName || 'N/A'}</td>
                            <td>{notification.subject || 'N/A'}</td>
                            <td>{notification.message || 'N/A'}</td>
                            <td>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteNotification(notification._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">
                            No notifications found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ViewNotification;
