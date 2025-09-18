// src/components/DieselDashboard.js

import React, { useState, useEffect, useRef } from "react"; // 1. Import useRef
import { Row, Col } from "react-bootstrap";
import { io } from "socket.io-client";
import KpiCards from "./KpiCards";
import EnergyChart from "./EnergyChart";
import DieselChart from "./DieselChart";
import EfficiencyChart from "./EfficiencyChart";
import TabularReport from "./TabularReport";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import { API_URL } from "../../utils/apiConfig"; // 2. API_URL is imported

// --- DUMMY DATA FOR CHARTS ---
const chartData = [
  { date: "Sep 7", energy: 480, diesel: 120, efficiency: 4.0 },
  { date: "Sep 8", energy: 460, diesel: 125, efficiency: 3.68 },
  { date: "Sep 9", energy: 500, diesel: 128, efficiency: 3.9 },
  { date: "Sep 10", energy: 450, diesel: 130, efficiency: 3.46 },
  { date: "Sep 11", energy: 520, diesel: 135, efficiency: 3.85 },
];

// --- You need to get this dynamically (e.g., from user login context) ---
const USER_NAME = "BBUSER"; 

export default function DieselDashboard() {
  const [kpiData, setKpiData] = useState({
    totalEnergy: 0,
    totalDiesel: 0,
    refillTime: "N/A", // 3. Set an initial value for refillTime
    fuelPercent: 0,
  });

  // 4. Create a ref to store the previous fuel percentage
  const prevFuelPercentRef = useRef();

  useEffect(() => {
    // 5. Use the imported API_URL for the socket connection
    const socket = io(API_URL);

    socket.on("connect", () => {
      console.log("Connected to WebSocket server with ID:", socket.id);
      socket.emit("joinRoom", USER_NAME); 
    });

    socket.on("stackDataUpdate", (data) => {
      const latestData = data.stackData && data.stackData[0];
      
      if (latestData) {
        const currentPercent = latestData.fuel_level_percentage || 0;
        const previousPercent = prevFuelPercentRef.current;
        
        // 6. Logic to detect a refill and update the timestamp
        setKpiData(prevKpiData => {
          let newRefillTime = prevKpiData.refillTime; // Start with the existing time

          // Check if previousPercent is a number and currentPercent has increased
          if (typeof previousPercent === 'number' && currentPercent > previousPercent) {
            console.log(`Refill detected! From ${previousPercent}% to ${currentPercent}%`);
            // Update the refill time to the current time
            newRefillTime = new Date().toLocaleString("en-IN", {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
              day: 'numeric',
              month: 'short'
            });
          }

          return {
            totalEnergy: latestData.energy || 0,
            totalDiesel: latestData.fuel_volume_liters || 0,
            refillTime: newRefillTime, // Use the potentially updated time
            fuelPercent: currentPercent,
          };
        });

        // 7. After processing, update the ref for the next data packet
        prevFuelPercentRef.current = currentPercent;
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server.");
    });
    
    return () => {
      socket.disconnect();
    };
  }, []); // Empty dependency array, runs once on mount

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
                        <Row className="g-4 mb-4">
                            <Col lg={12}><EfficiencyChart data={chartData} /></Col>
                        </Row>
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