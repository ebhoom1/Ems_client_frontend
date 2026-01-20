import React, { useEffect, useState } from "react";
import axios from "axios";
import HLSVideo from "./HLSVideo";
import "./cameraGrid.css";
import { API_URL } from "../../utils/apiConfig";

function MultipleVideo() {
  const [cameras, setCameras] = useState([]);
  const [focusedCam, setFocusedCam] = useState(null);

  useEffect(() => {
  axios.get(`${API_URL}/api/cameras`)
    .then(res => {
      console.log("CAMERA DATA:", res.data.data);
      setCameras(res.data.data || []);
    });
}, []);


  // 🔍 Focus / fullscreen view
  if (focusedCam) {
    return (
      <div className="camera-focus-wrapper">
        <button
          className="btn btn-light back-btn"
          onClick={() => setFocusedCam(null)}
        >
          ← Back
        </button>

        <h3 className="text-center mb-3">{focusedCam.name}</h3>
        <HLSVideo src={focusedCam.hlsUrl} />
      </div>
    );
  }

  // 🧱 Grid view
  return (
    <div className="camera-grid">
      {cameras.map(cam => (
        <div
          key={cam.id}
          className="camera-tile"
          onClick={() => setFocusedCam(cam)}
        >
          <div className="camera-title">{cam.name}</div>
          <HLSVideo src={cam.hlsUrl} />
        </div>
      ))}
    </div>
  );
}

export default MultipleVideo;
