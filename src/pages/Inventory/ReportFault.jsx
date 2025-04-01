import React, { useState } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";

const ReportFault = ({ equipmentList, onFaultReported ,defaultUsername}) => {
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [userName, setUsername] = useState(defaultUsername);
    const [faultDescription, setFaultDescription] = useState("");
  const [reportedDate, setReportedDate] = useState("");

  const handleReportFault = async (e) => {
    e.preventDefault();

    if (!selectedEquipment) return;

    const newFault = {
      equipmentName: selectedEquipment,
      faultDescription,
      reportedDate: reportedDate || new Date().toISOString().substr(0, 10),
      status: "Pending",
      userName,
    };

    try {
      const res = await fetch(`${API_URL}/api/report-fault`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFault),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Fault reported successfully");
        if (onFaultReported) {
          onFaultReported(data.fault);
        }
        // Reset the form fields
        setSelectedEquipment("");
        setFaultDescription("");
        setReportedDate("");
        setUsername("");
      } else {
        toast.error(data.message || "Failed to report fault");
      }
    } catch (error) {
      toast.error("Server error while reporting fault");
    }
  };

  return (
    <div className="col-12">
      <h1 className="text-center mt-3">Report Faulty Equipment</h1>
      <div className="card">
        <div className="card-body">
          <form className="m-2 p-5" onSubmit={handleReportFault}>
            <div className="row">
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="selectedEquipment" className="form-label">
                    Select Equipment
                  </label>
                  <select
                    id="selectedEquipment"
                    className="form-control"
                    name="selectedEquipment"
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    required
                  >
                    <option value="">Select Equipment</option>
                    {equipmentList.map((equip) => (
                      <option key={equip.id} value={equip.equipmentName}>
                        {equip.equipmentName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="userName" className="form-label">
                    UserName
                  </label>
                  <input
                    id="userName"
                    type="text"
                    placeholder="UserName"
                    className="form-control"
                    name="userName"
                    value={userName}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="faultDescription" className="form-label">
                    Fault Description
                  </label>
                  <textarea
                    id="faultDescription"
                    placeholder="Describe the fault"
                    className="form-control"
                    name="faultDescription"
                    value={faultDescription}
                    onChange={(e) => setFaultDescription(e.target.value)}
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    required
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="reportedDate" className="form-label">
                    Reported Date
                  </label>
                  <input
                    id="reportedDate"
                    type="date"
                    className="form-control"
                    name="reportedDate"
                    value={reportedDate}
                    onChange={(e) => setReportedDate(e.target.value)}
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="btn" style={{ backgroundColor: "#236a80", color: "white" }}>
              Report Fault
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportFault;
