// src/components/Summary.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import DashboardSam from "../Dashboard/DashboardSam";
import Hedaer from "../Header/Hedaer";
import { API_URL } from "../../utils/apiConfig";
import "./Summary.css";
import EffluentBarChart from "./EffluentBarChart";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;
const LIGHT_BLUE = "#EAF5F8";
const DARK_BLUE = "#236A80";

function getColorForValue(date, minDate, maxDate) {
  if (date === minDate) return LIGHT_BLUE;
  if (date === maxDate) return DARK_BLUE;
  return null;
}

const Summary = () => {
  const { userData, userType } = useSelector((s) => s.user);
  const selectedUserId = useSelector((s) => s.selectedUser.userId);
  const storedUserId = sessionStorage.getItem("selectedUserId");
  const currentUserName =
    userType === "admin"
      ? "KSPCB001"
      : userData?.validUserOne?.userName;
  const activeUser = selectedUserId || storedUserId || currentUserName;

  const companyCache = useRef({});
  const dataCache = useRef({});

  const [companyName, setCompanyName] = useState("");
  const [differences, setDifferences] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();


   const [showModal, setShowModal] = useState(false);
  const [allFetchedUsers, setAllFetchedUsers] = useState([]);
  const [modalUser, setModalUser]       = useState("");
  const [modalMonth, setModalMonth]     = useState(String(new Date().getMonth() + 1));
  const [modalYear, setModalYear]       = useState(String(new Date().getFullYear()));

  const filterUnwantedStacks = (stackName) => {
    return !stackName.includes("STP intlet") && !stackName.includes("STP iutlet");
  };
  useEffect(() => {
    const fetchAndFilterUsers = async () => {
      try {
        const currentUser = userData?.validUserOne;
        if (!currentUser) {
          setAllFetchedUsers([]); // Clear users if no current user
          return;
        }

        let response;
        if (currentUser.adminType === "EBHOOM") {
          // EBHOOM fetches all users
          response = await axios.get(`${API_URL}/api/getallusers`);
          const fetchedUsers = response.data.users || [];
          // EBHOOM logic: Filter out technicians, territorial managers, and operators
          const filteredForEbhoom = fetchedUsers.filter(
            (user) =>
              user.isTechnician !== true &&
              user.isTerritorialManager !== true &&
              user.isOperator !== true
          );
          setAllFetchedUsers(filteredForEbhoom);
        } else if (currentUser.userType === "super_admin") {
          response = await axios.get(`${API_URL}/api/getallusers`); // Super admin still fetches all to determine createdBy hierarchy
          const fetchedUsers = response.data.users || [];

          // Get admins created by the super admin
          const myAdmins = fetchedUsers.filter(
            (user) =>
              user.createdBy === currentUser._id && user.userType === "admin"
          );

          const myAdminIds = myAdmins.map((admin) => admin._id.toString());

          // Get users created by the super admin or by admins
          const usersForSuperAdmin = fetchedUsers.filter(
            (user) =>
              user.createdBy === currentUser._id ||
              myAdminIds.includes(user.createdBy)
          );

          // Filter for display in the dropdown (non-technician, non-territorial manager, non-operator)
          const filteredForSuperAdmin = usersForSuperAdmin.filter(
            (user) =>
              user.isTechnician !== true &&
              user.isTerritorialManager !== true &&
              user.isOperator !== true
          );
          setAllFetchedUsers(filteredForSuperAdmin);
        } else if (currentUser.userType === "admin") {
          // Admin fetches users created by them
          const url = `${API_URL}/api/get-users-by-creator/${currentUser._id}`;
          response = await axios.get(url);
          const fetchedUsers = response.data.users || [];

          // For an 'admin', you want to show only 'user' types created by them in the dropdown
          const myUsers = fetchedUsers.filter(
            (user) => user.userType === "user"
          );
          setAllFetchedUsers(myUsers);
        } else {
          // Fallback for 'user' type or any other unhandled type
          setAllFetchedUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users for header dropdown:", error);
        setAllFetchedUsers([]);
      }
    };

    fetchAndFilterUsers();
  }, [userData]);
  useEffect(() => {
    if (companyCache.current[activeUser] && dataCache.current[activeUser]) {
      const { companyName, differences, headers } = dataCache.current[activeUser];
      setCompanyName(companyName);
      setDifferences(differences);
      setHeaders(headers);
      setIsLoading(false);
      setPage(0);
      return;
    }

    setIsLoading(true);

    Promise.all([
      axios.get(`${API_URL}/api/get-user-by-userName/${activeUser}`),
      axios.get(
        `${API_URL}/api/difference/${activeUser}?interval=daily&page=1&limit=700`
      ),
    ])
      .then(([userRes, diffRes]) => {
        const company = userRes.data.user.companyName || "";
        let entries = diffRes.data.data || [];

        // Filter for effluent_flow and remove unwanted stacks
        entries = entries.filter(
          (e) =>
            e.stationType === "effluent_flow" &&
            typeof e.cumulatingFlowDifference === "number" &&
            filterUnwantedStacks(e.stackName)
        );

        // Dedupe per date+stackName, pick latest timestamp
        const byKey = {};
        entries.forEach((e) => {
          const key = `${e.date}|${e.stackName}`;
          if (
            !byKey[key] ||
            new Date(e.timestamp) > new Date(byKey[key].timestamp)
          ) {
            byKey[key] = e;
          }
        });
        const deduped = Object.values(byKey);

        // Pick last 20 unique dates (descending)
        const uniqDates = Array.from(
          new Set(deduped.map((e) => e.date))
        )
          .sort(
            (a, b) =>
              moment(b, "DD/MM/YYYY").valueOf() -
              moment(a, "DD/MM/YYYY").valueOf()
          )
          .slice(0, 20);

        // Shape into [{ date, stacks: [ {stackName, diff}, … ] }, …]
        const byDate = uniqDates.map((date) => ({
          date,
          stacks: deduped
            .filter((e) => e.date === date)
            .map((e) => ({
              stackName: e.stackName,
              diff: e.cumulatingFlowDifference,
            })),
        }));

        // Headers for table
        const hdrs = byDate.map((d) => ({
          original: d.date,
          display: moment(d.date, "DD/MM/YYYY").format("DD-MMM"),
        }));

        // Cache
        companyCache.current[activeUser] = company;
        dataCache.current[activeUser] = {
          companyName: company,
          differences: byDate,
          headers: hdrs,
        };

        // Set state
        setCompanyName(company);
        setDifferences(byDate);
        setHeaders(hdrs);
        setPage(0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [activeUser]);

  // grouped[stackName][date] = diff
  const grouped = useMemo(() => {
    const g = {};
    differences.forEach(({ date, stacks }) => {
      stacks.forEach(({ stackName, diff }) => {
        if (filterUnwantedStacks(stackName)) {
          if (!g[stackName]) g[stackName] = {};
          g[stackName][date] = diff;
        }
      });
    });
    return g;
  }, [differences]);

  // Dynamic list of stackNames (filtered)
  const stackNames = useMemo(() => {
    const seen = [];
    differences.forEach(({ stacks }) =>
      stacks.forEach(({ stackName }) => {
        if (!seen.includes(stackName) && filterUnwantedStacks(stackName)) {
          seen.push(stackName);
        }
      })
    );
    return seen;
  }, [differences]);

  // Compute min/max date per stack
  const extremes = useMemo(() => {
    const e = {};
    stackNames.forEach((name) => {
      const vals = headers
        .map(({ original }) => ({
          date: original,
          value: grouped[name]?.[original] ?? null,
        }))
        .filter((x) => x.value != null);
      if (vals.length) {
        let min = vals[0],
          max = vals[0];
        vals.forEach((v) => {
          if (v.value < min.value) min = v;
          if (v.value > max.value) max = v;
        });
        e[name] = { minDate: min.date, maxDate: max.date };
      } else {
        e[name] = { minDate: null, maxDate: null };
      }
    });
    return e;
  }, [stackNames, grouped, headers]);

  const displayName = (companyName || "NO COMPANY SELECTED").toUpperCase();
  const pageCount = Math.ceil(headers.length / PAGE_SIZE);
  const pagedHeaders = headers.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );
const handleModalSubmit = () => {
  setShowModal(false);
  navigate(
    `/previous-quantity?user=${modalUser}&month=${modalMonth}&year=${modalYear}`
  );
};
  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: "white" }}>
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12">
          <Hedaer />

          <div className="summary-top-bar d-flex justify-content-between align-items-center p-3 border ">
            <h2 className="company-name">{displayName}</h2>
            <div>
              <button
                style={{ backgroundColor: DARK_BLUE, color: "white" }}
                className="btn me-2 active"
              >
                Water Quantity
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/summary/waterquality")}
              >
                Water Quality
              </button>
            </div>
          </div>
  <div className="d-flex align-items-center justify-content-end mt-2">
            <button
              className="btn btn-secondary"
              onClick={() => setShowModal(true)}
            >
              Previous Data
            </button>
          </div>        {isLoading ? (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table summary-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Acceptable Limits</th>
                    {pagedHeaders.map(({ display, original }) => (
                      <th key={original}>{display}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stackNames.map((stackName) => {
                    const { minDate, maxDate } = extremes[stackName];
                    return (
                      <tr key={stackName}>
                        <td>{stackName}</td>
                        <td>-</td>
                        {pagedHeaders.map(({ original }) => {
                          const val = grouped[stackName]?.[original] ?? null;
                          const bg = getColorForValue(
                            original,
                            minDate,
                            maxDate
                          );
                          const isMax = original === maxDate;
                          return (
                            <td
                              key={original}
                              style={{
                                backgroundColor: bg,
                                color: isMax ? "#fff" : "#003366",
                              }}
                            >
                              {val != null ? val.toFixed(2) : "NA"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex justify-content-end align-items-center mb-4">
            <button
              className="btn btn-secondary me-2"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ‹
            </button>
            <span>
              Page {page + 1} of {pageCount}
            </span>
            <button
              className="btn btn-secondary ms-2"
              onClick={() =>
                setPage((p) => Math.min(pageCount - 1, p + 1))
              }
              disabled={page >= pageCount - 1}
            >
              ›
            </button>
          </div>

          <div className="mt-5 border p-4 m-2 shadow">
            <h3 className="mb-3">Trending Analysis (Effluent Flow)</h3>
            <EffluentBarChart userName={activeUser} />
          </div>

           <div
            className={`modal fade ${showModal ? "show" : ""}`}
            style={{ display: showModal ? "block" : "none" }}
            tabIndex={-1}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Select User / Month / Year</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">User</label>
                    <select
                      className="form-select"
                      value={modalUser}
                      onChange={(e) => setModalUser(e.target.value)}
                    >
                      <option value="">— select user —</option>
                      {allFetchedUsers.map((u) => (
                        <option key={u._id} value={u.userName}>
                          {u.userName}-{u.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Month</label>
                    <select
                      className="form-select"
                      value={modalMonth}
                      onChange={(e) => setModalMonth(e.target.value)}
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Year</label>
                    <select
                      className="form-select"
                      value={modalYear}
                      onChange={(e) => setModalYear(e.target.value)}
                    >
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const y = new Date().getFullYear() - idx;
                        return (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn"
                    style={{backgroundColor:'#236a80' , color:'#fff'}}
                    disabled={!modalUser}
                    onClick={handleModalSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
          {showModal && <div className="modal-backdrop fade show" />}
        </div>
      </div>
    </div>
  );
};

export default Summary;