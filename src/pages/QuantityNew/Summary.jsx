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

  // caches
  const companyCache = useRef({});
  const dataCache = useRef({});

  const [companyName, setCompanyName] = useState("");
  const [averages, setAverages] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // if we have everything cached, load from cache
    if (companyCache.current[activeUser] && dataCache.current[activeUser]) {
      const { companyName, averages, headers } = dataCache.current[activeUser];
      setCompanyName(companyName);
      setAverages(averages);
      setHeaders(headers);
      setIsLoading(false);
      setPage(0);
      return;
    }

    setIsLoading(true);

    // fetch both in parallel
    Promise.all([
      axios.get(`${API_URL}/api/get-user-by-userName/${activeUser}`),
      axios.get(
        `${API_URL}/api/daily/effluent-averages?userName=${activeUser}&days=20`
      ),
    ])
      .then(([userRes, dailyRes]) => {
        const company = userRes.data.user.companyName || "";
        const data = dailyRes.data.data || [];

        // build sorted headers
        const sorted = data
          .map((d) => ({
            original: d.date,
            m: moment(d.date, "DD/MM/YYYY"),
          }))
          .sort((a, b) => b.m.valueOf() - a.m.valueOf())
          .map(({ original, m }) => ({
            original,
            display: m.format("DD-MMM"),
          }));

        // cache
        companyCache.current[activeUser] = company;
        dataCache.current[activeUser] = {
          companyName: company,
          averages: data,
          headers: sorted,
        };

        // set state
        setCompanyName(company);
        setAverages(data);
        setHeaders(sorted);
        setPage(0);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [activeUser]);

  // grouped[stackName][date] = avgFlow
  const grouped = useMemo(() => {
    const g = {};
    averages.forEach(({ date, stacks }) => {
      stacks.forEach(({ stackName, avgFlow }) => {
        if (!g[stackName]) g[stackName] = {};
        g[stackName][date] = avgFlow;
      });
    });
    return g;
  }, [averages]);

  // dynamic list of stackNames
  const stackNames = useMemo(() => {
    const seen = [];
    averages.forEach(({ stacks }) =>
      stacks.forEach(({ stackName }) => {
        if (!seen.includes(stackName)) seen.push(stackName);
      })
    );
    return seen;
  }, [averages]);

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
              <button className="btn btn-outline-secondary">
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
                          const val =
                            grouped[stackName]?.[original] ?? null;
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
