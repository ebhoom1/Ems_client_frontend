import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { Html5QrcodeScanner } from "html5-qrcode";

const ReportFault = ({ onFaultReported, defaultUsername }) => {
  const [scanning, setScanning] = useState(false);
  const [equipmentId, setEquipmentId] = useState("");
  const [equipmentName, setEquipmentName] = useState("");
  const [userName, setUsername] = useState(defaultUsername);
  const [faultDescription, setFaultDescription] = useState("");
  const [reportedDate, setReportedDate] = useState("");
  
  // Photo capture state
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [photoData, setPhotoData] = useState("");   // base64 image
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let streamRef = useRef(null);

  // QR scan callback
  const handleScanResult = async (decodedText) => {
    setScanning(false);
    setEquipmentId(decodedText);

    try {
      const res = await fetch(`${API_URL}/api/equipment/${decodedText}`);
      const data = await res.json();
      if (res.ok && data.equipment) {
        setEquipmentName(data.equipment.equipmentName);
      } else {
        throw new Error("Not found");
      }
    } catch {
      toast.error("Equipment not found");
      setEquipmentId("");
    }
  };

  // Initialize QR scanner
  useEffect(() => {
    if (!scanning) return;
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
    scanner.render(
      (decoded) => { handleScanResult(decoded); scanner.clear(); },
      () => {}
    );
    return () => { scanner.clear().catch(() => {}); };
  }, [scanning]);

  // Start camera for photo
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setCapturingPhoto(true);
    } catch {
      toast.error("Camera access denied");
    }
  };

  // Take photo and stop camera
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setPhotoData(dataUrl);
    // stop tracks
    streamRef.current.getTracks().forEach(t => t.stop());
    setCapturingPhoto(false);
  };

  const handleReportFault = async (e) => {
    e.preventDefault();
    if (!equipmentId) return toast.error("Please scan a QR code");

    const newFault = {
      equipmentId,
      equipmentName,
      faultDescription,
      photo: photoData,           // include the captured photo
      reportedDate: reportedDate || new Date().toISOString().slice(0, 10),
      status: "Pending",
      userName,
    };

    try {
      const res = await fetch(`${API_URL}/api/report-fault`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFault),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Fault reported successfully");
        onFaultReported?.(data.fault);
        // reset
        setEquipmentId("");
        setEquipmentName("");
        setFaultDescription("");
        setReportedDate("");
        setUsername(defaultUsername);
        setPhotoData("");
      } else {
        toast.error(data.message || "Failed to report fault");
      }
    } catch {
      toast.error("Server error while reporting fault");
    }
  };

  return (
    <div className="col-12">
      <h1 className="text-center mt-3">Report Faulty Equipment</h1>
      <div className="card">
        <div className="card-body">
          <form className="m-2 p-5" onSubmit={handleReportFault}>
            {/* QR Scanner / Input */}
            <div className="mb-4">
              {scanning ? (
                <div>
                  <p>Point your camera at the equipment’s QR code</p>
                  <div id="qr-reader" style={{ width: "100%" }} />
                  <button type="button" className="btn btn-link mt-2"
                    onClick={() => setScanning(false)}>Cancel</button>
                </div>
              ) : (
                <div className="d-flex">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Scan QR or enter ID"
                    value={equipmentName || equipmentId}
                    onChange={e => { setEquipmentId(e.target.value); setEquipmentName(""); }}
                    style={{ borderRadius: 10, padding: 15 }}
                    required
                  />
                  <button type="button" className="btn btn-secondary ms-2"
                    onClick={() => setScanning(true)}>Scan QR</button>
                </div>
              )}
            </div>

            {/* Live Photo Capture */}
          

            {/* Username */}
            <div className="mb-4">
              <label className="form-label">UserName</label>
              <input
                type="text"
                className="form-control"
                value={userName}
                onChange={e => setUsername(e.target.value)}
                style={{ width: "100%", padding: 15, borderRadius: 10 }}
                required
              />
            </div>

            {/* Fault Description */}
            <div className="mb-4">
              <label className="form-label">Fault Description</label>
              <textarea
                className="form-control"
                value={faultDescription}
                onChange={e => setFaultDescription(e.target.value)}
                style={{ width: "100%", padding: 15, borderRadius: 10 }}
                required
              />
            </div>

            {/* Reported Date */}
            <div className="mb-4">
              <label className="form-label">Reported Date</label>
              <input
                type="date"
                className="form-control"
                value={reportedDate}
                onChange={e => setReportedDate(e.target.value)}
                style={{ width: "100%", padding: 15, borderRadius: 10 }}
              />
            </div>
            <div className="mb-4">
              {!capturingPhoto && !photoData ? (
                <button type="button" className="btn btn-outline-dark text-light"
                  onClick={startCamera}>
                  Capture Photo
                </button>
              ) : null}

              {capturingPhoto && (
                <div className="mt-2">
                  <video ref={videoRef} style={{ width: "100%", maxHeight: 300 }} />
                  <button type="button" className="btn btn-success mt-2"
                    onClick={takePhoto}>
                    Take Photo
                  </button>
                </div>
              )}

              {photoData && (
                <div className="mt-2">
                  <p>Preview:</p>
                  <img src={photoData} alt="Captured" style={{ maxWidth: "100%", borderRadius: 10 }} />
                </div>
              )}
              {/* hidden canvas */}
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>

            <button type="submit" className="btn"
              style={{ backgroundColor: "#236a80", color: "white" }}>
              Report Fault
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportFault;
