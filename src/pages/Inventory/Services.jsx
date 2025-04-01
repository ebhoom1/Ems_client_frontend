import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import Maindashboard from "../Maindashboard/Maindashboard";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../utils/apiConfig";
import ReportFault from "./ReportFault";
import Log from "../Login/Log";

const Services = () => {
  const { userData } = useSelector((state) => state.user);
  console.log('userDetails',userData);
  
  const navigate = useNavigate();

  // Determine initial tab for admin vs. user
  const [selectedTab, setSelectedTab] = useState(
    userData?.validUserOne?.userType === "admin" ? "adminView" : "reportFault"
  );

  // Equipment and fault data
  const [equipmentList, setEquipmentList] = useState([]);
  const [faultReports, setFaultReports] = useState([]);
  const [editingFault, setEditingFault] = useState(null);
  const [serviceDetails, setServiceDetails] = useState({
    serviceDate: "",
    technicianName: "",
    serviceDetails: "",
    partsUsed: "",
    nextServiceDue: "",
    status: "Pending"
  });

  // Notifications for service messages
  const [notifications] = useState([
    'Equipment "Pump 1" added successfully.',
    'Fault reported for "Flow Meter 2".',
    "Service record updated for fault ID 102.",
  ]);

  // Notification Bell Data
  const [notificationList] = useState([
    {
      id: 1,
      type: "Joined New User",
      title: "Equipment Pump 1 added successfully.",
      user: "Allen Dequ",
      date: "24 Nov 2018 at 9:30 AM",
    },
    {
      id: 2,
      type: "Comment",
      title: "Fault reported for Flow Meter 2",
      user: "Arin Gansharan",
      date: "24 Nov 2018 at 9:30 AM",
    },
    {
      id: 3,
      type: "Connect",
      title: "Juliet Den Connect Allen Depk",
      user: "Juliet Den",
      date: "24 Nov 2018 at 9:30 AM",
    },
    {
      id: 4,
      type: "Message",
      title: "Darren Smith sent new message",
      user: "Darren Smith",
      date: "24 Nov 2018 at 9:30 AM",
    },
  ]);

  // Controls for Notification Bell
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const toggleNotificationPanel = () => setShowNotificationPanel((prev) => !prev);
  const getBadgeClass = (type) => {
    switch (type) {
      case "Joined New User":
        return "bg-success";
      case "Comment":
        return "bg-secondary";
      case "Connect":
        return "bg-info";
      case "Message":
        return "bg-warning";
      default:
        return "bg-primary";
    }
  };

  // States for Add Equipment form
  const [equipmentName, setEquipmentName] = useState("");
  const [userName, setUsername] = useState("");
  const [modelSerial, setModelSerial] = useState("");
  const [installationDate, setInstallationDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Add Equipment Handler
  const handleAddEquipment = async (e) => {
    e.preventDefault();
    const newEquipment = {
      equipmentName,
      userName,
      modelSerial,
      installationDate,
      location,
      notes,
    };

    try {
      const res = await fetch(`${API_URL}/api/add-equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEquipment),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Equipment added successfully");
        setEquipmentList((prev) => [...prev, data.equipment]);
        setUsername("");
        setEquipmentName("");
        setModelSerial("");
        setInstallationDate("");
        setLocation("");
        setNotes("");
      } else {
        toast.error(data.message || "Failed to add equipment");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  // Fetch equipment list from backend
 // Fetch equipment list from backend
// Fetch equipment list from backend
// Fetch equipment list from backend
useEffect(() => {
  const fetchEquipmentList = async () => {
    try {
      let url;
      
      if (userData?.validUserOne?.userType === "user") {
        // For regular users - fetch only their equipment
        url = `${API_URL}/api/user/${userData?.validUserOne?.userName}`;
      } else if (userData?.validUserOne?.userType === "admin") {
        // For admin users - fetch equipment based on their adminType
        url = `${API_URL}/api/admin-type-equipment/${userData?.validUserOne?.adminType}`;
      } else {
        // Fallback (shouldn't normally happen)
        url = `${API_URL}/api/all-equipment`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        // Handle both response formats:
        // - Regular response: { equipment: [...] }
        // - Admin-type response: { inventoryItems: [...] } or direct array
        const equipmentData = data.equipment || data.inventoryItems || data;
        setEquipmentList(Array.isArray(equipmentData) ? equipmentData : []);
      } else {
        toast.error(data.message || "Failed to fetch equipment list");
      }
    } catch (error) {
      toast.error("Error fetching equipment list");
    }
  };
  fetchEquipmentList();
}, [userData]);
  // Fetch fault reports from backend
 // Fetch fault reports from backend
 useEffect(() => {
  const fetchFaults = async () => {
    try {
      let url;
      
      if (userData?.validUserOne?.userType === "user") {
        // For regular users - fetch only their faults
        url = `${API_URL}/api/fault-user/${userData?.validUserOne?.userName}`;
      } else if (userData?.validUserOne?.userType === "admin") {
        // For admin users - fetch faults based on their adminType
        url = `${API_URL}/api/admin-type-fault/${userData?.validUserOne?.adminType}`;
      } else {
        // Fallback (shouldn't normally happen)
        url = `${API_URL}/api/all-faults`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setFaultReports(data.faults || []);
      } else {
        toast.error("Failed to fetch fault reports");
      }
    } catch (error) {
      toast.error("Server error while fetching faults");
    }
  };
  fetchFaults();
}, [userData]);

  // Callback to update fault reports when a new fault is reported
  const handleNewFault = (newFault) => {
    setFaultReports((prev) => [...prev, newFault]);
  };

  // Handle service status update
  const handleUpdateService = async (faultId) => {
    try {
      const res = await fetch(`${API_URL}/api/update-fault/${faultId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceDetails),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Service record updated successfully");
        setFaultReports(faultReports.map(fault => 
          fault._id === faultId ? { ...fault, ...serviceDetails } : fault
        ));
        setEditingFault(null);
      } else {
        toast.error(data.message || "Failed to update service record");
      }
    } catch (error) {
      toast.error("Server error while updating service record");
    }
  };

  // Render functions for various tabs
  const renderAddEquipment = () => (
    <div className="col-12">
      <h1 className="text-center mt-3">Add Equipment</h1>
      <div className="card">
        <div className="card-body">
          <form className="m-2 p-5" onSubmit={handleAddEquipment}>
            <div className="row">
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="equipmentName" className="form-label">
                    Equipment Name
                  </label>
                  <input
                    id="equipmentName"
                    type="text"
                    placeholder="e.g. Pump 1"
                    className="form-control"
                    name="equipmentName"
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    required
                  />
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
                    placeholder="Username"
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
                  <label htmlFor="modelSerial" className="form-label">
                    Model No / Serial
                  </label>
                  <input
                    id="modelSerial"
                    type="text"
                    placeholder="Model No / Serial"
                    className="form-control"
                    name="modelSerial"
                    value={modelSerial}
                    onChange={(e) => setModelSerial(e.target.value)}
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    required
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="installationDate" className="form-label">
                    Installation Date
                  </label>
                  <input
                    id="installationDate"
                    type="date"
                    className="form-control"
                    name="installationDate"
                    value={installationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    required
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    placeholder="Location"
                    className="form-control"
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    required
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-6 mb-4">
                <label htmlFor="notes" className="form-label">
                  Optional Notes
                </label>
                <textarea
                  id="notes"
                  placeholder="Optional Notes"
                  className="form-control"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                />
              </div>
            </div>
            <button type="submit" className="btn" style={{ backgroundColor: "#236a80", color: "white" }}>
              Add Equipment
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderEquipmentList = () => (
    <div className="col-12">
      <h1 className="text-center mt-3">Equipment List</h1>
      <div className="card">
        <div className="card-body">
          {equipmentList.length === 0 ? (
            <p>No equipment found</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Equipment Name</th>
                  <th>Username</th>
                  <th>Model/Serial</th>
                  <th>Installation Date</th>
                  <th>Location</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {equipmentList.map((equip, index) => (
                  <tr key={equip._id || index}>
                    <td>{equip.equipmentName || 'N/A'}</td>
                    <td>{equip.userName || 'N/A'}</td>
                    <td>{equip.modelSerial || 'N/A'}</td>
                    <td>{equip.installationDate || 'N/A'}</td>
                    <td>{equip.location || 'N/A'}</td>
                    <td>{equip.notes || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div className="col-12">
      <h1 className="text-center mt-3">Admin View of Service Requests</h1>
      <div className="card">
        <div className="card-body">
          {faultReports.length === 0 ? (
            <p>No fault reports available.</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Fault Description</th>
                  <th>Reported By</th>
                  <th>Reported Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faultReports.map((fault) => (
                  <tr key={fault._id}>
                    <td>{fault.equipmentName}</td>
                    <td>{fault.faultDescription}</td>
                    <td>{fault.userName}</td>
                    <td>{new Date(fault.reportedDate).toLocaleDateString()}</td>
                    <td>{fault.status}</td>
                    <td>
                      {editingFault === fault._id ? (
                        <div className="service-update-form">
                          <div className="mb-2">
                            <label>Service Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={serviceDetails.serviceDate}
                              onChange={(e) => setServiceDetails({...serviceDetails, serviceDate: e.target.value})}
                            />
                          </div>
                          <div className="mb-2">
                            <label>Technician Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={serviceDetails.technicianName}
                              onChange={(e) => setServiceDetails({...serviceDetails, technicianName: e.target.value})}
                            />
                          </div>
                          <div className="mb-2">
                            <label>Service Details</label>
                            <textarea
                              className="form-control"
                              value={serviceDetails.serviceDetails}
                              onChange={(e) => setServiceDetails({...serviceDetails, serviceDetails: e.target.value})}
                            />
                          </div>
                          <div className="mb-2">
                            <label>Parts Used</label>
                            <input
                              type="text"
                              className="form-control"
                              value={serviceDetails.partsUsed}
                              onChange={(e) => setServiceDetails({...serviceDetails, partsUsed: e.target.value})}
                            />
                          </div>
                          <div className="mb-2">
                            <label>Next Service Due</label>
                            <input
                              type="date"
                              className="form-control"
                              value={serviceDetails.nextServiceDue}
                              onChange={(e) => setServiceDetails({...serviceDetails, nextServiceDue: e.target.value})}
                            />
                          </div>
                          <div className="mb-2">
                            <label>Status</label>
                            <select
                              className="form-control"
                              value={serviceDetails.status}
                              onChange={(e) => setServiceDetails({...serviceDetails, status: e.target.value})}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Serviced">Serviced</option>
                            </select>
                          </div>
                          <button 
                            className="btn btn-success me-2"
                            onClick={() => handleUpdateService(fault._id)}
                          >
                            Save
                          </button>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => setEditingFault(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingFault(fault._id);
                            setServiceDetails({
                              serviceDate: fault.serviceDate || "",
                              technicianName: fault.technicianName || "",
                              serviceDetails: fault.serviceDetails || "",
                              partsUsed: fault.partsUsed || "",
                              nextServiceDue: fault.nextServiceDue || "",
                              status: fault.status || "Pending"
                            });
                          }}
                          className="btn"
                          style={{ backgroundColor: "#236a80", color: "white" }}
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );

  const renderServiceHistory = () => {
    // For regular users, we already filtered at the API level, but we can double-check here
    const userFaults = userData?.validUserOne?.userType === "admin" 
      ? faultReports 
      : faultReports.filter(fault => fault.userName === userData?.validUserOne?.userName);
  
    return (
      <div className="col-12">
        <h1 className="text-center mt-3">Service History</h1>
        {userFaults.length === 0 ? (
          <p>No service history available.</p>
        ) : (
          <div className="card">
            <div className="card-body">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Username</th>
                    <th>Fault Description</th>
                    <th>Reported Date</th>
                    <th>Status</th>
                    <th>Service Date</th>
                    <th>Technician</th>
                    <th>Service Details</th>
                  </tr>
                </thead>
                <tbody>
                  {userFaults.map((fault) => (
                    <tr key={fault._id}>
                      <td>{fault.equipmentName}</td>
                      <td>{fault.userName}</td>
                      <td>{fault.faultDescription}</td>
                      <td>{new Date(fault.reportedDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          fault.status === 'Serviced' ? 'bg-success' : 'bg-warning'
                        }`}>
                          {fault.status}
                        </span>
                      </td>
                      <td>{fault.serviceDate ? new Date(fault.serviceDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{fault.technicianName || 'N/A'}</td>
                      <td>{fault.serviceDetails || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTabs = () => {
    const tabStyle = (tabKey) =>
      selectedTab === tabKey ? { color: "#236a80", fontWeight: "bold" } : { color: "black" };

    if (userData?.validUserOne?.userType === "admin") {
      return (
        <div>
          <div className="d-flex align-items-center justify-content-center mb-2">
            <button onClick={() => navigate("/inventory")} className="w-25 btn btn-outline-success me-2">
              Inventory
            </button>
            <button onClick={() => navigate("/services")} className="w-25 btn btn-outline-success">
              Services
            </button>
          </div>
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button className="nav-link" style={tabStyle("adminView")} onClick={() => setSelectedTab("adminView")}>
                Admin Service Requests
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link"
                style={tabStyle("serviceHistory")}
                onClick={() => setSelectedTab("serviceHistory")}
              >
                Service History
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link"
                style={tabStyle("addEquipment")}
                onClick={() => setSelectedTab("addEquipment")}
              >
                Add Equipment
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link"
                style={tabStyle("equipmentList")}
                onClick={() => setSelectedTab("equipmentList")}
              >
                Equipment List
              </button>
            </li>
            {/* <li className="nav-item">
              <button
                className="nav-link"
                style={tabStyle("reportFault")}
                onClick={() => setSelectedTab("reportFault")}
              >
                Report Fault
              </button>
            </li> */}
           {/*  <li className="nav-item ms-auto" style={{ marginLeft: "auto", position: "relative" }}>
              <button className="btn position-relative" type="button" onClick={toggleNotificationPanel}>
                <i className="fas fa-bell fa-lg"></i>
                {notificationList.length > 0 && (
                  <span
                    style={{ color: "#fff" }}
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  >
                    {notificationList.length}
                  </span>
                )}
              </button>
              {showNotificationPanel && (
                <div
                  className="card"
                  style={{
                    position: "absolute",
                    top: "40px",
                    right: 0,
                    width: "400px",
                    zIndex: 999,
                    border: "none",
                  }}
                >
                  <div style={{ color: "#fff" }} className="card-header border-none">
                    Notifications
                  </div>
                  <div className="card-body" style={{ maxHeight: "300px", overflowY: "auto", color: "#fff" }}>
                    {notificationList.map((notif) => (
                      <div key={notif.id} className="mb-3" style={{ borderBottom: "1px solid #eee" }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <span className={`badge me-2 ${getBadgeClass(notif.type)}`}>{notif.type}</span>
                          <small className="text-muted text-secondary">{notif.date}</small>
                        </div>
                        <h6 className="mt-2">{notif.title}</h6>
                        <p className="mb-1" style={{ fontSize: "14px" }}>
                          {notif.content}
                        </p>
                        <small className="text-primary">{notif.user}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li> */}
          </ul>
        </div>
      );
    } else {
      return (
        <div>
          <div className="d-flex align-items-center justify-content-center">
            <button onClick={() => navigate("/inventory")} className="w-25 btn btn-outline-success me-2">
              Inventory
            </button>
            <button onClick={() => navigate("/services")} className="w-25 btn btn-outline-success">
              Services
            </button>
          </div>
          <ul className="nav nav-tabs mb-3 mt-3">
            <li className="nav-item">
              <button className="nav-link" style={tabStyle("addEquipment")} onClick={() => setSelectedTab("addEquipment")}>
                Add Equipment
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link" style={tabStyle("equipmentList")} onClick={() => setSelectedTab("equipmentList")}>
                Equipment List
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link" style={tabStyle("reportFault")} onClick={() => setSelectedTab("reportFault")}>
                Report Fault
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link" style={tabStyle("serviceHistory")} onClick={() => setSelectedTab("serviceHistory")}>
                Service History
              </button>
            </li>
          </ul>
        </div>
      );
    }
  };

  const renderContent = () => {
    if (userData?.validUserOne?.userType === "admin") {
      if (selectedTab === "adminView") return renderAdminView();
      if (selectedTab === "serviceHistory") return renderServiceHistory();
      if (selectedTab === "addEquipment") return renderAddEquipment();
      if (selectedTab === "equipmentList") return renderEquipmentList();
      if (selectedTab === "reportFault")
        return <ReportFault equipmentList={equipmentList} onFaultReported={handleNewFault} />;
    } else {
      if (selectedTab === "addEquipment") return renderAddEquipment();
      if (selectedTab === "equipmentList") return renderEquipmentList();
      if (selectedTab === "reportFault")
        return <ReportFault equipmentList={equipmentList} onFaultReported={handleNewFault}  defaultUsername={userData?.validUserOne?.userName} />;
      if (selectedTab === "serviceHistory") return renderServiceHistory();
    }
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
              <Header />
            </div>
            <div className={`col-12 ${userData?.validUserOne?.userType === "user" ? "mt-5" : ""}`}>
              <Maindashboard />
            </div>
            <div className="col-12 m-3">{renderTabs()}</div>
            <div className="col-12">{renderContent()}</div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Services;