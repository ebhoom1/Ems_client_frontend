// pages/MapView.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapView = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { latitude, longitude, username, companyName, userRole } = state || {};

  const icon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  if (!latitude || !longitude) {
    return (
      <div className="container mt-4">
        <h3>Location not available</h3>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>← Back</button>
      <h3>User Location: {username}</h3>
      <MapContainer center={[latitude, longitude]} zoom={15} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />
        <Marker position={[latitude, longitude]} icon={icon}>
          <Popup>
            <div>
              <strong>{username}</strong><br />
              {companyName}<br />
              Role: {userRole}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;
