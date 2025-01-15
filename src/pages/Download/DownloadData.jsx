import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import FooterM from '../FooterMain/FooterM';
import DashboardSam from '../Dashboard/DashboardSam';
import HeaderSim from '../Header/HeaderSim';

function DownloadData() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeInterval, setTimeInterval] = useState('Hour');
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [stackOptions, setStackOptions] = useState([]);
  const [stackName, setStackName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/getallusers`);
        const filteredUsers = response.data.users.filter((user) => user.userType === 'user');
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users.');
      }
    };

    fetchUsers();
  }, []);

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
      // Check for specific error response
    if (error.response && error.response.status === 404) {
      toast.warn('No data available for the selected date range.');
    } else {
      toast.error('Failed to download data. Please try again.');
    }
    }
     // Check for specific error response
     
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
              <HeaderSim />
            </div>
          </div>
          <div>
            <div className="row" style={{ overflowX: 'hidden' }}>
              <div className="col-12 col-md-12 grid-margin">
                <div className="col-12 d-flex justify-content-between align-items-center m-3">
                  <h1 className='text-center mt-5'>Download Average Data</h1>
                </div>
                <div className="card ms-2 me-2">
                  <div className="card-body">
                    <form className='p-5' onSubmit={handleDownload}>
                      <div className="row">
                        {/* Select User */}
                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
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
                                <option key={item.userName} value={item.userName}>
                                  {item.userName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Select Stack Name */}
                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
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
                              {stackOptions.map((option, index) => (
                                <option key={index} value={option.name}>
                                  {option.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Start Date */}
                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="startDate" className="form-label">Start Date</label>
                            <input
                              type="date"
                              id="startDate"
                              className="input-field"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                              required
                            />
                          </div>
                        </div>

                        {/* End Date */}
                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="endDate" className="form-label">End Date</label>
                            <input
                              type="date"
                              id="endDate"
                              className="input-field"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                              required
                            />
                          </div>
                        </div>

                        {/* Time Interval */}
                    
                      </div>
                      <button type="submit" className="btn" style={{ backgroundColor: '#236a80', color: 'white' }}>
                        Download
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
    </div>
  );
}

export default DownloadData;
