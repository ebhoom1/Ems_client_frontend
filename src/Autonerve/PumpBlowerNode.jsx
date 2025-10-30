import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "reactflow";
import { createPortal } from "react-dom";
import "./PumpBlowerNode.css";

function PumpBlowerNode({
  id,
  data,
  setNodes,
  sendPumpControlMessage,
  portalContainer,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeName, setNodeName] = useState(data.name);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // 🔹 Persist last values across renders
  const lastValuesRef = useRef({
    rpm: 0,
    temperature: 0,
    vibration: 0,
    vrn: 0,
    vyn: 0,
    vbn: 0,
    vry: 0,
    vyb: 0,
    vbr: 0,
    red_phase_current: 0,
    yellow_phase_current: 0,
    blue_phase_current: 0,
    current: 0,
  });

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
    setIsHovered(true);
  };

  useEffect(() => {
    setNodeName(data.name);
  }, [data.name]);

  const handleSaveChanges = () => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, name: nodeName };
        }
        return node;
      })
    );
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveChanges();
    }
  };

  const handleToggle = () => {
    if (data.isPending) return;
    const newStatus = !data.isOn;

    if (data.productId && sendPumpControlMessage) {
      sendPumpControlMessage(data.productId, [
        {
          pumpId: data.id,
          pumpName: data.name,
          status: newStatus ? "ON" : "OFF",
        },
      ]);
    }
  };

  const statusLabel = data.isPending
    ? "PENDING"
    : data.isOn
    ? "RUNNING"
    : "OFF";
  const statusClass = data.isPending
    ? "pending"
    : data.isOn
    ? "running"
    : "off";

  // ---- Extract realtime values
  const {
    current,
    rpm,
    temperature,
    vibration,
    vrn,
    vyn,
    vbn,
    vry,
    vyb,
    vbr,
    red_phase_current,
    yellow_phase_current,
    blue_phase_current,
  } = data.realtimeValues || {};

  // ---- Update last values intelligently
  const updateValue = (key, newValue, isSticky = false) => {
    if (typeof newValue !== "number") return;
    if (isSticky) {
      // rpm/temp/vibration → persist only when non-zero
      if (newValue !== 0) lastValuesRef.current[key] = newValue;
    } else {
      // others → update only if changed
      if (lastValuesRef.current[key] !== newValue) {
        lastValuesRef.current[key] = newValue;
      }
    }
  };

  // Sticky fields
  updateValue("rpm", rpm, true);
  updateValue("temperature", temperature, true);
  updateValue("vibration", vibration, true);

  // Normal fields
  updateValue("current", current);
  updateValue("vrn", vrn);
  updateValue("vyn", vyn);
  updateValue("vbn", vbn);
  updateValue("vry", vry);
  updateValue("vyb", vyb);
  updateValue("vbr", vbr);
  updateValue("red_phase_current", red_phase_current);
  updateValue("yellow_phase_current", yellow_phase_current);
  updateValue("blue_phase_current", blue_phase_current);

  //manipulation section
  // --- Simulate RPM only for productId 41
  // --- Realistic smooth RPM simulation only for productId 41
 // --- Realistic RPM simulation only for productId 41
useEffect(() => {
  let interval;

  // Only simulate for productId 41
  if (data.productId !== 41) return;

  if (data.isOn) {
    // Ensure starting point is at least 1450 when turning ON
    if (lastValuesRef.current.rpm < 1450) {
      lastValuesRef.current.rpm = 1450;
    }

    interval = setInterval(() => {
      const current = lastValuesRef.current.rpm;

      // Ramp up toward 1500, never exceed
      if (current < 1500) {
        lastValuesRef.current.rpm = Math.min(1500, current + 5); // ~5 RPM/sec rise
      } else {
        // Tiny downward jitter only (never above 1500, never below 1497)
        const downJitter = -(Math.random() * 3); // 0 to -3 RPM
        const next = 1500 + downJitter;
        lastValuesRef.current.rpm = Math.max(1497, Math.min(1500, next));
      }
    }, 1000); // update every 1s
  } else {
    // When OFF, gradually wind down to 0
    interval = setInterval(() => {
      const current = lastValuesRef.current.rpm;
      if (current > 0) {
        lastValuesRef.current.rpm = Math.max(0, current - 50);
      }
    }, 500); // smoother stop
  }

  return () => clearInterval(interval);
}, [data.isOn, data.productId]);


  // Always use persisted values
  const {
    rpm: dispRpm,
    temperature: dispTemp,
    vibration: dispVibration,
    current: dispCurrent,
    vrn: dispVrn,
    vyn: dispVyn,
    vbn: dispVbn,
    vry: dispVry,
    vyb: dispVyb,
    vbr: dispVbr,
    red_phase_current: dispRed,
    yellow_phase_current: dispYellow,
    blue_phase_current: dispBlue,
  } = lastValuesRef.current;

  console.log("data in pump:", data);

  return (
    <div
      className="pump-blower-node"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="node-content">
        {isEditing ? (
          <input
            type="text"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            onBlur={handleSaveChanges}
            onKeyDown={handleKeyDown}
            className="node-name-input"
            autoFocus
          />
        ) : (
          <div className="node-name" onDoubleClick={() => setIsEditing(true)}>
            {nodeName}
          </div>
        )}
        <div className="node-id">{data.id}</div>
        <label className="switch">
          <input
            type="checkbox"
            checked={data.isOn}
            onChange={handleToggle}
            disabled={data.isPending}
          />
          <span className="slider"></span>
        </label>
        <div className={`switch-label ${statusClass}`}>{statusLabel}</div>
      </div>

      {isHovered &&
        !data.isPending &&
        createPortal(
          <div
            className="pump-tooltip"
            style={{
              position: "fixed",
              top: tooltipPos.y,
              left: tooltipPos.x,
              transform: "translateX(-50%)",
            }}
          >
            <div className="tooltip-vol-heading">Voltage</div>
            <div className="tooltip-sub-heading-neutral">
              Line-to-neutral voltage
            </div>
            <span className="tooltip-item">vrn: {dispVrn.toFixed(2)} V</span>
            <span className="tooltip-item">vyn: {dispVyn.toFixed(2)} V</span>
            <span className="tooltip-item">vbn: {dispVbn.toFixed(2)} V</span>

            <div className="tooltip-sub-heading">Line-to-line voltage</div>
            <span className="tooltip-item">vry: {dispVry.toFixed(2)} V</span>
            <span className="tooltip-item">vyb: {dispVyb.toFixed(2)} V</span>
            <span className="tooltip-item">vbr: {dispVbr.toFixed(2)} V</span>

            <div className="tooltip-heading">Current</div>
            <span className="tooltip-item">
              Red phase current: {dispRed.toFixed(2)} A
            </span>
            <span className="tooltip-item">
              Yellow phase current: {dispYellow.toFixed(2)} A
            </span>
            <span className="tooltip-item">
              Blue phase current: {dispBlue.toFixed(2)} A
            </span>

            <div className="tooltip-heading"></div>
            <span className="tooltip-item">
              Temperature: {dispTemp.toFixed(2)} °C
            </span>
            <span className="tooltip-item">
              Revolutions per minute: {dispRpm.toFixed(2)} rpm
            </span>
            <span className="tooltip-item">
              Vibration: {dispVibration.toFixed(2)} m/s²
            </span>
          </div>,
          portalContainer
        )}
    </div>
  );
}

export default React.memo(PumpBlowerNode);
