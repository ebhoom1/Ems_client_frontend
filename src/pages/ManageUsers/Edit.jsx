import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, updateUser } from '../../redux/features/userLog/userLogSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig'; 
import DashboardSam from '../Dashboard/DashboardSam';
import Maindashboard from '../Maindashboard/Maindashboard';
import HeaderSim from '../Header/HeaderSim';

function Edit() {
  const { userId } = useParams();  // Get the userId from the route parameters
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedUser, loading, error } = useSelector((state) => state.userLog);  // Fetch the selectedUser from the Redux store

  const [userData, setUserData] = useState({
    userName: '',
    companyName: '',
    modelName: '',
    fname: '',
    email: '',
    mobileNumber: '',
    password: '',
    cpassword: '',
    subscriptionDate: '',
    userType: '',
    industryType: '',
    dataInteval: '',
    district: '',
    state: '',
    address: '',
    latitude: '',
    longitude: ''
  });

  const industryType = [
    { category: "Sugar" },
    { category: "Cement" },
    { category: "Distillery" },
    { category: "Petrochemical" },
    { category: "Pulp & Paper" },
    { category: "Fertilizer" },
    { category: "Tannery" },
    { category: "Pesticides" },
    { category: "Thermal Power Station" },
    { category: "Caustic Soda" },
    { category: "Pharmaceuticals" },
    { category: "Chemical" },
    { category: "Dye and Dye Stuff" },
    { category: "Refinery" },
    { category: "Copper Smelter" },
    { category: "Iron and Steel" },
    { category: "Zinc Smelter" },
    { category: "Aluminium" },
    { category: "STP/ETP" },
    { category: "NWMS/SWMS" },
    { category: "Noise" },
    { category: "Other" }
  ];

  // Fetch user data when component mounts
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));  // Dispatch action to fetch the user by ID
    }
  }, [dispatch, userId]);

  // Set form data when selectedUser is updated
  useEffect(() => {
    if (selectedUser) {
      setUserData((prevData) => ({
        ...prevData,
        ...selectedUser  // Update form data with the selected user's data
      }));
    }
  }, [selectedUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveUser = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.patch(`${API_URL}/api/edituser/${userId}`, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      toast.success('User updated successfully!');
      setTimeout(() => {
        navigate("/manage-user");
      }, 2000);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    toast.error('Failed to update user.');
  }
};

  const handleCancel = () => {
    navigate('/manage-user');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container-fluid">
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

          <div>
            <div className="row" style={{ overflowX: 'hidden' }}>
              <div className="col-12 col-md-12 grid-margin">
                <div className="col-12 d-flex justify-content-between align-items-center m-3">
                  <h1 className="text-center mt-5">Edit User</h1>
                </div>

                <div className="card">
                  <div className="card-body">
                    <form className="m-2 p-5" onSubmit={handleSaveUser}>
                      <div className="row">
                        {/* Render form fields with pre-populated values */}
                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="userId" className="form-label">User ID</label>
                            <input
                              id="userId"
                              name="userName"
                              value={userData.userName || ''}  // Pre-populate with fetched data
                              onChange={handleChange}
                              className="form-control"
                              style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="companyName" className="form-label">Company Name</label>
                            <input
                              id="companyName"
                              name="companyName"
                              value={userData.companyName || ''}
                              onChange={handleChange}
                              className="form-control"
                              style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="firstName" className="form-label">First Name</label>
                            <input
                              id="firstName"
                              name="fname"
                              value={userData.fname || ''}
                              onChange={handleChange}
                              className="form-control"
                              style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              value={userData.email || ''}
                              onChange={handleChange}
                              className="form-control"
                              style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="mobile" className="form-label">Mobile Number</label>
                            <input
                              id="mobile"
                              name="mobileNumber"
                              value={userData.mobileNumber || ''}
                              onChange={handleChange}
                              className="form-control"
                              style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="model" className="form-label">Model Name  </label>
                                        <input id="model"  value={userData.modelName || ''} name='modelName' onChange={handleChange} placeholder='Enter Model name' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                {/* Poduct ID */}
                                <div className="col-lg-6 col-md-6 mb-4">
  <div className="form-group">
    <label htmlFor="productID" className="form-label">Product ID</label>
    <input 
      id="productID" 
      type="text" 
      name="productID" 
      placeholder="Enter Product ID" 
      value={userData.productID || ''} 
      onChange={handleChange} 
      className="form-control"  
      style={{ width: '100%', padding: '15px', borderRadius: '10px' }} 
    />
  </div>
</div>
                                {/* Password */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="password" className="form-label"> Password  </label>
                                        <input id="password" type='Password' placeholder='Enter Password ' value={userData.password || ''} onChange={handleChange}  className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                 {/*  Confirm Password */}
                                 <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="password" className="form-label"> Confirm Password  </label>
                                        <input id="password" type='Password' placeholder='Enter Password ' value={userData.cpassword || ''} name='cpassword' onChange={handleChange} className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                 {/* To Date */}
                                 <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="subscriptionDate" className="form-label"> Date of subscription</label>
                                        <input id="subscriptionDate" className="form-control" name='subscriptionDate' value={userData.subscriptionDate || ''} onChange={handleChange} type="date" style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />
                                    </div>
                                </div>
                                {/* User Type */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="user" className="form-label">User Type</label>
                                        <select id="user" value={userData.userType || ''} onChange={handleChange} name='userType' className="form-control" style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
                                        <option value="select">Select</option>
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                            {/* Add options for companies */}
                                        </select>
                                    </div>
                                </div>
                                {/* select industry */}
                                <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="industry" className="form-label">Select Industry</label>
                            <select 
                              id="industry" 
                              value={userData.industryType || ''} 
                              onChange={handleChange}  
                              name='industryType' 
                              className="form-control text-start" 
                              style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
                                <option value="">Select Industry</option>
                                {industryType.map((industry, index) => (
                                    <option key={index} value={industry.category}>
                                        {industry.category}
                                    </option>
                                ))}
                            </select>
                          </div>
                        </div>

                                {/* data interval */}
                                <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="dataInteval" className="form-label">Select Time Interval</label>
                            <select 
                              id="dataInteval" 
                              value={userData.dataInteval || ''} 
                              onChange={handleChange}  
                              name='dataInteval' 
                              className="form-control text-start" 
                              style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
                                <option value="">Select </option>
                                <option value="15_sec">15 sec</option>
                                <option value="1_min">Less than 1 min</option>
                                <option value="15_min">Less than 15 min</option>
                                <option value="30_min">Less than 30 min</option>
                            </select>
                          </div>
                        </div>
                                {/* District */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="district" className="form-label"> District  </label>
                                        <input id="district" type='text' value={userData.district || ''} onChange={handleChange}  placeholder='Enter District ' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                {/* State */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="state" className="form-label"> State  </label>
                                        <input id="state" type='text' placeholder='Enter State' value={userData.state || ''} onChange={handleChange}  className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                {/* address */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="address" className="form-label"> Address  </label>
                                        <input id="address" type='text' placeholder='Enter Address ' value={userData.address} onChange={handleChange}  className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                {/* Latitude */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="latitude" className="form-label"> latitute  </label>
                                        <input id="latitude" type='text' placeholder='Enter Latitude ' value={userData.latitude || ''} onChange={handleChange}  className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                {/* Longitude */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="longitude" className="form-label">Longitude   </label>
                                        <input id="longitude" type='text' placeholder='Enter Longitude ' value={userData.longitude || ''} onChange={handleChange}  className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>



                      </div>

                      <button type="submit" className="btn" style={{ backgroundColor: '#236a80', color: 'white' }}>Update User</button>
                      <button type="button" className="btn btn-danger ms-1" onClick={handleCancel} style={{ color: 'white' }}>Cancel</button>
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

export default Edit;