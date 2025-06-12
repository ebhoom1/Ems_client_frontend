// src/components/MaintenanceTypeModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { API_URL } from '../../utils/apiConfig';

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0,
  width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const boxStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '8px',
  maxWidth: '400px',
  width: '90%',
};

export default function MaintenanceTypeModal({ equipmentId, equipmentName, onClose }) {
  const navigate = useNavigate();

  // 🔑 grab the nested validUserOne object
  const { validUserOne = {} } = useSelector(state => state.user.userData || {});
  const { isTechnician, isTerritorialManager } = validUserOne;

  const [loading, setLoading]             = useState(true);
  const [canMechanical, setCanMechanical] = useState(false);
  const [canElectrical, setCanElectrical] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/equiment/${equipmentId}/maintenance-status`
        );
        setCanMechanical(data.canMechanical);
        setCanElectrical(data.canElectrical);
      } catch (err) {
        console.error('Failed to fetch maintenance status', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [equipmentId]);

  const pick = (type) => {
    onClose();
    navigate(`/maintenance/${type}/${equipmentId}`, {
      state: { equipmentName, equipmentId },
    });
  };

  if (loading) {
    return (
      <div style={overlayStyle}>
        <div style={boxStyle}>
          <p>Checking maintenance availability…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <h5>
          Select Maintenance Type for: <strong>{equipmentName}</strong>
        </h5>
        <div className="d-grid gap-2">
          {/* territory managers only */}
          {isTerritorialManager && (
            canMechanical
              ? <button
                  className="btn"
                  style={{ backgroundColor: '#236a80', color: '#fff' }}
                  onClick={() => pick('mechanical')}
                >
                  Monthly Mechanical Maintenance
                </button>
              : <button className="btn btn-outline-secondary" disabled>
                  Mechanical Already Done This Month
                </button>
          )}

          {/* technicians only */}
          {isTechnician && (
            canElectrical
              ? <button
                  className="btn"
                  style={{ backgroundColor: '#236a80', color: '#fff' }}
                  onClick={() => pick('electrical')}
                >
                  Monthly Electrical Maintenance
                </button>
              : <button className="btn btn-outline-secondary" disabled>
                  Electrical Already Done This Month
                </button>
          )}

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
