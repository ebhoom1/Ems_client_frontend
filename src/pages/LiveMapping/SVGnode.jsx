import React, { useState, useEffect } from 'react';
import { Resizable } from 're-resizable';
import { FaSyncAlt, FaTrashAlt } from 'react-icons/fa'; // Import rotate and delete icons

const SVGNode = ({ data, selected, onDelete }) => {
  const [size, setSize] = useState({ width: 100, height: 100 });
  const [isResizing, setIsResizing] = useState(false);
  const [backendValue, setBackendValue] = useState('');
  const [isPumpOn, setIsPumpOn] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State to track editing mode
  const [rotation, setRotation] = useState(0); // State to track rotation angle

  useEffect(() => {
    if (data.backendValue) {
      setBackendValue(data.backendValue); // Set the value from backend if it's available
    }
  }, [data.backendValue]);

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
    setIsPumpOn(!isPumpOn); // Toggle pump status
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing); // Toggle editing mode on double-click
  };

  // Rotate by 45 degrees every click
  const handleRotation = () => {
    setRotation((prevRotation) => (prevRotation + 45) % 360); // Rotate by 45 degrees
  };

  // Function to determine resize constraints based on screen size
  const getResizeConstraints = () => {
    const screenWidth = window.innerWidth;

    if (screenWidth <= 768) { // Mobile view
      return { minWidth: 50, minHeight: 50, maxWidth: 150, maxHeight: 150 };
    } else if (screenWidth <= 1024) { // Tablet view
      return { minWidth: 75, minHeight: 75, maxWidth: 250, maxHeight: 250 };
    } else { // Desktop view
      return { minWidth: 100, minHeight: 100, maxWidth: 300, maxHeight: 300 };
    }
  };

  const { minWidth, minHeight, maxWidth, maxHeight } = getResizeConstraints();

  return (
    <div
      onDoubleClick={toggleEditing} // Enable editing on double-click
      style={{
        position: 'relative',
        zIndex: isResizing ? 100 : 1,
        border: selected ? '2px solid blue' : 'none',
        boxShadow: isResizing ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
        transform: `rotate(${rotation}deg)`, // Apply rotation based on state
        transition: 'transform 0.3s ease', // Smooth transition for rotation
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

      {/* Toggle switch for Pump */}
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

      {/* Conditionally render input box for Flowmeter, Energymeter, and Meter */}
      {['Energymeter', 'Meter', 'Tank'].includes(data.label) && (
        <input
          type="text"
          value={backendValue}
          readOnly
          style={{
            position: 'absolute',
            bottom: '-1px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            textAlign: 'center',
          }}
        />
      )}

      {/* Show rotation and delete icons when editing */}
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
          {/* Rotate Icon */}
          <FaSyncAlt
            onClick={handleRotation} // Rotate the element
            style={{ cursor: 'pointer', marginTop: '10px' }}
            size={20}
          />
        </div>
      )}
    </div>
  );
};

export default SVGNode;
