// DashboardSpecial.jsx
import React from "react";
import "./DashboardSpecial.css";
import { FaWater, FaTachometerAlt } from "react-icons/fa";

const Tank3D = ({ title, percent, variant = "green", badge }) => {
  const p = Math.max(0, Math.min(100, Number(percent || 0)));

  return (
    <div className={`tank3d tank3d--${variant}`}>
      <div className="tank3d__cap" />
      <div className="tank3d__glass">
        <div className="tank3d__label">{title}</div>

        <div className="tank3d__value">
          <span className="tank3d__percent">{p}%</span>
        </div>

        <div className="tank3d__fillWrap">
          <div className="tank3d__fill" style={{ height: `${p}%` }} />
          <div className="tank3d__shine" />
          <div className="tank3d__bubbles" />
        </div>

        {badge ? <div className="tank3d__badge">{badge}</div> : null}
      </div>

      <div className="tank3d__base" />
      <div className="tank3d__shadow" />
    </div>
  );
};

export default function DashboardSpecial() {
  return (
    <div className="plant-overview-container">
      <div className="bg-waves" />

      {/* Header */}
      <header className="plant-header glass">
        <div className="header-left">
          <p className="header-kicker">Bringing Solutions for Water</p>
          <h5 className="header-client">Client: Brigade WTC Annexe</h5>
        </div>

        <div className="header-center">
          <h2 className="header-title">48 KLD SBR SEWAGE TREATMENT PLANT</h2>
          <p className="screen-title">Plant Overview Screen</p>
        </div>

        <div className="header-right">
          <p>
            Power Supply: <strong>EB</strong>
          </p>
          <p>
            24-Apr-2024 <strong>10:45 AM</strong>
          </p>
        </div>
      </header>

      {/* Top Process Flow */}
      {/* Top Process Flow (EXACT STRIP) */}
      <section className="pf-wrap">
        <div className="pf-stage">
          <div className="pf-rail">
            {/* Left: Inlet */}
            <div className="pf-left">
              <div className="pf-inlet">
                <span className="pf-inlet-text">Inlet</span>
                <span className="pf-inlet-valve" />
              </div>
            </div>

            {/* Middle: Tanks + Filter */}
            <div className="pf-mid">
              {/* back pipe line behind tanks */}
              <div className="pf-backpipe" />

              <div className="pf-items">
                <div className="pf-node">
                  <div className="pf-tank pf-tank--green">
                    <div className="pf-cylinder">
                      <div className="pf-label">EQ Tank</div>
                      <div className="pf-percent">75%</div>
                      <div className="pf-fill" style={{ height: "75%" }} />
                      <div className="pf-shine" />
                    </div>
                    <div className="pf-base" />
                    <div className="pf-shadow" />
                  </div>
                </div>

                <div className="pf-node">
                  <div className="pf-tank pf-tank--blue">
                    <div className="pf-cylinder">
                      <div className="pf-label">SBR Tank</div>
                      <div className="pf-percent">60%</div>
                      <div className="pf-fill" style={{ height: "60%" }} />
                      <div className="pf-shine" />
                    </div>
                    <div className="pf-badge">React 12 min</div>
                    <div className="pf-base" />
                    <div className="pf-shadow" />
                  </div>
                </div>

                <div className="pf-node">
                  <div className="pf-tank pf-tank--green">
                    <div className="pf-cylinder">
                      <div className="pf-label">Decant</div>
                      <div className="pf-percent">65%</div>
                      <div className="pf-fill" style={{ height: "65%" }} />
                      <div className="pf-shine" />
                    </div>
                    <div className="pf-base" />
                    <div className="pf-shadow" />
                  </div>
                </div>

                <div className="pf-node-middle">
                  <div className="pf-filter">
                    <div className="pf-filter-inner">
                      <div className="pf-filter-title">Filter</div>
                      <div className="pf-filter-row">Cycle:</div>
                      <div className="pf-filter-row pf-filter-strong">
                        Backwash
                      </div>
                    </div>
                    <div className="pf-filter-shadow" />
                  </div>
                </div>

                <div className="pf-node">
                  <div className="pf-tank pf-tank--green">
                    <div className="pf-cylinder">
                      <div className="pf-label">
                        Treated
                        <br />
                        Water Tank
                      </div>
                      <div className="pf-percent">85%</div>
                      <div className="pf-fill" style={{ height: "85%" }} />
                      <div className="pf-shine" />
                    </div>
                    <div className="pf-base" />
                    <div className="pf-shadow" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Reuse/Discharge */}
            <div className="pf-right">
              <div className="pf-outlet">
                <span className="pf-outlet-text">Reuse / Discharge</span>
              </div>
            </div>
          </div>

          {/* platform slab */}
          <div className="pf-platform" />
        </div>
      </section>

      {/* Bottom Grid */}
      <div className="data-grid">
        <div className="card glass">
          <div className="card-header card-header--blue">
            <span className="card-header-icon" />
            Flow & Cycle Status
          </div>
          <div className="card-body">
            <div className="data-row">
              <span>Inlet Flow</span> <span className="value">12.3 m³/hr</span>
            </div>
            <div className="data-row">
              <span>Treated Flow</span>{" "}
              <span className="value">10.8 m³/hr</span>
            </div>
            <div className="data-row">
              <span>Current SBR Cycle</span>{" "}
              <span className="pill pill--blue">React</span>
            </div>
            <div className="data-row">
              <span>Remaining Time</span> <span className="value">12 min</span>
            </div>
            <div className="data-row">
              <span>Filter Cycle</span> <span className="value">Backwash</span>
            </div>
          </div>
        </div>

        <div className="card glass">
          <div className="card-header card-header--blue">
            <span className="card-header-icon" />
            Tank & Equipment Status
          </div>
          <div className="card-body">
            <div className="data-row">
              <span>EQ Tank Level</span>{" "}
              <span className="value">
                75% <i className="tick" />
              </span>
            </div>
            <div className="data-row">
              <span>SBR Tank Level</span>{" "}
              <span className="value">
                60% <i className="tick" />
              </span>
            </div>
            <div className="data-row">
              <span>Decant Tank Level</span>{" "}
              <span className="value">
                65% <i className="tick" />
              </span>
            </div>
            <div className="data-row">
              <span>Treated Water Tank</span>{" "}
              <span className="pill pill--green">Running</span>
            </div>
            <div className="data-row">
              <span>Blower Status</span>{" "}
              <span className="pill pill--green">ON</span>
            </div>
          </div>
        </div>

        <div className="card glass">
          <div className="card-header card-header--lightblue">
            <span className="card-header-icon" />
              Water Quality
          </div>
          <div className="card-body">
            <div className="data-row">
              <span>pH</span> <span className="value">7.2</span>
            </div>
            <div className="data-row">
              <span>Turbidity</span> <span className="value">2.5 NTU</span>
            </div>
            <div className="data-row">
              <span>Residual Chlorine</span>{" "}
              <span className="value">0.6 mg/L</span>
            </div>
            <div className="data-row">
              <span>TSS</span> <span className="value">8 mg/L</span>
            </div>
            <div className="data-row">
              <span>BOD / COD</span>{" "}
              <span className="value warn">
                12 mg/L <i className="warn-ico" />
              </span>
            </div>
          </div>
        </div>

        <div className="card glass">
          <div className="card-header card-header--orange">
            <span className="card-header-icon bell" />
            Alarms & Interlocks
          </div>
          <div className="card-body">
            <div className="alarm-row">
              <span>Blower Trip</span>
              <span className="muted">10:42 AM</span>
              <span className="status status--red">Active</span>
              <span className="icons">
                <i className="dot red" />
                <i className="tri" />
              </span>
            </div>
            <div className="alarm-row">
              <span>High Level</span>
              <span className="muted">10:30 AM</span>
              <span className="status status--amber">Acknowledged</span>
              <span className="icons">
                <i className="dot amber" />
                <i className="tri" />
              </span>
            </div>
            <div className="alarm-row">
              <span>Power Failure</span>
              <span className="muted">10:15 AM</span>
              <span className="status status--red">Active</span>
              <span className="icons">
                <i className="dot red" />
                <i className="tri" />
              </span>
            </div>

            <div className="divider" />
            <div className="data-row">
              <span>Compliance</span>
              <span className="ok">
                <i className="ok-ico" /> Within Norms
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
