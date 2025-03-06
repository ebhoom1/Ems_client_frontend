import React, { useEffect, useState } from "react";
import { RadialBarChart, RadialBar } from "recharts";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";

// Mapping month names to their corresponding numbers
const monthMapping = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

const MonthlyEnergyData = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [stackOptions, setStackOptions] = useState([]);
  const [selectedStack, setSelectedStack] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [lastEnergyConsumption, setLastEnergyConsumption] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const { userType, userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (userType === "admin" && userData?.validUserOne?.adminType) {
      fetchUsers();
    } else if (userType === "user" && userData?.validUserOne?.userName) {
      // Automatically set the logged-in user's username
      setSelectedUser(userData.validUserOne.userName);
      fetchStackOptions(userData.validUserOne.userName);
      // Optionally auto-fetch data if month and stack are already selected
      if (selectedMonth && selectedStack) {
        fetchLastEnergyConsumption(userData.validUserOne.userName, selectedStack, selectedMonth);
      }
    }
  }, [userType, userData]);
  

  const fetchUsers = async () => {
    try {
      if (userData?.validUserOne) {
        let response;
        if (userData.validUserOne.adminType) {
          response = await axios.get(
            `${API_URL}/api/get-users-by-adminType/${userData.validUserOne.adminType}`
          );
        } else {
          response = await axios.get(`${API_URL}/api/getallusers`);
        }
        const filteredUsers = response.data.users.filter(
          (user) => user.userType === "user"
        );
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch stack options for the selected user (only energy stacks)
  const fetchStackOptions = async (userName) => {
    if (!userName) return;
    try {
      const response = await axios.get(
        `${API_URL}/api/get-stacknames-by-userName/${userName}`
      );
      const filteredStacks = response.data.stackNames
        .filter((stack) => stack.stationType === "energy")
        .map((stack) => stack.name);
      setStackOptions(filteredStacks);
    } catch (error) {
      console.error("Error fetching stack names:", error);
      alert("Failed to fetch stack names.");
    }
  };

  // Fetch energy consumption data for a given user, stack, and month.
  const fetchLastEnergyConsumption = async (userName, stackName, month) => {
    if (!userName || !stackName || !month) return;
    const monthNumber = monthMapping[month];
    const currentYear = new Date().getFullYear();
    try {
      // Updated API endpoint for energy consumption with month and year parameters
      const response = await axios.get(
        `${API_URL}/api/cumulative-flow/stack/${userName}/${stackName}/${monthNumber}?year=${currentYear}`
      );
      //api/cumulative-flow/stack/HH014/STP-energy/2
      if (response.data.success) {
        const energyValue = response.data.data.lastEnergy || 0;
        setLastEnergyConsumption(energyValue);

        // Reset animation and animate progress (here 85 is used as a placeholder)
        setAnimatedProgress(0);
        setTimeout(() => {
          setAnimatedProgress(85);
        }, 200);
      } else {
        alert("No data found for this stack for the selected month.");
      }
    } catch (error) {
      console.error("Error fetching energy data:", error);
      alert("Error fetching energy data.");
    }
  };

  return (
    <div className="container-fluid shadow" style={{ borderRadius: "10px" }}>
      <h4 className="text-center p-3">
        <b>Monthly Energy Consumption</b>
      </h4>
      <div className="row mb-3">
        {/* User Selection */}
        <div className="col-md-4">
        <select
  className="form-select"
  onChange={(e) => {
    setSelectedUser(e.target.value);
    fetchStackOptions(e.target.value);
  }}
  value={selectedUser}
  disabled={userType !== "admin"}
>
  {userType === "admin" ? (
    <>
      <option value="">Select User</option>
      {users.map((user) => (
        <option key={user._id} value={user.userName}>
          {user.userName}
        </option>
      ))}
    </>
  ) : (
    <option value={userData?.validUserOne?.userName}>
      {userData?.validUserOne?.userName}
    </option>
  )}
</select>

        </div>
        {/* Stack Selection */}
        <div className="col-md-4">
          <select
            className="form-select"
            onChange={(e) => {
              setSelectedStack(e.target.value);
              if (selectedMonth && selectedUser) {
                fetchLastEnergyConsumption(selectedUser, e.target.value, selectedMonth);
              }
            }}
            value={selectedStack}
            disabled={!selectedUser}
          >
            <option value="">Select Stack</option>
            {stackOptions.map((stack, index) => (
              <option key={index} value={stack}>
                {stack}
              </option>
            ))}
          </select>
        </div>
        {/* Month Selection */}
        <div className="col-md-4">
          <select
            className="form-select"
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              if (selectedUser && selectedStack) {
                fetchLastEnergyConsumption(selectedUser, selectedStack, e.target.value);
              }
            }}
            value={selectedMonth}
            disabled={!selectedUser}
          >
            <option value="">Select Month</option>
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Circular Progress Bar for Energy Consumption */}
      <div className="row gap-4 m-2 mb-5 d-flex justify-content-center">
        <div className="col-lg-4 p-3 d-flex align-items-center justify-content-center">
          <div style={{ position: "relative", width: "500px", height: "200px" }}>
            <svg width="0" height="0">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6AC5D5" />
                  <stop offset="100%" stopColor="#236a80" />
                </linearGradient>
              </defs>
            </svg>
            <RadialBarChart
              width={200}
              height={200}
              cx={100}
              cy={100}
              innerRadius="80%"
              outerRadius="100%"
              barSize={15}
              data={[
                {
                  name: "Energy",
                  value: lastEnergyConsumption,
                  fill: "url(#progressGradient)",
                },
              ]}
              startAngle={90}
              endAngle={90 - (360 * animatedProgress) / 100}
            >
              <RadialBar
                minAngle={15}
                clockWise={false}
                dataKey="value"
                cornerRadius={50}
                strokeWidth={5}
                strokeLinecap="round"
                animationBegin={0}
                animationDuration={1000}
                style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.2))" }}
              />
            </RadialBarChart>
            {/* Centered Display for Month, Stack Name, and Energy Value */}
            <div
              style={{
                position: "absolute",
                top: "5%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                color: "#236a80",
                fontWeight: "bold",
              }}
            >
              <div style={{ fontSize: "14px", marginBottom: "5px" }}>
                {selectedMonth || "Select Month"}
              </div>
              <div style={{ fontSize: "14px", marginTop: "5px" }}>
                {selectedStack || "Select Stack"}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: "60%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#236a80",
              }}
            >
              {parseFloat(lastEnergyConsumption).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyEnergyData;
