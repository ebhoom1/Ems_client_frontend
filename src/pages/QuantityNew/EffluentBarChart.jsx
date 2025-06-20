// src/components/EffluentBarChart.jsx
import React, { useState, useEffect } from "react";
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
  Legend
} from "recharts";
import { FiBarChart2, FiTrendingUp } from "react-icons/fi";
import { API_URL } from "../../utils/apiConfig";

const COLORS = ["#236A80", "#4794AB", "#8CBFCE", "#112D3C", "#EAF5F8"];

export default function EffluentBarChart({ userName }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("bar"); // 'bar' or 'line'

  useEffect(() => {
    if (!userName) return;
    setLoading(true);
    axios
      .get(`${API_URL}/api/daily/effluent-averages`, { params: { userName, days } })
      .then((res) => {
        const chartData = (res.data.data || []).map((d) => {
          const row = { date: moment(d.date, "DD/MM/YYYY").format("DD-MMM-YYYY") };
          d.stacks.forEach((s) => {
            row[s.stackName] = s.avgFlow;
          });
          return row;
        });
        setData(chartData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userName, days]);

  const stackKeys = data[0]
    ? Object.keys(data[0]).filter((k) => k !== "date")
    : [];

  // Compute metrics for the first stack
  let metrics = null;
  if (data.length && stackKeys.length) {
    const key = stackKeys[0];
    const values = data.map((d) => d[key]).filter((v) => typeof v === 'number');
    const total = values.reduce((sum, v) => sum + v, 0);
    const avg = parseFloat((total / values.length).toFixed(1));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const minDate = data.find((d) => d[key] === min)?.date;
    const maxDate = data.find((d) => d[key] === max)?.date;
    metrics = { min, max, avg, total: parseFloat(total.toFixed(1)), minDate, maxDate };
  }

  const iconStyle = (active) => ({
    cursor: "pointer",
    color: active ? "#236a80" : "#888",
    border: "1px solid #236a80",
    borderRadius: "4px",
    padding: "4px",
    backgroundColor: active ? "#EAF5F8" : "transparent",
    marginRight: '8px'
  });

  return (
    <div className="effluent-bar-chart">
      <div className="mb-3 d-flex align-items-center">
        {/* Period buttons */}
        {[30, 60, 90].map((n) => (
          <button
            key={n}
            className="btn me-2"
            onClick={() => setDays(n)}
            style={{
              border: "1px solid #236a80",
              backgroundColor: days === n ? "#236a80" : "transparent",
              color: days === n ? "#ffffff" : "#236a80"
            }}
          >
            {n}-Days
          </button>
        ))}

        {/* Chart type toggles with border */}
        <FiBarChart2
          onClick={() => setChartType("bar")}
          size={24}
          title="Bar Chart"
          style={iconStyle(chartType === "bar")}
        />
        <FiTrendingUp
          onClick={() => setChartType("line")}
          size={24}
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
        <>  {/* Fragment wrapper for chart + metrics */}
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "bar" ? (
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {stackKeys.map((key, idx) => (
                  <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} />
                ))}
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {stackKeys.map((key, idx) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[idx % COLORS.length]}
                    dot={false}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>

          {/* Metrics summary */}
          {metrics && (
            <ul style={{ marginTop: 16, listStyleType: 'disc', paddingLeft: 20 }}>
              <li>Minimum value: {metrics.min} KLD was on {metrics.minDate}</li>
              <li>Maximum value: {metrics.max} KLD was on {metrics.maxDate}</li>
              <li>Average value: {metrics.avg} KLD</li>
              <li>Total value: {metrics.total} KLD</li>
            </ul>
          )}
        </>
      )}
    </div>
  );
}
