

// src/pages/OperatorGeo.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from 'react-modal';
import { API_URL } from "../../utils/apiConfig";
import './OperatorGeo.css';
import Swal from 'sweetalert2';


Modal.setAppElement('#root');

export default function OperatorGeo() {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [error, setError] = useState('');
  const [withinRadius, setWithinRadius] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const watchId = useRef(null);
  const qrCodeScanner = useRef(null);
  const qrRegionRef = useRef(null);
  const navigate = useNavigate();

  const { userData } = useSelector(state => state.user);
  const validUser = userData?.validUserOne || {};
  const userLat = validUser.latitude;
  const userLng = validUser.longitude;

  console.log("userData:",userData);
  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }; 

  //within 100m testing
  // const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  //   const toRad = x => (x * Math.PI) / 180;
  //   const R = 6371000; // Earth radius in meters
  //   const dLat = toRad(lat2 - lat1);
  //   const dLon = toRad(lon2 - lon1);
  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
  //     Math.sin(dLon / 2) * Math.sin(dLon / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   return R * c;
  // };
  

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported.');
      return;
    }

    const handleSuccess = position => {
      const { latitude, longitude } = position.coords;
      setCoords({ lat: latitude, lng: longitude });
      if (userLat && userLng) {
        const dist = getDistanceMeters(userLat, userLng, latitude, longitude);
        setWithinRadius(dist <= 100);
      }
    };

  //within 100m testing
  // const handleSuccess = position => {
  //     // Mock coordinates near the site
  //     const latitude = userLat + 0.0003; // ~30–40 meters away
  //     const longitude = userLng + 0.0003;
    
  //     setCoords({ lat: latitude, lng: longitude });
    
  //     const dist = getDistanceMeters(userLat, userLng, latitude, longitude);
  //     console.log("Distance from site:", dist.toFixed(2), "meters");
    
  //     const isInRadius = dist <= 100;
  //     setWithinRadius(isInRadius);
  //   };
    

    const handleError = err => {
      setError(err.message || 'Unable to retrieve location');
    };

    watchId.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [userLat, userLng]);

  useEffect(() => {
    let scannerInstance; // local scanner
  
    const initQrScanner = async () => {
      if (!scanning || !qrRegionRef.current) return;
  
      if (qrCodeScanner.current && qrCodeScanner.current._isScanning) {
        console.log('Scanner already active, skipping re-start.');
        return; // already scanning
      }
  
      const html5Qr = new Html5Qrcode(qrRegionRef.current.id);
      scannerInstance = html5Qr;
      qrCodeScanner.current = html5Qr;
  
      try {
        await html5Qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            console.log("Scanned Equipment ID:", decodedText);
  
            try {
              const response = await fetch(`${API_URL}/api/equiment/${decodedText}`);
              const data = await response.json();
              console.log("Fetched Equipment Data:", data);
  
              if (response.ok && data.equipment?.userName === validUser.userName) {
                if (html5Qr._isScanning) {
                  await html5Qr.stop();
                }
                setQrScanned(true);
                setScanning(false);
                setModalOpen(true);
              } else {
                if (html5Qr._isScanning) {
                  await html5Qr.stop();
                }
                setScanning(false);
                alert("❌ Scanned equipment does not belong to your site.");
              }
            } catch (error) {
              console.error("Error verifying equipment:", error);
              if (html5Qr._isScanning) {
                await html5Qr.stop();
              }
              setScanning(false);
              alert("❌ Error verifying equipment. Try again.");
            }
          },
          (err) => console.warn("QR Error:", err)
        );
      } catch (err) {
        setError("Failed to start QR scanner.");
        console.error(err);
        setScanning(false);
      }
    };
  
    initQrScanner(); // ✅ call it
  
    return () => {
      if (scannerInstance && scannerInstance._isScanning) {
        scannerInstance.stop().catch((e) => console.log("Failed to stop scanner:", e));
      }
    };
  }, [scanning]);
  
  
  

  const handleMarkAttendance = async () => {
    try {
      const checkInMethod = withinRadius ? "Location Verified" : "QR Code Verified"; 
  
      const res = await fetch(`${API_URL}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: validUser.userName,
          companyName: validUser.companyName,
          adminType:validUser.adminType,
          checkInTime: new Date().toISOString(),
          checkInMethod: checkInMethod 
        })
      });
  
      console.log("response:", res);
      if (!res.ok) throw new Error("Failed to mark attendance");
  
      setModalOpen(false);
      navigate("/water");
    } catch (err) {
      alert("Error marking attendance: " + err.message);
    }
  };
  
  return (
    <div className="geo-container">
      <div className="geo-card">
        <h2 className="geo-heading">Operator Attendance</h2>

        {error && <p className="geo-error">{error}</p>}
        {!error && coords.lat === null && <p>Locating you, please wait…</p>}

        {coords.lat !== null && (
          <div>
            <p><strong>Your Location:</strong> {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>

            {withinRadius ? (
              <>
                <p className="geo-success">✅ You are within 100m of the site.</p>
                <button onClick={() => setModalOpen(true)} className="geo-button">
                  Proceed to Check-In
                </button>
              </>
            ) : (
              <>
                <p className="geo-warning">⚠ You are outside the 100m radius.Please scan the site QR code</p>
                {!qrScanned && !scanning && (
                  <button onClick={() => setScanning(true)} className="geo-button warning">
                    Scan QR Code
                  </button>
                )}
                {scanning && (
                  <div id="qr-reader" ref={qrRegionRef} className="qr-box" />
                )}
                {qrScanned && <p className="geo-success">✅ QR Verified</p>}
              </>
            )}
          </div>
        )}
      </div>

      <Modal
  isOpen={modalOpen}
  onRequestClose={() => setModalOpen(false)}
  className="geo-modal"
  overlayClassName="geo-modal-overlay"
>
  {withinRadius && !qrScanned && (
    <h3>Location Verified</h3>
  )}

  {!withinRadius && qrScanned && (
    <h3>QR Code Verified</h3>
  )}

  {!withinRadius && !qrScanned && (
    <h3>Verification Required</h3>
  )}

  {(withinRadius || qrScanned) ? (
    <>
      <p>Do you want to proceed and mark your attendance?</p>
      <button onClick={handleMarkAttendance} className="geo-button">
        ✅ Proceed to Check-In
      </button>
    </>
  ) : (
    <p>Please verify either through QR scan or get closer to the plant.</p>
  )}
</Modal>

    </div>
  );
}
