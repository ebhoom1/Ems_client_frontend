import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import DashboardSam from '../Dashboard/DashboardSam';
import HeaderSim from '../Header/HeaderSim';
import { Button } from 'react-bootstrap';
import { API_URL } from '../../utils/apiConfig';
import './notification.css';

function ViewNotification() {
    const [notifications, setNotifications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Fetch notifications from API on component mount
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/view-notification`);
                const userNotifications = response.data.notification;
                setNotifications(userNotifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                toast.error('Error fetching notifications');
            }
        };
        fetchNotifications();
    }, []);

    // Handle notification search
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    // Filter notifications based on the search term
    const filteredNotifications = notifications.filter((notification) =>
        notification.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.adminID?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle deleting a notification
    const handleDeleteNotification = async (notificationId) => {
        try {
            const res = await axios.delete(`${API_URL}/api/delete-notification/${notificationId}`);
            if (res.status === 200) {
                setNotifications((prevNotifications) =>
                    prevNotifications.filter((notification) => notification._id !== notificationId)
                );
                toast.success('Notification deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    // Handle adding a new notification
    const handleAddNotification = () => {
        navigate('/notification');
    };

    return (
        <div className="container-fluid mb-5">
            <div className="row">
                <div className="col-lg-3 d-none d-lg-block">
                    <DashboardSam />
                </div>
                <div className="col-lg-9 col-12">
                    <div className="row">
                        <div className="col-12">
                            <HeaderSim />
                        </div>
                    </div>
                    <div className="align-items-center justify-content-center d-flex mt-5 mb-4">
                        <Button
                            onClick={handleAddNotification}
                            className="p-3 btn parameterbtn align-items-center justify-content-center d-flex"
                            style={{ border: 'none', color: 'black' }}
                        >
                            <b>Add Notification</b>
                        </Button>
                    </div>

                    <div className="row">
                        <div className="col-12 col-md-12 grid-margin">
                            <div className="col-12 d-flex justify-content-between align-items-center m-3">
                                <h1 className="text-center mt-3">Previous Notification Data</h1>
                            </div>

                            <div className="card last-trips-card mt-2" style={{ overflowX: 'scroll' }}>
                                <div className="card-header p-3 pt-4 d-flex align-items-center search-container m-3">
                                    <input
                                        type="text"
                                        placeholder="Search by Username or Admin ID"
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
                                                <th>Date of Notification Added</th>
                                                <th>Time of Notification Added</th>
                                                <th>Admin ID / User ID</th>
                                                <th>Message</th>
                                                <th>Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredNotifications.length > 0 ? (
                                                filteredNotifications.map((notification, index) => (
                                                    <tr key={index}>
                                                        <td>{notification.dateOfNotificationAdded}</td>
                                                        <td>{notification.timeOfNotificationAdded}</td>
                                                        <td>{notification.adminID || notification.userName}</td>
                                                        <td>{notification.message}</td>
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
                                                    <td colSpan="5" className="text-center">
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
