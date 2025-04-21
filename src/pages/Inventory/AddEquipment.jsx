// src/pages/AddEquipment.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import QRCode from "react-qr-code";

const AddEquipment = () => {
  const { userData } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    equipmentName: "",
    userName: "",
    modelSerial: "",
    capacity: "",     // ← new
    ratedLoad: "",    // ← new
    installationDate: "",
    location: "",
    notes: ""
  });
  const [qrValue, setQrValue] = useState("");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const url = userData?.validUserOne?.adminType
          ? `${API_URL}/api/get-users-by-adminType/${userData.validUserOne.adminType}`
          : `${API_URL}/api/getallusers`;
        const response = await axios.get(url);
        const filtered = response.data.users.filter((u) => u.userType === "user");
        setUsers(filtered);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [userData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/add-equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Equipment added successfully");
        const equipmentId = data.equipment?._id || JSON.stringify(data.equipment);
        setQrValue(equipmentId);
        setForm({
          equipmentName: "",
          userName: "",
          modelSerial: "",
          capacity: "",   // reset
          ratedLoad: "",  // reset
          installationDate: "",
          location: "",
          notes: ""
        });
      } else {
        toast.error(data.message || "Failed to add equipment");
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <form className="m-1 p-1" onSubmit={handleSubmit}>
          <div className="row text-light">
            {/* Equipment Name */}
            <div className="col-lg-6 col-md-6 mb-4">
              <label htmlFor="equipmentName" className="form-label text-light">
                Equipment Name
              </label>
              <input
                id="equipmentName"
                name="equipmentName"
                type="text"
                className="form-control"
                value={form.equipmentName}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
              />
            </div>

            {/* Username */}
            <div className="col-lg-6 col-md-6 mb-4">
              <label htmlFor="userName" className="form-label text-light">
                Username
              </label>
              <select
                id="userName"
                name="userName"
                className="form-select"
                value={form.userName}
                onChange={handleChange}
                required
                style={{ padding: "15px", borderRadius: "10px" }}
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u._id} value={u.userName}>
                    {u.userName} – {u.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Serial */}
            <div className="col-lg-6 col-md-6 mb-4">
              <label htmlFor="modelSerial" className="form-label text-light">
                Model Serial
              </label>
              <input
                id="modelSerial"
                name="modelSerial"
                type="text"
                className="form-control"
                value={form.modelSerial}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
              />
            </div>

            {/* Model */}
         

            {/* Capacity */}
            <div className="col-lg-6 col-md-6 mb-4">
              <label htmlFor="capacity" className="form-label text-light">
                Capacity
              </label>
              <input
                id="capacity"
                name="capacity"
                type="text"
                className="form-control"
                placeholder="e.g. 10 HP"
                value={form.capacity}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
              />
            </div>

            {/* Rated Load */}
            <div className="col-lg-6 col-md-6 mb-4">
              <label htmlFor="ratedLoad" className="form-label text-light">
                Rated Load
              </label>
              <input
                id="ratedLoad"
                name="ratedLoad"
                type="text"
                className="form-control"
                placeholder="e.g. 11.5 A"
                value={form.ratedLoad}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
              />
            </div>

            {/* Installation Date */}
            <div className="col-lg-6 col-md-6 mb-4">
              <label htmlFor="installationDate" className="form-label text-light">
                Installation Date
              </label>
              <input
                id="installationDate"
                name="installationDate"
                type="date"
                className="form-control"
                value={form.installationDate}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
              />
            </div>

            {/* Location */}
            <div className="col-lg-6 col-md-6 mb-4">
              <label htmlFor="location" className="form-label text-light">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className="form-control"
                value={form.location}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
              />
            </div>

            {/* Optional Notes */}
            <div className="col-lg-12 mb-4">
              <label htmlFor="notes" className="form-label text-light">
                Optional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                className="form-control"
                value={form.notes}
                onChange={handleChange}
                style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn"
            style={{ backgroundColor: "#236a80", color: "white" }}
          >
            Add Equipment
          </button>
        </form>

        {/* QR Code */}
       {/*  {qrValue && (
          <div className="mt-4 text-center">
            <QRCode value={qrValue} size={128} />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default AddEquipment;
