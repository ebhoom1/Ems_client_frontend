import React, { useEffect, useState , useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import { fetchUserLatestByUserName } from '../../redux/features/userLog/userLogSlice';
import { fetchUserByUserName } from "../../redux/features/userLog/userLogSlice";

import NoiseGraphPopup from './NoiseGraphPopup';
import CalibrationPopup from '../Calibration/CalibrationPopup';
import CalibrationExceeded from '../Calibration/CalibrationExceeded';
import { useOutletContext } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import Maindashboard from '../Maindashboard/Maindashboard';
import DailyHistoryModal from '../Water/DailyHIstoryModal';
import { io } from 'socket.io-client';
import { API_URL } from '../../utils/apiConfig';
import WaterGraphPopup from './NoiseGraphPopup';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DownloadaverageDataModal from '../Water/DownloadaverageDataModal';
import axios from 'axios';
const socket = io(API_URL, { 
  transports: ['websocket'], 
  reconnectionAttempts: 5,
  reconnectionDelay: 1000, // Retry every second
});

socket.on('connect', () => console.log('Connected to Socket.IO server'));
socket.on('connect_error', (error) => console.error('Connection Error:', error));
const Noise = () => {
  const outletContext = useOutletContext() || {};
  const { searchTerm = '', searchStatus = '', handleSearch = () => {}, isSearchTriggered = false } = outletContext;
  const [userId, setUserId] = useState(null);
  const [address, setAddress] = useState("No address available");
  const [district, setDistrict] = useState("Unknown District");

  
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
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyDistrict, setCompanyDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStack, setSelectedStack] = useState("all");
  const [effluentStacks, setEffluentStacks] = useState([]); // New state to store effluent stacks
  const [realTimeData, setRealTimeData] = useState({});
  const [noiseStacks, setNoiseStacks] = useState([]); // New state to store noise stacks
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exceedanceColor, setExceedanceColor] = useState("green"); // Default to 'gray'
  const [timeIntervalColor, setTimeIntervalColor] = useState("green"); // Default to 'gray'inner
   // Function to reset colors and trigger loading state
 const resetColors = () => {
  setExceedanceColor("loading");
  setTimeIntervalColor("loading");
};
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const graphRef = useRef();

//fetch stack names
const fetchNoiseStacks = async (userName) => {
  try {
    const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
    const data = await response.json(); // Make sure to parse the JSON
    const noiseStacks = data.stackNames
      .filter(stack => stack.stationType === 'noise')
      .map(stack => stack.name); // Use 'name' instead of 'stackName'
      setNoiseStacks(noiseStacks);
  } catch (error) {
    console.error("Error fetching effluent stacks:", error);
  }
};

const fetchData = async (userName) => {
  setLoading(true);
  
  try {
    const result = await dispatch(fetchUserLatestByUserName(userName)).unwrap();
    if (result) {
      setSearchResult(result);
      setCompanyName(result.companyName || "Unknown Company");
      setCompanyAddress(result.address || "Not Available");
      setCompanyDistrict(result.district || "Not Available");
      console.log('fetchData of Latest:', result); // Check if the result is logged correctly

      setRealTimeData(result.stackData || []); // Display the latest data initially
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
  fetchNoiseStacks(userName); // Fetch emission stacks

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
useEffect(() => {
  if (searchTerm) {
    fetchData(searchTerm);
    fetchNoiseStacks(searchTerm); // Fetch effluent stacks
  } else {
    fetchData(currentUserName);
    fetchNoiseStacks(currentUserName); // Fetch effluent stacks
  }
}, [searchTerm, currentUserName, dispatch]);

useEffect(() => {
  const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
  resetColors();
  

  fetchData(userName); // Fetch latest data first
  fetchNoiseStacks(userName);

  socket.emit("joinRoom", { userId: userName });

 const handleStackDataUpdate = (data) => {
  console.log(`Real-time data for ${userName}:`, data);

if (data.userName === userName) {
  setExceedanceColor(data.ExceedanceColor || "green"); // Set 'green' if no color is provided
  setTimeIntervalColor(data.timeIntervalColor || "green");
  if (data?.stackData?.length > 0) {
    setRealTimeData(data.stackData.reduce((acc, item) => {
      if (item.stackName) {
        acc[item.stackName] = item;
      }
      return acc;
    }, {}));
  }
}
};


  socket.on("stackDataUpdate", handleStackDataUpdate);

  return () => {
    socket.emit("leaveRoom", { userId: userName });
    socket.off("stackDataUpdate", handleStackDataUpdate);
  };
}, [selectedUserIdFromRedux, currentUserName]);



/* graph download */
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

// Handle card click for displaying graphs
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


/* stack */
const handleStackChange = (event) => {
  setSelectedStack(event.target.value);
};

const filteredData = selectedStack === "all"
  ? Object.values(realTimeData)
  : Object.values(realTimeData).filter(data => data.stackName === selectedStack);


const noiseParameters = [
  { parameter: "Noise Level", value: 'dB', name: 'DB' },  // Ensure name matches "DB"
];

  return (
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
  Noise Dashboard
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

             {/*  <ul className="quick-links ml-auto ">
                <button className="btn  mb-2 mt-2 " style={{backgroundColor:'#236a80' , color:'white'}} onClick={() => setShowHistoryModal(true)}>
                  Daily History
                </button>
              </ul> */}
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

         {/*  {!loading && searchError && (
            <div className="card mb-4">
              <div className="card-body">
                <h1>{searchError}</h1>
              </div>
            </div>
          )} */}
<div className="col-12  justify-content-center align-items-center">
            <h3 className="text-center">{companyName}</h3>
            <h5 className="text-center">{companyAddress}</h5>
<h5 className="text-center">{companyDistrict}</h5>
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
<div className="row">

  <div className="col-md-12 col-lg-12 col-sm-12 border overflow-auto bg-light shadow" 
    style={{ height: "70vh", overflowY: "scroll",  borderRadius:'15px' }}>
  {!loading && filteredData.length > 0 ? (
                    filteredData.map((stack, stackIndex) => (
                        noiseStacks.includes(stack.stackName) && (
                            <div key={stackIndex} className="col-12 mb-4">
                                <div className="stack-box">
                                    <h4 className="text-center mt-3">{stack.stackName}</h4>
                                    <div className="row">
                                        {noiseParameters.map((item, index) => {
                                            const value = stack[item.name];
                                            return value && value !== 'N/A' ? (
                                                <div className="col-12 col-md-4 grid-margin" key={index}>
                                                    <div className="card mb-4 stack-card" style={{border:'none' , color:'white'}}   onClick={() =>
                            handleCardClick({ title: item.name }, stack.stackName, currentUserName)
                          }>
                                                        <div className="card-body">
                                                            <h5 style={{color:'#ffff'}}>{item.parameter}</h5>
                                                            <p>
                                                                <strong style={{ color: '#ffff', fontSize:'24px' }}>{value}</strong> {item.value}
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
                  <div class="col-12 d-flex justify-content-center align-items-center mt-5">
                  <h5>Waiting real-time data available</h5>
                </div>
                )}
  </div>
  
  {/* Graph Container with reference */}
  <div
    className="border bg-light shadow col-md-12 col-lg-12 col-sm-12 mb-2 mt-2"
    style={{ height: '70vh', borderRadius: '15px' , position:'relative'}}
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

       {/*  <button
          onClick={openModal}
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
        </button> */} 
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
  );
};

export default Noise;
