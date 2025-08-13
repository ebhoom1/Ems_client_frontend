// import React, { useState, useEffect, useRef } from "react";
// import { useSelector } from "react-redux";
// import { ReactFlowProvider } from "reactflow";
// import CanvasComponent from "./CanvasComponent";
// import Iconbar from "./Iconbar";
// import "./AutonerveLayout.css";
// import HeaderSim from "../pages/Header/Hedaer";
// import RunTime from "../pages/LiveMapping/RunningTime";
// import { API_URL } from "../utils/apiConfig";

// function AutonerveLayout() {
//   const { userData } = useSelector((state) => state.user);
//   const [savedStations, setSavedStations] = useState([]);
//   const [selectedStationName, setSelectedStationName] = useState(null);
//   const [isEditMode, setIsEditMode] = useState(false);

//   const draggedFileRef = useRef(null);

//   const handleFileDrop = (file) => {
//     // This function is called by Iconbar when a file is dropped.
//     draggedFileRef.current = file;
//   };

//   const clearDraggedFile = () => {
//     // This function is called by CanvasComponent after the file is uploaded.
//     draggedFileRef.current = null;
//   };

//   useEffect(() => {
//     const fetchStations = async () => {
//       const userName = userData?.validUserOne?.userName;
//       if (!userName) return;

//       try {
//         const response = await fetch(
//           `${API_URL}/api/live-stations/${userName}`
//         );
//         const result = await response.json();
//         console.log("livestation fetch result:", result);
//         if (response.ok) {
//           setSavedStations(result.data.map((station) => station.stationName));
//         } else {
//           console.error("Error fetching stations:", result.message);
//         }
//       } catch (error) {
//         console.error("Network error fetching stations:", error);
//       }
//     };
//     fetchStations();
//   }, [userData]);

//   const handleSelectStation = (stationName) => {
//     console.log("clicked");
//     setSelectedStationName(stationName);
//     console.log("selectedStationName:", selectedStationName);
//     setIsEditMode(false);
//   };

//   const handleCreateNew = () => {
//     setSelectedStationName(null);
//     setIsEditMode(true);
//   };

//   return (
//     <ReactFlowProvider>
//       <div className="col-12 w-100">
//         <HeaderSim />
//       </div>
//       <div className="main-container">
//         <div className="control-panel">
//           {/* View/Edit Mode Toggle */}
//           <button
//             onClick={() => setIsEditMode(!isEditMode)}
//             className={`toggle-button ${
//               isEditMode ? "edit-active" : "view-active"
//             }`}
//           >
//             {isEditMode ? "View Mode" : "Edit Mode"}
//           </button>

//           {isEditMode ? (
//             <>
//               <button onClick={handleCreateNew} className="new-station-button">
//                 + New Station
//               </button>

//               <Iconbar onFileDrop={handleFileDrop} />
//             </>
//           ) : (
//             <div className="saved-stations-list">
//               {savedStations.length > 0 ? (
//                 savedStations.map((name) => (
//                   <button
//                     key={name}
//                     onClick={() => handleSelectStation(name)}
//                     className={`station-list-item ${
//                       name === selectedStationName ? "active" : ""
//                     }`}
//                   >
//                     {name}
//                   </button>
//                 ))
//               ) : (
//                 <p className="no-stations-message">
//                   No saved stations. Create a new one!
//                 </p>
//               )}
//             </div>
//           )}
//         </div>

//         <CanvasComponent
//           selectedStationName={selectedStationName}
//           onStationNameChange={setSelectedStationName}
//           isEditMode={isEditMode}
//           onToggleEditMode={setIsEditMode}
//           onStationDeleted={() => setSelectedStationName(null)}
//           draggedFileRef={draggedFileRef}
//           clearDraggedFile={clearDraggedFile}
//         />
//       </div>
//       <RunTime />
//     </ReactFlowProvider>
//   );
// }

// export default AutonerveLayout;



import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { ReactFlowProvider } from "reactflow";
import CanvasComponent from "./CanvasComponent";
import Iconbar from "./Iconbar";
import "./AutonerveLayout.css";
import HeaderSim from "../pages/Header/Hedaer";
import RunTime from "../pages/LiveMapping/RunningTime";
import { API_URL } from "../utils/apiConfig";

function AutonerveLayout() {
  const { userData } = useSelector((state) => state.user);
  const [savedStations, setSavedStations] = useState([]);
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
  useEffect(() => {
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
  }, []);

  const draggedFileRef = useRef(null);
  const handleFileDrop = (file) => { draggedFileRef.current = file; };
  const clearDraggedFile = () => { draggedFileRef.current = null; };

  useEffect(() => {
    const fetchStations = async () => {
      const loggedInUserName = userData?.validUserOne?.userName;
      const userType = userData?.validUserOne?.userType;

      let effectiveUserName = loggedInUserName;
      if (String(userType).toLowerCase() === "admin") {
        // prefer selectedUserId from state
        effectiveUserName = selectedUserId || loggedInUserName;
      }

      if (!effectiveUserName) return;

      try {
        const response = await fetch(`${API_URL}/api/live-stations/${effectiveUserName}`);
        const result = await response.json();
        console.log("livestation fetch result:", result);

        if (response.ok && Array.isArray(result?.data)) {
          setSavedStations(result.data.map((s) => s.stationName).filter(Boolean));
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
  }, [userData, selectedUserId]); // 🔸 re-fetch when header selection changes

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
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`toggle-button ${isEditMode ? "edit-active" : "view-active"}`}
          >
            {isEditMode ? "View Mode" : "Edit Mode"}
          </button>

          {isEditMode ? (
            <>
              <button onClick={handleCreateNew} className="new-station-button">
                + New Station
              </button>
              <Iconbar onFileDrop={handleFileDrop} />
            </>
          ) : (
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
        </div>

        <CanvasComponent
          selectedStationName={selectedStationName}
          onStationNameChange={setSelectedStationName}
          isEditMode={isEditMode}
          onToggleEditMode={setIsEditMode}
          onStationDeleted={() => setSelectedStationName(null)}
          draggedFileRef={draggedFileRef}
          clearDraggedFile={clearDraggedFile}
        />
      </div>

      <RunTime />
    </ReactFlowProvider>
  );
}

export default AutonerveLayout;
