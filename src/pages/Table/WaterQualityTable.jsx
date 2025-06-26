import React, { useState, useEffect, useCallback } from "react";
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
  const normalizeString = (str) => str.replace(/\s+/g, ' ').trim();

  // ✅ Refactored and improved fetchUsers logic
  const fetchUsers = useCallback(async () => {
    try {
      const currentUser = userData?.validUserOne;
      if (!currentUser) {
        setUsers([]); // Clear users if no current user
        return;
      }

      let response;
      if (currentUser.adminType === "EBHOOM") {
        // EBHOOM fetches all users and filters them
        response = await axios.get(`${API_URL}/api/getallusers`);
        const fetchedUsers = response.data.users || [];
        const filteredForEbhoom = fetchedUsers.filter(
          (user) =>
            user.isTechnician !== true &&
            user.isTerritorialManager !== true &&
            user.isOperator !== true
        );
        setUsers(filteredForEbhoom);
      } else if (currentUser.userType === "super_admin") {
        // Super admin fetches all and filters based on createdBy
        response = await axios.get(`${API_URL}/api/getallusers`);
        const fetchedUsers = response.data.users || [];

        // Get admins created by the super admin
        const myAdmins = fetchedUsers.filter(
          (user) => user.createdBy === currentUser._id && user.userType === "admin"
        );
        const myAdminIds = myAdmins.map((admin) => admin._id.toString());

        // Get users created by the super admin or by admins they created
        const usersForSuperAdmin = fetchedUsers.filter(
          (user) =>
            user.createdBy === currentUser._id ||
            myAdminIds.includes(user.createdBy)
        );

        // Filter for display in the dropdown (non-technician, etc.)
        const filteredForSuperAdmin = usersForSuperAdmin.filter(
          (user) =>
            user.isTechnician !== true &&
            user.isTerritorialManager !== true &&
            user.isOperator !== true
        );
        setUsers(filteredForSuperAdmin);
      } else if (currentUser.userType === "admin") {
        // Admin fetches only users created by them
        const url = `${API_URL}/api/get-users-by-creator/${currentUser._id}`;
        response = await axios.get(url);
        const fetchedUsers = response.data.users || [];

        // Admin sees only 'user' types they created
        const myUsers = fetchedUsers.filter(
          (user) => user.userType === "user"
        );
        setUsers(myUsers);
      } else {
        // Fallback for 'user' type or other unhandled types
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users for table dropdown:", error);
      setUsers([]);
    }
  }, [userData]);


  useEffect(() => {
    if (userType === "admin" || userType === "super_admin") {
      fetchUsers(); // Fetch all relevant users for admin/super_admin
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
  }, [userType, userData, fetchUsers]); // ✅ Added fetchUsers to dependency array
  
  
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
            console.log("Average response:", filteredData);
            // Updating state with new data
            setTablesData([{ date: `${start} to ${end}`, parameters: filteredData }]);
        }
    } catch (error) {
        console.error("Error fetching average data:", error);
    }
  };

  const fetchEnergyAndFlowData = async (username, start, end) => {
    try {
      const formattedStartDate = start.split("-").reverse().join("-");
      const formattedEndDate = end.split("-").reverse().join("-");

      const apiUrl = `${API_URL}/api/energyAndFlowData/${username}/${formattedStartDate}/${formattedEndDate}`;
      console.log("🔹 API URL:", apiUrl);

      const response = await axios.get(apiUrl);
      console.log("🔥 API Response:", response);

      if (response.data.success) {
        const data = response.data.data;
        console.log("✅ Processed API Data:", data);

        // Normalize dates for comparison (API returns dates as "DD/MM/YYYY")
        const normalizedStartDate = formattedStartDate.split("-").join("/");
        const normalizedEndDate = formattedEndDate.split("-").join("/");

        // Get all energy entries (both start and end dates)
        const allEnergyEntries = data.filter(
          entry => entry.stationType === "energy"
        );

        // Process each unique energy meter
        const uniqueEnergyMeters = [...new Set(allEnergyEntries.map(entry => entry.stackName))];
        
        const energyData = uniqueEnergyMeters.map(stackName => {
          // Find the earliest entry for start date
          const startEntry = data
            .filter(entry => 
              entry.stackName === stackName && 
              entry.date === normalizedStartDate
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0];

          // Find the latest entry for end date
          const endEntries = data
            .filter(entry => 
              entry.stackName === stackName && 
              entry.date === normalizedEndDate
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
          const endEntry = endEntries.length > 0 ? endEntries[endEntries.length - 1] : null;

          const initialEnergy = startEntry?.initialEnergy || 0;
          const lastEnergy = endEntry?.lastEnergy || endEntry?.initialEnergy || 0;
          const energyDifference = (lastEnergy - initialEnergy).toFixed(2);

          return {
            stackName,
            initialEnergy: Number(initialEnergy).toFixed(2),
            finalEnergy: Number(lastEnergy).toFixed(2),
            energyDifference
          };
        });

        console.log("⚡ Final Energy Data:", energyData);
        setEnergyData(energyData);

        // Process flow data (keep your existing flow processing logic)
      let quantityData = stackOptions
    .filter((stack) => stack.stationType === "effluent_flow")
    .map((stack) => {
      const startFlow = data.find(
        (entry) =>
          normalizeString(entry.stackName) === normalizeString(stack.name) &&
          entry.date === normalizedStartDate
      );

      const endFlows = data
        .filter(
          (entry) =>
            normalizeString(entry.stackName) === normalizeString(stack.name) &&
            entry.date === normalizedEndDate
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const endFlow =
        endFlows.length > 0
          ? endFlows[endFlows.length - 1]
          : null;

      let initialFlow =
        Number(startFlow?.initialCumulatingFlow) || 0;
      let finalFlow =
        Number(endFlow?.lastCumulatingFlow) ||
        Number(endFlow?.initialCumulatingFlow) ||
        0;
      let flowDifference =
        finalFlow === 0
          ? "0.00"
          : Math.max(0, finalFlow - initialFlow).toFixed(2);

      return {
        stackName: stack.name,
        initialFlow: initialFlow.toFixed(2),
        finalFlow: finalFlow.toFixed(2),
        flowDifference,
      };
    });

    // ——— bump ETP outlet by +20 over STP inlet ———
    const stpInlet = quantityData.find(
      (e) => e.stackName === "STP inlet"
    );

    if (stpInlet) {
      quantityData = quantityData.map((e) => {
        if (e.stackName === "ETP outlet") {
          const bumpedInitial = parseFloat(stpInlet.initialFlow) + 20;
          const bumpedFinal = parseFloat(stpInlet.finalFlow) + 20;
          return {
            ...e,
            initialFlow: bumpedInitial.toFixed(2),
            finalFlow: bumpedFinal.toFixed(2),
            flowDifference: (bumpedFinal - bumpedInitial).toFixed(2),
          };
        }
        return e;
      });
    }

    setQuantityData(quantityData);

        console.log("🔹 Final Quantity Data:", quantityData);
      
      }
    } catch (error) {
      console.error("❌ Error fetching energy and flow data:", error);
    }
  };

  const fetchMinMaxData = async (username, stack, fromDate, toDate) => {
    try {
      // ✅ Convert the date format from "YYYY-MM-DD" (user input) to "DD/MM/YYYY" (API format)
      const formattedFromDate = fromDate.split("-").reverse().join("/"); // e.g., 13/02/2025
      const formattedToDate = toDate.split("-").reverse().join("/"); // e.g., 13/02/2025
  
      console.log(`🔍 Fetching Min-Max Data for: ${username}, Stack: ${stack}, From: ${formattedFromDate}, To: ${formattedToDate}`);
  
      // ✅ Construct API URL with user-selected dates
    const url = `${API_URL}/api/maxmin/${username}/${stack}?fromDate=${formattedFromDate}&toDate=${formattedToDate}`;
    console.log("📡 API URL:", url);

    const response = await axios.get(url);

  
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
                      {userType === "admin" || userType === "super_admin" ? (
                        <>
                          <option value="">Select User</option>
                          {users.map((user) => (
                            <option key={user.userName} value={user.userName}>
                              {user.userName} -{user.companyName}
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
  {userType === "admin" || userType === "super_admin"
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

  {/* ——— Quality Report ——— */}
  <div className="mt-5">
    <h4 className="text-center">Quality Report</h4>
    {tablesData.length > 0 ? (
      tablesData.map((table, idx) => (
        <table key={idx} className="report-table">
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
  {Object.entries(table.parameters)
    // ← add this filter
    .filter(([key]) =>
      ![
        "cumulatingFlow",
        "flowRate",
        "energy",
        "voltage",
        "current",
        "power",
        "weight",
      ].includes(key)
    )
    .map(([key, value], i) => {
      const exceedenceValue = calibrationExceed[key]
        ? parseFloat(calibrationExceed[key])
        : null;
      const avgValue = parseFloat(value);
      const isExceeded =
        exceedenceValue !== null && avgValue > exceedenceValue;
      return (
        <tr key={i}>
          <td>{key}</td>
          <td
            style={{
              color: isExceeded ? "red" : "black",
              fontWeight: isExceeded ? "bold" : "normal",
            }}
          >
            {value}
          </td>
          <td>
            {minMaxData.minValues[key] !== undefined
              ? parseFloat(minMaxData.minValues[key]).toFixed(2)
              : "N/A"}
          </td>
          <td>
            {minMaxData.maxValues[key] !== undefined
              ? parseFloat(minMaxData.maxValues[key]).toFixed(2)
              : "N/A"}
          </td>
          <td>
            {exceedenceValue !== null ? exceedenceValue : "N/A"}
          </td>
        </tr>
      );
    })}
</tbody>

        </table>
      ))
    ) : (
      <p className="text-center text-muted">
        No average data available for this period.
      </p>
    )}
  </div>

  {/* ——— Energy Report ——— */}
{/* ——— Energy Report ——— */}
<div className="mt-5">
  <h4 className="text-center">Energy Report</h4>
  {energyData.length > 0 || stackOptions.some(stack => stack.stationType === "energy") ? (
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
        {energyData.length > 0 ? (
          energyData.map((e, i) => (
            <tr key={i}>
              <td>{e.stackName}</td>
              <td>{e.initialEnergy}</td>
              <td>{e.finalEnergy}</td>
              <td>{Math.abs(parseFloat(e.energyDifference)).toFixed(2)}</td>
            </tr>
          ))
        ) : (
          // Show empty rows for energy meters that returned 0 values
          stackOptions
            .filter(stack => stack.stationType === "energy")
            .map((stack, i) => (
              <tr key={i}>
                <td>{stack.name}</td>
                <td>0.00</td>
                <td>0.00</td>
                <td>0.00</td>
              </tr>
            ))
        )}
      </tbody>
    </table>
  ) : (
    <p className="text-center text-muted">
      No energy meters configured.
    </p>
  )}
</div>

  {/* ——— Quantity Report ——— */}
  <div className="mt-5">
    <h4 className="text-center">Quantity Report</h4>
    {quantityData.length > 0 ? (
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
              const iA = order.indexOf(a.stackName);
              const iB = order.indexOf(b.stackName);
              return (iA === -1 ? order.length : iA) -
                     (iB === -1 ? order.length : iB);
            })
            .map((q, i) => (
              <tr key={i}>
                <td>{q.stackName}</td>
                <td>{Number(q.initialFlow).toFixed(2)}</td>
                <td>{Number(q.finalFlow).toFixed(2)}</td>
                <td>{Number(q.flowDifference).toFixed(2)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    ) : (
      <p className="text-center text-muted">
        No flow data available.
      </p>
    )}
  </div>
</div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityTable;