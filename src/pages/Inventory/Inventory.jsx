// Inventory.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Maindashboard from "../Maindashboard/Maindashboard";
import Header from "../Header/Hedaer"; // Note: Typo 'Hedaer' should be 'Header'
import DashboardSam from "../Dashboard/DashboardSam";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/apiConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./AdminDashboard";
import HeaderSim from "../Header/HeaderSim";

// RequestHistory component for non-admin users (UNCHANGED, but included for completeness)
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
                    url = `${API_URL}/api/getrequest`;
                } else {
                    url = `${API_URL}/api/user-request/${userData?.validUserOne?.userName}`;
                }

                const response = await fetch(url);
                const data = await response.json();

                if (response.ok) {
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
    }, [userData]);
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

// InventoryList component (UNCHANGED, but included for completeness)
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

        if (userData?.validUserOne?.userName) {
            fetchInventory();
        }
    }, [userData]);

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

    // State for top-level tabs (Inventory, Services, Daily Log)
    // We'll manage navigation to these via react-router-dom, so no `activeTopTab` state is strictly needed here for the buttons,
    // as this component only renders if `/inventory` is the route.
    // However, we still need `activeTab` for the *sub-tabs* within Inventory.
    const [activeInventoryTab, setActiveInventoryTab] = useState("addedlist"); // Default sub-tab for Inventory
    const [equipmentList, setEquipmentList] = useState([]);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [modalUsers, setModalUsers] = useState([]);
    const [selectedModalUser, setSelectedModalUser] = useState("");
    const adminType = userData?.validUserOne?.adminType;


    useEffect(() => {
        if (userType === "admin") {
            (async () => {
                try {
                    const res = await fetch(
                        `${API_URL}/api/get-users-by-adminType/${adminType}`
                    );
                    const body = await res.json();
                    setModalUsers(body.users || []);
                } catch (err) {
                    toast.error("Error fetching user list");
                }
            })();
        }
    }, [userType, adminType]);

    // Consolidated useEffect for fetching equipmentList based on userType
    useEffect(() => {
        const fetchEquipmentList = async () => {
            try {
                let url;
                if (userType === "admin") {
                    url = `${API_URL}/api/inventory/get`; // Fetch all inventory for admin
                } else {
                    url = `${API_URL}/api/user?userName=${currentUserName}`; // Fetch user's specific inventory
                }

                const res = await fetch(url);
                const data = await res.json();

                if (res.ok) {
                    let skusToDisplay = [];
                    if (userType === "admin") {
                        skusToDisplay = data.inventoryItems ? data.inventoryItems.map(item => item.skuName) : [];
                        skusToDisplay = [...new Set(skusToDisplay)];
                    } else {
                        skusToDisplay = data.inventoryItems || [];
                    }
                    setEquipmentList(skusToDisplay);
                } else {
                    console.error("Error fetching equipment list:", data.message || "Unknown error");
                }
            } catch (err) {
                console.error("Error fetching equipment list:", err);
            }
        };

        if (currentUserName) fetchEquipmentList();
    }, [currentUserName, userType]);


    // **UPDATED renderTabs Function: Always show top-level tabs, then conditional sub-tabs**
    const renderTabs = () => (
        <>
            {/* Top-level navigation (always visible for all users) */}
            <div className="row gx-3 gy-2 justify-content-center mb-4">
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <button
                        onClick={() => navigate("/inventory")} // Navigates to this component
                        className="btn btn-success w-100" // Keep Inventory button active if on this page
                    >
                        Inventory
                    </button>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <button
                        onClick={() => navigate("/services")}
                        className="btn btn-outline-success w-100"
                    >
                        Services
                    </button>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <button
                        onClick={() => {
                            if (userType === "admin") {
                                setShowModal(true); // For admin, show modal to select user
                            } else {
                                navigate("/dailylogs"); // For user/operator, go directly to their daily log
                            }
                        }}
                        className="btn btn-outline-success w-100"
                    >
                        Daily Log
                    </button>
                </div>
            </div>

            {/* Sub-tabs for Inventory (only for non-admin users when on Inventory page) */}
          {userType !== "admin" && (
  <ul className="nav nav-tabs justify-content-center mt-3">
    {[
      { key: "add",      label: "Add Inventory" },
      { key: "use",      label: "Use Inventory" },
      { key: "addedlist",label: "Inventory List" },
      { key: "request",  label: "Request Inventory" },
      { key: "requestHistory", label: "Request History" }
    ].map(({ key, label }) => {
      const isActive = activeInventoryTab === key;
      return (
        <li className="nav-item" key={key}>
          <button
            type="button"
            className="nav-link btn"
            onClick={() => setActiveInventoryTab(key)}
            style={{
              color: isActive ? "#236a80" : "black",
              background: "transparent",
              border: "none",
              fontWeight: isActive ? "600" : "400"
            }}
          >
            {label}
          </button>
        </li>
      );
    })}
  </ul>
)}


        </>
    );

    // **UPDATED renderContent Function: Use activeInventoryTab for non-admins**
    const renderContent = () => {
        if (userType === "admin") {
            return <AdminDashboard />;
        } else {
            // Render content based on the activeInventoryTab for non-admins
            switch (activeInventoryTab) {
                case "add":
                    return renderAddInventory();
                case "use":
                    return renderUseInventory();
                case "addedlist":
                    return <InventoryList />;
                case "request":
                    return renderRequestInventory();
                case "requestHistory":
                    return <RequestHistory />;
                default:
                    return <InventoryList />; // Default to Inventory List for non-admins
            }
        }
    };

    // Form to add inventory items (UNCHANGED)
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

    // Submit handler for adding inventory (UNCHANGED)
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

    // Form to log usage of inventory items (UNCHANGED - SKU dropdown map already updated in prior turn)
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
                                                <option key={item._id || item} value={item.skuName || item}>
                                                    {item.skuName || item}
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

    // Form for users to request more inventory (UNCHANGED)
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

    // Submit handler for request inventory (UNCHANGED)
    const handleRequestInventory = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            userName: formData.get("username"),
            skuName: formData.get("SKURequest"),
            quantityRequested: parseInt(formData.get("requiredQuantity"), 10),
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

                        <div className="col-12 m-3">{renderTabs()}</div> {/* This will now render conditional tabs */}
                        <div className="col-12">{renderContent()}</div> {/* This will render conditional content */}

                        {showModal && (
                            <div
                                className="modal show"
                                tabIndex={-1}
                                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
                            >
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Select User for Daily Log</h5>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() => setShowModal(false)}
                                            />
                                        </div>
                                        <div className="modal-body">
                                            <select
                                                className="form-select"
                                                value={selectedModalUser}
                                                onChange={(e) => setSelectedModalUser(e.target.value)}
                                            >
                                                <option value="">-- Select a user --</option>
                                                {modalUsers.map((u) => (
                                                    <option key={u.userName} value={u.userName}>
                                                        {u.userName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="modal-footer">
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => setShowModal(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                style={{ backgroundColor: '#236a80', color: '#fff' }}
                                                className="btn "
                                                disabled={!selectedModalUser}
                                                onClick={() => {
                                                    navigate(`/admin/report/${selectedModalUser}`);
                                                    setShowModal(false);
                                                }}
                                            >
                                                Go
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Inventory;