import React, { useState, useEffect } from "react";
import TreatmentAnalysis from "./TreatmentAnalysis";
import { useOutletContext } from "react-router-dom";
import Energy from "./Energy";
import EnergyOverview from "./EnergyOverview";
import CalibrationExceeded from "../Calibration/CalibrationExceeded";
import BillCalculator from "./BillCalculator";
import EnergyFlow from "./EnergyFlow";
import EnergyConsumptionCards from "./EnergyConsumptionCards";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import Maindashboard from "../Maindashboard/Maindashboard";
import { useSelector } from "react-redux";
import PrimaryStationSelector from "./PrimaryStationSelector";
import EnergyDataModal from "./EnergyDataModal";
import ViewDifference from './ViewDifference';
import "./loader.css";

const EnergyDashboard = () => {
  const { userData, userType } = useSelector((state) => state.user);
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve userId from session storage
  const [primaryStation, setPrimaryStation] = useState("");  // State for primary station
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500); // Faster loading time set to 0.5 seconds
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <svg className="pl" viewBox="0 0 200 200" width="200" height="200">
          <circle className="pl__ring pl__ring--a" cx="100" cy="100" r="82" fill="none" strokeWidth="20" strokeDasharray="0 660" strokeDashoffset="-330"></circle>
          <circle className="pl__ring pl__ring--b" cx="100" cy="100" r="82" fill="none" strokeWidth="20" strokeDasharray="0 220" strokeDashoffset="-110"></circle>
          <circle className="pl__ring pl__ring--c" cx="100" cy="100" r="82" fill="none" strokeWidth="20" strokeDasharray="0 440" strokeDashoffset="0"></circle>
          <circle className="pl__ring pl__ring--d" cx="100" cy="100" r="82" fill="none" strokeWidth="20" strokeDasharray="0 440" strokeDashoffset="0"></circle>
        </svg>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: 'white' }}>
        <div className="col-lg-3 d-none d-lg-block ">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12 ">
          <div className="row">
            <div className="col-12">
              <Header />
            </div>
            <div className={`col-12 ${userData?.validUserOne?.userType === 'user' ? 'mt-5' : ''}`}>
              <Maindashboard />
            </div>
          </div>
          <div className="row">
            <EnergyFlow primaryStation={primaryStation} setPrimaryStation={setPrimaryStation} searchTerm={storedUserId} />
          </div>
          <div className="row">
            <EnergyOverview />
          </div>
          <div className="row">
            <Energy searchTerm={storedUserId} userData={userData} userType={userType} />
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="container-fluid clearfix">
          <span className="text-muted d-block text-center text-sm-left d-sm-inline-block"></span>
          <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
            {" "}  Ebhoom Control and Monitor System <br />
            ©{" "}
            <a href="" target="_blank">
              Ebhoom Solutions LLP
            </a>{" "}
            2023
          </span>
        </div>
      </footer>
    </div>
  );
};

export default EnergyDashboard;
