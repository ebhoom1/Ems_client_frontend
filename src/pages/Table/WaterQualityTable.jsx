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
  const [stackParameters, setStackParameters] = useState({});
  const [energyData, setEnergyData] = useState([]);
  const [qualityData, setQualityData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (userType === "admin") {
      fetchUsers();
    } else {
      fetchUserData();
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
      setStackOptions(response.data.stackNames || []);
    } catch (error) {
      console.error("Error fetching stack names:", error);
    }
  };

  const fetchUserData = async (username) => {
    const token = localStorage.getItem("userdatatoken");
    try {
      const response = await axios.get(`${API_URL}/api/validuser`, {
        headers: { Authorization: token },
      });

      if (response.data.status === 201 && response.data.validUserOne) {
        const user = username
          ? users.find((u) => u.userName === username)
          : response.data.validUserOne;

        const { userName, stackName: stacks, companyName, address } = user;

        setUserDetails({
          companyName,
          address,
        });

        const allStackParameters = {};
        for (const stack of stacks) {
          const minMaxData = await fetchMinMaxData(userName, stack.name);
          const avgData = await fetchAvgData(userName, stack.name, startDate, endDate);
          allStackParameters[stack.name] = mergeParameters(minMaxData, avgData);
        }

        setStackParameters(allStackParameters);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchMinMaxData = async (username, stack) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/minMax/${username}/stack/${stack}`
      );
      if (response.data.success) {
        const { minValues, maxValues, minTimestamps, maxTimestamps } =
          response.data.data;

        return Object.keys(minValues).map((param) => ({
          name: param,
          min: minValues[param],
          max: maxValues[param],
          minTime: minTimestamps?.[param]?.time || "N/A",
          maxTime: maxTimestamps?.[param]?.time || "N/A",
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching Min/Max data:", error);
      return [];
    }
  };

  const fetchAvgData = async (username, stack, start, end) => {
    try {
      const formattedStartDate = formatDate(start);
      const formattedEndDate = formatDate(end);

      const response = await axios.get(
        `${API_URL}/api/average/user/${username}/stack/${stack}/interval/hour/time-range`,
        {
          params: {
            startTime: formattedStartDate,
            endTime: formattedEndDate,
          },
        }
      );

      if (response.data.success) {
        const avgData = response.data.data.flatMap((item) =>
          item.stackData ? item.stackData[0]?.parameters || {} : {}
        );

        const latestData = avgData.slice(-1); // Take the latest data only
        return Object.keys(latestData[0] || {}).map((param) => ({
          name: param,
          avg: latestData[0][param] || "N/A",
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching average data:", error);
      return [];
    }
  };

  const fetchEnergyAndQualityData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/difference/${selectedUser}?interval=daily&page=1&limit=10`
      );
  
      const data = response.data.data || [];
  
      // Filter and ensure only unique, latest entries for energy data
      const uniqueEnergyData = [];
      const energySet = new Set(); // To track unique stack names
      data
        .filter((item) =>
          item.stackName.toLowerCase().includes("energy")
        )
        .forEach((item) => {
          if (!energySet.has(item.stackName)) {
            energySet.add(item.stackName);
            uniqueEnergyData.push({
              name: item.stackName,
              initialReading: item.initialEnergy,
              finalReading: item.lastEnergy,
              difference: item.energyDifference,
            });
          }
        });
  
      // Filter and ensure only unique, latest entries for quality data
      const uniqueQualityData = [];
      const qualitySet = new Set(); // To track unique stack names
      data
        .filter((item) =>
          item.stackName.toLowerCase().includes("flow") ||
          item.stackName.toLowerCase().includes("effluent")
        )
        .forEach((item) => {
          if (!qualitySet.has(item.stackName)) {
            qualitySet.add(item.stackName);
            uniqueQualityData.push({
              name: item.stackName,
              initialReading: item.initialCumulatingFlow,
              finalReading: item.lastCumulatingFlow,
              difference: item.cumulatingFlowDifference,
            });
          }
        });
  
      setEnergyData(uniqueEnergyData);
      setQualityData(uniqueQualityData);
    } catch (error) {
      console.error("Error fetching energy and quality data:", error);
    }
  };
  

  const mergeParameters = (minMaxData, avgData) => {
    return minMaxData.map((param) => ({
      ...param,
      avg: avgData.find((p) => p.name === param.name)?.avg || "N/A",
    }));
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleUserSelection = (e) => {
    const username = e.target.value;
    setSelectedUser(username);
    fetchStackNames(username);
  };

  const handleSubmit = async () => {
    if (selectedUser && startDate && endDate) {
      await fetchUserData(selectedUser);
      await fetchEnergyAndQualityData();
    } else {
      alert("Please select user and date range!");
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
            <div className="col-lg-4 mt-4">
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
          </div>
          <div className="row mt-3">
            <button
              style={{ backgroundColor: "#236a80" }}
              onClick={handleSubmit}
              className="btn mt-3 text-light"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      <div id="table-to-download">
        <h4 className="text-center mt-3" style={{ color: "#236a80" }}>
          Report for {userDetails.companyName || "N/A"}
        </h4>

        <h4>Energy Report</h4>
        <table className="report-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Initial Reading</th>
              <th>Final Reading</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            {energyData.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.initialReading}</td>
                <td>{item.finalReading}</td>
                <td>{item.difference}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h4>Quality Report</h4>
        <table className="report-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Initial Reading</th>
              <th>Final Reading</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            {qualityData.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.initialReading}</td>
                <td>{item.finalReading}</td>
                <td>{item.difference}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {Object.keys(stackParameters).map((stackName, index) => (
          <div key={index}>
            <h4>Quality Report for Station: {stackName}</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Avg Value</th>
                  <th>Min Value</th>
                  <th>Max Value</th>
                  <th>Min Acceptable Limits</th>
                  <th>Max Acceptable Limits</th>
                </tr>
              </thead>
              <tbody>
                {stackParameters[stackName].map((param, i) => (
                  <tr key={i}>
                    <td>{param.name}</td>
                    <td>{param.avg}</td>
                    <td>{param.min}</td>
                    <td>{param.max}</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WaterQualityTable;
