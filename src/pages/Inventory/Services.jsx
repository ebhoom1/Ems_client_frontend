// src/pages/Services.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import Maindashboard from "../Maindashboard/Maindashboard";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddEquipment from "./AddEquipment";
import EquipmentList from "./EquipmentList";
import AdminServiceRequests from "./AdminServiceRequests";
import ServiceHistory from "./ServiceHistory";
import ReportFault from "./ReportFault";
// import HeaderSim from "../Header/HeaderSim";
import HeaderSim from "../Header/Hedaer";

const Services = () => {
  const { userData } = useSelector((state) => state.user);
  console.log("userdata in services", userData);
  const userType = userData?.validUserOne?.userType;
  const userName = userData?.validUserOne?.userName;
  const navigate = useNavigate();
  const initialTab =
    userData?.validUserOne?.userType === "admin" ? "adminView" : "reportFault";
  const [selectedTab, setSelectedTab] = useState(initialTab);

  const renderTabs = () => {
    const tabStyle = (tabKey) =>
      selectedTab === tabKey
        ? { color: "#236a80", fontWeight: "bold" }
        : { color: "black" };

    const adminNav = (
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
      </ul>
    );

    const userNav = (
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
        <li className="nav-item">
          <button
            className="nav-link"
            style={tabStyle("serviceHistory")}
            onClick={() => setSelectedTab("serviceHistory")}
          >
            Service History
          </button>
        </li>
      </ul>
    );

    return userData?.validUserOne?.userType === "admin" ? adminNav : userNav;
  };

  const renderContent = () => {
    const type = userData?.validUserOne?.userType;
    switch (selectedTab) {
      case "adminView":
        return <AdminServiceRequests />;
      case "serviceHistory":
        return <ServiceHistory />;
      case "addEquipment":
        return <AddEquipment />;
      case "equipmentList":
        return <EquipmentList />;
      case "reportFault":
        return (
          <ReportFault
            equipmentList={[]} /* ReportFault handles fetching its own list */
            onFaultReported={() => toast.success("Fault reported")}
            defaultUsername={
              type !== "admin" ? userData?.validUserOne?.userName : undefined
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: "white" }}>
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12">
          <div className="row ">
            <div className="col-12">
              <HeaderSim />
            </div>
            <div className="col-12" style={{ marginTop: '80px' }}>

            <div className="row  gx-3 gy-2 justify-content-center">
              <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <button
                  onClick={() => navigate("/inventory")}
                  className="btn btn-outline-success w-100"
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
                  onClick={() =>
                    userType === "admin"
                      ? navigate(`/admin/report/HH014`)
                      : navigate("/dailylogs")
                  }
                  className="btn btn-outline-success w-100"
                >
                  Daily Log
                </button>
              </div>
            </div>
            </div>

            <h3 className="text-center mt-3">SERVICES</h3>
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
