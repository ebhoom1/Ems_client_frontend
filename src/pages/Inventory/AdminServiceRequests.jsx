// src/pages/AdminServiceRequests.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { useSelector } from "react-redux";

const AdminServiceRequests = () => {
  const { userData } = useSelector((s) => s.user);

  const [faults, setFaults] = useState([]);
  const [editing, setEditing] = useState(null);
const [technicians, setTechnicians] = useState([]);
const { validUserOne: u } = userData || {};
  // Only the fields your API uses:
  const [serviceDetails, setServiceDetails] = useState({
    status: "Pending",
    serviceDate: "",
    technicianName: "",
    nextServiceDue: "",
  });

useEffect(() => {
  const fetchFaults = async () => {
    try {
      let url;
      const u = userData?.validUserOne;

      if (u?.userType === "user") {
        url = `${API_URL}/api/fault-user/${u.userName}`;
      } else if (
        u?.userType === "admin" ||
        u?.userType === "operator" ||
        u?.userType === "technician"
      ) {
        url = `${API_URL}/api/admin-type-fault/${u.adminType}`;
      } else {
        url = `${API_URL}/api/all-faults`; // fallback
      }

      const res = await fetch(url);
      const data = await res.json();
      setFaults(data.faults || []);
    } catch {
      toast.error("Server error while fetching faults");
    }
  };
  fetchFaults();
}, [userData]);

useEffect(() => {
  const fetchTechs = async () => {
    try {
      // fetch all technicians
      const res = await fetch(`${API_URL}/api/getAll-technicians`);
      const data = await res.json();
      let list = data.users || [];

      // filter by this admin’s adminType
      if (u?.userType === "admin") {
        list = list.filter(t => t.adminType === u.adminType);
      }
      setTechnicians(list);
    } catch (err) {
      toast.error("Failed to load technicians");
    }
  };

  fetchTechs();
}, [u]);
  const updateService = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/update-fault/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceDetails),
      });
      if (res.ok) {
        const { fault: updated } = await res.json();
        toast.success("Service record updated successfully");
        setFaults((prev) =>
          prev.map((f) => (f._id === id ? updated : f))
        );
        setEditing(null);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to update");
      }
    } catch {
      toast.error("Server error while updating service record");
    }
  };

  return (
    <div className="container py-3">
      <h4 className="mb-4">Admin View of Service Requests</h4>
      <div className="">
        <div className="card-body">
          {faults.length === 0 ? (
            <p>No fault reports available.</p>
          ) : (
            <div
              className="table-responsive"
              style={{ maxHeight: "60vh", overflowY: "auto", overflowX: "auto" }}
            >
              <table
                className="table table-striped table-hover table-sm"
                style={{ minWidth: "900px" }}
              >
                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Equipment
                    </th>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Description
                    </th>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      By
                    </th>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Date
                    </th>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Status
                    </th>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {faults.map((f) => (
                    <tr key={f._id}>
                      <td>{f.equipmentName}</td>
                      <td>{f.faultDescription}</td>
                      <td>{f.userName}</td>
                      <td>{new Date(f.reportedDate).toLocaleDateString()}</td>
                      <td>{f.status}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {editing === f._id ? (
                          <div className="d-flex flex-column gap-2">
                            {/* Status */}
                            <div>
                              <label className="form-label">Status</label>
                              <select
                                className="form-select form-select-sm"
                                value={serviceDetails.status}
                                onChange={(e) =>
                                  setServiceDetails((sd) => ({
                                    ...sd,
                                    status: e.target.value,
                                  }))
                                }
                              >
                                <option value="Pending">Pending</option>
                                <option value="Serviced">Serviced</option>
                              </select>
                            </div>

                            {/* Service Date */}
                            <div>
                              <label htmlFor="serviceDate" className="form-label">
                                Service Date
                              </label>
                              <input
                                id="serviceDate"
                                type="date"
                                className="form-control form-control-sm"
                                value={serviceDetails.serviceDate}
                                onChange={(e) =>
                                  setServiceDetails((sd) => ({
                                    ...sd,
                                    serviceDate: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>

                            {/* Technician Name */}
                    {/* Technician Name */}
<div>
  <label htmlFor="technicianName" className="form-label">
    Technician Name
  </label>
  <select
    id="technicianName"
    className="form-select form-select-sm"
    value={serviceDetails.technicianName}
    onChange={e =>
      setServiceDetails(sd => ({
        ...sd,
        technicianName: e.target.value
      }))
    }
    required
  >
    <option value="">Select Technician</option>
    {technicians.map((tech) => (
      <option key={tech._id} value={tech.userName}>
        {tech.fname} ({tech.userName})
      </option>
    ))}
  </select>
</div>


                            {/* Next Service Due */}
                            <div>
                              <label htmlFor="nextServiceDue" className="form-label">
                                Next Service Due
                              </label>
                              <input
                                id="nextServiceDue"
                                type="date"
                                className="form-control form-control-sm"
                                value={serviceDetails.nextServiceDue}
                                onChange={(e) =>
                                  setServiceDetails((sd) => ({
                                    ...sd,
                                    nextServiceDue: e.target.value,
                                  }))
                                }
                              />
                            </div>

                            <div className="d-flex gap-2 mt-2">
                              <button
                                onClick={() => updateService(f._id)}
                                className="btn btn-success btn-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditing(null)}
                                className="btn btn-secondary btn-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm"
                            style={{ backgroundColor: "#236a80", color: "white" }}
                            onClick={() => {
                              setEditing(f._id);
                              setServiceDetails({
                                status: f.status || "Pending",
                                serviceDate: f.serviceDate || "",
                                technicianName: f.technicianName || "",
                                nextServiceDue: f.nextServiceDue || "",
                              });
                            }}
                          >
                            Edit
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
    </div>
  );
};

export default AdminServiceRequests;
