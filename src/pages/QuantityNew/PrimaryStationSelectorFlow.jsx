import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';

const PrimaryStationSelectorFlow = ({ userName, stations, primaryStation, setPrimaryStation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetPrimaryStation = (stationName) => {
    setLoading(true);
    setPrimaryStation(stationName); // Update primary station locally
    const postData = {
      userName,
      stationType: 'effluent_flow',
      stackName: stationName
    };
    axios.post(`${API_URL}/api/set-primary-station`, postData)
      .then(response => {
        setLoading(false);
        console.log('Primary station set:', response.data);
        // Optionally set a message or state to indicate success
      })
      .catch(error => {
        setLoading(false);
        setError('Failed to set primary station');
        console.error('Error setting primary station:', error);
      });
  };

  return (
    <div className="primary-station-selector mt-3">
      <button className="btn btn-info" onClick={() => setIsOpen(!isOpen)}>
        <span style={{ marginRight: "10px" }}>Set Primary</span>
        <span>+</span>
      </button>
      {isOpen && (
        <ul className="dropdown-menu show" style={{ position: 'absolute', backgroundColor: '#fff', listStyle: 'none', padding: '10px', border: '1px solid #ccc', marginTop: '5px' }}>
          {stations.map((stack, index) => (
            <li key={index} className="dropdown-item" onClick={() => {
              handleSetPrimaryStation(stack);
              setIsOpen(false);
            }}>
              {stack}
            </li>
          ))}
        </ul>
      )}
      <div>
        {loading && <p>Setting primary station...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && <h4 className="primary-station-name" style={{ color: "#236A80", marginLeft: "10px" }}>
          {primaryStation || 'No primary station selected'}
        </h4>}
      </div>
    </div>
  );
};

export default PrimaryStationSelectorFlow;

