import React from "react";
import DashboardSam from "../Dashboard/DashboardSam";
import HeaderSim from "../Header/HeaderSim";
import wipro from "../../assests/images/wipro.png";
import pdf from "../../assests/images/pdfofwipro.png";
import "./Daigram.css";

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
          <div className="d-flex justify-content-end">
            <img src={wipro} alt="Wipro Logo" width="220px" height="70px" />
          </div>

          {/* Redesigned Water Quality Table */}
          <div className="modern-quality-card">
            <div className="modern-table-header">
              <h5>TREATED WATER QUALITY</h5>
            </div>
            <div className="modern-table-body">
              <div className="modern-row modern-head">
                <div>Sr. No.</div>
                <div>Parameter</div>
                <div>Specification</div>
              </div>
              <div className="modern-row">
                <div>1</div>
                <div>Resistivity @ 25°C</div>
                <div>&gt; 18.2 MΩ-cm</div>
              </div>
              <div className="modern-row">
                <div>2</div>
                <div>Total Organic Carbon</div>
                <div>&lt; 20 ppb</div>
              </div>
              <div className="modern-row">
                <div>3</div>
                <div>Bacteria</div>
                <div>&lt; 100 cfu/ml</div>
              </div>
              <div className="modern-row">
                <div>4</div>
                <div>Total Silica</div>
                <div>&lt; 2 ppb</div>
              </div>
              <div className="modern-row">
                <div>5</div>
                <div>&gt;1μm Particle</div>
                <div>≤ 0.01 个/ML</div>
              </div>
            </div>
          </div>

          {/* PDF Image */}
          <div className="pdf-container-new">
            <img src={pdf} alt="Wipro PDF" className="pdf-image-new" />
          </div>
        </div>
      </div>
    </div>
  );
}
