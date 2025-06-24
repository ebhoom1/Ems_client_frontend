// src/components/WaterQualitySummary.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import DashboardSam from "../Dashboard/DashboardSam";
import Hedaer from "../Header/Hedaer";
import PHChart from "./PHChart";
import { API_URL } from "../../utils/apiConfig";
import { useNavigate } from "react-router-dom";

const DARK_BLUE = "#236A80";
const LIGHT_BLUE = "#EAF5F8";

// parameters to hide (all-zero system values + internal _id)
const HIDDEN = new Set([
  "cumulatingFlow",
  "flowRate",
  "energy",
  "voltage",
  "current",
  "power",
  "weight",
  "_id",
]);

export default function WaterQualitySummary() {
  const { userData, userType } = useSelector((s) => s.user);
  const selectedUserId = useSelector((s) => s.selectedUser.userId);
  const storedUserId = sessionStorage.getItem("selectedUserId");
  const currentUserName =
    userType === "admin"
      ? "KSPCB001"
      : userData?.validUserOne?.userName;
  const activeUser = selectedUserId || storedUserId || currentUserName;

  const [companyName, setCompanyName] = useState("");
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // fetch companyName once
  useEffect(() => {
    if (!activeUser) return;
    axios
      .get(`${API_URL}/api/get-user-by-userName/${activeUser}`)
      .then((res) => setCompanyName(res.data.user.companyName || ""))
      .catch(console.error);
  }, [activeUser]);

  // fetch last-20 days of daily averages
  useEffect(() => {
    if (!activeUser) return;
    setLoading(true);
    axios
      .get(
        `${API_URL}/api/average/user/${activeUser}/stack/STP/last-20-days`
      )
      .then((res) => {
        if (res.data.success) setDaily(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeUser]);

  // build sorted headers array: [{ raw: "DD/MM/YYYY", label: "DD-MMM" }, …]
  const headers = useMemo(() => {
    return [...daily]
      .sort(
        (a, b) =>
          moment(a.date, "DD/MM/YYYY").valueOf() -
          moment(b.date, "DD/MM/YYYY").valueOf()
      )
      .map((d) => ({
        raw: d.date,
        label: moment(d.date, "DD/MM/YYYY").format("DD-MMM"),
      }));
  }, [daily]);

  // collect visible parameter names, excluding HIDDEN
  const parameters = useMemo(() => {
    if (!daily.length) return [];
    return Object.keys(daily[0].stackData[0].parameters).filter(
      (key) => !HIDDEN.has(key)
    );
  }, [daily]);

  // lookup[param][date] = value
  const lookup = useMemo(() => {
    const table = {};
    daily.forEach((entry) => {
      const date = entry.date;
      const params = entry.stackData[0].parameters;
      Object.entries(params).forEach(([key, val]) => {
        if (HIDDEN.has(key)) return;
        table[key] = table[key] || {};
        table[key][date] = val;
      });
    });
    return table;
  }, [daily]);

  // compute min/max per parameter for coloring
  const extremes = useMemo(() => {
    const ex = {};
    parameters.forEach((p) => {
      const vals = headers
        .map((h) => lookup[p][h.raw])
        .filter((v) => typeof v === "number");
      if (vals.length) {
        ex[p] = {
          min: Math.min(...vals),
          max: Math.max(...vals),
        };
      }
    });
    return ex;
  }, [parameters, headers, lookup]);

  const displayName = (companyName || "NO COMPANY SELECTED").toUpperCase();

  const getBg = (param, val) => {
    if (val == null) return null;
    if (val === extremes[param]?.min) return LIGHT_BLUE;
    if (val === extremes[param]?.max) return DARK_BLUE;
    return null;
  };

  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: "white" }}>
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12">
          <Hedaer />

          {/* Top bar */}
          <div className="p-3 border mb-4 d-flex justify-content-between align-items-center">
            <div>
              <h6 className="company-name mb-0">{displayName}</h6>
              <small className="text-muted">Water Quality Summary</small>
            </div>
            <div>
              <button
                className="btn me-2"
                style={{ backgroundColor: DARK_BLUE, color: "white" }}
                onClick={() => navigate("/summary")}
              >
                Water Quantity
              </button>
              <button className="btn btn-outline-secondary">
                Water Quality
              </button>
            </div>
          </div>

          {/* Table or loader */}
          {loading ? (
            <div className="text-center my-4">
              <div
                className="spinner-border text-primary"
                role="status"
              />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table summary-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Acceptable Limits</th>
                    {headers.map((h) => (
                      <th key={h.raw}>{h.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((param) => (
                    <tr key={param}>
                      <td>{param.toUpperCase()}</td>
                      <td>{/* put limits here if needed */}</td>
                      {headers.map((h) => {
                        const val = lookup[param][h.raw];
                        const bg = getBg(param, val);
                        const isMax = val === extremes[param]?.max;
                        return (
                          <td
                            key={h.raw}
                            style={{
                              backgroundColor: bg,
                              color: isMax ? "#fff" : "#003366",
                            }}
                          >
                            {typeof val === "number"
                              ? val.toFixed(2)
                              : "NA"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* pH Trending Chart */}
          <div className="mt-5 border p-4 m-2 shadow">
            <h3 className="mb-3">pH Trending Analysis</h3>
            <PHChart userName={activeUser} stackName="STP" />
          </div>
        </div>
      </div>
    </div>
  );
}
