// src/pages/OperatorGeo.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function OperatorGeo() {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [error, setError] = useState('');
  const [withinRadius, setWithinRadius] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const watchId = useRef(null);
  const navigate = useNavigate();

  // Main user's coordinates from Redux
  const { userData } = useSelector(state => state.user);
  console.log('userData of geolocation', userData);
  
  const userLat = userData?.validUserOne?.latitude;
  const userLng = userData?.validUserOne?.longitude;

  // Haversine distance in meters
  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported.');
      return;
    }

    const handleSuccess = position => {
      const { latitude, longitude } = position.coords;
      setCoords({ lat: latitude, lng: longitude });
      if (userLat != null && userLng != null) {
        const dist = getDistanceMeters(userLat, userLng, latitude, longitude);
        setWithinRadius(dist <= 100);
      }
    };

    const handleError = err => {
      setError(err.message || 'Unable to retrieve location');
    };

    watchId.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [userLat, userLng]);

  const handleContinue = () => {
    navigate('/next-step');
  };

  const handleQrScan = () => {
    // Placeholder: integrate QR scanning library here
    // On successful scan:
    setQrScanned(true);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Operator Geolocation</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && coords.lat === null && <p>Requesting location…</p>}
      {coords.lat !== null && (
        <div>
          <p><strong>Your Location:</strong> {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>
          {withinRadius ? (
            <>
              <p style={{ color: 'green' }}>Within 100m of site. You may proceed.</p>
              <button onClick={handleContinue} style={{ padding: '8px 16px', marginRight: 8 }}>
                Continue
              </button>
            </>
          ) : (
            <>
              <p style={{ color: 'orange' }}>
                You are outside the 100m radius. Please scan the site QR code.
              </p>
              {!qrScanned ? (
                <button onClick={handleQrScan} style={{ padding: '8px 16px' }}>
                  Scan QR Code
                </button>
              ) : (
                <>
                  <p style={{ color: 'green' }}>QR scanned successfully.</p>
                  <button onClick={handleContinue} style={{ padding: '8px 16px' }}>
                    Continue
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
