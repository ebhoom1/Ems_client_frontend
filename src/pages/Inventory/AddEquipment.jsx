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
    installationDate: "",
    location: "",
    notes: ""
  });
  const [qrValue, setQrValue] = useState("");

  // fetch user list on mount or when adminType changes
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let response;
        if (userData?.validUserOne?.adminType) {
          response = await axios.get(
            `${API_URL}/api/get-users-by-adminType/${userData.validUserOne.adminType}`
          );
        } else {
          response = await axios.get(`${API_URL}/api/getallusers`);
        }
        // only keep users of type "user"
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
            <div className="col-lg-6 col-md-6 mb-4 text-light">
              <label htmlFor="equipmentName" className="form-label">
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

            {/* Username dropdown */}
            <div className="col-lg-6 col-md-6 mb-4">
              <label htmlFor="userName" className="form-label">
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
                    {`${u.userName} - ${u.companyName}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Serial */}
            <div className="col-lg-6 col-md-6 mb-4">
              <label htmlFor="modelSerial" className="form-label">
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

            {/* Installation Date */}
            <div className="col-lg-6 col-md-6 mb-4">
              <label htmlFor="installationDate" className="form-label">
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
              <label htmlFor="location" className="form-label">
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
            <div className="col-lg-6 col-md-6 mb-4">
              <label htmlFor="notes" className="form-label">
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
       
      </div>
    </div>
  );
};

export default AddEquipment;
