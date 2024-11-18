import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { API_URL } from '../../utils/apiConfig';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Toastify styles
import logo from '../../assests/images/ebhoom.png'; // Import logo
import { useNavigate } from 'react-router-dom';
import FooterM from '../FooterMain/FooterM';
import DashboardSam from '../Dashboard/DashboardSam';
import HeaderSim from '../Header/HeaderSim';

function DownloadData() {
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [userName, setUserName] = useState("");
    const [company, setCompany] = useState("");
    const [format, setFormat] = useState("csv"); // Default format
    const [users, setUsers] = useState([]);
    const [subscriptionDate, setSubscriptionDate] = useState(""); // New state for subscription date
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

    // Update the subscriptionDate when a user is selected
    const handleUserChange = (e) => {
        const selectedUserName = e.target.value;
        setUserName(selectedUserName);

        // Find the selected user's subscription date
        const selectedUser = users.find(user => user.userName === selectedUserName);
        if (selectedUser && selectedUser.subscriptionDate) {
            // Set the subscription date
            setSubscriptionDate(moment(selectedUser.subscriptionDate).format('YYYY-MM-DD'));
        } else {
            setSubscriptionDate(""); // Clear if no subscription date found
        }
    };

    const handleDownload = async (e) => {
        e.preventDefault();

        if (!userName || !dateFrom || !dateTo) {
            toast.error("Please fill in all fields.");
            return;
        }

        const formattedDateFrom = moment(dateFrom).format('DD-MM-YYYY');
        const formattedDateTo = moment(dateTo).format('DD-MM-YYYY');

        // Construct the query string
        const queryParams = {
            fromDate: formattedDateFrom,
            toDate: formattedDateTo,
            userName: userName.trim(),
            format: format
        };

        const queryString = Object.entries(queryParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        const requestUrl = `${API_URL}/api/downloadIotDataByUserName?${queryString}`;

        console.log('Request URL:', requestUrl); // Debug the URL

        try {
            const response = await axios.get(requestUrl, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `iot_data.${format}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); // Clean up the link element
            toast.success(`IoT Data downloaded successfully in ${format} format`);
        } catch (error) {
            console.error("Error downloading data:", error);
            toast.error(`Error in downloading IoT data`);
        }
    };


    const handleHome = () => {
        navigate('/');
    };

  return (
    <div className="container-fluid">
    <div className="row">
        {/* Sidebar (hidden on mobile) */}
        <div className="col-lg-3 d-none d-lg-block ">
            <DashboardSam/>
        </div>
        {/* Main content */}
        <div className="col-lg-9 col-12 ">
            <div className="row">
                <div className="col-12">
                    <HeaderSim/>
                </div>
            </div>
            <div>
          <div className="row" style={{overflowX:'hidden'}}>
          <div className="col-12 col-md-12 grid-margin">
                <div className="col-12 d-flex justify-content-between align-items-center m-3" >
                    <h1 className='text-center mt-5'>Download IoT Data</h1>
                </div>
                <div className="card ms-2 me-2">
                        <div className="card-body">
                            <form className='p-5' onSubmit={handleDownload}>
                                <div className="row">
                                    {/* Select Industry */}
                                   

                                    {/* Select Company */}
                                    <div className="col-lg-6 col-md-6 mb-4">
                                        <div className="form-group">
                                            <label htmlFor="industry" className="form-label">Select Company</label>
                                            <select className="input-field" onChange={handleUserChange} style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
                                                <option>select</option>
                                                {users.map((item) => (
                                            <option key={item.userName} value={item.userName}>
                                                {item.companyName}
                                            </option>
                                        ))}
                                            </select>
                                        </div>
                                    </div>
                                    {/* From Date */}
                                     <div className="col-lg-6 col-md-6 mb-4">
                                        <div className="form-group">
                                        <label>Date From</label> 
                                        <input
                                        type="date"
                                        className="input-field"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        required
                                        min={subscriptionDate} // Set the minimum date as the subscription date
                                        disabled={!subscriptionDate}
                                        style={{ width: '100%', padding: '15px', borderRadius: '10px' , border:'none' }} // Disable if no subscription date available
                                    />
                                    {subscriptionDate && (
                                        <small style={{color:'red'}}>Available from: {moment(subscriptionDate).format('DD-MM-YYYY')}</small>
                                    )}        
                                        </div>
                                    </div>

                                    {/* To Date */}
                                    <div className="col-lg-6 col-md-6 mb-4">
                                        <div className="form-group">
                                        <label>Date To</label>            
                                        <input
                                        type="date"
                                        className="input-field"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        style={{ width: '100%', padding: '15px', borderRadius: '10px', border:'none' }}
                                        required
                                    />                                        </div>
                                    </div>

                                    {/* Download Format */}
                                    <div className="col-lg-6 col-md-6 mb-4">
                                        <div className="form-group">
                                        <label>Format</label>
                                    <select className="input-field" value={format} onChange={(e) => setFormat(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
                                        <option value="csv">CSV</option>
                                        <option value="pdf">PDF</option>
                                    </select>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn" style={{ backgroundColor: '#236a80', color: 'white' }}>Download</button>
                            </form>
                            <ToastContainer />
                        </div>
                    </div>
            </div>
           
        </div>
       
      </div>
        </div>
    </div>
</div>
  )
}

export default DownloadData