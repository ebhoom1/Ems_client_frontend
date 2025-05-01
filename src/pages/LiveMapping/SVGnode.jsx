

import React, { useState, useEffect } from 'react';
import { Resizable } from 're-resizable';
import { FaSyncAlt, FaTrashAlt } from 'react-icons/fa';
//new
import { Handle, Position } from 'react-flow-renderer';


const SVGNode = ({ data, selected, onDelete }) => {
//new
const [text, setText] = useState(data.label || '');


  const [size, setSize] = useState({ width: 100, height: 100 });
  const [isResizing, setIsResizing] = useState(false);
  const [isPumpOn, setIsPumpOn] = useState(false);
  const [rotation, setRotation] = useState(data.rotation || 0);  // Store rotation
  const [isEditing, setIsEditing] = useState(false);  // Define isEditing state
  const [hovered, setHovered] = useState(false);

  const handleResize = (e, direction, ref, delta) => {
    setSize({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
  };

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResizeStop = () => {
    setIsResizing(false);
  };

  const togglePump = () => {
    setIsPumpOn(!isPumpOn);
  };

  const handleRotation = () => {
    const newRotation = (rotation + 45) % 360;
    setRotation(newRotation);
    // Save the rotation as part of the data
    data.rotation = newRotation;
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);  // Toggle the editing state
  };

  const getResizeConstraints = () => {
    const screenWidth = window.innerWidth;

    if (screenWidth <= 768) {
      return { minWidth: 50, minHeight: 50, maxWidth: 150, maxHeight: 150 };
    } else if (screenWidth <= 1024) {
      return { minWidth: 75, minHeight: 75, maxWidth: 250, maxHeight: 250 };
    } else {
      return { minWidth: 100, minHeight: 100, maxWidth: 300, maxHeight: 300 };
    }
  };

  const { minWidth, minHeight, maxWidth, maxHeight } = getResizeConstraints();

  const commonHandleStyle = {
    background: '#D9DFC6',
    width: 10,
    height: 10,
    borderRadius: '50%',
    zIndex: 9999,
    cursor: 'crosshair',
    position: 'absolute', // ensure all handles are floated outside
  };

  //new
   // Update text in node data
  useEffect(() => {
    data.label = text;
  }, [text]);

  return (
    <div
      onDoubleClick={toggleEditing}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        zIndex: isResizing ? 100 : 1,
        border: selected ? '2px solid blue' : 'none',
        boxShadow: isResizing ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
        transform: `rotate(${rotation}deg)`, // Apply rotation
        transition: 'transform 0.3s ease',
      }}
    >
      {/**new */}
     {/* Handles for all directions */}
     <Handle
  id="right"
  type="source"
  position={Position.Right}
  style={{
    background: data.isEditing ? '#D9DFC6' : 'transparent',
    width: 10,
    height: 10,
    borderRadius: '50%',
    zIndex: 9999,
    cursor: 'crosshair',
    position: 'absolute',
    right: -12,
    pointerEvents: data.isEditing ? 'auto' : 'none',
    border: data.isEditing ? '1px solid #ccc' : 'none',
  }}
/>
    
<Handle
  id="bottom"
  type="source"
  position={Position.Bottom}
  style={{
    background: data.isEditing ? '#D9DFC6' : 'transparent',
    width: 10,
    height: 10,
    borderRadius: '50%',
    zIndex: 9999,
    cursor: 'crosshair',
    position: 'absolute',
    right: -12,
    pointerEvents: data.isEditing ? 'auto' : 'none',
    border: data.isEditing ? '1px solid #ccc' : 'none',
  }}/>

<Handle
  id="top"
  type="target"
  position={Position.Top}
  style={{
    background: data.isEditing ? '#D9DFC6' : 'transparent',
    width: 10,
    height: 10,
    borderRadius: '50%',
    zIndex: 9999,
    cursor: 'crosshair',
    position: 'absolute',
    right: -12,
    pointerEvents: data.isEditing ? 'auto' : 'none',
    border: data.isEditing ? '1px solid #ccc' : 'none',
  }}/>

<Handle
  id="left"
  type="target"
  position={Position.Left}
  style={{
    background: data.isEditing ? '#D9DFC6' : 'transparent',
    width: 10,
    height: 10,
    borderRadius: '50%',
    zIndex: 9999,
    cursor: 'crosshair',
    position: 'absolute',
    right: -12,
    pointerEvents: data.isEditing ? 'auto' : 'none',
    border: data.isEditing ? '1px solid #ccc' : 'none',
  }}/>


      {/**new */}

      <Resizable
        size={size}
        onResize={handleResize}
        onResizeStart={handleResizeStart}
        onResizeStop={handleResizeStop}
        minWidth={minWidth}
        minHeight={minHeight}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        enable={isEditing ? { top: true, right: true, bottom: true, left: true, bottomRight: true } : {}}
      >
        <img
          src={data.svgPath}
          alt={data.label}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Resizable>
     
{/**new */}
 {/* Label input */}
 {/* Label and future values container */}
{/* Label and future values container */}
{((data.isEditing&&selected )|| hovered) && (
  <div
    style={{
      width: '100%',
      marginTop: 6,
      fontSize: '12px',
      border: '1px solid #ccc',
      borderRadius: 4,
      padding: 4,
      backgroundColor: '#f9f9f9',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}
  >
    {/* Label input */}
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Label..."
      style={{
        width: '100%',
        fontSize: '12px',
        border: 'none',
        backgroundColor: 'transparent',
        textAlign: 'center',
      }}
      readOnly={!data.isEditing} // 🔥 Only editable in edit mode
    />

    {/* Placeholder for second value */}
    <div style={{ color: '#555' }}>
      <small>N/A</small>
    </div>

    {/* Placeholder for third value */}
    <div style={{ color: '#888' }}>
      <small>N/A</small>
    </div>
  </div>
)}


{/**new */}
      {/* Show toggle switch only for the "Pump" node */}
      {data.label === 'Pump' && (
        <div
          className="toggle-switch"
          onClick={togglePump}
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            width: '50px',
            height: '25px',
            borderRadius: '25px',
            backgroundColor: isPumpOn ? '#4caf50' : '#ff0000',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
            transition: 'background-color 0.3s ease',
          }}
        >
          <div
            style={{
              width: '23px',
              height: '23px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              transition: 'transform 0.3s ease',
              transform: isPumpOn ? 'translateX(25px)' : 'translateX(0)',
            }}
          />
        </div>
      )}

      {isEditing && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <FaSyncAlt
            onClick={handleRotation}
            style={{ cursor: 'pointer', marginTop: '10px' }}
            size={20}
          />
        </div>
      )}
    </div>
  );
};

export default SVGNode;
