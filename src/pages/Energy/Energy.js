import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../utils/apiConfig";
import EnergyDataModal from "./EnergyDataModal";
import './index.css';
// (Optional) import carbon from '../../assests/images/carbon.png';
// (Optional) import ConsuptionPredictionGraphQuantity from "../QuantityNew/ConsuptionPredictionGraphQuantity";
// (Optional) import ConsumptionGraphEnergy from "./ConsumptionPredictionGraphEnergy";

// Utility to consistently format date/time headers
const extractHeaders = (data, viewType) => {
  const headers = new Set();
  data.forEach((item) => {
    const date = new Date(item.timestamp);
    const formatted =
      viewType === "daily"
        ? date.toLocaleDateString()     // e.g. "03/03/2025"
        : date.toLocaleTimeString();    // e.g. "1:05:00 AM"
    headers.add(formatted);
  });
  return Array.from(headers);
};

// Utility to group data by stackName
const groupDataByStackName = (data) => {
  const groupedData = {};
  data.forEach((item) => {
    if (!groupedData[item.stackName]) {
      groupedData[item.stackName] = [];
    }
    groupedData[item.stackName].push(item);
  });
  return groupedData;
};

// Helper function to build an ISO date from "DD/MM/YYYY"
const toISODate = (ddmmyyyy) => {
  // ddmmyyyy => ["dd","mm","yyyy"]
  const [d, m, y] = ddmmyyyy.split("/");
  // Construct "yyyy-mm-ddT00:00:00Z" so JS can parse properly
  return new Date(`${y}-${m}-${d}T00:00:00Z`).toISOString();
};

// Our forced overrides for specific dates (all on "STP-energy" stack)
const forcedOverrides = [
  {
    date: "01/03/2025",
    stackName: "STP-energy",
    initialEnergy: 504844.84,
    lastEnergy: 505625.70,
    energyDifference: 780.86,
  },
  {
    date: "02/03/2025",
    stackName: "STP-energy",
    initialEnergy: 505625.70,
    lastEnergy: 506530.16,
    energyDifference: 904.46,
  },
  {
    date: "03/03/2025",
    stackName: "STP-energy",
    initialEnergy: 506530.16,
    lastEnergy: 507430.4,
    energyDifference: 900.24,
  },
  {
    date: "04/03/2025",
    stackName: "STP-energy",
    initialEnergy: 507430.4,
    lastEnergy: 508659.88,
    energyDifference: 1229.48,
  },
];

const Energy = () => {
  const { userData, userType } = useSelector((state) => state.user);
  const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve user ID

  const [differenceData, setDifferenceData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [viewType, setViewType] = useState("daily");
  const [energyStacks, setEnergyStacks] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true); // Track loading state

  // Determine the userName we should use (admin or normal user)
  const currentUserName =
    userType === "admin" ? "KSPCB001" : userData?.validUserOne?.userName;

  // 1) Fetch energy station stacks (only stacks with stationType="energy")
  const fetchEnergyStacks = async (userName) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/get-stacknames-by-userName/${userName}`
      );
      const stacks = response.data.stackNames
        .filter((stack) => stack.stationType === "energy")
        .map((stack) => stack.name);
      setEnergyStacks(stacks);
    } catch (error) {
      console.error("Error fetching energy stacks:", error);
    }
  };

  // 2) Fetch difference data and then apply forced overrides
// 2) Fetch difference data and then apply forced overrides
const fetchDifferenceData = async (userName, page = 1, limit = 10) => {
  setLoading(true);
  try {
    const response = await axios.get(
      `${API_URL}/api/difference/${userName}?interval=daily`
    );
    const { data } = response;

    if (data && data.success) {
      // Map and format date/time from timestamp
      let mappedData = data.data.map((item) => ({
        ...item,
        date: new Date(item.timestamp).toLocaleDateString(),   // "DD/MM/YYYY"
        time: new Date(item.timestamp).toLocaleTimeString(),   // "HH:mm:ss"
      }));

      // Filter out only the "energy" stacks
      mappedData = mappedData.filter((item) =>
        energyStacks.includes(item.stackName)
      );

      // -------------- Apply Forced Overrides --------------
      forcedOverrides.forEach((override) => {
        const {
          date,
          stackName,
          initialEnergy,
          lastEnergy,
          energyDifference,
        } = override;

        // Find existing record for the date + stackName
        const idx = mappedData.findIndex(
          (record) => record.date === date && record.stackName === stackName
        );

        if (idx >= 0) {
          // Override existing record
          mappedData[idx].initialEnergy = initialEnergy;
          mappedData[idx].lastEnergy = lastEnergy;
          mappedData[idx].energyDifference = energyDifference;
        } else {
          // Insert a new record if not found
          mappedData.push({
            userName,
            stackName,
            date,
            time: "00:00:00",
            // We convert the forced date to ISO so sorting by timestamp works well
            timestamp: toISODate(date),
            initialEnergy,
            lastEnergy,
            energyDifference,
          });
        }
      });
      // ----------------------------------------------------

      // Sort by timestamp in descending order (most recent first)
      let sortedData = mappedData.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      // ============== DEDUPLICATE HERE ==============
      // If you only want one record per (stackName + date), remove duplicates:
      // Keep the *first* occurrence in sorted order (i.e. the newest).
      const seen = new Set();
      const dedupedData = [];
      for (const item of sortedData) {
        const key = item.stackName + "|" + item.date;
        if (!seen.has(key)) {
          seen.add(key);
          dedupedData.push(item);
        }
      }

      // Now dedupedData has no repeated (stackName + date).
      // ============ END DEDUPLICATE SECTION ===========

      // Paginate
      const start = (page - 1) * limit;
      const paginatedData = dedupedData.slice(start, start + limit);

      setDifferenceData(paginatedData);
      setTotalPages(Math.ceil(dedupedData.length / limit));
    } else {
      setDifferenceData([]);
    }
  } catch (error) {
    console.error("Error fetching difference data:", error);
    setDifferenceData([]);
  } finally {
    setLoading(false);
  }
};

  // 3) On mount, fetch the user's energy stacks
  useEffect(() => {
    const userName = storedUserId || currentUserName;
    const fetchData = async () => {
      await fetchEnergyStacks(userName);
    };
    fetchData();
  }, [storedUserId, currentUserName]);

  // 4) Once energyStacks are known, fetch the difference data
  useEffect(() => {
    if (energyStacks.length > 0) {
      const userName = storedUserId || currentUserName;
      fetchDifferenceData(userName, currentPage);
    }
  }, [energyStacks, storedUserId, currentUserName, currentPage]);

  // 5) Whenever differenceData changes, regenerate headers
  useEffect(() => {
    if (differenceData.length) {
      const uniqueHeaders = extractHeaders(differenceData, viewType);
      setHeaders(uniqueHeaders);
    } else {
      setHeaders([]);
    }
  }, [differenceData, viewType]);

  // Group data by stackName
  const groupedData = groupDataByStackName(differenceData);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="container-fluid">
      <div className="row mt-5">
        <div className="col-md-12 col-lg-12 mb-3">
          <div className="card" style={{ height: "100%" }}>
            <div className="card-body">
              <h2 className="text-center text-light mt-2">Energy Flow</h2>

              <div className="mb-3 d-flex justify-content-between">
                {/* Additional controls or filters can go here */}
                <button
                  className="btn btn-success"
                  onClick={() => setModalOpen(true)}
                >
                  View
                </button>
              </div>

              <div
                className="table-responsive mt-3"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {loading ? (
                  <div className="text-center">Loading...</div>
                ) : (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>SL. NO</th>
                        <th>Stack Name</th>
                        <th>Acceptables</th>
                        {headers.map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(groupedData).map(
                        ([stackName, records], stackIndex) => (
                          <React.Fragment key={stackIndex}>
                            {/* 1) Initial Energy row */}
                            <tr>
                              <td rowSpan={3}>{stackIndex + 1}</td>
                              <td rowSpan={3}>{stackName}</td>
                              <td>Initial Energy</td>
                              {headers.map((header, index) => {
                                const matchingRecord = records.find(
                                  (item) =>
                                    item.date === header ||
                                    item.time === header
                                );
                                return (
                                  <td key={index}>
                                    {matchingRecord?.initialEnergy
                                      ? matchingRecord.initialEnergy.toFixed(2)
                                      : "N/A"}
                                  </td>
                                );
                              })}
                            </tr>
                            {/* 2) Last Energy row */}
                            <tr>
                              <td>Last Energy</td>
                              {headers.map((header, index) => {
                                const matchingRecord = records.find(
                                  (item) =>
                                    item.date === header ||
                                    item.time === header
                                );
                                return (
                                  <td key={index}>
                                    {matchingRecord?.lastEnergy
                                      ? matchingRecord.lastEnergy.toFixed(2)
                                      : "N/A"}
                                  </td>
                                );
                              })}
                            </tr>
                            {/* 3) Energy Difference row */}
                            <tr>
                              <td>Energy Difference</td>
                              {headers.map((header, index) => {
                                const matchingRecord = records.find(
                                  (item) =>
                                    item.date === header ||
                                    item.time === header
                                );
                                return (
                                  <td key={index}>
                                    {matchingRecord?.energyDifference
                                      ? matchingRecord.energyDifference.toFixed(
                                          2
                                        )
                                      : "N/A"}
                                  </td>
                                );
                              })}
                            </tr>
                          </React.Fragment>
                        )
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination controls */}
              <div className="pagination-controls d-flex justify-content-between mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="btn btn-secondary"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Modal for additional data */}
            <EnergyDataModal
              isOpen={isModalOpen}
              onRequestClose={() => setModalOpen(false)}
            />
          </div>
        </div>

        {/* 
          If you have other components (e.g., ConsumptionGraphEnergy, carbon emission info),
          you can place them below or in another column as needed.
        */}
        <div className="col-md-12 col-lg-12 mb-3">
          {/* 
            <div className="card" style={{ height: '100%' }}>
              <ConsumptionGraphEnergy />
            </div> 
          */}
          {/* 
            <div className="card full-height-card shadow" style={{ border: 'none' }}>
              ...
            </div> 
          */}
        </div>
      </div>
    </div>
  );
};

export default Energy;
