// Updated SVGNode.jsx with enhanced pump details handling
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Resizable } from "re-resizable";
import { FaSyncAlt } from "react-icons/fa";
import { Handle, Position } from "react-flow-renderer";
import "./livemapping.css";
import { useSelector } from "react-redux";

const API = "https://api.ocems.ebhoom.com";

const SVGnode = ({ id, data, selected, liveTankData }) => {
  console.log(`🔧 [SVGnode ID: ${id}] Full data object:`, data);
  console.log(`🔧 [SVGnode ID: ${id}] pumpDetails specifically:`, data.pumpDetails);
  
  const {
    socket,
    socketConnected,
    pumpStatus: propStatus = "OFF", // Default to "OFF" string
    isPending: propPending = false,
    svgPath,
    label: initialLabel = "",
    rotation: initialRotation = 0,
    isPump = false,
    isAirblower = false,
    isTank = false,
    width: initW = 100,
    height: initH = 100,
    onPumpToggle,
    isEditing: isParentEditing,
    pumpDetails, // Get the detailed pump data
  } = data;
    const { userData } = useSelector((state) => state.user);
  
  const productId = userData?.validUserOne?.productID;
  console.log(`[SVGnode ID: ${id}] Pump Details:`, pumpDetails);

  // Local state - keep status as string "ON"/"OFF"
  const [status, setStatus] = useState(propStatus); // Keep as "ON"/"OFF"
  const [isPending, setIsPending] = useState(propPending);
  const [text, setText] = useState(initialLabel);
  const [size, setSize] = useState({ width: initW, height: initH });
  const [rotation, setRotation] = useState(initialRotation);
  const [isResizing, setIsResizing] = useState(false);
  const [totalDepth, setTotalDepth] = useState(data.totalDepth || "");
  const [isHovering, setIsHovering] = useState(false);

  // Helper function to check if pump is on (handle both boolean and string status)
  const isOn = status === "ON" || status === true;

  // Tank data logic
  const match = liveTankData.find(
    (t) => t.tankName?.toLowerCase() === text.toLowerCase()
  );
  const depth = match?.depth || 0;
  const total = totalDepth || 1;
  const waterLevel = Math.round((depth / total) * 100);

  useEffect(() => {
    data.totalDepth = totalDepth;
    data.waterLevel = waterLevel;
  }, [totalDepth, waterLevel, data]);

  // Update local state when pumpDetails changes
  useEffect(() => {
    if (pumpDetails) {
      console.log(`[SVGnode ID: ${id}] Updating from pumpDetails:`, pumpDetails);
      
      // Handle both boolean and string status from pumpDetails
      let newStatus = pumpDetails.status;
      if (typeof newStatus === 'boolean') {
        newStatus = newStatus ? "ON" : "OFF";
      }
      
      setStatus(newStatus); // Keep as "ON"/"OFF" string
      setIsPending(pumpDetails.pending || false);
    }
  }, [pumpDetails, id]);

  // Handle MQTT acknowledgment
  const handleAcknowledgment = useCallback(
    (ackData) => {
      console.log(`[SVGnode ID: ${id}] Received acknowledgment:`, ackData);
      
      if (ackData.product_id !== productId) return;

      const pumpUpdate = ackData.pumps.find((p) => p.pumpId === id);
      if (!pumpUpdate) return;

      // Handle both boolean and string status from acknowledgment
      let newStatus = pumpUpdate.status;
      if (typeof newStatus === 'boolean') {
        newStatus = newStatus ? "ON" : "OFF";
      } else if (newStatus === 1 || newStatus === "1") {
        newStatus = "ON";
      } else if (newStatus === 0 || newStatus === "0") {
        newStatus = "OFF";
      }
      
      console.log(`[SVGnode ID: ${id}] Pump update:`, pumpUpdate);
      console.log(`[SVGnode ID: ${id}] Converted status to:`, newStatus);

      setIsPending(false);
      setStatus(newStatus); // Set as string

      // Sync with backend
      axios
        .patch(`${API}/api/pump-states/${productId}/${id}`, {
          status: newStatus,
          pending: false,
        })
        .catch((err) => console.error("Failed to sync state:", err));

      if (onPumpToggle) {
        onPumpToggle(id, text, newStatus, false);
      }
    },
    [productId, id, text, onPumpToggle]
  );

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    console.log(`[SVGnode ID: ${id}] Setting up socket listeners`);
    socket.on("pumpAck", handleAcknowledgment);
    socket.on("pumpStateUpdate", handleAcknowledgment);

    return () => {
      socket.off("pumpAck", handleAcknowledgment);
      socket.off("pumpStateUpdate", handleAcknowledgment);
    };
  }, [socket, handleAcknowledgment]);

  // Initialize state from backend
  useEffect(() => {
    if (!isPump && !isAirblower) return;

    const fetchInitialState = async () => {
      try {
        const { data: state } = await axios.get(
          `${API}/api/pump-states/${productId}/${id}`
        );
        
        // Handle both boolean and string status from backend
        let initialStatus = state.status;
        if (typeof initialStatus === 'boolean') {
          initialStatus = initialStatus ? "ON" : "OFF";
        }
        
        setStatus(initialStatus); // Keep as string
        setIsPending(state.pending);
        if (onPumpToggle) {
          onPumpToggle(id, text, initialStatus, state.pending);
        }
      } catch (err) {
        console.error("Failed to fetch initial state:", err);
        setStatus(propStatus || "OFF");
      }
    };

    fetchInitialState();
  }, [id, isPump, isAirblower, productId, text, onPumpToggle, propStatus]);

  useEffect(() => {
    data.label = text;
  }, [text, data]);

  // Toggle device state
  const toggleDevice = async () => {
    if (!socketConnected || isPending) {
      alert("Cannot control device - offline or pending");
      return;
    }

    const newStatus = isOn ? "OFF" : "ON"; // Toggle between "ON" and "OFF" strings
    console.log(`[SVGnode ID: ${id}] Toggling device to:`, newStatus);

    setIsPending(true);
    if (onPumpToggle) {
      onPumpToggle(id, text, newStatus, true);
    }

    try {
      await axios.patch(`${API}/api/pump-states/${productId}/${id}`, {
        status: newStatus,
        pending: true,
      });

      socket.emit("controlPump", {
        product_id: productId,
        pumps: [
          {
            pumpId: id,
            pumpName: text,
            status: newStatus, // Send "ON" or "OFF" directly
            messageId: `cmd-${Date.now()}-${id}`,
          },
        ],
      });
    } catch (err) {
      console.error("Toggle failed:", err);
      setIsPending(false);
      if (onPumpToggle) {
        onPumpToggle(id, text, status, false); // Revert to current status
      }
    }
  };

  // Rotation handler
  const rotateHandler = () => {
    const next = (rotation + 45) % 360;
    setRotation(next);
    data.rotation = next;
  };

  // Resize handler
  const handleResize = (e, dir, el) => {
    const newSize = { width: el.offsetWidth, height: el.offsetHeight };
    setSize(newSize);
    data.width = newSize.width;
    data.height = newSize.height;
  };

  // Status text helper
  const statusText = () => {
    if (isPending) return "PENDING…";
    if (isOn) return isPump ? "RUNNING" : "ON";
    return isPump ? "STOPPED" : "OFF";
  };

  // Enhanced tooltip data formatter
  const formatTooltipData = () => {
    if (!pumpDetails) return null;

    return {
      name: pumpDetails.pumpName || text,
      current: Number(pumpDetails.current || 0).toFixed(3),
      vibration: Number(pumpDetails.vibration || 0).toFixed(3),
      temperature: Number(pumpDetails.temperature || 0).toFixed(2),
      voltage: Number(pumpDetails.voltage || 0).toFixed(2),
      fault: pumpDetails.fault || "N/A",
      acStatus: pumpDetails.acStatus || "N/A",
      lastUpdated: pumpDetails.lastUpdated ? new Date(pumpDetails.lastUpdated).toLocaleTimeString() : "N/A"
    };
  };

  // Pump/Airblower render with enhanced tooltip
  if (isPump || isAirblower) {
    const tooltipData = formatTooltipData();
    
    return (
      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{ position: 'relative' }}
      >
        <div
          style={{
            border: selected ? '2px solid #0074D9' : '1px solid #ddd',
            borderRadius: 6,
            padding: 2,
            backgroundColor: '#fff',
            minWidth: 80,
            cursor: 'move',
            position: 'relative',
            fontSize: '10px',
          }}
        >
          {/* Connection handles */}
          {['Top','Right','Bottom','Left'].map(pos => (
            <Handle
              id={pos.toLowerCase()}
              key={pos}
              type={pos==='Top'||pos==='Left'?'target':'source'}
              position={Position[pos]}
              style={{
                background: isParentEditing?'#D9DFC6':'transparent',
                width: 8,
                height: 8,
                borderRadius: '50%',
                zIndex: 9,
                position: 'absolute',
                [pos]: -10,
                pointerEvents: isParentEditing?'auto':'none',
                border: isParentEditing?'1px solid #ccc':'none',
              }}
            />
          ))}

          {/* Label */}
          <div style={{ marginBottom: 4 }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              readOnly={!isParentEditing}
              placeholder="Label..."
              style={{
                width: '100%',
                fontSize: '10px',
                fontWeight: 'bold',
                border: isParentEditing?'1px solid #ddd':'none',
                textAlign: 'center',
                outline: 'none',
                backgroundColor: 'transparent',
                borderRadius: 4,
                padding: isParentEditing?'2px':'0',
              }}
            />
          </div>

          {/* Status */}
          <div
            style={{
              color: isPending?'#FFA500':isOn?'#2ECC40':'#FF4136',
              fontSize: '10px',
              textAlign: 'center',
              marginBottom: 4,
            }}
          >
            {statusText()}
          </div>

          {/* Toggle switch */}
          <div
            onClick={toggleDevice}
            style={{
              position: 'relative',
              width: 40,
              height: 18,
              borderRadius: 9,
              cursor: socketConnected && !isPending ? 'pointer' : 'not-allowed',
              margin: '0 auto',
              backgroundColor: isPending?'#FFA500':isOn?'#2ECC40':'#FF4136',
              opacity: socketConnected?1:0.5,
              transition: 'all 0.3s ease',
            }}
            title={!socketConnected?'Offline':isPending?'Pending...':''}
          >
            <div
              style={{
                position: 'absolute',
                top: 1,
                left: 0,
                width: 14,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#fff',
                transform: isOn ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform 0.3s ease',
              }}
            />
          </div>

          {/* Rotate icon */}
          {isParentEditing && (
            <div
              style={{
                position: 'absolute',
                top: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                cursor: 'pointer',
              }}
              onClick={rotateHandler}
            >
              <FaSyncAlt size={14} />
            </div>
          )}
        </div>
        
        {/* Enhanced Tooltip */}
        {pumpDetails?.fault === 'YES' && (
          <div
            style={{
              color: 'red',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: '11px',
              marginTop: '4px',
            }}
          >
            High Vibration
          </div>
        )}
        
        {isHovering && (
          <div
            style={{
              position: "absolute",
              bottom: "105%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(40, 37, 37, 0.9)",
              color: "white",
              padding: "8px",
              borderRadius: "4px",
              zIndex: 1000,
              fontSize: "10px",
              width: "200px",
              textAlign: "left",
              pointerEvents: "none",
            }}
          >
            <div><strong>PUMP STATUS:</strong></div>
            <div>Status: {status} (Raw: {pumpDetails?.status})</div>
            <div>IsOn: {isOn ? 'YES' : 'NO'}</div>
            <div>Has pumpDetails: {pumpDetails ? 'YES' : 'NO'}</div>
            {pumpDetails && (
              <>
                <div>Current: {pumpDetails.current || 'N/A'}</div>
                <div>Vibration: {pumpDetails.vibration || 'N/A'}</div>
                <div>Temperature: {pumpDetails.temperature || 'N/A'}</div>
                <div>Voltage: {pumpDetails.voltage || 'N/A'}</div>
                <div>Fault: {pumpDetails.fault || 'N/A'}</div>
                <div>AC Status: {pumpDetails.acStatus || 'N/A'}</div>
                <div>Last Updated: {pumpDetails.lastUpdated || 'N/A'}</div>
              </>
            )}
            {!pumpDetails && (
              <div style={{color: 'yellow'}}>pumpDetails is null/undefined</div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Rest of your existing code for other node types (tanks, etc.)
  const nodeStyle = {
    position: "relative",
    overflow: isParentEditing ? "visible" : "hidden",
    zIndex: isResizing ? 100 : 1,
    border: selected ? "2px solid #0074D9" : "none",
    boxShadow: isResizing ? "0 0 10px rgba(0,0,0,0.3)" : "none",
    transform: `rotate(${rotation}deg)`,
    transition: "all 0.3s ease",
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    filter: isTank ? "none" : "drop-shadow(0 0 8px rgba(0,0,0,0.2))",
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
            zIndex: 9999,
            position: "absolute",
            [pos]: -12,
            pointerEvents: isParentEditing ? "auto" : "none",
            border: isParentEditing ? "1px solid #ccc" : "none",
          }}
        />
      ))}

      <Resizable
        size={size}
        onResize={handleResize}
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={() => setIsResizing(false)}
        minWidth={100}
        minHeight={100}
        maxWidth={300}
        maxHeight={300}
        enable={
          isParentEditing
            ? {
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                topLeft: true,
                bottomRight: true,
                bottomLeft: true,
              }
            : {}
        }
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <img src={svgPath} alt={text} style={imageStyle} />

          {isTank && waterLevel !== null && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: `${waterLevel}%`,
                backgroundColor:
                  waterLevel > 90
                    ? "rgba(255, 0, 0, 0.5)"
                    : "rgba(0, 123, 255, 0.4)",
                transition: "height 0.5s ease-in-out",
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
                zIndex: 2,
              }}
            />
          )}
        </div>
      </Resizable>

      {/* Label and controls */}
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
          readOnly={!isParentEditing}
          placeholder={isTank ? "Tank Name" : "Label"}
          style={{
            width: "100%",
            fontSize: "12px",
            border: isParentEditing ? "1px solid #ddd" : "none",
            textAlign: "center",
            outline: "none",
            backgroundColor: "transparent",
            borderRadius: 4,
            padding: isParentEditing ? "4px" : 0,
          }}
        />

        {isTank && (
          <>
            <input
              type="number"
              value={totalDepth}
              onChange={(e) => setTotalDepth(e.target.value)}
              readOnly={!isParentEditing}
              placeholder="Total Depth"
              style={{
                width: "100%",
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
            <div style={{ marginTop: 4 }}>
              {waterLevel != null ? `Water level: ${waterLevel}%` : "N/A"}
            </div>
          </>
        )}
      </div>

      {/* Rotate button in edit mode */}
      {isParentEditing && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            cursor: "pointer",
          }}
          onClick={rotateHandler}
        >
          <FaSyncAlt size={18} />
        </div>
      )}
    </div>
  );
};

export default SVGnode;