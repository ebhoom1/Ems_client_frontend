import React, { useState } from "react";
import { useSelector } from "react-redux";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import Maindashboard from "../Maindashboard/Maindashboard";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const { userData } = useSelector((state) => state.user);

  // Determine initial tab for admin vs. user
  const [selectedTab, setSelectedTab] = useState(
    userData?.validUserOne?.userType === "admin" ? "adminView" : "addEquipment"
  );
  const navigate = useNavigate();

  // Existing arrays for equipment & faults (some sample data):
  const [equipmentList, setEquipmentList] = useState([
    {
      id: 1,
      equipmentName: "Pump 1",
      modelSerial: "P-12345",
      installationDate: "2025-01-10",
      location: "Site A",
      notes: "Initial installation",
    },
    {
      id: 2,
      equipmentName: "Flow Meter 2",
      modelSerial: "FM-54321",
      installationDate: "2025-02-05",
      location: "Site B",
      notes: "Calibrated",
    },
  ]);

  const [faultReports, setFaultReports] = useState([
    {
      id: 101,
      equipment: "Pump 1",
      faultDescription: "Leak detected near valve",
      reportedDate: "2025-03-20",
      status: "Pending Service",
      serviceDate: "",
      technicianName: "",
      serviceDetails: "",
      partsUsed: "",
      nextServiceDue: "",
    },
    {
      id: 102,
      equipment: "Flow Meter 2",
      faultDescription: "Inaccurate readings",
      reportedDate: "2025-03-22",
      status: "Serviced",
      serviceDate: "2025-03-23",
      technicianName: "John Doe",
      serviceDetails: "Recalibrated sensor and replaced battery",
      partsUsed: "Battery Model X",
      nextServiceDue: "2025-09-23",
    },
  ]);

  // Existing notifications array for service messages:
  const [notifications, setNotifications] = useState([
    'Equipment "Pump 1" added successfully.',
    'Fault reported for "Flow Meter 2".',
    "Service record updated for fault ID 102.",
  ]);

  // =====================
  // NEW: Notification Bell
  // =====================
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

  // State to control the visibility of the notifications panel
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const toggleNotificationPanel = () => {
    setShowNotificationPanel((prev) => !prev);
  };

  // Utility to map notification types to different badge colors
  const getBadgeClass = (type) => {
    switch (type) {
      case "Joined New User":
        return "bg-success"; // green
      case "Comment":
        return "bg-secondary"; // or a custom purple class
      case "Connect":
        return "bg-info"; // light blue
      case "Message":
        return "bg-warning"; // yellow/orange
      default:
        return "bg-primary";
    }
  };

  // =====================
  // Forms & Handlers
  // =====================
  const [equipmentName, setEquipmentName] = useState("");
  const [modelSerial, setModelSerial] = useState("");
  const [installationDate, setInstallationDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [faultDescription, setFaultDescription] = useState("");
  const [reportedDate, setReportedDate] = useState("");

  const [editingFaultId, setEditingFaultId] = useState(null);
  const [serviceDate, setServiceDate] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [serviceDetails, setServiceDetails] = useState("");
  const [partsUsed, setPartsUsed] = useState("");
  const [nextServiceDue, setNextServiceDue] = useState("");

  // Handle "Add Equipment"
  const handleAddEquipment = (e) => {
    e.preventDefault();
    const newEquipment = {
      id: Date.now(),
      equipmentName,
      modelSerial,
      installationDate,
      location,
      notes,
    };
    setEquipmentList([...equipmentList, newEquipment]);
    setNotifications([...notifications, `Equipment "${equipmentName}" added successfully.`]);
    setEquipmentName("");
    setModelSerial("");
    setInstallationDate("");
    setLocation("");
    setNotes("");
  };

  // Handle "Report Fault"
  const handleReportFault = (e) => {
    e.preventDefault();
    if (!selectedEquipment) return;
    const newFault = {
      id: Date.now(),
      equipment: selectedEquipment,
      faultDescription,
      reportedDate: reportedDate || new Date().toISOString().substr(0, 10),
      status: "Pending Service",
      serviceDate: "",
      technicianName: "",
      serviceDetails: "",
      partsUsed: "",
      nextServiceDue: "",
    };
    setFaultReports([...faultReports, newFault]);
    setNotifications([...notifications, `Fault reported for "${selectedEquipment}".`]);
    setSelectedEquipment("");
    setFaultDescription("");
    setReportedDate("");
  };

  // Handle Admin fault update
  const handleUpdateFault = (id) => {
    setFaultReports(
      faultReports.map((fault) =>
        fault.id === id
          ? {
              ...fault,
              serviceDate,
              technicianName,
              serviceDetails,
              partsUsed,
              nextServiceDue,
              status: "Serviced",
            }
          : fault
      )
    );
    setNotifications([...notifications, `Service record updated for fault ID ${id}.`]);
    setEditingFaultId(null);
    setServiceDate("");
    setTechnicianName("");
    setServiceDetails("");
    setPartsUsed("");
    setNextServiceDue("");
  };

  // =====================
  // Rendering Functions
  // =====================
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
            </div>
            <div className="row">
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
            </div>
            <div className="form-group mb-4">
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
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Model/Serial</th>
                <th>Installation Date</th>
                <th>Location</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map((equip) => (
                <tr key={equip.id}>
                  <td>{equip.equipmentName}</td>
                  <td>{equip.modelSerial}</td>
                  <td>{equip.installationDate}</td>
                  <td>{equip.location}</td>
                  <td>{equip.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReportFault = () => (
    <div className="col-12">
      <h1 className="text-center mt-3">Report Faulty Equipment</h1>
      <div className="card">
        <div className="card-body">
          <form className="m-2 p-5" onSubmit={handleReportFault}>
            <div className="row">
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="selectedEquipment" className="form-label">
                    Select Equipment
                  </label>
                  <select
                    id="selectedEquipment"
                    className="form-control"
                    name="selectedEquipment"
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    required
                  >
                    <option value="">Select Equipment</option>
                    {equipmentList.map((equip) => (
                      <option key={equip.id} value={equip.equipmentName}>
                        {equip.equipmentName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="faultDescription" className="form-label">
                    Fault Description
                  </label>
                  <textarea
                    id="faultDescription"
                    placeholder="Describe the fault"
                    className="form-control"
                    name="faultDescription"
                    value={faultDescription}
                    onChange={(e) => setFaultDescription(e.target.value)}
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="reportedDate" className="form-label">
                    Reported Date
                  </label>
                  <input
                    id="reportedDate"
                    type="date"
                    className="form-control"
                    name="reportedDate"
                    value={reportedDate}
                    onChange={(e) => setReportedDate(e.target.value)}
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <input
                    type="text"
                    value="Pending Service"
                    className="form-control"
                    readOnly
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="btn" style={{ backgroundColor: "#236a80", color: "white" }}>
              Report Fault
            </button>
          </form>
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
                  <th>Reported Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faultReports.map((fault) => (
                  <tr key={fault.id}>
                    <td>{fault.equipment}</td>
                    <td>{fault.faultDescription}</td>
                    <td>{fault.reportedDate}</td>
                    <td>{fault.status}</td>
                    <td>
                      {editingFaultId === fault.id ? (
                        <div>
                          <div className="mb-3">
                            <label htmlFor="serviceDate" className="form-label">
                              Service Date
                            </label>
                            <input
                              id="serviceDate"
                              type="date"
                              className="form-control"
                              name="serviceDate"
                              value={serviceDate}
                              onChange={(e) => setServiceDate(e.target.value)}
                              style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="technicianName" className="form-label">
                              Technician Name
                            </label>
                            <input
                              id="technicianName"
                              type="text"
                              placeholder="Technician Name"
                              className="form-control"
                              name="technicianName"
                              value={technicianName}
                              onChange={(e) => setTechnicianName(e.target.value)}
                              style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="serviceDetails" className="form-label">
                              Service Details
                            </label>
                            <textarea
                              id="serviceDetails"
                              placeholder="Service Details"
                              className="form-control"
                              name="serviceDetails"
                              value={serviceDetails}
                              onChange={(e) => setServiceDetails(e.target.value)}
                              style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="partsUsed" className="form-label">
                              Parts Used
                            </label>
                            <input
                              id="partsUsed"
                              type="text"
                              placeholder="Parts Used"
                              className="form-control"
                              name="partsUsed"
                              value={partsUsed}
                              onChange={(e) => setPartsUsed(e.target.value)}
                              style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="nextServiceDue" className="form-label">
                              Next Service Due
                            </label>
                            <input
                              id="nextServiceDue"
                              type="date"
                              className="form-control"
                              name="nextServiceDue"
                              value={nextServiceDue}
                              onChange={(e) => setNextServiceDue(e.target.value)}
                              style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                            />
                          </div>
                          <button
                            onClick={() => handleUpdateFault(fault.id)}
                            className="btn me-2"
                            style={{ backgroundColor: "#236a80", color: "white" }}
                          >
                            Update Service Record
                          </button>
                          <button onClick={() => setEditingFaultId(null)} className="btn btn-secondary">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingFaultId(fault.id);
                            setServiceDate(fault.serviceDate);
                            setTechnicianName(fault.technicianName);
                            setServiceDetails(fault.serviceDetails);
                            setPartsUsed(fault.partsUsed);
                            setNextServiceDue(fault.nextServiceDue);
                          }}
                          className="btn"
                          style={{ backgroundColor: "#236a80", color: "white" }}
                        >
                          Edit
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
    const history = equipmentList.map((equip) => {
      const faultsForEquip = faultReports.filter(
        (fault) => fault.equipment === equip.equipmentName
      );
      const frequency = faultsForEquip.length;
      const technicians = Array.from(
        new Set(faultsForEquip.map((fault) => fault.technicianName).filter(Boolean))
      );
      return {
        equipment: equip.equipmentName,
        faults: faultsForEquip,
        frequency,
        technicians,
      };
    });

    return (
      <div className="col-12">
        <h1 className="text-center mt-3">Service History</h1>
        {history.length === 0 ? (
          <p>No equipment history available.</p>
        ) : (
          <table className="table table-striped table-bordered text-light">
            <thead>
              <tr>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Equipment</th>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Dates Reported</th>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Service Dates</th>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Technicians</th>
                <th style={{ backgroundColor: "#236a80", color: "#fff" }}>Fault Descriptions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => {
                const reportedDates = item.faults
                  .map((f) => f.reportedDate)
                  .join(", ");
                const serviceDates = item.faults
                  .map((f) => f.serviceDate || "Not serviced yet")
                  .join(", ");
                const technicians =
                  item.technicians.length > 0
                    ? item.technicians.join(", ")
                    : "N/A";
                const faultDescriptions = item.faults
                  .map((f) => f.faultDescription || "N/A")
                  .join(", ");

                return (
                  <tr key={index}>
                    <td>{item.equipment}</td>
                    <td>{reportedDates}</td>
                    <td>{serviceDates}</td>
                    <td>{technicians}</td>
                    <td>{faultDescriptions}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // =====================
  // Tab Navigation
  // =====================
  const renderTabs = () => {
    const tabStyle = (tabKey) => {
      return selectedTab === tabKey
        ? { color: "#236a80", fontWeight: "bold" }
        : { color: "black" };
    };

    if (userData?.validUserOne?.userType === "admin") {
      return (
        <div>
          <div className="d-flex align-items-center justify-content-center mb-2">
            <button onClick={() => navigate('/inventory')} className="w-25 btn btn-outline-success me-2">
              Inventory
            </button>
            <button onClick={() => navigate('/services')} className="w-25 btn btn-outline-success">
              Services
            </button>
          </div>
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button
                className="nav-link"
                style={tabStyle("adminView")}
                onClick={() => setSelectedTab("adminView")}
              >
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
            <li className="nav-item">
              <button
                className="nav-link"
                style={tabStyle("reportFault")}
                onClick={() => setSelectedTab("reportFault")}
              >
                Report Fault
              </button>
            </li>
            {/* Admin-only Notification Bell */}
            <li
              className="nav-item ms-auto"
              style={{ marginLeft: "auto", position: "relative" }}
            >
              <button
                className="btn position-relative"
                type="button"
                onClick={toggleNotificationPanel}
              >
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
                  <div
                    className="card-body"
                    style={{ maxHeight: "300px", overflowY: "auto", color: "#fff" }}
                  >
                    {notificationList.map((notif) => (
                      <div
                        key={notif.id}
                        className="mb-3"
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <span className={`badge me-2 ${getBadgeClass(notif.type)}`}>
                            {notif.type}
                          </span>
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
            </li>
          </ul>
        </div>
      );
    } else {
      // User tabs (notification removed)
      return (
        <div>
          <div className="d-flex align-items-center justify-content-center">
            <button onClick={() => navigate('/inventory')} className="w-25 btn btn-outline-success me-2">
              Inventory
            </button>
            <button onClick={() => navigate('/services')} className="w-25 btn btn-outline-success">
              Services
            </button>
          </div>
          <ul className="nav nav-tabs mb-3 mt-3">
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
            <li className="nav-item">
              <button
                className="nav-link"
                style={tabStyle("reportFault")}
                onClick={() => setSelectedTab("reportFault")}
              >
                Report Fault
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
      if (selectedTab === "reportFault") return renderReportFault();
    } else {
      if (selectedTab === "addEquipment") return renderAddEquipment();
      if (selectedTab === "equipmentList") return renderEquipmentList();
      if (selectedTab === "reportFault") return renderReportFault();
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
            <div
              className={`col-12 ${
                userData?.validUserOne?.userType === "user" ? "mt-5" : ""
              }`}
            >
              <Maindashboard />
            </div>

            {/* Render the Tabs (including the Notification Bell) */}
            <div className="col-12 m-3">{renderTabs()}</div>

            {/* Render the selected tab's content */}
            <div className="col-12">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
