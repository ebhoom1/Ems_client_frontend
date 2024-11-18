import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import KeralaMap from './KeralaMap';
import DashboardSam from "../Dashboard/DashboardSam";
import Hedaer from "../Header/Hedaer";
import { fetchUsers, addUser ,deleteUser ,addStackName, fetchUserByCompanyName,clearState, setFilteredUsers  } from "../../redux/features/userLog/userLogSlice"; // Add action for fetching and adding users
import { useDispatch, useSelector } from "react-redux";
import './userlog.css'
const UsersLog = () => {
  const dispatch = useDispatch();
  const { users, filteredUsers, loading, error } = useSelector((state) => state.userLog);
  const navigate = useNavigate();
  const [sortCategory, setSortCategory] = useState("");
  const [sortOptions, setSortOptions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [stacks, setStacks] = useState([{ stackName: '', stationType: '' }]);
  const [formData, setformData] = useState({
    userName: "",
    companyName: "",
    modelName: "",
    fname: "",
    email: "",
    mobileNumber: "",
    password: "",
    cpassword: "",
    subscriptionDate: "",
    userType: "",
    industryType: "",
    dataInteval: "", 
    district: "",
    state: "",
    address: "",
    latitude: "",
    longitude: "",
    productID: ""
  });
  const [userName,setUserName]=useState('');

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

  // Fetch users when component mounts
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

 
  const handleInputChange = event => {
    const { name, value } = event.target;
    setformData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const validateFields = () => {
    const { userName, companyName, fname, email, mobileNumber, password, cpassword } = formData;
    
    // Check if all required fields are filled
    if (!userName || !companyName || !fname || !email || !mobileNumber || !password || !cpassword) {
      return false; // Not all fields are filled
    }
    
    return true; // All fields are filled
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate form fields before proceeding
    if (!validateFields()) {
      toast.error("Please fill all the fields", { position: 'top-center' });
      return; // Stop the function if validation fails
    }
  
    // Check if passwords match
    if (formData.password !== formData.cpassword) {
      toast.error("Passwords do not match", { position: 'top-center' });
      return;
    }
  
    try {
      // If validation passes, dispatch the addUser action
      await dispatch(addUser(formData)).unwrap();
      toast.success('User added successfully', { position: 'top-center' });
      
      // Clear form after successful submission
      setformData({
        userName: "",
        companyName: "",
        modelName: "",
        fname: "",
        email: "",
        mobileNumber: "",
        password: "",
        cpassword: "",
        subscriptionDate: "",
        userType: "",
        industryType: "",
        dataInterval: "",
        district: "",
        state: "",
        address: "",
        latitude: "",
        longitude: "",
        productID: ""
      });
  
      dispatch(fetchUsers()); // Refresh the user list after adding
    } catch (error) {
      console.log("Error in AddUser:", error);
      toast.error('An error occurred. Please try again.', { position: 'top-center' });
    }
  };
  
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading, please wait...</p>
      </div>
    );
  }
  

if (error) {
return <div>Error: {error.message}</div>;
}

  

  const handleAddUser = async (e) => {
    e.preventDefault();
  
    if (!validateFields()) {
      toast.error("Please fill all the fields");
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
  
    try {
      await dispatch(addUser(formData)).unwrap(); // Catch any rejected promises
      toast.success("User added successfully!");
      dispatch(fetchUsers()); // Refresh the user list
      clearForm();
    } catch (error) {
      toast.error("Failed to add user: " + (error.message || error.toString()));
    }
  };


  

  const handleDeleteUser = async (userId) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success("User deleted successfully!");
      dispatch(fetchUsers()); // Refresh the user list
    } catch (error) {
      toast.error("Failed to delete user: " + (error.message || error.toString()));
    }
  };

  const clearForm = () => {
    setformData({
      userId: '',
      companyName: '',
      firstName: '',
      email: '',
      mobile: '',
      modelName: '',
      productId: '',
      password: '',
      confirmPassword: '',
      subscriptionDate: '',
      userType: '',
      industry: '',
      dataInterval: '',
      district: '',
      state: '',
      address: '',
      latitude: '',
      longitude: ''
    });
  };

  const handleUserClick = (userName) => {
    navigate('/ambient', { state: { userName } });
  };


  /* delete */
  

const handleSubmitDelete =async(e)=>{
  e.preventDefault();

  if(!userName){
    return toast.warning('Please Enter the user ID',{
      position:'top-center'
    })
  }
  try {
   await dispatch(deleteUser(userName)).unwrap();
       toast.success('user deleted Successfully',{
      position:'top-center'
    })
    setUserName('')   
  } catch (error) { 
    console.error(`Error deleting user:`,error);
    toast.error('Error in Deleting User /  User ID not found',{
      position:'top-center'
    })
  }
}


/* stack */
const handleInputNameChange = (index, field, value) => {
  const newStacks = [...stacks];
  newStacks[index][field] = value;
  setStacks(newStacks);
};

const handleAddInput = () => {
  setStacks([...stacks, { stackName: '', stationType: '' }]);
};

const handleRemoveInput = (index) => {
  const newStacks = stacks.filter((_, idx) => idx !== index);
  setStacks(newStacks);
};

const handleCompanyChange = async (event) => {
  const companyName = event.target.value;
  setSelectedCompany(companyName);

  if (companyName) {
    try {
      const result = await dispatch(fetchUserByCompanyName(companyName)).unwrap();
      console.log('Fetched User:', result);

      if (result.stackName && Array.isArray(result.stackName)) {
        const formattedStacks = result.stackName.map((stack) => ({
          stackName: stack.name || '',
          stationType: stack.stationType || '',
        }));
        setStacks(formattedStacks);
      } else {
        setStacks([{ stackName: '', stationType: '' }]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to fetch user data.');
      setStacks([{ stackName: '', stationType: '' }]);
    }
  }
};

const handleSave = async () => {
  if (!selectedCompany) {
    toast.error('Please select a company', { position: 'top-center' });
    return;
  }

  if (!Array.isArray(stacks)) {
    console.error('Stacks is not an array:', stacks);
    toast.error('Invalid stacks data', { position: 'top-center' });
    return;
  }

  const stackData = stacks.map((stack) => ({
    name: stack.stackName,
    stationType: stack.stationType,
  }));

  console.log('Stack Data:', stackData);

  if (!Array.isArray(stackData) || !stackData.every(item => typeof item === 'object' && item.name && item.stationType)) {
    console.error('Invalid stackData:', stackData);
    toast.error('Stack data must be an array of objects with name and stationType', { position: 'top-center' });
    return;
  }

  try {
    console.log('Payload:', { companyName: selectedCompany, stackData });

    await dispatch(
      addStackName({
        companyName: selectedCompany,
        stackData,
      })
    ).unwrap();

    toast.success('Stack Names and Station Types added successfully', {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } catch (error) {
    console.error('Error adding stack names:', error);
    toast.error('An error occurred. Please try again.', { position: 'top-center' });
  }
};


const handleCancel = () => {
  navigate('/manage-user');
};

if (loading) {
  return <div>Wait a min...</div>;
}

if (error) {
  return <div>Error: {error}</div>;
}
/* sort */
const handleSortCategoryChange = (category) => {
  setSortCategory(category);
  if (category === "Industry Type") {
    const uniqueIndustryTypes = [...new Set(users.map(user => user.industryType))];
    setSortOptions(uniqueIndustryTypes);
  } else if (category === "Location") {
    const uniqueLocations = [...new Set(users.map(user => user.district))];
    setSortOptions(uniqueLocations);
  }
};

const handleSortOptionSelect = (option) => {
  const sortedUsers = [...users].filter(user =>
    (sortCategory === "Industry Type" ? user.industryType : user.district) === option
  );
  dispatch(setFilteredUsers(sortedUsers));
};


  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar (hidden on mobile) */}
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
          <div className="row mt-4">
            <div className="col-12">
              <h1 className="text-center">Control and Monitor</h1>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h4 className="card-title text-center"></h4>
                  <KeralaMap users={users} />
                </div>
              </div>
            </div>
          </div>

          {/* User List */}
          <div className="col-12 d-flex justify-content-between align-items-center m-3" >
                    <h1 className='text-center mt-3'> User List </h1>
                </div>
          <div className="card mt-4">
          <div className="card-body">
          
            <div className="sort-dropdown">
              <label>Sort by: </label>
              <select onChange={(e) => handleSortCategoryChange(e.target.value)}>
                <option value="">Select</option>
                <option value="Industry Type">Industry Type</option>
                <option value="Location">Location</option>
              </select>
              {sortCategory && (
                <select onChange={(e) => handleSortOptionSelect(e.target.value)}>
                  <option value="">Select {sortCategory}</option>
                  {sortOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              )}
            </div>
            
            {loading && /* From Uiverse.io by boryanakrasteva */ 
<div class="honeycomb">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>}
            {error && <p>Error fetching users: {error}</p>}
            {!loading && !error && (
              <div className="user-list-container">
                <table className="userlog-table">
                  <thead>
                    <tr>
                      <th className=" userlog-head">Company Name</th>
                      <th className=" userlog-head">User Name</th>
                      <th className=" userlog-head">Industry Type</th>
                      <th className=" userlog-head">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} onClick={() => handleUserClick(user.userName)}>
                        <td className="userlog-head">{user.companyName}</td>
                        <td className=" userlog-head">{user.userName}</td>
                        <td className=" userlog-head">{user.industryType}</td>
                        <td className=" userlog-head">{user.district}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

          {/* Add User Form */}
          <div className="row" style={{overflowX:'hidden'}}>
          <div className="col-12 col-md-12 grid-margin">
                <div className="col-12 d-flex justify-content-between align-items-center m-3" >
                    <h1 className='text-center mt-3'>Manage Users</h1>
                </div>
                <div className="card ">
                    <div className="card-body">
                        <form className='m-2 p-5' onSubmit={handleSubmit}>
                            <div className="row">
                                {/* Select Industry */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="userId" className="form-label">User ID</label>
                                        <input id="userId" type="text" placeholder='User ID' className="form-control"    value={formData.userName} 
                          onChange={handleInputChange}  name="userName" style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>


                                {/* Select Company */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="companyName" className="form-label">Company Name </label>
                                        <input type='text' id="companyName" placeholder='Company Name'    name="companyName"  className="form-control"    value={formData.companyName} 
                          onChange={handleInputChange}   style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>


                              
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="firstName" className="form-label">First Name </label>
                                        <input id="firstName" value={formData.fname}   onChange={handleInputChange} name="fname"  placeholder='First Name ' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>


                               
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label">Email  </label>
                                        <input id="email" value={formData.email}   onChange={handleInputChange} type='email' name="email" placeholder='email' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                {/* mobile number */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="mobile" className="form-label">Mobile Number  </label>
                                        <input id="mobile" value={formData.mobileNumber}   onChange={handleInputChange} name="mobileNumber"  type='text' placeholder=' Enter Mobile Number ' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                              {/* model name */}
                              <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="modelName" className="form-label">Model Name  </label>
                                        <input id="modelName" value={formData.modelName}   onChange={handleInputChange}  type='text' name="modelName" placeholder='Enter Model name' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                {/* Poduct ID */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="productID" className="form-label"> Product ID </label>
                                        <input id="productID"  value={formData.productID}   onChange={handleInputChange}  name="productID" type='text' placeholder='Enter  Poduct ID' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                {/* Password */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="password" className="form-label"> Password  </label>
                                        <input id="password"  value={formData.password}   onChange={handleInputChange}  name="password" type='Password' placeholder='Enter  Password ' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                 {/*  Confirm Password */}
                                 <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="confirmPassword" className="form-label"> Confirm Password  </label>
                                        <input id="confirmPassword"  value={formData.cpassword}   onChange={handleInputChange} name="cpassword" type='Password' placeholder='Enter Password ' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                 {/* To Date */}
                                 <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="subscriptionDate" className="form-label"> Date of subscription</label>
                                        <input id="subscriptionDate"  value={formData.subscriptionDate}   onChange={handleInputChange} name="subscriptionDate" className="form-control" type="date" style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />
                                    </div>
                                </div>
                                {/* User Type */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="userType" className="form-label">User Type</label>
                                        <select id="userType" className="form-control" value={formData.userType}   onChange={handleInputChange} name="userType" style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
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
                                        <select id="industry" value={formData.industryType} name="industryType"  onChange={handleInputChange} className="form-control text-start" style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
                                            <option>select</option>
                                            {industryType.map((industry, index) => (
                                                <option key={index} value={industry.category}>{industry.category}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* data interval */}
                                <div className="col-lg-6 col-md-6 mb-4">
  <div className="form-group">
    <label htmlFor="time" className="form-label">Select Time Interval</label>
    <select 
      id="time" 
      name="dataInteval"  // Match the name with the key in the state
      value={formData.dataInteval}  // Correctly bind the value to state
      onChange={handleInputChange} 
      className="form-control text-start" 
      style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
        <option value="">Select</option> {/* Ensure a default option */}
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
                                        <label htmlFor="district" className="form-label">District</label>
                                        <input 
                                            id="district" 
                                            type="text" 
                                            placeholder="Enter District" 
                                            value={formData.district} 
                                            onChange={handleInputChange} 
                                            name="district" 
                                            className="form-control"  
                                            style={{ width: '100%', padding: '15px', borderRadius: '10px' }} 
                                        />
                                    </div>
                                </div>
                                {/* State */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="state" className="form-label">State</label>
                                        <input 
                                            id="state" 
                                            type="text" 
                                            placeholder="Enter State" 
                                            value={formData.state} 
                                            onChange={handleInputChange} 
                                            name="state" 
                                            className="form-control"  
                                            style={{ width: '100%', padding: '15px', borderRadius: '10px' }} 
                                        />
                                    </div>
                                </div>
                                

                                {/* address */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="address" className="form-label">Address</label>
                                        <input 
                                            id="address" 
                                            type="text" 
                                            placeholder="Enter Address" 
                                            value={formData.address} 
                                            onChange={handleInputChange} 
                                            name="address" 
                                            className="form-control"  
                                            style={{ width: '100%', padding: '15px', borderRadius: '10px' }} 
                                        />
                                    </div>
                                </div>
                                {/* Latitude */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="latitude" className="form-label">Latitude</label>
                                        <input 
                                            id="latitude" 
                                            type="text" 
                                            placeholder="Enter Latitude" 
                                            value={formData.latitude} 
                                            onChange={handleInputChange} 
                                            name="latitude" 
                                            className="form-control"  
                                            style={{ width: '100%', padding: '15px', borderRadius: '10px' }} 
                                        />
                                    </div>
                                </div>
                                {/* Longitude */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="longitude" className="form-label">Longitude   </label>
                                        <input id="longitude"
                                         type='text' 
                                         placeholder='Enter Longitude '
                                         value={formData.longitude} 
                                         onChange={handleInputChange} 
                                         name="longitude"
                                          className="form-control"  
                                          style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                               
                               
                            </div>
                            <button type="submit" className="btn" style={{backgroundColor:'#236a80' , color:'white'}}>Add User</button>
                            <button type="submit" className="btn btn-danger ms-1 " style={{ color:'white'}}>Cancel</button>
                        </form>
                    </div>
                </div>
            </div>
           
        </div>

        {/* add stack */}
        <div className="row" style={{ overflowX: 'hidden' }}>
  <div className="col-12 col-md-12 grid-margin">
   
    {/* main */}
    <div className="row" style={{ overflowX: 'hidden' }}>
  <div className="col-12 col-md-12 grid-margin">
    <div className="col-12 d-flex justify-content-between align-items-center m-3">
      <h1 className="text-center mt-5">Add Stack Names and Station Types</h1>
    </div>
    <div className="card">
      <div className="card-body">
        <form className="m-2 p-5">
          {/* Select Company */}
          <div className="row">
            <div className="col-lg-12 col-md-6 mb-4">
              <div className="form-group">
                <label htmlFor="company" className="form-label">Select Company</label>
                <select
                  id="company"
                  className="form-control"
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                >
                  <option value="">Select Company</option>
                  {users.map((user) => (
                    <option key={user._id} value={user.companyName}>
                      {user.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stack Name Inputs */}
          {stacks.map((stack, index) => (
            <div key={index} className="row mb-3 align-items-center">
              <div className="col-lg-5 col-md-5">
                <div className="form-group">
                <input
                  type="text"
                  value={stack.stackName}
                  onChange={(e) => handleInputNameChange(index, 'stackName', e.target.value)}
                  className="input-field mr-2 w-100"
                  placeholder="Enter Stack Name"
                  style={{ padding: '15px', borderRadius: '10px' }}
                />
                </div>
              </div>

              <div className="col-lg-5 col-md-5">
                <div className="form-group">
                  <input
                    type="text"
                    value={stack.stationType}
                    onChange={(e) => handleInputNameChange(index, 'stationType', e.target.value)}
                    className="form-control"
                    placeholder="Enter Station Type"
                    style={{ padding: '15px', borderRadius: '10px' }}
                  />
                </div>
              </div>

              {index > 0 && (
                <div className="col-lg-2 col-md-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveInput(index)}
                    className="btn btn-danger"
                    style={{ padding: '10px 20px' }}
                  >
                    -
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddInput}
            className="btn btn-secondary mb-3"
            style={{ color: 'white' }}
          >
            + Add Another Stack Name and Station Type
          </button>

          {/* Save and Cancel Buttons */}
          <div className="mt-4">
            <button onClick={handleSave} className="btn btn-success mb-2" style={{ color: 'white' }}>
              Save Stack Names
            </button>
            <button onClick={handleCancel} className="btn btn-danger mb-2 ms-2" style={{ color: 'white' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

  </div>
</div>


        {/* delete user */}
        <div className="row" style={{overflowX:'hidden'}}>
  <div className="col-12 col-md-12 grid-margin">
    <div className="col-12 d-flex justify-content-between align-items-center m-3">
      <h1 className='text-center mt-5'>Delete Users</h1>
    </div>
    <div className="card">
      <div className="card-body">
        <form className='m-2 p-5' >
          <div className="row">
            {/* User ID Input */}
            <div className="col-lg-6 col-md-6 mb-4">
              <div className="form-group">
                <label htmlFor="userId" className="form-label">User ID</label>
                <input 
                  id="userId" 
                  placeholder='User ID' 
                  className="form-control"  
                  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} 
                  value={userName}
                  onChange={(e)=>setUserName(e.target.value)}  // Update the userId state on input change
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-danger ms-1" onClick={handleSubmitDelete} style={{ color:'white' }}>Delete User</button>
        </form>
      </div>
    </div>
  </div>
</div>

<div className="row" style={{overflowX:'hidden'}}>
          <div className="col-12 col-md-12 grid-margin">
                <div className="col-12 d-flex justify-content-between align-items-center m-3" >
                    <h1 className='text-center mt-5'>Edit Users</h1>
                </div>
                <div className="card ">
                    <div className="card-body">
                    <ul className="list-group">
          {users.map((user) => (
            <li key={user.userId} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{user.companyName}</span> {/* Display company name */}
              <button 
  className="btn"  
  style={{backgroundColor:'#236a80' , color:'white'}} 
  onClick={() => navigate(`/edit/${user._id}`, { state: { userId: user.userId } })}>
  Edit
</button>

            </li>
          ))}
        </ul>
                    </div>
                </div>
            </div>

           
        </div>







          <ToastContainer />
        </div>

        
      </div>
    </div>
  );
};

export default UsersLog;
