import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../utils/apiConfig";
import './index.css';
import carbon from '../../assests/images/carbon.png'
import FlowDataModal from "./FlowDataModal";
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
  const { searchTerm } = useOutletContext();

  const [differenceData, setDifferenceData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [viewType, setViewType] = useState("daily");
  const [error, setError] = useState(null);
  const [effluentFlowStacks, setEffluentFlowStacks] = useState([]); // New state to store effluentFlow stacks  const [realTimeData, setRealTimeData] = useState({})
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve use

  const currentUserName = userType === "admin"
    ? "KSPCB001"
    : userData?.validUserOne?.userName;


    const fetchEffluentFlowStacks = async (userName) => {
        try {
          const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
          const data = await response.json(); // Make sure to parse the JSON
          const effluentFlowStacks = data.stackNames
            .filter(stack => stack.stationType === 'effluent_flow')
            .map(stack => stack.name); // Use 'name' instead of 'stackName'
          setEffluentFlowStacks(effluentFlowStacks);
        } catch (error) {
          console.error("Error fetching effluentFlow stacks:", error);
        }
      };
      

  // Fetch difference data by userName and interval, filtered by energyStacks
  const fetchDifferenceData = async (userName, page = 1, limit = 10) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/difference/${userName}?interval=daily&page=${page}&limit=${limit}`
      );
      const { data } = response;

      if (data && data.success) {
        const filteredData = data.data
          .map((item) => ({
            ...item,
            date: new Date(item.timestamp).toLocaleDateString(),
            time: new Date(item.timestamp).toLocaleTimeString(),
          }))
          .filter((item) => effluentFlowStacks.includes(item.stackName));

        setDifferenceData(filteredData);
        setTotalPages(Math.ceil(data.total / limit));
      } else {
        setDifferenceData([]);
      }
    } catch (error) {
      console.error("Error fetching difference data:", error);
      setError("Failed to fetch difference data.");
    }
  };

  useEffect(() => {
    const userName = storedUserId || currentUserName;
    fetchEffluentFlowStacks(userName);
    fetchDifferenceData(userName, currentPage);
  }, [storedUserId, currentUserName, currentPage]);

  useEffect(() => {
    if (differenceData.length) {
      const uniqueHeaders = extractHeaders(differenceData, viewType);
      setHeaders(uniqueHeaders);
    } else {
      setHeaders([]);
    }
  }, [differenceData, viewType]);

  const groupedData = groupDataByStackName(differenceData);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="container-fluid">
      <div className="row mt-5">
        <div className="col-md-6">
          <div className="card" style={{ height: "100%" }}>
            <div className="card-body">
              <h2 className="text-center text-light mt-2">Water Flow</h2>
              <div className="mb-3 d-flex justify-content-between">
                <button
                  className={`btn ${viewType === "daily" ? "btn-primary" : "btn-outline-primary"} mr-2`}
                  onClick={() => setViewType("daily")}
                >
                  Daily View
                </button>

                <button className="btn btn-success" onClick={() => setModalOpen(true)}>
                  View
                </button>
              </div>

              <div
                className="table-responsive mt-3"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
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
                                {matchingRecord?.initialFlow || "N/A"}
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
                                {matchingRecord?.finalFlow || "N/A"}
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
                                {matchingRecord?.flowDifference || "N/A"}
                              </td>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
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

        <div className="col-md-6">
          <div className="card full-height-card shadow" style={{border:'none'}} >
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quantity;
