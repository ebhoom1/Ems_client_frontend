
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
  const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve use
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
  const [effluentFlowStacks, setEffluentFlowStacks] = useState([]); // New state to store effluentFlow stacks  const [realTimeData, setRealTimeData] = useState({})
  const [realTimeData, setRealTimeData] = useState({});
  const [exceedanceColor, setExceedanceColor] = useState("green"); // Default to 'gray'
  const [timeIntervalColor, setTimeIntervalColor] = useState("green"); // Default to 'gray'inner
  const [last10MinData, setLast10MinData] = useState({});
  const [dailyConsumption, setDailyConsumption] = useState({});
  const [initialFlows, setInitialFlows] = useState({}); 
  const [lastFlows, setLastFlows] = useState({});  // New state for last recorded flows
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastValidTimestamp, setLastValidTimestamp] = useState(null);
   // Function to reset colors and trigger loading state
 const resetColors = () => {
  setExceedanceColor("loading");
  setTimeIntervalColor("loading");
};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  }; // Default color
  const graphRef = useRef();

  // Fetch stack names and filter effluentflow stationType stacks
  // Fetch stack names and filter effluentFlow stationType stacks
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
  
  const fetchData = async (userName) => {
    setLoading(true);
  
    try {
      if (userName === "HH014") {
        // Fetch last 10 minutes data for HH014
        const last10MinData = await dispatch(fetchLast10MinDataByUserName(userName)).unwrap();
  
        // Filter effluent_flow station type data
        const effluentFlowData = last10MinData.flatMap((record) =>
          record.records.flatMap((stack) =>
            stack.stackData.filter((item) => item.stationType === "effluent_flow")
          )
        );
  
        console.log("Last 10 Minutes Effluent Flow Data:", effluentFlowData);
  
        // Convert last 10 minutes data to an object keyed by stackName
        const last10MinDataByStackName = effluentFlowData.reduce((acc, item) => {
          acc[item.stackName] = item;
          return acc;
        }, {});
  
        setSearchResult(Object.values(last10MinDataByStackName)); // Save last 10 minutes data for display
        setEffluentFlowStacks(Object.keys(last10MinDataByStackName)); // Update stack names
      } else {
        // Fetch the latest data for other users
        const result = await dispatch(fetchUserLatestByUserName(userName)).unwrap();
  
        if (result) {
          console.log("Latest Data Response:", result);
  
          setCompanyName(result.companyName || "Unknown Company");
  
          // Filter effluent_flow station type data
          const latestEffluentFlowData = result.stackData
            ?.filter((stack) => stack.stationType === "effluent_flow")
            ?.reduce((acc, item) => {
              acc[item.stackName] = item; // Use stackName as the unique key
              return acc;
            }, {});
  
          console.log("Latest Effluent Flow Data:", latestEffluentFlowData);
  
          setSearchResult(Object.values(latestEffluentFlowData || {})); // Update display data
          setEffluentFlowStacks(Object.keys(latestEffluentFlowData || {})); // Update stack names
  
          if (!realTimeData || Object.keys(realTimeData).length === 0) {
            console.log("Displaying fetched latest data until real-time data is available.");
            setRealTimeData(latestEffluentFlowData || {}); // Save for real-time use
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
  const fetchDifferenceData = async (userName) => {
    try {
      const response = await axios.get(`${API_URL}/api/difference/${userName}?interval=daily`);
      const { data } = response;
      if (data && data.success) {
        const initialFlowData = {};
        const today = moment().format('DD/MM/YYYY');
  
        data.data.forEach(item => {
          if (item.stationType === 'effluent_flow' && item.date === today) {
            initialFlowData[item.stackName] = item.initialCumulatingFlow;
          }
        });
  
        console.log("✅ Initial Flows from API:", initialFlowData);
        setInitialFlows(initialFlowData);
      }
    } catch (error) {
      console.error("❌ Error fetching difference data:", error);
    }
  };
  

/* const saveDailyConsumptionToDB = async (userName, stackName, consumption) => {
  try {
    const date = moment().format('DD/MM/YYYY');
    const payload = { userName, stackName, date, consumption };
    const response = await axios.post(`${API_URL}/api/save-daily-consumption`, payload);
    console.log("Daily consumption saved:", response.data);
  } catch (error) {
    console.error("Error saving daily consumption:", error);
  }
}; */
useEffect(() => {
  if (initialFlows) {
    const consumptionData = {};
    Object.keys(initialFlows).forEach(stackName => {
      // Use the real-time value as currentFlow
      const currentFlow = realTimeData[stackName]?.cumulatingFlow || 0;
      const initialFlow = initialFlows[stackName] || 0;
      const difference = Math.max(0, currentFlow - initialFlow); // Ensure non-negative value

      console.log(`🔹 Stack: ${stackName} | Initial Flow: ${initialFlow} | Current Flow: ${currentFlow} | Daily Consumption: ${difference}`);

      consumptionData[stackName] = difference;

      // Save the calculated daily consumption to the database
     /*  saveDailyConsumptionToDB(currentUserName, stackName, difference); */
    });
    setDailyConsumption(consumptionData);
  }
}, [realTimeData, initialFlows]);





useEffect(() => {
    const userName = storedUserId || currentUserName;
    fetchDifferenceData(userName);
}, [storedUserId, currentUserName]);

  useEffect(() => {
    const userName = storedUserId || currentUserName;
    fetchData(userName);
    setCurrentUserName(userName); 
    fetchEffluentFlowStacks(userName);
    fetchPrimaryStation(userName);
  }, [storedUserId, currentUserName]);

  useEffect(() => {
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;

    resetColors();

    // Fetch last 10-minute data first
    dispatch(fetchLast10MinDataByUserName(userName))
      .unwrap()
      .then((last10MinData) => {
        const last10MinEffluentFlowData = last10MinData
          .flatMap((record) =>
            record.records.flatMap((stack) =>
              stack.stackData
                .filter((item) => item.stationType === "effluent_flow")
                .map((item) => ({
                  ...item,
                  timestamp: record.timestamp, // Attach timestamp
                }))
            )
          )
          .reduce((acc, item) => {
            acc[item.stackName] = item; // Ensure uniqueness by stackName
            return acc;
          }, {});

        console.log("⏳ Loaded Last 10-Minute Effluent Flow Data:", last10MinEffluentFlowData);

        // Set last 10-minute data initially
        setRealTimeData(last10MinEffluentFlowData || {});
      });

    // Fetch effluent flow stacks
    fetchEffluentFlowStacks(userName);

    // Join the socket room
    socket.emit("joinRoom", { userId: userName });

    const handleStackDataUpdate = async (data) => {
      console.log(`📡 Real-time data received for ${userName}:`, data);
    
      if (data.userName === userName) {
        setExceedanceColor(data.ExceedanceColor || "green");
        setTimeIntervalColor(data.timeIntervalColor || "green");
    
        if (data?.stackData?.length > 0) {
          const effluentFlowData = data.stackData.filter(
            (item) => item.stationType === "effluent_flow"
          );
    
          if (effluentFlowData.length > 0) {
            // Process real-time data and include timestamp
            const processedRealTimeData = effluentFlowData.reduce((acc, item) => {
              if (item.stackName) {
                acc[item.stackName] = {
                  ...item,
                  timestamp: data.timestamp, // Attach timestamp
                };
              }
              return acc;
            }, {});
    
            // ✅ Store the last valid timestamp when real-time data is received
            setLastValidTimestamp(data.timestamp);
    
            // Update real-time data & ensure smooth transition
            setRealTimeData((prevRealTimeData) => {
              return { ...prevRealTimeData, ...processedRealTimeData };
            });
    
            console.log("✅ Switched to Real-Time Effluent Flow Data:", processedRealTimeData);
          }
        }
      }
    };
    

    socket.on("stackDataUpdate", handleStackDataUpdate);

    return () => {
      socket.emit("leaveRoom", { userId: userName });
      socket.off("stackDataUpdate", handleStackDataUpdate);
      clearTimeout(window.realTimeTimeout);
    };
  }, [selectedUserIdFromRedux, currentUserName]);
  

  
   
  const handleCardClick = (stack, parameter) => {
    // Set the selected card with the stack name and parameter
    setSelectedCard({
      stackName: stack.stackName,
      title: parameter.parameter, // Set the title for the graph
      name: parameter.name, // Parameter key for fetching data
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
/* graph as pdf  */
const handleDownloadPdf = () => {
  const input = graphRef.current;

  // Hide the button before capturing the content
  const downloadButton = input.querySelector('.btn');
  if (downloadButton) {
    downloadButton.style.display = 'none';
  }

  // Set downloading state to true
  setIsDownloading(true);

  // Use html2canvas to capture the content of the graph container
  html2canvas(input).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('graph.pdf');

    // Restore the button visibility after the download is complete
    if (downloadButton) {
      downloadButton.style.display = 'inline-block';
    }

    // Reset downloading state
    setIsDownloading(false);
  });
};
  const handleStackChange = (event) => {
    setSelectedStack(event.target.value);
  };



  const filteredData = Object.values({
    ...last10MinData,
    ...realTimeData, // Overwrite last10MinData with real-time data
  }).sort((a, b) => (realTimeData[b.stackName] ? 1 : -1)); // Ensure real-time data is on top
  
    const effluentFlowParameters = [
      { parameter: "Cumulating Flow", value: "m³", name: "cumulatingFlow" },
      { parameter: "Flow Rate", value: "m³", name: "flowRate" },
     
    ];
    const [primaryStation, setPrimaryStation] = useState(""); // State to hold the primary station name
    

    useEffect(() => {
      fetchPrimaryStation(currentUserName); // Fetch primary station on component mount and userName change
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
    
    console.log("Primary station set:", response.data);
    
    // Ensure the state is updated correctly
    setPrimaryStation(response.data?.data?.stackName || stationName);
  } catch (error) {
    console.error("Error setting primary station:", error);
  }
};

    
  
    
   
  return (
    <div className="main-panel " >
      <div className="content-wrapper" style={{backgroundColor:"white"}}>
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header d-flex justify-content-between" >
              {/* {userType === 'admin' ? (
                <>
              <button onClick={handlePrevUser} disabled={loading} className='btn btn-outline-dark mb-2 '>
              <i className="fa-solid fa-arrow-left me-1 "></i>Prev
               </button>
                <h4 className="page-title"></h4>
                 <button onClick={handleNextUser} disabled={loading} className='btn btn-outline-dark '>
            Next <i className="fa-solid fa-arrow-right"></i>
          </button>                </>
              ) : (
                <div className="mx-auto">
                  <h4 className="page-title"></h4>
                </div>
              )} */}
            </div>
          </div>
        </div>
       <div className="row">
       
        <div className=" text-center"><b><h2>WATER DASHBOARD</h2></b></div>
        
       </div>

       <ul
  className="d-flex align-items-center justify-content-between"
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
  <li>
  {/*   <Dropdown>
    {effluentFlowStacks.length > 0 && (
      <div className="stack-dropdown">
        <label htmlFor="primaryStationSelect" className="label-select">Set Primary Station:</label>
        <div className="styled-select-wrapper">
          <select
            id="primaryStationSelect"
            className="form-select styled-select"
            value={primaryStation}
            onChange={(e) => handleSetPrimaryStation(e.target.value)} // Call your handler function
          >
            <option value="" disabled>
              Select Primary Station
            </option>
            {effluentFlowStacks.map((stackName, index) => (
              <option key={index} value={stackName}>
                {stackName}
              </option>
            ))}
          </select>
        </div>
      </div>
    )}
    </Dropdown> */}
  </li>
</ul>
             
        <div className="row align-items-center mb-5" style={{marginTop:'-100px'}}>
        <div className="col-md-4">
 {/*   */}
</div>
          <div className="">
     <div className="" style={{marginTop:'150px'}}>
       {/*  <FlowConsuptionCards
          userName={currentUserName}
          primaryStation={primaryStation}
        /> */}
          
        </div> 
        <div className="col-12  justify-content-center align-items-center">
        <h3 className="text-center">
  {storedUserId === "HH014" || currentUserName === "HH014" ? "Hilton Manyata" : companyName}
</h3>
        {/* <h3 className="text-center">
  {storedUserId === "HH014" ? " Hilton Manyata" : companyName}
</h3> */}
           {/*  <div className="color-indicators">
  <div className="d-flex justify-content-center mt-2">
   
    <div className="color-indicator">
      <div
        className="color-circle"
        style={{ backgroundColor: exceedanceColor }}
      ></div>
      <span className="color-label me-2">Parameter Exceed</span>
    </div>

   
    <div className="color-indicator ml-4">
      <div
        className="color-circle"
        style={{ backgroundColor: timeIntervalColor }}
      ></div>
      <span className="color-label">Data Interval</span>
    </div>
  </div>
</div> */}
          </div>            
          </div>

          {/* <div className="col-md-4 d-flex justify-content-end " style={{marginTop:'100px'}}>
            <button className="btn btn-primary" onClick={() => setShowHistoryModal(true)}>
              Daily History
            </button>
            {userData?.validUserOne && userData.validUserOne.userType === 'user' && (
              <button type="submit" onClick={handleOpenCalibrationPopup} className="btn btn-primary ml-2">
                Calibration
              </button>
            )}
          </div> */}
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
        let displayStack = { ...stack };

        // Extract timestamp from real-time OR fallback to last valid timestamp
        let timestamp =
          stack?.timestamp ||
          lastValidTimestamp ||
          null;

        // If no timestamp is available, use 2 minutes before current time
        if (!timestamp) {
          const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
          timestamp = twoMinutesAgo.toISOString();
        }

        // Format timestamp
        const formattedTimestamp = {
          date: new Date(timestamp).toLocaleDateString("en-GB"),
          time: new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          }),
        };

        // Determine the latest timestamp for "To Date"
        const latestTimestamp = formattedTimestamp.date;

        return (
          <div key={stackIndex} className="col-12 mb-4">
            <div className="stack-box">
              <h4 className="text-center">
                {displayStack.stackName}{" "}
                <img src={effluent} alt="energy image" width="100px" />
              </h4>

              {/* Display Timestamp */}
              <p className="text-center text-muted">
                Last updated: 
                <span style={{ fontSize: "14px" }}> {formattedTimestamp.time}</span>
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

                          {/* From Date and To Date (For cumulating flow) */}
                          {item.name === "cumulatingFlow" && (
                            <p className="text-light" style={{ fontSize: "12px", marginTop: "-5px" }}>
                              <strong>From:</strong> 22/01/2025 &nbsp; | &nbsp;
                              <strong>To:</strong> {latestTimestamp}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Daily Consumption Card */}
                <div 
                  className="col-md-4 grid-margin"
                  onClick={() =>
                    setSelectedCard({
                      stackName: stack.stackName,
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
                          {dailyConsumption[stack.stackName]?.toFixed(2) || "0.00"}
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












  {/* Graph Container with reference */}
  <div
      className="col-md-12 col-lg-12 col-sm-12 mb-2 border shadow"
      style={{ height: '70vh', borderRadius: '15px', position: 'relative' }}
      ref={graphRef}
    >
      {selectedCard ? (
        <div>
         <FlowGraph
  parameter={selectedCard.name}
  userName={currentUserName}
  stackName={selectedCard.stackName}
  dailyConsumptionData={dailyConsumption}
/>

        </div>
      ) : (
        <h5 className="text-center mt-5">Select a parameter to view its graph</h5>
      )}

      {/* Download Buttons */}
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
            display: isDownloading ? 'none' : 'inline-block', // Hide the button when downloading
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
      
    {/*   <PieChartQuantity primaryStation={primaryStation} userName={currentUserName} /> */}

        <DailyHistoryModal 
  isOpen={showHistoryModal} 
  onRequestClose={() => setShowHistoryModal(false)} 
/>

      </div>
    </div>
  );
};

export default QuantityFlow;
