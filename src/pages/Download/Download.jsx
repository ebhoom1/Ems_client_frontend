import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { API_URL } from '../../utils/apiConfig';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assests/images/ebhoom.png';
import { useNavigate } from 'react-router-dom';
import FooterM from '../FooterMain/FooterM';

const Download = () => {
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [userName, setUserName] = useState("");
    const [stackName, setStackName] = useState("");
    const [format, setFormat] = useState("csv");
    const [users, setUsers] = useState([]);
    const [stackOptions, setStackOptions] = useState([]);
    const [subscriptionDate, setSubscriptionDate] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/getallusers`);
                const filteredUsers = response.data.users.filter(user => user.userType === "user");
                setUsers(filteredUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Error fetching users");
            }
        };
        fetchUsers();
    }, []);

    const handleUserChange = async (e) => {
        const selectedUserName = e.target.value;
        setUserName(selectedUserName);

        const selectedUser = users.find(user => user.userName === selectedUserName);
        if (selectedUser) {
            setSubscriptionDate(moment(selectedUser.subscriptionDate).format('YYYY-MM-DD'));

            try {
                const response = await axios.get(`${API_URL}/api/get-stacknames-by-userName/${selectedUserName}`);
                setStackOptions(response.data.stackNames || []);
            } catch (error) {
                console.error("Error fetching stack names:", error);
                toast.error("Failed to fetch stack names");
            }
        } else {
            setSubscriptionDate("");
            setStackOptions([]);
        }
    };

    const handleDownload = async (e) => {
        e.preventDefault();

        if (!userName || !stackName || !dateFrom || !dateTo) {
            toast.error("Please fill in all fields.");
            return;
        }

        const formattedFromDate = moment(dateFrom).format('DD-MM-YYYY');
        const formattedToDate = moment(dateTo).format('DD-MM-YYYY');

        try {
            const response = await axios.get(`${API_URL}/api/downloadIotDataByUserNameAndStackName`, {
                params: {
                    fromDate: formattedFromDate,
                    toDate: formattedToDate,
                    userName: userName.trim(),
                    stackName: stackName.trim(),
                    format: format,
                },
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `iot_data_${formattedFromDate}_to_${formattedToDate}.${format}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(`IoT Data downloaded successfully in ${format} format`);
        } catch (error) {
            console.error("Error downloading data:", error);
            toast.error("Error in downloading IoT data");
        }
    };

    const handleHome = () => {
        navigate('/');
    };

    return (
        <div>
            <div className="row" style={{ overflowX: 'hidden' }}>
                <div className="col-12 grid-margin">
                    <div className="col-12 d-flex justify-content-between align-items-center m-3 p-5">
                        <img src={logo} alt="Ebhoom Logo" />
                        <button className="btn" onClick={handleHome} style={{ backgroundColor: 'white' }}>Home</button>
                    </div>
                    <h1 className="text-center mt-5">Download IoT Data</h1>
                    <div className="card ms-2 me-2">
                        <div className="card-body">
                            <form className="p-5" onSubmit={handleDownload}>
                                <div className="row">
                                    <div className="col-lg-6 mb-4">
                                        <label>Select Company</label>
                                        <select className="input-field" onChange={handleUserChange} style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
                                            <option value="">Select</option>
                                            {users.map(user => (
                                                <option key={user.userName} value={user.userName}>
                                                    {user.companyName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-lg-6 mb-4">
                                        <label>Select Station Name</label>
                                        <select
                                            className="input-field"
                                            value={stackName}
                                            onChange={(e) => setStackName(e.target.value)}
                                            disabled={!stackOptions.length}
                                            style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                                        >
                                            <option value="">Select</option>
                                            {stackOptions.map(stack => (
                                                <option key={stack} value={stack}>
                                                    {stack}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-lg-6 mb-4">
                                        <label>Date From</label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            min={subscriptionDate}
                                            disabled={!subscriptionDate}
                                            style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                                        />
                                        {subscriptionDate && (
                                            <small style={{ color: 'red' }}>Available from: {moment(subscriptionDate).format('DD-MM-YYYY')}</small>
                                        )}
                                    </div>

                                    <div className="col-lg-6 mb-4">
                                        <label>Date To</label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                                        />
                                    </div>

                                    <div className="col-lg-6 mb-4">
                                        <label>Format</label>
                                        <select
                                            className="input-field"
                                            value={format}
                                            onChange={(e) => setFormat(e.target.value)}
                                            style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                                        >
                                            <option value="csv">CSV</option>
                                            <option value="pdf">PDF</option>
                                        </select>
                                    </div>

                                    <div className="col-lg-12 mb-4">
                                        <button type="submit" className="btn" style={{ backgroundColor: '#236a80', color: 'white' }}>
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <ToastContainer />
                        </div>
                    </div>
                </div>
            </div>
            <FooterM />
        </div>
    );
};

export default Download;
