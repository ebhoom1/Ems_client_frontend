// DieselDashboard.jsx
import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { io } from "socket.io-client";
import KpiCards from "./KpiCards";
import EnergyChart from "./EnergyChart";
import DieselChart from "./DieselChart";
import EfficiencyChart from "./EfficiencyChart";
import TabularReport from "./TabularReport";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import { API_URL } from "../../utils/apiConfig";

const USER_NAME = "BBUSER";

export default function DieselDashboard() {
  const [kpiData, setKpiData] = useState({
    totalEnergy: 0,
    totalDiesel: 0,
    refillTime: "N/A",
    fuelPercent: 0,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Fetch hourly API data
    console.log("Fetching hourly data from:", `${API_URL}/api/hourly?userName=${USER_NAME}`);

    fetch(`${API_URL}/api/hourly?userName=${USER_NAME}`)
      .then((res) => {
        console.log("API Response Status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Raw API Data:", data);

        if (Array.isArray(data)) {
          const formatted = data.map((item) => {
            // Use hour field if available, otherwise fall back to timestamp_hour
            const hourTime = item.hour ? `${item.hour}:00` : new Date(item.timestamp_hour).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });

            return {
              date: hourTime, // e.g., "19:00" or "07:30 PM"
              energy: parseFloat(item.energy?.consumption_kWh || 0),
              fuel: parseFloat(item.fuel?.consumption_liters || 0),
            };
          });

          console.log("Formatted Chart Data:", formatted);
          setChartData(formatted);
        }
      })
      .catch((err) => console.error("Error fetching hourly data:", err));
  }, []);

  useEffect(() => {
    const socket = io(API_URL);

    socket.on("connect", () => {
      console.log("Connected to WebSocket server with ID:", socket.id);
      socket.emit("joinRoom", USER_NAME);
    });

    socket.on("stackDataUpdate", (data) => {
      console.log("Received stackDataUpdate:", data); // Log the incoming socket data

      const latestData = data.stackData && data.stackData[0];

      if (latestData) {
        const backendRefillTime = latestData.last_refill_time;
        let formattedRefillTime = "N/A";

        if (backendRefillTime) {
          formattedRefillTime = new Date(backendRefillTime).toLocaleString("en-IN", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            day: "numeric",
            month: "short",
          });
        }

        const newKpiData = {
          totalEnergy: parseFloat(latestData.energy || 0),
          totalDiesel: parseFloat(latestData.fuel_volume_liters || 0),
          refillTime: formattedRefillTime,
          fuelPercent: parseFloat(latestData.fuel_level_percentage || 0),
        };

        console.log("Updating KPI Data:", newKpiData); // Log the processed KPI data
        setKpiData(newKpiData);
      } else {
        console.warn("No valid stackData in stackDataUpdate:", data);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server.");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-3 d-none d-lg-block">
            <DashboardSam />
          </div>
          <div className="col-lg-9 col-12">
            <div className="headermain">
              <Header />
            </div>
            <div className="p-8 bg-gray-100 min-h-screen text-gray-900 mt-5">
              <KpiCards summary={kpiData} />
              <Row className="g-4 mb-4">
                <Col lg={6}><EnergyChart data={chartData} /></Col>
                <Col lg={6}><DieselChart data={chartData} /></Col>
              </Row>
              {/* <Row className="g-4 mb-4">
                <Col lg={12}><EfficiencyChart data={chartData} /></Col>
              </Row> */}
              <Row className="g-4 mb-4">
                <Col lg={12}><TabularReport data={chartData} /></Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}