
import React, { useState, useEffect } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./TableStyles.css";
import { API_URL } from "../../utils/apiConfig";
import Header from "../Header/Hedaer";
import Maindashboard from "../Maindashboard/Maindashboard";
import DashboardSam from "../Dashboard/DashboardSam";

const WaterQualityTable = () => {
  const [userDetails, setUserDetails] = useState({
    stackName: "",
    companyName: "",
    address: "",
  });
  const industryTypeList = [
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

  const { userType, userData } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [stackOptions, setStackOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedStack, setSelectedStack] = useState("");
  const [selectedIndustryType, setSelectedIndustryType] = useState("");
  const [tablesData, setTablesData] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [quantityData, setQuantityData] = useState([]);
  const [minMaxData, setMinMaxData] = useState({ minValues: {}, maxValues: {} });
  const [calibrationExceed, setCalibrationExceed] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const loggedUserName = userData?.validUserOne?.userName || "";

  useEffect(() => {
    if (userType === "admin") {
      fetchUsers(); // Fetch all users for admin
    } else if (userType === "user") {
      const username = userData?.userName || loggedUserName;
      setSelectedUser(username);
  
      // ✅ Ensure industryType is properly retrieved
      let industryType = userData?.validUserOne?.industryType || userData?.industryType || "";
      setSelectedIndustryType(industryType);
  
      fetchStackNames(username);
  
      setUserDetails({
        stackName: userData?.stackName || "",
        companyName: userData?.validUserOne?.companyName || "N/A",
        address: userData?.validUserOne?.address || userData?.address || "N/A",
      });
  
      if (industryType) {
        fetchCalibrationExceed(industryType);
      }
    }
  }, [userType, userData]);
  
  
 
    const fetchUsers = async () => {
      try {
        if (userData?.validUserOne) {
          let response;
          if (userData.validUserOne.adminType) {
            response = await axios.get(`${API_URL}/api/get-users-by-adminType/${userData.validUserOne.adminType}`);
          } else {
            response = await axios.get(`${API_URL}/api/getallusers`);
          }
          const filteredUsers = response.data.users.filter((user) => user.userType === 'user');
          setUsers(filteredUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    if (userData?.validUserOne) {
      fetchUsers();
    }
  

  const fetchStackNames = async (username) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/get-stacknames-by-userName/${username}`
      );

      // Filter stack names based on stationType
      const filteredStackOptions = response.data.stackNames.filter(
        (stack) =>
          stack.stationType === "energy" ||
          stack.stationType === "effluent_flow" ||
          stack.stationType === "effluent" ||
          stack.stationType === "emission"
      );

      setStackOptions(filteredStackOptions || []);
    } catch (error) {
      console.error("Error fetching stack names:", error);
    }
  };

  const fetchAvgData = async (username, stack, start, end) => {
    try {
        // Formatting date to match API requirements (DD-MM-YYYY)
        const formattedStartDate = start.split("-").reverse().join("-");
        const formattedEndDate = end.split("-").reverse().join("-");

        // API Call to the correct endpoint
        const response = await axios.get(
            `${API_URL}/api/average/user/${username}/stack/${stack}/time-range/average`,
            {
                params: {
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                },
            }
        );

        // If API call is successful
        if (response.data.success) {
            const data = response.data.data;

            // Filter out the `_id` parameter
            const filteredData = Object.fromEntries(
                Object.entries(data)
                    .filter(([key]) => key !== "_id") // Exclude _id
                    .map(([key, value]) => [key, value.toFixed(2)]) // Format values
            );

            // Updating state with new data
            setTablesData([{ date: `${start} to ${end}`, parameters: filteredData }]);
        }
    } catch (error) {
        console.error("Error fetching average data:", error);
    }
};


const fetchEnergyAndFlowData = async (username, start, end) => {
  try {
      // Format dates as `dd-MM-yyyy` to match the API endpoint
      const formattedStartDate = start.split("-").reverse().join("-"); // Convert `yyyy-MM-dd` to `dd-MM-yyyy`
      const formattedEndDate = end.split("-").reverse().join("-"); // Convert `yyyy-MM-dd` to `dd-MM-yyyy`

      const response = await axios.get(
          `${API_URL}/api/energyAndFlowData/${username}/${formattedStartDate}/${formattedEndDate}`
      );

      if (response.data.success) {
          const data = response.data.data;

          // Debug: Log the entire API response
          console.log("API Response:", data);

          // Filter data for the start and end dates
          const startDateData = data.filter((entry) => entry.date === formattedStartDate.split("-").join("/")); // Convert `dd-MM-yyyy` to `dd/MM/yyyy`
          const endDateData = data.filter((entry) => entry.date === formattedEndDate.split("-").join("/")); // Convert `dd-MM-yyyy` to `dd/MM/yyyy`

          console.log("Start Date Data:", startDateData);
          console.log("End Date Data:", endDateData);

          // ** Prepare energy data **
          const energyData = stackOptions
              .filter((stack) => stack.stationType === "energy")
              .map((stack) => {
                  const startEnergy = startDateData.find((entry) => entry.stackName === stack.name);
                  const endEnergy = endDateData.find((entry) => entry.stackName === stack.name);

                  const initialEnergy = parseFloat(startEnergy?.initialEnergy || 0).toFixed(2);
                  const lastEnergy = parseFloat(endEnergy?.lastEnergy || 0).toFixed(2);
                  const energyDifference = (parseFloat(lastEnergy) - parseFloat(initialEnergy)).toFixed(2);

                  return { stackName: stack.name, initialEnergy, lastEnergy, energyDifference };
              });

          console.log("Energy Data:", energyData);
          setEnergyData(energyData);

          // ** Prepare quantity data (Flow) **
          const quantityData = stackOptions
              .filter((stack) => stack.stationType === "effluent_flow")
              .map((stack) => {
                  const startFlow = startDateData.find((entry) => entry.stackName === stack.name);
                  const endFlow = endDateData.find((entry) => entry.stackName === stack.name);

                  let initialFlow = parseFloat(startFlow?.initialCumulatingFlow || 0);
                  let finalFlow = parseFloat(endFlow?.lastCumulatingFlow || 0);
                  let flowDifference = Math.abs(finalFlow - initialFlow).toFixed(2); // Absolute value to prevent negatives

                  // ✅ Special handling for STP inlet (Derived from ETP outlet + 15)
                  if (stack.name === "STP inlet") {
                      const etpOutletStart = startDateData.find((entry) => entry.stackName === "ETP outlet");
                      const etpOutletEnd = endDateData.find((entry) => entry.stackName === "ETP outlet");

                      if (etpOutletStart && etpOutletEnd) {
                          initialFlow = parseFloat(etpOutletStart.initialCumulatingFlow || 0) + 15;
                          finalFlow = parseFloat(etpOutletEnd.lastCumulatingFlow || 0) + 15;
                          flowDifference = Math.abs(finalFlow - initialFlow).toFixed(2);
                      }
                  }

                  return { stackName: stack.name, initialFlow, finalFlow, flowDifference };
              });

          console.log("Quantity Data:", quantityData);
          setQuantityData(quantityData);
      }
  } catch (error) {
      console.error("Error fetching energy and flow data:", error);
  }
};


  const fetchMinMaxData = async (username, stack, fromDate, toDate) => {
    try {
      // ✅ Convert the date format from "YYYY-MM-DD" (user input) to "DD/MM/YYYY" (API format)
      const formattedFromDate = fromDate.split("-").reverse().join("/"); // e.g., 13/02/2025
      const formattedToDate = toDate.split("-").reverse().join("/"); // e.g., 13/02/2025
  
      console.log(`🔍 Fetching Min-Max Data for: ${username}, Stack: ${stack}, From: ${formattedFromDate}, To: ${formattedToDate}`);
  
      // ✅ Construct API URL with user-selected dates
      const response = await axios.get(
        `${API_URL}/api/maxmin/${username}/${stack}?fromDate=${formattedFromDate}&toDate=${formattedToDate}`
      );
  
      if (response.data.success) {
        const apiData = response.data.data.find(item => item.stackName === stack);
  
        if (apiData) {
          console.log("✅ Min-Max API Response:", apiData);
  
          setMinMaxData({
            minValues: apiData.minValues || {}, // Ensure fallback
            maxValues: apiData.maxValues || {}, // Ensure fallback
          });
  
          console.log("✅ Stored Min Values:", apiData.minValues);
          console.log("✅ Stored Max Values:", apiData.maxValues);
        } else {
          console.warn("⚠ No Data Found for Selected Stack");
          setMinMaxData({ minValues: {}, maxValues: {} });
        }
      } else {
        console.warn("⚠ API Response Success = false");
        setMinMaxData({ minValues: {}, maxValues: {} });
      }
    } catch (error) {
      console.error("❌ Error fetching min/max data:", error);
      setMinMaxData({ minValues: {}, maxValues: {} });
    }
  };
  
  
  const fetchCalibrationExceed = async (industryType) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/get-calibration-values-industryType/${industryType}`
      );
      if (response.data.success) {
        setCalibrationExceed(response.data.IndustryTypCalibrationExceedValues[0] || {});
      }
    } catch (error) {
      console.error("Error fetching calibration exceed data:", error);
    }
  };

  const handleUserSelection = (e) => {
    const username = e.target.value;
    setSelectedUser(username);
  
    const selectedUserDetails = users.find((user) => user.userName === username);
  
    if (selectedUserDetails) {
      setUserDetails({
        stackName: selectedUserDetails.stackName || "",
        companyName: selectedUserDetails.companyName || "N/A",
        address: selectedUserDetails.address || "N/A",
      });
  
      // ✅ Properly fetch industry type with fallback
      const industryType =
        selectedUserDetails?.validUserOne?.industryType ||
        selectedUserDetails?.industryType ||
        "Not Available";
        
      setSelectedIndustryType(industryType);
      fetchCalibrationExceed(industryType);
    }
  
    fetchStackNames(username);
  };
  

  const handleIndustryTypeSelection = (e) => {
    const industryType = e.target.value;
    setSelectedIndustryType(industryType);
    fetchCalibrationExceed(industryType); // Fetch calibration exceed data for the selected industry type
  };

  const handleSubmit = () => {
    if (selectedUser && selectedStack && startDate && endDate) {
      fetchAvgData(selectedUser, selectedStack, startDate, endDate);
      fetchMinMaxData(selectedUser, selectedStack, startDate, endDate); // ✅ Pass dates
      fetchEnergyAndFlowData(selectedUser, startDate, endDate);
  
      if (selectedIndustryType) {
        fetchCalibrationExceed(selectedIndustryType);
      }
    } else {
      alert("Please select user, stack, and date range!");
    }
  };
  

  const downloadPDF = () => {
    const element = document.getElementById("table-to-download");
    html2pdf()
      .from(element)
      .set({
        margin: 0.5,
        filename: "water_quality_report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  const handleBack = () => {
    navigate("/view-report");
  };
  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3 d-none d-lg-block">
            <DashboardSam />
          </div>
          <div className="col-lg-9 col-12">
            <div className="row1">
              <div className="col-12">
                <div className="headermain">
                  <Header />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3 d-none d-lg-block"></div>
          <div className="col-lg-9 col-12">
            <div className="row">
              <div className="col-12"></div>
            </div>
            <div className="maindashboard">
              <Maindashboard />
            </div>
            <div className="table-container">
              <button
                onClick={downloadPDF}
                className={`download-btn btn btn-success ${userType === "user" ? "mt-5" : ""}`}
              >
                Download PDF
              </button>

              <h4 className="text-center mt-3">Customise Report </h4>

              <div className="mt-4 border border-solid shadow m-5 p-5" style={{ borderRadius: "10px" }}>
                <div className="row">
                  <div className="col-lg-6">
                    <select
                      value={selectedUser}
                      onChange={handleUserSelection}
                      className="form-select"
                      style={{
                        cursor: "pointer",
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                      }}
                    >
                      {userType === "admin" ? (
                        <>
                          <option value="">Select User</option>
                          {users.map((user) => (
                            <option key={user.userName} value={user.userName}>
                              {user.userName}
                            </option>
                          ))}
                        </>
                      ) : (
                        <>
                          <option value="">Select User</option>
                          <option value={loggedUserName}>{loggedUserName}</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="col-lg-6">
                  <select
  value={selectedStack}
  onChange={(e) => setSelectedStack(e.target.value)}
  className="form-select"
>
  <option value="">Select Stack</option>
  {stackOptions
    .filter((stack) => stack.stationType === "effluent") // Filter stacks with stationType "effluent"
    .map((stack, index) => (
      <option key={index} value={stack.name}>
        {stack.name}
      </option>
    ))}
</select>
 

                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-lg-6">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="col-lg-6">
                    <label>End Date:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-lg-6">
                  <select
  value={selectedIndustryType}
  onChange={handleIndustryTypeSelection}
  className="form-select"
>
  <option value="">Select Industry Type</option>
  {userType === "admin"
    ? users.map((user, index) => (
        <option key={index} value={user.industryType}>
          {user.industryType}
        </option>
      ))
    : industryTypeList.map((type, index) => (
        <option key={index} value={type.category}>
          {type.category}
        </option>
      ))}
</select>
{/* <p className="mt-2 text-muted">
  {selectedIndustryType ? `Selected Industry Type: ${selectedIndustryType}` : "No Industry Type Selected"}
</p> */}

                  </div>

                  <div className="col-lg-6">
                    <button
                      style={{ backgroundColor: "#236a80" }}
                      onClick={handleSubmit}
                      className="btn text-light"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>

              <div id="table-to-download">
                {selectedUser && startDate && endDate && (
                  <h4 className="text-center mt-4" style={{ color: "#236a80" }}>
                    Report for{" "}
                    {userType === "user"
                      ? userData?.validUserOne?.companyName || "N/A"
                      : userDetails.companyName}{" "}
                    from {new Date(startDate).toLocaleDateString("en-GB")} to{" "}
                    {new Date(endDate).toLocaleDateString("en-GB")}
                  </h4>
                )}

                {tablesData.map((table, index) => (
                  <div key={index} className="mt-5">
                    <h4 className="text-center">Quality Report</h4>
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Average Value</th>
                          <th>Min Value</th>
                          <th>Max Value</th> 
                          <th>Exceedence Limits</th>
                        </tr>
                      </thead>
                      <tbody>
  {Object.entries(table.parameters).map(([key, value], idx) => {
    const exceedenceValue = calibrationExceed[key] ? parseFloat(calibrationExceed[key]) : null; 
    const avgValue = parseFloat(value); 
    const isExceeded = exceedenceValue !== null && avgValue > exceedenceValue; 

    return (
      <tr key={idx}>
        <td>{key}</td>
        <td
          style={{
            color: isExceeded ? "red" : "black",
            fontWeight: isExceeded ? "bold" : "normal",
          }}
        >
          {value}
        </td>
        <td>{minMaxData.minValues[key] !== undefined ? minMaxData.minValues[key] : "N/A"}</td>
        <td>{minMaxData.maxValues[key] !== undefined ? minMaxData.maxValues[key] : "N/A"}</td>
        <td>{exceedenceValue !== null ? exceedenceValue : "N/A"}</td>
      </tr>
    );
  })}
</tbody>



                    </table>

                    <h4 className="text-center">Energy Report </h4>
{stackOptions.length > 0 ? (
  <table className="report-table">
    <thead>
      <tr>
        <th>Stack Name</th>
        <th>Initial Reading</th>
        <th>Last Reading</th>
        <th>Total kWh</th>
      </tr>
    </thead>
    <tbody>
      {energyData.map((energy, idx) => (
        <tr key={idx}>
          <td>{energy.stackName}</td>
          <td>{energy.initialEnergy}</td>
          <td>{energy.lastEnergy}</td>
          <td>{Math.abs(parseFloat(energy.energyDifference)).toFixed(2)}</td> {/* Ensure no negative sign */}
        </tr>
      ))}
    </tbody>
  </table>
) : (
  <p className="text-center">No energy report available.</p>
)}


<h4 className="text-center">Quantity Report</h4>
{stackOptions.length > 0 ? (
  <table className="report-table">
    <thead>
      <tr>
        <th>Stack Name</th>
        <th>Initial Reading (m³)</th>
        <th>Final Reading (m³)</th>
        <th>Total m³</th>
      </tr>
    </thead>
    <tbody>
      {quantityData
        .sort((a, b) => {
          const order = [
            "ETP outlet",
            "STP inlet",
            "STP acf outlet",
            "STP uf outlet",
            "STP softener outlet",
            "STP garden outlet 1",
            "STP garden outlet 2",
          ];

          const indexA = order.indexOf(a.stackName);
          const indexB = order.indexOf(b.stackName);
          return (indexA === -1 ? order.length : indexA) - (indexB === -1 ? order.length : indexB);
        })
        .map((quantity, idx) => (
          <tr key={idx}>
            <td>{quantity.stackName}</td>
            <td>{quantity.initialFlow.toFixed(2)}</td>
            <td>{quantity.finalFlow.toFixed(2)}</td>
            <td>{quantity.flowDifference}</td>
          </tr>
        ))}
    </tbody>
  </table>
) : (
  <p className="text-center">No quantity report available.</p>
)}


                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityTable;