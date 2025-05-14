// src/pages/LiveMapping/DeviceNode.jsx
import React from "react";
import { Handle, Position } from "react-flow-renderer";

export default function DeviceNode({ data, selected }) {
  const { id, label, pumpStatus, onPumpToggle, isPump, isAirblower, isEditing } = data;
  const isDevice = isPump || isAirblower;

  return (
    <div
      style={{
        padding: 8,
        background: "#fff",
        border: selected ? "2px solid #0074D9" : "1px solid #ccc",
        borderRadius: 4,
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#555" }} />

      <div style={{ margin: "8px 0", fontWeight: "bold" }}>{label}</div>

      {isDevice && (
        <div
          onClick={() => onPumpToggle(id, label, !pumpStatus, false)}
          style={{
            width: 40,
            height: 20,
            background: pumpStatus ? "#2ECC40" : "#FF4136",
            borderRadius: 10,
            cursor: isEditing ? "pointer" : "not-allowed",
            margin: "0 auto",
            position: "relative",
            opacity: isEditing ? 1 : 0.6,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              background: "#fff",
              borderRadius: "50%",
              position: "absolute",
              top: 1,
              left: pumpStatus ? 20 : 1,
              transition: "left 0.2s",
            }}
          />
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
    </div>
  );
}
