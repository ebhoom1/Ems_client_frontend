import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './index.css'; // your switch CSS

// 1) connect once at module scope
const socket = io('http://localhost:5555');

const PumpControlDashboard = () => {
  const product_id = '27'; // your site ID

  // 2) master list of all pumps & blowers
  const pumpList = [
    { pumpId: 'PUMP01', name: 'Permeate Pump 1' },
    { pumpId: 'PUMP02', name: 'Permeate Pump 2' },
    { pumpId: 'pump_0', name: 'Membrane Feed Pump 1' },
    { pumpId: 'PUMP04', name: 'Membrane Feed Pump 2' },
    { pumpId: 'BLWR01', name: 'Air Blower 1' },
    { pumpId: 'BLWR02', name: 'Air Blower 2' },
    { pumpId: 'BLWR03', name: 'Air Blower 3' },
    { pumpId: 'BLWR04', name: 'Air Blower 4' },
    { pumpId: 'PUMP05', name: 'Raw Water Pump 1' },
    { pumpId: 'PUMP06', name: 'Raw Water Pump 2' },
    { pumpId: 'PUMP07', name: 'Anoxic Mechanic Pump' },
    { pumpId: 'PUMP08', name: 'CIP Pump' },
    { pumpId: 'PUMP09', name: 'Dosing Pump' },
  ];

  // 3) status map in state
  const [statuses, setStatuses] = useState(
    pumpList.reduce((acc, p) => ({ ...acc, [p.pumpId]: false }), {})
  );

  // 4) join your product room so you only get relevant feedback
  useEffect(() => {
    socket.emit('joinRoom', { product_id });
  }, [product_id]);

  // 5) listen for real feedback and update state
  useEffect(() => {
    const handler = (payload) => {
      const { pumpId, status } = payload.pumpData;
      setStatuses(prev => ({
        ...prev,
        [pumpId]: status === 1
      }));
    };
    socket.on('pumpFeedback', handler);
    return () => { socket.off('pumpFeedback', handler); };
  }, []);

  // 6) when user toggles, send controlPump
  const handleToggle = (pumpId, name) => {
    const isOn = !statuses[pumpId];
    socket.emit('controlPump', {
      product_id,
      pumps: [{ pumpId, pumpName: name, status: isOn ? 'ON' : 'OFF' }]
    });
    console.log(`Sent ${isOn ? 'ON' : 'OFF'} for ${name}`);
    // (optionally) optimistic UI:
    setStatuses(prev => ({ ...prev, [pumpId]: isOn }));
  };

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Pump & Blower Control</h1>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {pumpList.map(({ pumpId, name }) => (
          <div key={pumpId} className="card">
            <h3>{name}</h3>
            <label className="switch">
              <input
                type="checkbox"
                checked={statuses[pumpId]}
                onChange={() => handleToggle(pumpId, name)}
              />
              <span className="slider round"></span>
            </label>
            <p>Status: {statuses[pumpId] ? 'ON' : 'OFF'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PumpControlDashboard;
