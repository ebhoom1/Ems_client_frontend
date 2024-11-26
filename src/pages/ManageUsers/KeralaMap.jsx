import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserLatestByUserName } from "../../redux/features/userLog/userLogSlice";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spinner } from "react-bootstrap"; // Import a spinner component

const KeralaMap = ({ users }) => {
  const dispatch = useDispatch();
  const latestUser = useSelector((state) => state.userLog.latestUser);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state

  const defaultPosition = [10.8505, 76.2711]; // Center position of Kerala

  const greenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  const handleMarkerClick = (user) => {
    setSelectedUser(user.userName);
    setLoading(true); // Start loading state
    dispatch(fetchUserLatestByUserName(user.userName)).then(() => {
      setLoading(false); // Stop loading state once data is fetched
    });
  };

  return (
    <MapContainer center={defaultPosition} zoom={7} style={{ height: "600px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.ebhoom.com/">Ebhoom Solutions</a> contributors'
      />
      {users && users.length > 0 &&
        users
          .filter((user) => user.userType === "user")
          .map((user) => {
            const userIoT = selectedUser === user.userName && !loading ? latestUser : null; // Only show data if not loading
            const isHealthy = userIoT && userIoT.validationStatus === "Valid";
            const analyzerHealth = userIoT?.validationMessage || (isHealthy ? "Good" : "Problem");

            return (
              <Marker
                key={user._id}
                position={[user.latitude, user.longitude]}
                icon={isHealthy ? greenIcon : redIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(user),
                }}
              >
                <Popup maxWidth={500} minWidth={300}>
                  <div style={styles.popupContainer}>
                    {loading ? (
                      <div style={styles.spinnerContainer}>
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : (
                      <>
                        <h5>User ID: {user.userName}</h5>
                        <p>Company Name: <strong>{user.companyName}</strong></p>
                        <p>Analyzer Health: <strong>{analyzerHealth}</strong></p>
                        {userIoT && (
                          <div style={styles.scrollContainer}>
                            <div style={styles.cardContainer}>
                              {userIoT.stackData.map((stack) => (
                                <div key={stack._id} style={styles.stackContainer}>
                                  <h6 className="text-center">{stack.stackName}</h6>
                                  {Object.entries(stack).map(([key, value]) => (
                                    key !== "_id" && key !== "stackName" && ( // Exclude "_id" and "stackName"
                                      <div key={key} style={styles.valueCard}>
                                        <strong>{key}:</strong> {value !== null ? value : "N/A"}
                                      </div>
                                    )
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
    </MapContainer>
  );
};

const styles = {
  popupContainer: {
    maxWidth: "100%", // Adjust popup width
    overflow: "auto",
  },
  spinnerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100px",
  },
  scrollContainer: {
    maxHeight: "400px", // Increase the height of the scrollable area
    overflowY: "auto",  // Enable vertical scrolling
  },
  cardContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
  },
  stackContainer: {
    width: "100%",
    padding: "10px",
    borderBottom: "1px solid #dee2e6",
    textAlign: "center",
  },
  valueCard: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "5px",
    padding: "10px",
    margin: "5px 0",
    width: "100%", // Full width for each value card
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
};

export default KeralaMap;