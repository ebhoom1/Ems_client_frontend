import React, { useState } from "react";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import Maindashboard from "../Maindashboard/Maindashboard";
import { useSelector } from "react-redux"; // Import useSelector
import EffluentFlowOverview from "./EffluentFlowOverview";
import Quantity from "./Quantity";
import QuantityFlow from "./QuantityFlow";
import FlowConsuptionCards from "./FlowConsuptionCards"; // This component is imported but not used, consider removing if not needed.
import MonthlyFlowData from "./MonthlyFlowData";

const FlowLayout = () => {
  const { userData, userType } = useSelector((state) => state.user);
  // Get selectedUserId directly from Redux, this will react to changes
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);

  // Use the Redux selected ID as the primary source for the searchTerm
  // Fallback to sessionStorage for initial load if Redux state isn't immediately populated
  // Fallback to userData for default if neither Redux nor session storage has it
  const effectiveSearchTerm = selectedUserIdFromRedux || sessionStorage.getItem('selectedUserId') || userData?.validUserOne?.userName;

  const [primaryStation, setPrimaryStation] = useState(""); // State for primary station

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
            <div style={{marginTop:"30px"}}>

            <div className={`col-12 mt-30 ${userData?.validUserOne?.userType === 'user' ? 'mt-30' : ''}`}>
              <Maindashboard />
            </div>
            </div>


          </div>
          <div className="row">
            {/* Pass effectiveSearchTerm to QuantityFlow if it needs to react to user changes */}
            <QuantityFlow
              primaryStation={primaryStation}
              setPrimaryStation={setPrimaryStation}
              searchTerm={effectiveSearchTerm} // Pass the reactive searchTerm
            />
          </div>
          <div className="row">
            <MonthlyFlowData />
          </div>
          <div className="row">
            <EffluentFlowOverview />
          </div>
          <div className="row">
            {/* Pass effectiveSearchTerm to Quantity, which will cause it to re-render */}
            <Quantity
              searchTerm={effectiveSearchTerm}
              userData={userData}
              userType={userType}
            />
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
            <a href="" target="_blank" rel="noopener noreferrer"> {/* Added rel="noopener noreferrer" for security */}
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
/* import React, { useState } from "react";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import Maindashboard from "../Maindashboard/Maindashboard";
import { useSelector } from "react-redux";
import EffluentFlowOverview from "./EffluentFlowOverview";
import Quantity from "./Quantity";
import QuantityFlow from "./QuantityFlow";
import FlowConsuptionCards from "./FlowConsuptionCards"; 
import MonthlyFlowData from "./MonthlyFlowData";

const FlowLayout = () => {
  const { userData, userType } = useSelector((state) => state.user);
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);

  
  const effectiveSearchTerm = selectedUserIdFromRedux || sessionStorage.getItem('selectedUserId') || userData?.validUserOne?.userName;

  const [primaryStation, setPrimaryStation] = useState(""); 

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
            <QuantityFlow
              primaryStation={primaryStation}
              setPrimaryStation={setPrimaryStation}
              searchTerm={effectiveSearchTerm} 
            />
          </div>
          <div className="row">
            <MonthlyFlowData />
          </div>
          <div className="row">
            <EffluentFlowOverview />
          </div>
          <div className="row">
            <Quantity
              searchTerm={effectiveSearchTerm}
              userData={userData}
              userType={userType}
            />
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
            <a href="" target="_blank" rel="noopener noreferrer"> 
              Ebhoom Solutions LLP
            </a>{" "}
            2023
          </span>
        </div>
      </footer>
    </div>
  );
};

export default FlowLayout; */
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
