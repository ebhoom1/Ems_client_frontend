import React, { useState } from "react";
import { useSelector } from "react-redux";
import Maindashboard from "../Maindashboard/Maindashboard";
import Header from "../Header/Hedaer";
import DashboardSam from "../Dashboard/DashboardSam";
import { Navigate, useNavigate } from "react-router-dom";

const Inventory = () => {
  const { userData } = useSelector((state) => state.user);
  // Determine user type from stored user data
  const userType = userData?.validUserOne?.userType;
  // Use "add" as default tab for plant operators, and "admin" for admin users
  const [activeTab, setActiveTab] = useState(userType === "admin" ? "admin" : "add");
  const navigate = useNavigate();

  // Render tab navigation based on user type
  const renderTabs = () => {
    if (userType === "admin") {
      return (
       <div> <div className="d-flex align-items-center justify-content-center">
       <button onClick={() => navigate('/inventory')} className="w-25 btn btn-outline-success me-2">Inventory</button> 
       <button onClick={() => navigate('/services')} className="w-25 btn btn-outline-success">
   Services
 </button>
       </div>
         <ul className="nav nav-tabs mb-3">
           <li className="nav-item">
             <button
               className={`nav-link ${activeTab === "admin" ? "active" : ""}`}
               onClick={() => setActiveTab("admin")}
             >
               Admin Dashboard
             </button>
           </li>
         </ul></div>
      );
    } else {
      return (
        
       <div>
      <div className="d-flex align-items-center justify-content-center">
      <button onClick={() => navigate('/inventory')} className="w-25 btn btn-outline-success me-2">Inventory</button> 
      <button onClick={() => navigate('/services')} className="w-25 btn btn-outline-success">
  Services
</button>
      </div>
        <ul className="nav nav-tabs mb-3 mt-3">
       <li className="nav-item">
  <button
    style={
      activeTab === "add"
        ? { color: "#236a80", fontWeight: "bold" }
        : { color: "black" }
    }
    className={`nav-link ${activeTab === "add" ? "active" : ""}`}
    onClick={() => setActiveTab("add")}
  >
    Add Inventory
  </button>
</li>

<li className="nav-item">
  <button
    style={
      activeTab === "use"
        ? { color: "#236a80", fontWeight: "bold" }
        : { color: "black" }
    }
    className={`nav-link ${activeTab === "use" ? "active" : ""}`}
    onClick={() => setActiveTab("use")}
  >
    Use Inventory
  </button>
</li>
<li className="nav-item">
  <button
    style={
      activeTab === "request"
        ? { color: "#236a80", fontWeight: "bold" }
        : { color: "black" }
    }
    className={`nav-link ${activeTab === "request" ? "active" : ""}`}
    onClick={() => setActiveTab("request")}
  >
    Request Inventory
  </button>
</li>

        </ul></div>
      );
    }
  };

  // Render the content based on active tab and user type
  const renderContent = () => {
    if (userType === "admin") {
      return renderAdminDashboard();
    } else {
      if (activeTab === "add") return renderAddInventory();
      if (activeTab === "use") return renderUseInventory();
      if (activeTab === "request") return renderRequestInventory();
    }
  };

  // Form to add inventory items (SKU Name & Quantity)
  const renderAddInventory = () => (
    <div className="col-12">
      <h1 className="text-center mt-3">Add Inventory</h1>
      <div className="card">
        <div className="card-body">
          <form className="m-2 p-5">
            <div className="row">
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
            </div>
            <button type="submit" className="btn" style={{ backgroundColor: "#236a80", color: "white" }}>
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // Form to log usage of inventory items (SKU, Quantity Used, Date, Optional Notes)
  const renderUseInventory = () => (
    <div className="col-12">
      <h1 className="text-center mt-3">Use Inventory</h1>
      <div className="card">
        <div className="card-body">
          <form className="m-2 p-5">
            <div className="row">
              <div className="col-lg-6 col-md-6 mb-4">
                <div className="form-group">
                  <label htmlFor="SKU" className="form-label text-light">
                    SKU
                  </label>
                  <input
                    id="SKU"
                    type="text"
                    placeholder="SKU"
                    className="form-control"
                    name="SKU"
                    style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
                  />
                </div>
              </div>
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
                  />
                </div>
              </div>
            </div>
            <div className="row">
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
    </div>
  );

  // Form for users to request more inventory (SKU, Required Quantity, Optional Reason)
  const renderRequestInventory = () => (
    <div className="col-12">
      <h1 className="text-center mt-3">Request Inventory</h1>
      <div className="card">
        <div className="card-body">
          <form className="m-2 p-5">
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
              <div className="col-12 mb-4">
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

  // Admin dashboard for viewing all inventories, approving/rejecting requests,
  // updating delivered quantities, and tracking history per SKU.
  const renderAdminDashboard = () => (
    <div className="col-12">
      <h1 className="text-center mt-3">Admin Inventory Dashboard</h1>
      
      {/* Table 1: Current Inventory and Pending Requests */}
      <div className="card mb-4">
        <div className="card-header text-light">
          Current Inventory and Requests
        </div>
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Requests</th>
                <th>Delivered Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy rows for demonstration */}
              <tr>
                <td>SKU001</td>
                <td>100</td>
                <td>
                  <p>Request Pending: 50</p>
                </td>
                <td>0</td>
                <td>
                  <button className="btn btn-success btn-sm mr-2 me-2">Approve</button>
                  <button className="btn btn-danger btn-sm">Reject</button>
                </td>
              </tr>
              <tr>
                <td>SKU002</td>
                <td>200</td>
                <td>
                  <p>Request Pending: 30</p>
                </td>
                <td>0</td>
                <td>
                  <button className="btn btn-success btn-sm mr-2 me-2">Approve</button>
                  <button className="btn btn-danger btn-sm">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Table 2: Update Delivered Quantity */}
      <div className="card mb-4">
        <div className="card-header  text-light">
          Update Delivered Quantity
        </div>
        <div className="card-body">
          <table className="table ">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Delivered Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    id="updateSKU"
                    type="text"
                    placeholder="SKU"
                    className="form-control"
                    name="updateSKU"
                  />
                </td>
                <td>
                  <input
                    id="deliveredQuantity"
                    type="number"
                    placeholder="Delivered Quantity"
                    className="form-control"
                    name="deliveredQuantity"
                    min="0"
                  />
                </td>
                <td>
                  <button type="submit" style={{backgroundColor:'#236a80' , color:'#fff'}} className="btn">
                    Update
                  </button>
                </td>
              </tr>
              {/* Additional rows can be added here as needed */}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Table 3: Inventory History */}
      <div className="card">
        <div className="card-header  text-light">
          Inventory History
        </div>
        <div className="card-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Action</th>
                <th>Quantity</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>SKU001</td>
                <td>Added</td>
                <td>100</td>
                <td>2025-03-25</td>
              </tr>
              <tr>
                <td>SKU001</td>
                <td>Usage</td>
                <td>-50</td>
                <td>2025-03-26</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
  

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
            <div className={`col-12 ${userType === "user" ? "mt-5" : ""}`}>
              <Maindashboard />
            </div>
            <div className="col-12 m-3">{renderTabs()}</div>
            <div className="col-12">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
