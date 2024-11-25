import React, { useEffect, useState , useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName,} from "../../redux/features/iotData/iotDataSlice";
import { fetchUserLatestByUserName } from "../../redux/features/userLog/userLogSlice";
import WaterGraphPopup from './WaterGraphPopup';
import CalibrationPopup from '../Calibration/CalibrationPopup';
import CalibrationExceeded from '../Calibration/CalibrationExceeded';
import { useOutletContext } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import DailyHistoryModal from "./DailyHIstoryModal";
import { API_URL } from "../../utils/apiConfig";
import { io } from 'socket.io-client';
import Hedaer from "../Header/Hedaer";
import Maindashboard from '../Maindashboard/Maindashboard';
import DashboardSam from '../Dashboard/DashboardSam';
import effluent from '../../assests/images/effluentimage.svg'
import './water.css'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// Initialize Socket.IO
const socket = io(API_URL, { 
  transports: ['websocket'], 
  reconnectionAttempts: 5,
  reconnectionDelay: 1000, // Retry every second
});

socket.on('connect', () => console.log('Connected to Socket.IO server'));
socket.on('connect_error', (error) => console.error('Connection Error:', error));
const Water = () => {
  // Use useOutletContext if available, otherwise set defaults
  const outletContext = useOutletContext() || {};
  const { userId } = useSelector((state) => state.selectedUser); 
  const { searchTerm = '', searchStatus = '', handleSearch = () => {}, isSearchTriggered = false } = outletContext;

  const dispatch = useDispatch();
  const { userData,userType } = useSelector((state) => state.user);
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve userId from session storage
  const { latestData, error } = useSelector((state) => state.iotData);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCalibrationPopup, setShowCalibrationPopup] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [currentUserName, setCurrentUserName] = useState(userType === 'admin' ? "KSPCB001" : userData?.validUserOne?.userName);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStack, setSelectedStack] = useState("all");
  const [effluentStacks, setEffluentStacks] = useState([]); // New state to store effluent stacks
  const [realTimeData, setRealTimeData] = useState({});
  const [exceedanceColor, setExceedanceColor] = useState('green'); // Default color
  const [timeIntervalColor, setTimeIntervalColor] = useState('green'); // Default color
  const graphRef = useRef();
  // Water parameters
  const waterParameters = [
    { parameter: "pH", value: 'pH', name: 'ph' },
    { parameter: "TDS", value: 'mg/l', name: 'TDS' },
    { parameter: "Turbidity", value: 'NTU', name: 'turbidity' },
    { parameter: "Temperature", value: '℃', name: 'temperature' },
    { parameter: "BOD", value: 'mg/l', name: 'BOD' },
    { parameter: "COD", value: 'mg/l', name: 'COD' },
    { parameter: "TSS", value: 'mg/l', name: 'TSS' },
    { parameter: "ORP", value: 'mV', name: 'ORP' },
    { parameter: "Nitrate", value: 'mg/l', name: 'nitrate' },
    { parameter: "DO", value: 'mg/l', name: 'DO' },
    {parameter:"Total Flow", value:'m3/Day', name:'Totalizer_Flow'},
    { parameter: "Chloride", value: 'mmol/l', name: 'chloride' },
    { parameter: "Colour", value: 'color', name: 'color' },
    { parameter: "Fluoride", value: "mg/Nm3", name: "Fluoride" },
    { parameter: "Flow", value: 'm3/hr', name: "Flow" },

  ];
 // Fetch stack names and filter effluent stationType stacks
 // Fetch stack names and filter effluent stationType stacks
 const fetchEffluentStacks = async (userName) => {
  try {
    const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
    const data = await response.json(); // Make sure to parse the JSON
    const effluentStacks = data.stackNames
      .filter(stack => stack.stationType === 'effluent')
      .map(stack => stack.name); // Use 'name' instead of 'stackName'
    setEffluentStacks(effluentStacks);
  } catch (error) {
    console.error("Error fetching effluent stacks:", error);
  }
};
  // Fetching data by username
  const fetchData = async (userName) => {
    setLoading(true);
    try {
      const result = await dispatch(fetchUserLatestByUserName(userName)).unwrap();
  
      if (result) {
        setSearchResult(result); // Store the entire result object
        setCompanyName(result.companyName || "Unknown Company"); // Access companyName directly
        console.log('fetchData of Latest:', result); // Check if the result is logged correctly
        setSearchError("");
      } else {
        throw new Error("No data found for this user.");
      }
    } catch (err) {
      setSearchResult(null);
      setCompanyName("Unknown Company");
      setSearchError(err.message || 'No result found for this userID');
    } finally {
      setLoading(false);
    }
  };
  
  
  const fetchHistoryData = async (fromDate, toDate) => {
    // Logic to fetch history data based on the date range
    console.log('Fetching data from:', fromDate, 'to:', toDate);
    // Example API call:
    // const data = await dispatch(fetchHistoryDataByDate({ fromDate, toDate })).unwrap();
  };
  const downloadHistoryData = (fromDate, toDate) => {
    // Logic to download history data based on the date range
    console.log('Downloading data from:', fromDate, 'to:', toDate);
    // Example API call:
    // downloadData({ fromDate, toDate });
  };
  useEffect(() => {
    if (userData?.validUserOne?.userType === 'user') {
      fetchData(userId); // Fetch data only for the current user if userType is 'user'
    } else if (userId) {
      dispatch(fetchIotDataByUserName(userId)); // For other userTypes, fetch data normally
    }
  }, [userId, dispatch]);
  useEffect(() => {
    if (userId) {
      dispatch(fetchIotDataByUserName(userId));
    }
  }, [userId, dispatch]);
  useEffect(() => {
    const storedUserId = sessionStorage.getItem('selectedUserId');
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    console.log(`username : ${userName}`);
    
    fetchData(userName);
    fetchEffluentStacks(userName); // Fetch emission stacks
    if (storedUserId) {
      setCurrentUserName(storedUserId);
    }
  }, [selectedUserIdFromRedux, currentUserName, dispatch]);

  /* useEffect(() => {
    const userName = storedUserId || currentUserName;
    console.log(`username:${userName}`)
    fetchData(userName);
    setCurrentUserName(userName); 
    fetchEffluentStacks(userName);
  }, [searchTerm, currentUserName]);
 */
  useEffect(() => {
    if (searchTerm) {
      fetchData(searchTerm);
      fetchEffluentStacks(searchTerm); // Fetch effluent stacks
    } else {
      fetchData(currentUserName);
      fetchEffluentStacks(currentUserName); // Fetch effluent stacks
    }
  }, [searchTerm, currentUserName, dispatch]);

  useEffect(() => {
    const userName = storedUserId || currentUserName;
    console.log(`Joining room: ${userName}`);
    socket.emit('joinRoom', { userId: userName });
  
    socket.on('stackDataUpdate', (data) => {
      console.log(`Real-time data for ${userName}:`, data);
      setExceedanceColor(data.ExceedanceColor || 'green');
      setTimeIntervalColor(data.timeIntervalColor || 'green');
      if (data?.stackData?.length > 0) {
        setRealTimeData((prevData) => ({
          ...prevData,
          ...data.stackData.reduce((acc, item) => {
            if (item.stackName) {
              acc[item.stackName] = item;
            }
            return acc;
          }, {}),
        }));
      } else {
        console.warn(`No stack data received for ${userName}`);
      }
    });
  
    return () => {
      console.log(`Leaving room: ${userName}`);
      socket.emit('leaveRoom', { userId: userName });
      socket.off('stackDataUpdate');
    };
  }, [storedUserId, currentUserName]);
  

  

  // Handle card click for displaying graphs
  const handleCardClick = (card, stackName) => {
    // Ensure we use the correct userName when admin searches for a user.
    const userName = storedUserId || currentUserName;
    setSelectedCard({ ...card, stackName, userName });
    setShowPopup(true);
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

  // Pagination to handle user navigation
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
  /* stack */
  const handleStackChange = (event) => {
    setSelectedStack(event.target.value);
  };

  const filteredData = selectedStack === "all"
    ? Object.values(realTimeData)
    : Object.values(realTimeData).filter(data => data.stackName === selectedStack);
  return (
<div>
      {/* Show loader while loading */}
      {loading ? (
         <div className="loader-container">
         <div className="dot-spinner">
           <div className="dot-spinner__dot"></div>
           <div className="dot-spinner__dot"></div>
           <div className="dot-spinner__dot"></div>
           <div className="dot-spinner__dot"></div>
           <div className="dot-spinner__dot"></div>
           <div className="dot-spinner__dot"></div>
           <div className="dot-spinner__dot"></div>
           <div className="dot-spinner__dot"></div>
         </div>
       </div>
      ) : (
        <div>
        <div className="container-fluid">
            <div className="row" >
            <div className="col-lg-3 d-none d-lg-block ">
                            <DashboardSam />
                        </div>
           
              <div className="col-lg-9 col-12 ">
                <div className="row1 ">
                  <div className="col-12  " >
                  <div className="headermain">
            <Hedaer />
          </div>
                  </div>
                </div>
        
            
              </div>
              
        
            </div>
          </div>
        
          <div className="container-fluid">
              <div className="row">
             
                <div className="col-lg-3 d-none d-lg-block">
               
                </div>
             
                <div className="col-lg-9 col-12">
                  <div className="row">
                    <div className="col-12">
                      
                    </div>
                  </div>
                  <div className="maindashboard" >
                  <Maindashboard/>
                  </div>
                
                
         <div className="container-fluid water">
              <div className="row">
                
                <div className="col-lg-12 col-12">
                <h1 className={`text-center ${userData?.validUserOne?.userType === 'user' ? 'mt-5' : 'mt-3'}`}>
          Effluent/Sewage Dashboard
        </h1>
                
                  
                {userData?.validUserOne?.userType === 'admin' && (
          <div className='d-flex justify-content-between prevnext '>
            <div>
              <button onClick={handlePrevUser} disabled={loading} className='btn btn-outline-dark mb-2 '>
                <i className="fa-solid fa-arrow-left me-1 "></i>Prev
              </button>
            </div>
          
        
            <div>
              <button onClick={handleNextUser} disabled={loading} className='btn btn-outline-dark '>
                Next <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}
                <div className="d-flex justify-content-between">
        
                      <ul className="quick-links ml-auto ">
                        <button className="btn  mb-2 mt-2 " style={{backgroundColor:'#236a80' , color:'white'}} onClick={() => setShowHistoryModal(true)}>
                          Daily History
                        </button>
                      </ul>
                      <ul className="quick-links ml-auto">
                      <h5 className='d-flex justify-content-end  '>
               <b>Analyser Health:</b><span className={searchResult?.validationStatus ? 'text-success' : 'text-danger'}>{searchResult?.validationStatus ? 'Good' : 'Problem'}</span></h5>
              
                      </ul>
        
                      {/* stac */}
        
                     
                     
                </div>
                <div className="d-flex justify-content-between">
                {userData?.validUserOne && userData.validUserOne.userType === 'user' && (
                        <ul className="quick-links ml-auto">
                          <button type="submit" onClick={handleOpenCalibrationPopup} className="btn  mb-2 mt-2" style={{backgroundColor:'#236a80' , color:'white'}}> Calibration </button>
                        </ul>
                      )}
                             <ul className="quick-links ml-auto">
                        {userData?.validUserOne && userData.validUserOne.userType === 'user' && (
                          <h5>Data Interval: <span className="span-class">{userData.validUserOne.dataInteval}</span></h5>
                        )}
                      </ul>
                </div>
                <div><div className="row align-items-center">
                  <div className="col-md-4">
                  {searchResult?.stackData && searchResult.stackData.length > 0 && (
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
                            {searchResult.stackData.map((stack, index) => (
                              <option key={index} value={stack.stackName}>
                                {stack.stackName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  </div>
                  </div>
                 
                 
                  {loading && (
                    <div className="spinner-container">
                      <Oval
                        height={40}
                        width={40}
                        color="#236A80"
                        ariaLabel="Fetching details"
                        secondaryColor="#e0e0e0"
                        strokeWidth={2}
                        strokeWidthSecondary={2}
                      />
                    </div>
                  )}
        
                
        <div className="col-12  justify-content-center align-items-center">
                    <h3 className="text-center">{companyName}</h3>
                    <div className="color-indicators">
                    <div className="color-indicators d-flex justify-content-center mt-2">
            <div className="color-indicator">
              <div className="color-circle" style={{ backgroundColor: exceedanceColor }}></div>
              <span className="color-label">Parameter Exceed</span>
            </div>
            <div className="color-indicator ml-4">
              <div className="color-circle" style={{ backgroundColor: timeIntervalColor }}></div>
              <span className="color-label">Data Interval</span>
            </div>
          </div>
          </div>
                  </div>
                  <div className="row">
              <div className="col-md-6">
                {/* Graph Container with reference */}
                <div
                  className="border bg-light shadow"
                  style={{ height: '60vh', borderRadius: '15px', position: 'relative' }}
                  ref={graphRef}
                >
                  {selectedCard ? (
                    <WaterGraphPopup
                      parameter={selectedCard.title}
                      userName={currentUserName}
                      stackName={selectedCard.stackName}
                    />
                  ) : (
                    <h5 className="text-center mt-5">Select a parameter to view its graph</h5>
                  )}
        
                  {/* Download Button */}
                  {selectedCard && (
                    
                    <button
                      onClick={handleDownloadPdf}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                      
                        backgroundColor:'#236a80',
                        color:'white'
                      }}
                      className="btn "
                    >
                     <i class="fa-solid fa-download"></i>
                    </button>
                  )}
                </div>
              </div>
              <div
                className="col-md-6 border overflow-auto bg-light shadow"
                style={{ height: '60vh', overflowY: 'scroll', borderRadius: '15px' }}
              >
                {!loading && filteredData.length > 0 ? (
                  filteredData.map((stack, stackIndex) =>
                    effluentStacks.includes(stack.stackName) ? (
                      <div key={stackIndex} className="col-12 mb-4">
                        <div className="stack-box">
                          <h4 className="text-center mt-3">
                            {stack.stackName}{' '}
                            <img
                              src={effluent}
                              alt="effluent image"
                              width={'100px'}
                            />
                          </h4>
                          <div className="row">
                            {waterParameters.map((item, index) => {
                              const value = stack[item.name];
                              return value && value !== 'N/A' ? (
                                <div
                                  className="col-12 col-md-4 grid-margin"
                                  key={index}
                                >
                                  <div
                                    className="card mb-4 stack-card"
                                    style={{ border: 'none', color: 'white' }}
                                    onClick={() =>
                                      handleCardClick(
                                        { title: item.name },
                                        stack.stackName,
                                        currentUserName
                                      )
                                    }
                                  >
                                    <div className="card-body">
                                      <h5 style={{ color: '#ffff' }}>
                                        {item.parameter}
                                      </h5>
                                      <p>
                                        <strong
                                          style={{
                                            color: '#ffff',
                                            fontSize: '24px',
                                          }}
                                        >
                                          {value}
                                        </strong>{' '}
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
                    ) : null
                  )
                ) : (
                  <div className="col-12 d-flex justify-content-center align-items-center mt-5">
                    <h5>Waiting real-time data available</h5>
                  </div>
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
              <div>
                <CalibrationExceeded/>
              </div>
        
        
              <footer className="footer">
                <div className="container-fluid clearfix">
                  <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
                  
                  </span>
                  <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
                    {" "}  Ebhoom Control and Monitor System <br />
                    ©{" "}
                    <a href="" target="_blank">
                      Ebhoom Solutions LLP
                    </a>{" "}
                    2023
                  </span>
                </div>
              </footer>
            </div>
        
                </div>
              </div>
              <DailyHistoryModal
                isOpen={showHistoryModal}
                onRequestClose={() => setShowHistoryModal(false)}
                fetchData={fetchHistoryData}
                downloadData={downloadHistoryData}
              />
        
            </div>
            
        
            </div>
      )}
    </div>

/*  */

    

  );
};

export default Water; 