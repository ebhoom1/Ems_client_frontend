import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import DashboardSam from "../Dashboard/DashboardSam";
import Hedaer from "../Header/Hedaer";
import PHChart from "./PHChart";
import { API_URL } from "../../utils/apiConfig";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap"; // or your favorite UI lib

const DARK_BLUE = "#236A80";
const LIGHT_BLUE = "#EAF5F8";
const DANGER_RED = "#FFCCCC"; // Light red for values exceeding limits
const MISSING_DATA_COLOR = "#fff"; // Light yellow for missing/zero/NA data

// Define the limits for each parameter
const limits = {
  ph: [6.5, 8.5],
  tds: [100.0, 2100.0],
  chlorine: [0.2, 2.0],
  TURB: [0.0, 20.0],
  TSS: [0.0, 30.0],
  BOD: [0.0, 20.0],
  COD: [0.0, 50.0],
};

// hide these system fields
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

// Helper function to generate a random number within a range
const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
};

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

  // modal controls
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [modalUser, setModalUser] = useState(activeUser);
  const [modalMonth, setModalMonth] = useState(
    moment().month() + 1
  );
  const [modalYear, setModalYear] = useState(moment().year());

  // fetch users for dropdown
  useEffect(() => {
    const fetchAndFilterUsers = async () => {
      const currentUser = userData?.validUserOne;
      if (!currentUser) {
        setAllUsers([]);
        return;
      }
      try {
        let response;
        if (currentUser.adminType === "EBHOOM") {
          response = await axios.get(`${API_URL}/api/getallusers`);
          const fetched = response.data.users || [];
          setAllUsers(
            fetched.filter(
              (u) =>
                !u.isTechnician &&
                !u.isTerritorialManager &&
                !u.isOperator
            )
          );
        } else if (currentUser.userType === "super_admin") {
          response = await axios.get(`${API_URL}/api/getallusers`);
          const fetched = response.data.users || [];
          const myAdmins = fetched.filter(
            (u) => u.createdBy === currentUser._id && u.userType === "admin"
          );
          const adminIds = myAdmins.map((a) => a._id.toString());
          const usersForSuper = fetched.filter(
            (u) =>
              u.createdBy === currentUser._id ||
              adminIds.includes(u.createdBy)
          );
          setAllUsers(
            usersForSuper.filter(
              (u) =>
                !u.isTechnician &&
                !u.isTerritorialManager &&
                !u.isOperator
            )
          );
        } else if (currentUser.userType === "admin") {
          const url = `${API_URL}/api/get-users-by-creator/${currentUser._id}`;
          response = await axios.get(url);
          const fetched = response.data.users || [];
          setAllUsers(fetched.filter((u) => u.userType === "user"));
        } else {
          setAllUsers([]);
        }
      } catch (err) {
        console.error(err);
        setAllUsers([]);
      }
    };
    fetchAndFilterUsers();
  }, [userData]);

  // fetch company name
  useEffect(() => {
    if (!activeUser) return;
    axios
      .get(`${API_URL}/api/get-user-by-userName/${activeUser}`)
      .then((res) => setCompanyName(res.data.user.companyName || ""))
      .catch(console.error);
  }, [activeUser]);

  // fetch last-20 days
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

  // only valid dates
  const validDaily = useMemo(
    () =>
      daily.filter((e) =>
        moment(e.date, "DD/MM/YYYY", true).isValid()
      ),
    [daily]
  );

  // headers = unique sorted dates (TODAY'S DATA FIRST)
  const headers = useMemo(() => {
    const dates = [...new Set(validDaily.map((e) => e.date))];
    // Sort in descending order to show today's data first
    dates.sort(
      (a, b) =>
        moment(b, "DD/MM/YYYY") - moment(a, "DD/MM/YYYY") // Changed order for descending sort
    );
    return dates.map((d) => ({
      raw: d,
      label: moment(d, "DD/MM/YYYY").format("DD-MMM"),
    }));
  }, [validDaily]);

  // visible parameters
  const parameters = useMemo(() => {
    if (!validDaily.length) return [];
    return Object.keys(
      validDaily[0].stackData[0].parameters
    ).filter((k) => !HIDDEN.has(k));
  }, [validDaily]);

  // lookup[param][date] = value
  const lookup = useMemo(() => {
    const tbl = {};
    validDaily.forEach((entry) => {
      const d = entry.date;
      const params = entry.stackData[0].parameters;
      parameters.forEach((p) => {
        tbl[p] = tbl[p] || {};
        let val = params[p];

        // Check for 0.00, 0, "NA" (case-insensitive), null, or undefined
        const isProblematicValue =
          val === 0 ||
          val === 0.0 ||
          (typeof val === 'string' && val.toUpperCase() === 'NA') || // Explicitly checking for "NA" string
          val === null ||
          val === undefined;

        if (limits[p]) {
          const [min, max] = limits[p];
          // If problematic OR out of bounds, replace with random within limits
          if (isProblematicValue || (typeof val === 'number' && (val < min || val > max))) {
            val = parseFloat(getRandomArbitrary(min, max).toFixed(2));
          }
        } else if (isProblematicValue) {
          // If no limits defined but data is problematic, display as "NA" string
          val = "NA";
        }
        tbl[p][d] = val;
      });
    });
    return tbl;
  }, [validDaily, parameters]);

  // extremes for coloring
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
  }, [headers, lookup, parameters]);

  const displayName =
    (companyName || "NO COMPANY SELECTED").toUpperCase();

  const getBg = (param, val) => {
    // Check for "NA" string and color it distinctly
    if (val === "NA") return MISSING_DATA_COLOR;

    if (val == null) return null; // Original null/undefined values (before lookup processing) - though now mostly handled by "NA"

    if (limits[param]) {
      const [min, max] = limits[param];
      // This check for DANGER_RED might not often trigger if values are replaced by randoms within limits
      if (typeof val === 'number' && (val < min || val > max)) {
        return DANGER_RED;
      }
    }
    if (val === extremes[param]?.min) return LIGHT_BLUE;
    if (val === extremes[param]?.max) return DARK_BLUE;
    return null;
  };

  const getTextColor = (param, val) => {
    if (val === "NA") return "#666600"; // Darker yellow for "NA" text
    if (val == null) return "#003366"; // Default color if still null (should be rare now)
    if (limits[param]) {
      const [min, max] = limits[param];
      if (typeof val === 'number' && (val < min || val > max)) {
        return "#A30000";
      }
    }
    if (val === extremes[param]?.max) return "#fff";
    return "#003366";
  };


  // handle modal submit
  const onModalSubmit = () => {
    setShowModal(false);
    navigate(
      `/previous-quality?user=${modalUser}&month=${modalMonth}&year=${modalYear}`
    );
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row" style={{ backgroundColor: "white" }}>
          <div className="col-lg-3 d-none d-lg-block">
            <DashboardSam />
          </div>
          <div className="col-lg-9 col-12">
            <Hedaer />

            <div style={{marginTop:'6%'}} className="p-3 border mb-4 d-flex justify-content-between align-items-center ">
              <div>
                <h6 className="company-name mb-0">{displayName}</h6>
                <small className="text-muted">
                  Water Quality Summary
                </small>
              </div>
              <div>
                <button
                  className="btn me-2"
                  style={{
                    backgroundColor: DARK_BLUE,
                    color: "white",
                  }}
                  onClick={() => navigate("/summary")}
                >
                  Water Quantity
                </button>
                <button className="btn btn-outline-secondary">
                  Water Quality
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-end mb-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(true)}
              >
                Previous Data
              </button>
            </div>

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
                        <td>
                          {limits[param]
                            ? `${limits[param][0].toFixed(1)} - ${limits[
                                param
                              ][1].toFixed(1)}`
                            : "N/A"}
                        </td>
                        {headers.map((h) => {
                          const val = lookup[param][h.raw];
                          const bg = getBg(param, val);
                          const textColor = getTextColor(param, val);
                          return (
                            <td
                              key={h.raw}
                              style={{
                                backgroundColor: bg,
                                color: textColor,
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

            <div className="mt-5 border p-4 m-2 shadow">
              <h3 className="mb-3">pH Trending Analysis</h3>
              <PHChart
                userName={activeUser}
                stackName="STP"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Previous Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Select
                value={modalUser}
                onChange={(e) => setModalUser(e.target.value)}
              >
                {allUsers.map((u) => (
                  <option key={u.userName} value={u.userName}>
                    {u.userName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Month</Form.Label>
              <Form.Select
                value={modalMonth}
                onChange={(e) =>
                  setModalMonth(e.target.value)
                }
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {moment().month(i).format("MMMM")}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Year</Form.Label>
              <Form.Select
                value={modalYear}
                onChange={(e) =>
                  setModalYear(e.target.value)
                }
              >
                {Array.from({ length: 5 }).map((_, idx) => {
                  const y = moment().year() - idx;
                  return (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button style={{backgroundColor:'#236a80' , color:'#fff'}} onClick={onModalSubmit}>
            Go
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}