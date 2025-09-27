
// import React, { useState, useEffect } from "react";
// import { Handle, Position } from "reactflow";
// import { createPortal } from "react-dom";
// import "./PumpBlowerNode.css";

// function PumpBlowerNode({ id, data, setNodes, sendPumpControlMessage,portalContainer }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [nodeName, setNodeName] = useState(data.name);
//   const [isHovered, setIsHovered] = useState(false);
//   const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

//   const handleMouseEnter = (e) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     setTooltipPos({
//       x: rect.left + rect.width / 2,
//       y: rect.bottom + 8, // small gap below node
//     });
//     setIsHovered(true);
//   };

//   console.log("pumpdata:", data);

//   useEffect(() => {
//     setNodeName(data.name);
//   }, [data.name]);

//   const handleSaveChanges = () => {
//     setNodes((nds) =>
//       nds.map((node) => {
//         if (node.id === id) {
//           node.data = { ...node.data, name: nodeName };
//         }
//         return node;
//       })
//     );
//     setIsEditing(false);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       handleSaveChanges();
//     }
//   };

//   const handleToggle = () => {
//     if (data.isPending) {
//       return;
//     }
//     const newStatus = !data.isOn;
//     console.log(`Device ${data.id} is now ${newStatus ? "ON" : "OFF"}`);

//     if (data.productId && sendPumpControlMessage) {
//       sendPumpControlMessage(data.productId, [
//         {
//           pumpId: data.id,
//           pumpName: data.name,
//           status: newStatus ? "ON" : "OFF",
//         },
//       ]);
//     }
//   };

//   const statusLabel = data.isPending
//     ? "PENDING"
//     : data.isOn
//     ? "RUNNING"
//     : "OFF";
//   const statusClass = data.isPending
//     ? "pending"
//     : data.isOn
//     ? "running"
//     : "off";

//   const {
//     current = 0,
//     rpm = 0,
//     temperature = 0,
//     vibration = 0,
//     vrn = 0,
//     vyn = 0,
//     vbn = 0,
//     vry = 0,
//     vyb = 0,
//     vbr = 0,
//     red_phase_current = 0,
//     yellow_phase_current = 0,
//     blue_phase_current = 0,
//   } = data.realtimeValues || {};
//   return (
//     <div
//       className="pump-blower-node"
//       // onMouseEnter={() => setIsHovered(true)}
//       onMouseEnter={handleMouseEnter}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {/* {data.isEditMode && <Handle type="target" position={Position.Top} />}  */}
//       <div className="node-content">
//         {isEditing ? (
//           <input
//             type="text"
//             value={nodeName}
//             onChange={(e) => setNodeName(e.target.value)}
//             onBlur={handleSaveChanges}
//             onKeyDown={handleKeyDown}
//             className="node-name-input"
//             autoFocus
//           />
//         ) : (
//           <div className="node-name" onDoubleClick={() => setIsEditing(true)}>
//             {nodeName}
//           </div>
//         )}
//         <div className="node-id">{data.id}</div>
//         <label className="switch">
//           <input
//             type="checkbox"
//             checked={data.isOn}
//             onChange={handleToggle}
//             disabled={data.isPending}
//           />
//           <span className="slider"></span>
//         </label>
//         <div className={`switch-label ${statusClass}`}>{statusLabel}</div>
//       </div>
//       {/* {data.isEditMode && <Handle type="source" position={Position.Bottom} />}  */}

//       {isHovered &&
//         !data.isPending &&
//         createPortal(
//           <div className="pump-tooltip"
//            style={{
//         position: "fixed",
//         top: tooltipPos.y,
//         left: tooltipPos.x,
//         transform: "translateX(-50%)",
//       }}
//           >
//           <div className="tooltip-vol-heading">Voltage</div>
//           <div className="tooltip-sub-heading-neutral">
//            Line-to-neutral voltage
//           </div>
//           <span className="tooltip-item">vrn: {vrn.toFixed(2)} V</span>
//           <span className="tooltip-item">vyn: {vyn.toFixed(2)} V</span>
//           <span className="tooltip-item">vbn: {vbn.toFixed(2)} V</span>
//           <div className="tooltip-sub-heading">Line-to-line voltage</div>
//           <span className="tooltip-item">vry: {vry.toFixed(2)} V</span>
//           <span className="tooltip-item">vyb: {vyb.toFixed(2)} V</span>
//           <span className="tooltip-item">vbr: {vbr.toFixed(2)} V</span>

//           <div className="tooltip-heading">Current</div>
//           <span className="tooltip-item">
//             Red phase current: {red_phase_current.toFixed(2)} A
//           </span>
//           <span className="tooltip-item">
//             Yellow phase current: {yellow_phase_current.toFixed(2)} A
//           </span>
//           <span className="tooltip-item">
//             Blue phase current: {blue_phase_current.toFixed(2)} A
//           </span>

//           <div className="tooltip-heading"></div>
//           <span className="tooltip-item">
//             Temperature: {temperature.toFixed(2)} °C
//           </span>
//           <span className="tooltip-item">
//             Revolutions per minute: {rpm.toFixed(2)} rpm
//           </span>
//           <span className="tooltip-item">
//             Vibration: {vibration.toFixed(2)} m/s²
//           </span>
//         </div>,
//           portalContainer
//         )
//         }
//     </div>
//   );
// }

// // export default PumpBlowerNode;
// export default React.memo(PumpBlowerNode);

import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "reactflow";
import { createPortal } from "react-dom";
import "./PumpBlowerNode.css";

function PumpBlowerNode({ id, data, setNodes, sendPumpControlMessage, portalContainer }) {
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
        { pumpId: data.id, pumpName: data.name, status: newStatus ? "ON" : "OFF" },
      ]);
    }
  };

  const statusLabel = data.isPending ? "PENDING" : data.isOn ? "RUNNING" : "OFF";
  const statusClass = data.isPending ? "pending" : data.isOn ? "running" : "off";

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
            <div className="tooltip-sub-heading-neutral">Line-to-neutral voltage</div>
            <span className="tooltip-item">vrn: {dispVrn.toFixed(2)} V</span>
            <span className="tooltip-item">vyn: {dispVyn.toFixed(2)} V</span>
            <span className="tooltip-item">vbn: {dispVbn.toFixed(2)} V</span>

            <div className="tooltip-sub-heading">Line-to-line voltage</div>
            <span className="tooltip-item">vry: {dispVry.toFixed(2)} V</span>
            <span className="tooltip-item">vyb: {dispVyb.toFixed(2)} V</span>
            <span className="tooltip-item">vbr: {dispVbr.toFixed(2)} V</span>

            <div className="tooltip-heading">Current</div>
            <span className="tooltip-item">Red phase current: {dispRed.toFixed(2)} A</span>
            <span className="tooltip-item">Yellow phase current: {dispYellow.toFixed(2)} A</span>
            <span className="tooltip-item">Blue phase current: {dispBlue.toFixed(2)} A</span>

            <div className="tooltip-heading"></div>
            <span className="tooltip-item">Temperature: {dispTemp.toFixed(2)} °C</span>
            <span className="tooltip-item">Revolutions per minute: {dispRpm.toFixed(2)} rpm</span>
            <span className="tooltip-item">Vibration: {dispVibration.toFixed(2)} m/s²</span>
          </div>,
          portalContainer
        )}
    </div>
  );
}

export default React.memo(PumpBlowerNode);
