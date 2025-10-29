import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { ReactFlowProvider } from "reactflow";
import CanvasComponent from "./CanvasComponent";
import Iconbar from "./Iconbar";
import "./AutonerveLayout.css";
import HeaderSim from "../pages/Header/Hedaer";
import RunTime from "../pages/LiveMapping/RunningTime";
import { API_URL } from "../utils/apiConfig";
import wipro from "../assests/images/wipro.png";
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

  const [selectedStationName, setSelectedStationName] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const expoProductId = 41;

  // 🔹 Track the selected user from sessionStorage
  const [selectedUserId, setSelectedUserId] = useState(() => {
    try {
      return sessionStorage.getItem("selectedUserId") || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handler = () => {
      try {
        const v = sessionStorage.getItem("selectedUserId") || null;
        console.log("🔄 Header change detected:", v);
        setSelectedUserId(v);
        setSavedStations([]); // <-- reset station list
        setSelectedStationName(null); // <-- clear selected station
      } catch {
        setSelectedUserId(null);
      }
    };

    window.addEventListener("selectedUserIdChanged", handler);
    return () => window.removeEventListener("selectedUserIdChanged", handler);
  }, []);

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
      console.log("selectedUserId**:", selectedUserId);

      // 👇 New effective username logic
      let effectiveUserName = selectedUserId || loggedIn;

      // 🔹 Special handling based on selectedUserId
      if (selectedUserId === "CONTI") {
        effectiveUserName = "EXPO_USER"; // Show EXPO_USER’s stations instead
      } else if (selectedUserId === "WTCANX") {
        effectiveUserName = "WTCANX"; // Use WTCANX’s own stations
      }

      console.log("effectiveUserName:", effectiveUserName);
      if (!effectiveUserName) return;

      try {
        const response = await fetch(
          `${API_URL}/api/live-stations/${effectiveUserName}`
        );
        const result = await response.json();
        console.log("livestation fetch result:", result);

        if (response.ok && Array.isArray(result?.data)) {
          const stations = result.data
            .map((s) => s.stationName)
            .filter(Boolean);
          let filteredStations = stations;

          // 🔹 Apply filtering rules
          if (selectedUserId === "CONTI") {
            // Show EXPO_USER’s “STATION 1” only
            filteredStations = stations.filter((n) => n === "STATION 1");
          } else if (selectedUserId === "WTCANX") {
            // Show WTCANX’s “WTC Station New” only
            filteredStations = stations.filter((n) => n === "WTC Station New");
          }

          setSavedStations(filteredStations);
        } else {
          console.error(
            "Error fetching stations:",
            result?.message || "Unknown error"
          );
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

  return (
    <ReactFlowProvider>
      <div className="autonerve-layout">
        <div className="col-12 w-100">
          <HeaderSim />
        </div>
      </div>

      <div className="main-container">
        <div className="control-panel">
          {isForcedProfile ? (
            <div className="forced-toolbar-1row">
              {/* LEFT: three buttons (same size) */}
              <div className="forced-left">
               

                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`toggle-button forced-btn ${
                    isEditMode ? "edit-active" : "view-active"
                  }`}
                >
                  {isEditMode ? "View Mode" : "Edit Mode"}
                </button>
                {isEditMode && (
                  <button
                    onClick={handleCreateNew}
                    className="new-station-button forced-btn"
                  >
                    + New Station
                  </button>
                )}

                {/* stations list block below — keep yours unchanged */}
                {!isEditMode && (
                  <div className="saved-stations-list">
                    {savedStations.length > 0 ? (
                      savedStations.map((name) => (
                        <button
                          key={name}
                          onClick={() => handleSelectStation(name)}
                          className={`station-list-item ${
                            name === selectedStationName ? "active" : ""
                          }`}
                        >
                          {name}
                        </button>
                      ))
                    ) : (
                      <p className="no-stations-message">
                        No saved stations. Create a new one!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* CENTER: Iconbar grows, scrolls horizontally if long */}
              <div className="forced-center">
                {isEditMode ? (
                  <div className="forced-iconbar">
                    <Iconbar onFileDrop={handleFileDrop} />
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            /* Non-forced users: keep your existing layout */
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`toggle-button ${
                  isEditMode ? "edit-active" : "view-active"
                }`}
              >
                {isEditMode ? "View Mode" : "Edit Mode"}
              </button>
              {isEditMode && (
                <button
                  onClick={handleCreateNew}
                  className="new-station-button"
                >
                  + New Station
                </button>
              )}

              <div className="forced-center">
                {isEditMode ? (
                  <div className="forced-iconbar">
                    <Iconbar onFileDrop={handleFileDrop} />
                  </div>
                ) : null}
              </div>
              {!isEditMode && (
                <div className="saved-stations-list">
                  {savedStations.length > 0 ? (
                    savedStations.map((name) => (
                      <button
                        key={name}
                        onClick={() => handleSelectStation(name)}
                        className={`station-list-item ${
                          name === selectedStationName ? "active" : ""
                        }`}
                      >
                        {name}
                      </button>
                    ))
                  ) : (
                    <p className="no-stations-message">
                      No saved stations. Create a new one!
                    </p>
                  )}
                </div>
              )}
            </div>
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
          ownerUserNameOverride={
            selectedUserId === "CONTI"
              ? "EXPO_USER"
              : selectedUserId === "WTCANX"
              ? "WTCANX"
              : undefined
          }
          expoProductId={selectedUserId === "CONTI" ? expoProductId : null}
        />
      </div>

      <RunTime />
    </ReactFlowProvider>
  );
}

export default AutonerveLayout;
