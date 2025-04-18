// src/pages/EquipmentList.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { useSelector } from "react-redux";
import QRCode from "react-qr-code";
import QRCodeLib from "qrcode";
import { IoFilter } from "react-icons/io5";

const EquipmentList = () => {
  const { userData } = useSelector((state) => state.user);
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateSortAsc, setDateSortAsc] = useState(true);
  const type = userData?.validUserOne;

  useEffect(() => {
    const fetchList = async () => {
      try {
        let url;
        if (type?.userType === "user")
          url = `${API_URL}/api/user/${type.userName}`;
        else if (type?.userType === "admin")
          url = `${API_URL}/api/admin-type-equipment/${type.adminType}`;
        else
          url = `${API_URL}/api/all-equipment`;

        const res = await fetch(url);
        const data = await res.json();
        const arr = data.equipment || data.inventoryItems || data;
        setList(Array.isArray(arr) ? arr : []);
      } catch {
        toast.error("Error fetching equipment list");
      }
    };
    fetchList();
  }, [type]);

  const downloadQR = async (value) => {
    try {
      const pngUrl = await QRCodeLib.toDataURL(value);
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-${value}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch {
      toast.error("Failed to download QR code");
    }
  };

  // filter & sort
  const filtered = list
    .filter((e) => {
      const term = searchTerm.toLowerCase();
      const dateStr = e.installationDate
        ? new Date(e.installationDate).toLocaleDateString("en-GB")
        : "";
      return (
        e.equipmentName.toLowerCase().includes(term) ||
        e.userName.toLowerCase().includes(term) ||
        dateStr.includes(term)
      );
    })
    .sort((a, b) => {
      const da = new Date(a.installationDate);
      const db = new Date(b.installationDate);
      return dateSortAsc ? da - db : db - da;
    });

  return (
    <div className="border border-solid p-3">
      <div className="d-flex align-items-center mb-3">
        {/* Search */}
        <div className="position-relative me-3" style={{ width: 250 }}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{
              position: "absolute",
              top: "50%",
              left: 10,
              transform: "translateY(-50%)",
              color: "#aaa",
            }}
          />
          <input
            type="text"
            className="form-control ps-4 ms-1"
            placeholder="Search name, user, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{borderRadius:'20px'}}
          />
        </div>

        {/* Sort Toggle */}
       {/*  <IoFilter
          size={24}
          style={{ cursor: "pointer", color: "#236a80" }}
          onClick={() => setDateSortAsc(!dateSortAsc)}
          title={`Sort by date ${dateSortAsc ? "▲" : "▼"}`}
        /> */}
      </div>

      <div className="table-responsive" style={{ maxHeight: "60vh", overflow: "auto" }}>
        {filtered.length === 0 ? (
          <p>No equipment found</p>
        ) : (
          <table className="table table-striped align-middle">
            <thead>
              <tr style={{ backgroundColor: "#236a80", color: "#fff" }}>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Name</th>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>User</th>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Model</th>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                  Date
                 
                </th>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Location</th>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Notes</th>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>QR</th>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Download</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={e._id || i}>
                  <td>{e.equipmentName || "N/A"}</td>
                  <td>{e.userName || "N/A"}</td>
                  <td>{e.modelSerial || "N/A"}</td>
                  <td>
                    {e.installationDate
                      ? new Date(e.installationDate).toLocaleDateString("en-GB")
                      : "N/A"}
                  </td>
                  <td>{e.location || "N/A"}</td>
                  <td>{e.notes || "N/A"}</td>
                  <td>
                    <QRCode value={e._id} size={64} />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => downloadQR(e._id)}
                    >
                      Download QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EquipmentList;
