// AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { API_URL } from "../../utils/apiConfig";
import LeftQuantity from "./LeftQuantity"; // already used for used inventory
import { useSelector } from "react-redux";

const AdminDashboard = () => {
  const [activeAdminTab, setActiveAdminTab] = useState("inventoryAdded");
  const [inventoryAddedData, setInventoryAddedData] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [requestLogs, setRequestLogs] = useState([]);
  const [loadingAdded, setLoadingAdded] = useState(false);
  const [loadingUsed, setLoadingUsed] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [errorAdded, setErrorAdded] = useState(null);
  const [errorUsed, setErrorUsed] = useState(null);
  const [errorRequests, setErrorRequests] = useState(null);
  const { userData } = useSelector((state) => state.user);

  // Fetch Inventory Added Data
// Fetch Inventory Added Data
useEffect(() => {
  if (activeAdminTab === "inventoryAdded") {
    setLoadingAdded(true);
    let url = `${API_URL}/api/inventory/get`;
    
    // If user is admin, use admin-type endpoint
    if (userData?.validUserOne?.userType === "admin") {
      url = `${API_URL}/api/admin-type-inventory/${userData?.validUserOne?.adminType}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // Handle both response formats
        setInventoryAddedData(data.inventoryItems || data.equipment || []);
        setLoadingAdded(false);
      })
      .catch((err) => {
        setErrorAdded(err.message);
        setLoadingAdded(false);
      });
  }
}, [activeAdminTab, userData]);

// Fetch Usage Logs
useEffect(() => {
  if (activeAdminTab === "inventoryUsed") {
    setLoadingUsed(true);
    let url;
    
    if (userData?.validUserOne?.userType === "admin") {
      // For admin users - fetch usage logs filtered by adminType
      url = `${API_URL}/api/admin-type-usage/${userData?.validUserOne?.adminType}`;
    } else if (userData?.validUserOne?.userType === "user") {
      // For regular users - fetch only their usage logs
      url = `${API_URL}/api/use?userName=${userData?.validUserOne?.userName}`;
    } else {
      // Fallback - fetch all usage logs (shouldn't normally happen)
      url = `${API_URL}/api/use`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Handle the response format from admin-type-usage endpoint
        const logs = data.usageLogs || [];
        setUsageLogs(logs);
        setLoadingUsed(false);
      })
      .catch((err) => {
        console.error("Error fetching usage logs:", err);
        setErrorUsed(err.message);
        setLoadingUsed(false);
      });
  }
}, [activeAdminTab, userData]);

// Fetch Request Logs
useEffect(() => {
  if (activeAdminTab === "requests") {
    setLoadingRequests(true);
    let url = `${API_URL}/api/getrequest`;
    
    // If user is admin, use admin-type endpoint
    if (userData?.validUserOne?.userType === "admin") {
      url = `${API_URL}/api/admin-type-request/${userData?.validUserOne?.adminType}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // Handle both response formats
        setRequestLogs(data.requestLogs || data.requests || []);
        setLoadingRequests(false);
      })
      .catch((err) => {
        setErrorRequests(err.message);
        setLoadingRequests(false);
      });
  }
}, [activeAdminTab, userData]);

// Function to update a request's status (approve or deny)
const handleUpdateRequest = (id, status) => {
  fetch(`${API_URL}/api/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error updating status");
      return res.json();
    })
    .then(() => {
      // Refresh the request logs after update
      setRequestLogs((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status } : req
        )
      );
    })
    .catch((error) => {
      console.error(error);
    });
};
  return (
    <div className="col-12">
      <h1 className="text-center mt-3">Admin Inventory Dashboard</h1>
      {/* Tabs Navigation */}
      <div className="mb-4">
  <ul className="nav nav-tabs">
    <li className="nav-item">
      <button
        className="nav-link"
        style={{
          color: activeAdminTab === "inventoryAdded" ? "#236a80" : "black",
          fontWeight: activeAdminTab === "inventoryAdded" ? "bold" : "normal",
        }}
        onClick={() => setActiveAdminTab("inventoryAdded")}
      >
        Inventory Added
      </button>
    </li>
    <li className="nav-item">
      <button
        className="nav-link"
        style={{
          color: activeAdminTab === "inventoryUsed" ? "#236a80" : "black",
          fontWeight: activeAdminTab === "inventoryUsed" ? "bold" : "normal",
        }}
        onClick={() => setActiveAdminTab("inventoryUsed")}
      >
        Inventory Used
      </button>
    </li>
    <li className="nav-item">
      <button
        className="nav-link"
        style={{
          color: activeAdminTab === "requests" ? "#236a80" : "black",
          fontWeight: activeAdminTab === "requests" ? "bold" : "normal",
        }}
        onClick={() => setActiveAdminTab("requests")}
      >
        Requests
      </button>
    </li>
  </ul>
</div>

      {/* Inventory Added Tab */}
      {activeAdminTab === "inventoryAdded" && (
        <div>
          <h2>Inventory Added</h2>
          {loadingAdded ? (
            <p>Loading...</p>
          ) : errorAdded ? (
            <p>Error: {errorAdded}</p>
          ) : (
            <table className="table table-bordered" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              <thead style={{ backgroundColor: "#236a80", color: "#fff" }}>
                <tr>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>SKU</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Username</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Action</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Quantity</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {inventoryAddedData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.skuName}</td>
                    <td>{item.userName}</td>
                    <td>Added</td>
                    <td>{item.quantity}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Inventory Used Tab */}
      {activeAdminTab === "inventoryUsed" && (
        <div>
          <h2>Inventory Used</h2>
          {loadingUsed ? (
            <p>Loading...</p>
          ) : errorUsed ? (
            <p>Error: {errorUsed}</p>
          ) : (
            <table className="table table-bordered" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              <thead style={{ backgroundColor: "#236a80", color: "#fff" }}>
                <tr>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>SKU</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Username</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Quantity Used</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Left Quantity</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Date</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {usageLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.skuName}</td>
                    <td>{log.userName}</td>
                    <td>{log.quantityUsed}</td>
                    <td>
                      <LeftQuantity sku={log.skuName} />
                    </td>
                    <td>{new Date(log.date).toLocaleDateString()}</td>
                    <td>{log.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeAdminTab === "requests" && (
        <div>
          <h2>Requests</h2>
          {loadingRequests ? (
            <p>Loading...</p>
          ) : errorRequests ? (
            <p>Error: {errorRequests}</p>
          ) : (
            <table className="table table-bordered" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              <thead style={{ backgroundColor: "#236a80", color: "#fff" }}>
                <tr>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>SKU</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Username</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Requested Quantity</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Status</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Request Date</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Reason</th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
  {requestLogs.map((req) => (
    <tr key={req._id}>
      <td>{req.skuName}</td>
      <td>{req.userName}</td>
      <td>{req.quantityRequested}</td>
      <td
        style={{
          color:
            req.status === "Approved"
              ? "green"
              : req.status === "Denied"
              ? "red"
              : "orange",
          fontWeight: "bold",
        }}
      >
        {req.status}
      </td>
      <td>{new Date(req.requestDate).toLocaleDateString()}</td>
      <td>{req.reason}</td>
      <td>
        <button
          onClick={() => handleUpdateRequest(req._id, "Approved")}
          className="btn btn-success btn-sm me-2"
        >
          Approve
        </button>
        <button
          onClick={() => handleUpdateRequest(req._id, "Denied")}
          className="btn btn-danger btn-sm"
        >
          Deny
        </button>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
