/* import React, { useState, useEffect } from "react";
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
    console.log("Fetching hourly data from:", `${API_URL}/api/hourly?userName=${USER_NAME}`);

    fetch(`${API_URL}/api/hourly?userName=${USER_NAME}`)
      .then((res) => {
        console.log("API Response Status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Raw API Data:", data);

        if (Array.isArray(data)) {
          const today = new Date();
          const todayString = today.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).split("/").reverse().join("-");

          const formatted = data
            .filter((item) => {
             
              const itemDate = item.timestamp_hour
                ? new Date(item.timestamp_hour).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).split("/").reverse().join("-")
                : todayString; 
              return itemDate === todayString;
            })
            .map((item) => {
              const hourTime = item.hour
                ? `${item.hour}:00`
                : new Date(item.timestamp_hour).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

              return {
                date: hourTime, 
                energy: parseFloat(item.energy?.consumption_kWh || 0),
                fuel: parseFloat(item.fuel?.consumption_liters || 0),
              };
            });

          console.log("Filtered Chart Data (Today's Data):", formatted);
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
      console.log("Received stackDataUpdate:", data);

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

        console.log("Updating KPI Data:", newKpiData);
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
             
              <Row className="g-4 mb-4">
                <Col lg={12}><TabularReport data={chartData} /></Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} */

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
import wipro from "../../assests/images/wipro.png";
import { useSelector } from "react-redux";

export default function DieselDashboard() {
  const { userData } = useSelector((state) => state.user);

  // ✅ Step 1 — Detect logged-in username safely
  const loggedInUser =
    userData?.validUserOne?.userName ||
    sessionStorage.getItem("userName") ||
    "BBUSER";

  // ✅ Step 2 — Mock user check
  const isMockUser =
    loggedInUser === "admin1_001" || loggedInUser === "CONTI";

  console.log("username in diesel:", loggedInUser);
  console.log("mockUser:", isMockUser);

  // ✅ KPI and chart state
  const [kpiData, setKpiData] = useState({
    totalEnergy: 0,
    totalDiesel: 0,
    refillTime: "N/A",
    fuelPercent: 0,
  });

  const [chartData, setChartData] = useState([]);

  // ✅ Mock data set
  const mockKpiData = {
    totalEnergy: 1540.6,
    totalDiesel: 480.3,
    refillTime: "10 Oct, 2:30 PM",
    fuelPercent: 67,
  };

  const mockChartData = [
    { date: "08:00 AM" ,energy: 40, fuel: 12, efficiency: 3.33 },
    { date: "09:00 AM", energy: 52, fuel: 14, efficiency: 3.71 },
    { date: "10:00 AM", energy: 47, fuel: 13, efficiency: 3.61 },
    { date: "11:00 AM", energy: 63, fuel: 16, efficiency: 3.93 },
    { date: "12:00 PM", energy: 72, fuel: 18, efficiency: 4.0 },
    { date: "01:00 PM", energy: 58, fuel: 15, efficiency: 3.86 },
  ];

  // ✅ Fetch data (real or mock)
  useEffect(() => {
    if (isMockUser) {
      console.log("🔹 Mock mode enabled for", loggedInUser);
      setKpiData(mockKpiData);
      setChartData(mockChartData);
      return;
    }

    console.log("🔹 Fetching real data for:", loggedInUser);
    fetch(`${API_URL}/api/hourly?userName=${loggedInUser}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const today = new Date().toISOString().split("T")[0];
          const formatted = data
            .filter((i) => i.timestamp_hour?.startsWith(today))
            .map((item) => ({
              date: new Date(item.timestamp_hour).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              energy: parseFloat(item.energy?.consumption_kWh || 0),
              fuel: parseFloat(item.fuel?.consumption_liters || 0),
              efficiency:
                item.fuel?.consumption_liters > 0
                  ? item.energy?.consumption_kWh /
                    item.fuel?.consumption_liters
                  : 0,
            }));
          setChartData(formatted);
        }
      })
      .catch((err) => console.error("❌ Error fetching hourly data:", err));
  }, [loggedInUser, isMockUser]);

  // ✅ WebSocket connection (real only)
  useEffect(() => {
    if (isMockUser) return;

    const socket = io(API_URL);
    socket.on("connect", () => {
      console.log("Connected to WebSocket:", socket.id);
      socket.emit("joinRoom", loggedInUser);
    });

    socket.on("stackDataUpdate", (data) => {
      const latestData = data.stackData && data.stackData[0];
      if (latestData) {
        const backendRefillTime = latestData.last_refill_time;
        const formattedRefillTime = backendRefillTime
          ? new Date(backendRefillTime).toLocaleString("en-IN", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              day: "numeric",
              month: "short",
            })
          : "N/A";

        setKpiData({
          totalEnergy: parseFloat(latestData.energy || 0),
          totalDiesel: parseFloat(latestData.fuel_volume_liters || 0),
          refillTime: formattedRefillTime,
          fuelPercent: parseFloat(latestData.fuel_level_percentage || 0),
        });
      }
    });

    socket.on("disconnect", () =>
      console.log("Disconnected from WebSocket.")
    );

    return () => socket.disconnect();
  }, [loggedInUser, isMockUser]);

  // ✅ UI render
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>

        <div className="col-lg-9 col-12">
          <div className="headermain">
            <Header />
          </div>

          {/* 🔹 Show Wipro logo + mock banner */}
          {isMockUser && (
            <div className="d-flex justify-content-between align-items-center  px-3" style={{marginTop:'60px'}}>
              <div>
              
              </div>
              <img src={wipro} alt="Wipro Logo" width="210px" height="70px" />
            </div>
          )}

          <div className="p-8 bg-gray-100 min-h-screen text-gray-900 mt-4">
            <KpiCards summary={kpiData} />

            <Row className="g-4 mb-4">
              <Col lg={6}>
                <EnergyChart data={chartData} />
              </Col>
              <Col lg={6}>
                <DieselChart data={chartData} />
              </Col>
            </Row>

            <Row className="g-4 mb-4">
              <Col lg={12}>
                <EfficiencyChart data={chartData} />
              </Col>
            </Row>

            <Row className="g-4 mb-4">
              <Col lg={12}>
                <TabularReport
                  userName={loggedInUser}
                  mock={isMockUser}
                  mockData={mockChartData}
                />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
}
