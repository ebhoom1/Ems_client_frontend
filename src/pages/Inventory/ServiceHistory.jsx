import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { useSelector } from "react-redux";

const ServiceHistory = () => {
  const { userData } = useSelector(s => s.user);
  const [faults, setFaults] = useState([]);

  useEffect(() => {
    const fetchFaults = async () => {
      try {
        let url = `${API_URL}/api/all-faults`;
        if (userData?.validUserOne?.userType !== "admin") {
          url = `${API_URL}/api/fault-user/${userData.validUserOne.userName}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setFaults(data.faults || []);
      } catch {
        toast.error("Error fetching service history");
      }
    };
    fetchFaults();
  }, [userData]);

  return (
    <div className="">
      <div className="card-body">
        {faults.length === 0 ? (
          <p>No service history available.</p>
        ) : (
          <div
            className="table-responsive"
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              overflowX: "auto",
            }}
          >
            <table className="table table-striped table-hover table-sm" style={{ minWidth: "800px" }}>
              <thead className="" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Equipment</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>By</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Description</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Reported</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Status</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Service Date</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Tech</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {faults.map(f => (
                  <tr key={f._id}>
                    <td>{f.equipmentName}</td>
                    <td>{f.userName}</td>
                    <td>{f.faultDescription}</td>
                    <td>{new Date(f.reportedDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${f.status === "Serviced" ? "bg-success" : "bg-warning"}`}>
                        {f.status}
                      </span>
                    </td>
                    <td>
                      {f.serviceDate ? new Date(f.serviceDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td>{f.technicianName || "N/A"}</td>
                    <td>{f.serviceDetails || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceHistory;
