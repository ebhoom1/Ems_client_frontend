import React, { useState } from 'react';
import './FuelMain.css';
import Maindashboard from '../Maindashboard/Maindashboard';
import Header from '../Header/Hedaer';
import DashboardSam from '../Dashboard/DashboardSam';
import { useSelector } from 'react-redux';
import Generator from './Generator';
import Vehicles from './Vehicles';

function FuelMain() {
  const [isGenerator, setIsGenerator] = useState(false);
  const { userData } = useSelector((state) => state.user);

  const handleToggle = () => {
    setIsGenerator(!isGenerator);
  };

  return (
    <>
     <div className="container-fluid">
      <div className="row" style={{ backgroundColor: 'white' }}>
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <Header />
            </div>
          </div>
          <div className="row">
            <div className={`col-12 ${userData?.validUserOne?.userType === 'user' ? 'mt-5' : 'mt-3'}`}>
              <Maindashboard />
            </div>
          </div>
         
          <div className="fuel-main ">
      {/* Toggle Switch */}
      <label className="switch d-flex justify-content-end align-items-end">
        <input
          type="checkbox"
          checked={isGenerator}
          onChange={handleToggle}
        />
        <span className="slider round">
          <span className="text-left"  style={{margin:"28px"}}>Vehicle</span>
          <span className="text-right " style={{ marginRight:"30px"}}>Generator</span>
        </span>
      </label>
      </div>
      {/* Content changes based on the toggle */}
      <div className="content">
        {isGenerator ? <Generator /> : <Vehicles />}
      </div>
   
       





         
        </div>
      </div>
    </div>
    </>
  
  );
}

export default FuelMain;
