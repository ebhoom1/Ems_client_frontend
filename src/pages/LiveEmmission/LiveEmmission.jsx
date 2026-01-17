import React from "react";
import DashboardSam from "../Dashboard/DashboardSam";
import MultipleVideo from "./MultipleVideo";
import Hedaer from "../Header/Hedaer";

function LiveEmmission() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>

        <div className="col-lg-9 col-12">
          <Hedaer />
          <h2 className="mt-4">Live Emission Dashboard</h2>
          <MultipleVideo />
        </div>
      </div>
    </div>
  );
}

export default LiveEmmission;
