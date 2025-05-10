import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Resizable } from 're-resizable';
import { FaSyncAlt } from 'react-icons/fa';
import { Handle, Position } from 'react-flow-renderer';
import './livemapping.css';

const API = 'https://api.ocems.ebhoom.com';

const SVGnode = ({ id, data, selected }) => {
  const {
    socket,
    socketConnected,
    pumpStatus: propStatus = false,
    isPending: propPending = false,

    svgPath,
    label: initialLabel = '',
    rotation: initialRotation = 0,
    isPump = false,
    isAirblower = false,
    isEditing = false,
    width: initW = 100,
    height: initH = 100,
    onPumpToggle
  } = data;

  const productId = '27';

  // Local state
  const [isOn, setIsOn] = useState(propStatus);
  const [isPending, setIsPending] = useState(propPending);
  const [text, setText] = useState(initialLabel);
  const [size, setSize] = useState({ width: initW, height: initH });
  const [rotation, setRotation] = useState(initialRotation);
  const [hovered, setHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Handle acknowledgment from MQTT
  const handleAcknowledgment = useCallback((ackData) => {
    console.log('🏓 ACK callback got:', ackData);
    if (ackData.product_id !== productId) return;

    const pumpUpdate = ackData.pumps.find(p => p.pumpId === id);
    if (!pumpUpdate) return;

    const newStatus = pumpUpdate.status === 1 || pumpUpdate.status === 'ON';
    
    // Update local state
    setIsPending(false);
    setIsOn(newStatus);

    // Update backend state
    axios.patch(`${API}/api/pump-states/${productId}/${id}`, {
      status: newStatus,
      pending: false
    }).catch(err => console.error('Failed to sync state:', err));

    // Notify parent component
    if (onPumpToggle) {
      onPumpToggle(id, text, newStatus, false);
    }
  }, [productId, id, text, onPumpToggle]);

  // Setup socket listeners
  // In SVGnode.jsx
  useEffect(() => {
    if (!socket) return;
  
    socket.on('pumpAck', handleAcknowledgment);
    socket.on('pumpStateUpdate', handleAcknowledgment);
  
    return () => {
      socket.off('pumpAck', handleAcknowledgment);
      socket.off('pumpStateUpdate', handleAcknowledgment);
    };
  }, [socket, handleAcknowledgment]);
  

  // Initialize state from backend
  useEffect(() => {
    if (!isPump && !isAirblower) return;

    const fetchInitialState = async () => {
      try {
        const { data: state } = await axios.get(`${API}/api/pump-states/${productId}/${id}`);
        setIsOn(state.status);
        setIsPending(state.pending);
        // Update parent with initial state
        if (onPumpToggle) {
          onPumpToggle(id, text, state.status, state.pending);
        }
      } catch (err) {
        console.error('Failed to fetch initial state:', err);
        setIsOn(propStatus || false);
      }
    };

    fetchInitialState();
  }, [id, isPump, isAirblower, productId, text, onPumpToggle, propStatus]);
  useEffect(() => {
    setIsOn(propStatus);
  }, [propStatus]);
  
  useEffect(() => {
    setIsPending(propPending);
  }, [propPending]);
  
  // Keep label in sync
  useEffect(() => {
    data.label = text;
  }, [text, data]);

  // Toggle device state
  const toggleDevice = async () => {
    if (!socketConnected || isPending) {
      alert('Cannot control device - offline or pending');
      return;
    }

    const newStatus = !isOn;
    
    // Optimistic UI update
    setIsPending(true);
    if (onPumpToggle) {
      onPumpToggle(id, text, newStatus, true);
    }

    try {
      // Update backend pending state
      await axios.patch(`${API}/api/pump-states/${productId}/${id}`, {
        status: newStatus,
        pending: true
      });

      // Send control command
      socket.emit('controlPump', {
        product_id: productId,
        pumps: [{
          pumpId: id,
          pumpName: text,
          status: newStatus ? 'ON' : 'OFF',
          messageId: `cmd-${Date.now()}-${id}`
        }]
      });
    } catch (err) {
      console.error('Toggle failed:', err);
      // Revert on error
      setIsPending(false);
      if (onPumpToggle) {
        onPumpToggle(id, text, isOn, false);
      }
    }
  };
  useEffect(() => {
    console.log(`Pump ${id} state updated:`, {
      status: isOn,
      pending: isPending,
      timestamp: new Date().toISOString()
    });
  }, [isOn, isPending, id]);
  // Rotation handler
  const rotateHandler = () => {
    const next = (rotation + 45) % 360;
    setRotation(next);
    data.rotation = next;
  };

  // Resize handler
  const handleResize = (e, dir, el) => {
    const newSize = { width: el.offsetWidth, height: el.offsetHeight };
    setSize(newSize);
    data.width = newSize.width;
    data.height = newSize.height;
  };

  // Status text helper
  const statusText = () => {
    if (isPending) return 'PENDING…';
    if (isOn) return isPump ? 'RUNNING' : 'ON';
    return isPump ? 'STOPPED' : 'OFF';
  };

  // Responsive min/max
  let minW = 100, minH = 100, maxW = 300, maxH = 300;
  const w = window.innerWidth;
  if (w <= 768) [minW, minH, maxW, maxH] = [50,50,150,150];
  else if (w <= 1024) [minW, minH, maxW, maxH] = [75,75,250,250];

  // Styles
  const nodeStyle = {
    position: 'relative',
    zIndex: isResizing ? 100 : 1,
    border: selected ? '2px solid #0074D9' : 'none',
    boxShadow: isResizing ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
    transform: `rotate(${rotation}deg)`,
    transition: 'all 0.3s ease',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: (isPump || isAirblower)
      ? (isPending
          ? 'drop-shadow(0 0 8px rgba(255,165,0,0.7))'
          : (isOn
              ? 'drop-shadow(0 0 8px rgba(0,255,0,0.7))'
              : 'drop-shadow(0 0 8px rgba(255,0,0,0.5))'))
      : 'none',
    transition: 'all 0.3s ease',
  };

  const toggleStyle = {
    position: 'absolute',
    bottom: isEditing ? 50 : 10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 50,
    height: 25,
    borderRadius: 25,
    display: 'flex',
    alignItems: 'center',
    padding: 2,
    cursor: socketConnected && !isPending ? 'pointer' : 'not-allowed',
    zIndex: 10,
    backgroundColor: isPending
      ? '#FFA500'
      : isOn
      ? '#2ECC40'
      : '#FF4136',
    opacity: socketConnected ? 1 : 0.5,
    transition: 'all 0.3s ease',
  };

  const handleStyle = {
    width: 21,
    height: 21,
    borderRadius: '50%',
    backgroundColor: '#fff',
    transform: isOn ? 'translateX(25px)' : 'translateX(0)',
    transition: 'transform 0.3s ease',
  };

  const rotateStyle = {
    position: 'absolute',
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    cursor: 'pointer',
  };

  return (
    <div
      style={nodeStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Connection handles */}
      {isEditing &&
        ['Top','Right','Bottom','Left'].map((pos) => (
          <Handle
            key={pos}
            type={pos==='Top'||pos==='Left'?'target':'source'}
            position={Position[pos]}
            style={{
              background:'#D9DFC6', width:10, height:10,
              borderRadius:'50%', border:'1px solid #999',
              cursor:'crosshair', zIndex:9999
            }}
          />
        ))}

      {/* Resizable image */}
      <Resizable
        size={size}
        onResize={handleResize}
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={() => setIsResizing(false)}
        minWidth={minW} minHeight={minH}
        maxWidth={maxW} maxHeight={maxH}
        enable={isEditing?{ top:true,right:true,bottom:true,left:true,bottomRight:true }:{}}>
        <img src={svgPath} alt={text} style={imageStyle} />
      </Resizable>

      {/* Label & status */}
      {(isEditing || hovered) && (
        <div style={{
          width:'100%', marginTop:6, fontSize:'12px',
          border:'1px solid #ddd', borderRadius:4,
          padding:4, backgroundColor:'#f9f9f9', textAlign:'center'
        }}>
          <input
            value={text}
            onChange={e=>setText(e.target.value)}
            readOnly={!isEditing}
            placeholder="Label..."
            style={{
              width:'100%', fontSize:'12px',
              border:'none', textAlign:'center', outline:'none'
            }}
          />
          {(isPump||isAirblower) && (
            <div style={{
              color: isPending?'#FFA500':isOn?'#2ECC40':'#FF4136',
              fontWeight:'bold', fontSize:'12px'
            }}>
              {statusText()}
            </div>
          )}
        </div>
      )}

      {/* Toggle control */}
      {(isPump||isAirblower) && (
        <div 
          style={toggleStyle} 
          onClick={toggleDevice} 
          title={!socketConnected ? 'Offline' : isPending ? 'Pending...' : ''}
        >
          <div style={handleStyle} />
        </div>
      )}

      {/* Rotate button */}
      {isEditing && (
        <div style={rotateStyle} onClick={rotateHandler}>
          <FaSyncAlt size={18} />
        </div>
      )}
    </div>
  );
};

export default SVGnode;