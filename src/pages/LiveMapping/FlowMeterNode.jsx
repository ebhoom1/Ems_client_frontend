// FlowMeterNode.jsx
import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';

export default function FlowMeterNode({ data, flowValues, selected }) {
  const { isEditing } = data;

  // local label state
  const [label, setLabel] = useState(data.label);
  // push edits back into React-Flow
  useEffect(() => { data.label = label }, [label]);

  // derive live value from the latest map
  const liveValue = flowValues[label] ?? '--';

  return (
    <div style={{
      border: selected ? '2px solid #0074D9' : '1px solid #ccc',
      borderRadius: 6, padding: 8, background: '#fff', minWidth: 120, textAlign: 'center'
    }}>
      <Handle type="target" position={Position.Top} />

      <input
        value={label}
        onChange={e => setLabel(e.target.value)}
        readOnly={!isEditing}
        placeholder="Flowmeter name"
        style={{
          width: '100%', fontSize: 14,
          border: isEditing ? '1px solid #ddd' : 'none',
          background: 'transparent', textAlign: 'center'
        }}
      />

      <div style={{
        marginTop: 6, padding: '4px 8px',
        border: '1px solid #aaa', borderRadius: 4,
        background: '#f7f7f7', fontSize: 16, fontWeight: 'bold'
      }}>
        {liveValue}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
