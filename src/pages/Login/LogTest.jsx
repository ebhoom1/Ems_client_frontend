import React, { useEffect, useState , useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName,} from "../../redux/features/iotData/iotDataSlice";
import { fetchUserLatestByUserName } from "../../redux/features/userLog/userLogSlice";
import { useOutletContext } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import { API_URL } from "../../utils/apiConfig";
import { io } from 'socket.io-client';
import effluent from '../../assests/images/effluentimage.svg'
import { Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../../assests/images/ebhoom.png';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-modal";
import "react-toastify/dist/ReactToastify.css";
import { loginUser } from "../../redux/features/auth/authSlice";
import './login.css'
// Initialize Socket.IO
const socket = io(API_URL, { 
  transports: ['websocket'], 
  reconnectionAttempts: 5,
  reconnectionDelay: 1000, // Retry every second
});

socket.on('connect', () => console.log('Connected to Socket.IO server'));
socket.on('connect_error', (error) => console.error('Connection Error:', error));
const LogTest = () => {
  // Use useOutletContext if available, otherwise set defaults
  const outletContext = useOutletContext() || {};
  const { userId } = useSelector((state) => state.selectedUser); 
  const { searchTerm = '', searchStatus = '', handleSearch = () => {}, isSearchTriggered = false } = outletContext;
  const navigate = useNavigate();
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
  const [currentUserName, setCurrentUserName] = useState("KSPCB002");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true); // general loading
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStack, setSelectedStack] = useState("all");
  const [effluentStacks, setEffluentStacks] = useState([]); // New state to store effluent stacks
  const [realTimeData, setRealTimeData] = useState({});
  const [latestfetchData, setLatestfetchData] = useState(null); // Latest data from fetch
  const [displayedData, setDisplayedData] = useState({ stackData: [] });
  const [exceedanceLoading, setExceedanceLoading] = useState(false); // For parameter exceedance
  const [exceedanceColor, setExceedanceColor] = useState("loading"); // Default to "loading" for the spinner
  const [timeIntervalColor, setTimeIntervalColor] = useState("loading"); // Default to "loading" for the spinner
  const [view, setView] = useState("water"); // Default to water view

 // Function to reset colors and trigger loading state
 const resetColors = () => {
  setExceedanceColor("loading");
  setTimeIntervalColor("loading");
};
const [passShow, setPassShow] = useState(false);
const [inpval, setInpval] = useState({
  email: "",
  password: "",
  userType: "select",
});
const [emissionStacks, setEmissionStacks] = useState([]); // Store air stacks

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
    // { parameter: "Temperature", value: '℃', name: 'Temp' },
 
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
  const airParameters = [
    { parameter: "Flow", value: "m3/hr", name: "Flow" },
    { parameter: "CO", value: "µg/Nm³", name: "CO" },
    { parameter: "NOX", value: "µg/Nm³", name: "NOX" },
    { parameter: "PM 2.5", value: "µg/m³", name: "PM25" },
    { parameter: "PM 10", value: "µg/m³", name: "PM10" },
    { parameter: "SO2", value: "mg/Nm3", name: "SO2" },
    { parameter: "Temperature", value: "℃", name: "AirTemperature" },
    { parameter: "Humidity", value: "%", name: "Humidity" },
    { parameter: "Wind Speed", value: "m/s", name: "WindSpeed" },
    { parameter: "Wind Direction", value: "deg", name: "WindDir" },
  ];
  
 // Fetch stack names and filter effluent stationType stacks
 // Fetch stack names and filter effluent stationType stacks
 const fetchStacks = async (userName) => {
  try {
    const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
    const data = await response.json();

    setEffluentStacks(
      data.stackNames
        .filter(stack => stack.stationType === 'effluent')
        .map(stack => stack.name)
    );

    setEmissionStacks(
      data.stackNames
        .filter(stack => stack.stationType === 'emission')
        .map(stack => stack.name)
    );
  } catch (error) {
    console.error("Error fetching stacks:", error);
  }
};

  // Fetching data by username
  const fetchData = async (userName) => {
    setLoading(true);
    try {
      const result = await dispatch(fetchUserLatestByUserName(userName)).unwrap();
      if (result) {
        setLatestfetchData(result);
        setDisplayedData(result?.stackData ? result : { stackData: [] });
        // Fallback to empty stackData
        setSearchResult(result);
        setCompanyName(result.companyName || "Unknown Company");
      } else {
        setDisplayedData({ stackData: [] }); // Ensure fallback value
        throw new Error("No data found for this user.");
      }
    } catch (err) {
      console.error("Error fetching latest data:", err.message);
    } finally {
      setLoading(false);
    }
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
    fetchStacks(userName); // Fetch emission stacks
    if (storedUserId) {
      setCurrentUserName(storedUserId);
    }
  }, [selectedUserIdFromRedux, currentUserName, dispatch]);
  useEffect(() => {
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    fetchStacks(userName); // Fetch both effluent and emission stacks
    fetchData(userName);   // Fetch the latest data
  }, [selectedUserIdFromRedux, currentUserName]);
  
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
    if (!currentUserName) {
      console.error("currentUserName is undefined.");
      return;
    }
  
    const userIdNumber = parseInt(currentUserName.replace(/[^\d]/g, ''), 10);
    if (!isNaN(userIdNumber) && userIdNumber < 12) { // Restrict to KSPCB0013
      const newUserId = `KSPCB${String(userIdNumber + 1).padStart(3, '0')}`;
      setCurrentUserName(newUserId);
    } else {
      console.warn("Reached the last user or invalid user ID.");
    }
  };
  
  
  const handlePrevUser = () => {
    if (!currentUserName) {
      console.error("currentUserName is undefined.");
      return;
    }
  
    const userIdNumber = parseInt(currentUserName.replace(/[^\d]/g, ''), 10);
    if (!isNaN(userIdNumber) && userIdNumber > 1) { // Prevent going below KSPCB001
      const newUserId = `KSPCB${String(userIdNumber - 1).padStart(3, '0')}`;
      setCurrentUserName(newUserId);
    } else {
      console.warn("Reached the first user or invalid user ID.");
    }
  };
  
  const renderStackData = (stackData, parameters, image, stackType) => {
    return (stackData || []).map((stack, index) => (

      <div key={index} className="col-12 mb-4">
        <div className="stack-box">
          <h4 className="text-center">
            {stack.stackName} <img src={image} alt={`${stackType} image`} width="100px" />
          </h4>
          <div className="row">
            {parameters.map((param, paramIndex) => {
              const value = stack[param.name];
              return value && value !== "N/A" ? (
                <div key={paramIndex} className="col-12 col-md-4">
                  <div className="card stack-card">
                    <div className="card-body">
                      <h5>{param.parameter}</h5>
                      <p>
                        <strong>{value}</strong> {param.value}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    ));
  };
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextUser(); // Automatically go to the next user
    }, 3000); // 3 seconds interval

    // Clear the interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, [currentUserName]);
  /* stack */
  const handleStackChange = (event) => {
    setSelectedStack(event.target.value);
  };

  const filteredData = selectedStack === "all"
    ? Object.values(realTimeData)
    : Object.values(realTimeData).filter(data => data.stackName === selectedStack);
    if (error) toast.error(error);
    
    Modal.setAppElement('#root');
  
    const setVal = (e) => {
      const { name, value } = e.target;
      setInpval((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    };
  
    const handleSelectChange = (e) => {
      const { value } = e.target;
      setInpval((prevState) => ({
        ...prevState,
        userType: value,
      }));
    };
  
    const loginuser = async (e) => {
      e.preventDefault();
      const { email, password, userType } = inpval;
    
      // Basic validation
      if (email === "") {
        toast.error("Email is required!");
        return;
      } else if (!email.includes("@")) {
        toast.warning("Please include '@' in your email!");
        return;
      } else if (userType === "select") {
        toast.error("Please select the user type");
        return;
      } else if (password === "") {
        toast.error("Password is required!");
        return;
      } else if (password.length < 6) {
        toast.error("Password must be at least 6 characters!");
        return;
      }
    
     try {
  const res = await dispatch(loginUser({ email, password, userType })).unwrap();

  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userType", userType);

  const username = res?.user?.userName; // ✅ WTCANX comes from here

  navigate(username === "WTCANX" ? "/special-dashboard" : "/water", { replace: true });

  setInpval({ email: "", password: "", userType: "select" });
} catch (error) {
  toast.error("Invalid credentials");
  console.error("Error during login:", error);
  localStorage.removeItem("isLoggedIn");
}


    };
    
  
    const handleDownloadClick = () => {
      navigate('/download-data');  // Redirect to the download-data page
    };
  return (
    <>
      <div>
    <div className="maindiv ">
    <div
  className="subdiv row border border-solid d-flex align-items-center justify-content-center shadow"
  style={{
    borderRadius: '10px',
    backgroundImage: `url("https://static.vecteezy.com/system/resources/thumbnails/004/242/510/small/abstract-wave-trendy-geometric-abstract-background-with-white-and-blue-gradient-vector.jpg")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Add semi-transparent white overlay
    backdropFilter: 'blur(5px)', // Optional: adds a blurred effect
  }}
> 
    <div className="col-lg-6 dataColumn" style={{ height: '70vh' }}>
   
      <div className="d-flex justify-content-between prevnext">
        <div>
          <button onClick={handlePrevUser} disabled={loading} className="btn btn-outline-dark mb-2">
            <i className="fa-solid fa-arrow-left me-1"></i>
          </button>
        </div>
        <div>
          <div className="col-12 justify-content-center align-items-center">
            <h5 className="text-center">{companyName}</h5>
          </div>
        </div>
        <div>
          <button onClick={handleNextUser} disabled={loading} className="btn btn-outline-dark">
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
   

<div>
  <div className="row align-items-center">
    <div className="col-md-4 mb-2">
      {/* Check if displayedData and stackData exist */}
      {displayedData?.stackData?.length > 0 ? (
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
              {displayedData.stackData.map((stack, index) => (
                <option key={index} value={stack.stackName}>
                  {stack.stackName}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <p>No stack data available</p>
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

    <div className="row">
      {(effluentStacks.length > 0 || emissionStacks.length > 0) && (
        <div
          className="col-md-12 col-lg-12 col-sm-12 border overflow-auto bg-light shadow mb-2 graphdiv"
          style={{ height: '45vh', overflowY: 'scroll', borderRadius: '15px' }}
        >
          {/* Water Data */}
          {effluentStacks.length > 0 && (
            <>
              
              {displayedData.stackData
                .filter(stack => effluentStacks.includes(stack.stackName))
                .map((stack, stackIndex) => (
                  <div key={stackIndex} className="col-12">
                    <div className="stack-box">
                      <h6 className="text-center">
                        {stack.stackName}{' '}
                        <img src={effluent} alt="effluent image" width={'100px'} />
                      </h6>
                      <div className="row">
                        {waterParameters.map((item, index) => {
                          const value = stack[item.name];
                          return value && value !== 'N/A' ? (
                            <div
                              className="col-12 col-md-4 grid-margin"
                              key={index}
                            >
                              <div
                                className="card mb-1 stack-card"
                                style={{ border: 'none', color: '#ffff', height: '10px' }}
                                onClick={() =>
                                  handleCardClick(
                                    { title: item.name },
                                    stack.stackName,
                                    currentUserName
                                  )
                                }
                              >
                                <div className="card-body">
                                  <h5 style={{ color: '#ffff' }}>{item.parameter}</h5>
                                  <p>
                                    <strong style={{ color: '#ffff', fontSize: '24px' }}>
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
                ))}
            </>
          )}

          {/* Air Data */}
          {emissionStacks.length > 0 && (
            <>
             
              {displayedData.stackData
                .filter(stack => emissionStacks.includes(stack.stackName))
                .map((stack, stackIndex) => (
                  <div key={stackIndex} className="col-12">
                    <div className="stack-box">
                      <h6 className="text-center">
                        {stack.stackName}{' '}
                      </h6>
                      <div className="row">
                        {airParameters.map((item, index) => {
                          const value = stack[item.name];
                          return value && value !== 'N/A' ? (
                            <div
                              className="col-12 col-md-4 grid-margin"
                              key={index}
                            >
                              <div
                                className="card mb-1 stack-card"
                                style={{ border: 'none', color: '#ffff', height: '10px' }}
                                onClick={() =>
                                  handleCardClick(
                                    { title: item.name },
                                    stack.stackName,
                                    currentUserName
                                  )
                                }
                              >
                                <div className="card-body">
                                  <h5 style={{ color: '#ffff' }}>{item.parameter}</h5>
                                  <p>
                                    <strong style={{ color: '#ffff', fontSize: '24px' }}>
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
                ))}
            </>
          )}
        </div>
      )}

      {/* No Data Available */}
      {effluentStacks.length === 0 && emissionStacks.length === 0 && (
        <div className="col-12 d-flex justify-content-center align-items-center mt-5">
          <h5>No data available for this company</h5>
        </div>
      )}
    </div>
  </div>
        <div className="col-lg-6 loginColumn " style={{ height:'50vh'}}>
          
        <div className=' d-flex justify-content-center ' >
      <div className='bg-light  rounded  shadow w-100' style={{ maxWidth: '500px', padding: '20px' }}>
        <div className="d-flex align-items-center justify-content-between w-100 flex-nowrap" style={{ paddingTop: "10px" }}>
          <img className='ms-2' src={logo} alt="Logo" style={{ height: '30px', width: 'auto' }} />
          <div className='me-2'>
            <Button className='btn' onClick={handleDownloadClick} style={{ backgroundColor: '#236a80', border: 'none', whiteSpace: 'nowrap' }}>Download data</Button>
          </div>
        </div>
  
        <div className="row w-100" style={{ paddingTop: "40px" }}>
          <div className="col d-flex justify-content-center align-items-center" style={{ height: "auto" }}>
            <form className='w-100' style={{ maxWidth: '400px' }}>
              <div className='mb-4' style={{ borderRadius: '20%' }}>
            
                <input
                  type="email"
                  value={inpval.email}
                  onChange={setVal} 
                  name="email"
                  id="email"
                  placeholder="Email"
                  autoComplete="email"
                  className='w-100 border border-solid shadow-lg p-3 input-box'
                />
              </div>
              <div className='mb-4' style={{ borderRadius: '20px', position: 'relative' }}>
  <input
    type={passShow ? "text" : "password"} 
    onChange={setVal}
    value={inpval.password} 
    name="password"
    id="password"
    placeholder="Enter Your Password"
    autoComplete="current-password"
    className='w-100 border border-solid shadow-lg p-3 input-box'
    style={{ paddingRight: '50px' }} // Add padding to avoid text overlap with icon
  />
  <i
    className={`fa-solid ${passShow ? 'fa-eye' : 'fa-eye-slash'}`}
    style={{
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#236a80',
    }}
    onClick={() => setPassShow(!passShow)} // Toggle password visibility
  ></i>
</div>

              <div className='d-flex justify-content-end mb-2'>
                
                <Link to={'/reset'} style={{ textDecoration: 'none' }}>Forgot Password</Link>
              </div>
              <select className="input-field mb-4 w-100 border border-solid shadow-lg p-3 input-box"
                value={inpval.userType}
                onChange={handleSelectChange} >
                <option value="select">Select</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <div className='mb-2'>
                <Button style={{ borderRadius: '20px', backgroundColor: '#236a80' , border:'none' }} className='btn w-100'
                  onClick={loginuser}
                  disabled={loading} >
                  Login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>          
        </div>
      </div>
    </div>
    </div>
    </>

  );
};

export default LogTest; 

