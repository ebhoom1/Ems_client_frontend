import React, { useEffect, useState , useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName,} from "../../redux/features/iotData/iotDataSlice";
import { fetchLast10MinDataByUserName, fetchUserLatestByUserName } from "../../redux/features/userLog/userLogSlice";
import { fetchUserById } from "../../redux/features/userLog/userLogSlice"; // Import Redux action
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
import DownloadaverageDataModal from "./DownloadaverageDataModal";
import { fetchUserByUserName } from "../../redux/features/userLog/userLogSlice";

import axios from "axios";
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
  const { searchTerm = '', searchStatus = '', handleSearch = () => {}, isSearchTriggered = false } = outletContext;
  const { selectedUser } = useSelector((state) => state.userLog);
  const dispatch = useDispatch();
  const { userData,userType } = useSelector((state) => state.user);
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const selectedUserState = useSelector((state) => state.selectedUser);
console.log("Full selectedUser state:", selectedUserState);
const [userId, setUserId] = useState(null);

  const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve userId from session storage
  const { latestData, error } = useSelector((state) => state.iotData);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCalibrationPopup, setShowCalibrationPopup] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [currentUserName, setCurrentUserName] = useState(userType === 'admin' ? "KSPCB001" : userData?.validUserOne?.userName);
  const [companyName, setCompanyName] = useState("");
 
  const [loading, setLoading] = useState(true); // general loading
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStack, setSelectedStack] = useState("all");
  const [effluentStacks, setEffluentStacks] = useState([]); // New state to store effluent stacks
  const [realTimeData, setRealTimeData] = useState({});
  // Remove spinners and set default colors for indicators
  const [exceedanceColor, setExceedanceColor] = useState("green"); // Default to 'gray'
  const [timeIntervalColor, setTimeIntervalColor] = useState("green"); // Default to 'gray'
  const [lastEffluentData, setLastEffluentData] = useState({}); // State to store last effluent data
   // Extract user details
  const [address, setAddress] = useState("No address available");
  const [district, setDistrict] = useState("Unknown District");

  
  


 // Function to reset colors and trigger loading state
 const resetColors = () => {
  setExceedanceColor("loading");
  setTimeIntervalColor("loading");
};

  /* download average data */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const graphRef = useRef();
  // Water parameters
  const waterParameters = [
    { parameter: "pH", value: 'pH', name: 'ph' },
    { parameter: "TDS", value: 'mg/l', name: 'TDS' },
    { parameter: "Turbidity", value: 'NTU', name: 'turbidity' },
  { parameter: "Temperature", value: '℃', name: 'Temp' },
 //ammonicalNitrogen
 { parameter: "Ammonical Nitrogen", value: 'mg/l', name: 'ammonicalNitrogen' },

    { parameter: "BOD", value: 'mg/l', name: 'BOD' },
    { parameter: "COD", value: 'mg/l', name: 'COD' },
    { parameter: "TSS", value: 'mg/l', name: 'TSS' },
    { parameter: "ORP", value: 'mV', name: 'ORP' },
    { parameter: "Nitrate", value: 'mg/l', name: 'nitrate' },
    { parameter: "DO", value: 'mg/l', name: 'DO' },
    { parameter:"Total Flow", value:'m3/Day', name:'Totalizer_Flow'},
    { parameter: "Chloride", value: 'mmol/l', name: 'chloride' },
    { parameter: "Colour", value: 'color', name: 'color' },
    { parameter: "Fluoride", value: "mg/Nm3", name: "Fluoride" },
    { parameter: "Flow", value: 'm3/hr', name: "Flow" },

  ];
 // Fetch stack names and filter effluent stationType stacks
 // Fetch stack names and filter effluent stationType stacks
 useEffect(() => {
  console.log("Selected User ID:", userId); // Debugging line

  if (userId) {
    dispatch(fetchUserById(userId));
  }
}, [userId, dispatch]);

useEffect(() => {
  console.log("Redux state - selectedUser:", selectedUserState);
  console.log("Redux state - userId:", userId);
}, [selectedUserState, userId]);

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
      if (userName === "HH014") {
        // Fetch last 10 minutes data for HH014
        const last10MinData = await dispatch(fetchLast10MinDataByUserName(userName)).unwrap();
  
        // Filter effluent stationType data
        const effluentData = last10MinData.flatMap(record =>
          record.records.filter(stack =>
            stack.stackData.some(item => item.stationType === "effluent")
          )
        );
  
        console.log("Last 10 Minutes Effluent Data:", effluentData);
  
        // Set searchResult to last10MinData for consistency
        setSearchResult(last10MinData);
        console.log("searchResult for HH014:", last10MinData);
  
        // Extract stackNames from the effluentData and update effluentStacks
        const stacks = effluentData.flatMap(record =>
          record.stackData
            .filter(stack => stack.stationType === "effluent")
            .map(stack => stack.stackName)
        );
        setEffluentStacks(stacks);
  
        // Pick the first or most recent data point
        const singleData = effluentData.length > 0 ? effluentData[effluentData.length - 1] : null; // Use the last record
        const formattedData = singleData
          ? {
              stackName: singleData.stackName,
              ...singleData.stackData.find(item => item.stationType === "effluent"),
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
         
  
          // Extract stackNames from the stackData and update effluentStacks
          const stacks = result.stackData
            ?.filter(stack => stack.stationType === "effluent")
            .map(stack => stack.stackName) || [];
          setEffluentStacks(stacks);
  
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
    
    console.log(`Username: ${userName}`);

    // Fetch user details by username
    dispatch(fetchUserByUserName(userName))
      .unwrap()
      .then((user) => {
        console.log("Fetched User Object:", user); // ✅ Log full user details
        console.log("Fetched User ID (_id):", user?._id || "No user ID found"); // ✅ Log _id

        if (user?._id) {
          setUserId(user._id); // ✅ Save the fetched userId in state
        }
      })
      .catch((error) => console.error("Error fetching user:", error));

    fetchData(userName);
    fetchEffluentStacks(userName); // Fetch emission stacks

    if (storedUserId) {
        setCurrentUserName(storedUserId);
    }
}, [selectedUserIdFromRedux, currentUserName, dispatch]);

// ✅ New useEffect: Fetch address when userId is available
useEffect(() => {
    if (!userId) {
      console.log("No userId found. Skipping API call.");
      return; 
    }

    console.log("Fetching user details for userId:", userId); // Debugging

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/getauser/${userId}`);
        console.log("API Response:", response.data); // Debug API response
        if (response.data.status === 200) {
          const user = response.data.user;
          setAddress(user.address || "No address available");
          setDistrict(user.district || "Unknown District");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
}, [userId]); // ✅ Now, it only runs when `userId` is available



  /* useEffect(() => {
    const userName = storedUserId || currentUserName;
    console.log(`username:${userName}`)
    fetchData(userName);
    setCurrentUserName(userName); 
    fetchEffluentStacks(userName);
  }, [searchTerm, currentUserName]);
 */
 /*  useEffect(() => {
    if (searchTerm) {
      fetchData(searchTerm);
      fetchEffluentStacks(searchTerm); 
    } else {
      fetchData(currentUserName);
      fetchEffluentStacks(currentUserName); 
    }
  }, [searchTerm, currentUserName, dispatch]); */

   useEffect(() => {
      const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    
      resetColors();
    
      // Fetch latest data first
      fetchData(userName);
      fetchEffluentStacks(userName);
    
      // Join the user's room
      socket.emit("joinRoom", { userId: userName });
    
      const handleStackDataUpdate = async (data) => {
        console.log(`Real-time data for ${userName}:`, data);
    
        if (data.userName === userName) {
          setExceedanceColor(data.ExceedanceColor || "green"); // Set default color
          setTimeIntervalColor(data.timeIntervalColor || "green");
    
          if (data?.stackData?.length > 0) {
            const effluentData = data.stackData.filter((item) => item.stationType === "effluent");
    
            if (effluentData.length > 0) {
              // If real-time energy data is available, use it
              const processedData = effluentData.reduce((acc, item) => {
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
                  record.records.flatMap((stack) => stack.stackData.filter((item) => item.stationType === "effluent"))
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
    
  

  

  // Handle card click for displaying graphs
  const handleCardClick = (card, stackName) => {
    const userName = storedUserId || currentUserName; // Ensure the correct username
    setSelectedCard({ ...card, stackName, userName });
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
  html2canvas(input, {
    backgroundColor: null, // Makes the background transparent
    scale: 2, // Improves resolution (optional)
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');

    // Calculate dimensions based on the graph content
    const imgWidth = 150; // Adjust scaling for better fit
    const imgHeight = (canvas.height / canvas.width) * imgWidth; // Maintain aspect ratio

    // Calculate positions to center the image
    const xOffset = (pdf.internal.pageSize.getWidth() - imgWidth) / 2; // Center horizontally
    const yOffset = (pdf.internal.pageSize.getHeight() - imgHeight) / 2; // Center vertically

    // Add the image to the PDF centered on the page
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
    pdf.save('graph.pdf');
  });
};






  /* stack */
  const handleStackChange = (event) => {
    setSelectedStack(event.target.value);
  };

  const filteredData = selectedStack === "all"
  ? Object.values(realTimeData).length > 0
    ? Object.values(realTimeData)
    : lastEffluentData.stackName
    ? [lastEffluentData]
    : []
  : Object.values(realTimeData).filter((data) => data.stackName === selectedStack);

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
                
                <div className="col-lg-12 col-12 mt-2">
                <h2 className={`text-center ${userData?.validUserOne?.userType === 'user' ? 'mt-5' : 'mt-3'}`}>
         EFFLUENT DASHBOARD
        </h2>
                  {/* Check if no data is available */}
                 {/* Check if no data is available for stationType == 'effluent' */}
                {/* Check if effluentStacks are empty */}
      {effluentStacks.length === 0 && (
        <div className="text-center mt-3">
          <h5 className='text-danger'><b>No data available for Effluent/Sewage . Please Check Stack Emission Dashboard .</b></h5>
        </div>
      )}



                  
               
                <div className="d-flex justify-content-between">
        
                      {/* <ul className="quick-links ml-auto ">
                        <button className="btn  mb-2 mt-2 " style={{backgroundColor:'#236a80' , color:'white'}} onClick={() => setShowHistoryModal(true)}>
                          Daily History
                        </button>
                      </ul> */}
                     
        
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
                <div>
                  <div className="row align-items-center">
                  <div className="col-md-4">
                    <ul style={{ listStyleType: 'none' }}>
                    <li>
  {effluentStacks.length > 0 ? (
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
          {effluentStacks.map((stackName, index) => (
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
</li>
                    </ul>
               
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
        <h3 className="text-center">
  {storedUserId === "HH014" || currentUserName === "HH014"
    ? "Hilton Manyata"
    : ["KSPCB002", "KSPCB005", "KSPCB010", "KSPCB011"].includes(storedUserId) ||
      ["KSPCB002", "KSPCB005", "KSPCB010", "KSPCB011"].includes(currentUserName)
    ? companyName
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : companyName}
</h3>
<div className=" justify-content-center">
<h6 className="text-center text-secondary">
  <b>Address:</b> {address ? address.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Not Available"}
</h6>

<h6 className="text-center text-secondary"><b>Location:</b> {district}</h6>

</div>


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
            {stack.stackName} <img src={effluent} alt="energy image" width="100px" />
          </h4>
          <div className="row">
            {waterParameters.map((item, index) => {
              const value = stack[item.name];
              return value && value !== "N/A" ? (
                <div className="col-12 col-md-4 grid-margin" key={index}>
                  <div
                    className="card mb-3"
                    style={{ border: "none", cursor: "pointer" }} // Added cursor pointer for better UX
                    onClick={() => handleCardClick({ title: item.parameter }, stack.stackName)} // Trigger handleCardClick on click
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

  <div
  className="col-md-12 col-lg-12 col-sm-12 mb-2 graphdiv border bg-light shadow"
  style={{ height: '70vh', borderRadius: '15px', position: 'relative' }}
  ref={graphRef}
>
  {selectedCard ? (
    <WaterGraphPopup
      parameter={selectedCard.title}
      userName={selectedCard.userName}
      stackName={selectedCard.stackName}
    />
  ) : (
    <h5 className="text-center mt-5">Select a parameter to view its graph</h5>
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