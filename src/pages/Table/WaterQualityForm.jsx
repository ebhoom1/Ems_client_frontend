// WaterQualityForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import Hedaer from '../Header/Hedaer';
import DashboardSam from '../Dashboard/DashboardSam';
import Maindashboard from '../Maindashboard/Maindashboard';

const WaterQualityForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    stackName: '',
    startDate: '',
    endDate: '',
  });
  const [selectedIndustryType, setSelectedIndustryType] = useState("");
  const [users, setUsers] = useState([]);
  const [stackOptions, setStackOptions] = useState([]);
  const { userData } = useSelector((state) => state.user);

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
        toast.error("Failed to fetch users.");
      }
    };

    fetchUsers();
  }, [userData]);

  useEffect(() => {
    const fetchStackOptions = async () => {
      if (!formData.userName) return;

      try {
        const response = await axios.get(`${API_URL}/api/get-stacknames-by-userName/${formData.userName}`);
        setStackOptions(response.data.stackNames || []);
      } catch (error) {
        console.error("Error fetching stack names:", error);
        toast.error("Failed to fetch stack names.");
      }
    };

    fetchStackOptions();
  }, [formData.userName]);

  const handleIndustryTypeSelection = (e) => {
    setSelectedIndustryType(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.userName || !formData.stackName || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all fields to generate the report.");
      return;
    }
    navigate('/water-quality-report', { state: formData });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12">
          <Hedaer />
          <div className="maindashboard">
            <Maindashboard />
          </div>
          <div style={{ borderRadius: '10px' }} className="border border-solid shadow m-3 p-5">
            <h3>Customisable Report for  user</h3>
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
              <div className="form-control">
                <label htmlFor="industryType">Industry Type:</label>
                <select
                  value={selectedIndustryType}
                  onChange={handleIndustryTypeSelection}
                  className="form-select"
                >
                  <option value="">Select Industry Type</option>
                  {users.map((user) => (
                    <option key={user.industryType} value={user.industryType}>
                      {user.industryType}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="startDate">Start Date:</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  style={{ borderRadius: '10px' }}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date:</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="form-control"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  style={{ borderRadius: '10px' }}
                  required
                />
              </div>
              <button style={{ backgroundColor: '#236a80' }} type="submit" className="btn text-light">
                Generate Report
              </button>
            </form>
            <ToastContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityForm;
