// Inventory.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Maindashboard from "../Maindashboard/Maindashboard";
import Header from "../Header/Hedaer";
import DashboardSam from "../Dashboard/DashboardSam";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/apiConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./AdminDashboard";
import HeaderSim from "../Header/HeaderSim";

// RequestHistory component for non-admin users
const RequestHistory = () => {
    const { userData } = useSelector((state) => state.user);
  
  const [requestLogs, setRequestLogs] = useState([]);
  const [loadingReq, setLoadingReq] = useState(false);
  const [errorReq, setErrorReq] = useState(null);

  React.useEffect(() => {
    const fetchRequests = async () => {
      setLoadingReq(true);
      try {
        let url;
        
        if (userData?.validUserOne?.userType === "admin") {
          // For admin users - fetch all requests (or filter by adminType if needed)
          url = `${API_URL}/api/getrequest`;
        } else {
          // For regular users - fetch only their requests using username from userData
          url = `${API_URL}/api/user-request/${userData?.validUserOne?.userName}`;
        }
  
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
          // Handle both response formats
          setRequestLogs(data.requests || data.requestLogs || []);
        } else {
          setErrorReq(data.message || "Failed to fetch requests");
        }
      } catch (err) {
        setErrorReq(err.message || "Error fetching requests");
      } finally {
        setLoadingReq(false);
      }
    };
  
    fetchRequests();
  }, [userData]); // Add userData to dependency array
  return (
    <div className="col-12">
      <h1 className="text-center mt-3">Request History</h1>
      {loadingReq ? (
        <p>Loading...</p>
      ) : errorReq ? (
        <p>Error: {errorReq}</p>
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
            </tr>
          </thead>
          <tbody>
  {requestLogs.map((req, index) => (
    <tr key={index}>
      <td>{req.skuName}</td>
      <td>{req.userName}</td>
      <td>{req.quantityRequested}</td>
      <td>
        {req.status === "Approved" ? (
          <span style={{ color: "green" }}>
            &#x2714; Approved
          </span>
        ) : req.status === "Denied" ? (
          <span style={{ color: "red" }}>
            &#x2716; Denied
          </span>
        ) : (
          req.status
        )}
      </td>
      <td>{new Date(req.requestDate).toLocaleDateString()}</td>
      <td>{req.reason}</td>
    </tr>
  ))}
</tbody>

        </table>
      )}
    </div>
  );
};
const InventoryList = () => {
  const { userData } = useSelector((state) => state.user);
  const [inventoryData, setInventoryData] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [errorInventory, setErrorInventory] = useState(null);
  const [dateSortOrder, setDateSortOrder] = useState("asc");

  useEffect(() => {
    const fetchInventory = async () => {
      setLoadingInventory(true);
      try {
        let url;
        // For admin users, use the general inventory API.
        // For regular users, use the user-specific endpoint.
        if (userData?.validUserOne?.userType === "admin") {
          url = `${API_URL}/api/inventory/get`;
        } else {
          url = `${API_URL}/api/user?userName=${userData?.validUserOne?.userName}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        console.log("Inventory API response:", data); // For debugging

        if (response.ok) {
          let inventory = [];
          // Assuming both endpoints return an object with key "inventoryItems" containing the array.
          // If the response is an array directly, then use that instead.
          if (data.inventoryItems && Array.isArray(data.inventoryItems)) {
            inventory = data.inventoryItems;
          } else if (Array.isArray(data)) {
            inventory = data;
          }
          setInventoryData(inventory);
        } else {
          setErrorInventory(data.message || "Failed to fetch inventory");
        }
      } catch (err) {
        setErrorInventory(err.message || "Error fetching inventory");
      } finally {
        setLoadingInventory(false);
      }
    };

    // Only fetch if a username exists
    if (userData?.validUserOne?.userName) {
      fetchInventory();
    }
  }, [userData]);

  // Toggle the sort order based on the date field
  const toggleSort = () => {
    const newOrder = dateSortOrder === "asc" ? "desc" : "asc";
    setDateSortOrder(newOrder);
    const sortedData = [...inventoryData].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return newOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    setInventoryData(sortedData);
  };

  return (
    <div className="col-12">
      <h1 className="text-center mt-3">Inventory List</h1>
      {loadingInventory ? (
        <p>Loading...</p>
      ) : errorInventory ? (
        <p>Error: {errorInventory}</p>
      ) : (
        <table
          className="table table-bordered"
          style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
        >
          <thead style={{ backgroundColor: "#236a80", color: "#fff" }}>
            <tr>
              <th style={{ backgroundColor: "#236a80", color: "#fff" }}>SKU</th>
              <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Username</th>
              <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Action</th>
              <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Quantity</th>
              <th
                style={{
                  cursor: "pointer",
                  backgroundColor: "#236a80",
                  color: "#fff",
                }}
                onClick={toggleSort}
              >
                Date {dateSortOrder === "asc" ? "▲" : "▼"}
              </th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item, index) => (
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
  );
};


const Inventory = () => {
  const { userData } = useSelector((state) => state.user);
  const userType = userData?.validUserOne?.userType;
  const currentUserName = userData?.validUserOne?.userName;
  const [equipmentList, setEquipmentList] = useState([]); // Add this line
    const [activeTab, setActiveTab] = useState(userType === "admin" ? "admin" : "add");
  const navigate = useNavigate();
useEffect(() => {
  const fetchEquipmentList = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user?userName=${currentUserName}`);
      const data = await res.json();
      // populate dropdown from the returned inventoryItems array
      setEquipmentList(data.inventoryItems || []);
    } catch (err) {
      console.error("Error fetching equipment list:", err);
    }
  };
  if (currentUserName) fetchEquipmentList();
}, [currentUserName]);

  // Render tab navigation based on user type
  const renderTabs = () => {
    if (userType === "admin") {
      return (
        <div>
        <div className="d-flex align-items-center justify-content-center">
  <button onClick={() => navigate("/inventory")} className="w-25 btn btn-outline-success me-2">
    Inventory
  </button>
  <button onClick={() => navigate("/services")} className="w-25 btn btn-outline-success me-2">
    Services
  </button>
  <button
    onClick={() =>
      userType === "admin"
        ? navigate(`/admin/report/HH014`)
        : navigate("/dailylogs")
    }
    className="w-25 btn btn-outline-success me-2"
  >
    Daily Log
  </button>
</div>
        </div>
      );
    } else {
      return (
        <div>
          <div className="d-flex align-items-center justify-content-center">
            <button onClick={() => navigate("/inventory")} className="w-25 btn btn-outline-success me-2">
              Inventory
            </button>
            <button onClick={() => navigate("/services")} className="w-25 btn btn-outline-success me-2">
              Services
            </button>
            <button
    onClick={() =>
      userType === "admin"
        ? navigate(`/admin/report/HH014`)
        : navigate("/dailylog")
    }
    className="w-25 btn btn-outline-success me-2"
  >
    Daily Log
  </button>
          </div>
          <ul className="nav nav-tabs mb-3 mt-3">
            <li className="nav-item">
              <button
                style={activeTab === "add" ? { color: "#236a80", fontWeight: "bold" } : { color: "black" }}
                className={`nav-link ${activeTab === "add" ? "active" : ""}`}
                onClick={() => setActiveTab("add")}
              >
                Add Inventory
              </button>
            </li>
            <li className="nav-item">
              <button
                style={activeTab === "use" ? { color: "#236a80", fontWeight: "bold" } : { color: "black" }}
                className={`nav-link ${activeTab === "use" ? "active" : ""}`}
                onClick={() => setActiveTab("use")}
              >
                Use Inventory
              </button>
            </li>
            <li className="nav-item">
              <button
                style={activeTab === "addedlist" ? { color: "#236a80", fontWeight: "bold" } : { color: "black" }}
                className={`nav-link ${activeTab === "addedlist" ? "active" : ""}`}
                onClick={() => setActiveTab("addedlist")}
              >
                Added Inventory List
              </button>
            </li>
            <li className="nav-item">
              <button
                style={activeTab === "request" ? { color: "#236a80", fontWeight: "bold" } : { color: "black" }}
                className={`nav-link ${activeTab === "request" ? "active" : ""}`}
                onClick={() => setActiveTab("request")}
              >
                Request Inventory
              </button>
            </li>
            <li className="nav-item">
              <button
                style={activeTab === "requestHistory" ? { color: "#236a80", fontWeight: "bold" } : { color: "black" }}
                className={`nav-link ${activeTab === "requestHistory" ? "active" : ""}`}
                onClick={() => setActiveTab("requestHistory")}
              >
                Request History
              </button>
            </li>
          </ul>
        </div>
      );
    }
  };

  // Render content based on active tab and user type
  const renderContent = () => {
    if (userType === "admin") {
      return <AdminDashboard />;
    } else {
      if (activeTab === "add") return renderAddInventory();
      if (activeTab === "use") return renderUseInventory();
      if (activeTab === "addedlist") return <InventoryList />;
      if (activeTab === "request") return renderRequestInventory();
      if (activeTab === "requestHistory") return <RequestHistory />;
    }
  };

  // Form to add inventory items
  const renderAddInventory = () => (
    <div className="col-12">
      <h1 className="text-center mt-3">Add Inventory</h1>
      <div className="card">
        <div className="card-body">
          <form className="m-2 p-5" onSubmit={handleAddInventory}>
            <div className="row">
            <div className="col-lg-6 col-md-6 mb-4">
  <div className="form-group">
    <label htmlFor="userName" className="form-label text-light">
      User Name
    </label>
    <input
      id="userName"
      type="text"
      name="userName"
      className="form-control"
      placeholder="User Name"
      style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
      // auto-fill and lock down for non-admins:
      defaultValue={userType === "admin" ? "" : currentUserName}
      readOnly={userType !== "admin"}
    />
  </div>
</div>
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="SKUname" className="form-label text-light">
                    SKU Name
                  </label>
                  <input
                    id="SKUname"
                    type="text"
                    placeholder="SKU Name"
                    className="form-control"
                    name="SKUname"
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="quantity" className="form-label text-light">
                    Quantity
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    placeholder="Quantity"
                    className="form-control"
                    name="quantity"
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    min="0"
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="date" className="form-label text-light">
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    className="form-control"
                    name="date"
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="btn" style={{ backgroundColor: "#236a80", color: "white" }}>
              Add
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );

  // Submit handler for adding inventory
  const handleAddInventory = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      userName: formData.get("userName"),
      skuName: formData.get("SKUname"),
      quantity: formData.get("quantity"),
      date: formData.get("date"),
    };

    fetch(`${API_URL}/api/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error adding inventory");
        }
        return res.json();
      })
      .then((response) => {
        toast.success("Inventory successfully added!");
      })
      .catch((error) => {
        toast.error(`Error adding inventory: ${error.message}`);
      });
  };

  // Form to log usage of inventory items
  const renderUseInventory = () => {
    const handleUseInventory = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        sku: formData.get("SKU"),
        quantityUsed: parseInt(formData.get("quantityUsed"), 10),
        userName: formData.get("username"),
        usageDate: formData.get("usageDate"),
        notes: formData.get("notes"),
      };
  
      fetch(`${API_URL}/api/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Error logging usage");
          }
          return res.json();
        })
        .then((response) => {
          toast.success("Usage log added successfully");
          e.target.reset(); // Reset form after successful submission
        })
        .catch((error) => {
          toast.error(`Error: ${error.message}`);
        });
    };
  
    return (
      <div className="col-12">
        <h1 className="text-center mt-3">Use Inventory</h1>
        <div className="card">
          <div className="card-body">
            <form className="m-2 p-5" onSubmit={handleUseInventory}>
              <div className="row">
                <div className="col-lg-6 col-md-6 mb-4">
                  <div className="form-group">
                    <label htmlFor="SKU" className="form-label text-light">
                      SKU
                    </label>
                    <select
  id="SKU"
  name="SKU"
  className="form-control"
  style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
  required
>
  <option value="">Select SKU</option>
  {equipmentList.map(item => (
    <option key={item._id} value={item.skuName}>
      {item.skuName}
    </option>
  ))}
</select>

                  </div>
                </div>
                <div className="col-lg-6 col-md-6 mb-4">
                  <div className="form-group">
                    <label htmlFor="username" className="form-label text-light">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      className="form-control"
                      name="username"
                      style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                      defaultValue={currentUserName}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6 col-md-6 mb-4">
                  <div className="form-group">
                    <label htmlFor="quantityUsed" className="form-label text-light">
                      Quantity Used
                    </label>
                    <input
                      id="quantityUsed"
                      type="number"
                      placeholder="Quantity Used"
                      className="form-control"
                      name="quantityUsed"
                      style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 mb-4">
                  <div className="form-group">
                    <label htmlFor="usageDate" className="form-label text-light">
                      Date
                    </label>
                    <input
                      id="usageDate"
                      type="date"
                      className="form-control"
                      name="usageDate"
                      style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 mb-4">
                  <div className="form-group">
                    <label htmlFor="notes" className="form-label text-light">
                      Optional Notes
                    </label>
                    <textarea
                      id="notes"
                      placeholder="Notes"
                      className="form-control"
                      name="notes"
                      style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    ></textarea>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn" style={{ backgroundColor: "#236a80", color: "white" }}>
                Log Usage
              </button>
            </form>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  };

  // Form for users to request more inventory
  const renderRequestInventory = () => (
  
    <div className="col-12">
      <h1 className="text-center mt-3">Request Inventory</h1>
      <div className="card">
        <div className="card-body">
          <form className="m-2 p-5" onSubmit={handleRequestInventory}>
            <div className="row">
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="SKURequest" className="form-label text-light">
                    SKU
                  </label>
                  <input
                    id="SKURequest"
                    type="text"
                    placeholder="SKU"
                    className="form-control"
                    name="SKURequest"
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="requiredQuantity" className="form-label text-light">
                    Required Quantity
                  </label>
                  <input
                    id="requiredQuantity"
                    type="number"
                    placeholder="Required Quantity"
                    className="form-control"
                    name="requiredQuantity"
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="username" className="form-label text-light">
                    Username
                  </label>
                   <input
                  id="username"
                  type="text"
                  name="username"
                  className="form-control"
                  placeholder="username"
                  style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                  // if it's a regular user, prefill & lock it
                  defaultValue={userType === "user" ? currentUserName : ""}
                  readOnly={userType === "user"}
                />
                </div>
              </div>
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="reason" className="form-label text-light">
                    Optional Reason
                  </label>
                  <textarea
                    id="reason"
                    placeholder="Reason"
                    className="form-control"
                    name="reason"
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                  ></textarea>
                </div>
              </div>
            </div>
            <button type="submit" className="btn" style={{ backgroundColor: "#236a80", color: "white" }}>
              Request Inventory
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // Submit handler for request inventory
// Submit handler for request inventory
// Updated submit handler for request inventory
const handleRequestInventory = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      userName: formData.get("username"),
      skuName: formData.get("SKURequest"),
      quantityRequested: parseInt(formData.get("requiredQuantity"), 10), // convert string to number
      reason: formData.get("reason"),
    };
  
    fetch(`${API_URL}/api/addrequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error requesting inventory");
        }
        return res.json();
      })
      .then((response) => {
        toast.success("Inventory request submitted successfully!");
        // Optionally clear the form after successful submission
        e.target.reset();
      })
      .catch((error) => {
        toast.error(`Error: ${error.message}`);
      });
  };
  

  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: "white" }}>
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <HeaderSim />
            </div>
           
            <div className="col-12 m-3">{renderTabs()}</div>
            <div className="col-12">{renderContent()}</div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Inventory;
