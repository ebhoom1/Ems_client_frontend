// PumpNode.jsx
import React from 'react';
import { Handle, Position } from 'react-flow-renderer';

export default function PumpNode({ data, selected }) {
  return (
    <div
      style={{
        padding: 4,
        background: '#fff',
        /* border: selected ? '2px solid #0074D9' : '1px solid #ccc', */
        borderRadius: 4,
        textAlign: 'center',
        width: 70,
        fontSize: 10,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555', width: 6, height: 6, top: -3 }}
      />

      <div style={{ margin: '4px 0', fontWeight: 'bold', fontSize: 10 }}>
        {data.label}
      </div>

      {/* compact toggle */}
      <div
        onClick={() =>
          data.onPumpToggle(data.id, data.label, !data.pumpStatus, false)
        }
        style={{
          width: 28,
          height: 14,
          background: data.pumpStatus ? '#2ECC40' : '#FF4136',
          borderRadius: 7,
          cursor: 'pointer',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            background: '#fff',
            borderRadius: '50%',
            position: 'absolute',
            top: 1,
            left: data.pumpStatus ? 14 : 1,
            transition: 'left 0.2s',
          }}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555', width: 6, height: 6, bottom: -3 }}
      />
    </div>
  );
}
