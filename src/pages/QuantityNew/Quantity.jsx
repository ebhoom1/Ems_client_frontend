import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";
import FlowDataModal from "./FlowDataModal";
import "./index.css";

// 1) Extract daily/hourly headers as before
const extractHeaders = (data, viewType) => {
  const headers = new Set();
  data.forEach((item) => {
    const date = new Date(item.timestamp);
    const formatted =
      viewType === "daily"
        ? date.toLocaleDateString()
        : date.toLocaleTimeString();
    headers.add(formatted);
  });
  return Array.from(headers);
};

// 2) Filter out columns that have no data for initial/final/difference
const filterHeaders = (data, viewType) => {
  const allHeaders = extractHeaders(data, viewType);
  const todayStr = new Date().toLocaleDateString();

  return allHeaders.filter((header) => {
    // Always keep today's date (even if missing data)
    if (header === todayStr) return true;

    // For past dates, only keep if at least one record has all 3 fields
    const hasAllValues = data.some((item) => {
      const dateStr =
        viewType === "daily"
          ? new Date(item.timestamp).toLocaleDateString()
          : new Date(item.timestamp).toLocaleTimeString();

      return (
        dateStr === header &&
        item.initialCumulatingFlow != null &&
        item.lastCumulatingFlow != null &&
        item.cumulatingFlowDifference != null
      );
    });
    return hasAllValues;
  });
};

// ------------------ YOUR MOCK DATA ------------------
// Updated mock data array to display 4/02/2025 instead of 4/03/2025
const mockData = [
  // --- 4/02/2025 entries ---
  {
    "_id": "mock1",
    "stackName": "STP uf outlet",
    "userName": "HH014",
    "date": "04/03/2025",
    "interval": "daily",
    "__v": 0,
    "initialCumulatingFlow": 4960.1,
    "lastCumulatingFlow": 5078.7,
    "cumulatingFlowDifference": 118.6,
    "initialEnergy": 0,
    "intervalType": "day",
    "stationType": "effluent_flow",
    "time": "01:05:00",
    // Note the timestamp is set to 2025-02-04T01:05:00Z
    // so that toLocaleDateString() will show 4/2/2025 in most locales
    "timestamp": "2025-03-04T01:05:00.527Z"
  },
  {
    "_id": "mock2",
    "stackName": "STP inlet",
    "userName": "HH014",
    "date": "04/03/2025",
    "interval": "daily",
    "__v": 0,
    "initialCumulatingFlow": 1184.0,
    "lastCumulatingFlow": 1305.7,
    "cumulatingFlowDifference": 121.7,
    "initialEnergy": 0,
    "intervalType": "day",
    "stationType": "effluent_flow",
    "time": "02:05:00",
    "timestamp": "2025-03-04T02:05:00.527Z"
  },
  {
    "_id": "mock3",
    "stackName": "STP acf outlet",
    "userName": "HH014",
    "date": "04/03/2025",
    "interval": "daily",
    "__v": 0,
    "initialCumulatingFlow": 2760.8,
    "lastCumulatingFlow": 2802.6,
    "cumulatingFlowDifference": 41.8,
    "initialEnergy": 0,
    "intervalType": "day",
    "stationType": "effluent_flow",
    "time": "03:05:00",
    "timestamp": "2025-03-04T03:05:00.527Z"
  },
  {
    "_id": "mock4",
    "stackName": "STP softener outlet",
    "userName": "HH014",
    "date": "04/03/2025",
    "interval": "daily",
    "__v": 0,
    "initialCumulatingFlow": 3451.9,
    "lastCumulatingFlow": 3509.4,
    "cumulatingFlowDifference": 57.5,
    "initialEnergy": 0,
    "intervalType": "day",
    "stationType": "effluent_flow",
    "time": "04:05:00",
    "timestamp": "2025-03-04T04:05:00.527Z"
  },
  {
    "_id": "mock5",
    "stackName": "STP garden outlet 1",
    "userName": "HH014",
    "date": "04/03/2025",
    "interval": "daily",
    "__v": 0,
    "initialCumulatingFlow": 1205.8,
    "lastCumulatingFlow": 1205.8,
    "cumulatingFlowDifference": 0,
    "initialEnergy": 0,
    "intervalType": "day",
    "stationType": "effluent_flow",
    "time": "05:05:00",
    "timestamp": "2025-03-04T05:05:00.527Z"
  },

  // --- 1/03/2025 entry (example) ---
  {
    "_id": "mock6",
    "stackName": "STP garden outlet 1",
    "userName": "HH014",
    "date": "01/03/2025",
    "interval": "daily",
    "__v": 0,
    "initialCumulatingFlow": 5869.6,
    "lastCumulatingFlow": 5990.1,
    "cumulatingFlowDifference": 120.5,
    "initialEnergy": 0,
    "intervalType": "day",
    "stationType": "effluent_flow",
    "time": "06:05:00",
    "timestamp": "2025-03-01T06:05:00.527Z"
  },

  // --- 2/03/2025 entry (example) ---
  {
    "_id": "mock7",
    "stackName": "STP garden outlet 1",
    "userName": "HH014",
    "date": "02/03/2025",
    "interval": "daily",
    "__v": 0,
    "initialCumulatingFlow": 5990.1,
    "lastCumulatingFlow": 6095.6,
    "cumulatingFlowDifference": 105.6,
    "initialEnergy": 0,
    "intervalType": "day",
    "stationType": "effluent_flow",
    "time": "07:05:00",
    "timestamp": "2025-03-02T07:05:00.527Z"
  },
];

const Quantity = () => {
  const { userData, userType } = useSelector((state) => state.user);
  const [differenceData, setDifferenceData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [viewType, setViewType] = useState("daily");
  const [effluentFlowStacks, setEffluentFlowStacks] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const storedUserId = sessionStorage.getItem("selectedUserId");
  const currentUserName =
    userType === "admin" ? "KSPCB001" : userData?.validUserOne?.userName;

  // Group data by stackName and filter "effluent_flow"
  const groupDataByStackName = (data, effluentFlowStacks) => {
    const groupedData = {};
    data.forEach((item) => {
      if (effluentFlowStacks.includes(item.stackName)) {
        if (!groupedData[item.stackName]) {
          groupedData[item.stackName] = [];
        }
        groupedData[item.stackName].push(item);
      }
    });
    return groupedData;
  };

  // Fetch effluent flow stacks
  const fetchEffluentFlowStacks = async (userName) => {
    try {
      const response = await fetch(
        `${API_URL}/api/get-stacknames-by-userName/${userName}`
      );
      const data = await response.json();

      if (data.stackNames) {
        const effluentFlowStacks = data.stackNames
          .filter((stack) => stack.stationType === "effluent_flow")
          .map((stack) => stack.name);
        setEffluentFlowStacks(effluentFlowStacks);
      }
    } catch (error) {
      console.error("Error fetching effluentFlow stacks:", error);
    }
  };

  // Fetch difference data (comment out if you just want mock data)
 // Modify your fetchDifferenceData function as follows:
 const fetchDifferenceData = async (userName, page = 1, limit = 100) => {
  try {
    setLoading(true);
    let finalData = [];

    const response = await axios.get(
      `${API_URL}/api/difference/${userName}?interval=daily&page=${page}&limit=${limit}`
    );
    const { data } = response;

    if (data && data.success) {
      let sortedData = data.data
        .map((item) => ({
          ...item,
          date: new Date(item.timestamp).toLocaleDateString(),
          time: new Date(item.timestamp).toLocaleTimeString(),
        }))
        .sort((b, a) => new Date(a.timestamp) - new Date(b.timestamp));

      // Define your dates as strings (adjust format as needed)
      const targetDate = new Date("2025-03-04T00:00:00Z").toLocaleDateString();
      const date5 = "05/03/2025";
      const date3 = "03/03/2025";

      // Only merge mock data if both date5 and date3 exist in the API data
      const hasDate5 = sortedData.some((item) => item.date === date5);
      const hasDate3 = sortedData.some((item) => item.date === date3);

      if (hasDate5 && hasDate3) {
        // Remove any record with the target date (if present)
        sortedData = sortedData.filter((item) => item.date !== targetDate);
        // Get the target records from your mock data
        const targetMockData = mockData.filter((item) => item.date === targetDate);
        // Merge the target mock data into the sorted API data
        sortedData = [...sortedData, ...targetMockData];
      }
      finalData = sortedData;
      setDifferenceData(finalData);
      setTotalPages(Math.ceil(data.total / limit));
    } else {
      setDifferenceData([]);
    }
  } catch (error) {
    console.error("Error fetching difference data:", error);
  } finally {
    setLoading(false);
  }
};


  // 1) Fetch effluent flow stacks
  useEffect(() => {
    const userName = storedUserId || currentUserName;
    fetchEffluentFlowStacks(userName);
  }, [storedUserId, currentUserName]);

  // 2) After stacks are known, either fetch real data or set mock data
  useEffect(() => {
    // If you want to see only mock data, comment out the entire block below
    // and just do setDifferenceData(mockData).

    if (effluentFlowStacks.length > 0) {
      const userName = storedUserId || currentUserName;
      fetchDifferenceData(userName, currentPage, 100);
    }
  }, [effluentFlowStacks, storedUserId, currentUserName, currentPage]);

  // *** Use this effect if you want to FORCE the mock data:
/*   useEffect(() => {
   
    setDifferenceData(mockData);
    setLoading(false);
  }, []); */

  // 3) Filter headers once we have differenceData
  
  useEffect(() => {
    if (differenceData.length) {
      let filtered = filterHeaders(differenceData, viewType);
  
      const targetDate = new Date("2025-03-04T00:00:00Z").toLocaleDateString(); // "04/03/2025"
      const date3 = "03/03/2025";
  
      // ... (existing insertion logic for date5, etc.) ...
  
      // Now force "04/03/2025" to appear before "03/03/2025":
      const indexDate4 = filtered.indexOf(targetDate);
      const indexDate3 = filtered.indexOf(date3);
  
      if (indexDate4 !== -1 && indexDate3 !== -1 && indexDate4 > indexDate3) {
        filtered.splice(indexDate4, 1);              // remove 04/03/2025
        const newIndex3 = filtered.indexOf(date3);   // re-check index of 03/03/2025
        filtered.splice(newIndex3, 0, targetDate);   // insert 04/03/2025 before 03/03/2025
      }
  
      setHeaders(filtered);
    } else {
      setHeaders([]);
    }
  }, [differenceData, viewType, currentPage]);
  
  
  
  
  

  // If you rely purely on mock data, you can pass `mockData` directly
  // to groupDataByStackName. If you want to filter by 'effluent_flow',
  // be sure your mock stackNames are in effluentFlowStacks.
  const groupedData = groupDataByStackName(differenceData, effluentFlowStacks);
// Group data by stackName as before

// Define the fixed order for stacks
const fixedStackOrder = [
  "ETP outlet",
  "STP inlet",
  "STP acf outlet",
  "STP uf outlet",
  "STP softener outlet",
  "STP garden outlet 1",
  "STP garden outlet 2"
];

// Create a sorted array using the fixed order; only include stacks with records
const sortedGroupData = fixedStackOrder
  .map((stackName) => ({
    stackName,
    records: groupedData[stackName] || []
  }))
  .filter((item) => item.records.length > 0);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="container-fluid">
      <div className="row mt-5">
        <div className="col-md-12 col-lg-12 mb-2">
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
  {sortedGroupData.map(({ stackName, records }, stackIndex) => (
    <React.Fragment key={stackIndex}>
      <tr>
        <td rowSpan={3}>{stackIndex + 1}</td>
        <td rowSpan={3}>{stackName}</td>
        <td>Initial Flow</td>
        {headers.map((header, index) => {
          const matchingRecord = records.find(
            (item) => item.date === header || item.time === header
          );
          return (
            <td key={index}>
              {matchingRecord?.initialCumulatingFlow != null
                ? parseFloat(matchingRecord.initialCumulatingFlow).toFixed(2)
                : "N/A"}
            </td>
          );
        })}
      </tr>
      <tr>
        <td>Final Flow</td>
        {headers.map((header, index) => {
          const matchingRecord = records.find(
            (item) => item.date === header || item.time === header
          );
          return (
            <td key={index}>
              {matchingRecord?.lastCumulatingFlow != null
                ? parseFloat(matchingRecord.lastCumulatingFlow).toFixed(2)
                : "N/A"}
            </td>
          );
        })}
      </tr>
      <tr>
        <td>Flow Difference</td>
        {headers.map((header, index) => {
          const matchingRecord = records.find(
            (item) => item.date === header || item.time === header
          );
          return (
            <td key={index}>
              {matchingRecord?.cumulatingFlowDifference != null
                ? parseFloat(matchingRecord.cumulatingFlowDifference).toFixed(2)
                : "N/A"}
            </td>
          );
        })}
      </tr>
    </React.Fragment>
  ))}
</tbody>

                  </table>
                )}
              </div>

              {/* Pagination */}
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

            {/* Modal */}
            <FlowDataModal
              isOpen={isModalOpen}
              onRequestClose={() => setModalOpen(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quantity;
