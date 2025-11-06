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
import HeaderSim from "../Header/HeaderSim";

function Edit() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedUser, loading, error } = useSelector(
    (state) => state.userLog
  );
  const { users } = useSelector((state) => state.userLog);
  const [adminList, setAdminList] = useState([]);
  const [operatorList, setOperatorList] = useState([]);
  const [technicianList, setTechnicianList] = useState([]);
  const [assignedTechnicians, setAssignedTechnicians] = useState([]);
  const [userData, setUserData] = useState({
    userName: "",
    companyName: "",
    modelName: "",
    fname: "",
    email: "",
    additionalEmails: [""],
    mobileNumber: "",
    subscriptionDate: "",
    subscriptionPlan: "",
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
    technicians: [],
    engineerVisitNo: "",
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

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
    }
  }, [dispatch, userId]);

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
            : [""],
        technicians: selectedUser.technicians || [],
      }));
      setAssignedTechnicians(selectedUser.technicians || []);
    }
  }, [selectedUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const territoryRes = await axios.get(
          `${API_URL}/api/get-territory-mangers`
        );
        setAdminList(territoryRes.data.admins);

        const operatorsRes = await axios.get(`${API_URL}/api/get-operators`);
        setOperatorList(operatorsRes.data.users || []);

        const techRes = await axios.get(`${API_URL}/api/getAll-technicians`);
        const technicians = techRes.data.users.filter(
          (user) => user.isTechnician
        );
        setTechnicianList(technicians);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAdditionalEmailChange = (index, value) => {
    const newEmails = [...userData.additionalEmails];
    newEmails[index] = value;
    setUserData({ ...userData, additionalEmails: newEmails });
  };

  const handleAddAdditionalEmail = () => {
    setUserData({
      ...userData,
      additionalEmails: [...userData.additionalEmails, ""],
    });
  };

  const handleAssignTechnician = (techId) => {
    if (!userData.technicians.includes(techId)) {
      setUserData((prev) => ({
        ...prev,
        technicians: [...prev.technicians, techId],
      }));
      setAssignedTechnicians((prev) => [...prev, techId]);
    }
  };

  const handleRemoveTechnician = (techId) => {
    setUserData((prev) => ({
      ...prev,
      technicians: prev.technicians.filter((id) => id !== techId),
    }));
    setAssignedTechnicians((prev) => prev.filter((id) => id !== techId));
  };

  const handleAssignOperator = (operatorId) => {
    if (!userData.operators.includes(operatorId)) {
      setUserData((prev) => ({
        ...prev,
        operators: [...prev.operators, operatorId],
      }));
    }
  };

  const handleRemoveOperator = (operatorId) => {
    setUserData((prev) => ({
      ...prev,
      operators: prev.operators.filter((id) => id !== operatorId),
    }));
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
    return <div style={{ color: "#2c3e50", padding: "20px" }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: "#e74c3c", padding: "20px" }}>Error: {error.message}</div>;
  }

  const formGroupStyle = {
    marginBottom: "1.5rem",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.5rem",
    color: "#34495e",
    fontWeight: "600",
    fontSize: "0.95rem",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "2px dotted #3498db",
    backgroundColor: "#ffffff",
    color: "#2c3e50",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
  };

  const badgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "20px",
    marginRight: "8px",
    marginBottom: "8px",
    fontSize: "0.9rem",
    fontWeight: "500",
  };

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
            <div className="row" style={{ overflowX: "hidden" }}>
              <div className="col-12 col-md-12 grid-margin">
                <div className="col-12 d-flex justify-content-between align-items-center m-3">
                  <h1 style={{ color: "#236a80", fontWeight: "700", fontSize: "2rem" }}>
                    Edit User
                  </h1>
                </div>

                <div style={{
                  border: "3px dotted #236a80",
                  borderRadius: "15px",
                  backgroundColor: "#f8f9fa",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}>
                  <div style={{ padding: "2rem" }}>
                    <form onSubmit={handleSaveUser}>
                      <div className="row">
                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="userId" style={labelStyle}>
                              User ID
                            </label>
                            <input
                              id="userId"
                              name="userName"
                              value={userData.userName || ""}
                              onChange={handleChange}
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="companyName" style={labelStyle}>
                              Company Name
                            </label>
                            <input
                              id="companyName"
                              name="companyName"
                              value={userData.companyName || ""}
                              onChange={handleChange}
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="firstName" style={labelStyle}>
                              First Name
                            </label>
                            <input
                              id="firstName"
                              name="fname"
                              value={userData.fname || ""}
                              onChange={handleChange}
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="email" style={labelStyle}>
                              Email
                            </label>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              value={userData.email || ""}
                              onChange={handleChange}
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="additionalEmails" style={labelStyle}>
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
                                  style={inputStyle}
                                />
                                {index === userData.additionalEmails.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={handleAddAdditionalEmail}
                                    style={{
                                      marginLeft: "10px",
                                      padding: "10px 20px",
                                      borderRadius: "8px",
                                      border: "2px dotted #236a80",
                                      backgroundColor: "#236a80",
                                      color: "white",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                    }}
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="mobile" style={labelStyle}>
                              Mobile Number
                            </label>
                            <input
                              id="mobile"
                              name="mobileNumber"
                              value={userData.mobileNumber || ""}
                              onChange={handleChange}
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="model" style={labelStyle}>
                              Model Name
                            </label>
                            <input
                              id="model"
                              name="modelName"
                              value={userData.modelName || ""}
                              onChange={handleChange}
                              placeholder="Enter Model name"
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="productID" style={labelStyle}>
                              Product ID
                            </label>
                            <input
                              id="productID"
                              type="text"
                              name="productID"
                              placeholder="Enter Product ID"
                              value={userData.productID || ""}
                              onChange={handleChange}
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="subscriptionDate" style={labelStyle}>
                              Date of subscription
                            </label>
                            <input
                              id="subscriptionDate"
                              name="subscriptionDate"
                              value={
                                userData.subscriptionDate
                                  ? userData.subscriptionDate.split("T")[0]
                                  : ""
                              }
                              onChange={handleChange}
                              type="date"
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="subscriptionPlan" style={labelStyle}>
                              Subscription Plan
                            </label>
                            <select
                              id="subscriptionPlan"
                              name="subscriptionPlan"
                              value={userData.subscriptionPlan || ""}
                              onChange={handleChange}
                              style={selectStyle}
                            >
                              <option value="">Select Subscription Plan</option>
                              <option value="Business Basic">Business Basic</option>
                              <option value="Business Standard">Business Standard</option>
                              <option value="Business Premioum">Business Premioum</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="user" style={labelStyle}>
                              User Type
                            </label>
                            <select
                              id="user"
                              value={userData.userType || ""}
                              onChange={handleChange}
                              name="userType"
                              style={selectStyle}
                            >
                              <option value="select">Select</option>
                              <option value="admin">Admin</option>
                              <option value="user">User</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="admin" style={labelStyle}>
                              Admin Type
                            </label>
                            <select
                              id="admin"
                              value={userData.adminType || ""}
                              onChange={handleChange}
                              name="adminType"
                              style={selectStyle}
                            >
                              <option value="select">Select</option>
                              <option value="KSPCB">KSPCB</option>
                              <option value="Genex">Genex</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="territorialManager" style={labelStyle}>
                              Assign Territorial Manager
                            </label>
                            <select
                              id="territorialManager"
                              name="territorialManager"
                              value={userData.territorialManager}
                              onChange={handleChange}
                              style={selectStyle}
                            >
                              <option value="">Select Territorial Manager</option>
                              {adminList.map((admin) => (
                                <option key={admin._id} value={admin._id}>
                                  {admin.fname} ({admin.userName})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label style={labelStyle}>Assign Technician(s)</label>
                            <div className="mb-3">
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignTechnician(e.target.value);
                                  }
                                }}
                                style={selectStyle}
                              >
                                <option value="">Select Technician</option>
                                {technicianList
                                  .filter((tech) => !userData.technicians.includes(tech._id))
                                  .map((tech) => (
                                    <option key={tech._id} value={tech._id}>
                                      {tech.fname} ({tech.userName})
                                    </option>
                                  ))}
                              </select>
                            </div>

                            <div className="mt-2">
                              {assignedTechnicians.map((techId) => {
                                const tech = technicianList.find((t) => t._id === techId);
                                return tech ? (
                                  <span
                                    key={techId}
                                    style={{
                                      ...badgeStyle,
                                      backgroundColor: "#27ae60",
                                      color: "white",
                                      border: "2px dotted #229954",
                                    }}
                                  >
                                    {tech.fname} ({tech.userName})
                                    <button
                                      type="button"
                                      aria-label="Remove"
                                      onClick={() => handleRemoveTechnician(techId)}
                                      style={{
                                        marginLeft: "8px",
                                        background: "none",
                                        border: "none",
                                        color: "white",
                                        fontSize: "1.2rem",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>

                        {userData.userType === "user" && (
                          <div className="col-12 mb-4">
                            <div style={formGroupStyle}>
                              <label style={labelStyle}>Assign Operator(s)</label>
                              <div className="mb-3">
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAssignOperator(e.target.value);
                                    }
                                  }}
                                  style={selectStyle}
                                >
                                  <option value="">Select Operator</option>
                                  {operatorList
                                    .filter((op) => !userData.operators.includes(op._id))
                                    .map((op) => (
                                      <option key={op._id} value={op._id}>
                                        {op.fname} ({op.userName})
                                      </option>
                                    ))}
                                </select>
                              </div>

                              <div className="mt-2">
                                {userData.operators.map((operatorId) => {
                                  const operator = operatorList.find((op) => op._id === operatorId);
                                  return operator ? (
                                    <span
                                      key={operatorId}
                                      style={{
                                        ...badgeStyle,
                                        backgroundColor: "#3498db",
                                        color: "white",
                                        border: "2px dotted #2980b9",
                                      }}
                                    >
                                      {operator.fname} ({operator.userName})
                                      <button
                                        type="button"
                                        aria-label="Remove"
                                        onClick={() => handleRemoveOperator(operatorId)}
                                        style={{
                                          marginLeft: "8px",
                                          background: "none",
                                          border: "none",
                                          color: "white",
                                          fontSize: "1.2rem",
                                          cursor: "pointer",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="industry" style={labelStyle}>
                              Select Industry
                            </label>
                            <select
                              id="industry"
                              value={userData.industryType || ""}
                              onChange={handleChange}
                              name="industryType"
                              style={selectStyle}
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
                          <div style={formGroupStyle}>
                            <label htmlFor="dataInteval" style={labelStyle}>
                              Select Time Interval
                            </label>
                            <select
                              id="dataInteval"
                              value={userData.dataInteval || ""}
                              onChange={handleChange}
                              name="dataInteval"
                              style={selectStyle}
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
                          <div style={formGroupStyle}>
                            <label htmlFor="district" style={labelStyle}>
                              District
                            </label>
                            <input
                              id="district"
                              type="text"
                              value={userData.district || ""}
                              onChange={handleChange}
                              name="district"
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="state" style={labelStyle}>
                              State
                            </label>
                            <input
                              id="state"
                              name="state"
                              type="text"
                              placeholder="Enter State"
                              value={userData.state || ""}
                              onChange={handleChange}
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="address" style={labelStyle}>
                              Address
                            </label>
                            <input
                              id="address"
                              name="address"
                              type="text"
                              placeholder="Enter Address"
                              value={userData.address || ""}
                              onChange={handleChange}
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="latitude" style={labelStyle}>
                              Latitude
                            </label>
                            <input
                              id="latitude"
                              name="latitude"
                              type="text"
                              placeholder="Enter Latitude"
                              value={userData.latitude || ""}
                              onChange={handleChange}
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="longitude" style={labelStyle}>
                              Longitude
                            </label>
                            <input
                              id="longitude"
                              name="longitude"
                              type="text"
                              placeholder="Enter Longitude"
                              value={userData.longitude || ""}
                              onChange={handleChange}
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6 mb-4">
                          <div style={formGroupStyle}>
                            <label htmlFor="engineerVisitNo" style={labelStyle}>
                              Engineer Visit No
                            </label>
                            <input
                              id="engineerVisitNo"
                              type="text"
                              placeholder="Enter Engineer Visit Number"
                              value={userData.engineerVisitNo || ""}
                              onChange={handleChange}
                              name="engineerVisitNo"
                              style={inputStyle}
                            />
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: "2rem" }}>
                        <button
                          type="submit"
                          style={{
                            padding: "12px 30px",
                            borderRadius: "8px",
                            border: "2px dotted #236a80",
                            backgroundColor: "#236a80",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "1rem",
                            cursor: "pointer",
                            marginRight: "10px",
                            transition: "all 0.3s ease",
                          }}
                        >
                          Update User
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          style={{
                            padding: "12px 30px",
                            borderRadius: "8px",
                            border: "2px dotted #e74c3c",
                            backgroundColor: "#e74c3c",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "1rem",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
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