import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../utils/apiConfig";
import EnergyDataModal from "./EnergyDataModal";
import './index.css';
import Log from "../Login/Log";

const formatDateDDMMYYYY = (dateInput) => {
  const date = new Date(dateInput);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Utility to consistently format date/time headers
const extractHeaders = (data, viewType) => {
  const headers = new Set();
  data.forEach((item) => {
    const date = new Date(item.timestamp);
    const formatted =
      viewType === "daily"
        ? formatDateDDMMYYYY(date)
        : date.toLocaleTimeString(); // For time, you can keep the default
    headers.add(formatted);
  });
  return Array.from(headers);
};

// Utility to group data by stackName
const groupDataByStackName = (data) => {
  const grouped = {};

  data.forEach((item) => {
    const { stackName, initialEnergy, lastEnergy, energyDifference } = item;

    const hasRealData =
      initialEnergy !== undefined ||
      lastEnergy !== undefined ||
      energyDifference !== undefined;

    if (!grouped[stackName]) {
      grouped[stackName] = [item];
    } else {
      const existingHasRealData = grouped[stackName].some(
        (record) =>
          record.initialEnergy !== undefined ||
          record.lastEnergy !== undefined ||
          record.energyDifference !== undefined
      );

      if (!existingHasRealData && hasRealData) {
        grouped[stackName] = [item];
      } else if (existingHasRealData && hasRealData) {
        grouped[stackName].push(item);
      }
    }
  });

  return grouped;
};


// Helper function to build an ISO date from "DD/MM/YYYY"
const toISODate = (ddmmyyyy) => {
  const [d, m, y] = ddmmyyyy.split("/");
  return new Date(`${y}-${m}-${d}T00:00:00Z`).toISOString();
};

// Mock data for HH014
const mockDataForHH014 = [
  {
    userName: "HH014",
    stackName: "STP-energy",
    date: "01/03/2025",
    time: "00:00:00",
    timestamp: toISODate("01/03/2025"),
    initialEnergy: 504844.84,
    lastEnergy: 505625.70,
    energyDifference: 780.86,
  },
  {
    userName: "HH014",
    stackName: "STP-energy",
    date: "02/03/2025",
    time: "00:00:00",
    timestamp: toISODate("02/03/2025"),
    initialEnergy:  505625.70,
    lastEnergy:506530.16,
    energyDifference: 904.46,
  },
  {
    userName: "HH014",
    stackName: "STP-energy",
    date: "03/03/2025",
    time: "00:00:00",
    timestamp: toISODate("03/03/2025"),
    initialEnergy:506530.16,
    lastEnergy: 507430.4,
    energyDifference:  900.24,
  },
  {
    userName: "HH014",
    stackName: "STP-energy",
    date: "04/03/2025",
    time: "00:00:00",
    timestamp: toISODate("03/03/2025"),
    initialEnergy:507430.4,
    lastEnergy:508659.88,
    energyDifference:  1229.48,
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

  // 2) Fetch difference data and conditionally add mock data for HH014
  const fetchDifferenceData = async (userName, page = 1, limit = 500) => {
    setLoading(true);
    try {
      // Fetch data from the API
      const response = await axios.get(
             `${API_URL}/api/difference/${userName}?interval=daily&page=${page}&limit=${limit}`
        
      
      );
      const { data } = response;
console.log('energy differencedata',data);

      if (data && data.success) {
        // Map and format date/time from timestamp

// 1) Filter out only stationType = "energy"
// 1) Filter out only stationType = "energy"
let filteredData = data.data.filter(
  (item) => item.stationType === "energy"
);

// 2.1) Remove accidental typo stackName for MY_HOME017
if (userName === "MY_HOME017") {
  filteredData = filteredData.filter(
    (item) => item.stackName.trim() !== "Enery_meter_1"
  );
}

// 2.2) Normalize the stackName
filteredData = filteredData.map((item) => ({
  ...item,
  stackName: item.stackName.trim(),
}));

// 2.3) Map and format date/time from timestamp
let mappedData = filteredData.map((item) => ({
  ...item,
  date: formatDateDDMMYYYY(item.timestamp),
  time: new Date(item.timestamp).toLocaleTimeString(),
}));

// 2.4) (Optional) Add mock data for HH014 if needed
if (storedUserId === "HH014") {
  mappedData = [...mappedData, ...mockDataForHH014];
}

// 2.5) Sort by timestamp
mappedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// 2.6) Paginate
const start = (page - 1) * limit;
const paginatedData = mappedData.slice(start, start + limit);


setDifferenceData(paginatedData);
setTotalPages(Math.ceil(mappedData.length / limit));


        /*  */
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
        <div className="col-md-12 col-lg-12 mb-3">
        </div>
      </div>
    </div>
  );
};

export default Energy;