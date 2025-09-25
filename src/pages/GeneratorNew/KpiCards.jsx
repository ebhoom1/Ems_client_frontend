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
  FaBatteryEmpty,
} from "react-icons/fa";

export default function KpiCards({ summary }) {
  const [showLowFuelAlert, setShowLowFuelAlert] = useState(false);

  useEffect(() => {
    console.log("KpiCards received summary:", summary); // Log summary for debugging
    if (summary.fuelPercent <= 20 && summary.fuelPercent > 0) {
      setShowLowFuelAlert(true);
    } else {
      setShowLowFuelAlert(false);
    }
  }, [summary.fuelPercent]);

  const getFuelIcon = (percentage) => {
    const fuelPercent = parseFloat(percentage) || 0;
    if (fuelPercent > 80) return <FaBatteryFull size={28} className="text-light" />;
    if (fuelPercent > 50) return <FaBatteryThreeQuarters size={28} className="text-light" />;
    if (fuelPercent > 20) return <FaBatteryHalf size={28} className="text-light" />;
    if (fuelPercent > 5) return <FaBatteryQuarter size={28} className="text-light" />;
    return <FaBatteryEmpty size={28} className="text-light" />;
  };

  const cards = [
    {
      title: "Total Energy",
      value: `${parseFloat(summary.totalEnergy || 0).toFixed(1)} kWh`,
      icon: <FaBolt size={28} className="text-light" />,
    },
    {
      title: "Total Diesel",
      value: `${parseFloat(summary.totalDiesel || 0).toFixed(1)} L`,
      icon: <FaGasPump size={28} className="text-light" />,
    },
    {
      title: "Last Refill Time",
      value: summary.refillTime || "N/A",
      icon: <FaTachometerAlt size={28} className="text-light" />,
    },
    {
      title: "Diesel Percentage",
      value: `${parseFloat(summary.fuelPercent || 0).toFixed(1)}%`,
      icon: getFuelIcon(summary.fuelPercent),
    },
  ];

  const getCardBackgroundColor = (title, percentage) => {
    if (title === "Diesel Percentage") {
      const fuelPercent = parseFloat(percentage) || 0;
      if (fuelPercent <= 20) return "#9d1623ff"; // Red
      if (fuelPercent < 50) return "#b45c13ff"; // Orange
      return "#21983dff"; // Green
    }
    return "#236a80"; // Default blue-gray
  };

  return (
    <>
      <ToastContainer position="top-center" className="p-3" style={{ zIndex: 1050 }}>
        <Toast
          onClose={() => setShowLowFuelAlert(false)}
          show={showLowFuelAlert}
          delay={10000}
          autohide
          bg="warning"
        >
          <Toast.Header>
            <strong className="me-auto">Fuel Alert</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body>
            Diesel is at {parseFloat(summary.fuelPercent || 0).toFixed(1)}%. Please refill soon.
          </Toast.Body>
        </Toast>
      </ToastContainer>

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