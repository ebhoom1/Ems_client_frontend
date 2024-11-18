import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';

function Notification() {
    const [validUserData, setValidUserData] = useState(null);
    const [notificationData, setNotificationData] = useState({
        adminID: "",
        adminName: "",
        dateOfCalibrationAdded: new Date().toISOString().slice(0, 10), // Initialize with current date
        timeOfCalibrationAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }), 
        message: "",
    });
    
    const navigate = useNavigate();

    // Fetching valid user data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("userdatatoken");
                const res = await axios.get(`${API_URL}/api/validuser`, {
                    headers: {
                        'Content-Type': "application/json",
                        'Authorization': token,
                        Accept: 'application/json'
                    },
                    withCredentials: true
                });
                const data = res.data;
                if (data.status === 201) {
                    setValidUserData(data.validUserOne);
                    setNotificationData((prevData) => ({
                        ...prevData,
                        adminID: data.validUserOne.userName,
                        adminName: data.validUserOne.fname
                    }));
                } else {
                    console.error("Error fetching user data from Notification");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchData();
    }, []);

    // Handle form inputs
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNotificationData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (notificationData.message === '') {
            toast.warning('Please add the Notification Message', {
                position: "top-center"
            });
        } else {
            let notificationDataToSend = {
                ...notificationData,
                adminID: validUserData.userName,
                adminName: validUserData.fname
            };
            try {
                const res = await axios.post(`${API_URL}/api/add-notificaiton`, notificationDataToSend);
                if (res.status === 201) {
                    const shouldSave = window.confirm("Are you sure to add this notification?");
                    if (shouldSave) {
                        setNotificationData({
                            adminID: "",
                            adminName: "",
                            dateOfCalibrationAdded: "",
                            timeOfCalibrationAdded: "",
                            message: "",
                        });
                        toast.success("Notification sent successfully");
                        setTimeout(() => {
                            navigate('/view-notification');
                        }, 2000);
                    }
                }
            } catch (error) {
                console.error('Notification send error:', error);
                toast.error('An error occurred');
            }
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <div className="col-lg-3 d-none d-lg-block">
                    <DashboardSam />
                </div>

                {/* Main content */}
                <div className="col-lg-9 col-12">
                    <div className="row">
                        <div className="col-12">
                            <Hedaer />
                        </div>
                    </div>

                    <div className="row" style={{ overflowX: 'hidden' }}>
                        <div className="col-12 col-md-12 grid-margin">
                            <div className="col-12 d-flex justify-content-center align-items-center m-2 text-center">
                                <h1 className="text-center mt-1">Notification Added By</h1>
                            </div>
                            <div className="card m-1">
                                <div className="card-body">
                                    <form className=" calibcard" onSubmit={handleSubmit}> 
                                        <div className="row">
                                            {/* User ID */}
                                            <div className="col-lg-6 col-md-6 mb-4">
                                                <div className="form-group">
                                                    <label className="form-label">User ID</label>
                                                    <input
                                                        type="text"
                                                        value={validUserData ? validUserData.userName : ""}
                                                        className="form-control"
                                                        readOnly
                                                        style={{ padding: '15px', borderRadius: '10px' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Date */}
                                            <div className="col-lg-6 col-md-6 mb-4">
                                                <div className="form-group">
                                                    <label className="form-label">Date of Notification Added</label>
                                                    <input
                                                        type="date"
                                                        value={notificationData.dateOfCalibrationAdded}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                        name="dateOfCalibrationAdded"
                                                        style={{ padding: '15px', borderRadius: '10px' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Time */}
                                            <div className="col-lg-6 col-md-6 mb-4">
                                                <div className="form-group">
                                                    <label className="form-label">Time of Notification Added</label>
                                                    <input
                                                        type="text"
                                                        value={notificationData.timeOfCalibrationAdded}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                        name="timeOfCalibrationAdded"
                                                        style={{ padding: '15px', borderRadius: '10px' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Username */}
                                            <div className="col-lg-6 col-md-6 mb-4">
                                                <div className="form-group">
                                                    <label className="form-label">User Name</label>
                                                    <input
                                                        type="text"
                                                        value={validUserData ? validUserData.fname : ""}
                                                        className="form-control"
                                                        readOnly
                                                        style={{ padding: '15px', borderRadius: '10px' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Notification Message */}
                                            <div className="col-lg-12 col-md-12 mb-4">
                                                <div className="form-group">
                                                    <label className="form-label">Notification Message</label>
                                                    <textarea
                                                        type="text"
                                                        value={notificationData.message}
                                                        onChange={handleInputChange}
                                                        name="message"
                                                        placeholder="Enter Notification Message"
                                                        className="form-control"
                                                        style={{ padding: '15px', borderRadius: '10px' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <button type="submit" className="btn" style={{ backgroundColor: '#236a80', color: 'white' }}>
                                            Add Notification
                                        </button>
                                        <button type="button" onClick={() => navigate('/view-notification')} className="btn btn-danger ms-1">
                                            Cancel
                                        </button>
                                    </form>
                                    <ToastContainer />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Notification;
