// src/components/TankNode.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Handle, Position } from "react-flow-renderer";

export default function TankNode({ data, liveTankData, id }) {
  const { isEditing } = data;

  // 1) Editable tankName, defaulting to saved data or node label
  const [tankName, setTankName] = useState(
    data.tankName || data.label || ""
  );

  // 2) Find a fresh match in liveTankData
  const freshMatch = liveTankData?.find(
    (t) =>
      t.tankName.trim().toLowerCase() ===
      tankName.trim().toLowerCase()
  );

  // 3) Keep the last match in state
  const [lastMatch, setLastMatch] = useState(freshMatch);

  useEffect(() => {
    // Whenever we get a new freshMatch, update lastMatch
    if (freshMatch) {
      setLastMatch(freshMatch);
    }
    // Else leave lastMatch untouched
  }, [freshMatch]);

  // 4) Derive displayed percentage & level from lastMatch (or 0 if none ever)
  const displayedPercent = useMemo(() => {
    if (!lastMatch) return 0;
    const pct = Math.round(Number(lastMatch.percentage));
    return Math.min(100, Math.max(0, pct));
  }, [lastMatch]);

  const displayedLevel = useMemo(() => {
    if (!lastMatch) return 0;
    return parseFloat(lastMatch.level ?? lastMatch.depth ?? 0);
  }, [lastMatch]);

  // 5) Pick a color based on displayedPercent
  const barColor = useMemo(() => {
    const p = displayedPercent;
    if (p <= 25) return "#ff4444";
    if (p <= 50) return "#ff9900";
    if (p <= 70) return "#00bcd4";
    if (p <= 90) return "#4285F4";
    return "#34a853";
  }, [displayedPercent]);

  // 6) Debug logging
  useEffect(() => {
    if (lastMatch) {
      console.log("💧 Displaying last tank data:", lastMatch);
    } else {
      console.log(`💧 No tank data yet for "${tankName}"`);
    }
  }, [lastMatch, tankName]);

  // 7) Persist back into node data for saving
  useEffect(() => {
    data.tankName = tankName;
    data.label = tankName;               // keep React Flow label in sync
    data.percentFull = displayedPercent; // used by save/export
    data.backendPercentage = lastMatch?.percentage;
    data.level = displayedLevel;

    // If Canvas provided an onLabelChange, tell it about name edits
    if (data.onLabelChange) {
      data.onLabelChange(id, tankName);
    }
  }, [
    tankName,
    displayedPercent,
    displayedLevel,
    lastMatch,
    data,
    id,
  ]);

  return (
    <div
      style={{
        width: 100,
        padding: 4,
        background: "transparent",
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
              border: "none",
              textAlign: "center",
              outline: "none",
            }}
          />
        ) : (
          tankName || "Unnamed"
        )}
      </div>

      {/* Percentage */}
      <div
        style={{
          fontSize: "12px",
          fontWeight: "bold",
          color: barColor,
        }}
      >
        {displayedPercent}%
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
            width: `${displayedPercent}%`,
            backgroundColor: barColor,
            transition: "width 0.5s ease, background-color 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
