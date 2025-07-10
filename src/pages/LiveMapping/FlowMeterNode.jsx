import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';

export default function FlowMeterNode({ data, selected }) {
  const { isEditing,flowValue = '--' } = data;

  // keep a local copy of label so React re-renders on change
  const [label, setLabel] = useState(data.label || '');
  useEffect(() => {
    data.label = label;
  }, [label, data]);

  return (
    <div
      style={{
        width: 80,
        height: 40,
/*         border: selected ? '2px solid #0074D9' : '1px solid #ccc',
 */        borderRadius: 6,
        background: '#fff',
        textAlign: 'center',
        padding: '2px',
        boxSizing: 'border-box',
        fontSize: 8,
        color: 'green',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* top connection */}
      <Handle type="target" position={Position.Top} style={{ top: 0, background: '#555' }} />

      {/* editable label */}
      {isEditing ? (
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Name"
          style={{
            width: '100%',
            fontSize: 8,
          
            borderRadius: 4,
            padding: '1px',
            boxSizing: 'border-box',
            textAlign: 'center',
            color:'green'
          }}
        />
      ) : (
        <div style={{ lineHeight: 1, fontWeight: 'bold', fontSize: 8 }}>
          {label}
        </div>
      )}

      {/* value */}
      <div
        style={{
          lineHeight: 1,
          border: '1px solid #aaa',
          borderRadius: 4,
          background: '#f7f7f7',
          fontSize: 10,
          padding: '1px 2px',
        }}
      >
        {flowValue}
      </div>

      {/* bottom connection */}
      <Handle type="source" position={Position.Bottom} style={{ bottom: 0, background: '#555' }} />
    </div>
  );
}
