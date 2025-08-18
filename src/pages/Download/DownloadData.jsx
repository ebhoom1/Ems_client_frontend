import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import DashboardSam from '../Dashboard/DashboardSam';
import HeaderSim from '../Header/HeaderSim';
import { useSelector } from 'react-redux';
import './DownloadData.css'; // Import the new stylesheet

function DownloadData() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeInterval, setTimeInterval] = useState('Hour'); // Still here if needed later
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [stackOptions, setStackOptions] = useState([]);
  const [stackName, setStackName] = useState('');
  const navigate = useNavigate();

  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchAndFilterUsers = async () => {
      try {
        const currentUser = userData?.validUserOne;
        if (!currentUser) return setUsers([]);

        const response = await axios.get(`${API_URL}/api/getallusers`);
        const allUsers = response.data.users || [];

        let filteredUsers = [];
        if (currentUser.adminType === "EBHOOM") {
          filteredUsers = allUsers.filter(user => user.userType === 'user');
        } else if (currentUser.userType === "super_admin") {
          const myAdminIds = allUsers
            .filter(user => user.createdBy === currentUser._id && user.userType === "admin")
            .map(admin => admin._id.toString());
          filteredUsers = allUsers.filter(user => user.userType === 'user' && (user.createdBy === currentUser._id || myAdminIds.includes(user.createdBy)));
        } else if (currentUser.userType === "admin") {
          filteredUsers = allUsers.filter(user => user.userType === "user" && user.createdBy === currentUser._id);
        }
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users.');
      }
    };

    if (userData?.validUserOne) {
      fetchAndFilterUsers();
    }
  }, [userData]);

  useEffect(() => {
    if (!userName) {
      setStackOptions([]);
      setStackName('');
      return;
    }
    const fetchStackOptions = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
        setStackOptions(response.data.stackNames || []);
      } catch (error) {
        console.error('Error fetching stack names:', error);
        toast.error('Failed to fetch stack names.');
      }
    };
    fetchStackOptions();
  }, [userName]);

  const handleDownload = async (e) => {
    e.preventDefault();

    if (!userName || !stackName || !startDate || !endDate) {
      toast.error('All fields are required!');
      return;
    }
    
    // Dates from input are already in YYYY-MM-DD format. We need DD-MM-YYYY for the API.
    const formattedStartDate = startDate.split('-').reverse().join('-');
    const formattedEndDate = endDate.split('-').reverse().join('-');

    const downloadUrl = `${API_URL}/api/average/download/user/${userName}/stack/${stackName}/interval/hour/time-range?startTime=${formattedStartDate}&endTime=${formattedEndDate}&format=csv`;

    try {
      const response = await axios.get(downloadUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${userName}_${stackName}_${formattedStartDate}_to_${formattedEndDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download successful!');
    } catch (error) {
      console.error('Error downloading data:', error);
      if (error.response?.status === 404) {
        toast.warn('No data available for the selected date range.');
      } else {
        toast.error('Failed to download data. Please try again.');
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12">
          <HeaderSim />
          <div className="download-container">
            <div className="download-header">
              <h1>Download Average Data</h1>
              <p>Select the criteria below to generate and download your data report in CSV format.</p>
            </div>
            <form className='download-form' onSubmit={handleDownload}>
              <div className="row">
                <div className="col-lg-6 mb-4">
                  <label htmlFor="user" className="form-label">Select User</label>
                  <select
                    id="user"
                    className="form-select"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  >
                    <option value="">-- Select a User --</option>
                    {users.map((item) => (
                      <option key={item.userName} value={item.userName}>
                        {item.companyName} ({item.userName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-6 mb-4">
                  <label htmlFor="stackName" className="form-label">Stack Name</label>
                  <select
                    id="stackName"
                    className="form-select"
                    value={stackName}
                    onChange={(e) => setStackName(e.target.value)}
                    disabled={!userName}
                  >
                    <option value="">-- Select a Stack --</option>
                    {stackOptions
                      .filter(option => option.stationType === "effluent")
                      .map((option, index) => (
                        <option key={index} value={option.name}>{option.name}</option>
                      ))
                    }
                  </select>
                </div>
                <div className="col-lg-6 mb-4">
                  <label htmlFor="startDate" className="form-label">Start Date</label>
                  <input type="date" id="startDate" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="col-lg-6 mb-4">
                  <label htmlFor="endDate" className="form-label">End Date</label>
                  <input type="date" id="endDate" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
              <div className="button-container">
                <button type="submit" className="btn-download">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                  </svg>
                  Download Data
                </button>
              </div>
            </form>
          </div>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
      </div>
    </div>
  );
}

export default DownloadData;