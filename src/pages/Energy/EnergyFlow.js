

import React, { useEffect, useState  , useRef } from "react";
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
// At the top of the file, import the new component
import EnergyConsumptionCards from './EnergyConsumptionCards';
import PieChartEnergy from "./PieChartEnergy";
import PrimaryStationSelector from "./PrimaryStationSelector";
import BillCalculator from "./BillCalculator";
import DownloadaverageDataModal from "../Water/DownloadaverageDataModal";
import { Dropdown } from "react-bootstrap";

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
  const [energyStacks, setEnergyStacks] = useState([]); // New state to store energy stacks
  const [realTimeData, setRealTimeData] = useState({})
  const [exceedanceColor, setExceedanceColor] = useState("green"); // Default to 'gray'
  const [timeIntervalColor, setTimeIntervalColor] = useState("green"); // Default to 'gray'
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
  };
    const graphRef = useRef();

  // Fetch stack names and filter energy stationType stacks
  const fetchEnergyStacks = async (userName) => {
    try {
      const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
      const data = await response.json(); // Parse the JSON response
  
      // Filter and map energy stacks
      const energyStacks = data.stackNames
        .filter(stack => stack.stationType === 'energy') // Filter for stationType === 'energy'
        .map(stack => stack.name); // Map to stack.name
  
      console.log("Fetched Energy Stacks:", energyStacks); // Log the energyStacks to the console
      setEnergyStacks(energyStacks); // Update the state with energy stacks
    } catch (error) {
      console.error("Error fetching energy stacks:", error); // Log any errors
    }
  };
  const fetchData = async (userName) => {
    setLoading(true);
  
    try {
      if (userName === "HH014") {
        // Fetch last 10 minutes data for HH014
        const last10MinData = await dispatch(fetchLast10MinDataByUserName(userName)).unwrap();
  
        // Filter energy stationType data
        const energyData = last10MinData.flatMap(record =>
          record.records.filter(stack => stack.stackData.some(item => item.stationType === "energy"))
        );
  
        console.log("Last 10 Minutes Energy Data:", energyData);
  
        // Set searchResult to last10MinData for consistency
        setSearchResult(last10MinData);
        console.log("searchResult for HH014:", last10MinData);
  
        // Extract stackNames from the energyData and update energyStacks
        const stacks = energyData.flatMap(record =>
          record.stackData.filter(stack => stack.stationType === "energy").map(stack => stack.stackName)
        );
        setEnergyStacks(stacks);
  
        // Pick the first or most recent data point
        const singleData = energyData.length > 0 ? energyData[energyData.length - 1] : null; // Use the last record
        const formattedData = singleData
          ? {
              stackName: singleData.stackName,
              ...singleData.stackData.find(item => item.stationType === "energy"),
            }
          : null;
  
        if (!realTimeData || Object.keys(realTimeData).length === 0) {
          // If no real-time data is available, show the last 10 minutes' last record
          console.log("Showing the last value from the last 10 minutes.");
          setRealTimeData(formattedData ? [formattedData] : []);
        } else {
          console.log("Real-time data is already available.");
        }
      } else {
        // Fetch the latest data for other users
        const result = await dispatch(fetchUserLatestByUserName(userName)).unwrap();
  
        if (result) {
          setSearchResult(result); // Save the result in state
          console.log("fetchData of Latest - searchResult:", result);
          console.log("searchResult.stackData:", result.stackData);
  
          setCompanyName(result.companyName || "Unknown Company");
  
          // Extract stackNames from the stackData and update energyStacks
          const stacks = result.stackData
            ?.filter(stack => stack.stationType === "energy")
            .map(stack => stack.stackName) || [];
          setEnergyStacks(stacks);
  
          // Show latest data until real-time data comes
          if (!realTimeData || Object.keys(realTimeData).length === 0) {
            console.log("Displaying fetched latest data until real-time data is available.");
            setRealTimeData(result.stackData || []);
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
  
  
  
 
  

  useEffect(() => {
    const userName = storedUserId || currentUserName;
    fetchData(userName);
    setCurrentUserName(userName);
    fetchEnergyStacks(userName);
    fetchPrimaryStation(userName);
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
  
    // Fetch latest data first
    fetchData(userName);
    fetchEnergyStacks(userName);
  
    // Join the user's room
    socket.emit("joinRoom", { userId: userName });
  
    const handleStackDataUpdate = async (data) => {
      console.log(`Real-time data for ${userName}:`, data);
  
      if (data.userName === userName) {
        setExceedanceColor(data.ExceedanceColor || "green"); // Set default color
        setTimeIntervalColor(data.timeIntervalColor || "green");
  
        if (data?.stackData?.length > 0) {
          const energyData = data.stackData.filter((item) => item.stationType === "energy");
  
          if (energyData.length > 0) {
            // If real-time energy data is available, use it
            const processedData = energyData.reduce((acc, item) => {
              if (item.stackName) {
                acc[item.stackName] = item;
              }
              return acc;
            }, {});
  
            setRealTimeData(processedData);
            console.log("Processed Real-Time Energy Data:", processedData);
          } else {
            // No real-time energy data, fallback to the latest record from the last 10 minutes
            console.log("No real-time energy data. Fetching the latest data from the last 10 minutes...");
            const last10MinData = await dispatch(fetchLast10MinDataByUserName(userName)).unwrap();
  
            // Get the latest record
            const fallbackData = last10MinData
              .flatMap((record) =>
                record.records.flatMap((stack) => stack.stackData.filter((item) => item.stationType === "energy"))
              )
              .slice(-1); // Take only the latest record
  
            setRealTimeData(fallbackData || []);
            console.log("Fallback Latest 10-Minute Energy Data:", fallbackData);
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
/* graph as pdf  */
const handleDownloadPdf = () => {
  const input = graphRef.current;
  
  // Use html2canvas to capture the content of the graph container
  html2canvas(input).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('graph.pdf');
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



  const filteredData = selectedStack === "all"
    ? Object.values(realTimeData)
    : Object.values(realTimeData).filter(data => data.stackName === selectedStack);
    const energyParameters = [
      { parameter: "Energy", value: "kW/hr", name: "energy" },
      { parameter: "Power", value: "W", name: "power" },
      { parameter: "Voltage", value: "V", name: "voltage" },
      { parameter: "Current", value: "A", name: "current" },
    ];
    const [primaryStation, setPrimaryStation] = useState(""); // State to hold the primary station name
    

   useEffect(() => {
       fetchPrimaryStation(currentUserName); // Fetch primary station on component mount and userName change
     }, [currentUserName]);
  
   const fetchPrimaryStation = async (userName) => {
  try {
    const response = await axios.get(`${API_URL}/api/primary-station/${userName}`);
    
    // Log the full API response for debugging
    console.log('API Response:', response);

    // Update primary station state
    setPrimaryStation(response.data?.data?.stackName || 'No primary station selected');
  } catch (error) {
    // Log the error details
    console.error('Failed to fetch primary station:', error);

    // Set default state when fetch fails
    setPrimaryStation('No primary station selected');
  }
};

const handleSetPrimaryStation = async (stationName) => {
  try {
    const postData = {
      userName: currentUserName,
      stationType: "energy",
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
    <div className="main-panel">
      <div className="content-wrapper">
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header d-flex justify-content-between">
              {userType === 'admin' ? (
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
              )}
            </div>
          </div>
        </div>
        <div className="row">
  <div className="col-lg-4">
    {latestData && (
      <h5>
        Analyser Health: {searchResult?.validationStatus ? (
          <h5 style={{ color: "green" }}>Good</h5>
        ) : (
          <h5 style={{ color: "red" }}>Problem</h5>
        )}
      </h5>
    )}
  </div>
  <div className="col-lg-4 text-center">
    <b><h3>ENERGY DASHBOARD</h3></b>
  </div>
  <div className="col-lg-4"></div>
</div>

<ul
  className="d-flex align-items-center justify-content-between"
  style={{ listStyleType: 'none', padding: 0, margin: 0 }}
>
  <li>
    <Dropdown> {energyStacks.length > 0 ? (
      <div className="stack-dropdown">
{/*         <label htmlFor="stackSelect" className="label-select">Select Station:</label>
 */}        <div className="styled-select-wrapper">
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
    )}</Dropdown>
   
  </li>
  <li>
  {/*   <Dropdown>{energyStacks.length > 0 && (
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
            {energyStacks.map((stackName, index) => (
              <option key={index} value={stackName}>
                {stackName}
              </option>
            ))}
          </select>
        </div>
      </div>
    )}</Dropdown> */}
  </li>
</ul>


        <div className="row align-items-center mb-5" style={{marginTop:'-100px'}}>
        <div className="col-md-4">
 
</div>
          <div className="">
        <div className="" style={{marginTop:'150px'}}>
          {/* Pass userName and primaryStation as props */}
        {/*   <EnergyConsumptionCards
          userName={currentUserName}
          primaryStation={primaryStation}
        /> */}
          

        </div>
        <div className="col-12  justify-content-center align-items-center">
        
        <h3 className="text-center">
  {storedUserId === "HH014" ? " Hilton Manyata" : companyName}
</h3>
   <div className="color-indicators">
  <div className="d-flex justify-content-center mt-2">
    {/* Parameter Exceed Indicator */}
    <div className="color-indicator">
      <div
        className="color-circle"
        style={{ backgroundColor: exceedanceColor }}
      ></div>
      <span className="color-label me-2">Parameter Exceed</span>
    </div>

    {/* Data Interval Indicator */}
    <div className="color-indicator ml-4">
      <div
        className="color-circle"
        style={{ backgroundColor: timeIntervalColor }}
      ></div>
      <span className="color-label">Data Interval</span>
    </div>
  </div>
</div> 
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
<div
  className="col-md-12 col-lg-12 col-sm-12 border overflow-auto bg-light shadow mb-3"
  style={{ height: "65vh", overflowY: "scroll", borderRadius: "15px" }}
>
  {!loading && Object.values(realTimeData).length > 0 ? (
    Object.values(realTimeData).map((stack, stackIndex) => (
      <div key={stackIndex} className="col-12 mb-4">
        <div className="stack-box">
          <h4 className="text-center">
            {stack.stackName} <img src={energy} alt="energy image" width="100px" />
          </h4>
          <div className="row">
            {energyParameters.map((item, index) => {
              const value = stack[item.name];
              return value && value !== "N/A" ? (
                <div className="col-12 col-md-4 grid-margin" key={index}>
                  <div
                    className="card mb-3"
                    style={{ border: "none", cursor: "pointer" }}
                    onClick={() => handleCardClick(stack, item)} // Add card click handler here
                  >
                    <div className="card-body">
                      <h5 className="text-light">{item.parameter}</h5>
                      <p className="text-light">
                        <strong
                          className="text-light"
                          style={{ color: "#236A80", fontSize: "24px" }}
                        >
                          {parseFloat(value).toFixed(2)} {/* Changed to limit value to 2 decimal places */}
                        </strong>{" "}
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="col-12">
      <h5 className="text-center mt-5">Waiting for real-time data ...</h5>
    </div>
  )}
</div>

  {/* Graph Container with reference */}
  <div
    className=" col-md-12 col-lg-12 col-sm-12 mb-2 border bg-light shadow"
    style={{ height: '70vh', borderRadius: '15px' , position:'relative'}}
    ref={graphRef}
  >
   {selectedCard ? (
  <div>
  
    <EnergyGraph
      parameter={selectedCard.name}
      userName={currentUserName}
      stackName={selectedCard.stackName}
    />
  </div>
) : (
  <h5 className="text-center mt-5">Select a parameter to view its graph</h5>
)}


    {/* Download Buttons */}
    {selectedCard && (
      <>
        <button
          onClick={handleDownloadPdf}
          style={{
            position: 'absolute',
            top: '10px',
            left:'20px',
            backgroundColor: '#236a80',
            color: 'white',
            marginTop:'10px',
            marginBottom:'10px',
          }}
          className="btn"
        >
          <i className="fa-solid fa-download"></i> Download graph
        </button>

       
      </>
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
        {/* <div className="col-lg-6 col-sm-12    ">
        <PieChartEnergy primaryStation={primaryStation} userName={currentUserName} />

        </div> */}
        <div className="col-lg-12 col-sm-12">
        <BillCalculator searchTerm={storedUserId} userData={userData} userType={userType} />

          </div>

      </div>
{/*       <PieChartEnergy primaryStation={primaryStation} userName={currentUserName} />
 */}
        <DailyHistoryModal 
  isOpen={showHistoryModal} 
  onRequestClose={() => setShowHistoryModal(false)} 
/>

      </div>
    </div>
  );
};

export default EnergyFlow;
