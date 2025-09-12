// import React, { useState, useEffect } from "react";
// import { Handle, Position } from "reactflow";
// import "./PumpBlowerNode.css";

// function PumpBlowerNode({ id, data, setNodes, sendPumpControlMessage }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [nodeName, setNodeName] = useState(data.name);
//   const [isHovered, setIsHovered] = useState(false);

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
//     vibration=0,
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
//       onMouseEnter={() => setIsHovered(true)}
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

//        {isHovered && !data.isPending && (
//         <div className="pump-tooltip">
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
//         </div>
//       )}
//     </div>
//   );
// }

// // export default PumpBlowerNode;
// export default React.memo(PumpBlowerNode);

import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { createPortal } from "react-dom";
import "./PumpBlowerNode.css";

function PumpBlowerNode({ id, data, setNodes, sendPumpControlMessage }) {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeName, setNodeName] = useState(data.name);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8, // small gap below node
    });
    setIsHovered(true);
  };

  console.log("pumpdata:", data);

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
    if (data.isPending) {
      return;
    }
    const newStatus = !data.isOn;
    console.log(`Device ${data.id} is now ${newStatus ? "ON" : "OFF"}`);

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

  const {
    current = 0,
    rpm = 0,
    temperature = 0,
    vibration = 0,
    vrn = 0,
    vyn = 0,
    vbn = 0,
    vry = 0,
    vyb = 0,
    vbr = 0,
    red_phase_current = 0,
    yellow_phase_current = 0,
    blue_phase_current = 0,
  } = data.realtimeValues || {};
  return (
    <div
      className="pump-blower-node"
      // onMouseEnter={() => setIsHovered(true)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* {data.isEditMode && <Handle type="target" position={Position.Top} />}  */}
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
      {/* {data.isEditMode && <Handle type="source" position={Position.Bottom} />}  */}

      {isHovered &&
        !data.isPending &&
        createPortal(
          <div className="pump-tooltip"
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
          <span className="tooltip-item">vrn: {vrn.toFixed(2)} V</span>
          <span className="tooltip-item">vyn: {vyn.toFixed(2)} V</span>
          <span className="tooltip-item">vbn: {vbn.toFixed(2)} V</span>
          <div className="tooltip-sub-heading">Line-to-line voltage</div>
          <span className="tooltip-item">vry: {vry.toFixed(2)} V</span>
          <span className="tooltip-item">vyb: {vyb.toFixed(2)} V</span>
          <span className="tooltip-item">vbr: {vbr.toFixed(2)} V</span>

          <div className="tooltip-heading">Current</div>
          <span className="tooltip-item">
            Red phase current: {red_phase_current.toFixed(2)} A
          </span>
          <span className="tooltip-item">
            Yellow phase current: {yellow_phase_current.toFixed(2)} A
          </span>
          <span className="tooltip-item">
            Blue phase current: {blue_phase_current.toFixed(2)} A
          </span>

          <div className="tooltip-heading"></div>
          <span className="tooltip-item">
            Temperature: {temperature.toFixed(2)} °C
          </span>
          <span className="tooltip-item">
            Revolutions per minute: {rpm.toFixed(2)} rpm
          </span>
          <span className="tooltip-item">
            Vibration: {vibration.toFixed(2)} m/s²
          </span>
        </div>,
          document.body
        )}
    </div>
  );
}

// export default PumpBlowerNode;
export default React.memo(PumpBlowerNode);
