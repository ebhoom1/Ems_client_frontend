// src/components/PHChart.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import moment from "moment";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { FiBarChart2, FiTrendingUp } from "react-icons/fi";
import { API_URL } from "../../utils/apiConfig";

const COLORS = ["#236A80"];
const PERIODS = [30, 60, 90];

export default function PHChart({ userName, stackName = "STP" }) {
  const [days, setDays] = useState(30);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("bar"); // 'bar' | 'line'

  // Fetch all hourly‐averages once
  useEffect(() => {
    if (!userName || !stackName) return;
    setLoading(true);

    axios
      .get(`${API_URL}/api/average/user/${userName}/stack/${stackName}`)
      .then((res) => {
        if (res.data.success) {
          // map to { date, ph }
          const arr = res.data.data.map((entry) => ({
            date: moment(entry.timestamp).format("DD-MMM"),
            ph: entry.stackData[0].parameters.ph,
          }));
          // sort ascending by actual timestamp
          arr.sort(
            (a, b) =>
              moment(a.date, "DD-MMM").valueOf() -
              moment(b.date, "DD-MMM").valueOf()
          );
          setRawData(arr);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userName, stackName]);

  // slice last `days` points
  const data = useMemo(() => {
    if (rawData.length <= days) return rawData;
    return rawData.slice(rawData.length - days);
  }, [rawData, days]);

  // chart‐type icon style helper
  const iconStyle = (active) => ({
    cursor: "pointer",
    color: active ? "#236A80" : "#888",
    border: "1px solid #236A80",
    borderRadius: 4,
    padding: 4,
    backgroundColor: active ? "#EAF5F8" : "transparent",
    marginLeft: 8,
  });

  return (
    <div className="ph-chart-container">
      <div className="d-flex align-items-center mb-3">
        {/* Period buttons */}
        {PERIODS.map((n) => (
          <button
            key={n}
            className="btn me-2"
            onClick={() => setDays(n)}
            style={{
              border: "1px solid #236A80",
              backgroundColor: days === n ? "#236A80" : "transparent",
              color: days === n ? "#fff" : "#236A80",
            }}
          >
            {n}-Days
          </button>
        ))}

        {/* Chart type toggles */}
        <FiBarChart2
          size={24}
          onClick={() => setChartType("bar")}
          title="Bar Chart"
          style={iconStyle(chartType === "bar")}
        />
        <FiTrendingUp
          size={24}
          onClick={() => setChartType("line")}
          title="Line Chart"
          style={iconStyle(chartType === "line")}
        />
      </div>

      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          {chartType === "bar" ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={["dataMin", "dataMax"]} />
              <Tooltip />
              <Bar dataKey="ph" fill={COLORS[0]} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={["dataMin", "dataMax"]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="ph"
                stroke={COLORS[0]}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}
