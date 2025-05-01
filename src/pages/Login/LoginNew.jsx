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
      if (!email) {
        toast.error("Email is required!");
        return;
      }
      if (!email.includes("@")) {
        toast.warning("Please include '@' in your email!");
        return;
      }
      if (userType === "select") {
        toast.error("Please select the user type");
        return;
      }
      if (!password) {
        toast.error("Password is required!");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters!");
        return;
      }
    
      try {
        // Dispatch the login action
        await dispatch(loginUser({ email, password, userType })).unwrap();
    
        // Save the login flag and user details in localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userType", userType);
    
        // Navigate based on user type
        // if (userType === "operator") {
        //   navigate("/operator-geolocation");
        // } else {
        //   navigate("/water");
        // }
        navigate("/water");

        // Reset the form
        setInpval({ email: "", password: "", userType: "select" });
      } catch (error) {
        // Handle errors
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
  className="subdiv row   d-flex align-items-center justify-content-center "
 
> 

        <div className="col-lg-6 loginColumn " style={{ height:'50vh'}}>
          
        <div className=' d-flex justify-content-center ' >
      <div className='bg-light  rounded  shadow w-100' style={{ maxWidth: '500px', padding: '20px' ,   borderRadius: '10px',
    backgroundImage: `url("https://static.vecteezy.com/system/resources/thumbnails/004/242/510/small/abstract-wave-trendy-geometric-abstract-background-with-white-and-blue-gradient-vector.jpg")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Add semi-transparent white overlay
    backdropFilter: 'blur(5px)', }}>
        <div className="d-flex align-items-center justify-content-between w-100 flex-nowrap" style={{ paddingTop: "10px" ,}}>
          <h3 className="ms-3" style={{color:'#236a80'}}><b>Login</b></h3>
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
                
                <Link to={'/reset'} style={{ textDecoration: 'none', color:'#236a80'}}>Forgot Password</Link>
              </div>
              <select className="input-field mb-4 w-100 border border-solid shadow-lg p-3 input-box"
                value={inpval.userType}
                onChange={handleSelectChange} >
                <option value="select">Select</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="operator">Operator</option> 
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


