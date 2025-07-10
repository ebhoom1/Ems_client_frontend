// src/components/TankNode.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Handle, Position } from "react-flow-renderer";

export default function TankNode({ data, id }) {
  // 1. Get all values directly from the data prop.
  // The Canvas component has already calculated and provided these.
  const {
    isEditing,
    label,
    percentage = 0, // Default to 0 if no data yet
    level = 0,
    onLabelChange,
  } = data;

  // 2. Use a local state for the editable tank name.
  const [tankName, setTankName] = useState(label || "");

  // 3. Persist changes back to the node's data object.
  useEffect(() => {
    data.label = tankName;
    if (onLabelChange) {
      onLabelChange(id, tankName);
    }
  }, [tankName, data, onLabelChange, id]);

  // 4. Determine the bar color based on the percentage.
  const barColor = useMemo(() => {
    if (percentage <= 25) return "#ff4444"; // Red
    if (percentage <= 50) return "#ff9900"; // Orange
    if (percentage <= 70) return "#00bcd4"; // Cyan
    if (percentage <= 90) return "#4285F4"; // Blue
    return "#34a853"; // Green
  }, [percentage]);

  // 5. Correct spelling for specific tank names
  const displayName = useMemo(() => {
    if (tankName === "Airation") return "Aeration";
    if (tankName === "Equilisation") return "Equalization";
    return tankName;
  }, [tankName]);

  return (
    <div
      style={{
        width: 100,
        padding: 4,
        background: "#ffffff",
        borderRadius: 4,
        border: "1px solid #ddd",
        textAlign: "center",
        fontSize: "12px",
      }}
    >
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* Tank Name / Label */}
      <div style={{ fontWeight: "bold", fontSize: "12px", marginBottom: 4 }}>
        {isEditing ? (
          <input
            value={tankName}
            onChange={(e) => setTankName(e.target.value)}
            placeholder="Tank Name"
            className="nodrag"
            style={{
              width: "100%",
              fontSize: "12px",
              background: "transparent",
              border: isEditing ? "1px solid #eee" : "none",
              textAlign: "center",
              outline: "none",
              borderRadius: "3px",
            }}
          />
        ) : (
          displayName || "Unnamed"
        )}
      </div>

      {/* Percentage */}
      <div style={{ fontSize: "12px", fontWeight: "bold", color: barColor }}>
        {(Number(percentage) || 0).toFixed(1)}%
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: 6,
          width: "100%",
          backgroundColor: "#e0e0e0",
          borderRadius: 3,
          marginTop: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            backgroundColor: barColor,
            transition: "width 0.5s ease, background-color 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
