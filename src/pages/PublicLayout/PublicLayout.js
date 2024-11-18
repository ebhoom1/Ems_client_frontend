import React, { Component } from "react";
import "./index.css";
import { Outlet } from "react-router-dom";
import Layout from "../Layout/Layout";
import DashboardSam from "../Dashboard/DashboardSam";
import Hedaer from "../Header/Hedaer";

export default class PublicLayout extends Component {
  render() {
    return (
      <div className="container-fluid sticky-layout" >
      <div className="row bg-light" >
        {/* Sidebar (hidden on mobile) */}
        <div className="col-lg-3 d-none d-lg-block ">
          <DashboardSam/>
        </div>
        {/* Main content */}
        <div className="col-lg-9 col-12 ">
          <div className="row">
            <div className="col-12">
              <Hedaer />
            </div>
          </div>
      
        </div>
      </div>
      <Outlet/>
    </div>
    );
  }
}
