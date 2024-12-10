import React, { useEffect, useState  , useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import { fetchUserLatestByUserName } from "../../redux/features/userLog/userLogSlice";
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
  const [exceedanceLoading, setExceedanceLoading] = useState(false); // For parameter exceedance
  const [exceedanceColor, setExceedanceColor] = useState("loading"); // Default to "loading" for the spinner
  const [timeIntervalColor, setTimeIntervalColor] = useState("loading"); // Default to "loading" for the spinner
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
      const data = await response.json(); // Make sure to parse the JSON
      const energyStacks = data.stackNames
        .filter(stack => stack.stationType === 'energy')
        .map(stack => stack.name); // Use 'name' instead of 'stackName'
      setEnergyStacks(energyStacks);
    } catch (error) {
      console.error("Error fetching energy stacks:", error);
    }
  };
  

  const fetchData = async (userName) => {
    setLoading(true);
    setExceedanceLoading(true); // Show loading for parameter exceedance

    try {
      const result = await dispatch(fetchUserLatestByUserName(userName)).unwrap();
      setSearchResult(result);
      setCompanyName(result?.companyName || "Unknown Company");
      setSearchError("");
    } catch (err) {
      setSearchResult(null);
      setCompanyName("Unknown Company");
      setSearchError(err.message || 'No Result found for this userID');
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
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    
    // Reset colors and loading states for the new user
    resetColors();
    setExceedanceLoading(true);
  
    fetchData(userName); // Fetch general user data
    fetchEnergyStacks(userName); // Fetch effluent stacks
  
    // Set up the real-time data listener for the selected user
    console.log(`Joining room for user: ${userName}`);
    socket.emit("joinRoom", { userId: userName });
  
    const handleStackDataUpdate = (data) => {
      console.log(`Real-time data for ${userName}:`, data);
  
      // Ensure the data corresponds to the current user
      if (data.userName === userName) {
        setExceedanceColor(data.ExceedanceColor || "green");
        setTimeIntervalColor(data.timeIntervalColor || "green");
        setExceedanceLoading(false); // Stop loading for parameter exceedance
  
        if (data?.stackData?.length > 0) {
          setRealTimeData(data.stackData.reduce((acc, item) => {
            if (item.stackName) {
              acc[item.stackName] = item;
            }
            return acc;
          }, {}));
        } else {
          setRealTimeData({});
        }
      } else {
        console.warn(`Ignored real-time data for another user: ${data.userName}`);
      }
    };
  
    socket.on("stackDataUpdate", handleStackDataUpdate);
  
    return () => {
      // Clean up listeners to prevent race conditions
      console.log(`Leaving room for user: ${userName}`);
      socket.emit("leaveRoom", { userId: userName });
      socket.off("stackDataUpdate", handleStackDataUpdate);
    };
  }, [selectedUserIdFromRedux, currentUserName]);



  const handleCardClick = (card, stackName) => {
    // Ensure we use the correct userName when admin searches for a user.
    const userName = searchTerm || currentUserName;
    setSelectedCard({ ...card, stackName, userName });
    setShowPopup(true);
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
        setPrimaryStation(response.data?.data?.stackName || 'No primary station selected');
      } catch (error) {
        console.error('Failed to fetch primary station:', error);
        setPrimaryStation('No primary station selected');
      }
    };
    const handleSetPrimaryStation = (stationName) => {
      setPrimaryStation(stationName); // Immediately update local state
      const postData = {
        userName: currentUserName,
        stationType: 'energy', // Assuming 'energy' is always the type for now
        stackName: stationName
      };
      axios.post(`${API_URL}/api/set-primary-station`, postData)
        .then(response => {
          console.log('Primary station set:', response.data);
          // You might want to fetch new data here or ensure the child component reacts to the change
        })
        .catch(error => {
          console.error('Error setting primary station:', error);
        });
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
        <ul className="quick-links ml-auto d-flex">
                {latestData && (
                  <li >
                    <h5>Analyser Health: <span className="text-success"> Good</span></h5>
                    {/* {searchResult?.validationStatus ? (
                      <h5 style={{ color: "green" }}>Good</h5>
                    ) : (
                      <h5 style={{ color: "red" }}>Problem</h5>
                    )} */}
                  </li>
                )}
                <li className=" text-center" style={{marginLeft:'150px'}}><b><h2>ENERGY DASHBOARD</h2></b></li>
               
              </ul>
              <ul className="d-flex align-items-center justify-content-between" style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                <li>{searchResult?.stackData && searchResult.stackData.length > 0 && (
    <div className="stack-dropdown">
      <label htmlFor="stackSelect" className="label-select">Select Station:</label>
      <div className="styled-select-wrapper">
        <select
          id="stackSelect"
          className="form-select styled-select"
          value={selectedStack}
          onChange={handleStackChange}
        >
          <option value="all">All Stacks</option>
          {searchResult.stackData
            .filter(stack => energyStacks.includes(stack.stackName)) // Filter only energy stations
            .map((stack, index) => (
              <option key={index} value={stack.stackName}>
                {stack.stackName}
              </option>
            ))}
        </select>
      </div>
        {/* Primary station dropdown component */}
       <div>
         <PrimaryStationSelector
                stations={searchResult.stackData.filter(stack => energyStacks.includes(stack.stackName)).map(stack => stack.stackName)}
                userName={currentUserName}
                setPrimaryStation={setPrimaryStation}
                primaryStation={primaryStation}

              />
              </div>
    </div>
  )}</li>
 
                <li> <button className="btn text-light " style={{backgroundColor:'#236a80'}} onClick={() => setShowHistoryModal(true)}>
              Daily History
            </button></li>
              </ul>
             
        <div className="row align-items-center mb-5" style={{marginTop:'-100px'}}>
        <div className="col-md-4">
 {/*  {searchResult?.stackData && searchResult.stackData.length > 0 && (
    <div className="stack-dropdown">
      <label htmlFor="stackSelect" className="label-select">Select Station:</label>
      <div className="styled-select-wrapper">
        <select
          id="stackSelect"
          className="form-select styled-select"
          value={selectedStack}
          onChange={handleStackChange}
        >
          <option value="all">All Stacks</option>
          {searchResult.stackData
            .filter(stack => energyStacks.includes(stack.stackName)) 
            .map((stack, index) => (
              <option key={index} value={stack.stackName}>
                {stack.stackName}
              </option>
            ))}
        </select>
      </div>
      
       <div>
         <PrimaryStationSelector
                stations={searchResult.stackData.filter(stack => energyStacks.includes(stack.stackName)).map(stack => stack.stackName)}
                userName={currentUserName}
                setPrimaryStation={setPrimaryStation}
                primaryStation={primaryStation}

              />
              </div>
    </div>
  )} */}
</div>
          <div className="col-md-4">
        <div className="col-md-4" style={{marginTop:'100px'}}>
          {/* Pass userName and primaryStation as props */}
          <EnergyConsumptionCards
          userName={currentUserName}
          primaryStation={primaryStation}
        />
        </div>
        <div className="col-12  justify-content-center align-items-center">
            <h3 className="text-center">{companyName}</h3>
            <div className="color-indicators">
  <div className="d-flex justify-content-center mt-2">
    {/* Parameter Exceed Indicator */}
    <div className="color-indicator">
      {exceedanceLoading ? (
        <div className="spinner-container">
          <Oval height={20} width={20} color="#236A80" ariaLabel="Loading..." />
        </div>
      ) : (
        <div
          className="color-circle"
          style={{ backgroundColor: exceedanceColor }}
        ></div>
      )}
      <span className="color-label">Parameter Exceed</span>
    </div>

    {/* Data Interval Indicator */}
    <div className="color-indicator ml-4">
      {exceedanceLoading ? (
        <div className="spinner-container">
          <Oval height={20} width={20} color="#236A80" ariaLabel="Loading..." />
        </div>
      ) : (
        <div
          className="color-circle"
          style={{ backgroundColor: timeIntervalColor }}
        ></div>
      )}
      <span className="color-label">Data Interval</span>
    </div>
  </div>
</div>
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


  <div className="col-md-12 col-lg-6 col-sm-12 border overflow-auto bg-light shadow mb-3 " 
        style={{ height: "65vh", overflowY: "scroll",  borderRadius:'15px' }}> 
  {!loading && filteredData.length > 0 ? (
                    filteredData.map((stack, stackIndex) => (
                        energyStacks.includes(stack.stackName) && (
                            <div key={stackIndex} className="col-12 mb-4">
                                <div className="stack-box">
                                    <h4 className="text-center ">{stack.stackName} <img src={energy} alt='energy image' width='100px'></img></h4>
                                    <div className="row">
                                        {energyParameters.map((item, index) => {
                                            const value = stack[item.name];
                                            return value && value !== 'N/A' ? (
                                                <div className="col-12 col-md-4 grid-margin" key={index}>
                                                 <div className="card mb-3" style={{border:'none'}}   onClick={() =>
                                               handleCardClick({ title: item.name }, stack.stackName, currentUserName) }>                                                        <div className="card-body">
                                                            <h5 className="text-light">{item.parameter}</h5>
                                                            <p className='text-light'>
                                                                <strong className="text-light" style={{ color: '#236A80', fontSize:'24px' }}>{value}</strong> {item.value}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    ))
                ) : (
                    <div className="col-12">
                        <h5 className="text-center mt-5">Waiting real-time data available</h5>
                    </div>
                )}
  </div>
  <div className="col-md-12 col-lg-6 col-sm-12 mb-2 ">
  {/* Graph Container with reference */}
  <div
    className="border bg-light shadow"
    style={{ height: '65vh', borderRadius: '15px' , position:'relative'}}
    ref={graphRef}
  >
    {selectedCard ? (
      <EnergyGraph
        parameter={selectedCard.title}
        userName={currentUserName}
        stackName={selectedCard.stackName}
      />
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

        <button
          onClick={openModal} // Open the modal
          style={{
            position: 'absolute',
            top: '10px',
            right: '20px',
            backgroundColor: '#236a80',
            color: 'white',
            marginTop:'10px',
            marginBottom:'10px',
          }}
          className="btn"
        >
          <i className="fa-solid fa-download"></i> Download Average
        </button> 
      </>
    )}
  </div>

  {/* Modal for Downloading Average Data */}
  <DownloadaverageDataModal
    isOpen={isModalOpen}
    onClose={closeModal}
    userName={currentUserName}
    stackName={selectedCard?.stackName || ''}
  />
</div>

</div>
           {/*  <div className="row">
                {!loading && filteredData.length > 0 ? (
                    filteredData.map((stack, stackIndex) => (
                        energyStacks.includes(stack.stackName) && (
                            <div key={stackIndex} className="col-12 mb-4">
                                <div className="stack-box">
                                    <h4 className="text-center">{stack.stackName}</h4>
                                    <div className="row">
                                        {energyParameters.map((item, index) => {
                                            const value = stack[item.name];
                                            return value && value !== 'N/A' ? (
                                                <div className="col-12 col-md-4 grid-margin" key={index}>
<div className="card"   onClick={() =>
                                handleCardClick({ title: item.name }, stack.stackName, currentUserName)
                              }>                                                        <div className="card-body">
                                                            <h5>{item.parameter}</h5>
                                                            <p>
                                                                <strong style={{ color: '#236A80', fontSize:'24px' }}>{value}</strong> {item.value}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    ))
                ) : (
                    <div className="col-12">
                        <h5>Waiting real-time data available</h5>
                    </div>
                )}
            </div> */}

        {/* {showPopup && selectedCard && (
          <EnergyGraph
          isOpen={showPopup}
          onRequestClose={handleClosePopup}
          parameter={selectedCard.title}
          userName={currentUserName}
          stackName={selectedCard.stackName}
          />
        )}
 */}
        {showCalibrationPopup && (
          <CalibrationPopup
            userName={userData?.validUserOne?.userName}
            onClose={handleCloseCalibrationPopup}
          />
        )}
      <div className="row">
        <div className="col-lg-6 col-sm-12    ">
        <PieChartEnergy primaryStation={primaryStation} userName={currentUserName} />

        </div>
        <div className="col-lg-6 col-sm-12">
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
