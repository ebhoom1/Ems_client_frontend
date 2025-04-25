import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { Html5QrcodeScanner } from "html5-qrcode";

const ReportFault = ({ onFaultReported, defaultUsername }) => {
  // Verify API_URL on component mount
  useEffect(() => {
    console.log('API_URL:', API_URL);
  }, []);

  const [scanning, setScanning] = useState(false);
  const [equipmentId, setEquipmentId] = useState("");
  const [equipmentName, setEquipmentName] = useState("");
  const [userName, setUsername] = useState(defaultUsername);
  const [faultDescription, setFaultDescription] = useState("");
  const [reportedDate, setReportedDate] = useState("");

  // front/back camera state
  const [facingMode, setFacingMode] = useState("environment"); // "environment" = back, "user" = front

  // Multi-photo capture state
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [photos, setPhotos] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // QR scan callback
  const handleScanResult = async (decodedText) => {
    setScanning(false);
    setEquipmentId(decodedText);
    try {
      const res = await fetch(`${API_URL}/api/equiment/${decodedText}`);
      const data = await res.json();
      if (res.ok && data.equipment) {
        setEquipmentName(data.equipment.equipmentName);
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Equipment not found");
      setEquipmentId("");
      setEquipmentName("");
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

  // Open camera once <video> is rendered, using selected facingMode
  useEffect(() => {
    if (!capturingPhoto) return;

    let mounted = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode } })
      .then(stream => {
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch(err => {
        console.error("getUserMedia error:", err);
        toast.error(
          err.name === "NotAllowedError"
            ? "Camera permission denied."
            : `Camera error: ${err.message}`
        );
        setCapturingPhoto(false);
      });

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [capturingPhoto, facingMode]);

  const startCamera = () => {
    setCapturingPhoto(true);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    // reduce image size
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    setPhotos(prev => [...prev, dataUrl]);

    streamRef.current.getTracks().forEach(t => t.stop());
    setCapturingPhoto(false);
  };

  const removePhoto = index => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleReportFault = async e => {
    e.preventDefault();
    if (!equipmentId.trim()) {
      return toast.error("Please scan a QR code first");
    }

    // Validate photos
    const validatedPhotos = photos
      .map(photo => (photo.startsWith("data:image/") ? photo : null))
      .filter(Boolean);
    if (validatedPhotos.length !== photos.length) {
      toast.warn("Some photos were invalid and removed");
    }

    const newFault = {
      equipmentId,
      equipmentName,
      faultDescription,
      photos: validatedPhotos,
      reportedDate: reportedDate || new Date().toISOString().split("T")[0],
      status: "Pending",
      userName,
    };

    console.log("Submitting fault:", newFault);

    try {
      const res = await fetch(`${API_URL}/api/report-fault`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFault),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType?.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        throw new Error(data.message || data || `Status ${res.status}`);
      }

      toast.success("Fault reported successfully");
      onFaultReported?.(data.fault);

      // Reset form
      setEquipmentId("");
      setEquipmentName("");
      setFaultDescription("");
      setReportedDate("");
      setUsername(defaultUsername);
      setPhotos([]);
    } catch (err) {
      console.error("Error reporting fault:", err);
      toast.error(err.message || "Server error while reporting fault");
    }
  };

  return (
    <div className="col-12">
      <h1 className="text-center mt-3">Report Faulty Equipment</h1>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleReportFault} className="m-2 p-5">
            {/* Equipment ID + QR */}
            <div className="mb-4">
              <label className="form-label">Equipment ID</label>
              <div className="d-flex">
                <input
                  type="text"
                  className="form-control"
                  value={equipmentId}
                  readOnly
                  placeholder="Scan QR to fill"
                  style={{ borderRadius: 10, padding: 15 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => setScanning(true)}
                >
                  Scan QR
                </button>
              </div>
              {scanning && (
                <div className="mt-2">
                  <p>Point your camera at the QR code</p>
                  <div id="qr-reader" style={{ width: "100%" }} />
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => setScanning(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Equipment Name */}
            {equipmentName && (
              <div className="mb-4">
                <label className="form-label">Equipment Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={equipmentName}
                  readOnly
                  style={{ borderRadius: 10, padding: 15 }}
                />
              </div>
            )}

            {/* UserName */}
            <div className="mb-4">
              <label className="form-label">UserName</label>
              <input
                type="text"
                className="form-control"
                value={userName}
                onChange={e => setUsername(e.target.value)}
                style={{ borderRadius: 10, padding: 15 }}
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
                style={{ borderRadius: 10, padding: 15 }}
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
                style={{ borderRadius: 10, padding: 15 }}
              />
            </div>

            {/* Photo captures */}
            <div className="mb-4">
              <p>Add photos:</p>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {photos.map((src, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img
                      src={src}
                      alt={`captured-${i}`}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Add-photo button */}
                {!capturingPhoto && (
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={startCamera}
                    style={{
                      width: 80,
                      height: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                    }}
                  >
                    +
                  </button>
                )}
              </div>

              {capturingPhoto && (
                <>
                  {/* Switch camera toggle */}
                  <div className="mb-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() =>
                        setFacingMode(f =>
                          f === "environment" ? "user" : "environment"
                        )
                      }
                    >
                      Switch to {facingMode === "environment" ? "Front" : "Back"} Camera
                    </button>
                  </div>

                  {/* Video preview */}
                  <div className="mt-2">
                    <video
                      ref={videoRef}
                      style={{ width: "100%", maxHeight: 300 }}
                      muted
                    />
                    <div className="d-flex gap-2 mt-2">
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={takePhoto}
                      >
                        Take Photo
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => {
                          streamRef.current?.getTracks().forEach(t => t.stop());
                          setCapturingPhoto(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}

              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>

            <button
              type="submit"
              className="btn"
              style={{ backgroundColor: "#236a80", color: "white" }}
            >
              Report Fault
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportFault;
