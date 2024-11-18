import React, { Component } from "react";
import "./index.css";
import { Outlet } from "react-router-dom";

export default class PrivateLayout extends Component {
  render() {
    return (
      <>
      
          <Outlet/>
       
      </>
    );
  }
}
