import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";
import DashboardSam from "../Dashboard/DashboardSam";
import HeaderSim from "../Header/HeaderSim";
import { ToastContainer } from "react-bootstrap";

export default function EditEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    equipmentName: "",
    userName: "",
    modelSerial: "",
    capacity: "",
    ratedLoad: "",
    installationDate: "",
    location: "",
    notes: ""
  });

  useEffect(() => {
   const fetchEquipment = async () => {
  try {
    const res = await fetch(`${API_URL}/api/equiment/${id}`);
    const data = await res.json();
    console.log("Fetched equipment:", data); // ✅ Add this

    if (res.ok) {
      const equip = data.equipment;
      setForm({
        equipmentName: equip.equipmentName || "",
        userName: equip.userName || "",
        modelSerial: equip.modelSerial || "",
        capacity: equip.capacity || "",
        ratedLoad: equip.ratedLoad || "",
        installationDate: equip.installationDate?.substring(0, 10) || "",
        location: equip.location || "",
        notes: equip.notes || ""
      });
    } else {
      toast.error("Failed to load equipment details");
    }
  } catch (err) {
    toast.error("Server error while fetching equipment");
  }
};

    const fetchUsers = async () => {
      try {
        const url = userData?.validUserOne?.adminType
          ? `${API_URL}/api/get-users-by-adminType/${userData.validUserOne.adminType}`
          : `${API_URL}/api/getallusers`;
        const response = await fetch(url);
        const data = await response.json();
        const filtered = data.users.filter((u) => u.userType === "user");
        setUsers(filtered);
      } catch (err) {
        toast.error("Error fetching users");
      }
    };

    fetchEquipment();
    fetchUsers();
  }, [id, userData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_URL}/api/equipment/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("✅ Equipment updated successfully");
      setTimeout(() => navigate("/services"), 1200);
    } else {
      toast.error(data.message || "❌ Failed to update");
    }
  } catch (err) {
    toast.error("❌ Server error during update");
    console.error(err);
  }
};


  return (
   <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>

        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <HeaderSim />
            </div>
          </div>
          <div>
          <div className="card">
      <div className="card-body">
        <h4 className="mb-4 text-light">Edit Equipment</h4>
        <form onSubmit={handleSubmit} className="text-light">
          <div className="row">
            {/* Equipment Name */}
            <div className="col-md-6 mb-3">
              <label>Equipment Name</label>
              <input
                className="form-control"
                name="equipmentName"
                value={form.equipmentName}
                onChange={handleChange}
                required
              />
            </div>

            {/* User */}
            <div className="col-md-6 mb-3">
              <label>Username</label>
              <select
                className="form-control"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                required
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u._id} value={u.userName}>
                    {u.userName} - {u.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Serial */}
            <div className="col-md-6 mb-3">
              <label>Model Serial</label>
              <input
                className="form-control"
                name="modelSerial"
                value={form.modelSerial}
                onChange={handleChange}
              />
            </div>

            {/* Capacity */}
            <div className="col-md-6 mb-3">
              <label>Capacity</label>
              <input
                className="form-control"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
              />
            </div>

            {/* Rated Load */}
            <div className="col-md-6 mb-3">
              <label>Rated Load</label>
              <input
                className="form-control"
                name="ratedLoad"
                value={form.ratedLoad}
                onChange={handleChange}
              />
            </div>

            {/* Installation Date */}
            <div className="col-md-6 mb-3">
              <label>Installation Date</label>
              <input
                className="form-control"
                name="installationDate"
                type="date"
                value={form.installationDate}
                onChange={handleChange}
              />
            </div>

            {/* Location */}
            <div className="col-md-6 mb-3">
              <label>Location</label>
              <input
                className="form-control"
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            {/* Notes */}
            <div className="col-12 mb-3">
              <label>Notes</label>
              <textarea
                className="form-control"
                name="notes"
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 text-end">
              <button type="submit" className="btn btn-warning">
                Update Equipment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
          </div>

          <ToastContainer />
        </div>
      </div>
    </div>
    /*  */
   
  );
}
