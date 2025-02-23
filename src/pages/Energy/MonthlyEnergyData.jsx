import React, { useEffect, useState } from "react";
import { RadialBarChart, RadialBar } from "recharts";
import { API_URL } from "../../utils/apiConfig";
import axios from "axios";
import { useSelector } from "react-redux";

const MonthlyEnergyData = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [stackOptions, setStackOptions] = useState([]);
  const [selectedStack, setSelectedStack] = useState("");
  const [lastEnergyConsumption, setLastEnergyConsumption] = useState(0); // ✅ Energy Data
  const [animatedProgress, setAnimatedProgress] = useState(0); // Animation state
  const { userType, userData } = useSelector((state) => state.user);

  // Function to get Previous Month Name
  const getPreviousMonth = () => {
    return new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString("default", { month: "long" });
  };

  useEffect(() => {
    if (userType === "admin" && userData?.validUserOne?.adminType) {
      fetchUsers();
    }
  }, [userType, userData]); // ✅ Dependency Array
  
  // ✅ Define fetchUsers OUTSIDE useEffect
  const fetchUsers = async () => {
    try {
      if (userData?.validUserOne) {
        let response;
        if (userData.validUserOne.adminType) {
          response = await axios.get(`${API_URL}/api/get-users-by-adminType/${userData.validUserOne.adminType}`);
        } else {
          response = await axios.get(`${API_URL}/api/getallusers`);
        }
  
        const filteredUsers = response.data.users.filter((user) => user.userType === "user");
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  


  // Fetch stack options for a selected user with stationType === "energy"
  const fetchStackOptions = async (userName) => {
    if (!userName) return;
    try {
      const response = await axios.get(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
      const filteredStacks = response.data.stackNames
        .filter(stack => stack.stationType === "energy") // ✅ Only energy stacks
        .map(stack => stack.name);
      setStackOptions(filteredStacks);
    } catch (error) {
      console.error("Error fetching stack names:", error);
      alert("Failed to fetch stack names.");
    }
  };

  // Fetch last month's energy consumption based on userName & stackName
  const fetchLastEnergyConsumption = async (userName, stackName) => {
    if (!userName || !stackName) return;
    try {
        // ✅ Use the correct API endpoint for Energy
        const response = await axios.get(`${API_URL}/api/lastMonthFlow/${userName}/${stackName}`);
        if (response.data.success) {
            const energyValue = response.data.data.lastEnergy || 0; // ✅ Ensure correct field
            setLastEnergyConsumption(energyValue);

            setAnimatedProgress(0);
            setTimeout(() => {
                setAnimatedProgress(85);
            }, 200);
        } else {
            alert("No data found for this stack.");
        }
    } catch (error) {
        console.error("Error fetching energy data:", error);
        alert("Error fetching energy data.");
    }
};


  return (
    <div className="container-fluid shadow " style={{borderRadius:"10px"}}>
      <h4 className="text-center  p-3 "><b>Last Month Energy Consumption</b></h4>

      <div className="row mb-1">
        <div className="col-md-6">
          <select className="form-select" onChange={(e) => { 
            setSelectedUser(e.target.value); 
            fetchStackOptions(e.target.value);
          }} value={selectedUser}>
            <option value="">Select User</option>
            {users.map(user => (<option key={user._id} value={user.userName}>{user.userName}</option>))}
          </select>
        </div>
        <div className="col-md-5">
          <select className="form-select" onChange={(e) => { 
            setSelectedStack(e.target.value); 
            fetchLastEnergyConsumption(selectedUser, e.target.value);
          }} value={selectedStack} disabled={!selectedUser}>
            <option value="">Select Stack</option>
            {stackOptions.map((stack, index) => (<option key={index} value={stack}>{stack}</option>))}
          </select>
        </div>
      </div>

      {/* ✅ Circular Progress Bar for Energy Consumption */}
      <div className="row gap-4 m-2 mb-5 d-flex justify-content-center">
        <div className="col-lg-4  p-3 d-flex align-items-center justify-content-center">
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
              data={[{ name: "Energy", value: lastEnergyConsumption, fill: "url(#progressGradient)" }]}
              startAngle={90}
              endAngle={90 - (360 * animatedProgress / 100)}
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
                style={{
                  filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.2))"
                }}
              />
            </RadialBarChart>

            {/* ✅ Centered Display for Month, Stack Name, and Energy Value */}
            <div style={{
              position: "absolute",
              top: "5%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              color: "#236a80",
              fontWeight: "bold"
            }}>
              <div style={{ fontSize: "14px", marginBottom: "5px" }}>
                {getPreviousMonth()} {/* Previous Month */}
              </div>
              <div style={{ fontSize: "14px", marginTop: "5px" }}>
                {selectedStack || "Select Stack"}
              </div>
            </div>

            <div style={{
              position: "absolute",
              top: "60%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "24px",
              fontWeight: "bold",
              color: "#236a80"
            }}>
              {parseFloat(lastEnergyConsumption).toFixed(2)} 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyEnergyData;
