import React, { useEffect, useState } from "react";
import logo from '../../assests/images/ebhoom.png'; // Corrected image path
import { Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import { Oval } from 'react-loader-spinner';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-modal";
import "react-toastify/dist/ReactToastify.css";
import { loginUser } from "../../redux/features/auth/authSlice";
import './loginnew.css'
import { API_URL } from "../../utils/apiConfig";

function LoginNew() {
  const { userId } = useSelector((state) => state.selectedUser); 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCalibrationPopup, setShowCalibrationPopup] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [currentUserName, setCurrentUserName] = useState("KSPCB001");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false); // Use consistent loading state
  const [selectedStack, setSelectedStack] = useState("all");

  const [effluentStacks, setEffluentStacks] = useState([]); // New state to store effluent stacks
  const [passShow, setPassShow] = useState(false);
  const [inpval, setInpval] = useState({
    email: "",
    password: "",
    userType: "select",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [waterParams] = useState([
    { parameter: "Ph", value: 'pH', name: 'ph' },
    { parameter: "TDS", value: 'mg/l', name: 'TDS' },
    { parameter: "Tur", value: 'Ntu', name: 'turbidity' },
    { parameter: "Tem", value: '℃', name: 'temperature' },
    { parameter: "BOD", value: 'mg/l', name: 'BOD' },
    { parameter: "COD", value: 'mg/l', name: 'COD' },
    { parameter: "TSS", value: 'mg/l', name: 'TSS' },
    { parameter: "ORP", value: 'mV', name: 'ORP' },
    { parameter: "Nit", value: 'mg/l', name: 'nitrate' },
  ]);
  const [airParams] = useState([
    { parameter: "Flow", value: 'm/s', name: "Flow" },
    { parameter: "CO", value: 'µg/Nm³', name: "CO" },
    { parameter: "NOX", value: 'µg/Nm³', name: "NOX" },
    { parameter: "PM", value: 'µg/m³', name: "PM" },
    { parameter: "SO2", value: 'µg/m³', name: "SO2" },
    { parameter: "Temp", value: '℃', name: "AirTemperature" },
    { parameter: "Humidity", value: '%', name: "Humidity" },
  ]);
  
  
  const fetchData = async (userName) => {
    setLoading(true);
    try {
      const result = await dispatch(fetchIotDataByUserName(userName)).unwrap();
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
    if (userId) {
      fetchData(userId);
    } else {
      fetchData(currentUserName);
    }
  }, [userId, currentUserName, dispatch]);

  const handleCardClick = (card) => {
    setSelectedCard(card);
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

  const renderBoxesWithValues = (parameters, result) => {
    return parameters
      .filter((item) => result && result[item.name] && result[item.name] !== 'N/A') // Filter out 'N/A' or undefined values
      .map((item, index) => {
        const value = result ? result[item.name] : 'N/A';
        return (
          <div className="col-md-4 col-12 grid-margin" key={index}>
            <div className="card m-3">
              <div className="card-body">
                <h5>{item.parameter}</h5>
                <h6>
                  <strong>{value}</strong> {item.value}
                </h6>
              </div>
            </div>
          </div>
        );
      });
  };

  

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
    } else {
      dispatch(loginUser({ email, password, userType }))
        .unwrap()
        .then((result) => {
          const now = new Date();
          const endSubscriptionDate = new Date(result.endSubscriptionDate);

          if (userType !== result.userType) {
            toast.error("User type does not match!");
          } else if (now.toDateString() === endSubscriptionDate.toDateString()) {
            setSelectedUser(result);
            setModalIsOpen(true);
          } else {
            if (userType === 'admin') {
              navigate('/water');
            } else if (userType === 'user') {
              navigate('/account');
            }
            setInpval({ email: '', password: '', userType: 'select' });
          }
        })
        .catch((error) => {
          toast.error('Invalid credentials');
          console.log("Error from catch signIn:", error);
        });
    }
  }; 

  const handleDownloadClick = () => {
    navigate('/download-data');  // Redirect to the download-data page
  };
  const handleStackChange = (event) => {
    setSelectedStack(event.target.value);
  };
  return (
    <div className="back d-flex-align-items-center justify-content center" style={{ overflowY: 'hidden', marginTop: '6%' }}>
      <div className="row ms-5 me-5 shadow m-5 d-flex align-items-center justify-content-center columnFirst" style={{ backgroundColor: 'white', marginTop: '6%', overflowY: 'hidden' }}>
        {/* Column 1 (Water parameters and company data) */}
        <div className="col-6 firstColumn p-5">
        <div className="d-flex justify-content-between align-items-center">
                  <button onClick={handlePrevUser} disabled={loading || currentUserName === "KSPCB001"} className='btn btn-outline-dark'>
                    <i className="fa-solid fa-arrow-left me-1"></i> Prev
                  </button>
                  <button onClick={handleNextUser} disabled={loading} className='btn btn-outline-dark'>
                    Next <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
          <h4 className="text-center">{companyName}</h4>
          {loading && (
            <div className="spinner-container">
              <Oval height={40} width={40} color="#236A80" ariaLabel="Fetching details" secondaryColor="#e0e0e0" strokeWidth={2} strokeWidthSecondary={2} />
            </div>
          )}
          {!loading && searchError && (
            <div className="card mb-4">
              <div className="card-body">
                <h1>{searchError}</h1>
              </div>
            </div>
          )}
          {!loading && !searchError && (
            <>
              {searchResult?.stackData && searchResult.stackData.length > 0 && (
                <div className="stack-dropdown">
                  <label htmlFor="stackSelect" className="label-select">Select Stack:</label>
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
              )}

              <div className="row mt-4">
                {selectedStack === "all" ? (
                  <>
                    {renderBoxesWithValues(waterParams, searchResult)}
                    {renderBoxesWithValues(airParams, searchResult)}
                  </>
                ) : (
                  <>
                    {renderBoxesWithValues(waterParams, searchResult[selectedStack])}
                    {renderBoxesWithValues(airParams, searchResult[selectedStack])}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Column 2 (Login Form) */}
        <div className="col-6 loginColumn">
          <div className='bg-light rounded shadow w-100' style={{ maxWidth: '500px', padding: '20px' }}>
            <div className="d-flex align-items-center justify-content-between w-100 flex-nowrap" style={{ paddingTop: "10px" }}>
              <img className='ms-2' src={logo} alt="Logo" style={{ height: '30px', width: 'auto' }} />
              <div className='me-2'>
                <Button className='btn' onClick={handleDownloadClick} style={{ backgroundColor: '#236a80', border: 'none', whiteSpace: 'nowrap' }}>Download data</Button>
              </div>
            </div>

            <div className="row w-100" style={{ paddingTop: "40px" }}>
              <div className="col d-flex justify-content-center align-items-center" style={{ height: "auto" }}>
                <form className='w-100' style={{ maxWidth: '400px' }}>
                  <div className='mb-4' style={{ borderRadius: '10px' }}>
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
                  <div className='mb-4' style={{ borderRadius: '10px' }}>
                    <input
                     type={passShow ? "text" : "password"} 
                     onChange={setVal}
                     value={inpval.password} 
                      name="password"
                      id="password"
                      placeholder="Enter Your password"
                      autoComplete="current-password"
                      className='w-100 border border-solid shadow-lg p-3 input-box'
                    />
                  </div>
                  <div className='d-flex justify-content-between mb-2'>
                    <div className="showpass" onClick={() => setPassShow(!passShow)}>
                      {passShow ? "Hide" : "Show"}
                    </div>
                    <Link to={'/reset'} style={{ textDecoration: 'none' }}>Forgot Password</Link>
                  </div>
                  <select className="input-field mb-4 w-100 border border-solid shadow-lg p-3 input-box"
                   value={inpval.userType}
                   onChange={handleSelectChange}>
                    <option value="select">Select</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                  <div className='mb-4'>
                    <Button style={{ borderRadius: '20px', backgroundColor: '#236a80', border: 'none' }} className='btn w-100'
                     onClick={loginuser}
                     disabled={loading} >
                      Login
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginNew;
