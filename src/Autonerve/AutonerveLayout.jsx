import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { ReactFlowProvider } from "reactflow";
import CanvasComponent from "./CanvasComponent";
import Iconbar from "./Iconbar";
import "./AutonerveLayout.css";
import HeaderSim from "../pages/Header/Hedaer";
import RunTime from "../pages/LiveMapping/RunningTime";
import { API_URL } from "../utils/apiConfig";
import wipro from '../assests/images/wipro.png'
import { useNavigate } from "react-router-dom";


function AutonerveLayout() {
  const navigate = useNavigate();

  const { userData } = useSelector((state) => state.user);
  //updt
  const loggedInUserName = String(userData?.validUserOne?.userName || "");
  const isForcedProfile =
    loggedInUserName.toLowerCase() === "conti" ||
    loggedInUserName.toLowerCase() === "admin1_001";

  const [savedStations, setSavedStations] = useState([]);
  const autoAppliedRef = useRef(false);

  const [selectedStationName, setSelectedStationName] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // 🔹 Track the selected user from sessionStorage
  const [selectedUserId, setSelectedUserId] = useState(() => {
    try {
      return sessionStorage.getItem("selectedUserId") || null;
    } catch {
      return null;
    }
  });

  // Listen for Header’s custom event (fires in the same tab)
  // useEffect(() => {
  //   const handler = () => {
  //     try {
  //       const v = sessionStorage.getItem("selectedUserId") || null;
  //       setSelectedUserId(v);
  //     } catch {
  //       setSelectedUserId(null);
  //     }
  //   };
  //   window.addEventListener("selectedUserIdChanged", handler);
  //   return () => window.removeEventListener("selectedUserIdChanged", handler);
  // }, []);
  useEffect(() => {
    if (isForcedProfile) return;
    const handler = () => {
      try {
        const v = sessionStorage.getItem("selectedUserId") || null;
        setSelectedUserId(v);
      } catch {
        setSelectedUserId(null);
      }
    };
    window.addEventListener("selectedUserIdChanged", handler);
    return () => window.removeEventListener("selectedUserIdChanged", handler);
  }, [isForcedProfile]);

  const draggedFileRef = useRef(null);
  const handleFileDrop = (file) => {
    draggedFileRef.current = file;
  };
  const clearDraggedFile = () => {
    draggedFileRef.current = null;
  };

  // useEffect(() => {
  //   const fetchStations = async () => {
  //     const loggedInUserName = userData?.validUserOne?.userName;
  //     const userType = userData?.validUserOne?.userType;

  //     let effectiveUserName = loggedInUserName;
  //     if (String(userType).toLowerCase() === "admin"||"operator") {
  //       // prefer selectedUserId from state
  //       effectiveUserName = selectedUserId || loggedInUserName;
  //     }

  //     if (!effectiveUserName) return;

  //     try {
  //       const response = await fetch(`${API_URL}/api/live-stations/${effectiveUserName}`);
  //       const result = await response.json();
  //       console.log("livestation fetch result:", result);

  //       if (response.ok && Array.isArray(result?.data)) {
  //         setSavedStations(result.data.map((s) => s.stationName).filter(Boolean));
  //       } else {
  //         console.error("Error fetching stations:", result?.message || "Unknown error");
  //         setSavedStations([]);
  //       }
  //     } catch (error) {
  //       console.error("Network error fetching stations:", error);
  //       setSavedStations([]);
  //     }
  //   };

  //   fetchStations();
  // }, [userData, selectedUserId]); // 🔸 re-fetch when header selection changes

  // useEffect(() => {
  //   const fetchStations = async () => {
  //     const loggedInUserName = userData?.validUserOne?.userName;
  //     const userType = userData?.validUserOne?.userType;

  //     // ✅ Always prefer selectedUserId, fallback to logged in user
  //     let effectiveUserName = selectedUserId || loggedInUserName;
  //     console.log("effectiveUserName:", effectiveUserName);
  //     if (!effectiveUserName) return;

  //     try {
  //       const response = await fetch(
  //         `${API_URL}/api/live-stations/${effectiveUserName}`
  //       );
  //       const result = await response.json();
  //       console.log("livestation fetch result:", result);

  //       if (response.ok && Array.isArray(result?.data)) {
  //         setSavedStations(
  //           result.data.map((s) => s.stationName).filter(Boolean)
  //         );
  //       } else {
  //         console.error(
  //           "Error fetching stations:",
  //           result?.message || "Unknown error"
  //         );
  //         setSavedStations([]);
  //       }
  //     } catch (error) {
  //       console.error("Network error fetching stations:", error);
  //       setSavedStations([]);
  //     }
  //   };

  //   fetchStations();
  // }, [userData, selectedUserId]);

  useEffect(() => {
  const fetchStations = async () => {
    const ui = userData?.validUserOne;
    const loggedIn = ui?.userName;

    // force the calls to use KIMS027 under the hood when required
    const effectiveUserName = isForcedProfile ? "KIMS027" : (selectedUserId || loggedIn);
    console.log("effectiveUserName:", effectiveUserName);
    if (!effectiveUserName) return;

    try {
      const response = await fetch(`${API_URL}/api/live-stations/${effectiveUserName}`);
      const result = await response.json();
      console.log("livestation fetch result:", result);

      if (response.ok && Array.isArray(result?.data)) {
        const stations = result.data.map((s) => s.stationName).filter(Boolean);
        setSavedStations(isForcedProfile ? stations.filter(n => n === "KIMS_New") : stations);
      } else {
        console.error("Error fetching stations:", result?.message || "Unknown error");
        setSavedStations([]);
      }
    } catch (error) {
      console.error("Network error fetching stations:", error);
      setSavedStations([]);
    }
  };

  fetchStations();
}, [userData, selectedUserId, isForcedProfile]);


  const handleSelectStation = (stationName) => {
    setSelectedStationName(stationName);
    setIsEditMode(false);
  };

  const handleCreateNew = () => {
    setSelectedStationName(null);
    setIsEditMode(true);
  };

  useEffect(() => {
    if (autoAppliedRef.current) return;
    if (!isForcedProfile) return;
    if (selectedStationName) return;

    setSelectedStationName("KIMS_New");
    setIsEditMode(false);
    autoAppliedRef.current = true;
  }, [isForcedProfile, selectedStationName]);

  return (
    <ReactFlowProvider>
      <div className="autonerve-layout">
        <div className="col-12 w-100">
          <HeaderSim />
        </div>
      </div>

      <div className="main-container">
        <div className="control-panel">
          {/* <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`toggle-button ${
              isEditMode ? "edit-active" : "view-active"
            }`}
          >
            {isEditMode ? "View Mode" : "Edit Mode"}
          </button> */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
  {isForcedProfile ? (
    <>
      <img
        src={wipro}
        alt="Wipro"
        width={200}
        height={60}
        style={{ objectFit: "contain" }}
      />
      <button
        onClick={() => navigate("/preventive-maintanence")}
        className="header-button"
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #ddd",
          background: "#f5f5f5",
          cursor: "pointer",
        }}
      >
        PreventiveMaintanence
      </button>
    </>
  ) : null}

  <button
    onClick={() => setIsEditMode(!isEditMode)}
    className={`toggle-button ${isEditMode ? "edit-active" : "view-active"}`}
  >
    {isEditMode ? "View Mode" : "Edit Mode"}
  </button>
</div>


          {isEditMode ? (
            <>
              <button onClick={handleCreateNew} className="new-station-button">
                + New Station
              </button>
              <Iconbar onFileDrop={handleFileDrop} />
            </>
          ) : (
            // <div className="saved-stations-list">
            //   {savedStations.length > 0 ? (
            //     savedStations.map((name) => (
            //       <button
            //         key={name}
            //         onClick={() => handleSelectStation(name)}
            //         className={`station-list-item ${
            //           name === selectedStationName ? "active" : ""
            //         }`}
            //       >
            //         {name}
            //       </button>
            //     ))
            //   ) : (
            //     <p className="no-stations-message">
            //       No saved stations. Create a new one!
            //     </p>
            //   )}
            // </div>
            <>
            {isForcedProfile ? null : (
  <div className="saved-stations-list">
    {savedStations.length > 0 ? (
      savedStations.map((name) => (
        <button
          key={name}
          onClick={() => handleSelectStation(name)}
          className={`station-list-item ${name === selectedStationName ? "active" : ""}`}
        >
          {name}
        </button>
      ))
    ) : (
      <p className="no-stations-message">No saved stations. Create a new one!</p>
    )}
  </div>
)}
            </>

          )}
        </div>

        <CanvasComponent
          selectedStationName={selectedStationName}
          onStationNameChange={setSelectedStationName}
          isEditMode={isEditMode}
          onToggleEditMode={setIsEditMode}
          onStationDeleted={() => setSelectedStationName(null)}
          draggedFileRef={draggedFileRef}
          clearDraggedFile={clearDraggedFile}
          ownerUserNameOverride={isForcedProfile ? "KIMS027" : undefined}
        />
      </div>

      <RunTime />
    </ReactFlowProvider>
  );
}

export default AutonerveLayout;
