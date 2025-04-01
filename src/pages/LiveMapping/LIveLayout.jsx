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

function LIveLayout() {
  const { userData } = useSelector((state) => state.user);
  const [stationsList, setStationsList] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const navigate = useNavigate();

  // Function to fetch users based on adminType (or all users)
  const fetchUsers = async () => {
    try {
      if (userData?.validUserOne) {
        let response;
        if (userData.validUserOne.adminType) {
          response = await axios.get(
            `${API_URL}/api/get-users-by-adminType/${userData.validUserOne.adminType}`
          );
        } else {
          response = await axios.get(`${API_URL}/api/getallusers`);
        }
        const filteredUsers = response.data.users.filter(
          (user) => user.userType === "user"
        );
        setUsers(filteredUsers);
        // Set default selected user as the first one from the list, if available
        if (filteredUsers.length > 0) {
          setSelectedUser(filteredUsers[0].userName);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Function to fetch live stations for the given userName
  const fetchStationsList = async () => {
    try {
      let currentUser = "";
      if (userData?.validUserOne?.userType === "admin") {
        // For admin, use the selected user from the dropdown (or fallback to sessionStorage)
        currentUser =
          selectedUser || sessionStorage.getItem("selectedUserId") || "";
      } else {
        currentUser = userData?.validUserOne?.userName;
      }
      // GET /api/live-stations/:userName returns an array of live stations
      const response = await axios.get(
        `${API_URL}/api/live-stations/${selectedUser}`
      );
      setStationsList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching stations list:", error);
    }
  };

  // For admin users, fetch users on mount; otherwise, set selectedUser as their own userName.
  useEffect(() => {
    if (userData?.validUserOne?.userType === "admin") {
      fetchUsers();
    } else {
      setSelectedUser(userData?.validUserOne?.userName);
    }
  }, [userData]);

  // Fetch stations list whenever userData or selectedUser changes
  useEffect(() => {
    fetchStationsList();
  }, [userData, selectedUser]);

  const handleStationClick = (station) => {
    setSelectedStation(station);
  };

  const handleAddStation = () => {
    // Clear the selected station to create a new station (and clear the Canvas)
    setSelectedStation(null);
  };

  // Handle change of user selection from dropdown (for admin)
  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  // Optional: navigate to "how-to-use" page if needed
  const handleHowtoUse = () => {
    navigate("/how-to-use");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container-fluid">
        <div className="row" style={{ backgroundColor: "white" }}>
          {/* Sidebar (hidden on mobile) */}
          <div className="col-lg-3 d-none d-lg-block">
            <DashboardSam />
          </div>
          {/* Main Content */}
          <div className="col-lg-9 col-12">
            <div className="row">
              <div className="col-12">
                <HeaderSim />
              </div>
            </div>
            {userData?.validUserOne?.userType === "admin" && (
              <div className="row my-2">
                <div className="col-3">
                  <label>Select User:</label>
                  <select
                    className="form-select"
                    value={selectedUser}
                    onChange={handleUserChange}
                  >
                    {users.map((user) => (
                      <option key={user.userName} value={user.userName}>
                        {user.userName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div>
              <div className="row" style={{ overflowX: "hidden" }}>
                <div className="col-12 col-md-12 grid-margin">
                  <div className="col-12 d-flex align-items-center justify-content-center m-2">
                    <h1 className="text-center mt-3">Live Station Mapping</h1>
                  </div>
                  {/* Stations List Table displayed in a box */}
                  <div className="mb-3">
                    {stationsList && stationsList.length > 0 ? (
                      <div className="box">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th>User Name</th>
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
                                <td>{station.userName}</td>
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
                  <div className="cardn m-">
                    <div className="card-body">
                      <div className="row">
                        {/* Sidebar for drag-and-drop */}
                        <div className="col-md-3">
                          <Sidebar />
                        </div>
                        {/* Canvas Area */}
                        <div className="col-md-9 shadow">
                          <Canvas
                            key={
                              selectedStation
                                ? selectedStation.stationName
                                : "new"
                            }
                            selectedStation={selectedStation}
                          />
                          <button
                            className="btn btn-success mb-2 mt-2 d-flex justify-content-end align-items-center"
                            onClick={handleAddStation}
                          >
                            Add another station +
                          </button>
                        </div>
                        <div className="row">
                          <div className="col-md-12">
                            <RunningTime />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-12">
                            <Chemicals />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <footer className="footer">
            <div className="container-fluid clearfix">
              <span className="text-muted d-block text-center text-sm-left d-sm-inline-block"></span>
              <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
                AquaBox Control and Monitor System <br />
                ©{" "}
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
