import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import KeralaMap from './KeralaMap';
import DashboardSam from "../Dashboard/DashboardSam";
import Hedaer from "../Header/Hedaer";
import { fetchUsers, addUser ,deleteUser ,addStackName, fetchUserByCompanyName,clearState, setFilteredUsers , uploadLogo, editLogo, deleteLogo  } from "../../redux/features/userLog/userLogSlice"; // Add action for fetching and adding users
import { useDispatch, useSelector } from "react-redux";
import './userlog.css'
const UsersLog = () => {
  const dispatch = useDispatch();
  const { users, filteredUsers, loading, error } = useSelector(
    (state) => state.userLog
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [sortCategory, setSortCategory] = useState("");
  const [sortOptions, setSortOptions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [stackLoading, setStackLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [stacks, setStacks] = useState([{ stackName: "", stationType: "" }]);
  const [formData, setformData] = useState({
    userName: "",
    companyName: "",
    modelName: "",
    fname: "",
    email: "",
    additionalEmails: [""], // start with one empty email input
    mobileNumber: "",
    password: "",
    cpassword: "",
    subscriptionDate: "",
    subscriptionPlan: "", // <-- New subscription field
    userType: "",
    industryType: "",
    dataInteval: "",
    district: "",
    state: "",
    address: "",
    latitude: "",
    longitude: "",
    productID: "",
    adminType: "",
    operators: []     , 
  });
  
  const [userName, setUserName] = useState("");

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
    { category: "Hotel" },
    { category: "Aluminium" },
    { category: "STP/ETP" },
    { category: "NWMS/SWMS" },
    { category: "Noise" },
    { category: "Other" },
   
  ];

  // Fetch users filtered by adminType or show all if no adminType
  // Fetch users filtered by adminType or show all if adminType is Ebhoom
useEffect(() => {
  const fetchUsersData = async () => {
    try {
      const response = await dispatch(fetchUsers()).unwrap(); // Fetch all users

      if (userData?.validUserOne?.adminType === "EBHOOM") {
        // Show all users if adminType is Ebhoom
        dispatch(setFilteredUsers(response));
      } else if (userData?.validUserOne?.adminType) {
        // Filter users based on adminType and exclude admins
        const filtered = response.filter(
          (user) =>
            user.adminType === userData.validUserOne.adminType &&
            user.userType === "user"
        );
        dispatch(setFilteredUsers(filtered));
      } else {
        // Fallback in case no adminType is available
        dispatch(setFilteredUsers([]));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.", { position: "top-center" });
    }
  };

  fetchUsersData();
}, [dispatch, userData]);

  

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setformData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const validateFields = () => {
    const {
      userName,
      companyName,
      fname,
      email,
      mobileNumber,
      password,
      cpassword,
    } = formData;

    if (
      !userName ||
      !companyName ||
      !fname ||
      !email ||
      !mobileNumber ||
      !password ||
      !cpassword
    ) {
      return false;
    }
    return true;
  };
// inside component:
const handleAddOperator = () => {
  setformData(prev => ({
    ...prev,
    operators: [
      ...prev.operators,
      { name: "", email: "", password: "", userType: "operator" }
    ]
  }));
};

const handleOperatorChange = (idx, e) => {
  const { name, value } = e.target;
  setformData(prev => {
    const ops = [...prev.operators];
    ops[idx] = { ...ops[idx], [name]: value };
    return { ...prev, operators: ops };
  });
};

const handleRemoveOperator = (idx) => {
  setformData(prev => ({
    ...prev,
    operators: prev.operators.filter((_, i) => i !== idx)
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateFields()) {
    toast.error("Please fill all the fields", { position: "top-center" });
    return;
  }

  if (formData.password !== formData.cpassword) {
    toast.error("Passwords do not match", { position: "top-center" });
    return;
  }

  try {
    // send everything, including formData.operators
    await dispatch(addUser(formData)).unwrap();
    toast.success("User added successfully", { position: "top-center" });

    // reset all fields — operators too
    setformData({
      userName: "",
      companyName: "",
      modelName: "",
      fname: "",
      email: "",
      additionalEmails: [""],
      mobileNumber: "",
      password: "",
      cpassword: "",
      subscriptionDate: "",
      subscriptionPlan: "",
      userType: "",
      adminType: "",
      industryType: "",
      dataInteval: "",
      district: "",
      state: "",
      address: "",
      latitude: "",
      longitude: "",
      productID: "",
      // reset operators array
      operators: []
    });

    dispatch(fetchUsers());
  } catch (error) {
    console.log("Error in AddUser:", error);
    toast.error("An error occurred. Please try again.", {
      position: "top-center",
    });
  }
};


  const handleDeleteUser = async (userId) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success("User deleted successfully!");
      dispatch(fetchUsers());
    } catch (error) {
      toast.error("Failed to delete user: " + (error.message || error.toString()));
    }
  };
  const handleAdditionalEmailChange = (index, value) => {
    const emails = [...formData.additionalEmails];
    emails[index] = value;
    setformData({ ...formData, additionalEmails: emails });
  };
  
  const handleAddAdditionalEmail = () => {
    setformData({ ...formData, additionalEmails: [...formData.additionalEmails, ""] });
  };
  
  const handleCompanyChange = async (event) => {
    const companyName = event.target.value;
    setSelectedCompany(companyName);

    if (companyName) {
      setStackLoading(true);
      try {
        const result = await dispatch(fetchUserByCompanyName(companyName)).unwrap();
        const formattedStacks = result.stackName.map((stack) => ({
          stackName: stack.name || "",
          stationType: stack.stationType || "",
        }));
        setStacks(formattedStacks);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data.");
        setStacks([{ stackName: "", stationType: "" }]);
      } finally {
        setStackLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedCompany) {
      toast.error("Please select a company", { position: "top-center" });
      return;
    }

    const stackData = stacks.map((stack) => ({
      name: stack.stackName,
      stationType: stack.stationType,
    }));

    try {
      await dispatch(
        addStackName({
          companyName: selectedCompany,
          stackData,
        })
      ).unwrap();
      toast.success("Stack Names and Station Types added successfully", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error adding stack names:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-center",
      });
    }
  };

  const handleSortCategoryChange = (category) => {
    setSortCategory(category);
    if (category === "Industry Type") {
      const uniqueIndustryTypes = [
        ...new Set(users.map((user) => user.industryType)),
      ];
      setSortOptions(uniqueIndustryTypes);
    } else if (category === "Location") {
      const uniqueLocations = [...new Set(users.map((user) => user.district))];
      setSortOptions(uniqueLocations);
    }
  };

  const handleSortOptionSelect = (option) => {
    const sortedUsers = [...users].filter(
      (user) =>
        (sortCategory === "Industry Type" ? user.industryType : user.district) ===
        option
    );
    dispatch(setFilteredUsers(sortedUsers));
  };
  const handleInputNameChange = (index, field, value) => {
    const newStacks = [...stacks];
    newStacks[index][field] = value;
    setStacks(newStacks);
  };
  const handleUserClick = (userName) => {
   
  };
  const handleRemoveInput = (index) => {
    const newStacks = stacks.filter((_, idx) => idx !== index);
    setStacks(newStacks);
  };
  const handleAddInput = () => {
    setStacks([...stacks, { stackName: "", stationType: "" }]);
  };
  const handleCancel = () => {
    navigate("/manage-user");
  };
  const handleSubmitDelete = async (e) => {
    e.preventDefault();
  
    if (!userName) {
      return toast.warning("Please Enter the user ID", {
        position: "top-center",
      });
    }
  
    try {
      await dispatch(deleteUser(userName)).unwrap();
      toast.success("User deleted successfully!", { position: "top-center" });
      setUserName("");
    } catch (error) {
      console.error(`Error deleting user:`, error);
      toast.error("Error in Deleting User / User ID not found", {
        position: "top-center",
      });
    }
  };
  const adminFilteredUsers = filteredUsers.filter(
    (user) =>
      user.adminType?.toLowerCase() === userData?.validUserOne?.adminType?.toLowerCase() &&
      user.latitude && user.longitude // Ensure valid coordinates
  );
  
  console.log('Admin Filtered Users:', adminFilteredUsers);
  
       
/* logo handle */
/* Logo handle */
const handleLogoUpload = async () => {
  if (!logoFile) {
    toast.error("Please select a logo file to upload", { position: "top-center" });
    return;
  }

  if (!userName || !formData.adminType) {
    toast.error("Please provide both username and admin type", { position: "top-center" });
    return;
  }

  try {
    console.log("Uploading logo with the following data:");
    console.log("User Name:", userName); // Log username
    console.log("Admin Type:", formData.adminType); // Log adminType

    const data = new FormData(); // Create a new FormData instance
    data.append("logo", logoFile); // Append the logo file
    data.append("userName", userName); // Include username
    data.append("adminType", formData.adminType); // Include adminType from your state

    for (let [key, value] of data.entries()) {
      console.log(`${key}: ${value}`); // Log FormData entries for debugging
    }

    // Dispatch the action to upload the logo
    await dispatch(uploadLogo(data)).unwrap();
    toast.success("Logo uploaded successfully", { position: "top-center" });
    setLogoFile(null); // Reset the file input
  } catch (error) {
    console.error("Error uploading logo:", error);
    toast.error(
      error.response?.data?.error || "Failed to upload logo. Please try again.",
      { position: "top-center" }
    );
  }
};



const handleLogoEdit = async () => {
  if (!logoFile) {
    toast.error("Please select a new logo file to update", { position: "top-center" });
    return;
  }
  if (!userName || !formData.adminType) {
    toast.error("Please provide both username and admin type", { position: "top-center" });
    return;
  }
  try {
    const formData = new FormData();
    formData.append("logo", logoFile);
    formData.append("userName", userName); // Include username
    formData.append("adminType", formData.adminType); // Include adminType

    await dispatch(editLogo(formData)).unwrap();
    toast.success("Logo updated successfully", { position: "top-center" });
    setLogoFile(null); // Reset the file input
  } catch (error) {
    console.error("Error updating logo:", error);
    toast.error("Failed to update logo. Please try again.", { position: "top-center" });
  }
};

const handleLogoDelete = async () => {
  if (!userName || !formData.adminType) {
    toast.error("Please provide both username and admin type", { position: "top-center" });
    return;
  }
  try {
    const formData = new FormData();
    formData.append("userName", userName); // Include username
    formData.append("adminType", formData.adminType); // Include adminType

    await dispatch(deleteLogo(formData)).unwrap();
    toast.success("Logo deleted successfully", { position: "top-center" });
  } catch (error) {
    console.error("Error deleting logo:", error);
    toast.error("Failed to delete logo. Please try again.", { position: "top-center" });
  }
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
                  <KeralaMap
        users={filteredUsers.filter(
          (user) => user.latitude && user.longitude
        )}
      />                </div>
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
<div class="">
  <div>Loading ...</div>
  
</div>}
{error && <p>Error fetching users: {error.message || JSON.stringify(error)}</p>}

            {!loading && !error && (
  <div className="user-list-container">
    <table className="userlog-table">
      <thead>
        <tr>
          <th className="userlog-head">Company Name</th>
          <th className="userlog-head">User Name</th>
          <th className="userlog-head">Industry Type</th>
          <th className="userlog-head">Location</th>
        </tr>
      </thead>
      <tbody>
        {filteredUsers.map((user) => (
          <tr key={user._id} onClick={() => handleUserClick(user.userName)}>
            <td className="userlog-head">{user.companyName}</td>
            <td className="userlog-head">{user.userName}</td>
            <td className="userlog-head">{user.industryType}</td>
            <td className="userlog-head">{user.district}</td>
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
                                        <label htmlFor="userId" className="form-label text-light">User ID</label>
                                        <input id="userId" type="text" placeholder='User ID' className="form-control"    value={formData.userName} 
                          onChange={handleInputChange}  name="userName" style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>


                                {/* Select Company */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="companyName" className="form-label  text-light">Company Name </label>
                                        <input type='text' id="companyName" placeholder='Company Name'    name="companyName"  className="form-control"    value={formData.companyName} 
                          onChange={handleInputChange}   style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>


                              
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="firstName" className="form-label  text-light">First Name </label>
                                        <input id="firstName" value={formData.fname}   onChange={handleInputChange} name="fname"  placeholder='First Name ' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>


                               
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label  text-light">Email  </label>
                                        <input id="email" value={formData.email}   onChange={handleInputChange} type='email' name="email" placeholder='email' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                {/* additioanl email */}
                                <div className="col-lg-6 col-md-6 mb-4">
  <div className="form-group">
    <label htmlFor="additionalEmails" className="form-label text-light">
      Additional Emails
    </label>
    {formData.additionalEmails.map((email, index) => (
      <div
        key={index}
        style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
      >
        <input
          id={`additionalEmail-${index}`}
          type="email"
          value={email}
          onChange={(e) => handleAdditionalEmailChange(index, e.target.value)}
          placeholder="Additional Email"
          className="form-control"
          style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
        />
        {index === formData.additionalEmails.length - 1 && (
          <button
          style={{ color:"#236a80"}}
            type="button"
            onClick={handleAddAdditionalEmail}
            className="btn bg-light  ms-2 "
            
          >
            +
          </button>
        )}
      </div>
    ))}
  </div>
</div>

                                {/* mobile number */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="mobile" className="form-label  text-light">Mobile Number  </label>
                                        <input id="mobile" value={formData.mobileNumber}   onChange={handleInputChange} name="mobileNumber"  type='text' placeholder=' Enter Mobile Number ' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                              {/* model name */}
                              <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="modelName" className="form-label  text-light">Model Name  </label>
                                        <input id="modelName" value={formData.modelName}   onChange={handleInputChange}  type='text' name="modelName" placeholder='Enter Model name' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                {/* Poduct ID */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="productID" className="form-label  text-light"> Product ID </label>
                                        <input id="productID"  value={formData.productID}   onChange={handleInputChange}  name="productID" type='text' placeholder='Enter  Poduct ID' className="form-control"  style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />

                                    </div>
                                </div>
                                {/* Password */}
                                <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                    <label htmlFor="password" className="form-label text-light"> Password </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            id="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter Password"
                            className="form-control"
                            style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: 'gray'
                            }}
                        >
                            {showPassword ? '👁️' : '🙈'}
                        </span>
                    </div>
                </div>
            </div>
                                 {/*  Confirm Password */}
                                 <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label text-light"> Confirm Password </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            id="confirmPassword"
                            value={formData.cpassword}
                            onChange={handleInputChange}
                            name="cpassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Enter Password"
                            className="form-control"
                            style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                        />
                        <span
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: 'gray'
                            }}
                        >
                            {showConfirmPassword ? '👁️' : '🙈'}
                        </span>
                    </div>
                </div>
            </div>
                                 {/* To Date */}
                                 <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="subscriptionDate" className="form-label  text-light"> Date of subscription</label>
                                        <input id="subscriptionDate"  value={formData.subscriptionDate}   onChange={handleInputChange} name="subscriptionDate" className="form-control" type="date" style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 mb-4">
  <div className="form-group">
    <label htmlFor="subscriptionPlan" className="form-label text-light">Subscription Plan</label>
    <select
      id="subscriptionPlan"
      name="subscriptionPlan"
      value={formData.subscriptionPlan}
      onChange={handleInputChange}
      className="form-control"
      style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
    >
      <option value="">Select Subscription Plan</option>
      <option value="Business Basic">Business Basic</option>
      <option value="Business Standard">Business Standard</option>
      <option value="Business Premium">Business Premium</option>
    </select>
  </div>
</div>
                                {/* User Type */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="userType" className="form-label  text-light">User Type</label>
                                        <select id="userType" className="form-control" value={formData.userType}   onChange={handleInputChange} name="userType" style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
                                        <option value="select">Select</option>
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                            {/* Add options for companies */}
                                        </select>
                                    </div>
                                </div>

                                {/* User Type */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="adminType" className="form-label  text-light">Admin Type</label>
                                        <select id="adminType" className="form-control" value={formData.adminType}   onChange={handleInputChange} name="adminType" style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
                                        <option value="select">Select</option>
                                        <option value="KSPCB">KSPCB</option>
                                        <option value="Genex">Genex</option>
                                        <option value="Banka_bio">Banka Bio</option>
                                        <option value="IESS">IESS</option>



                                            {/* Add options for companies */}
                                        </select>
                                    </div>
                                </div>
                                {formData.userType === "user" && (
  <div className="mb-4">
    <h5 className="text-light">Operators</h5>
    {formData.operators.map((op, i) => (
      <div key={i} className="d-flex align-items-center mb-2">
        <input
          name="name"
          value={op.name}
          onChange={e => handleOperatorChange(i, e)}
          placeholder="Operator Name"
          className="form-control me-2"
          style={{ width: '33%',padding: '15px', }}
        />
        <input
          name="email"
          type="email"
          value={op.email}
          onChange={e => handleOperatorChange(i, e)}
          placeholder="Operator Email"
          className="form-control me-2"
          style={{ width: '33%' , padding: '15px',}}
        />
        <input
          name="password"
          type="password"
          value={op.password}
          onChange={e => handleOperatorChange(i, e)}
          placeholder="Operator Password"
          className="form-control me-2"
          style={{ width: '33%', padding: '15px', }}
        />
        <button
          type="button"
          className="btn btn-sm btn-danger"
          onClick={() => handleRemoveOperator(i)}
        >
          &times;
        </button>
      </div>
    ))}

    <button
      type="button"
      className="btn btn-sm btn-secondary"
      onClick={handleAddOperator}
    >
      + Add Operator
    </button>
  </div>
)}
                                {/* select industry */}
                                <div className="col-lg-6 col-md-6 mb-4">
                                    <div className="form-group">
                                        <label htmlFor="industry" className="form-label  text-light">Select Industry</label>
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
    <label htmlFor="time" className="form-label  text-light">Select Time Interval</label>
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
                                        <label htmlFor="district" className="form-label  text-light">District</label>
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
                                        <label htmlFor="state" className="form-label  text-light">State</label>
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
                                        <label htmlFor="address" className="form-label  text-light">Address</label>
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
                                        <label htmlFor="latitude" className="form-label  text-light">Latitude</label>
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
                                        <label htmlFor="longitude" className="form-label  text-light">Longitude   </label>
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

       
      {/* logo components */}
      <div className="row">
        <div className="col-lg-12 col-md-6">
          {userData?.validUserOne?.adminType === "EBHOOM" && (
           <div className="card mt-4">
           <div className="card-body">
             <h4 className="text-center text-light">Manage Logo</h4>
             <div className="d-flex flex-column align-items-center">
               <input
                 type="text"
                 placeholder="Enter Username"
                 value={userName}
                 onChange={(e) => setUserName(e.target.value)}
                 className="form-control mb-3"
                 style={{ width: "300px" }}
               />
               <input
                 type="text"
                 placeholder="Enter Admin Type"
                 value={formData.adminType}
                 onChange={(e) =>
                   setformData((prev) => ({ ...prev, adminType: e.target.value }))
                 }
                 className="form-control mb-3"
                 style={{ width: "300px" }}
               />
               <input
                 type="file"
                 onChange={(e) => setLogoFile(e.target.files[0])}
                 className="form-control mb-3"
                 style={{ width: "300px" }}
               />
               <div className="d-flex justify-content-center">
                 <button
                   className="btn btn-success mx-2"
                   onClick={handleLogoUpload}
                 >
                   Upload Logo
                 </button>
                 <button
                   className="btn btn-warning mx-2"
                   onClick={handleLogoEdit}
                 >
                   Edit Logo
                 </button>
                 <button
                   className="btn btn-danger mx-2"
                   onClick={handleLogoDelete}
                 >
                   Delete Logo
                 </button>
               </div>
               {selectedLogo && (
                 <div className="mt-3">
                   <img
                     src={selectedLogo}
                     alt="Uploaded Logo"
                     style={{ maxWidth: "150px", maxHeight: "150px" }}
                   />
                 </div>
               )}
             </div>
           </div>
         </div>
         
          )}
         
        </div>
      </div>
  

        {/* add stack */}
        <div className="col-12 d-flex justify-content-between align-items-center m-3" >
                    <h1 className='text-center mt-5'>Add Station Types</h1>
                </div>
        <div className="card">
  <div className="card-body">
    {stackLoading ? (
      <div className="text-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p>Loading Stack Names, please wait...</p>
      </div>
    ) : (
      <form className="m-2 p-5">
        {/* Select Company */}
        <div className="row">
          <div className="col-lg-12 col-md-6 mb-4">
            <div className="form-group">
              <label htmlFor="company" className="form-label text-light">Select Company</label>
              <select
  id="company"
  className="form-control"
  value={selectedCompany}
  onChange={handleCompanyChange}
  style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
>
  <option value="">Select Company</option>
  {filteredUsers.map((user) => (
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
    )}
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
  {filteredUsers.map((user) => (
    <li
      key={user.userId}
      className="list-group-item d-flex justify-content-between align-items-center"
    >
      <span>{user.companyName}</span>
      <div className="d-flex justify-content-end align-items-center ">
      <button
        className="btn me-2"
        style={{ backgroundColor: 'orange', color: 'white' }}
        onClick={() => navigate(`/view/${user._id}`, { state: { userId: user.userId } })}
      >
        View
      </button>
      <button
        className="btn"
        style={{ backgroundColor: '#236a80', color: 'white' }}
        onClick={() => navigate(`/edit/${user._id}`, { state: { userId: user.userId } })}
      >
        Edit
      </button>
      </div>
   
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
