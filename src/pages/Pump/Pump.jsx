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
    /* …the rest… */
  ];

  // 3) status map in state
  const [statuses, setStatuses] = useState(
    pumpList.reduce((acc, p) => ({ ...acc, [p.pumpId]: false }), {})
  );
  // track which pumps are waiting for feedback
  const [pending, setPending] = useState({});

  // 4) join your product room so you only get relevant feedback
  useEffect(() => {
    console.debug('JOIN ROOM →', product_id);
    socket.emit('joinRoom', { product_id });
  }, [product_id]);

  // 5a) listen for ack (fast)
  useEffect(() => {
    const ackHandler = (ack) => {
      console.debug('💡 pumpAck received:', ack);
      const { pumpData: { pumpId, status } } = ack;
      // ack comes before real feedback – update optimistically:
      setStatuses(s => ({ ...s, [pumpId]: status === 1 }));
    };
    socket.on('pumpAck', ackHandler);
    return () => { socket.off('pumpAck', ackHandler); };
  }, []);

  // 5b) listen for real feedback (and clear pending)
  useEffect(() => {
    const fbHandler = (fb) => {
      console.debug('✅ pumpFeedback received:', fb);
      const { pumpData: { pumpId, status } } = fb;
      setStatuses(s => ({ ...s, [pumpId]: status === 1 }));
      setPending(p => {
        const nxt = { ...p };
        delete nxt[pumpId];
        return nxt;
      });
    };
    socket.on('pumpFeedback', fbHandler);
    return () => { socket.off('pumpFeedback', fbHandler); };
  }, []);

  // 6) when user toggles, send controlPump once
  const handleToggle = (pumpId, name) => {
    if (pending[pumpId]) {
      console.warn(`Toggle for ${pumpId} ignored: still pending.`);
      return;
    }

    const isOn = !statuses[pumpId];
    const payload = {
      product_id,
      pumps: [{ pumpId, pumpName: name, status: isOn ? 'ON' : 'OFF' }]
    };

    console.trace('👉 controlPump emit', payload);
    socket.emit('controlPump', payload);

    // mark as pending so we don’t fire again until feedback
    setPending(p => ({ ...p, [pumpId]: true }));

    // optimistic UI update
    setStatuses(s => ({ ...s, [pumpId]: isOn }));
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
                disabled={pending[pumpId]}
                onChange={() => handleToggle(pumpId, name)}
              />
              <span className="slider round"></span>
            </label>
            <p>
              Status: {statuses[pumpId] ? 'ON' : 'OFF'}{' '}
              {pending[pumpId] && <em>(waiting…)</em>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PumpControlDashboard;
