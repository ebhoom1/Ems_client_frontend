import React, { useState } from 'react';
import { Resizable } from 're-resizable';
import { Handle, Position } from 'react-flow-renderer';

export default function PDFNode({ id, data, selected }) {
  const [dimensions, setDimensions] = useState({
    width: data.width || 900,
    height: data.height || 900,
  });

  // Fit PDF to container width, hide UI
  const pdfUrl = `${data.filePath}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-width`;

  const handleResize = (e, direction, ref) => {
    const newDimensions = {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    };
    setDimensions(newDimensions);

    // Persist dimensions on node
    data.width = newDimensions.width;
    data.height = newDimensions.height;
  };

  return (
    <div
      style={{
        border: selected ? '2px solid #0074D9' : 'none',
        width: '100%',
        height: '100%',
      }}
    >
      {/* Connection handles */}
      {['Top', 'Right', 'Bottom', 'Left'].map((pos) => (
        <Handle
          id={pos.toLowerCase()}
          key={pos}
          type={pos === 'Top' || pos === 'Left' ? 'target' : 'source'}
          position={Position[pos]}
          style={{
            background: data.isEditing ? '#D9DFC6' : 'transparent',
            width: 10,
            height: 10,
            borderRadius: '50%',
            zIndex: 9999,
            position: 'absolute',
            [pos]: -12,
            pointerEvents: data.isEditing ? 'auto' : 'none',
            border: data.isEditing ? '1px solid #ccc' : 'none',
          }}
        />
      ))}

      <Resizable
        size={dimensions}
        onResizeStop={handleResize}
        enable={data.isEditing ? {
          top: true, right: true, bottom: true, left: true,
          topRight: true, bottomRight: true,
          bottomLeft: true, topLeft: true,
        } : {}}
        minWidth={300}
        minHeight={200}
        maxWidth={1200}
        maxHeight={900}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#fff', // ensure white behind PDF
          }}
        >
          <iframe
            src={pdfUrl}
            width="80%"
            height="100%"
            style={{
              border: 'none',
              backgroundColor: '#fff',
             /*  pointerEvents: 'none', */
            }}
            title={`pdf-node-${id}`}
          />
        </div>
      </Resizable>

      {/* Label editing */}
      {data.isEditing && selected && (
        <div
          style={{
            width: '100%',
            marginTop: 6,
            fontSize: '12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            padding: 4,
            backgroundColor: '#f9f9f9',
            textAlign: 'center',
          }}
        >
          <input
            value={data.label || ''}
            onChange={(e) => (data.label = e.target.value)}
            placeholder="Label..."
            style={{
              width: '100%',
              fontSize: '12px',
              border: 'none',
              textAlign: 'center',
              outline: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}