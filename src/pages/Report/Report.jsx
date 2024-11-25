import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from "../../utils/apiConfig";
import { CalibrationContext } from '../CalibartionPage/CalibrationContext';  // Context to store the report data
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import FooterM from '../FooterMain/FooterM';
import Layout from "../Layout/Layout";
import Maindashboard from "../Maindashboard/Maindashboard";
import { useDispatch } from 'react-redux';
import { fetchStackNameByUserName } from '../../redux/features/userLog/userLogSlice';
const Report = () => {

  const dispatch = useDispatch();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [industry, setIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [userName, setUserName] = useState(""); 
  const [users, setUsers] = useState([]);
  const [stackName, setStackName] = useState("");

  const [stackOptions, setStackOptions] = useState([]);
  const { addReport } = useContext(CalibrationContext);  // Use context to store report
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/getallusers`);
        const filteredUsers = response.data.users.filter(
          (user) => user.userType === "user"
        );
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users.");
      }
    };
    fetchUsers();
  }, []);

   
  const industryType = [
    { category: "Sugar" },
    { category: "Cement" },
    { category: "Distillery" },
    { category: "Petrochemical" },
    { category: "Plup & Paper" },
    { category: "Fertilizer" },
    { category: "Tannery" },
    { category: "Pecticides" },
    { category: "Thermal Power Station" },
    { category: "Caustic Soda" },
    { category: "Pharmaceuticals" },
    { category: "Dye and Dye Stuff" },
    { category: "Refinery" },
    { category: "Copper Smelter" },
    { category: "Iron and Steel" },
    { category: "Zinc Smelter" },
    { category: "Aluminium" },
    { category: "STP/ETP" },
    { category: "NWMS/SWMS" },
    { category: "Noise" },
    { category: "Zinc Smelter" },
    { category: "Other" },
  ];

  // Handle form submission for validation and navigation
  const handleCheckValidate = (e) => {
    e.preventDefault();
    if (dateFrom && dateTo && industry && company && userName) {
      navigate("/check-validate", {
        state: {
          dateFrom,
          dateTo,
          industry,
          company,
          userName,
        }
      });
    } else {
      toast.error('Please fill in all fields');
    }
  };
  useEffect(() => {
    const fetchStackOptions = async () => {
      if (!userName) return; // Ensure userName is selected
      try {
        const resultAction = await dispatch(fetchStackNameByUserName(userName));
        console.log('Result Action:', resultAction);

        if (fetchStackNameByUserName.fulfilled.match(resultAction)) {
          const stackNames = resultAction.payload;
          console.log('Fetched Stack Names:', stackNames);
          setStackOptions(stackNames || []);
        } else {
          console.error('Failed to fetch stack names:', resultAction.error);
          toast.error('No Stack Name found for this User.');
        }
      } catch (error) {
        console.error('Error fetching stack names:', error);
        toast.error('Failed to fetch stack names.');
      }
    };
    fetchStackOptions();
  }, [userName, dispatch]);
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!industry || !company || !userName || !stackName || !dateFrom || !dateTo) {
      toast.error('Please fill all the fields.');
      return;
    }

    // Validate if fromDate and toDate are the same
    if (dateFrom === dateTo) {
      toast.error('From Date and To Date cannot be the same.');
      return;
    }

    // Format the dates before navigating
    const formattedDateFrom = formatDate(dateFrom);
    const formattedDateTo = formatDate(dateTo);
    navigate("/check-validate", {
      state: {
        dateFrom: formattedDateFrom,
        dateTo: formattedDateTo,
        industry,
        company,
        userName,
        stackName,
      },
    });
  };
    // Helper function to format date to 'dd-mm-yyyy'

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  return (
    <div className="container-fluid">
    <div className="row">
      {/* Sidebar */}
      <div className="col-lg-3 d-none d-lg-block">
        <DashboardSam />
      </div>
      {/* Main content */}
      <div className="col-lg-9 col-12">
        <Hedaer />
     <div className='maindashboard'>
     <Maindashboard/>
     </div>
     <div className="container-fluid">
      <div className="row">
       
        <div className="col-lg-3 d-none d-lg-block">
         
        </div>
     
        <div className="col-lg-12 col-12">
         
        <div className="row mb-3">
      <div className="col-12 col-md-12 grid-margin">
        <div className="col-12">
          <h1 className="mt-3 text-center">Validate Data and Approve Data</h1>
        </div>
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
              <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="industry">Select Industry</label>
                          <select
                            id="industry"
                            name="industry"
                            className="form-control"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            style={{ borderRadius: '10px' }}
                          >
                            <option value="">Select</option>
                            {industryType.map((industry, index) => (
                              <option key={index} value={industry.category}>
                                {industry.category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="company">Select Company</label>
                          <select
                            id="company"
                            name="company"
                            className="form-control"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            style={{ borderRadius: '10px' }}
                          >
                            <option value="">Select</option>
                            {users.map((user) => (
                              <option key={user.companyName} value={user.companyName}>
                                {user.companyName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="fromDate">From Date</label>
                          <input
                            type="date"
                            id="fromDate"
                            name="fromDate"
                            className="form-control"
                           
                            onChange={(e) => setDateFrom(e.target.value)}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                      </div>

               
                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="toDate">To Date</label>
                          <input
                            type="date"
                            id="toDate"
                            name="toDate"
                            className="form-control"
                        
                            onChange={(e) => setDateTo(e.target.value)}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 mb-4">
  <div className="form-group">
    <label htmlFor="user">User</label>
    <select
      id="user"
      name="user"
      className="form-control"
      value={userName}
      onChange={(e) => setUserName(e.target.value)}
      style={{ borderRadius: '10px' }}
    >
      <option value="">Select</option>
      {users.map((item) => (
        <option key={item.userName} value={item.userName}>
          {item.userName}
        </option>
      ))}
    </select>
  </div>
</div>

<div className="col-lg-6 mb-4">
  <div className="form-group">
    <label htmlFor="station">Station Name</label>
    <select
      id="station"
      name="station"
      className="form-control"
      value={stackName}
      onChange={(e) => setStackName(e.target.value)}
      style={{ borderRadius: '10px' }}
    >
      <option value="">Select</option>
      {stackOptions.map((option, index) => (
        <option key={index} value={option.name}>
          {option.name}
        </option>
      ))}
    </select>
  </div>
</div>


              </div>
              <button type="submit" className="btn  mb-2 mt-2" style={{backgroundColor:'white' , color:'green'}}>
                Check and Validate
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
          <FooterM />
        </div>
      </div>
    </div>


        
      </div>
    </div>
  </div>
  );
};

export default Report;
