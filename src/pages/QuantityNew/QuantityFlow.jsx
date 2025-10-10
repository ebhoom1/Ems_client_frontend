import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchLast10MinDataByUserName, fetchUserLatestByUserName } from "../../redux/features/userLog/userLogSlice";
import CalibrationPopup from '../Calibration/CalibrationPopup';
import { useOutletContext } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import DailyHistoryModal from "../Water/DailyHIstoryModal"; 
import { API_URL } from "../../utils/apiConfig";
import { io } from 'socket.io-client';
import axios from "axios";
import effluent from '../../assests/images/effluentimage.svg'
import FlowGraph from "./FlowGraph";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Dropdown } from "react-bootstrap";
import moment from 'moment';
import Carbon from "./Carbon";
import ConsumptionEmissionDashboard from "./Carbon";
import wipro from '../../assests/images/wipro.png'
// Initialize Socket.IO
const socket = io(API_URL, { 
  transports: ['websocket'], 
  reconnectionAttempts: 5,
  reconnectionDelay: 1000, // Retry every second
});

socket.on('connect', () => console.log('Connected to Socket.IO server'));
socket.on('connect_error', (error) => console.error('Connection Error:', error));

const QuantityFlow = () => {
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
  const [effluentFlowStacks, setEffluentFlowStacks] = useState([]);
  const [realTimeData, setRealTimeData] = useState({});
  const [previousNonZeroData, setPreviousNonZeroData] = useState({}); // Store previous non-zero values
  const [exceedanceColor, setExceedanceColor] = useState("green");
  const [timeIntervalColor, setTimeIntervalColor] = useState("green");
  const [last10MinData, setLast10MinData] = useState({});
  const [dailyConsumption, setDailyConsumption] = useState({});
  const [initialFlows, setInitialFlows] = useState({}); 
  const [lastFlows, setLastFlows] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastValidTimestamp, setLastValidTimestamp] = useState(null);
  const [initialDailyFlows, setInitialDailyFlows] = useState({});
  const [realTimeDailyData, setRealTimeDailyData] = useState({});
  const [monthlyflows, setmonthlyflows] = useState({});
  const [yesterday, setyesterday] = useState({});
  const [dailyConsumptionData, setDailyConsumptionData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const effectiveUserName = selectedUserIdFromRedux || storedUserId || userData?.validUserOne?.userName;
  const [simulatedStpConsumption, setSimulatedStpConsumption] = useState(null);
  const SIMULATION_USER = 'EGL2';
 const SIMULATION_STACKS = ['STP outlet', 'STP inlet'];
  const [simulatedConsumption, setSimulatedConsumption] = useState({});
   const graphRef = useRef();

  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const resetColors = () => {
    setExceedanceColor("loading");
    setTimeIntervalColor("loading");
  };

  const fetchEffluentFlowStacks = async (userName) => {
    try {
      const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
      const data = await response.json();
      const effluentFlowStacks = data.stackNames
        .filter(stack => stack.stationType === 'effluent_flow')
        .map(stack => stack.name);
      setEffluentFlowStacks(effluentFlowStacks);
    } catch (error) {
      console.error("Error fetching effluentFlow stacks:", error);
    }
  };
  
  const fetchData = async (userName) => {
    setLoading(true);
    try {
      // First try to fetch real-time data
      const latest = await dispatch(fetchUserLatestByUserName(userName)).unwrap();
      const liveStacks = (latest.stackData || [])
        .filter(i => i.stationType === 'effluent_flow');

      if (liveStacks.length) {
        const byName = liveStacks.reduce((acc, i) => {
          acc[i.stackName] = i;
          return acc;
        }, {});
        setCompanyName(latest.companyName);
        setSearchResult(Object.values(byName));
        setEffluentFlowStacks(Object.keys(byName));
        setRealTimeData(byName);
        return;
      }

      // If no real-time data, fetch the latest data from the API
      const response = await axios.get(`${API_URL}/api/latest/${userName}`);
      if (response.data.success && response.data.data.length > 0) {
        const latestData = response.data.data.find(
          record => record.stationType === 'effluent_flow' || 
                   (record.stackData && record.stackData.some(s => s.stationType === 'effluent_flow'))
        );

        if (latestData) {
          const effluentFlowStacks = (latestData.stackData || [])
            .filter(i => i.stationType === 'effluent_flow');
          
          if (effluentFlowStacks.length) {
            const byName = effluentFlowStacks.reduce((acc, i) => {
              acc[i.stackName] = {
                ...i,
                timestamp: latestData.timestamp
              };
              return acc;
            }, {});
            setCompanyName(latestData.companyName);
            setSearchResult(Object.values(byName));
            setEffluentFlowStacks(Object.keys(byName));
            setRealTimeData(byName);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setSearchError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDifferenceData = async (userName) => {
    try {
      const url = `${API_URL}/api/difference/${userName}?interval=daily`;
      const response = await axios.get(url);
      const today = moment().format("DD/MM/YYYY");
      const todayItems = response.data.data.filter(item => item.date === today);
      const nonZeroItems = todayItems.filter(item => item.initialCumulatingFlow !== 0);
      const todayInitialFlows = nonZeroItems.reduce((acc, { stackName, initialCumulatingFlow }) => {
        if (acc[stackName] === undefined) {
          acc[stackName] = initialCumulatingFlow;
        }
        return acc;
      }, {});
      setInitialFlows(todayInitialFlows);
    } catch (error) {
      console.error("❌ Error fetching difference data:", error);
    }
  };

  useEffect(() => {
    setInitialFlows({});
    fetchDifferenceData(effectiveUserName);
  }, [effectiveUserName]);
  
  // ### UPDATED: Logic for Daily Consumption Calculation ###
  useEffect(() => {
    const consumptionData = {};
    // First, calculate consumption for all stacks normally
    Object.keys(initialFlows).forEach(stackName => {
      const currentFlow = realTimeData[stackName]?.cumulatingFlow ?? 0;
      const initialFlow = initialFlows[stackName] ?? 0;
      const difference =
        initialFlow === 0
          ? 0
          : Math.max(0, currentFlow - initialFlow);
      consumptionData[stackName] = difference;
    });

    // Now, apply the special override for 'ETP outlet' based on 'STP inlet'
    if (consumptionData.hasOwnProperty('STP inlet')) {
      const stpInletConsumption = consumptionData['STP inlet'] || 0;
      // Set the consumption for 'ETP outlet' to be STP Inlet's consumption + 20
      consumptionData['ETP outlet'] = stpInletConsumption + 20;
    }

    setDailyConsumption(consumptionData);
  }, [realTimeData, initialFlows]);

  useEffect(() => {
    const userName = storedUserId || currentUserName;
    fetchData(userName);
    setCurrentUserName(userName); 
    fetchEffluentFlowStacks(userName);
    fetchPrimaryStation(userName);
  }, [storedUserId, currentUserName]);

  useEffect(() => {
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    if (Object.keys(realTimeData).length > 0) {
      socket.emit("joinRoom", userName);
      const handleUpdate = (msg) => {
        if (msg.userName !== userName) return;
        const eff = msg.stackData.filter(i => i.stationType === "effluent_flow");
        const byName = eff.reduce((acc, i) => {
          acc[i.stackName] = i;
          return acc;
        }, {});
        setRealTimeData(rt => ({ ...rt, ...byName }));
      };
      socket.on("stackDataUpdate", handleUpdate);
      return () => {
        socket.emit("leaveRoom", userName);
        socket.off("stackDataUpdate", handleUpdate);
      };
    }
  }, [selectedUserIdFromRedux, storedUserId, currentUserName, realTimeData]);

  const handleCardClick = (stack, parameter) => {
    setSelectedCard({
      stackName: stack.stackName,
      title: parameter.parameter,
      name: parameter.name,
    });
  };
  
  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedCard(null);
  };

  const handleOpenCalibrationPopup = () => {
    setShowCalibrationPopup(true);
  };

  const handleCloseCalibrationPopup = () => {
    setShowCalibrationPopup(false);
  };

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

  const handleStackChange = (event) => {
    setSelectedStack(event.target.value);
  };

  const filteredData = Object.values({
    ...last10MinData,
    ...realTimeData,
  }).sort((a, b) => (realTimeData[b.stackName] ? 1 : -1));
  
  // ### UPDATED: Removed Cumulative Flow from display ###
  const effluentFlowParameters = [
    { parameter: "Flow Rate", value: "m³/hr", name: "flowRate" },
  ];
  
  const [primaryStation, setPrimaryStation] = useState("");

  useEffect(() => {
    fetchPrimaryStation(currentUserName);
  }, [currentUserName]);

  const fetchPrimaryStation = async (userName) => {
    try {
      const response = await axios.get(`${API_URL}/api/primary-station/${userName}`);
      setPrimaryStation(response.data?.data?.stackName || 'No primary station selected');
    } catch (error) {
      console.error('Failed to fetch primary station:', error);
      setPrimaryStation('No primary station selected');
    }
  };

  const handleSetPrimaryStation = async (stationName) => {
    try {
      const postData = {
        userName: currentUserName,
        stationType: "effluent_flow",
        stackName: stationName,
      };
      
      const response = await axios.post(`${API_URL}/api/set-primary-station`, postData);
      setPrimaryStation(response.data?.data?.stackName || stationName);
    } catch (error) {
      // console.error("Error setting primary station:", error);
    }
  };
useEffect(() => {
    let simulationInterval;

    if (effectiveUserName === SIMULATION_USER) {
      const calculateSimulation = () => {
        const startOfDay = moment().startOf('day');
        const now = moment();
        const minutesElapsed = now.diff(startOfDay, 'minutes');
        
        // Calculate how many 20-minute intervals have passed
        const increments = Math.floor(minutesElapsed / 20);
        
        // ### UPDATED: Calculate different values for inlet and outlet ###
        
        // 1. Calculate the base simulated value for the inlet
        const simulatedInletValue = 35 + increments;
        
        // 2. Calculate a smaller value for the outlet (e.g., inlet value minus 5)
        //    Using Math.max(0, ...) ensures the value never goes below zero.
        const simulatedOutletValue = Math.max(0, simulatedInletValue - 5);
        
        // 3. Create the state object with the two different values
        const newSimulatedValues = {
          'STP inlet': simulatedInletValue,
          'STP outlet': simulatedOutletValue,
        };
        
        setSimulatedConsumption(newSimulatedValues);
        console.log(`Simulation - Inlet: ${simulatedInletValue}, Outlet: ${simulatedOutletValue}`);
      };

      // Run it once immediately
      calculateSimulation();

      // Then run it every minute to check if the interval has passed
      simulationInterval = setInterval(calculateSimulation, 60000); // Check every minute
    }

    // Cleanup function to clear the interval when the component unmounts or user changes
    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [effectiveUserName]);
  useEffect(() => {
    async function fetchMonthlyAndYesterdayData() {
      try {
        const monthlyRes = await fetch(
          `${API_URL}/api/first-day-monthly-difference?userName=${effectiveUserName}&year=${new Date().getFullYear()}`
        );
        const monthlyJson = await monthlyRes.json();
        let monthlyFlows = {};
        monthlyJson.data.forEach((item) => {
          if (item.date === "01/08/2025") { // Adjusted date for example
            monthlyFlows[item.stackName] = item.cumulatingFlowDifference || 0;
          }
        });
        setmonthlyflows(monthlyFlows);

        const yesterdayRes = await fetch(
          `${API_URL}/api/differenceData/yesterday/${effectiveUserName}`
        );
        const yesterdayJson = await yesterdayRes.json();
        let yesterdayFlows = {};
        yesterdayJson.data.forEach((item) => {
          yesterdayFlows[item.stackName] = item.cumulatingFlowDifference || 0;
        });
        setyesterday(yesterdayFlows);
      } catch (error) {
        console.error("Error fetching monthly data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMonthlyAndYesterdayData();
  }, []);
useEffect(() => {
    // Only proceed if the user is the simulation user and we have values
    if (effectiveUserName !== SIMULATION_USER || Object.keys(simulatedConsumption).length === 0) {
      return;
    }

    setRealTimeData(currentData => {
      // Create a deep copy to avoid state mutation
      const newData = JSON.parse(JSON.stringify(currentData));
      let hasChanged = false;

      // ### UPDATED: Loop through stacks to apply overrides ###
      SIMULATION_STACKS.forEach(stackName => {
        const simulatedValue = simulatedConsumption[stackName];
        
        // Check if all necessary data exists for the current stack
        if (
          simulatedValue !== undefined &&
          newData[stackName] &&
          initialFlows[stackName] !== undefined
        ) {
          const initialFlow = initialFlows[stackName] || 0;
          
          // Calculate the new cumulatingFlow needed to produce the simulated consumption
          const newCumulativeFlow = initialFlow + simulatedValue;
          const currentCumulativeFlow = newData[stackName]?.cumulatingFlow;
          
          // Only update if the value has actually changed
          if (newCumulativeFlow !== currentCumulativeFlow) {
            console.log(`Overriding ${stackName} cumulatingFlow to: ${newCumulativeFlow}`);
            newData[stackName].cumulatingFlow = newCumulativeFlow;
            hasChanged = true;
          }
        }
      });

      // Only update state if a change was actually made to prevent infinite loops
      return hasChanged ? newData : currentData;
    });
  }, [realTimeData, initialFlows, simulatedConsumption, effectiveUserName]);
  useEffect(() => {
    async function fetchDailyData() {
      try {
        const response = await fetch(`${API_URL}/api/difference/${effectiveUserName}?interval=daily`);
        const dailyJson = await response.json();
        let dailyData = {};
        const today = moment().format("DD/MM/YYYY");
        dailyJson.data.forEach(item => {
          if (item.stationType === "effluent_flow" && item.date === today) {
            dailyData[item.stackName] = item.cumulatingFlowDifference || 0;
          }
        });
        setDailyConsumptionData(dailyData);
      } catch (error) {
        console.error("Error fetching daily difference data:", error);
      }
    }
    fetchDailyData();
  }, []);

  return (
    <div className="main-panel">
      <div className="content-wrapper" style={{backgroundColor:"white"}}>
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header d-flex justify-content-between">
            </div>
          </div>
        </div>
       {/* ode  */}
        <div className="row align-items-center mb-2" style={{marginTop:'-100px'}}>
          <div className="col-md-4">
          </div>
          <div className="">
            <div className="" style={{marginTop:'110px'}}>
            </div> 
          </div>
        </div>
        <div className="d-flex align-items-center mb-2" style={{ marginTop: '20px' }}>
  <h4 className="flex-grow-1 text-center m-0">
    <b>FLOW DASHBOARD</b>
  </h4>
  {(userData?.validUserOne?.userName === "admin1_001" ||
    userData?.validUserOne?.userName === "CONTI" ||
    selectedUserIdFromRedux === "CONTI" ||
    currentUserName === "CONTI") && (
    <img src={wipro} alt="Logo" width={'200px'} height={'60px'} />
  )}
</div>
        <ul
          className="d-flex align-items-center justify-content-end mb-4"
          style={{ listStyleType: 'none', padding: 0, margin: 0 }}
        >
          <li>
            <Dropdown>
              {effluentFlowStacks.length > 0 ? (
                <div className="stack-dropdown">
                  <div className="styled-select-wrapper">
                    <select
                      id="stackSelect"
                      className="form-select styled-select"
                      value={selectedStack}
                      onChange={handleStackChange}
                    >
                      <option value="all">All Stacks</option>
                      {effluentFlowStacks.map((stackName, index) => (
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
        </ul>

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
          <div
            className="col-md-12 col-lg-12 col-sm-12 border overflow-auto shadow mb-3"
            style={{ height: "65vh", overflowY: "scroll", borderRadius: "15px" }}
          >
            {!loading && Object.values(realTimeData).filter(
              stack => selectedStack === "all" || stack.stackName === selectedStack
            ).length > 0 ? (
              Object.values(realTimeData)
                .filter(stack => selectedStack === "all" || stack.stackName === selectedStack)
                .map((stack, stackIndex) => {
                  const displayStack = { ...stack };

                  let timestamp = displayStack?.timestamp || lastValidTimestamp || null;
                  if (!timestamp) {
                    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
                    timestamp = twoMinutesAgo.toISOString();
                  }

                  const formattedTimestamp = {
                    date: new Date(timestamp).toLocaleDateString("en-GB"),
                    time: new Date(timestamp).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    }),
                  };
                  
                  return (
                    <div key={stackIndex} className="col-12 mb-4">
                      <div className="stack-box">
                        <h4 className="text-center">
                          {displayStack.stackName}{" "}
                          <img src={effluent} alt="energy image" width="100px" />
                        </h4>

                        <p className="text-center text-muted">
                          Last updated:{" "}
                          <span style={{ fontSize: "14px" }}>
                            {formattedTimestamp.time}
                          </span>
                        </p>

                        <div className="row">
                          {effluentFlowParameters.map((item, index) => {
                            let value = displayStack[item.name];
                            return (
                              <div className="col-12 col-md-4 grid-margin" key={index}>
                                <div
                                  className="card mb-3"
                                  style={{ border: "none", cursor: "pointer" }}
                                  onClick={() => handleCardClick(displayStack, item)}
                                >
                                  <div className="card-body">
                                    <h5 className="text-light">{item.parameter}</h5>
                                    <p className="text-light">
                                      <strong className="text-light" style={{ fontSize: "24px" }}>
                                        {value ? parseFloat(value).toFixed(2) : "0.00"}
                                      </strong>{" "}
                                      {item.value}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          <div 
                            className="col-md-4 grid-margin"
                            onClick={() =>
                              setSelectedCard({
                                stackName: displayStack.stackName,
                                title: "Daily Consumption",
                                name: "dailyConsumption"
                              })
                            }
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="card mb-3" style={{ border: "none" }}>
                              <div className="card-body">
                                <h5 className="text-light">Daily Consumption</h5>
                                <p className="text-light">
                                  <strong style={{ color: "#ffff", fontSize: "24px" }}>
                                    {dailyConsumption[displayStack.stackName]?.toFixed(2) || "0.00"}
                                  </strong>{" "}
                                  m³
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
                <h5 className="text-center mt-5">
                  {loading ? "Loading..." : "Waiting for real-time data ..."}
                </h5>
              </div>
            )}
          </div>

          <div
            className="col-md-12 col-lg-12 col-sm-12 mb-2 border shadow"
            style={{ height: '70vh', borderRadius: '15px', position: 'relative' }}
            ref={graphRef}
          >
            {selectedCard ? (
              <FlowGraph
                parameter={selectedCard.name}
                userName={currentUserName}
                stackName={selectedCard.stackName}
                dailyConsumptionData={dailyConsumption}
              />
            ) : (
              <h5 className="text-center mt-5">
                Select a parameter to view its graph
              </h5>
            )}

            {selectedCard && (
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

        <DailyHistoryModal 
          isOpen={showHistoryModal} 
          onRequestClose={() => setShowHistoryModal(false)} 
        />
      </div>
    </div>
  );
};

export default QuantityFlow;