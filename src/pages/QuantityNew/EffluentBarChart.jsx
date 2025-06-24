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
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    if (!userName) return;
    setLoading(true);

    axios
      .get(`${API_URL}/api/difference/${userName}`, {
        params: { interval: "daily", page: 1, limit: 700 }
      })
      .then((res) => {
        let entries = res.data.data || [];

        // 1) filter to effluent_flow & valid diffs
        entries = entries.filter(
          (e) =>
            e.stationType === "effluent_flow" &&
            typeof e.cumulatingFlowDifference === "number"
        );

        // 2) dedupe per date|stackName, keep latest timestamp
        const byKey = {};
        entries.forEach((e) => {
          const key = `${e.date}|${e.stackName}`;
          if (
            !byKey[key] ||
            new Date(e.timestamp) > new Date(byKey[key].timestamp)
          ) {
            byKey[key] = e;
          }
        });
        const deduped = Object.values(byKey);

        // 3) pick most recent `days` unique dates
        const uniqDates = Array.from(
          new Set(deduped.map((e) => e.date))
        )
          .sort(
            (a, b) =>
              moment(b, "DD/MM/YYYY").valueOf() -
              moment(a, "DD/MM/YYYY").valueOf()
          )
          .slice(0, days)
          .reverse(); // reverse so X-axis is chronological

        // 4) pivot into chart rows
        const chartData = uniqDates.map((date) => {
          const row = {
            date: moment(date, "DD/MM/YYYY").format("DD-MMM-YYYY")
          };
          deduped
            .filter((e) => e.date === date)
            .forEach((e) => {
              row[e.stackName] = e.cumulatingFlowDifference;
            });
          return row;
        });

        setData(chartData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userName, days]);

  // stack keys (all except "date")
  const stackKeys = data[0]
    ? Object.keys(data[0]).filter((k) => k !== "date")
    : [];

  // compute metrics on first stack
  let metrics = null;
  if (data.length && stackKeys.length) {
    const key = stackKeys[0];
    const vals = data.map((d) => d[key]).filter((v) => typeof v === "number");
    const total = vals.reduce((s, v) => s + v, 0);
    const avg = parseFloat((total / vals.length).toFixed(1));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const minDate = data.find((d) => d[key] === min)?.date;
    const maxDate = data.find((d) => d[key] === max)?.date;
    metrics = {
      min,
      max,
      avg,
      total: parseFloat(total.toFixed(1)),
      minDate,
      maxDate
    };
  }

  const iconStyle = (active) => ({
    cursor: "pointer",
    color: active ? "#236a80" : "#888",
    border: "1px solid #236a80",
    borderRadius: "4px",
    padding: "4px",
    backgroundColor: active ? "#EAF5F8" : "transparent",
    marginRight: "8px"
  });

  return (
    <div className="effluent-bar-chart">
      <div className="mb-3 d-flex align-items-center">
        {[30, 60, 90].map((n) => (
          <button
            key={n}
            className="btn me-2"
            onClick={() => setDays(n)}
            style={{
              border: "1px solid #236a80",
              backgroundColor: days === n ? "#236a80" : "transparent",
              color: days === n ? "#fff" : "#236a80"
            }}
          >
            {n}-Days
          </button>
        ))}

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
        <>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "bar" ? (
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {stackKeys.map((key, idx) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </BarChart>
            ) : (
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
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

          {metrics && (
            <ul style={{ marginTop: 16, listStyleType: "disc", paddingLeft: 20 }}>
              <li>
                Minimum: {metrics.min.toFixed(2)} on {metrics.minDate}
              </li>
              <li>
                Maximum: {metrics.max.toFixed(2)} on {metrics.maxDate}
              </li>
              <li>Average: {metrics.avg.toFixed(2)}</li>
              <li>Total: {metrics.total.toFixed(2)}</li>
            </ul>
          )}
        </>
      )}
    </div>
  );
}
