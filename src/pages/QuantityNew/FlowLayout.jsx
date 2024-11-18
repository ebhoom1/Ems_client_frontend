import React, { useState } from "react";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import Maindashboard from "../Maindashboard/Maindashboard";
import { useSelector } from "react-redux";
import EffluentFlowOverview from "./EffluentFlowOverview";
import Quantity from "./Quantity";
import QuantityFlow from "./QuantityFlow";

const FlowLayout = () => {
  const { userData,userType } = useSelector((state) => state.user);

  const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve userId from session storage
  const [primaryStation, setPrimaryStation] = useState("");  // State for primary station

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
            <div className="col-12">
              <Maindashboard />
            </div>
           
          </div>
       {/*    <div className="row">
                  <EnergyFlow primaryStation={primaryStation} setPrimaryStation={setPrimaryStation} searchTerm={storedUserId} />

        </div>
        <div className="row">
           <EnergyConsumptionCards/>
        </div>
        <div className="row">
        <div className="row">
  <PrimaryStationSelector
    stations={Array.isArray(userData?.stackData) ? userData.stackData.filter(stack => stack.stationType === 'energy').map(stack => stack.stackName) : []}
    userName={userData?.validUserOne?.userName || 'Unknown User'}
    setPrimaryStation={setPrimaryStation}
    primaryStation={primaryStation}
  />
</div>


        </div>

        <div className="row">
          <EnergyOverview />
        </div>
        <div className="row">
          <Energy searchTerm={storedUserId} userData={userData} userType={userType} />
        </div>
        <div className="row mt-5">
        <PieChartEnergy/>

        </div>
        <EnergyDataModal/>
      
        <div className="row p-5">
          <BillCalculator searchTerm={storedUserId} userData={userData} userType={userType} />
        </div> */}
         <div className="row">
          <QuantityFlow primaryStation={primaryStation} setPrimaryStation={setPrimaryStation} searchTerm={storedUserId} />
        </div>
        <div className="row">
          <EffluentFlowOverview/>
        </div>
        <div className="row">
          <Quantity searchTerm={storedUserId} userData={userData} userType={userType} />
        </div>
       
       
        
        </div>
      </div>
      <footer className="footer">
        <div className="container-fluid clearfix">
          <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
          
          </span>
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

export default FlowLayout;
/* 

 <div className="container-fluid">
      <div className="row" style={{ backgroundColor: 'white' }}>
       
        <div className="col-lg-3 d-none d-lg-block ">
          <DashboardSam />
        </div>
     
        <div className="col-lg-9 col-12 ">
          <div className="row">
            <div className="col-12">
              <Hedaer />
            </div>
            <div className="col-12">
              <Maindashboard />
            </div>
            <div className="col-12">
            <h3 className="page-title text-center">Energy Dashboard</h3>
          </div>
          </div>
          <div className="row">
                  <EnergyFlow primaryStation={primaryStation} setPrimaryStation={setPrimaryStation} searchTerm={searchTerm} />

        </div>
        <div className="row">
           <EnergyConsumptionCards/>
        </div>

        <div className="row">
          <EnergyOverview />
        </div>
        <div className="row">
          <Energy searchTerm={searchTerm} userData={userData} userType={userType} />
        </div>
       
        <div className="row p-5">
          <BillCalculator searchTerm={searchTerm} userData={userData} userType={userType} />
        </div>
        </div>
      </div>
      <footer className="footer">
        <div className="container-fluid clearfix">
          <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
          
          </span>
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
 */
