
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";
import FlowDataModal from "./FlowDataModal";
import "./index.css";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5; // columns per page

// parse "DD/MM/YYYY" → Date
const parseDMY = (str) => {
  const [d, m, y] = str.split("/").map(Number);
  return new Date(y, m - 1, d);
};

export default function Quantity() {
  const { userData, userType } = useSelector((state) => state.user);
  const [differenceData, setDifferenceData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [effluentFlowStacks, setEffluentFlowStacks] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const storedUserId = sessionStorage.getItem("selectedUserId");
  const currentUserName =
    userType === "admin" ? "KSPCB001" : userData?.validUserOne?.userName;

  // Helper to normalize stack names
  const normalizeString = (str) => str.replace(/\s+/g, " ").trim();

  // Group data by stackName
  const groupDataByStackName = (data, effluentFlowStacks) => {
    const normalizedEffluentStacks = effluentFlowStacks.map(normalizeString);
    return data.reduce((acc, item) => {
      const name = normalizeString(item.stackName);
      if (normalizedEffluentStacks.includes(name)) {
        if (!acc[name]) acc[name] = [];
        acc[name].push(item);
      }
      return acc;
    }, {});
  };

  // fetch available stacks
  useEffect(() => {
    const fetchStacks = async (userName) => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/get-stacknames-by-userName/${userName}`
        );
        if (data.stackNames) {
          setEffluentFlowStacks(
            data.stackNames
              .filter((s) => s.stationType === "effluent_flow")
              .map((s) => s.name)
          );
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchStacks(storedUserId || currentUserName);
  }, [storedUserId, currentUserName]);

  // fetch all difference data
  useEffect(() => {
    if (!effluentFlowStacks.length) return;

    const fetchAllDifferenceData = async (userName) => {
      try {
        const resp = await axios.get(
          `${API_URL}/api/difference/${userName}?interval=daily&limit=1000`
        );
        if (resp.data.success) {
          const normalized = resp.data.data.map((item) => ({
            ...item,
            date: item.date || item.timestamp.slice(0, 10).split("-").reverse().join("/"),
          }));
          setDifferenceData(normalized);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchAllDifferenceData(storedUserId || currentUserName);
  }, [effluentFlowStacks, storedUserId, currentUserName]);

  // compute total pages once we have data
  useEffect(() => {
    if (!differenceData.length) {
      setTotalPages(1);
      return;
    }
    const uniqueDates = Array.from(
      new Set(differenceData.map((i) => i.date))
    );
    setTotalPages(Math.ceil(uniqueDates.length / PAGE_SIZE));
  }, [differenceData]);

  // build headers = [maxDate, maxDate-1, ...] for current page
  useEffect(() => {
    if (!differenceData.length) {
      setHeaders([]);
      return;
    }

    // 1) find latest date
    const uniqueDates = Array.from(
      new Set(differenceData.map((i) => i.date))
    );
    const maxDate = uniqueDates
      .map(parseDMY)
      .reduce((m, cur) => (cur > m ? cur : m), new Date(0));

    // 2) create PAGE_SIZE headers for this page
    const startOffset = (currentPage - 1) * PAGE_SIZE;
    const newHeaders = Array.from({ length: PAGE_SIZE }).map((_, idx) => {
      const d = new Date(maxDate);
      d.setDate(d.getDate() - (startOffset + idx));
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    });

    setHeaders(newHeaders);
  }, [differenceData, currentPage]);

  const groupedData = groupDataByStackName(
    differenceData,
    effluentFlowStacks
  );

  // optional fixed order for a specific user
  const fixedStackOrder = [
    "ETP outlet",
    "STP inlet",
    "STP acf outlet",
    "STP uf outlet",
    "STP softener outlet",
    "STP garden outlet 1",
    "STP garden outlet 2",
  ];
  const finalGroupData =
    storedUserId === "HH014"
      ? fixedStackOrder
          .map((name) => ({
            stackName: name,
            records: groupedData[normalizeString(name)] || [],
          }))
          .filter((g) => g.records.length)
      : Object.entries(groupedData).map(([stackName, records]) => ({
          stackName,
          records,
        }));

  return (
    <div className="container-fluid">
      <div className="row mt-5">
        <div className="col-md-12 mb-2">
          <div className="card" style={{ height: "100%" }}>
            <div className="card-body">
              <h2 className="text-center text-light mt-2">Water Flow</h2>
              <div className="mb-3 d-flex justify-content-between">
                <button
                  className="btn btn-success"
                  onClick={() => setModalOpen(true)}
                >
                  View
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => navigate("/summary")}
                >
                  Summarize table
                </button>
              </div>

              <div
                className="table-responsive mt-3"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {!differenceData.length ? (
                  <div className="text-center">Loading...</div>
                ) : (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>SL. NO</th>
                        <th>Stack Name</th>
                        <th>Acceptables</th>
                        {headers.map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {finalGroupData.map((grp, i) => (
                        <tr key={grp.stackName}>
                          <td>{i + 1}</td>
                          <td>{grp.stackName}</td>
                          <td>Flow Difference</td>
                          {headers.map((h) => {
                            const rec = grp.records.find((r) => r.date === h);
                            return (
                              <td key={h}>
                                {rec?.cumulatingFlowDifference != null
                                  ? rec.cumulatingFlowDifference.toFixed(2)
                                  : "N/A"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* pagination */}
              <div className="d-flex justify-content-between mt-3">
                <button
                  className="btn btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>

            {/* modal */}
            <FlowDataModal
              isOpen={isModalOpen}
              onRequestClose={() => setModalOpen(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
