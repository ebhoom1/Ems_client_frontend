import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0,
  width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const boxStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '8px',
  maxWidth: '400px',
  width: '90%',
  textAlign: 'center'
};

export default function ReportTypeModal({ equipmentId, equipmentName, onClose }) {
  const nav = useNavigate();

  useEffect(() => {
    console.log('ReportTypeModal opened for:', equipmentName, equipmentId);
  }, [equipmentId, equipmentName]);

  const pick = (type) => {
    onClose();
    nav(`/report/${type}/${equipmentId}`);
  };

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <h5>Select Report</h5>
        <p><strong>{equipmentName}</strong></p>
        <div className="d-grid gap-2">
          <button
            className="btn  w-100 mb-2"
            style={{ backgroundColor: '#236a80', color: '#fff' }} 
            onClick={() => pick('mechanical')}
          >
            Mechanical Report
          </button>
          <button
            className="btn btn-outline-secondary w-100 mb-3"
            onClick={() => pick('electrical')}
          >
            Electrical Report
          </button>
          <button
            className="btn btn-link text-danger"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
