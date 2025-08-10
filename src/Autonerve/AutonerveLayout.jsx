// import React from 'react';
// import { ReactFlowProvider } from 'reactflow';
// import CanvasComponent from './CanvasComponent';
// import Iconbar from './Iconbar';
// import './AutonerveLayout.css';
// import Header from '../pages/Header/Hedaer';
// import HeaderSim from '../pages/Header/HeaderSim';

// function AutonerveLayout() {
//   return (
//     <ReactFlowProvider>
//            <div className='col-12 w-100'>
//          <HeaderSim/>
//        </div>
//       <div className="layout-container">

//         <Iconbar />
//         <CanvasComponent />
//       </div>
//     </ReactFlowProvider>
//   );
// }

// export default AutonerveLayout;

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ReactFlowProvider } from "reactflow";
import CanvasComponent from "./CanvasComponent";
import Iconbar from "./Iconbar";
import "./AutonerveLayout.css";
import HeaderSim from "../pages/Header/HeaderSim";
import { API_URL } from "../utils/apiConfig";

function AutonerveLayout() {
  const { userData } = useSelector((state) => state.user);
  const [savedStations, setSavedStations] = useState([]);
  const [selectedStationName, setSelectedStationName] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      const userName = userData?.validUserOne?.userName;
      if (!userName) return;

      try {
        const response = await fetch(
          `${API_URL}/api/live-stations/${userName}`
        );
        const result = await response.json();
        console.log("livestation fetch result:", result);
        if (response.ok) {
          setSavedStations(result.data.map((station) => station.stationName));
        } else {
          console.error("Error fetching stations:", result.message);
        }
      } catch (error) {
        console.error("Network error fetching stations:", error);
      }
    };
    fetchStations();
  }, [userData]);

  const handleSelectStation = (stationName) => {
    console.log("clicked");
    setSelectedStationName(stationName);
    console.log("selectedStationName:", selectedStationName);
    setIsEditMode(false);
  };

  const handleCreateNew = () => {
    setSelectedStationName(null);
    setIsEditMode(true);
  };

  return (
    <ReactFlowProvider>
      <div className="col-12 w-100">
        <HeaderSim />
      </div>
      <div className="main-container">
        <div className="control-panel">
          {/* View/Edit Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`toggle-button ${
              isEditMode ? "edit-active" : "view-active"
            }`}
          >
            {isEditMode ? "View Mode" : "Edit Mode"}
          </button>

          {isEditMode ? (
            <>
              <button onClick={handleCreateNew} className="new-station-button">
                + New Station
              </button>
              
              <Iconbar />
            </>
          ) : (
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

        <CanvasComponent
          selectedStationName={selectedStationName}
          onStationNameChange={setSelectedStationName}
          isEditMode={isEditMode}
          onToggleEditMode={setIsEditMode}
          onStationDeleted={() => setSelectedStationName(null)}
        />
      </div>
    </ReactFlowProvider>
  );
}

export default AutonerveLayout;
