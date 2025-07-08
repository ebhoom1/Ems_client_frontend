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

// Function to filter out unwanted stacks
const filterUnwantedStacks = (stackName) => {
  return !stackName.includes("STP intlet") && !stackName.includes("STP iutlet");
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
  const currentYear = new Date().getFullYear();

  // — fetch & filter users exactly like Header's logic —
  useEffect(() => {
    const fetchAndFilterUsers = async () => {
      const currentUser = userData?.validUserOne;
      if (!currentUser) {
        setUsers([]);
        return;
      }

      try {
        let response;
        const endpoint = `${API_URL}/api/getallusers`;
        if (currentUser.adminType === "EBHOOM") {
          response = await axios.get(endpoint);
          const allUsers = response.data.users || [];
          setUsers(
            allUsers.filter(
              (u) =>
                !u.isTechnician &&
                !u.isTerritorialManager &&
                !u.isOperator
            )
          );
        } else if (currentUser.userType === "super_admin") {
          response = await axios.get(endpoint);
          const allUsers = response.data.users || [];
          const adminIds = allUsers
            .filter(
              (u) =>
                u.createdBy === currentUser._id &&
                u.userType === "admin"
            )
            .map((a) => a._id.toString());

          setUsers(
            allUsers.filter(
              (u) =>
                (u.createdBy === currentUser._id ||
                  adminIds.includes(u.createdBy)) &&
                !u.isTechnician &&
                !u.isOperator
            )
          );
        } else if (currentUser.userType === "admin") {
          response = await axios.get(
            `${API_URL}/api/get-users-by-creator/${currentUser._id}`
          );
          setUsers(response.data.users || []);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      }
    };
    fetchAndFilterUsers();
  }, [userData]);

  // — if non-admin, auto-select themselves —
  useEffect(() => {
    if (userType === "user" && userData?.validUserOne?.userName) {
      const me = userData.validUserOne.userName;
      setSelectedUser(me);
      fetchStackOptions(me);
      if (selectedMonth) {
        fetchTotals(me, selectedMonth);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType, userData]);

  // Fetch stack list for a user and filter out unwanted stacks
  const fetchStackOptions = async (userName) => {
    if (!userName) return;
    try {
      const resp = await axios.get(
        `${API_URL}/api/get-stacknames-by-userName/${userName}`
      );
      const stacks = resp.data.stackNames || [];
      setStackOptions(
        stacks
          .filter(
            (s) =>
              s.stationType === "effluent_flow" &&
              filterUnwantedStacks(s.name)
          )
          .map((s) => s.name)
      );
    } catch (err) {
      console.error("❌ Error fetching stacks:", err);
      setStackOptions([]);
    }
  };

  // Unified fetch for both bar & radial charts
  const fetchTotals = async (userName, month) => {
    if (!userName || !month) return;
    const monthNum = monthMapping[month];
    try {
      const resp = await axios.get(
        `${API_URL}/api/difference/total-by-month`,
        {
          params: {
            userName,
            month: monthNum,
            year: currentYear,
          },
        }
      );
      if (resp.data.success) {
        // Bar chart data
        const filtered = resp.data.totals.filter(({ stackName }) =>
          filterUnwantedStacks(stackName)
        );
        const barData = filtered.map((item) => ({
          stackName: item.stackName,
          monthlyConsumption: parseFloat(
            item.totalCumulatingFlowDifference.toFixed(2)
          ),
        }));
        setStackFlowData(barData);

        // Radial chart for selected stack
        if (selectedStack) {
          const found = filtered.find(
            (t) => t.stackName === selectedStack
          );
          if (found) {
            const val = parseFloat(
              found.totalCumulatingFlowDifference.toFixed(2)
            );
            setLastCumulatingFlow(val);
            setAnimatedProgress(0);
            setTimeout(() => setAnimatedProgress(85), 200);
          } else {
            setLastCumulatingFlow(0);
          }
        }
      } else {
        setStackFlowData([]);
        setLastCumulatingFlow(0);
      }
    } catch (err) {
      console.error("❌ Error fetching totals:", err);
      setStackFlowData([]);
      setLastCumulatingFlow(0);
    }
  };

  // Prepare ticks for Y-axis
  const maxVal = Math.max(
    ...stackFlowData.map((d) => d.monthlyConsumption),
    0
  );
  const step = 1000;
  const maxTick = Math.ceil(maxVal / step) * step;
  const ticks = [];
  for (let i = 0; i <= maxTick; i += step) ticks.push(i);

  return (
    <div className="container-fluid shadow">
      <h4 className="text-center mt-3 mb-4">
        <b> Monthly Consumption</b>
      </h4>
      <div className="row mb-3">
        {/* User selector */}
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              fetchStackOptions(e.target.value);
              if (selectedMonth) {
                fetchTotals(e.target.value, selectedMonth);
              }
            }}
          >
            <option value="">Select User</option>
            {users.map((u) => (
              <option key={u._id} value={u.userName}>
                {u.userName} — {u.companyName}
              </option>
            ))}
          </select>
        </div>
        {/* Stack selector */}
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedStack}
            onChange={(e) => {
              setSelectedStack(e.target.value);
              if (selectedUser && selectedMonth) {
                fetchTotals(selectedUser, selectedMonth);
              }
            }}
            disabled={!selectedUser}
          >
            <option value="">Select Stack</option>
            {stackOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {/* Month selector */}
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              if (selectedUser) {
                fetchTotals(selectedUser, e.target.value);
              }
            }}
            disabled={!selectedUser}
          >
            <option value="">Select Month</option>
            {Object.keys(monthMapping).map((m) => (
              <option key={m} value={m}>
                {m}
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
          />
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
                ticks={ticks}
                domain={[0, maxTick]}
                tickFormatter={(v) => v.toLocaleString()}
              />
              {stackFlowData.length > 0 && <Tooltip />}
              <Bar dataKey="monthlyConsumption" fill="url(#progressGradient)">
                <LabelList
                  dataKey="monthlyConsumption"
                  position="top"
                  style={{
                    fill: "#000",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                  formatter={(value) => `${value} m³`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="col-lg-4 shadow p-3 d-flex align-items-center justify-content-center">
          <div style={{ position: "relative", width: "200px", height: "200px" }}>
            <svg width="0" height="0">
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
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
                strokeLinecap="round"
                animationBegin={0}
                animationDuration={1000}
                style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.2))" }}
              />
            </RadialBarChart>
            {/* Centered Info */}
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
              <div style={{ fontSize: 14, marginBottom: 5 }}>
                {selectedMonth ||
                  new Date().toLocaleString("default", { month: "long" })}
              </div>
              <div style={{ fontSize: 14, marginTop: 5 }}>
                {selectedStack || "Select Stack"}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: "60%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 24,
                fontWeight: "bold",
                color: "#236a80",
              }}
            >
              {parseFloat(lastCumulatingFlow).toFixed(2)} m³
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyFlowData;
