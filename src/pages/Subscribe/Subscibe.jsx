import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import DashboardSam from '../Dashboard/DashboardSam';
import HeaderSim from '../Header/HeaderSim';

const Subscibe = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get userData from Redux (for admin details)
  const userData = useSelector((state) => state.user.userData);
  const userType = userData?.validUserOne?.userType;

  // For navigation
  const navigate = useNavigate();

  // Helper function to format dates as DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchUsers = async () => {
    try {
      if (userData?.validUserOne) {
        setLoading(true);
        let response;
        if (userData.validUserOne.adminType) {
          response = await axios.get(`${API_URL}/api/get-users-by-adminType/${userData.validUserOne.adminType}`);
        } else {
          response = await axios.get(`${API_URL}/api/getallusers`);
        }
        // Only show users with userType === "user"
        const filteredUsers = response.data.users.filter((user) => user.userType === "user");
        setUsers(filteredUsers);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Error fetching users");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userType === "admin" && userData?.validUserOne?.adminType) {
      fetchUsers();
    }
  }, [userType, userData]);

  // Adjust the endpoint and response shape if yours differs
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        // Example: If your route is /api/get-user-by-username, update accordingly
        const response = await axios.get(`${API_URL}/api/get-user-by-userName/${searchQuery.trim()}`);
        
        // If the endpoint returns { status: 200, user: { ... } }, do:
        if (response.data && response.data.user) {
          // Convert the single user object into an array
          setUsers([response.data.user]);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Error fetching user by username:", err);
        setUsers([]);
      }
    } else {
      fetchUsers();
    }
  };

  // Navigate to the subscription plans page using userName
  const handlePayClick = (user) => {
    navigate(`/subscription-plans/${user.userName}`);
  };

  return (
    <div className="container-fluid mb-5">
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

          <div className="row">
            <div className="col-12 col-md-12 grid-margin">
              {/* Align search to the right */}
              <div className="d-flex justify-content-end align-items-center m-3">
                <input
                  type="search"
                  placeholder="username"
                  className="p-2"
                  style={{ borderRadius: '30px', border: '1px solid #ccc' , fontSize:'11px'}}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch} className="btn btn-link text-dark">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>

              <div className="  mt-2" style={{ overflowX: 'auto' , backgroundColor:'#fafbf8' }}>
                <div className="card-body">
                  {/* Custom table styling */}
                  <table
                    className="table table-borderless"
                    style={{
                      borderCollapse: 'separate',
                      borderSpacing: '0 15px', // space between rows
                      width: '100%',
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th>Sl No</th>
                        <th>User ID</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Plan</th>
                        <th>Date</th>
                        <th>Subscription End Date</th>
                        <th>Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="8">Loading...</td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="8">Error: {error}</td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan="8">No users found.</td>
                        </tr>
                      ) : (
                        users.map((user, index) => (
                          <tr
                            key={user._id}
                            style={{
                              backgroundColor: '#fff',
                              border: '1px solid #ddd',
                              borderRadius: '8px',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            // Hover effect
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.01)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <td>{index + 1}</td>
                            <td>{user.userName}</td>
                            <td>{user.email}</td>
                            <td className="text-success">Active</td>
                            <td>{user.subscriptionPlan}</td>
                            <td>{formatDate(user.subscriptionDate)}</td>
                            <td>{formatDate(user.endSubscriptionDate)}</td>
                            <td>
                              <button
                                style={{ backgroundColor: '#236a80', color: '#fff' }}
                                className="btn"
                                onClick={() => handlePayClick(user)}
                              >
                                Pay
                              </button>
                            </td>
                          </tr>
                        ))
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
};

export default Subscibe;
