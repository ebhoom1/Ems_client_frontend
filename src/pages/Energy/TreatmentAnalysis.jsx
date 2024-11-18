import React, { useState } from "react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TreatmentAnalysis = () => {
  const [interval, setInterval] = useState("year");

  // Dummy data for the BarChart
  const dummyData = [
    { date: "2023-01-01", averageEnergy: 200 },
    { date: "2023-02-01", averageEnergy: 300 },
    { date: "2023-03-01", averageEnergy: 250 },
    { date: "2023-04-01", averageEnergy: 280 },
    { date: "2023-05-01", averageEnergy: 310 },
    { date: "2023-06-01", averageEnergy: 260 },
    { date: "2023-07-01", averageEnergy: 290 },
    { date: "2023-08-01", averageEnergy: 320 },
    { date: "2023-09-01", averageEnergy: 270 },
    { date: "2023-10-01", averageEnergy: 340 },
  ];

  const handleIntervalChange = (newInterval) => {
    setInterval(newInterval);
    toast.info(`Interval changed to: ${newInterval}`);
  };

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    if (interval === "hour") {
      return date.toLocaleTimeString();
    } else if (interval === "day") {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else if (interval === "week" || interval === "sixmonth") {
      return date.toLocaleDateString();
    } else if (interval === "month") {
      return date.toLocaleString("en-US", { month: "short" });
    } else if (interval === "year") {
      return date.getFullYear();
    }
    return tickItem;
  };

  return (
    <div className="card mt-4 mb-5">
      <div className="card-body">
        <h2 className="m-3">
          Trending Analysis - FL - STP Incomer Energy Consumption, kWh
        </h2>
        <div className="btn-group" role="group">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleIntervalChange("hour")}
          >
            Hour
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleIntervalChange("day")}
          >
            Day
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleIntervalChange("week")}
          >
            Week
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleIntervalChange("month")}
          >
            Month
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleIntervalChange("sixmonth")}
          >
            Six Months
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleIntervalChange("year")}
          >
            Year
          </button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dummyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="averageEnergy" fill="#236a80" />
          </BarChart>
        </ResponsiveContainer>
        <ToastContainer />
      </div>
    </div>
  );
};

export default TreatmentAnalysis;
