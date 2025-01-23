import React, { useState } from "react";
import io from "socket.io-client";
import "./index.css";

// Connect to your backend Socket.io server
const socket = io("http://localhost:5555");

const Pump = () => {
  const [pump1Status, setPump1Status] = useState(false); // Toggle state for Pump1
  const [pump2Status, setPump2Status] = useState(false); // Toggle state for Pump2

  // Function to handle toggling a pump
  const handleToggle = (pumpId, pumpName, isOn) => {
    const status = isOn ? "ON" : "OFF"; // Convert boolean to ON/OFF
    const payload = {
      product_id: "14", // Replace with your actual product_id
      pumps: [
        {
          pumpId, // Add pumpId
          pumpName,
          status,
        },
      ],
    };

    // Emit data to the server
    socket.emit("controlPump", payload);
    console.log(`Sent ${status} command for ${pumpName} (Pump ID: ${pumpId})`);
};

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Pump Control Dashboard</h1>

      {/* Pump 1 */}
      <div
        style={{
          margin: "20px auto",
          padding: "20px",
          border: "1px solid gray",
          borderRadius: "10px",
          width: "200px",
          textAlign: "center",
        }}
      >
        <h3>Pump 1</h3>
        <label className="switch">
          <input
            type="checkbox"
            checked={pump1Status}
            onChange={() => {
              const newStatus = !pump1Status;
              setPump1Status(newStatus);
              handleToggle("PUMP01", "Pump1", newStatus); // Pump1 with pumpId = 5
            }}
          />
          <span className="slider round"></span>
        </label>
        <p>Status: {pump1Status ? "ON" : "OFF"}</p>
      </div>

      {/* Pump 2 */}
      <div
        style={{
          margin: "20px auto",
          padding: "20px",
          border: "1px solid gray",
          borderRadius: "10px",
          width: "200px",
          textAlign: "center",
        }}
      >
        <h3>Pump 2</h3>
        <label className="switch">
          <input
            type="checkbox"
            checked={pump2Status}
            onChange={() => {
              const newStatus = !pump2Status;
              setPump2Status(newStatus);
              handleToggle("PUMP02", "Pump2", newStatus); // Pump2 with pumpId = 4
            }}
          />
          <span className="slider round"></span>
        </label>
        <p>Status: {pump2Status ? "ON" : "OFF"}</p>
      </div>
    </div>
  );
};

export default Pump;