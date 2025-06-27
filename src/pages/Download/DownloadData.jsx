import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import FooterM from '../FooterMain/FooterM';
import DashboardSam from '../Dashboard/DashboardSam';
import HeaderSim from '../Header/HeaderSim';
import { useSelector } from 'react-redux';

function DownloadData() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeInterval, setTimeInterval] = useState('Hour');
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [stackOptions, setStackOptions] = useState([]);
  const [stackName, setStackName] = useState('');
  const navigate = useNavigate();

  const { userData } = useSelector((state) => state.user);

  // ✅ New useEffect to fetch users based on userType and createdBy, similar to the Header component
  useEffect(() => {
    const fetchAndFilterUsers = async () => {
      try {
        const currentUser = userData?.validUserOne;
        if (!currentUser) {
          setUsers([]);
          return;
        }

        let response;
        if (currentUser.adminType === "EBHOOM") {
          // EBHOOM fetches all 'user' types
          response = await axios.get(`${API_URL}/api/getallusers`);
          const fetchedUsers = response.data.users || [];
          const filteredForEbhoom = fetchedUsers.filter(
            (user) => user.userType === 'user'
          );
          setUsers(filteredForEbhoom);
        } else if (currentUser.userType === "super_admin") {
          // Super admin fetches all and filters down to users created by them or their admins
          response = await axios.get(`${API_URL}/api/getallusers`);
          const fetchedUsers = response.data.users || [];
          
          const myAdmins = fetchedUsers.filter(
            (user) => user.createdBy === currentUser._id && user.userType === "admin"
          );
          const myAdminIds = myAdmins.map((admin) => admin._id.toString());
          
          const usersForSuperAdmin = fetchedUsers.filter(
            (user) =>
              user.userType === 'user' &&
              (user.createdBy === currentUser._id || myAdminIds.includes(user.createdBy))
          );
          setUsers(usersForSuperAdmin);
        } else if (currentUser.userType === "admin") {
          // Admin fetches 'user' types created by them
          const url = `${API_URL}/api/get-users-by-creator/${currentUser._id}`;
          response = await axios.get(url);
          const fetchedUsers = response.data.users || [];
          const myUsers = fetchedUsers.filter(
            (user) => user.userType === "user"
          );
          setUsers(myUsers);
        } else {
          // For 'user' type, show an empty list since they can't download data for other users
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users.');
        setUsers([]);
      }
    };

    if (userData?.validUserOne) {
      fetchAndFilterUsers();
    }
  }, [userData]);

  useEffect(() => {
    const fetchStackOptions = async () => {
      if (!userName) return;
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

    if (!userName || !stackName || !startDate || !endDate || !timeInterval) {
      toast.error('All fields are required!');
      return;
    }

    const formattedStartDate = startDate.split('-').reverse().join('-');
    const formattedEndDate = endDate.split('-').reverse().join('-');

    const downloadUrl = `${API_URL}/api/average/download/user/${userName}/stack/${stackName}/interval/hour/time-range?startTime=${formattedStartDate}&endTime=${formattedEndDate}&format=csv`;

    try {
      const response = await axios.get(downloadUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${userName}_${stackName}_${timeInterval}_${formattedStartDate}_to_${formattedEndDate}.csv`;
      link.click();
      toast.success('Download successful!');
    } catch (error) {
      console.error('Error downloading data:', error);
      if (error.response && error.response.status === 404) {
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
          <div className="row">
            <div className="col-12">
              <h1 className='text-center mt-5'>Download Average Data</h1>
              <div className="card ms-2 me-2">
                <div className="card-body">
                  <form className='p-5' onSubmit={handleDownload}>
                    <div className="row">
                      <div className="col-lg-6 col-md-6 mb-4">
                        <label htmlFor="user" className="form-label">Select User</label>
                        <select
                          id="user"
                          name="user"
                          className="input-field"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                        >
                          <option value="">Select User</option>
                          {users.map((item) => (
                            <option key={item.userName} value={item.userName}>{item.userName}-{item.companyName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-lg-6 col-md-6 mb-4">
                        <label htmlFor="stackName" className="form-label">Stack Name</label>
                        <select
                          id="stackName"
                          name="stackName"
                          className="input-field"
                          value={stackName}
                          onChange={(e) => setStackName(e.target.value)}
                          style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                        >
                          <option value="">Select Stack Name</option>
                          {stackOptions
                            .filter(option => option.stationType === "effluent")
                            .map((option, index) => (
                              <option key={index} value={option.name}>{option.name}</option>
                            ))
                          }
                        </select>
                      </div>
                      <div className="col-lg-6 col-md-6 mb-4">
                        <label htmlFor="startDate" className="form-label">Start Date</label>
                        <input  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} type="date" id="startDate" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                      </div>
                      <div className="col-lg-6 col-md-6 mb-4">
                        <label htmlFor="endDate" className="form-label">End Date</label>
                        <input  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} type="date" id="endDate" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-success">Download</button>
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

export default DownloadData;