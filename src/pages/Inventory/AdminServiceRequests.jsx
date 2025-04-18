import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { useSelector } from "react-redux";

const AdminServiceRequests = () => {
  const { userData } = useSelector(s => s.user);
  const [faults, setFaults] = useState([]);
  const [editing, setEditing] = useState(null);
  const [serviceDetails, setServiceDetails] = useState({
    serviceDate: "",
    technicianName: "",
    serviceDetails: "",
    partsUsed: "",
    nextServiceDue: "",
    status: "Pending"
  });

  useEffect(() => {
    const fetchFaults = async () => {
      try {
        let url;
        const u = userData?.validUserOne;
        if (u.userType === "user") url = `${API_URL}/api/fault-user/${u.userName}`;
        else if (u.userType === "admin") url = `${API_URL}/api/admin-type-fault/${u.adminType}`;
        else url = `${API_URL}/api/all-faults`;

        const res = await fetch(url);
        const data = await res.json();
        setFaults(data.faults || []);
      } catch {
        toast.error("Server error while fetching faults");
      }
    };
    fetchFaults();
  }, [userData]);

  const updateService = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/update-fault/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceDetails),
      });
      if (res.ok) {
        toast.success("Service record updated successfully");
        setFaults(faults.map(f => f._id === id ? { ...f, ...serviceDetails } : f));
        setEditing(null);
      } else {
        const d = await res.json();
        toast.error(d.message || "Failed to update");
      }
    } catch {
      toast.error("Server error while updating service record");
    }
  };

  return (
    <div className="">
      <div className="card-body">
        {faults.length === 0 ? (
          <p>No fault reports available.</p>
        ) : (
          <div
            className="table-responsive"
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              overflowX: "auto",
            }}
          >
            <table className="table table-striped table-hover table-sm" style={{ minWidth: "700px" }}>
              <thead  style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Equipment</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Description</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>By</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Date</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Status</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faults.map(f => (
                  <tr key={f._id}>
                    <td>{f.equipmentName}</td>
                    <td>{f.faultDescription}</td>
                    <td>{f.userName}</td>
                    <td>{new Date(f.reportedDate).toLocaleDateString()}</td>
                    <td>{f.status}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {editing === f._id ? (
                        <div className="d-flex flex-column flex-sm-row gap-2">
                          {/* Example form fields */}
                          <input
                            type="date"
                            className="form-control form-control-sm mb-1"
                            value={serviceDetails.serviceDate}
                            onChange={e => setServiceDetails(sd => ({ ...sd, serviceDate: e.target.value }))}
                          />
                          <input
                            type="text"
                            className="form-control form-control-sm mb-1"
                            placeholder="Technician"
                            value={serviceDetails.technicianName}
                            onChange={e => setServiceDetails(sd => ({ ...sd, technicianName: e.target.value }))}
                          />
                          <button
                            className="btn btn-success btn-sm me-1"
                            onClick={() => updateService(f._id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditing(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm"
                          style={{ backgroundColor: "#236a80", color: "white" }}
                          onClick={() => {
                            setEditing(f._id);
                            setServiceDetails({
                              serviceDate: f.serviceDate || "",
                              technicianName: f.technicianName || "",
                              serviceDetails: f.serviceDetails || "",
                              partsUsed: f.partsUsed || "",
                              nextServiceDue: f.nextServiceDue || "",
                              status: f.status || "Pending"
                            });
                          }}
                        >
                          Update
                        </button>
                      )}
                    </td>
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

export default AdminServiceRequests;
