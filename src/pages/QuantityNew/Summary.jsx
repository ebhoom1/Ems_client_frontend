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
  const [differences, setDifferences] = useState([]); // was `averages`
  const [headers, setHeaders] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // load from cache
    if (
      companyCache.current[activeUser] &&
      dataCache.current[activeUser]
    ) {
      const { companyName, differences, headers } =
        dataCache.current[activeUser];
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

        // 1️⃣ keep only effluent_flow & those with a real diff
        entries = entries.filter(
          (e) =>
            e.stationType === "effluent_flow" &&
            typeof e.cumulatingFlowDifference === "number"
        );

        // 2️⃣ dedupe per date+stackName, pick latest timestamp
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

        // 3️⃣ pick last 20 unique dates (descending)
        const uniqDates = Array.from(
          new Set(deduped.map((e) => e.date))
        )
          .sort(
            (a, b) =>
              moment(b, "DD/MM/YYYY").valueOf() -
              moment(a, "DD/MM/YYYY").valueOf()
          )
          .slice(0, 20);

        // 4️⃣ shape into [{ date, stacks: [ {stackName, diff}, … ] }, …]
        const byDate = uniqDates.map((date) => ({
          date,
          stacks: deduped
            .filter((e) => e.date === date)
            .map((e) => ({
              stackName: e.stackName,
              diff: e.cumulatingFlowDifference,
            })),
        }));

        // 5️⃣ headers for table
        const hdrs = byDate.map((d) => ({
          original: d.date,
          display: moment(d.date, "DD/MM/YYYY").format("DD-MMM"),
        }));

        // cache
        companyCache.current[activeUser] = company;
        dataCache.current[activeUser] = {
          companyName: company,
          differences: byDate,
          headers: hdrs,
        };

        // set state
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
        if (!g[stackName]) g[stackName] = {};
        g[stackName][date] = diff;
      });
    });
    return g;
  }, [differences]);

  // dynamic list of stackNames
  const stackNames = useMemo(() => {
    const seen = [];
    differences.forEach(({ stacks }) =>
      stacks.forEach(({ stackName }) => {
        if (!seen.includes(stackName)) seen.push(stackName);
      })
    );
    return seen;
  }, [differences]);

  // compute min/max date per stack
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

          {isLoading ? (
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
        </div>
      </div>
    </div>
  );
};

export default Summary;
