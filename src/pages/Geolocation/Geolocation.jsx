// // src/pages/OperatorGeo.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import Modal from "react-modal";
// import { API_URL } from "../../utils/apiConfig";
// import "./Geolocation.css";

// Modal.setAppElement("#root");

// export default function Geolocation() {
//   const [coords, setCoords] = useState({ lat: null, lng: null });
//   const [error, setError] = useState("");
//   const [withinRadius, setWithinRadius] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);

//   const watchId = useRef(null);
//   const navigate = useNavigate();
//   const { userData } = useSelector((state) => state.user);
//   const operator=useSelector((state)=>state.auth.user);
//   console.log("operator:",operator);
//   const validUser = userData?.validUserOne || {};

//   // Fallback adminType: either from validUser.adminType or userType
//   const adminType = validUser.adminType || validUser.userType;

//   const userLat = validUser.latitude;
//   const userLng = validUser.longitude;

//   // Haversine formula
//   const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
//     const toRad = (x) => (x * Math.PI) / 180;
//     const R = 6371000;
//     const dLat = toRad(lat2 - lat1);
//     const dLon = toRad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setError("Geolocation not supported.");
//       return;
//     }

//     const handleSuccess = (position) => {
//       const { latitude, longitude } = position.coords;
//       setCoords({ lat: latitude, lng: longitude });
//       if (userLat != null && userLng != null) {
//         const dist = getDistanceMeters(userLat, userLng, latitude, longitude);
//         setWithinRadius(dist <= 100);
//       }
//     };

//     const handleError = (err) => {
//       setError(err.message || "Unable to retrieve location");
//     };

//     watchId.current = navigator.geolocation.watchPosition(
//       handleSuccess,
//       handleError,
//       { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
//     );

//     return () => {
//       if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
//     };
//   }, [userLat, userLng]);

//   const handleMarkAttendance = async () => {
//     try {
//       const checkInMethod = "Location Verified";
//       const userRole = validUser.isTechnician
//         ? "technician"
//         : validUser.isTerritorialManager
//         ? "territorialManager"
//         : "operator";
  
//       // Detailed validation of all required fields
//       const fieldValidations = {
//         username: {
//           value:  operator.userName,          
//           valid: operator.userName && typeof operator.userName === 'string',
//           message: 'Username is required and must be a string'
//         },
//         adminType: {
//           value: adminType,
//           valid: adminType && typeof adminType === 'string',
//           message: 'AdminType is required and must be a string'
//         },
//         checkInTime: {
//           value: new Date(),
//           valid: true, // Always valid since we generate it
//           message: ''
//         },
//         checkInMethod: {
//           value: checkInMethod,
//           valid: true, // Hardcoded value
//           message: ''
//         },
//         userRole: {
//           value: userRole,
//           valid: ['technician', 'territorialManager', 'operator'].includes(userRole),
//           message: 'UserRole must be one of: technician, territorialManager, operator'
//         },
//         latitude: {
//           value: coords.lat,
//           valid: typeof coords.lat === 'number' && !isNaN(coords.lat),
//           message: 'Latitude must be a valid number'
//         },
//         longitude: {
//           value: coords.lng,
//           valid: typeof coords.lng === 'number' && !isNaN(coords.lng),
//           message: 'Longitude must be a valid number'
//         }
//       };
  
//       // Check for invalid fields
//       const invalidFields = Object.entries(fieldValidations)
//         .filter(([_, validation]) => !validation.valid)
//         .map(([field, validation]) => `${field}: ${validation.message}`);
  
//       if (invalidFields.length > 0) {
//         throw new Error(`Invalid fields detected:\n${invalidFields.join('\n')}`);
//       }
  
//       // Construct payload
//       const payload = {
//         username: validUser.userName,
//         adminType,
//         checkInTime: new Date().toISOString(),
//         checkInMethod,
//         latitude: coords.lat,
//         longitude: coords.lng,
//         userRole
//       };
  
//       console.log('✅ Valid payload ready:', payload);
  
//       // Send to server
//       const res = await fetch(`${API_URL}/api/attendance`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
  
//       const responseData = await res.json().catch(() => ({}));
  
//       if (!res.ok) {
//         console.error('Server responded with:', {
//           status: res.status,
//           statusText: res.statusText,
//           body: responseData
//         });
//         throw new Error(`Server error: ${responseData.message || 'Unknown error'}`);
//       }
  
//       console.log("✅ Attendance marked successfully:", responseData);
//       setModalOpen(false);
//       navigate("/water", { state: { checkedIn: true } });
//     } catch (err) {
//       console.error('❌ Attendance error:', {
//         error: err,
//         userData: validUser,
//         coordinates: coords
//       });
//       alert(`Failed to mark attendance:\n${err.message}`);
//     }
//   };

//   return (
//     <div className="geo-container">
//       <div className="geo-card">
//         <h2 className="geo-heading">
//           {validUser.isTechnician
//             ? "Technician Attendance"
//             : validUser.isTerritorialManager
//             ? "Territorial Manager Attendance"
//             : "Operator Attendance"}
//         </h2>

//         {error && <p className="geo-error">{error}</p>}
//         {!error && coords.lat === null && <p>Locating you, please wait…</p>}

//         {coords.lat !== null && (
//           <>
//             <p>
//               <strong>Your Location:</strong> {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
//             </p>

//             {(validUser.isTechnician || validUser.isTerritorialManager) ? (
//               <>
//                 <p className="geo-info">📍 Location captured.</p>
//                 <button onClick={() => setModalOpen(true)} className="geo-button">
//                   ✅ Proceed to Check-In
//                 </button>
//               </>
//             ) : withinRadius ? (
//               <>
//                 <p className="geo-success">✅ You are within 100m of the site.</p>
//                 <button onClick={() => setModalOpen(true)} className="geo-button">
//                   ✅ Proceed to Check-In
//                 </button>
//               </>
//             ) : (
//               <p className="geo-warning">
//                 ⚠ You are outside the 100m radius. Please move closer to the site to check-in.
//               </p>
//             )}
//           </>
//         )}
//       </div>

//       <Modal
//         isOpen={modalOpen}
//         onRequestClose={() => setModalOpen(false)}
//         className="geo-modal"
//         overlayClassName="geo-modal-overlay"
//       >
//         <h3>Location Verified</h3>
//         <p>Proceed and mark your attendance?</p>
//         <button onClick={handleMarkAttendance} className="geo-button">
//           ✅ Check In
//         </button>
//       </Modal>
//     </div>
//   );
// }


// src/pages/OperatorGeo.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Modal from "react-modal";
import { API_URL } from "../../utils/apiConfig";
import "./Geolocation.css";

Modal.setAppElement("#root");

export default function Geolocation() {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [error, setError] = useState("");
  const [withinRadius, setWithinRadius] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const watchId = useRef(null);
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const operator = useSelector((state) => state.auth.user);
  console.log("operator:",operator);
  const validUser = userData?.validUserOne || {};
  console.log("validUser:",validUser)
  const [userLat, setUserLat] = useState(null);
const [userLng, setUserLng] = useState(null);
const [siteOptions, setSiteOptions] = useState([]);
const [selectedSiteIndex, setSelectedSiteIndex] = useState(0);


  console.log("User site coordinates:", userLat, userLng);

   //within 100m testing
  //   const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  //    const toRad = (x) => (x * Math.PI) / 180;
  //    const R = 6371000; // Earth radius in meters
  //   const dLat = toRad(lat2 - lat1);
  //    const dLon = toRad(lon2 - lon1);
  //    const a =
  //      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos(toRad(lat1)) *
  //        Math.cos(toRad(lat2)) *
  //        Math.sin(dLon / 2) *
  //        Math.sin(dLon / 2);
  //    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   return R * c;
  //  }; 

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


 


useEffect(() => {
  if (!siteOptions.length) return;

  const handleSuccess = (position) => {
    // ✅ PRODUCTION MODE — use real GPS coordinates
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // ✅ MOCK MODE — simulate near-site for testing
    // const latitude = siteOptions[0].latitude + 0.0003;
    // const longitude = siteOptions[0].longitude + 0.0003;

    setCoords({ lat: latitude, lng: longitude });

    // ✅ Check against ALL assigned site locations
    const matchedSite = siteOptions.find((site) => {
      const dist = getDistanceMeters(site.latitude, site.longitude, latitude, longitude);
      console.log(`📍 Distance to ${site.companyName || "site"}: ${dist.toFixed(2)} meters`);
      return dist <= 100;
    });

    setWithinRadius(!!matchedSite);
  };

  const handleError = (err) => {
    setError(err.message || "Unable to retrieve location");
  };

  watchId.current = navigator.geolocation.watchPosition(
    handleSuccess,
    handleError,
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
  );

  return () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };
}, [siteOptions]);


  const handleMarkAttendance = async () => {
    console.log("checkin");
    try {
      const checkInMethod = "Location Verified";
      const userRole = validUser.isTechnician
        ? "technician"
        : validUser.isTerritorialManager
        ? "territorialManager"
        : "operator";

      const payload = {
        username: operator.userName,
        companyName: validUser.companyName,
        adminType: validUser.adminType,
        checkInTime: new Date().toISOString(),
        checkInMethod,
        latitude: coords.lat,
        longitude: coords.lng,
        userRole,
      };

      const res = await fetch(`${API_URL}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to mark attendance");

      setModalOpen(false);
      navigate("/water", { state: { checkedIn: true } });
    } catch (err) {
      alert("Error marking attendance: " + err.message);
    }
  };

  

  const role = validUser.isTechnician
  ? "technician"
  : validUser.isTerritorialManager
  ? "territorialManager"
  : "operator";


  useEffect(() => {
    const fetchAllSites = async () => {
      try {
        const res = await fetch(`${API_URL}/api/get-sites-for-user/${operator._id}/${role}`);
        if (!res.ok) throw new Error("Unable to fetch site locations");

const data = await res.json();
if (!data.length) throw new Error("No site locations found");

setSiteOptions(data);
setSelectedSiteIndex(0);
setUserLat(data[0].latitude);
setUserLng(data[0].longitude);

      } catch (err) {
        console.error("Error fetching site locations:", err);
        setError("Failed to load site locations.");
      }
    };
  
    if (operator?._id && role) {
      fetchAllSites();
    }
  }, [operator?._id, role]);
  
  
  return (
    <div className="geo-container">
      <div className="geo-card">
        <h2 className="geo-heading">
          {validUser.isTechnician
            ? "Technician Attendance"
            : validUser.isTerritorialManager
            ? "Territorial Manager Attendance"
            : "Operator Attendance"}
        </h2>

        {error && <p className="geo-error">{error}</p>}
        {!error && coords.lat === null && <p>Locating you, please wait…</p>}

        {coords.lat !== null && (
  <div>
    <p>
      <strong>Your Location:</strong> {coords.lat.toFixed(6)},{" "}
      {coords.lng.toFixed(6)}
    </p>

    {validUser.isTechnician || validUser.isTerritorialManager ? (
      coords.lat && coords.lng ? (
        <>
          <p className="geo-info">📍 Location captured.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="geo-button"
          >
            ✅ Proceed to Check-In
          </button>
        </>
      ) : (
        <p className="geo-warning">
          ⚠ Unable to capture your location. Please ensure GPS is enabled.
        </p>
      )
    ) : withinRadius ? (
      <>
        <p className="geo-success">✅ You are within 100m of the site.</p>
        <button
          onClick={() => setModalOpen(true)}
          className="geo-button"
        >
          ✅ Proceed to Check-In
        </button>
      </>
    ) : (
      <p className="geo-warning">
        ⚠ You are outside the 100m radius. Please move closer to the site to check-in.
      </p>
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
        <h3>Location Verified</h3>
        <p>Do you want to proceed and mark your attendance?</p>
        <button onClick={handleMarkAttendance} className="geo-button">
          ✅ Proceed to Check-In
        </button>
      </Modal>
    </div>
  );
}
