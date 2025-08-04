import React from 'react';
import { Handle, Position } from 'reactflow';

function ImageNode({ data }) {
  return (
    <div style={{ border: '2px solid #ddd', borderRadius: '5px', padding: '5px', background: '#fff' }}>
      <Handle type="target" position={Position.Top} />
      <img src={data.filePath} alt={data.name} style={{ maxWidth: '200px', display: 'block' }} />
      <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '5px', fontWeight: 'bold' }}>
        {data.name}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default ImageNode;