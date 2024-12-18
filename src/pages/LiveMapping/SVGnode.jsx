import React, { useState, useEffect } from 'react';
import { Resizable } from 're-resizable';
import { FaSyncAlt, FaTrashAlt } from 'react-icons/fa';

const SVGNode = ({ data, selected, onDelete }) => {
  const [size, setSize] = useState({ width: 100, height: 100 });
  const [isResizing, setIsResizing] = useState(false);
  const [isPumpOn, setIsPumpOn] = useState(false);
  const [rotation, setRotation] = useState(data.rotation || 0);  // Store rotation
  const [isEditing, setIsEditing] = useState(false);  // Define isEditing state

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

  return (
    <div
      onDoubleClick={toggleEditing}
      style={{
        position: 'relative',
        zIndex: isResizing ? 100 : 1,
        border: selected ? '2px solid blue' : 'none',
        boxShadow: isResizing ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
        transform: `rotate(${rotation}deg)`, // Apply rotation
        transition: 'transform 0.3s ease',
      }}
    >
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
