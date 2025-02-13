import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";
import FlowDataModal from "./FlowDataModal";
import './index.css';
import carbon from '../../assests/images/carbon.png';
import ConsuptionPredictionGraphQuantity from "./ConsuptionPredictionGraphQuantity";

// Extract unique headers (dates or hours)
const extractHeaders = (data, viewType) => {
  const headers = new Set();
  data.forEach((item) => {
    const date = new Date(item.timestamp);
    const formatted = viewType === "daily"
      ? date.toLocaleDateString()
      : date.toLocaleTimeString();
    headers.add(formatted);
  });
  return Array.from(headers);
};

// Group data by stackName to avoid duplication
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

const Quantity = () => {
  const { userData, userType } = useSelector((state) => state.user);
  const [differenceData, setDifferenceData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [viewType, setViewType] = useState("daily");
  const [effluentFlowStacks, setEffluentFlowStacks] = useState([]); 
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true); // Track loading state

  const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve user ID
  const currentUserName = userType === "admin"
    ? "KSPCB001"
    : userData?.validUserOne?.userName;

  // Fetch effluent flow stacks
 // Group data by stackName and filter effluent_flow station types
const groupDataByStackName = (data, effluentFlowStacks) => {
  const groupedData = {};
  data.forEach((item) => {
    if (effluentFlowStacks.includes(item.stackName)) { // ✅ Filter by effluent_flow stationType
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
    const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
    const data = await response.json(); // Make sure to parse the JSON

    if (data.stackNames) {
      const effluentFlowStacks = data.stackNames
        .filter((stack) => stack.stationType === 'effluent_flow') // ✅ Filter only effluent_flow
        .map(stack => stack.name); // ✅ Use 'name' instead of 'stackName'
      setEffluentFlowStacks(effluentFlowStacks);
    }
  } catch (error) {
    console.error("Error fetching effluentFlow stacks:", error);
  }
};

// Render only stacks with `effluent_flow`
const groupedData = groupDataByStackName(differenceData, effluentFlowStacks);


  // Fetch difference data by userName and interval, filtered by effluentFlowStacks
  const fetchDifferenceData = async (userName, page = 1, limit = 30) => {
    try {
      let finalData = [];
  
      // Fetch normal paginated data
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
          .sort((b, a) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort DESCENDING
  
        const today = new Date().toLocaleDateString();
  
        if (page === 1) {
          // Fetch all available records to ensure we get today's data
          const allDataResponse = await axios.get(`${API_URL}/api/difference/${userName}?interval=daily`);
          const allData = allDataResponse.data?.data || [];
  
          // Extract today's records from the full dataset
          const todaysRecords = allData.filter((item) =>
            new Date(item.timestamp).toLocaleDateString() === today
          );
  
          // Show today's data first, then continue with other data
          finalData = [...todaysRecords, ...sortedData.filter(item => !todaysRecords.includes(item))];
        } else {
          // Normal pagination for older records
          finalData = sortedData;
        }
  
        setDifferenceData(finalData);
        setTotalPages(Math.ceil(data.total / limit)); // Correct total pages
      } else {
        setDifferenceData([]);
      }
    } catch (error) {
      console.error("Error fetching difference data:", error);
    } finally {
      setLoading(false);
    }
  };




  // Fetch effluent flow stacks and difference data together
  useEffect(() => {
    const userName = storedUserId || currentUserName;

    const fetchData = async () => {
      setLoading(true); // Start loading when fetching data
      await fetchEffluentFlowStacks(userName); // Wait for energy stacks first
    };

    fetchData(); // Trigger fetch
  }, [storedUserId, currentUserName]); // Trigger when user ID or currentUserName changes

  // Fetch difference data after effluentFlowStacks is populated
  useEffect(() => {
    if (effluentFlowStacks.length > 0) {
      const userName = storedUserId || currentUserName;
      fetchDifferenceData(userName, currentPage, 50); // Fetch with pagination
    }
  }, [effluentFlowStacks, storedUserId, currentUserName, currentPage]);
  useEffect(() => {
    if (differenceData.length) {
      const uniqueHeaders = extractHeaders(differenceData, viewType);
      setHeaders(uniqueHeaders);
    } else {
      setHeaders([]);
    }
  }, [differenceData, viewType]);


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
               {/*  <button
                  className={`btn ${viewType === "daily" ? "btn-primary" : "btn-outline-primary"} mr-2`}
                  onClick={() => setViewType("daily")}
                >
                  Daily View
                </button> */}

                <button className="btn btn-success" onClick={() => setModalOpen(true)}>
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
  {Object.entries(groupedData).map(([stackName, records], stackIndex) => (
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
              {matchingRecord?.initialCumulatingFlow !== undefined
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
              {matchingRecord?.lastCumulatingFlow !== undefined
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
              {matchingRecord?.cumulatingFlowDifference !== undefined
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
            <FlowDataModal isOpen={isModalOpen} onRequestClose={() => setModalOpen(false)} />
          </div>
        </div>

        <div className="col-md-12 col-lg-12 mb-2">
         {/*  <div className="card full-height-card shadow" style={{border:'none'}} >
            <div className="col-md-12">
              <h2 className="text-center mb-4 mt-2 text-light">Carbon Emission <img src={carbon} alt="carbon" width={'100px'}></img></h2>
              <div className="row">
                <div className="col-md-12 mb-4">
                  <div className="card m-3  h-100 "style={{ border: '2px solid lightgrey' }}
                  >
                    <small className="text-end p-2 text-secondary">{new Date().toLocaleDateString()}</small>
                    <div className="card-body d-flex flex-column justify-content-center">
                      <h5 className="card-title text-center text-light">Total Carbon Emission</h5>
                      <p className="text-center display-3 text-light">0 kg CO2</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-4">
                  <div className="card m-3 h-100 shadow" style={{ border: '2px solid lightgrey' }}>
                    <small className="text-end p-2 text-secondary">{new Date().toLocaleDateString()}</small>
                    <div className="card-body d-flex flex-column justify-content-center">
                      <h5 className="card-title text-center text-light">Predicted Carbon Emission</h5>
                      <p className="text-center display-3 text-light">0 kg CO2</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
            <div className="card" style={{ height: '100%' }}>
                      <ConsuptionPredictionGraphQuantity />
                    </div>
        </div>
      </div>
    </div>
  );
};

export default Quantity;
