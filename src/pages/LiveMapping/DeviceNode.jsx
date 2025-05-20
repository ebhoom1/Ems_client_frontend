import React from "react";
import { Handle, Position } from "react-flow-renderer";
import { FaSyncAlt } from "react-icons/fa";

export default function DeviceNode({ id, data, selected }) {
  const {
    label = "",
    isEditing,
    pumpStatus = false,
    isPending = false,
    onPumpToggle,
    socketConnected,
    isPump = false,
    isAirblower = false,
    rotation = 0
  } = data;

  // Status text based on device type
  const statusText = () => {
    if (isPending) return "PENDING…";
    if (isPump) return pumpStatus ? "RUNNING" : "STOPPED";
    if (isAirblower) return pumpStatus ? "ON" : "OFF";
    return "";
  };

  // Color based on status
  const statusColor = isPending 
    ? "#FFA500" 
    : pumpStatus 
      ? "#2ECC40" 
      : "#FF4136";

  return (
    <div
      style={{
        padding: 8,
        background: "#fff",
        border: selected ? "2px solid #0074D9" : "1px solid #ccc",
        borderRadius: 6,
        textAlign: "center",
        minWidth: 100,
        position: "relative",
        transform: `rotate(${rotation}deg)`,
        transition: "all 0.3s ease",
      }}
    >
      {/* Connection handles */}
      {['Top', 'Right', 'Bottom', 'Left'].map(pos => (
        <Handle
          id={pos.toLowerCase()}
          key={pos}
          type={pos === 'Top' || pos === 'Left' ? 'target' : 'source'}
          position={Position[pos]}
          style={{
            background: isEditing ? '#D9DFC6' : 'transparent',
            width: 8,
            height: 8,
            borderRadius: '50%',
            zIndex: 9,
            position: 'absolute',
            [pos]: -10,
            pointerEvents: isEditing ? 'auto' : 'none',
            border: isEditing ? '1px solid #ccc' : 'none',
          }}
        />
      ))}

      {/* Label */}
      <div style={{ marginBottom: 4 }}>
        <input
          value={label}
          onChange={e => data.onLabelChange(id, e.target.value)}
          readOnly={!isEditing}
          placeholder="Label..."
          style={{
            width: '100%',
            fontSize: '12px',
            fontWeight: 'bold',
            border: isEditing ? '1px solid #ddd' : 'none',
            textAlign: 'center',
            outline: 'none',
            backgroundColor: 'transparent',
            borderRadius: 4,
            padding: isEditing ? '4px' : '0',
          }}
        />
      </div>

      {/* Status */}
      <div
        style={{
          color: statusColor,
          fontSize: '10px',
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        {statusText()}
      </div>

      {/* Toggle switch - only for pump or airblower */}
      {(isPump || isAirblower) && (
        <div
          onClick={() => {
            if (socketConnected && !isPending) {
              onPumpToggle(id, label, !pumpStatus, true);
            }
          }}
          style={{
            position: 'relative',
            width: 40,
            height: 18,
            borderRadius: 9,
            cursor: socketConnected && !isPending ? 'pointer' : 'not-allowed',
            margin: '0 auto',
            backgroundColor: statusColor,
            opacity: socketConnected ? 1 : 0.5,
            transition: 'all 0.3s ease',
          }}
          title={!socketConnected ? 'Offline' : isPending ? 'Pending...' : ''}
        >
          <div
            style={{
              position: 'absolute',
              top: 1,
              left: 0,
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: '#fff',
              transform: pumpStatus ? 'translateX(22px)' : 'translateX(0)',
              transition: 'transform 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Rotate icon (only in edit mode) */}
      {isEditing && (
        <div
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            cursor: 'pointer',
          }}
          onClick={() => {
            const newRotation = (rotation + 45) % 360;
            data.onRotate(id, newRotation);
          }}
        >
          <FaSyncAlt size={14} />
        </div>
      )}
    </div>
  );
}