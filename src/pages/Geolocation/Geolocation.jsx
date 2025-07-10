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
import { API_URL } from "../../utils/apiConfig"; // Ensure this path is correct
import "./Geolocation.css"; // Ensure this path is correct

Modal.setAppElement("#root");

export default function Geolocation() {
  // ─── 1) DEVICE (USER) COORDINATES ──────────────────────────────────────────────
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [error, setError] = useState("");
  const [withinRadius, setWithinRadius] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const watchId = useRef(null);
  const navigate = useNavigate();

  // ─── 2) SITE COORDINATES (FETCHED FROM DB) ────────────────────────────────────
  const [siteOptions, setSiteOptions] = useState([]);
  const [firstSiteLat, setFirstSiteLat] = useState(null);
  const [firstSiteLng, setFirstSiteLng] = useState(null);

  // ─── 3) REDUX SELECTORS & USER ROLE ───────────────────────────────────────────
  // `operator` from auth may not contain all fields; we’ll use validUser for the ID.
  const operator = useSelector((state) => state.auth.user);
  const { userData } = useSelector((state) => state.user);
  const validUser = userData?.validUserOne || {};

  const role = validUser.isTechnician
    ? "technician"
    : validUser.isTerritorialManager
    ? "territorialManager"
    : "operator";

  // ─── 4) HAVERSINE (DISTANCE) FORMULA ───────────────────────────────────────────
  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ─── 5) WATCH USER GPS POSITION ──────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported in this browser.");
      return;
    }

    const handleSuccess = (position) => {
      // For testing, we’re hardcoding Korlam Hospital Kollam coordinates:
     /*  const latitude = 13.060904;
      const longitude = 77.515971;  */
      //13.060904, 77.515971
      // In production, uncomment the next two lines:
    const { latitude, longitude } = position.coords;
      // setCoords({ lat: latitude, lng: longitude });
      setCoords({ lat: latitude, lng: longitude });
    };

    const handleError = (err) => {
      setError(err.message || "Unable to retrieve location");
    };

    watchId.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, []);

  // ─── 6) FETCH ASSIGNED SITES FOR THE USER ─────────────────────────────────────
  useEffect(() => {
    // Now we use validUser._id (not operator._id)
    if (!validUser?._id || !role) {
      console.warn(
        "⚠️ Skipping site fetch: validUser._id or role is falsy.",
        "validUser._id =",
        validUser?._id,
        "role =",
        role
      );
      return;
    }

    const fetchAllSites = async () => {
      try {
        console.log(
          `📡 Fetching sites for user ID: ${validUser._id}, role: ${role}`
        );
        const res = await fetch(
          `${API_URL}/api/get-sites-for-user/${validUser._id}/${role}`
        );
        console.log("🟢 HTTP status from sites endpoint:", res.status);

        if (!res.ok) {
          const errorBody = await res.text();
          throw new Error(
            `Unable to fetch site locations (status ${res.status}): ${errorBody}`
          );
        }

        const data = await res.json();
        console.log("🗺️ Sites API returned:", data);

        if (!Array.isArray(data) || data.length === 0) {
          console.warn("⚠️ API returned an empty array or non-array for sites.");
          setError("No site locations found for your account.");
          setSiteOptions([]);
          setFirstSiteLat(null);
          setFirstSiteLng(null);
          return;
        }

        // Determine whether the objects use { latitude, longitude } or { lat, lng }:
        const firstSite = data[0];
        let resolvedLat, resolvedLng;

        if (
          typeof firstSite.latitude === "number" &&
          typeof firstSite.longitude === "number"
        ) {
          resolvedLat = firstSite.latitude;
          resolvedLng = firstSite.longitude;
        } else if (
          typeof firstSite.lat === "number" &&
          typeof firstSite.lng === "number"
        ) {
          resolvedLat = firstSite.lat;
          resolvedLng = firstSite.lng;
        } else {
          throw new Error(
            "First site object lacks valid latitude/longitude (or lat/lng) fields."
          );
        }

        setSiteOptions(data);
        setFirstSiteLat(resolvedLat);
        setFirstSiteLng(resolvedLng);
        setError("");
      } catch (err) {
        console.error("❌ Error fetching site locations:", err);
        setError(`Failed to load site data: ${err.message}`);
        setSiteOptions([]);
        setFirstSiteLat(null);
        setFirstSiteLng(null);
      }
    };

    fetchAllSites();
  }, [validUser?._id, role]);

  // ─── 7) CALCULATE 'withinRadius' ──────────────────────────────────────────────
  useEffect(() => {
    if (
      coords.lat === null ||
      coords.lng === null ||
      siteOptions.length === 0
    ) {
      setWithinRadius(false);
      return;
    }

    const matchedSite = siteOptions.find((site) => {
      let siteLat, siteLng;

      if (
        typeof site.latitude === "number" &&
        typeof site.longitude === "number"
      ) {
        siteLat = site.latitude;
        siteLng = site.longitude;
      } else if (
        typeof site.lat === "number" &&
        typeof site.lng === "number"
      ) {
        siteLat = site.lat;
        siteLng = site.lng;
      } else {
        console.warn(`Site ${site.companyName || site._id} has invalid coordinates.`);
        return false;
      }

      const dist = getDistanceMeters(siteLat, siteLng, coords.lat, coords.lng);
      console.log(
        `📍 Distance from device to ${site.companyName || "site"}: ${dist.toFixed(2)} meters`
      );
      return dist <= 100;
    });

    setWithinRadius(Boolean(matchedSite));
  }, [coords, siteOptions]);

  // ─── 8) DEBUG LOGS (Optional) ──────────────────────────────────────────────────
  useEffect(() => {
    console.log("↪️ Current device coords:", coords.lat, coords.lng);
    console.log("↪️ First fetched site coords:", firstSiteLat, firstSiteLng);
    console.log("↪️ User role:", role);
    console.log("↪️ Is within radius:", withinRadius);
    console.log("↪️ Operator data (auth):", operator);
    console.log("↪️ Valid user data:", validUser);
    console.log("↪️ All site options:", siteOptions);
  }, [coords, firstSiteLat, firstSiteLng, role, withinRadius, operator, validUser, siteOptions]);

  // ─── 9) HANDLE CHECK‐IN (MARK ATTENDANCE) ─────────────────────────────────────
  const handleMarkAttendance = async () => {
    try {
      const checkInMethod = "Location Verified";
      const payload = {
        username: validUser.userName, // operator’s userName from validUser
        companyName: validUser.companyName || "N/A",
        adminType: validUser.adminType || validUser.userType || "N/A",
        checkInTime: new Date().toISOString(),
        checkInMethod,
        latitude: coords.lat,
        longitude: coords.lng,
        userRole: role,
        isCheckedIn: true,
      };

      if (!payload.username || !payload.latitude || !payload.longitude || !payload.userRole) {
        throw new Error("Missing essential attendance data (username, coordinates, or role).");
      }

      console.log("📨 Sending POST request to /api/attendance with payload:", payload);

      const res = await fetch(`${API_URL}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          "❌ Attendance POST request failed:",
          res.status,
          res.statusText,
          errorText
        );
        let errorMessage = "Failed to mark attendance. Please try again.";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      console.log("🎉 Attendance marked successfully!");
      setModalOpen(false);
      navigate("/water", { state: { checkedIn: true } });
    } catch (err) {
      console.error("⚠️ Error marking attendance:", err);
      alert(`Error marking attendance: ${err.message}`);
    }
  };

  // ─── 10) RENDER UI ─────────────────────────────────────────────────────────────
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
                  ⚠ Unable to capture your location. Please enable GPS.
                </p>
              )
            ) : (
              withinRadius ? (
                <>
                  <p className="geo-success">
                    ✅ You are within 100m of the site.
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="geo-button"
                  >
                    ✅ Proceed to Check-In
                  </button>
                </>
              ) : (
                <p className="geo-warning">
                  ⚠ You are outside the 100m radius. Please move closer to the
                  site to check in.
                </p>
              )
            )}

            {firstSiteLat && firstSiteLng && (
              <p className="geo-site-info">
                Nearest Site Location: {firstSiteLat.toFixed(6)}, {firstSiteLng.toFixed(6)}
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
