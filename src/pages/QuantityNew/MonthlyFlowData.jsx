import React, { useEffect, useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";

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

const MonthlyFlowData = () => {
  const { userType, userData } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [stackOptions, setStackOptions] = useState([]);
  const [selectedStack, setSelectedStack] = useState("");
  const [lastCumulatingFlow, setLastCumulatingFlow] = useState(0);
  const [stackFlowData, setStackFlowData] = useState([]); // For bar chart
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    if (userType === "admin" && userData?.validUserOne?.adminType) {
      fetchUsers();
    } else if (userType === "user" && userData?.validUserOne?.userName) {
      // For non-admin users, auto-set the userName and fetch data.
      setSelectedUser(userData.validUserOne.userName);
      fetchStackOptions(userData.validUserOne.userName);
      if (selectedMonth) {
        fetchUserMonthlyFlowData(userData.validUserOne.userName, selectedMonth);
      }
      // Also fetch the circular chart data if a stack is selected.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchStackOptions = async (userName) => {
    if (!userName) return;
    try {
      const response = await axios.get(
        `${API_URL}/api/get-stacknames-by-userName/${userName}`
      );
      const filteredStacks = response.data.stackNames
        .filter((stack) => stack.stationType === "effluent_flow")
        .map((stack) => stack.name);
      setStackOptions(filteredStacks);
    } catch (error) {
      console.error("Error fetching stack names:", error);
      alert("Failed to fetch stack names.");
    }
  };

  // Fetch circular chart data for a specific stack.
  const fetchLastCumulatingFlow = async (userName, stackName, month) => {
    if (!userName || !stackName || !month) return;
    const monthNumber = monthMapping[month];
    try {
      const response = await axios.get(
        `${API_URL}/api/cumulative-flow/stack/${userName}/${encodeURIComponent(
          stackName
        )}/${monthNumber}`
      );
      if (response.data.success) {
        const flowValue = response.data.data.lastCumulatingFlow || 0;
        setLastCumulatingFlow(flowValue);
        setAnimatedProgress(0);
        setTimeout(() => {
          setAnimatedProgress(85);
        }, 200);
      } else {
        alert("No data found for this stack.");
      }
    } catch (error) {
      console.error("Error fetching flow data:", error);
      alert("Error fetching flow data.");
    }
  };

  // Fetch bar chart data for the user (across all stacks).
const fetchUserMonthlyFlowData = async (userName, month) => {
  if (!userName || !month) return;

  const monthNumber = monthMapping[month];
  const currentYear = new Date().getFullYear();
  const url = `${API_URL}/api/cumulative-flow/user/${userName}/${monthNumber}?year=${currentYear}`;

  console.log("➡️ Fetching monthly flow URL:", url);

  try {
    const response = await axios.get(url);
    console.log("⬅️ Response from server:", response.data);

    if (response.data.success) {
      const data = response.data.data || [];
      const filteredData = data
        .filter((entry) => entry.stationType === "effluent_flow")
        .map((entry) => ({
          stackName: entry.stackName,
          lastCumulatingFlow: parseFloat(entry.lastCumulatingFlow).toFixed(2),
        }));
      setStackFlowData(filteredData);
    } else {
      console.warn("⚠️ No data found for user/month:", userName, month);
      setStackFlowData([]);
    }
  } catch (error) {
    console.error("❌ Error fetching user flow data:", error);
    alert("Error fetching user flow data.");
  }
};

  const maxValue = Math.max(...stackFlowData.map((d) => parseFloat(d.lastCumulatingFlow)), 0);

  // Define the step size (1000)
  const step = 1000;
  
  // Round up to the next multiple of 1000
  const maxTick = Math.ceil(maxValue / step) * step;
  
  // Build an array of ticks [0, 1000, 2000, 3000, ... up to maxTick]
  const ticks = [];
  for (let i = 0; i <= maxTick; i += step) {
    ticks.push(i);
  }
  return (
    <div className="container-fluid shadow">
      <h4 className="text-center mt-3 mb-4">
        <b> Monthly Consumption</b>
      </h4>

      <div className="row mb-3">
        <div className="col-md-4">
          <select
            className="form-select"
            onChange={(e) => {
              setSelectedUser(e.target.value);
              fetchStackOptions(e.target.value);
              if (selectedMonth) {
                fetchUserMonthlyFlowData(e.target.value, selectedMonth);
              }
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

        <div className="col-md-4">
          <select
            className="form-select"
            onChange={(e) => {
              setSelectedStack(e.target.value);
              if (selectedUser && selectedMonth) {
                fetchLastCumulatingFlow(selectedUser, e.target.value, selectedMonth);
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

        <div className="col-md-4">
          <select
            className="form-select"
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              if (selectedUser) {
                fetchUserMonthlyFlowData(selectedUser, e.target.value);
                // Also update circular chart if a stack is selected.
                if (selectedStack) {
                  fetchLastCumulatingFlow(selectedUser, selectedStack, e.target.value);
                }
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

      <div className="row gap-4 m-2 mb-5">
        <div className="col-lg-7 shadow p-3 position-relative">
          {/* Background Image */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage:
                "url('https://media.istockphoto.com/id/1139097203/vector/illustration-of-investment-or-business-chart-on-blue-background-vector.jpg?s=612x612&w=0&k=20&c=VP7-IxPHtrLJlhL9-dSjJooFF9ChUYAvSFzLjIBaYTg=')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.3,
              zIndex: 0,
            }}
          ></div>

          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={stackFlowData}
    barCategoryGap={20}
    margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
  >
    <XAxis
      dataKey="stackName"
      tick={{ fontSize: 10, angle: -10, textAnchor: "end" }}
      interval={0}
    />
    <YAxis
      tick={{ fontSize: 12 }}
      /* Use our custom tick array */
      ticks={ticks}
      /* Y-axis goes from 0 to maxTick */
      domain={[0, maxTick]}
      /* Show commas in large numbers */
      tickFormatter={(value) => value.toLocaleString()}
    />
   {stackFlowData.length > 0 && <Tooltip />}
    <Bar dataKey="lastCumulatingFlow" fill="url(#progressGradient)">
      <LabelList
        dataKey="lastCumulatingFlow"
        position="top"
        style={{
          fill: "#000",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      />
    </Bar>
  </BarChart>
</ResponsiveContainer>

        </div>

        <div className="col-lg-4 shadow p-3 d-flex align-items-center justify-content-center">
          <div style={{ position: "relative", width: "200px", height: "200px" }}>
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
                  name: "Flow",
                  value: lastCumulatingFlow,
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

            {/* Centered Data */}
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
                {selectedMonth || new Date().toLocaleString("default", { month: "long" })}
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
              {parseFloat(lastCumulatingFlow).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyFlowData;
