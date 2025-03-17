import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import { fetchLast10MinDataByUserName, fetchUserLatestByUserName } from "../../redux/features/userLog/userLogSlice";
import EnergyGraph from './EnergyGraph';
import CalibrationPopup from '../Calibration/CalibrationPopup';
import CalibrationExceeded from '../Calibration/CalibrationExceeded';
import { useOutletContext } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import DailyHistoryModal from "../Water/DailyHIstoryModal"; 
import { API_URL } from "../../utils/apiConfig";
import { io } from 'socket.io-client';
import axios from "axios";
import energy from '../../assests/images/energypic.png';
import carbon from '../../assests/images/carbon.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import EnergyConsumptionCards from './EnergyConsumptionCards';
import PieChartEnergy from "./PieChartEnergy";
import PrimaryStationSelector from "./PrimaryStationSelector";
import BillCalculator from "./BillCalculator";
import DownloadaverageDataModal from "../Water/DownloadaverageDataModal";
import { Dropdown } from "react-bootstrap";
import MonthlyEnergyData from "./MonthlyEnergyData";

// Initialize Socket.IO
const socket = io(API_URL, { 
  transports: ['websocket'], 
  reconnectionAttempts: 5,
  reconnectionDelay: 1000, // Retry every second
});

socket.on('connect', () => console.log('Connected to Socket.IO server'));
socket.on('connect_error', (error) => console.error('Connection Error:', error));

const EnergyFlow = () => {
  const dispatch = useDispatch();
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const storedUserId = sessionStorage.getItem('selectedUserId'); 
  const { userId } = useSelector((state) => state.selectedUser); 
  const { userData, userType } = useSelector((state) => state.user);
  const { latestData, error } = useSelector((state) => state.iotData);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCalibrationPopup, setShowCalibrationPopup] = useState(false);
  const { searchTerm } = useOutletContext();
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [currentUserName, setCurrentUserName] = useState(userType === 'admin' ? "KSPCB001" : userData?.validUserOne?.userName);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStack, setSelectedStack] = useState("all");
  const [energyStacks, setEnergyStacks] = useState([]); // New state to store energy stacks
  const [realTimeData, setRealTimeData] = useState({});
  const [exceedanceColor, setExceedanceColor] = useState("green");
  const [timeIntervalColor, setTimeIntervalColor] = useState("green");
  const [initialEnergy, setInitialEnergy] = useState({});
  // Removed lastEnergy state as we will calculate consumption using realTimeData instead
  const [dailyEnergyConsumption, setDailyEnergyConsumption] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastValidTimestamp, setLastValidTimestamp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const graphRef = useRef();

  // Function to reset colors and trigger loading state
  const resetColors = () => {
    setExceedanceColor("loading");
    setTimeIntervalColor("loading");
  };

  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Fetch stack names and filter energy stationType stacks
  const fetchEnergyStacks = async (userName) => {
    try {
      const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
      const data = await response.json();
      const energyStacks = data.stackNames
        .filter(stack => stack.stationType === 'energy')
        .map(stack => stack.name);
      console.log("Fetched Energy Stacks:", energyStacks);
      setEnergyStacks(energyStacks);
    } catch (error) {
      console.error("Error fetching energy stacks:", error);
    }
  };

  const fetchData = async (userName) => {
    setLoading(true);
    try {
      if (userName === "HH014") {
        // Fetch last 10 minutes data for HH014
        const last10MinData = await dispatch(fetchLast10MinDataByUserName(userName)).unwrap();
        const energyData = last10MinData.flatMap(record =>
          record.records.filter(stack => stack.stackData.some(item => item.stationType === "energy"))
        );
        console.log("Last 10 Minutes Energy Data:", energyData);
        setSearchResult(last10MinData);
        console.log("searchResult for HH014:", last10MinData);
        const stacks = energyData.flatMap(record =>
          record.stackData.filter(stack => stack.stationType === "energy").map(stack => stack.stackName)
        );
        setEnergyStacks(stacks);
        const singleData = energyData.length > 0 ? energyData[energyData.length - 1] : null;
        // Updated to store as an object keyed by stackName for consistency
        const formattedData = singleData
          ? { [singleData.stackName]: { 
                ...singleData.stackData.find(item => item.stationType === "energy"),
                timestamp: singleData.timestamp 
             } }
          : {};
        if (!realTimeData || Object.keys(realTimeData).length === 0) {
          console.log("Showing the last value from the last 10 minutes.");
          setRealTimeData(formattedData);
        } else {
          console.log("Real-time data is already available.");
        }
      } else {
        // Fetch the latest data for other users
        const result = await dispatch(fetchUserLatestByUserName(userName)).unwrap();
        if (result) {
          setSearchResult(result);
          console.log("fetchData of Latest - searchResult:", result);
          console.log("searchResult.stackData:", result.stackData);
          setCompanyName(result.companyName || "Unknown Company");
          const stacks = result.stackData
            ?.filter(stack => stack.stationType === "energy")
            .map(stack => stack.stackName) || [];
          setEnergyStacks(stacks);
          // Convert stackData (if an array) to an object keyed by stackName
          if (!realTimeData || Object.keys(realTimeData).length === 0) {
            const energyDataObj = {};
            (result.stackData || []).forEach(item => {
              if (item.stationType === "energy" && item.stackName) {
                energyDataObj[item.stackName] = item;
              }
            });
            console.log("Displaying fetched latest data until real-time data is available.");
            setRealTimeData(energyDataObj);
          }
        } else {
          throw new Error("No data found for this user.");
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err.message);
      setSearchResult(null);
      setCompanyName("Unknown Company");
      setSearchError(err.message || "No result found for this userID");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch initial energy data from API
  const fetchEnergyDifferenceData = async (userName) => {
    try {
      const response = await axios.get(`${API_URL}/api/difference/${userName}?interval=daily`);
      const { data } = response;
      
      if (data && data.success) {
        const initialEnergyData = {};
        // Format today's date as "DD/MM/YYYY"
        const today = new Date();
        const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${today.getFullYear()}`;
        
        // Loop through the API data and store initialEnergy for energy stacks that match today's date
        data.data.forEach(item => {
          if (item.stationType === "energy" && item.date === formattedToday) {
            initialEnergyData[item.stackName] = item.initialEnergy;
          }
        });
        
        console.log("Today's Initial Energy from API:", initialEnergyData);
        setInitialEnergy(initialEnergyData);
      }
    } catch (error) {
      console.error("Error fetching energy difference data:", error);
    }
  };
  
  
  
  useEffect(() => {
    const userName = storedUserId || currentUserName;
    fetchData(userName);
    setCurrentUserName(userName);
    fetchEnergyStacks(userName);
    fetchPrimaryStation(userName);
    fetchEnergyDifferenceData(userName);
  }, [storedUserId, currentUserName]);
  
  useEffect(() => {
    const userName = storedUserId || currentUserName;
    fetchData(userName);
    setCurrentUserName(userName); 
    fetchEnergyStacks(userName);
    fetchPrimaryStation(userName);
  }, [storedUserId, currentUserName]);

  useEffect(() => {
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    resetColors();
    fetchData(userName);
    fetchEnergyStacks(userName);
    socket.emit("joinRoom", { userId: userName });
    const handleStackDataUpdate = async (data) => {
      console.log(`Real-time data for ${userName}:`, data);
      console.log("timestamp", data.timestamp);
      if (data.userName === userName) {
        setExceedanceColor(data.ExceedanceColor || "green");
        setTimeIntervalColor(data.timeIntervalColor || "green");
        if (data?.stackData?.length > 0) {
          const energyData = data.stackData.filter((item) => item.stationType === "energy");
          if (energyData.length > 0) {
            // Process real-time data as an object keyed by stackName
            const processedData = energyData.reduce((acc, item) => {
              if (item.stackName) {
                acc[item.stackName] = { ...item, timestamp: data.timestamp };
              }
              return acc;
            }, {});
            setRealTimeData(processedData);
            console.log("Processed Real-Time Energy Data:", processedData);
          } else {
            console.log("No real-time energy data. Fetching the latest data from the last 10 minutes...");
            const last10MinData = await dispatch(fetchLast10MinDataByUserName(userName)).unwrap();
            const fallbackData = last10MinData
              .flatMap((record) =>
                record.records.flatMap((stack) =>
                  stack.stackData.filter((item) => item.stationType === "energy")
                )
              )
              .slice(-1);
            if (fallbackData.length > 0) {
              const updatedFallbackData = {};
              fallbackData.forEach((item) => {
                updatedFallbackData[item.stackName] = {
                  ...item,
                  timestamp: last10MinData[last10MinData.length - 1]?.timestamp || "N/A",
                };
              });
              setRealTimeData(updatedFallbackData);
              console.log("Fallback Latest 10-Minute Energy Data:", updatedFallbackData);
            } else {
              setRealTimeData({});
            }
          }
        }
      }
    };
  
    socket.on("stackDataUpdate", handleStackDataUpdate);
  
    return () => {
      socket.emit("leaveRoom", { userId: userName });
      socket.off("stackDataUpdate", handleStackDataUpdate);
    };
  }, [selectedUserIdFromRedux, currentUserName]);
  
  const handleCardClick = (stack, parameter) => {
    if (parameter.name !== "energy") {
      setSelectedCard(null);
      return;
    }
    setSelectedCard({
      stackName: stack.stackName,
      title: parameter.parameter,
      name: parameter.name,
    });
  };
  const handleDailyConsumptionClick = (stack) => {
    setSelectedCard({
      stackName: stack.stackName,
      name: "dailyConsumption",
      parameter: "Daily Consumption"
    });
  };
  
  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedCard(null);
  };

  /* graph as pdf  */
  const handleDownloadPdf = () => {
    const input = graphRef.current;
    const downloadButton = input.querySelector('.btn');
    if (downloadButton) {
      downloadButton.style.display = 'none';
    }
    setIsDownloading(true);
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('graph.pdf');
      if (downloadButton) {
        downloadButton.style.display = 'inline-block';
      }
      setIsDownloading(false);
    });
  };

  const handleOpenCalibrationPopup = () => {
    setShowCalibrationPopup(true);
  };

  const handleCloseCalibrationPopup = () => {
    setShowCalibrationPopup(false);
  };

  const handleNextUser = () => {
    const userIdNumber = parseInt(currentUserName.replace(/[^\d]/g, ''), 10);
    if (!isNaN(userIdNumber)) {
      const newUserId = `KSPCB${String(userIdNumber + 1).padStart(3, '0')}`;
      setCurrentUserName(newUserId);
    }
  };

  const handlePrevUser = () => {
    const userIdNumber = parseInt(currentUserName.replace(/[^\d]/g, ''), 10);
    if (!isNaN(userIdNumber) && userIdNumber > 1) {
      const newUserId = `KSPCB${String(userIdNumber - 1).padStart(3, '0')}`;
      setCurrentUserName(newUserId);
    }
  };

  const handleStackChange = (event) => {
    setSelectedStack(event.target.value);
  };

  // Filter realTimeData based on selected stack (supports both object and array forms)
  const filteredData = selectedStack === "all"
    ? Array.isArray(realTimeData) ? realTimeData : Object.values(realTimeData)
    : Array.isArray(realTimeData)
      ? realTimeData.filter(data => data.stackName === selectedStack)
      : Object.values(realTimeData).filter(data => data.stackName === selectedStack);

  const energyParameters = [
    { parameter: "Energy", value: "kW/hr", name: "energy" },
    { parameter: "Power", value: "W", name: "power" },
    { parameter: "Voltage", value: "V", name: "voltage" },
    { parameter: "Current", value: "A", name: "current" },
  ];
  
  const [primaryStation, setPrimaryStation] = useState(""); // Primary station state
  
  useEffect(() => {
    fetchPrimaryStation(currentUserName);
  }, [currentUserName]);
  
  const fetchPrimaryStation = async (userName) => {
    try {
      const response = await axios.get(`${API_URL}/api/primary-station/${userName}`);
      console.log('API Response:', response);
      setPrimaryStation(response.data?.data?.stackName || 'No primary station selected');
    } catch (error) {
      console.error('Failed to fetch primary station:', error);
      setPrimaryStation('No primary station selected');
    }
  };

  /* const handleSetPrimaryStation = async (stationName) => {
    try {
      const postData = {
        userName: currentUserName,
        stationType: "energy",
        stackName: stationName,
      };
      const response = await axios.post(`${API_URL}/api/set-primary-station`, postData);
      console.log("Primary station set:", response.data);
      setPrimaryStation(response.data?.data?.stackName || stationName);
    } catch (error) {
      console.error("Error setting primary station:", error);
    }
  }; */

  // UPDATED DAILY CONSUMPTION CALCULATION:
  // Calculate daily consumption as realTime energy (from socket/fetched data) minus today's initial energy from API.
  useEffect(() => {
    if (initialEnergy && realTimeData) {
      // Convert realTimeData to object if it is an array
      let realTimeDataObj = {};
      if (Array.isArray(realTimeData)) {
        realTimeData.forEach(item => {
          if (item.stackName) {
            realTimeDataObj[item.stackName] = item;
          }
        });
      } else {
        realTimeDataObj = realTimeData;
      }
      const consumptionData = {};
      Object.keys(initialEnergy).forEach(stackName => {
        const init = parseFloat(initialEnergy[stackName]) || 0;
        // Assume the real-time energy value is stored in the "energy" property
        const realtime = parseFloat(realTimeDataObj[stackName]?.energy) || 0;
        const diff = realtime - init;
        consumptionData[stackName] = diff < 0 ? 0 : diff;
      });
      setDailyEnergyConsumption(consumptionData);
    }
  }, [initialEnergy, realTimeData]);
  
  return (
    <div className="main-panel">
      <div className="content-wrapper" style={{backgroundColor:"white"}}>
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header d-flex justify-content-between">
              {/* (Optional user navigation buttons commented out) */}
            </div>
          </div>
        </div>
        <div className="row">
          <div className=" text-center">
            <b><h3>ENERGY DASHBOARD</h3></b>
          </div>
        </div>

        <ul className="d-flex align-items-center justify-content-between" style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          <li>
            <Dropdown>
              {energyStacks.length > 0 ? (
                <div className="stack-dropdown">
                  <div className="styled-select-wrapper">
                    <select
                      id="stackSelect"
                      className="form-select styled-select"
                      value={selectedStack}
                      onChange={handleStackChange}
                    >
                      <option value="all">All Stacks</option>
                      {energyStacks.map((stackName, index) => (
                        <option key={index} value={stackName || "Unknown"}>
                          {stackName || "Unknown Station"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <h5 className="text-center">No stations available</h5>
              )}
            </Dropdown>
          </li>
          <li>
            {/* Additional Dropdown for primary station can be added here if needed */}
          </li>
        </ul>

        <div className="row align-items-center mb-5" style={{marginTop:'-100px'}}>
          <div className="col-md-4"></div>
          <div className="">
            <div className="" style={{marginTop:'150px'}}>
              {/* EnergyConsumptionCards can be placed here */}
            </div>
            <div className="col-12 justify-content-center align-items-center">
              <h3 className="text-center">
                {storedUserId === "HH014" || currentUserName === "HH014" ? "Hilton Manyata" : companyName}
              </h3>
            </div>            
          </div>
        </div>

        {loading && (
          <div className="spinner-container">
            <Oval
              height={60}
              width={60}
              color="#236A80"
              ariaLabel="Fetching details"
              secondaryColor="#e0e0e0"
              strokeWidth={2}
              strokeWidthSecondary={2}
            />
          </div>
        )}
        
        <div className="row mb-5">
          <div className="col-md-12 col-lg-12 col-sm-12 border overflow-auto bg-light shadow mb-3" style={{ height: "65vh", overflowY: "scroll", borderRadius: "15px" }}>
            {!loading && Object.values(realTimeData).length > 0 ? (
              Object.values(realTimeData).map((stack, stackIndex) => {
                const timestamp =
                  stack?.timestamp ||
                  realTimeData?.timestamp ||
                  (stack?.stackData && stack.stackData[0]?.timestamp) ||
                  "N/A";
                const formattedTimestamp =
                  timestamp !== "N/A" && !isNaN(new Date(timestamp).getTime())
                    ? {
                        date: new Date(timestamp).toLocaleDateString("en-GB"),
                        time: new Date(timestamp).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        }),
                      }
                    : null;
                return (
                  <div key={stackIndex} className="col-12 mb-4">
                    <div className="stack-box">
                      <h4 className="text-center">
                        {stack.stackName} <img src={energy} alt="energy image" width="100px" />
                      </h4>
                      <p className="text-center text-muted">
                        {formattedTimestamp ? (
                          <>
                            Last updated: <br />
                            <span style={{ fontSize: "14px" }}>{formattedTimestamp.date}</span> <br />
                            <span style={{ fontSize: "14px" }}>{formattedTimestamp.time}</span>
                          </>
                        ) : (
                          "N/A"
                        )}
                      </p>
                      <div className="row">
                        {energyParameters.map((item, index) => {
                          const value = stack[item.name];
                          return value && value !== "N/A" ? (
                            <div className="col-12 col-md-4 grid-margin" key={index}>
                              <div className="card mb-3" style={{ border: "none", cursor: "pointer" }} onClick={() => handleCardClick(stack, item)}>
                                <div className="card-body">
                                  <h5 className="text-light">{item.parameter}</h5>
                                  <p className="text-light">
                                    <strong className="text-light" style={{ color: "#236A80", fontSize: "24px" }}>
                                      {parseFloat(value).toFixed(2)}
                                    </strong>{" "}
                                    {item.value}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })}
                        {/* Daily Energy Consumption Card */}
                      {/* Daily Energy Consumption Card */}
<div className="col-md-4 grid-margin" onClick={() => handleDailyConsumptionClick(stack)}>
  <div className="card mb-3" style={{ border: "none", cursor: "pointer" }}>
    <div className="card-body">
      <h5 className="text-light">Daily Energy Consumption</h5>
      <p className="text-light">
        <strong style={{ color: "#ffff", fontSize: "24px" }}>
          {dailyEnergyConsumption[stack.stackName]?.toFixed(2) || "0.00"}
        </strong>{" "}
        kW/hr
      </p>
    </div>
  </div>
</div>

                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12">
                <h5 className="text-center mt-5">Waiting for real-time data ...</h5>
              </div>
            )}
          </div>

          {/* Graph Container with reference */}
          <div
  className="col-md-12 col-lg-12 col-sm-12 mb-2 border bg-light shadow"
  style={{ height: '70vh', borderRadius: '15px', position: 'relative' }}
  ref={graphRef}
>
  {selectedCard && selectedCard.name === "dailyConsumption" ? (
    <div>
      <EnergyGraph
        parameter={selectedCard.name}
        userName={currentUserName}
        stackName={selectedCard.stackName}
      />
    </div>
  ) : (
    <h5 className="text-center mt-5">
      Click on the Daily Consumption to view its graph
    </h5>
  )}
  {selectedCard && selectedCard.name === "dailyConsumption" && (
    <button
      onClick={handleDownloadPdf}
      style={{
        position: 'absolute',
        top: '10px',
        left: '20px',
        backgroundColor: '#236a80',
        color: 'white',
        marginTop: '10px',
        marginBottom: '10px',
        display: isDownloading ? 'none' : 'inline-block',
      }}
      className="btn"
    >
      <i className="fa-solid fa-download"></i> Download graph
    </button>
  )}
</div>

        </div>

        {showCalibrationPopup && (
          <CalibrationPopup
            userName={userData?.validUserOne?.userName}
            onClose={handleCloseCalibrationPopup}
          />
        )}
        <div className="row">
          <div className="col-lg-6 col-sm-12">
            <BillCalculator searchTerm={storedUserId} userData={userData} userType={userType} />
          </div>
          <div className="col-lg-6 col-sm-12">
            <MonthlyEnergyData/>
          </div>
        </div>
        <DailyHistoryModal 
          isOpen={showHistoryModal} 
          onRequestClose={() => setShowHistoryModal(false)} 
        />
      </div>
    </div>
  );
};

export default EnergyFlow;
