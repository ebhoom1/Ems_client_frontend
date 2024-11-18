import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';

const CalibrationExceededReport = () => {
  const location = useLocation();
  const { dateFrom, dateTo, industry, company, userName } = location.state || {};
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [engineerName, setEngineerName] = useState('');

  useEffect(() => {
    console.log("Received Data:", { dateFrom, dateTo, industry, company, userName }); // Debugging log

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/user-exceed-data`, {
          params: {
            userName: userName.trim(),
            industryType: industry.trim(),
            companyName: company.trim(),
            fromDate: dateFrom.trim(),
            toDate: dateTo.trim()
          }
        });

        console.log("API Response:", response.data); // Debugging log
        setEntries(response.data.comments || []);
      } catch (error) {
        console.error('Error fetching exceed data:', error);
      }
    };

    if (dateFrom && dateTo && industry && company && userName) {
      fetchData();
    }
  }, [dateFrom, dateTo, industry, company, userName]);

  const handleReport = async (reportApproved) => {
    if (!engineerName.trim()) {
      toast.error('Engineer Name is required');
      return;
    }
    try {
      const reportData = {
        userName: userName.trim(),
        industryType: industry.trim(),
        companyName: company.trim(),
        fromDate: dateFrom.trim(),
        toDate: dateTo.trim(),
        engineerName: engineerName.trim(),
        reportApproved,
      };

      const response = await axios.post(`${API_URL}/api/create-report`, reportData);

      if (response.status === 201) {
        window.confirm(`Are you sure you want to ${reportApproved ? 'approve' : 'deny'} the report?`);
        toast.success(`Calibration exceed report ${reportApproved ? 'approved' : 'denied'}`);
        if (!reportApproved) {
          setTimeout(() => { navigate("/users-log"); }, 1000);
        }
      } else {
        toast.error('Error creating report');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Error creating report');
    }
  };

  const handleVerified = () => handleReport(true);

  const handleDenied = () => handleReport(false);

  return (
    <div className="main-panel">
      <div className="content-wrapper">
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Control and Monitor Dashboard</h4>
              <div className="quick-link-wrapper w-100 d-md-flex flex-md-wrap">
                <ul className="quick-links ml-auto">
                  <li><a href="#">Settings</a></li>
                  <li><a href="#">Option 1</a></li>
                  <li><a href="#">Option 2</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="row mt-5">
              <div className="col-md-12">
                <h2>Calibration Exceeded Data's</h2>
                <div className="mb-5 mt-3">
                  <h3>Filter Parameters</h3>
                  <p><strong>From Date:</strong> {dateFrom}</p>
                  <p><strong>To Date:</strong> {dateTo}</p>
                  <p><strong>Industry:</strong> {industry}</p>
                  <p><strong>Company:</strong> {company}</p>
                  <p><strong>User Name:</strong> {userName}</p>
                </div>
                
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>SI.No</th>
                        <th>Exceeded Parameter</th>
                        <th>Exceeded Value</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>User Remark Comment</th>
                        <th>Admin Remark Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.parameter}</td>
                          <td>{item.value}</td>
                          <td>{item.formattedDate}</td>
                          <td>{item.formattedTime}</td>
                          <td>{item.commentByUser || 'N/A'}</td>
                          <td>{item.commentByAdmin || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <h3>Report</h3>
                  <form className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="dateFrom" className="form-label"><strong>From Date:</strong></label>
                      <input type="text" className="input-field" id="dateFrom" value={dateFrom} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="dateTo" className="form-label"><strong>To Date:</strong></label>
                      <input type="text" className="input-field" id="dateTo" value={dateTo} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="industry" className="form-label"><strong>Industry:</strong></label>
                      <input type="text" className="input-field" id="industry" value={industry} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="company" className="form-label"><strong>Company:</strong></label>
                      <input type="text" className="input-field" id="company" value={company} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="userName" className="form-label"><strong>User Name:</strong></label>
                      <input type="text" className="input-field" id="userName" value={userName} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="engineerName" className="form-label"><strong>Engineer Name:</strong></label>
                      <input type="text" className="input-field" id="engineerName" value={engineerName} onChange={(e) => setEngineerName(e.target.value)} />
                    </div>
                  </form>
                </div>
                <button className="btn btn-success mt-3" onClick={handleVerified}>Verified</button>
                <button className="btn btn-danger mt-3 ms-2" onClick={handleDenied}>Denied</button>
                <ToastContainer />
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="container-fluid clearfix">
          <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
            AquaBox Control and Monitor System
          </span>
          <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
            © <a href="" target="_blank">Ebhoom Solutions LLP</a> 2022
          </span>
        </div>
      </footer>
    </div>
  );
};

export default CalibrationExceededReport;
