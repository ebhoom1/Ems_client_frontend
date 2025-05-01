import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserById } from "../../redux/features/userLog/userLogSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";

function Edit() {
  const { userId } = useParams(); // Get the userId from the route parameters
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedUser, loading, error } = useSelector(
    (state) => state.userLog
  ); // Fetch the selectedUser from the Redux store

  const [adminList, setAdminList] = useState([]);

  const [userData, setUserData] = useState({
    userName: "",
    companyName: "",
    modelName: "",
    fname: "",
    email: "",
    additionalEmails: [""], // Changed from a single email to an array
    mobileNumber: "",
    /*   password: '',
    cpassword: '', */
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
    adminType: "",
    operators: [],
    territorialManager: "",
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
    { category: "Hotel" },
    { category: "Aluminium" },
    { category: "STP/ETP" },
    { category: "NWMS/SWMS" },
    { category: "Noise" },
    { category: "Other" },
  ];

  // Fetch user data when component mounts
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
    }
  }, [dispatch, userId]);

  // Set form data when selectedUser is updated.
  // If the fetched user has additionalEmails, use them; otherwise, fallback to an array containing the single additionalEmail.
  useEffect(() => {
    if (selectedUser) {
      setUserData((prevData) => ({
        ...prevData,
        ...selectedUser,
        operators: selectedUser.operators || [],
        additionalEmails:
          selectedUser.additionalEmails &&
          selectedUser.additionalEmails.length > 0
            ? selectedUser.additionalEmails
            : selectedUser.additionalEmail
            ? [selectedUser.additionalEmail]
            : [""], // Ensure at least one input is rendered
      }));
    }
  }, [selectedUser]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/get-territory-mangers`);
        setAdminList(res.data.admins); // store all territory managers list
      } catch (error) {
        console.error("Error fetching admin users:", error);
      }
    };

    fetchAdmins();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler for changes in additional emails
  const handleAdditionalEmailChange = (index, value) => {
    const newEmails = [...userData.additionalEmails];
    newEmails[index] = value;
    setUserData({ ...userData, additionalEmails: newEmails });
  };
  const handleAddOperator = () => {
    setUserData((prev) => ({
      ...prev,
      operators: [
        ...prev.operators,
        { name: "", email: "", password: "", userType: "operator" },
      ],
    }));
  };

  const handleOperatorChange = (idx, e) => {
    const { name, value } = e.target;
    setUserData((prev) => {
      const ops = [...prev.operators];
      ops[idx] = { ...ops[idx], [name]: value };
      return { ...prev, operators: ops };
    });
  };

  const handleRemoveOperator = (idx) => {
    setUserData((prev) => ({
      ...prev,
      operators: prev.operators.filter((_, i) => i !== idx),
    }));
  };

  // Add a new additional email field
  const handleAddAdditionalEmail = () => {
    setUserData({
      ...userData,
      additionalEmails: [...userData.additionalEmails, ""],
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(
        `${API_URL}/api/edituser/${userId}`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("User updated successfully!");
        setTimeout(() => {
          navigate("/manage-user");
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user.");
    }
  };

  const handleCancel = () => {
    navigate("/manage-user");
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
              <Header />
            </div>
          </div>
          <div>
            <div className="row" style={{ overflowX: "hidden" }}>
              <div className="col-12 col-md-12 grid-margin">
                <div className="col-12 d-flex justify-content-between align-items-center m-3">
                  <h1 className="text-center mt-5">Edit User</h1>
                </div>

                <div className="card">
                  <div className="card-body">
                    <form className="m-2 p-5" onSubmit={handleSaveUser}>
                      <div className="row">
                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="userId" className="form-label">
                              User ID
                            </label>
                            <input
                              id="userId"
                              name="userName"
                              value={userData.userName || ""}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="companyName" className="form-label">
                              Company Name
                            </label>
                            <input
                              id="companyName"
                              name="companyName"
                              value={userData.companyName || ""}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="firstName" className="form-label">
                              First Name
                            </label>
                            <input
                              id="firstName"
                              name="fname"
                              value={userData.fname || ""}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="email" className="form-label">
                              Email
                            </label>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              value={userData.email || ""}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>

                        {/* Render additionalEmails as dynamic input fields */}
                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label
                              htmlFor="additionalEmails"
                              className="form-label"
                            >
                              Additional Emails
                            </label>
                            {userData.additionalEmails.map((email, index) => (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: "10px",
                                }}
                              >
                                <input
                                  id={`additionalEmails-${index}`}
                                  type="email"
                                  value={email}
                                  onChange={(e) =>
                                    handleAdditionalEmailChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="form-control"
                                  style={{
                                    width: "100%",
                                    padding: "15px",
                                    borderRadius: "10px",
                                  }}
                                />
                                {index ===
                                  userData.additionalEmails.length - 1 && (
                                  <button
                                    style={{ color: "#236a80" }}
                                    type="button"
                                    onClick={handleAddAdditionalEmail}
                                    className="btn btn-light ms-2"
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="mobile" className="form-label">
                              Mobile Number
                            </label>
                            <input
                              id="mobile"
                              name="mobileNumber"
                              value={userData.mobileNumber || ""}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="model" className="form-label">
                              Model Name
                            </label>
                            <input
                              id="model"
                              name="modelName"
                              value={userData.modelName || ""}
                              onChange={handleChange}
                              placeholder="Enter Model name"
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="productID" className="form-label">
                              Product ID
                            </label>
                            <input
                              id="productID"
                              type="text"
                              name="productID"
                              placeholder="Enter Product ID"
                              value={userData.productID || ""}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>

                        {/* Password fields */}
                        {/*  <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                              id="password"
                              type="password"
                              placeholder="Enter Password"
                              value={userData.password || ''}
                              name="password"
                              onChange={handleChange}
                              className="form-control"
                              style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                            />
                          </div>
                        </div> */}
                        {/*  <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="cpassword" className="form-label">Confirm Password</label>
                            <input
                              id="cpassword"
                              type="password"
                              placeholder="Enter Password"
                              value={userData.cpassword || ''}
                              name="cpassword"
                              onChange={handleChange}
                              className="form-control"
                              style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                            />
                          </div>
                        </div> */}

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label
                              htmlFor="subscriptionDate"
                              className="form-label"
                            >
                              Date of subscription
                            </label>
                            <input
                              id="subscriptionDate"
                              className="form-control"
                              name="subscriptionDate"
                              value={userData.subscriptionDate || ""}
                              onChange={handleChange}
                              type="date"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label
                              htmlFor="subscriptionPlan"
                              className="form-label text-light"
                            >
                              Subscription Plan
                            </label>
                            <select
                              id="subscriptionPlan"
                              name="subscriptionPlan"
                              value={userData.subscriptionPlan || ""}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            >
                              <option value="">Select Subscription Plan</option>
                              <option value="Business Basic">
                                Business Basic
                              </option>
                              <option value="Business Standard">
                                Business Standard
                              </option>
                              <option value="Business Premioum">
                                Business Premioum
                              </option>
                            </select>
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="user" className="form-label">
                              User Type
                            </label>
                            <select
                              id="user"
                              value={userData.userType || ""}
                              onChange={handleChange}
                              name="userType"
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            >
                              <option value="select">Select</option>
                              <option value="admin">Admin</option>
                              <option value="user">User</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="admin" className="form-label">
                              Admin Type
                            </label>
                            <select
                              id="admin"
                              value={userData.adminType || ""}
                              onChange={handleChange}
                              name="adminType"
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            >
                              <option value="select">Select</option>
                              <option value="KSPCB">KSPCB</option>
                              <option value="Genex">Genex</option>
                            </select>
                          </div>
                        </div>

                        {/* Territorial Manager */}
                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label
                              htmlFor="territorialManager"
                              className="form-label text-light"
                            >
                              Assign Territorial Manager
                            </label>
                            <select
                              id="territorialManager"
                              name="territorialManager"
                              value={userData.territorialManager}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            >
                              <option value="">
                                Select Territorial Manager
                              </option>
                              {adminList.map((admin) => (
                                <option key={admin._id} value={admin._id}>
                                  {admin.fname} ({admin.userName})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {userData.userType === "user" && (
                          <div className="mb-4">
                            <h5>Operators</h5>
                            {userData.operators.map((op, i) => (
                              <div
                                key={i}
                                className="d-flex align-items-center mb-2"
                              >
                                <input
                                  name="name"
                                  value={op.name}
                                  onChange={(e) => handleOperatorChange(i, e)}
                                  placeholder="Operator Name"
                                  className="form-control me-2"
                                  style={{ width: "33%", padding: "15px" }}
                                />
                                <input
                                  name="email"
                                  type="email"
                                  value={op.email}
                                  onChange={(e) => handleOperatorChange(i, e)}
                                  placeholder="Operator Email"
                                  className="form-control me-2"
                                  style={{ width: "33%", padding: "15px" }}
                                />
                                <input
                                  name="password"
                                  type="password"
                                  value={op.password}
                                  onChange={(e) => handleOperatorChange(i, e)}
                                  placeholder="Operator Password"
                                  className="form-control me-2"
                                  style={{ width: "33%", padding: "15px" }}
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
                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="industry" className="form-label">
                              Select Industry
                            </label>
                            <select
                              id="industry"
                              value={userData.industryType || ""}
                              onChange={handleChange}
                              name="industryType"
                              className="form-control text-start"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            >
                              <option value="">Select Industry</option>
                              {industryType.map((industry, index) => (
                                <option key={index} value={industry.category}>
                                  {industry.category}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="dataInteval" className="form-label">
                              Select Time Interval
                            </label>
                            <select
                              id="dataInteval"
                              value={userData.dataInteval || ""}
                              onChange={handleChange}
                              name="dataInteval"
                              className="form-control text-start"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            >
                              <option value="">Select</option>
                              <option value="15_sec">15 sec</option>
                              <option value="1_min">Less than 1 min</option>
                              <option value="15_min">Less than 15 min</option>
                              <option value="30_min">Less than 30 min</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="district" className="form-label">
                              District
                            </label>
                            <input
                              id="district"
                              type="text"
                              value={userData.district || ""}
                              onChange={handleChange}
                              name="district"
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="state" className="form-label">
                              State
                            </label>
                            <input
                              id="state"
                              name="state"
                              type="text"
                              placeholder="Enter State"
                              value={userData.state || ""}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="address" className="form-label">
                              Address
                            </label>
                            <input
                              id="address"
                              name="address"
                              type="text"
                              placeholder="Enter Address"
                              value={userData.address || ""}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="latitude" className="form-label">
                              Latitude
                            </label>
                            <input
                              id="latitude"
                              name="latitude"
                              type="text"
                              placeholder="Enter Latitude"
                              value={userData.latitude || ""}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div className="form-group">
                            <label htmlFor="longitude" className="form-label">
                              Longitude
                            </label>
                            <input
                              id="longitude"
                              name="longitude"
                              type="text"
                              placeholder="Enter Longitude"
                              value={userData.longitude || ""}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn"
                        style={{ backgroundColor: "#236a80", color: "white" }}
                      >
                        Update User
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger ms-1"
                        onClick={handleCancel}
                        style={{ color: "white" }}
                      >
                        Cancel
                      </button>
                    </form>

                    <ToastContainer />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default Edit;
