import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const KeralaMap = ({ users }) => {
  const [selectedUser, setSelectedUser] = useState(null);

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
  };

  // Debugging: Log the users received by the map
  console.log("Users received in KeralaMap:", users);

  return (
    <MapContainer center={defaultPosition} zoom={7} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.ebhoom.com/">Ebhoom Solutions</a> contributors'
      />
      {users
        .filter((user) => user.latitude && user.longitude) // Ensure valid coordinates
        .map((user) => {
          const isHealthy = user["Analyzer Health"] === "Good"; // Example health status logic

          return (
            <Marker
              key={user._id}
              position={[user.latitude, user.longitude]}
              icon={isHealthy ? greenIcon : redIcon}
              eventHandlers={{
                click: () => handleMarkerClick(user),
              }}
            >
              <Popup>
                <div>
                  <h5>User ID: {user.userName}</h5>
                  <p>Company Name: <strong>{user.companyName}</strong></p>
                  <p>Model Name: <strong>{user.modelName}</strong></p>
                  <p>Admin Type: <strong>{user.adminType}</strong></p>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
};

export default KeralaMap;
