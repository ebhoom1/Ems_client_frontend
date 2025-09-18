import React, { useState, useEffect } from "react";
import { Card, Row, Col, Toast, ToastContainer } from "react-bootstrap";
import { 
  FaBolt, 
  FaGasPump, 
  FaTachometerAlt,
  FaBatteryFull,
  FaBatteryThreeQuarters,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryEmpty
} from "react-icons/fa";

export default function KpiCards({ summary }) {
  // State to control the visibility of the low fuel alert
  const [showLowFuelAlert, setShowLowFuelAlert] = useState(false);

  // useEffect hook to check the fuel level whenever it changes
  useEffect(() => {
    // If fuel is 20% or less, show the alert.
    // Otherwise, ensure it's hidden (e.g., if it was refilled).
    if (summary.fuelPercent <= 20 && summary.fuelPercent > 0) {
      setShowLowFuelAlert(true);
    } else {
      setShowLowFuelAlert(false);
    }
  }, [summary.fuelPercent]); // This effect re-runs only when fuelPercent changes

  // Helper function to get the correct icon based on the percentage
  const getFuelIcon = (percentage) => {
    if (percentage > 80) return <FaBatteryFull size={28} className="text-light" />;
    if (percentage > 50) return <FaBatteryThreeQuarters size={28} className="text-light" />;
    if (percentage > 20) return <FaBatteryHalf size={28} className="text-light" />;
    if (percentage > 5) return <FaBatteryQuarter size={28} className="text-light" />;
    return <FaBatteryEmpty size={28} className="text-light" />;
  };

  const cards = [
    { title: "Total Energy", value: `${summary.totalEnergy} kWh`, icon: <FaBolt size={28} className="text-light" /> },
    { title: "Total Diesel", value: `${summary.totalDiesel} L`, icon: <FaGasPump size={28} className="text-light" /> },
    { title: "Last Refill Time", value: `${summary.refillTime}`, icon: <FaTachometerAlt size={28} className="text-light" /> },
    { title: "Diesel Percentage", value: `${summary.fuelPercent}%`, icon: getFuelIcon(summary.fuelPercent) },
  ];

  // Function to determine the card's background color
  const getCardBackgroundColor = (title, percentage) => {
    if (title === "Diesel Percentage") {
      if (percentage <= 20) return "#9d1623ff"; // Red
      if (percentage < 50) return "#b45c13ff";  // Orange
      return "#21983dff";                      // Green
    }
    return "#236a80"; // Default blue-gray
  };

  return (
    <>
      {/* Container for the Toast Notification */}
      <ToastContainer position="top-center" className="p-3" style={{ zIndex: 1050 }}>
        <Toast 
          onClose={() => setShowLowFuelAlert(false)} 
          show={showLowFuelAlert} 
          delay={10000} // Alert will hide after 10 seconds
          autohide
          bg="warning" // Warning background color
        >
          <Toast.Header>
            <strong className="me-auto">Fuel Alert</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body>
            Diesel is at {summary.fuelPercent}%. Please refill soon.
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* KPI Cards Row */}
      <Row className="g-4 mb-4 mt-3">
        {cards.map((item, idx) => {
          const backgroundColor = getCardBackgroundColor(item.title, summary.fuelPercent);
          return (
            <Col key={idx} xs={12} md={6} lg={3}>
              <div style={{ backgroundColor }} className="shadow-sm border-0 rounded-3 h-75">
                <Card.Body className="d-flex flex-column justify-content-center p-4">
                  <div className="d-flex align-items-center">
                    {item.icon}
                    <Card.Title className="text-center text-light small mb-0 ms-2">{item.title}</Card.Title>
                  </div>
                  <h2 className="fw-bold text-start ms-4 fs-4 text-light mb-3">{item.value}</h2>
                </Card.Body>
              </div>
            </Col>
          );
        })}
      </Row>
    </>
  );
}