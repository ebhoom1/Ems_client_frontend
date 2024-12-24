import React, { useState, useEffect } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./TableStyles.css";
import { API_URL } from "../../utils/apiConfig";

const WaterQualityTable = () => {
  const [userDetails, setUserDetails] = useState({
    stackName: "",
    companyName: "",
    address: "",
  });
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

  useEffect(() => {
    if (userType === "admin") {
      fetchUsers();
    }
  }, [userType]);

  const fetchUsers = async () => {
    const token = localStorage.getItem("userdatatoken");
    try {
      const response = await axios.get(`${API_URL}/api/getallusers`, {
        headers: { Authorization: token },
      });
      setUsers(response.data.users.filter((user) => user.userType === "user"));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchStackNames = async (username) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/get-stacknames-by-userName/${username}`
      );
  
      // Filter stack names based on stationType
      const filteredStackOptions = response.data.stackNames.filter((stack) =>
        stack.stationType === "energy" || stack.stationType === "effluent_flow"
      );
  
      setStackOptions(filteredStackOptions || []);
    } catch (error) {
      console.error("Error fetching stack names:", error);
    }
  };
  

  const fetchAvgData = async (username, stack, start, end) => {
    try {
      const formattedStartDate = start.split("-").reverse().join("-");
      const formattedEndDate = end.split("-").reverse().join("-");

      const response = await axios.get(
        `${API_URL}/api/last-entry/user/${username}/stack/${stack}/interval/hour`,
        {
          params: {
            startTime: formattedStartDate,
            endTime: formattedEndDate,
          },
        }
      );

      if (response.data.success) {
        setTablesData(
          response.data.data.map((entry) => ({
            date: entry.dateAndTime.split(" ")[0],
            parameters: Object.fromEntries(
              Object.entries(entry.stackData[0]?.parameters || {}).filter(
                ([key]) => key !== "_id"
              )
            ),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching average data:", error);
    }
  };
  const fetchEnergyData = async (username, start, end) => {
    try {
      const formattedStartDate = start.split("-").reverse().join("-");
      const formattedEndDate = end.split("-").reverse().join("-");
  
      const response = await axios.get(
        `${API_URL}/api/lastDataByDateRange/${username}/daily/${formattedStartDate}/${formattedEndDate}`
      );
  
      if (response.data.success) {
        setEnergyData(
          response.data.data
            .filter((entry) => entry.stationType === "energy")
            .map((entry) => ({
              date: entry.date,
              stackName: entry.stackName,
              initialEnergy: entry.initialEnergy,
              lastEnergy: entry.lastEnergy,
              energyDifference: entry.energyDifference,
            }))
        );
  
        setQuantityData(
          response.data.data
            .filter((entry) => entry.stationType === "effluent_flow")
            .map((entry) => ({
              date: entry.date,
              stackName: entry.stackName,
              initialCumulatingFlow: entry.initialCumulatingFlow,
              lastCumulatingFlow: entry.lastCumulatingFlow,
              cumulatingFlowDifference: entry.cumulatingFlowDifference,
            }))
        );
      }
    } catch (error) {
      console.error("Error fetching energy/quantity data:", error);
    }
  };
  
  

  const fetchMinMaxData = async (username, stack) => {
    try {
      const response = await axios.get(`${API_URL}/api/minMax/${username}/stack/${stack}`);
      if (response.data.success) {
        setMinMaxData({
          minValues: response.data.data.minValues || {},
          maxValues: response.data.data.maxValues || {},
        });
      }
    } catch (error) {
      console.error("Error fetching min/max data:", error);
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
  
    // Find the selected user's details from the already fetched users
    const selectedUserDetails = users.find((user) => user.userName === username);
  
    if (selectedUserDetails) {
      setUserDetails({
        stackName: selectedUserDetails.stackName || "",
        companyName: selectedUserDetails.companyName || "N/A",
        address: selectedUserDetails.address || "N/A",
      });
      console.log("Selected User Details:", selectedUserDetails);
    } else {
      console.error("User details not found for username:", username);
    }
  
    fetchStackNames(username); // Fetch stack names for the user
  };
  

  const handleIndustryTypeSelection = (e) => {
    const industryType = e.target.value;
    setSelectedIndustryType(industryType);
    fetchCalibrationExceed(industryType);
  };

  const handleSubmit = () => {
    if (selectedUser && startDate && endDate) {
      fetchAvgData(selectedUser, selectedStack, startDate, endDate);
      fetchMinMaxData(selectedUser, selectedStack);
      fetchEnergyData(selectedUser, startDate, endDate);
      if (selectedIndustryType) fetchCalibrationExceed(selectedIndustryType);
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
    <div className="table-container">
      <button className="btn btn-warning me-2" onClick={handleBack}>
        <i className="fa-solid fa-arrow-left me-1"></i>Back
      </button>
      <button onClick={downloadPDF} className="download-btn btn btn-success">
        Download PDF
      </button>
      {userType === "admin" && (
        <div className="mt-2">
          <div className="row">
            <div className="col-lg-4">
              <select
                value={selectedUser}
                onChange={handleUserSelection}
                className="form-select"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.userName} value={user.userName}>
                    {user.userName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-lg-4">
              <select
                value={selectedStack}
                onChange={(e) => setSelectedStack(e.target.value)}
                className="form-select"
              >
                <option value="">Select Stack</option>
                {stackOptions.map((stack, index) => (
                  <option key={index} value={stack.name}>
                    {stack.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-lg-4">
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
          </div>
          <div className="row mt-3">
            <div className="col-lg-4">
              <label>Start Date:</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-lg-4">
              <label>End Date:</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-lg-4">
              <button
                style={{ backgroundColor: "#236a80" }}
                onClick={handleSubmit}
                className="btn mt-4 text-light"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

     

      <div id="table-to-download">
      {selectedUser && startDate && endDate && (
  <h4 className="text-center mt-4" style={{color:'#236a80'}}>
    Report for {userDetails.companyName} from{" "}
    {new Date(startDate).toLocaleDateString("en-GB")} to{" "}
    {new Date(endDate).toLocaleDateString("en-GB")}
  </h4>
)}

        {tablesData.map((table, index) => (
          <div key={index} className="mt-5">
            <h4 className="text-center">Quality Report for {table.date}</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Average Value</th>
                  <th>Min Value</th>
                  <th>Max Value</th>
                  <th>Calibration Exceed</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(table.parameters).map(([key, value], idx) => (
                  <tr key={idx}>
                    <td>{key}</td>
                    <td>{value}</td>
                    <td>{minMaxData.minValues[key] || "N/A"}</td>
                    <td>{minMaxData.maxValues[key] || "N/A"}</td>
                    <td>{calibrationExceed[key] || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4 className="text-center">Energy Report for {table.date}</h4>
{stackOptions.length > 0 ? (
  <table className="report-table">
    <thead>
      <tr>
        <th>Stack Name</th>
        <th>Initial Energy</th>
        <th>Last Energy</th>
        <th>Energy Difference</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {stackOptions
        .filter((stack) => stack.stationType === "energy") // Filter stacks by stationType
        .map((stack, idx) => {
          const energy = energyData.find(
            (energyd) =>
              energyd.date === table.date && energyd.stackName === stack.name
          );
          return (
            <tr key={idx}>
              <td>{stack.name}</td>
              <td>{energy?.initialEnergy || 0}</td>
              <td>{energy?.lastEnergy || 0}</td>
              <td>{energy?.energyDifference || 0}</td>
              <td>{energy?.total || 0}</td>
            </tr>
          );
        })}
    </tbody>
  </table>
) : (
  <p className="text-center">No energy report available.</p>
)}


<h4 className="text-center">Quantity Report for {table.date}</h4>
{stackOptions.length > 0 ? (
  <table className="report-table">
    <thead>
      <tr>
        <th>Stack Name</th>
        <th>Initial Flow</th>
        <th>Last Flow</th>
        <th>Flow Difference</th>
      </tr>
    </thead>
    <tbody>
      {stackOptions
        .filter((stack) => stack.stationType === "effluent_flow") // Filter stacks by stationType
        .map((stack, idx) => {
          const quantity = quantityData.find(
            (quantd) =>
              quantd.date === table.date && quantd.stackName === stack.name
          );
          return (
            <tr key={idx}>
              <td>{stack.name}</td>
              <td>{quantity?.initialCumulatingFlow || 0}</td>
              <td>{quantity?.lastCumulatingFlow || 0}</td>
              <td>{quantity?.cumulatingFlowDifference || 0}</td>
            </tr>
          );
        })}
    </tbody>
  </table>
) : (
  <p className="text-center">No quantity report available.</p>
)}

          </div>
        ))}
      </div>
    </div>
  );
};

export default WaterQualityTable;
