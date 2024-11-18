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

const Report = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [industry, setIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [userName, setUserName] = useState(""); 
  const [users, setUsers] = useState([]);
  const { addReport } = useContext(CalibrationContext);  // Use context to store report
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/getallusers`);
        const filteredUsers = response.data.users.filter(user => user.userType === "user");
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
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

  // Handle form submission to add report
  const handleSubmit = (e) => {
    e.preventDefault();
    if (dateFrom && dateTo && industry && company && userName) {
      const reportData = {
        industry,
        company,
        fromDate: dateFrom,
        toDate: dateTo,
        username: userName,
      };
      addReport(reportData);
      toast.success('Report added successfully!');
      navigate('/view-report');
    } else {
      toast.error('Please fill in all fields');
    }
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
         
          <div className="row">
            <div className="col-12 col-md-12 grid-margin">
              <div className="card m-1 mt-3">
                <div className="card-body">
                  <h1 className='text-center mt-3'>Validate Data</h1>
                  <form className='m-1 p-1' onSubmit={handleCheckValidate}>
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
                            value={dateFrom}
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
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                      </div>

                    
                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="username">Select User</label>
                          <select
                            id="username"
                            name="username"
                            className="form-control"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            style={{ borderRadius: '10px' }}
                          >
                            <option value="">Select</option>
                            {users.map((user) => (
                              <option key={user.userName} value={user.userName}>
                                {user.userName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                    </div>
                    <button type="submit" className="btn  mb-2 mt-2" style={{backgroundColor:'green' , border:'none' , color:'white'}}>Check and Validate</button>
                  </form>

                 
                 

                  <ToastContainer />
                </div>
              </div>
            </div>
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
