import React, { useState, useEffect } from "react";
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

  // Called when a QR code is successfully decoded
  const handleScanResult = async (decodedText) => {
    setScanning(false);
    setEquipmentId(decodedText);

    try {
      const res = await fetch(`${API_URL}/api/${decodedText}`);
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

  // Initialize the HTML5 QR code scanner when scanning turns on
  useEffect(() => {
    if (!scanning) return;
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    const scanner = new Html5QrcodeScanner(
      "qr-reader",   // This div’s id
      config,
      /* verbose= */ false
    );

    scanner.render(
      (decoded) => {
        handleScanResult(decoded);
        scanner.clear(); // stop after first scan
      },
      (error) => {
        // optional: console.error("QR scan error:", error);
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanning]);

  const handleReportFault = async (e) => {
    e.preventDefault();
    if (!equipmentId) return toast.error("Please scan a QR code");

    const newFault = {
      equipmentId,
      equipmentName,
      faultDescription,
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
        // reset fields
        setEquipmentId("");
        setEquipmentName("");
        setFaultDescription("");
        setReportedDate("");
        setUsername(defaultUsername);
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
                  <button
                    type="button"
                    className="btn btn-link mt-2"
                    onClick={() => setScanning(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="d-flex">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Scan QR "
                    value={equipmentName || equipmentId}
                    onChange={(e) => {
                      setEquipmentId(e.target.value);
                      setEquipmentName("");
                    }}
                    style={{ borderRadius: 10, padding: 15 }}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => setScanning(true)}
                  >
                    Scan QR
                  </button>
                </div>
              )}
            </div>

            {/* Username */}
            <div className="mb-4">
              <label className="form-label">UserName</label>
              <input
                type="text"
                className="form-control"
                value={userName}
                onChange={(e) => setUsername(e.target.value)}
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
                onChange={(e) => setFaultDescription(e.target.value)}
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
                onChange={(e) => setReportedDate(e.target.value)}
                style={{ width: "100%", padding: 15, borderRadius: 10 }}
              />
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
