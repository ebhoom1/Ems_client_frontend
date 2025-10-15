import React from "react";
import DashboardSam from "../Dashboard/DashboardSam";
import HeaderSim from "../Header/HeaderSim";
import wipro from "../../assests/images/wipro.png";
import pdf from "../../assests/images/pdfofwipro.png";
import "./Daigram.css";

// Updated data structure for better styling control (value + unit)
const waterQualityData = [
  {
    label: "Resistivity @ 25°C",
    value: "> 18.2",
    unit: "MΩ-cm",
  },
  {
    label: "Total Organic Carbon",
    value: "< 20",
    unit: "ppb",
  },
  {
    label: "Bacteria",
    value: "< 100",
    unit: "cfu/ml",
  },
  {
    label: "Total Silica",
    value: "< 2",
    unit: "ppb",
  },
  {
    label: ">1μm Particle",
    value: "≤ 0.01",
    unit: "个/ML",
  },
  // You can add a 6th item here to complete the second row
  {
    label: "Temperature",
    value: "27.32",
    unit: "°C",
  },
];

export default function Daigram() {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>

        {/* Main Content */}
        <div className="col-lg-9 col-12">
          <div className="headermain">
            <HeaderSim />
          </div>

          {/* Logo */}
         {/*  <div className="d-flex justify-content-end">
            <img src={wipro} alt="Wipro Logo" width="220px" height="70px" />
          </div> */}

          {/* NEW: Water Quality Section with Fixed 3-Column Boxes */}
          <div className="water-quality-section">
            <h4 className="text-center"><b>TREATED WATER QUALITY</b></h4>
            <div className="quality-grid-fixed">
              {waterQualityData.map((item, index) => (
                <div key={index} className="quality-card-dark">
                  <div className="card-label">{item.label}</div>
                  <div className="card-value-container">
                    <span className="card-value-main">{item.value}</span>
                    <span className="card-value-unit">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagram Image */}
          <div className="pdf-container-new">
            <img src={pdf} alt="Wipro PDF" className="pdf-image-new" />
          </div>
        </div>
      </div>
    </div>
  );
}