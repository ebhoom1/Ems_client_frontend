// SVGnode.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Resizable } from "re-resizable";
import { FaSyncAlt } from "react-icons/fa";
import { Handle, Position } from "react-flow-renderer";
import "./livemapping.css"; // Ensure this CSS file exists for styling

const API = "https://api.ocems.ebhoom.com"; // Your API base URL

const SVGnode = ({ id, data, selected, liveTankData }) => {
  const {
    socket,
    socketConnected,
    pumpStatus: propStatus = false, // Initial pump status from React Flow state
    isPending: propPending = false, // Initial pending state from React Flow state
    svgPath,
    label: initialLabel = "",
    rotation: initialRotation = 0,
    isPump = false,
    isAirblower = false,
    isTank = false,
    width: initW = 100, // Initial width from node data or default
    height: initH = 100, // Initial height from node data or default
    onPumpToggle, // Callback to update pump state in Canvas
    isEditing: isParentEditing, // Passed from Canvas, controls editability of this node
    onLabelChange, // Callback to update label in Canvas's nodes state
    onRotate, // Callback to update rotation in Canvas's nodes state
  } = data;

  // Assuming product ID is constant or passed via props/context
  const productId = "27"; // This should ideally come from user data or selected station

  // Local state for the node
  const [isOn, setIsOn] = useState(propStatus);
  const [isPending, setIsPending] = useState(propPending);
  const [text, setText] = useState(initialLabel);
  const [size, setSize] = useState({ width: initW, height: initH });
  const [rotation, setRotation] = useState(initialRotation);
  const [isResizing, setIsResizing] = useState(false);
  const [totalDepth, setTotalDepth] = useState(data.totalDepth || "");

  // Tank-specific calculations
  const match = isTank && liveTankData
    ? liveTankData.find((t) => t.tankName?.toLowerCase() === text.toLowerCase())
    : null;
  const depth = match?.level || match?.depth || "0.000"; // Use level or depth, default to "0.000"
  const total = parseFloat(totalDepth) || 1; // Ensure totalDepth is a number for calculation
  const currentDepthNum = parseFloat(depth) || 0;
  const waterLevel = Math.round((currentDepthNum / total) * 100);

  // Update node data with tank specific calculated values for persistence
  useEffect(() => {
    if (isTank) {
      data.totalDepth = totalDepth;
      // data.waterLevel = waterLevel; // Not directly saved, but useful for UI
      data.currentDepth = currentDepthNum; // Save the actual depth
    }
  }, [isTank, totalDepth, waterLevel, currentDepthNum, data]);

  // Handle pump acknowledgment from MQTT via socket
  const handleAcknowledgment = useCallback(
    (ackData) => {
      if (ackData.product_id !== productId) return;
      const pumpUpdate = ackData.pumps.find((p) => p.pumpId === id);
      if (!pumpUpdate) return;

      const newStatus = pumpUpdate.status === 1 || pumpUpdate.status === "ON";
      setIsPending(false);
      setIsOn(newStatus);

      // Sync state to backend
      axios
        .patch(`${API}/api/pump-states/${productId}/${id}`, {
          status: newStatus,
          pending: false,
        })
        .catch((err) => console.error("Failed to sync pump state to backend:", err));

      // Inform parent component (Canvas) about the state change
      if (onPumpToggle) {
        onPumpToggle(id, text, newStatus, false);
      }
    },
    [productId, id, text, onPumpToggle]
  );

  // Setup socket listeners for pump acknowledgments
  useEffect(() => {
    if (!socket || !isPump && !isAirblower) return; // Only listen if it's a pump/blower
    socket.on("pumpAck", handleAcknowledgment);
    socket.on("pumpStateUpdate", handleAcknowledgment); // Assuming this is also used for updates

    return () => {
      socket.off("pumpAck", handleAcknowledgment);
      socket.off("pumpStateUpdate", handleAcknowledgment);
    };
  }, [socket, isPump, isAirblower, handleAcknowledgment]);

  // Fetch initial pump state when component mounts (for pumps/blowers)
  useEffect(() => {
    if (!isPump && !isAirblower) return;
    const fetchInitialState = async () => {
      try {
        const { data: state } = await axios.get(
          `${API}/api/pump-states/${productId}/${id}`
        );
        setIsOn(state.status);
        setIsPending(state.pending);
        if (onPumpToggle) {
          onPumpToggle(id, text, state.status, state.pending);
        }
      } catch (err) {
        console.error("Failed to fetch initial pump state:", err);
        // Fallback to propStatus if fetching fails
        setIsOn(propStatus || false);
      }
    };
    fetchInitialState();
  }, [id, isPump, isAirblower, productId, text, onPumpToggle, propStatus]);

  // Sync local state `isOn` with `propStatus` from parent React Flow
  useEffect(() => {
    setIsOn(propStatus);
  }, [propStatus]);

  // Sync local state `isPending` with `propPending` from parent React Flow
  useEffect(() => {
    setIsPending(propPending);
  }, [propPending]);

  // Update the label in the parent's (Canvas) node data when local text changes
  useEffect(() => {
    if (onLabelChange) {
      onLabelChange(id, text);
    }
  }, [text, id, onLabelChange]);

  // Toggle device state (ON/OFF) for pumps/blowers
  const toggleDevice = async () => {
    if (!socketConnected) {
      alert("Device is offline. Cannot control.");
      return;
    }
    if (isPending) {
      alert("Command pending. Please wait.");
      return;
    }

    const newStatus = !isOn;
    setIsPending(true); // Set pending immediately in UI

    if (onPumpToggle) {
      onPumpToggle(id, text, newStatus, true); // Inform parent about pending state
    }

    try {
      // Update backend first
      await axios.patch(`${API}/api/pump-states/${productId}/${id}`, {
        status: newStatus,
        pending: true,
      });

      // Then send MQTT command to device
      socket.emit("controlPump", {
        product_id: productId,
        pumps: [
          {
            pumpId: id,
            pumpName: text,
            status: newStatus ? "ON" : "OFF",
            messageId: `cmd-${Date.now()}-${id}`, // Unique ID for this command
          },
        ],
      });
    } catch (err) {
      console.error("Toggle device failed:", err.response ? err.response.data : err.message);
      alert("Failed to send control command.");
      setIsPending(false); // Revert pending state on error
      if (onPumpToggle) {
        onPumpToggle(id, text, isOn, false); // Revert parent's state
      }
    }
  };

  // Rotate handler
  const rotateHandler = () => {
    const nextRotation = (rotation + 45) % 360;
    setRotation(nextRotation);
    if (onRotate) {
      onRotate(id, nextRotation); // Inform parent about new rotation
    }
  };

  // Resize handler
  const handleResize = useCallback((e, dir, refToElement, delta) => {
    const newWidth = size.width + delta.width;
    const newHeight = size.height + delta.height;
    setSize({ width: newWidth, height: newHeight });
    // Update data object directly, this will be saved on save
    data.width = newWidth;
    data.height = newHeight;
  }, [size, data]);

  // Status text helper for pumps/blowers
  const statusText = useCallback(() => {
    if (isPending) return "PENDING…";
    if (isOn) return isPump ? "RUNNING" : "ON";
    return isPump ? "STOPPED" : "OFF";
  }, [isPending, isOn, isPump]);

  // Render logic for Pump/Airblower specific nodes
  if (isPump || isAirblower) {
    return (
      <div
        className="svg-node-container" // Add a class for potential global styling
        style={{
          border: selected ? '2px solid #0074D9' : '1px solid #ddd',
          borderRadius: 6,
          padding: 2,
          backgroundColor: '#fff',
          minWidth: 80,
          cursor: isParentEditing ? 'grab' : 'default', // Only grab cursor if editing
          position: 'relative',
          fontSize: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%', // Ensure it takes full height of React Flow node
          width: '100%', // Ensure it takes full width of React Flow node
        }}
      >
        {/* Connection handles for piping */}
        {['Top', 'Right', 'Bottom', 'Left'].map(pos => (
          <Handle
            id={pos.toLowerCase()}
            key={pos}
            type={pos === 'Top' || pos === 'Left' ? 'target' : 'source'}
            position={Position[pos]}
            style={{
              background: isParentEditing ? '#D9DFC6' : 'transparent',
              width: 8,
              height: 8,
              borderRadius: '50%',
              zIndex: 9,
              position: 'absolute',
              [pos.toLowerCase()]: -10, // Position handles correctly
              pointerEvents: isParentEditing ? 'auto' : 'none', // Active only in edit mode
              border: isParentEditing ? '1px solid #ccc' : 'none',
            }}
          />
        ))}
        {/* Label input for pump/blower name */}
        <div style={{ marginBottom: 4, width: '100%', textAlign: 'center' }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            readOnly={!isParentEditing} // <--- **CRITICAL FIX: Controlled by isParentEditing**
            placeholder={isPump ? "Pump Name" : "Blower Name"}
            style={{
              width: 'calc(100% - 4px)', // Adjust for padding/border
              fontSize: '10px',
              fontWeight: 'bold',
              border: isParentEditing ? '1px solid #ddd' : 'none',
              textAlign: 'center',
              outline: 'none',
              backgroundColor: 'transparent',
              borderRadius: 4,
              padding: isParentEditing ? '2px' : '0',
            }}
          />
        </div>
        {/* Current Status */}
        <div
          style={{
            color: isPending ? '#FFA500' : isOn ? '#2ECC40' : '#FF4136',
            fontSize: '10px',
            textAlign: 'center',
            marginBottom: 4,
          }}
        >
          {statusText()}
        </div>
        {/* Toggle Switch */}
        <div
          onClick={toggleDevice}
          style={{
            position: 'relative',
            width: 40,
            height: 18,
            borderRadius: 9,
            cursor: socketConnected && !isPending ? 'pointer' : 'not-allowed',
            margin: '0 auto',
            backgroundColor: isPending ? '#FFA500' : isOn ? '#2ECC40' : '#FF4136',
            opacity: socketConnected ? 1 : 0.5,
            transition: 'all 0.3s ease',
            pointerEvents: socketConnected && !isPending ? 'auto' : 'none', // Disable clicks if offline/pending
          }}
          title={!socketConnected ? 'Device Offline' : isPending ? 'Command Pending...' : ''}
        >
          <div
            style={{
              position: 'absolute',
              top: 1,
              left: 0,
              width: 16, // Slightly wider knob for better visuals
              height: 16,
              borderRadius: '50%',
              backgroundColor: '#fff',
              transform: isOn
                ? 'translateX(22px)' // Slide right
                : 'translateX(2px)', // Stay near left (add 2px for padding)
              transition: 'transform 0.3s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </div>
        {/* Rotate icon (only visible in edit mode) */}
        {isParentEditing && (
          <div
            style={{
              position: 'absolute',
              top: 6,
              right: 6, // Position on the top-right corner
              cursor: 'pointer',
              zIndex: 10,
            }}
            onClick={rotateHandler}
            title="Rotate"
          >
            <FaSyncAlt size={14} color="#555" />
          </div>
        )}
      </div>
    );
  }

  // Render logic for other node types (Tanks, generic SVGs, etc.)
  const nodeStyle = {
    position: "relative",
    overflow: isParentEditing ? "visible" : "hidden", // Allow overflow for resize handles in edit mode
    zIndex: isResizing ? 100 : 1, // Bring to front when resizing
    border: selected ? "2px solid #0074D9" : "none", // Highlight when selected
    boxShadow: isResizing ? "0 0 10px rgba(0,0,0,0.3)" : "none", // Shadow when resizing
    transform: `rotate(${rotation}deg)`,
    transition: "transform 0.2s ease-out", // Smooth rotation
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain", // Maintain aspect ratio
    filter: isTank ? "none" : "drop-shadow(0 0 8px rgba(0,0,0,0.2))", // Drop shadow for non-tanks
    transition: "all 0.3s ease",
  };

  return (
    <div style={nodeStyle}>
      {/* Connection handles */}
      {["Top", "Right", "Bottom", "Left"].map((pos) => (
        <Handle
          id={pos.toLowerCase()}
          key={pos}
          type={pos === "Top" || pos === "Left" ? "target" : "source"}
          position={Position[pos]}
          style={{
            background: isParentEditing ? "#D9DFC6" : "transparent",
            width: 10,
            height: 10,
            borderRadius: "50%",
            zIndex: 9999, // Ensure handles are on top
            position: "absolute",
            [pos.toLowerCase()]: -12,
            pointerEvents: isParentEditing ? "auto" : "none", // Active only in edit mode
            border: isParentEditing ? "1px solid #ccc" : "none",
          }}
        />
      ))}
      <Resizable
        size={size}
        onResize={handleResize}
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={() => setIsResizing(false)}
        minWidth={50} // Minimum size
        minHeight={50}
        maxWidth={500} // Maximum size
        maxHeight={500}
        // Enable resize handles only in edit mode
        enable={
          isParentEditing
            ? {
              top: true, right: true, bottom: true, left: true,
              topRight: true, topLeft: true, bottomRight: true, bottomLeft: true,
            }
            : {}
        }
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} // Center content during resize
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <img src={svgPath} alt={text} style={imageStyle} />
          {isTank && waterLevel != null && ( // Render water level for tanks
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: `${waterLevel}%`,
                backgroundColor:
                  waterLevel > 90
                    ? "rgba(255, 0, 0, 0.5)" // Red for high level
                    : "rgba(0, 123, 255, 0.4)", // Blue otherwise
                transition: "height 0.5s ease-in-out",
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
                zIndex: 2,
              }}
            />
          )}
        </div>
      </Resizable>
      {/* Label and controls - always visible (input is readOnly in view mode) */}
      <div
        style={{
          width: "100%",
          marginTop: 6,
          fontSize: "12px",
          border: "1px solid #ddd",
          borderRadius: 4,
          padding: 4,
          backgroundColor: "#f9f9f9",
          textAlign: "center",
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          readOnly={!isParentEditing} // <--- **CRITICAL FIX: Controlled by isParentEditing**
          placeholder={isTank ? "Tank Name" : "Label"}
          style={{
            width: "calc(100% - 4px)", // Adjust for padding/border
            fontSize: "12px",
            border: isParentEditing ? "1px solid #ddd" : "none",
            textAlign: "center",
            outline: "none",
            backgroundColor: "transparent",
            borderRadius: 4,
            padding: isParentEditing ? "4px" : 0,
          }}
        />
        {isTank && ( // Tank specific inputs/display
          <>
            <input
              type="number"
              value={totalDepth}
              onChange={(e) => setTotalDepth(e.target.value)}
              readOnly={!isParentEditing} // <--- **CRITICAL FIX: Controlled by isParentEditing**
              placeholder="Total Depth (units)"
              style={{
                width: "calc(100% - 4px)",
                fontSize: "12px",
                border: isParentEditing ? "1px solid #ddd" : "none",
                textAlign: "center",
                outline: "none",
                backgroundColor: "transparent",
                marginTop: 4,
                borderRadius: 4,
                padding: isParentEditing ? "4px" : 0,
              }}
            />
            <div style={{ marginTop: 4, fontWeight: 'bold' }}>
              {currentDepthNum != null ? `Depth: ${currentDepthNum} units` : "Depth: N/A"}
            </div>
            <div style={{ marginTop: 2, color: waterLevel > 90 ? 'red' : 'green', fontWeight: 'bold' }}>
              {waterLevel != null ? `Water level: ${waterLevel}%` : "Level: N/A"}
            </div>
          </>
        )}
      </div>
      {/* Rotate button (only visible in edit mode) */}
      {isParentEditing && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10, // Position on the top-right corner
            cursor: "pointer",
            zIndex: 10,
          }}
          onClick={rotateHandler}
          title="Rotate"
        >
          <FaSyncAlt size={18} color="#555" />
        </div>
      )}
    </div>
  );
};

export default SVGnode;