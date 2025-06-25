import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";
import FlowDataModal from "./FlowDataModal";
import "./index.css";
import { useNavigate } from "react-router-dom";

// Helper function to format a timestamp into "DD/MM/YYYY" using UTC
const formatTimestampToCustomDate = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to get the proper date string from an item.
// If the API already provided a date, we use it; otherwise, we format the timestamp.
const getCustomDate = (item) => {
  return item.date ? item.date : formatTimestampToCustomDate(item.timestamp);
};

// 1) Extract daily/hourly headers using our custom date formatting
const extractHeaders = (data, viewType) => {
  const headers = new Set();
  data.forEach((item) => {
    const formatted =
      viewType === "daily"
        ? getCustomDate(item)
        : new Date(item.timestamp).toLocaleTimeString();
    headers.add(formatted);
  });
  return Array.from(headers);
};

// 2) Updated filterHeaders function: For past dates, keep if at least one record has any one of the fields
const filterHeaders = (data, viewType) => {
  const allHeaders = extractHeaders(data, viewType);
  const todayStr = formatTimestampToCustomDate(new Date());

  return allHeaders.filter((header) => {
    // Always keep today's date even if some data is missing
    if (header === todayStr) return true;

    // For past dates, keep if at least one record has any one of the fields (not necessarily all)
    const hasAnyValue = data.some((item) => {
      const dateStr =
        viewType === "daily"
          ? getCustomDate(item)
          : new Date(item.timestamp).toLocaleTimeString();
      return (
        dateStr === header &&
        (item.initialCumulatingFlow != null ||
         item.lastCumulatingFlow != null ||
         item.cumulatingFlowDifference != null)
      );
    });
    return hasAnyValue;
  });
};

// ------------------ MOCK DATA ------------------
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
  const [uniqueDateGroups, setUniqueDateGroups] = useState([]);
const navigate = useNavigate();       
  const storedUserId = sessionStorage.getItem("selectedUserId");
  const currentUserName =
    userType === "admin" ? "KSPCB001" : userData?.validUserOne?.userName;

  // Group data by stackName for those stacks that match effluent_flow
  const normalizeString = (str) => str.replace(/\s+/g, " ").trim();

  // Updated groupDataByStackName function using normalizeString
  const groupDataByStackName = (data, effluentFlowStacks) => {
    const normalizedEffluentStacks = effluentFlowStacks.map((name) =>
      normalizeString(name)
    );
    const groupedData = {};
    data.forEach((item) => {
      const normalizedName = normalizeString(item.stackName);
      if (normalizedEffluentStacks.includes(normalizedName)) {
        if (!groupedData[normalizedName]) {
          groupedData[normalizedName] = [];
        }
        groupedData[normalizedName].push(item);
      }
    });
    return groupedData;
  };
  
  
  // Fetch effluent flow stacks from the API
  const fetchEffluentFlowStacks = async (userName) => {
    try {
      const response = await fetch(
        `${API_URL}/api/get-stacknames-by-userName/${userName}`
      );
      const data = await response.json();

      if (data.stackNames) {
        const effluentStacks = data.stackNames
          .filter((stack) => stack.stationType === "effluent_flow")
          .map((stack) => stack.name);
        setEffluentFlowStacks(effluentStacks);
      }
    } catch (error) {
      console.error("Error fetching effluentFlow stacks:", error);
    }
  };

  // Fetch all difference data at once
  const fetchAllDifferenceData = async (userName) => {
    try {
      setLoading(true);
      let finalData = [];

      const response = await axios.get(
        `${API_URL}/api/difference/${userName}?interval=daily&limit=1000`
      );
      const { data } = response;
      console.log("differencedata", data);

      if (data && data.success) {
        let sortedData = data.data
          .map((item) => {
            const customDate = item.date
              ? item.date
              : formatTimestampToCustomDate(item.timestamp);

            return {
              ...item,
              date: customDate,
              time: new Date(item.timestamp).toLocaleTimeString(),
            };
          })
          .sort((b, a) => new Date(a.timestamp) - new Date(b.timestamp));

        // Example merging logic with mockData (adjust as needed)
        const targetDate = "04/03/2025";
        const date5 = "05/03/2025";
        const date3 = "03/03/2025";

        const hasDate5 = sortedData.some((item) => item.date === date5);
        const hasDate3 = sortedData.some((item) => item.date === date3);

        if (hasDate5 && hasDate3) {
          sortedData = sortedData.filter((item) => item.date !== targetDate);
          const targetMockData = mockData.filter(
            (item) => item.date === targetDate
          );
          sortedData = [...sortedData, ...targetMockData];
        }

        finalData = sortedData;
        setDifferenceData(finalData);

        // Group data by unique dates
        const uniqueDates = [...new Set(finalData.map(item => item.date))];
        const dateGroups = uniqueDates.map(date => ({
          date,
          data: finalData.filter(item => item.date === date)
        }));

        setUniqueDateGroups(dateGroups);
        setTotalPages(Math.ceil(dateGroups.length / 5)); // Show 5 dates per page
      } else {
        setDifferenceData([]);
        setUniqueDateGroups([]);
      }
    } catch (error) {
      console.error("Error fetching difference data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userName = storedUserId || currentUserName;
    fetchEffluentFlowStacks(userName);
  }, [storedUserId, currentUserName]);

  useEffect(() => {
    if (effluentFlowStacks.length > 0) {
      const userName = storedUserId || currentUserName;
      fetchAllDifferenceData(userName);
    }
  }, [effluentFlowStacks, storedUserId, currentUserName]);

  useEffect(() => {
    if (differenceData.length) {
      // Get the dates for the current page
      const startIdx = (currentPage - 1) * 5;
      const endIdx = startIdx + 5;
      const currentPageDates = uniqueDateGroups
        .slice(startIdx, endIdx)
        .map(group => group.date);

      // Filter data to only include records from current page dates
      const currentPageData = differenceData.filter(item => 
        currentPageDates.includes(item.date)
      );

      let filtered = filterHeaders(currentPageData, viewType);

      // Ensure "04/03/2025" appears before "03/03/2025" (as per your merging logic)
      const targetDate = "04/03/2025";
      const date3 = "03/03/2025";

      const indexTarget = filtered.indexOf(targetDate);
      const indexDate3 = filtered.indexOf(date3);

      if (indexTarget !== -1 && indexDate3 !== -1 && indexTarget > indexDate3) {
        filtered.splice(indexTarget, 1);
        const newIndexDate3 = filtered.indexOf(date3);
        filtered.splice(newIndexDate3, 0, targetDate);
      }

      setHeaders(filtered);
    } else {
      setHeaders([]);
    }
  }, [differenceData, viewType, currentPage, uniqueDateGroups]);

  const groupedData = groupDataByStackName(differenceData, effluentFlowStacks);

  // Define a fixed order for stacks (for HH014)
  const fixedStackOrder = [
    "ETP outlet",
    "STP inlet",
    "STP acf outlet",
    "STP uf outlet",
    "STP softener outlet",
    "STP garden outlet 1",
    "STP garden outlet 2",
  ];
  
  let finalGroupData;
  if (storedUserId === "HH014") {
    finalGroupData = fixedStackOrder
      .map((stackName) => ({
        stackName,
        records: groupedData[normalizeString(stackName)] || [],
      }))
      .filter((item) => item.records.length > 0);
  } else {
    finalGroupData = Object.entries(groupedData).map(([stackName, records]) => ({
      stackName,
      records,
    }));
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

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
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>SL. NO</th>
                    <th>Stack Name</th>
                    <th>Acceptables</th>
                    {headers.map((header, i) => (
                      <th key={i}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {finalGroupData.map(({ stackName, records }, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{stackName}</td>
                      <td>Flow Difference</td>
                      {headers.map((header, i) => {
                        const rec = records.find(r => r.date === header);
                        return (
                          <td key={i}>
                            {rec?.cumulatingFlowDifference != null
                              ? parseFloat(rec.cumulatingFlowDifference).toFixed(2)
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