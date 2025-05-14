// PumpNode.jsx
import React from 'react';
import { Handle, Position } from 'react-flow-renderer';

export default function PumpNode({ data, selected }) {
  return (
    <div
      style={{
        padding: 8,
        background: '#fff',
        border: selected ? '2px solid #0074D9' : '1px solid #ccc',
        borderRadius: 4,
        textAlign: 'center',
      }}
    >
      <Handle
        type="target" position={Position.Top}
        style={{ background: '#555' }}
      />
      <div style={{ margin: '8px 0', fontWeight: 'bold' }}>
        {data.label}
      </div>
      {/* reuse your existing toggle UI */}
      <div
        onClick={() => data.onPumpToggle(data.id, data.label, !data.pumpStatus, false)}
        style={{
          width: 40,
          height: 20,
          background: data.pumpStatus ? '#2ECC40' : '#FF4136',
          borderRadius: 10,
          cursor: 'pointer',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            background: '#fff',
            borderRadius: '50%',
            position: 'absolute',
            top: 1,
            left: data.pumpStatus ? 20 : 1,
            transition: 'left 0.2s',
          }}
        />
      </div>
      <Handle
        type="source" position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
}
