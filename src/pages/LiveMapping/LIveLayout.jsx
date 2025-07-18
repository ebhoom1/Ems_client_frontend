import React, { useState, useEffect, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sidebar from "./SideBar";
import Canvas from "./Canvas";
import { useDispatch } from "react-redux";
import { fetchUserById } from "../../redux/features/userLog/userLogSlice";
import DashboardSam from "../Dashboard/DashboardSam";
import { useNavigate } from "react-router-dom";
import RunningTime from "./RunningTime";
import Chemicals from "./Chemicals";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import HeaderSim from "../Header/HeaderSim";
import io from "socket.io-client";

function LIveLayout() {
  const { userData } = useSelector((state) => state.user);
  const [isEditMode, setIsEditMode] = useState(false);
  const [stationsList, setStationsList] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [socket, setSocket] = useState(null);
  const [pumpStates, setPumpStates] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);
  const [liveTankData, setLiveTankData] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const productId = userData?.validUserOne?.productID;
  let currentProductId = productId;
  if (userData?.validUserOne?.userType === "admin" && selectedUser) {
    const selectedUserObj = users.find((u) => u.userName === selectedUser);
    if (selectedUserObj && selectedUserObj.productID) {
      currentProductId = selectedUserObj.productID;
    }
  }

  // Initialize socket connection
  useEffect(() => {
    if (!currentProductId) return; // Don't connect if no productId
  
    const newSocket = io("https://api.ocems.ebhoom.com", {
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
      transports: ['websocket'], // Force WebSocket transport for better reliability
      query: {
        productId: currentProductId,
        userType: userData?.validUserOne?.userType || 'user'
      }
    });
  
    setSocket(newSocket);
    console.log('Socket initialized for product:', currentProductId);
  
    // Socket event handlers
    const handleConnect = () => {
      console.log('✅ Socket connected:', newSocket.id);
      setSocketConnected(true);
      // Join room with productId (as string to match backend expectation)
      newSocket.emit('joinRoom', currentProductId.toString());
      console.log(`Joined room for productId: ${currentProductId}`);
    };
  
    const handleDisconnect = (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setSocketConnected(false);
      if (reason === 'io server disconnect') {
        // Try to reconnect manually if server disconnects us
        setTimeout(() => newSocket.connect(), 1000);
      }
    };
  
    const handleError = (error) => {
      console.error('Socket error:', error);
    };
  
    const handlePumpAcknowledgment = (ackData) => {
      console.log('🔧 Processing acknowledgment:', ackData);
      if (!ackData.pumps) return;
  
      // Create a map of updated pumps for batch state update
      const updates = {};
      ackData.pumps.forEach((pump) => {
        const newStatus = pump.status === 1 || pump.status === 'ON' || pump.status === 'on';
        updates[pump.pumpId] = {
          status: newStatus,
          pending: false,
          name: pump.pumpName || `Pump ${pump.pumpId}`,
          lastUpdated: new Date().toISOString(),
        };
      });
  
      // Batch update all pump states at once
      setPumpStates((prev) => ({
        ...prev,
        ...updates,
      }));
      console.log('🔧 Applied pump state updates:', updates);
    };
  
    const handleTankData = (payload) => {
      console.log('💧 Received tank payload:', payload);
      if (payload?.tankData) {
        // Transform tank data to ensure consistent format
        const tanks = payload.tankData.map(t => ({
          tankName: t.tankName?.trim() || '',
          percentage: parseFloat(t.percentage ?? t.depth ?? 0),
          level: parseFloat(t.level ?? t.depth ?? 0),
          stackName: t.stackName || '',
          timestamp: t.timestamp || new Date().toISOString()
        }));
        setLiveTankData(tanks);
      }
    };
  
    const handleReconnectAttempt = (attempt) => {
      console.log(`Attempting to reconnect (${attempt})...`);
    };
  
    // Setup all event listeners
    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('error', handleError);
    newSocket.on('pumpAck', handlePumpAcknowledgment);
    newSocket.on('pumpStateUpdate', handlePumpAcknowledgment);
    newSocket.on('data', handleTankData);
    newSocket.on('reconnect_attempt', handleReconnectAttempt);
  
    // Initial connection
    newSocket.connect();
  
    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket connection');
      // Remove all listeners
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('error', handleError);
      newSocket.off('pumpAck', handlePumpAcknowledgment);
      newSocket.off('pumpStateUpdate', handlePumpAcknowledgment);
      newSocket.off('data', handleTankData);
      newSocket.off('reconnect_attempt', handleReconnectAttempt);
      
      // Disconnect socket
      newSocket.disconnect();
      setSocketConnected(false);
    };
  }, [currentProductId]); // Reconnect when productId changes// Empty dependency array ensures this runs once on mount // Empty dependency array ensures this runs once on mount

  const handlePumpToggle = (pumpId, pumpName, status, isPending = false) => {
    if (!socket || !socketConnected) {
      console.error("Socket not connected");
      return;
    }

    // Update local state immediately
    setPumpStates((prev) => ({
      ...prev,
      [pumpId]: {
        status: status === "ON",
        pending: isPending,
        name: pumpName,
        lastUpdated: new Date().toISOString(),
      },
    }));

    // Only send command if not pending (pending is set by SVGNode)
    if (!isPending) {
      const statusValue = status === "ON" ? 1 : 0;
      const messageId = `cmd-${Date.now()}`;

      const command = {
        product_id: currentProductId,
        pumps: [
          {
            pumpId,
            pumpName,
            status: statusValue,
          },
        ],
        timestamp: new Date().toISOString(),
        messageId,
      };

      console.log("Sending pump command:", command);
      socket.emit("controlPump", command);
    }
  };

 const fetchUsers = useCallback(async () => {
  try {
    const currentUser = userData?.validUserOne;
    if (!currentUser) {
      setUsers([]);
      return;
    }

    let response;

    if (currentUser.adminType === "EBHOOM") {
      response = await axios.get(`${API_URL}/api/getallusers`);
      const fetched = response.data.users || [];
      setUsers(fetched.filter(u => !u.isTechnician && !u.isTerritorialManager && !u.isOperator));
    } 
    else if (currentUser.userType === "super_admin") {
      response = await axios.get(`${API_URL}/api/getallusers`);
      const fetched = response.data.users || [];
      const myAdmins = fetched.filter(u => u.createdBy === currentUser._id && u.userType === "admin");
      const adminIds = myAdmins.map(a => a._id.toString());
      const allowed = fetched.filter(u => u.createdBy === currentUser._id || adminIds.includes(u.createdBy));
      setUsers(allowed.filter(u => !u.isTechnician && !u.isTerritorialManager && !u.isOperator));
    } 
    else if (currentUser.userType === "admin") {
      response = await axios.get(`${API_URL}/api/get-users-by-creator/${currentUser._id}`);
      const fetched = response.data.users || [];
      setUsers(fetched.filter(u => u.userType === "user"));
    } 
    else {
      setUsers([]);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    setUsers([]);
  }
}, [userData]);

useEffect(() => {
  if (userData?.validUserOne?.userType === "admin" || userData?.validUserOne?.userType === "super_admin") {
    fetchUsers();
  } else {
    setSelectedUser(userData?.validUserOne?.userName || "");
  }
}, [userData, fetchUsers]);


  // const fetchStationsList = async () => {
  //   try {
  //     let currentUser = "";
  //     if (userData?.validUserOne?.userType === "admin") {
  //       currentUser =
  //         selectedUser || sessionStorage.getItem("selectedUserId") || "";
  //     } else {
  //       currentUser = userData?.validUserOne?.userName;
  //     }
  //     const response = await axios.get(
  //       `${API_URL}/api/live-stations/${selectedUser}`
  //     );
  //     setStationsList(response.data.data || []);
  //   } catch (error) {
  //     console.error("Error fetching stations list:", error);
  //   }
  // };

  const fetchStationsList = async () => {
    try {
      let targetUserName = "";
      const currentUser = userData?.validUserOne;

      if (!currentUser) return;

      if (currentUser.userType === "admin") {
        targetUserName =
          selectedUser || sessionStorage.getItem("selectedUserId") || "";
      } else if (currentUser.userType === "operator" && currentUser.createdBy) {
        try {
          const creatorRes = await dispatch(
            fetchUserById(currentUser.createdBy)
          ).unwrap();
          console.log("creatorRes:", creatorRes);
          targetUserName = creatorRes?.userName;
          console.log(
            "Fetched creator's userName for operator:",
            targetUserName
          );
        } catch (err) {
          console.warn(
            "Failed to fetch creator for operator. Falling back to current user."
          );
          targetUserName = currentUser?.userName;
        }
      } else {
        targetUserName = currentUser?.userName;
      }

      if (!targetUserName) {
        console.error("No valid userName found to fetch stations.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/live-stations/${targetUserName}`
      );
      setStationsList(response.data.data || []);
      console.log("Live stations fetched for:", targetUserName);
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

  // Add this before rendering Canvas
  console.log('Selected user:', selectedUser);
  const selectedUserObj = users.find((u) => u.userName === selectedUser);
  console.log('Selected user object:', selectedUserObj);
  console.log('Current productId used for Canvas:', currentProductId);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container-fluid">
        <div className="row" style={{ backgroundColor: "white" }}>
          <div className="col-lg-3 d-none d-lg-block">
            <DashboardSam />
          </div>

          <div className="col-lg-9 col-12">
            <div className="row">
              <div className="col-12">
                <HeaderSim />
                {/* {!socketConnected && (
                  <div className="alert alert-warning mb-0">
                    Connection to pump control server is offline
                  </div>
                )} */}
              </div>
            </div>

            <div></div>
            <div>
              <div className="row" style={{ overflowX: "hidden" }}>
                <div
                  className="row align-items-center"
                  style={{ overflowX: "hidden" }}
                >
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
                    <h5>
                      <b>AutoNerve</b>
                    </h5>
                  </div>

                  {/* 3) Stations table – col-3 */}
                  <div className="col-md-3">
                    {stationsList && stationsList.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-bordered mb-0">
                          <thead>
                            <tr
                              style={{
                                backgroundColor: "#236a80",
                                color: "#fff",
                              }}
                            >
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
                                  productId={currentProductId}
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
                                  productId={currentProductId}
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
