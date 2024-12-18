import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import './viewreport.css';
import Hedaer from '../Header/Hedaer';
import DashboardSam from '../Dashboard/DashboardSam';
import Maindashboard from '../Maindashboard/Maindashboard';

const CustomisableReport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    stackName: '',
    date: '',
  });
  const [users, setUsers] = useState([]);
  const [stackOptions, setStackOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const { userData } = useSelector((state) => state.user);

  // Fetch users for the userName dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let response;
        if (userData?.validUserOne?.adminType) {
          response = await axios.get(`${API_URL}/api/get-users-by-adminType/${userData.validUserOne.adminType}`);
        } else {
          response = await axios.get(`${API_URL}/api/getallusers`);
        }
        const filteredUsers = response.data.users.filter(user => user.userType === "user");
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users.");
      }
    };

    fetchUsers();
  }, [userData]);

  // Fetch stack names for the stackName dropdown
  useEffect(() => {
    const fetchStackOptions = async () => {
      if (!formData.userName) return;

      try {
        const response = await axios.get(`${API_URL}/api/get-stacknames-by-userName/${formData.userName}`);
        setStackOptions(response.data.stackNames || []);
      } catch (error) {
        console.error("Error fetching stack names:", error);
        alert("Failed to fetch stack names.");
      }
    };

    fetchStackOptions();
  }, [formData.userName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('userdatatoken');
      await axios.post(`${API_URL}/api/generate-custom-report`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
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
          <Hedaer />
          <div className="maindashboard">
            <Maindashboard />
          </div>
          <div style={{ borderRadius: '10px' }} className="border border-solid shadow m-3 p-5">
            <h3>Customisable Report</h3>
            <form onSubmit={handleSubmit} className="custom-report-form">
              <div className="form-group">
                <label htmlFor="userName">User Name:</label>
                <select
                  id="userName"
                  name="userName"
                  className="form-control"
                  value={formData.userName}
                  onChange={handleInputChange}
                  style={{ borderRadius: '10px' }}
                  required
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.userName} value={user.userName}>
                      {user.userName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="stackName">Stack Name:</label>
                <select
                  id="stackName"
                  name="stackName"
                  className="form-control"
                  value={formData.stackName}
                  onChange={handleInputChange}
                  style={{ borderRadius: '10px' }}
                  required
                >
                  <option value="">Select Stack Name</option>
                  {stackOptions.map((stack, index) => (
                    <option key={index} value={stack.name}>
                      {stack.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="date">Date:</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleInputChange}
                  style={{ borderRadius: '10px' }}
                  required
                />
              </div>
              <button style={{backgroundColor:'#236a80'}} type="submit" className="btn text-light " disabled={loading}>
                {loading ? 'Generating...' : 'Download'}
              </button>
            </form>
            <ToastContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomisableReport;
