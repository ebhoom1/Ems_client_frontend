import React, { useState, useEffect } from "react";
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
  console.log("userdata respone ", userData);
  const productId = userData?.validUserOne?.productID;
  const [isEditMode, setIsEditMode] = useState(false);
  const [stationsList, setStationsList] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [socket, setSocket] = useState(null);
  const [pumpStates, setPumpStates] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("https://api.ocems.ebhoom.com", {
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    setSocket(newSocket);

    const handleConnect = () => {
      console.log("Connected to socket server");
      setSocketConnected(true);
      newSocket.emit("joinRoom", { product_id: productId }); // Changed to 27 to match your logs
    };

    const handleDisconnect = () => {
      console.log("Disconnected from socket server");
      setSocketConnected(false);
    };

    const handlePumpAcknowledgment = (ackData) => {
      console.log("Processing acknowledgment:", ackData);

      if (!ackData.pumps) return;

      // Create a map of updated pumps for batch state update
      const updates = {};

      ackData.pumps.forEach((pump) => {
        // Handle both numeric (1/0) and string ('ON'/'OFF') status values
        const newStatus =
          pump.status === 1 || pump.status === "ON" || pump.status === "on";

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

      // Debug log to verify updates
      console.log("Applied pump state updates:", updates);
    };

    // Error handler with automatic reconnection
    const handleError = (error) => {
      console.error("Socket error:", error);
      if (!socketConnected) {
        setTimeout(() => newSocket.connect(), 2000);
      }
    };

    // Setup all event listeners
    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("pumpAck", handlePumpAcknowledgment);
    newSocket.on("pumpStateUpdate", handlePumpAcknowledgment);
    newSocket.on("error", handleError);

    return () => {
      // Cleanup all event listeners
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("pumpAck", handlePumpAcknowledgment);
      newSocket.off("pumpStateUpdate", handlePumpAcknowledgment);
      newSocket.off("error", handleError);
      newSocket.disconnect();
    };
  }, []); // Empty dependency array ensures this runs once on mount // Empty dependency array ensures this runs once on mount

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
        product_id: productId, // Consistent with acknowledgment messages
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

  const fetchUsers = async () => {
    try {
      if (userData?.validUserOne) {
        let response;
        if (userData.validUserOne.adminType) {
          response = await axios.get(
            `${API_URL}/api/get-users-by-adminType/${userData.validUserOne.adminType}`
          );
          console.log("responnse", response);
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

        // Log the parent user object
        console.log("Parent user object (creatorRes):", creatorRes);

        targetUserName = creatorRes?.userName;
        console.log("Fetched creator’s userName for operator:", targetUserName);
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

    // Log the raw array of station objects
    console.log("Stations array payload:", response.data.data);

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
                {!socketConnected && (
                  <div className="alert alert-warning mb-0">
                    Connection to pump control server is offline
                  </div>
                )}
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