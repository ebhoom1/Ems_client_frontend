import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Resizable } from "re-resizable";
import { FaSyncAlt } from "react-icons/fa";
import { Handle, Position } from "react-flow-renderer";
import "./livemapping.css";

const API = "https://api.ocems.ebhoom.com";

const SVGnode = ({ id, data, selected, liveTankData }) => {
  const {
    socket,
    socketConnected,
    pumpStatus: propStatus = false,
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
  } = data;

  const productId = "27";

  // Local state
  const [isOn, setIsOn] = useState(propStatus);
  const [isPending, setIsPending] = useState(propPending);
  const [text, setText] = useState(initialLabel);
  const [size, setSize] = useState({ width: initW, height: initH });
  const [rotation, setRotation] = useState(initialRotation);
  const [isResizing, setIsResizing] = useState(false);
  const [totalDepth, setTotalDepth] = useState(data.totalDepth || "");

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

  // Handle acknowledgment from MQTT
  const handleAcknowledgment = useCallback(
    (ackData) => {
      if (ackData.product_id !== productId) return;

      const pumpUpdate = ackData.pumps.find((p) => p.pumpId === id);
      if (!pumpUpdate) return;

      const newStatus = pumpUpdate.status === 1 || pumpUpdate.status === "ON";

      setIsPending(false);
      setIsOn(newStatus);

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
        setIsOn(state.status);
        setIsPending(state.pending);
        if (onPumpToggle) {
          onPumpToggle(id, text, state.status, state.pending);
        }
      } catch (err) {
        console.error("Failed to fetch initial state:", err);
        setIsOn(propStatus || false);
      }
    };

    fetchInitialState();
  }, [id, isPump, isAirblower, productId, text, onPumpToggle, propStatus]);

  useEffect(() => {
    setIsOn(propStatus);
  }, [propStatus]);

  useEffect(() => {
    setIsPending(propPending);
  }, [propPending]);

  useEffect(() => {
    data.label = text;
  }, [text, data]);

  // Toggle device state
  const toggleDevice = async () => {
    if (!socketConnected || isPending) {
      alert("Cannot control device - offline or pending");
      return;
    }

    const newStatus = !isOn;

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
            status: newStatus ? "ON" : "OFF",
            messageId: `cmd-${Date.now()}-${id}`,
          },
        ],
      });
    } catch (err) {
      console.error("Toggle failed:", err);
      setIsPending(false);
      if (onPumpToggle) {
        onPumpToggle(id, text, isOn, false);
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

  // Simplified pump/airblower render
  if (isPump || isAirblower) {
    return (
      <div
        style={{
          border: selected ? "2px solid #0074D9" : "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          backgroundColor: "#fff",
          minWidth: 150,
          cursor: "move",
          position: "relative",
        }}
      >
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

        {/* Label - always visible and editable in edit mode */}
        <div style={{ marginBottom: 8 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            readOnly={!isParentEditing}
            placeholder="Label..."
            style={{
              width: "100%",
              fontSize: "14px",
              fontWeight: "bold",
              border: isParentEditing ? "1px solid #ddd" : "none",
              textAlign: "center",
              outline: "none",
              backgroundColor: "transparent",
              borderRadius: 4,
              padding: isParentEditing ? "4px" : 0,
            }}
          />
        </div>

        {/* Status indicator - always visible */}
        <div
          style={{
            color: isPending ? "#FFA500" : isOn ? "#2ECC40" : "#FF4136",
            fontSize: "12px",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {statusText()}
        </div>

        {/* Toggle switch - always visible */}
        <div
          style={{
            position: "relative",
            width: 60,
            height: 30,
            borderRadius: 15,
            display: "flex",
            alignItems: "center",
            padding: 2,
            cursor: socketConnected && !isPending ? "pointer" : "not-allowed",
            margin: "0 auto",
            backgroundColor: isPending ? "#FFA500" : isOn ? "#2ECC40" : "#FF4136",
            opacity: socketConnected ? 1 : 0.5,
            transition: "all 0.3s ease",
          }}
          onClick={toggleDevice}
          title={!socketConnected ? "Offline" : isPending ? "Pending..." : ""}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              backgroundColor: "#fff",
              transform: isOn ? "translateX(30px)" : "translateX(0)",
              transition: "transform 0.3s ease",
            }}
          />
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
  }

  // Existing render for other node types (tanks, etc.)
  const nodeStyle = {
    position: "relative",
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
                bottomRight: true,
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

      {/* Label and controls - always visible */}
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