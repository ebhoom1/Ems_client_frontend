// TankNode.jsx
import React, { useState, useEffect } from "react";
import { Handle, Position } from "react-flow-renderer";

export default function TankNode({ data, liveTankData }) {
  const { isEditing, label } = data;
  const [tankName, setTankName] = useState(data.tankName || label || "");
  const [totalDepth, setTotalDepth] = useState(data.totalDepth || "");

  // Find matching tank data
  const tankMatch = liveTankData?.find(
    t => t.tankName?.trim().toLowerCase() === tankName.trim().toLowerCase()
  );
  const currentDepth = tankMatch?.depth || 0;

  // Ensure numeric calculations
  const depthValue = Number(totalDepth) || 0;
  const percentFull = depthValue > 0
    ? Math.min(100, Math.round((currentDepth / depthValue) * 100))
    : 0;

  // Debug log
  useEffect(() => {
    if (tankMatch) {
      console.log('💧 Tank Data Update:', { tankName, currentDepth, totalDepth, percentFull });
    }
  }, [tankMatch, currentDepth, totalDepth, percentFull, tankName]);

  // Persist node data
  useEffect(() => {
    data.tankName = tankName;
    data.totalDepth = totalDepth;
    data.currentDepth = currentDepth;
    data.percentFull = percentFull;
  }, [tankName, totalDepth, currentDepth, percentFull, data]);

  return (
    <div style={{
      width: 80,
      padding: 4,
      background: 'transparent',
      borderRadius: 4,
      border: '1px solid #ddd',
      textAlign: 'center',
      fontSize: '12px'
    }}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: 2 }}>
        {isEditing ? (
          <input
            value={tankName}
            onChange={e => setTankName(e.target.value)}
            placeholder="Tank Name"
            style={{
              width: '100%',
              fontSize: '12px',
              background: 'transparent',
              border: 'none',
              textAlign: 'center'
            }}
          />
        ) : (
          tankName || "Unnamed"
        )}
      </div>

      <div style={{ margin: '2px 0', fontSize: '12px', fontWeight: 'bold', color: '#34a853' }}>
        {percentFull}%
      </div>

      {isEditing && (
        <input
          type="number"
          value={totalDepth}
          onChange={e => setTotalDepth(e.target.value)}
          placeholder="Depth"
          style={{
            width: '100%',
            fontSize: '12px',
            background: 'transparent',
            border: 'none',
            textAlign: 'center'
          }}
        />
      )}

      <div style={{
        height: 6,
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        marginTop: 6,
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${percentFull}%`,
          backgroundColor:
            percentFull > 90 ? '#ff4444' :
            percentFull > 70 ? '#4285F4' :
            '#34a853',
          transition: 'width 0.5s ease'
        }} />
      </div>
    </div>
  );
}