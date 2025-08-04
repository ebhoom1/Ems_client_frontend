import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sidebar from "./SideBar";
import Canvas from "./Canvas";
import DashboardSam from "../Dashboard/DashboardSam";
import { useNavigate } from "react-router-dom";
import RunningTime from "./RunningTime";
import Chemicals from "./Chemicals";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import HeaderSim from "../Header/HeaderSim";
import io from 'socket.io-client';

function LIveLayout() {
  const { userData } = useSelector((state) => state.user);
  console.log('userdata respone ', userData)
 const productId = String(userData?.validUserOne?.productID || '');
   const [isEditMode, setIsEditMode] = useState(false);
  const [stationsList, setStationsList] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [socket, setSocket] = useState(null);
  const [pumpStates, setPumpStates] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);
  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('https://api.ocems.ebhoom.com', {
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });
  
    setSocket(newSocket);
  
    const handleConnect = () => {
      console.log('Connected to socket server');
      setSocketConnected(true);
      newSocket.emit('joinRoom', { product_id: productId }); // Changed to 27 to match your logs
    };
  
    const handleDisconnect = () => {
      console.log('Disconnected from socket server');
      setSocketConnected(false);
    };
  
// In LIveLayout.jsx



// In LIveLayout.jsx

// In LIveLayout.jsx

// Enhanced handlePumpAcknowledgment function in LiveLayout.jsx
// In LIveLayout.jsx

const handlePumpAcknowledgment = (ackData) => {
   console.log('🔴 RAW DATA FROM SERVER:', ackData); 
  console.log('✅ Received acknowledgment from server:', ackData);
  
  if (!ackData?.pumps) return;
  
  setPumpStates(currentStates => {
    const updatedStates = { ...currentStates };
    
    ackData.pumps.forEach((pump) => {
      if (!pump.pumpId) return;

      // PRESERVE the original status as string - don't convert to boolean
      const originalStatus = pump.status; // Keep as "ON" or "OFF"
      
      console.log(`💡 Processing pump data for [${pump.pumpId}]:`, pump);
      console.log(`   - Original Status: ${originalStatus}`);
      console.log(`   - Sensor Data: Current=${pump.current}, Voltage=${pump.voltage}, Vibration=${pump.vibration}`);
      
      // Keep ALL data and preserve the original status
      updatedStates[pump.pumpId] = {
        ...currentStates[pump.pumpId], 
        ...pump,                      
        status: originalStatus,  // Keep original "ON"/"OFF" - DON'T convert to boolean
        pending: false,
        lastUpdated: new Date().toISOString(),
        pumpName: pump.pumpName || currentStates[pump.pumpId]?.name || 'Unknown'
      };
    });

    console.log('📊 LiveLayout - Final updated pump states:', updatedStates);
    return updatedStates;
  });
};
  
    // Error handler with automatic reconnection
    const handleError = (error) => {
      console.error('Socket error:', error);
      if (!socketConnected) {
        setTimeout(() => newSocket.connect(), 2000);
      }
    };
  
    // Setup all event listeners
    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('pumpAck', handlePumpAcknowledgment);
    newSocket.on('pumpStateUpdate', handlePumpAcknowledgment);
    newSocket.on('error', handleError);
  
    return () => {
      // Cleanup all event listeners
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('pumpAck', handlePumpAcknowledgment);
      newSocket.off('pumpStateUpdate', handlePumpAcknowledgment);
      newSocket.off('error', handleError);
      newSocket.disconnect();
    };
  }, []); // Empty dependency array ensures this runs once on mount // Empty dependency array ensures this runs once on mount

 // In LIveLayout.jsx

// In LIveLayout.jsx

const handlePumpToggle = (pumpId, pumpName, newStatus, isPending = false) => {
    if (!socket || !socketConnected) {
      console.error('Socket not connected, cannot send command.');
      return;
    }
  
    // Update local state immediately, PRESERVING existing details
    setPumpStates(prev => ({
      ...prev,
      [pumpId]: {
        ...prev[pumpId], // <-- KEEP existing details (current, temp, etc.)
        status: newStatus, // <-- Keep as "ON"/"OFF" string
        pending: isPending,
        name: pumpName,
        lastUpdated: new Date().toISOString()
      }
    }));
  
    // Only send the command to the server if a state change was requested
    if (isPending) {
      const statusCommand = newStatus; // Use the status directly since it's already "ON" or "OFF"
      const messageId = `cmd-${Date.now()}`;
  
      const command = {
        product_id: productId,
        pumps: [{
          pumpId,
          pumpName,
          status: statusCommand 
        }],
        timestamp: new Date().toISOString(),
        messageId
      };
  
      console.log('🚀 Sending pump control command:', command);
      socket.emit('controlPump', command);
    }
};

  const fetchUsers = async () => {
    try {
      if (userData?.validUserOne) {
        let response;
        if (userData.validUserOne.adminType) {
          response = await axios.get(
            `${API_URL}/api/get-users-by-adminType/${userData.validUserOne.adminType}`
            
          );
          console.log('responnse', response);
          
        } else {
          response = await axios.get(`${API_URL}/api/getallusers`);
        }
        const filteredUsers = response.data.users.filter(
          (user) => user.userType === "user"
        );
        setUsers(filteredUsers);
        if (filteredUsers.length > 0) {
          setSelectedUser(filteredUsers[0].userName);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchStationsList = async () => {
    try {
      let currentUser = "";
      if (userData?.validUserOne?.userType === "admin") {
        currentUser =
          selectedUser || sessionStorage.getItem("selectedUserId") || "";
      } else {
        currentUser = userData?.validUserOne?.userName;
      }
      const response = await axios.get(
        `${API_URL}/api/live-stations/${selectedUser}`
      );
      setStationsList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching stations list:", error);
    }
  };

  useEffect(() => {
    if (userData?.validUserOne?.userType === "admin") {
      fetchUsers();
    } else {
      setSelectedUser(userData?.validUserOne?.userName);
    }
  }, [userData]);

  useEffect(() => {
    fetchStationsList();
  }, [userData, selectedUser]);

  const handleStationClick = (station) => {
    setSelectedStation(station);
  };

  const handleAddStation = () => {
    setSelectedStation(null);
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleHowtoUse = () => {
    navigate("/how-to-use");
  };

  return (
<DndProvider backend={HTML5Backend}>
  <div className="container-fluid">
    <div className="row" style={{ backgroundColor: "white" }}>
     
      <div className="col-lg-12 col-12">
        <div className="row">
          <div className="col-12">
            <HeaderSim />
           {/*  {!socketConnected && (
              <div className="alert alert-warning mb-0">
                Connection to pump control server is offline
              </div>
            )} */}
          </div>
        </div>
        
      
        

        <div>

        </div>
        <div>
          <div className="row" style={{ overflowX: "hidden" }}>
            
          <div className="row align-items-center" style={{ overflowX: "hidden" }}>
  {/* 1) Admin selector – col-3 */}
  <div className="col-md-3">
    {userData?.validUserOne?.userType === "admin" && (
      <div>
        <label>Select User:</label>
        <select
          className="form-select"
          value={selectedUser}
          onChange={handleUserChange}
        >
          {users.map((user) => (
            <option key={user.userName} value={user.userName}>
              {user.companyName} ({user.userName})
            </option>
          ))}
        </select>
      </div>
    )}
  </div>

  {/* 2) Title – col-6 centered */}
  <div className="col-md-6 text-center">
    <h5><b>AutoNerve</b></h5>
  </div>

  {/* 3) Stations table – col-3 */}
  <div className="col-md-3">
    {stationsList && stationsList.length > 0 ? (
      <div className="table-responsive">
        <table className="table table-bordered mb-0">
          <thead>
            <tr style={{ backgroundColor: "#236a80", color: "#fff" }}>
            
              <th>Station Name</th>
            </tr>
          </thead>
          <tbody>
            {stationsList.map((station) => (
              <tr
                key={station._id}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  handleStationClick({
                    userName: station.userName,
                    stationName: station.stationName,
                  })
                }
              >
              
                <td>{station.stationName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center text-danger">
        <h5>No live stations available. Please create one.</h5>
      </div>
    )}
  </div>
</div>

              <div className="cardn m-">
                <div className="card-body">
                  {isEditMode ? (
                    <>
                      {/* Row 1: full-width sidebar */}
                      <div className="row mb-3">
                        <div className="col-12">
                          <Sidebar />
                        </div>
                      </div>
                      
                      {/* Row 2: canvas + button */}
                      <div className="row">
                        <div className="col-12">
                          <div
                            className="shadow"
                            style={{
                              overflowX: "auto",
                              WebkitOverflowScrolling: "touch",
                              width: "100%",
                              minHeight: "500px",
                            }}
                          >
                            <div
                              style={{
                                minWidth: "100%",
                                width: "100%",
                                padding: "10px",
                              }}
                            >
                              <Canvas
                                key={
                                  selectedStation
                                    ? selectedStation.stationName
                                    : "new"
                                }
                                selectedStation={selectedStation}
                                isEditMode={isEditMode}
                                setIsEditMode={setIsEditMode}
                                socket={socket}
                                socketConnected={socketConnected}
                                pumpStates={pumpStates}
                                onPumpToggle={handlePumpToggle}
                              />
                            </div>
                          </div>
                          <button
                            className="btn btn-success mb-2 mt-2 d-flex justify-content-end align-items-center"
                            onClick={handleAddStation}
                          >
                            Add another station +
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* View mode: just canvas + button */}
                      <div className="row">
                        <div className="col-12">
                          <div
                            className="shadow"
                            style={{
                              overflowX: "auto",
                              WebkitOverflowScrolling: "touch",
                              width: "100%",
                              minHeight: "500px",
                            }}
                          >
                            <div
                              style={{
                                minWidth: "100%",
                                width: "100%",
                                padding: "10px",
                              }}
                            >
                              <Canvas
                                key={
                                  selectedStation
                                    ? selectedStation.stationName
                                    : "new"
                                }
                                selectedStation={selectedStation}
                                isEditMode={isEditMode}
                                setIsEditMode={setIsEditMode}
                                socket={socket}
                                socketConnected={socketConnected}
                                pumpStates={pumpStates}
                                onPumpToggle={handlePumpToggle}
                              />
                            </div>
                          </div>
                          <button
                            className="btn btn-success mb-2 mt-2 d-flex justify-content-end align-items-center"
                            onClick={handleAddStation}
                          >
                            Add another station +
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* RunningTime stays below */}
                  <div className="row">
                    <div className="col-md-12">
                      <RunningTime />
                    </div>
                  </div>
                </div>
              </div>
              
       
          </div>
        </div>
      </div>
      
      <footer className="footer">
        <div className="container-fluid clearfix">
          <span className="text-muted d-block text-center text-sm-left d-sm-inline-block"></span>
          <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
            AquaBox Control and Monitor System <br />©{" "}
            <a
              href="https://ebhoom.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ebhoom
            </a>{" "}
            2022
          </span>
        </div>
      </footer>
    </div>
  </div>
</DndProvider>

  );
}

export default LIveLayout;
