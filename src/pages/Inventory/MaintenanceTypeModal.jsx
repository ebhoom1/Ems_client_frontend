import React from 'react';
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
  width: '90%'
};

export default function MaintenanceTypeModal({ equipmentId, equipmentName, onClose }) {
  const navigate = useNavigate();

  // Log the equipment name each time this component renders
  console.log('Selected equipment:', equipmentName);

  const pick = (type) => {
    onClose();
    navigate(`/maintenance/${type}/${equipmentId}`, {
      state: { equipmentName }
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <h5>Select Maintenance Type for: {equipmentName}</h5>
        <div className="d-grid gap-2">
          <button 
            className="btn" 
            style={{ backgroundColor: '#236a80', color: '#fff' }} 
            onClick={() => pick('mechanical')}
          >
            Monthly Mechanical Maintenance
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => pick('electrical')}
          >
            Monthly Electrical Maintenance
          </button>
          <button 
            className="btn btn-link" 
            style={{ color: 'red' }} 
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
