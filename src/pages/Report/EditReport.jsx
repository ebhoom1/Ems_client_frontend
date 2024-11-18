import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../utils/apiConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardSam from '../Dashboard/DashboardSam'; // Assuming you're importing the Sidebar component
import Hedaer from '../Header/Hedaer'; // Assuming you're importing the Header component
import HeaderSim from '../Header/HeaderSim';

const EditReport = () => {
  const { userName } = useParams();
  const [report, setReport] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/get-a-report/${userName}`);
        setReport(response.data.reports[0]); // Assuming the response contains an array of reports
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    };

    fetchReport();
  }, [userName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport({ ...report, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${API_URL}/api/edit-report/${userName}`, report);
      toast.success('Successfully edited the report');
      setTimeout(() => {
        navigate('/view-report');
      }, 1000);
    } catch (error) {
      toast.error(`Error in edit: ${error}`);
      console.error('Error updating report:', error);
    }
  };

  if (!report) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 d-none d-lg-block">
         <DashboardSam/>
        </div>

        {/* Main Content */}
        <div className="col-lg-9 col-12">
          {/* Header */}
          <div className="row">
            <div className="col-12">
             <HeaderSim/>
            </div>
          </div>

          {/* Page Title */}
        

          {/* Edit Report Form */}
          <div className="row">
            <div className="col-12 col-md-12 grid-margin">
              <div className="card m-1 mt-5">
                <div className="card-body">
                  <h1 className="text-center mt-3">Edit Report for {userName}</h1>
                  <form className="m-5 p-5" onSubmit={handleSubmit}>
                    <div className="row">
                      {/* From Date */}
                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="fromDate">From Date</label>
                          <input
                            type="text"
                            id="fromDate"
                            name="fromDate"
                            className="form-control"
                            value={report.fromDate}
                            onChange={handleChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                      </div>

                      {/* To Date */}
                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="toDate">To Date</label>
                          <input
                            type="text"
                            id="toDate"
                            name="toDate"
                            className="form-control"
                            value={report.toDate}
                            onChange={handleChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                      </div>

                      {/* Company Name */}
                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="companyName">Company Name</label>
                          <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            className="form-control"
                            value={report.companyName}
                            onChange={handleChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                      </div>

                      {/* Industry Type */}
                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="industryType">Industry Type</label>
                          <input
                            type="text"
                            id="industryType"
                            name="industryType"
                            className="form-control"
                            value={report.industryType}
                            onChange={handleChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                      </div>

                      {/* Engineer Name */}
                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="engineerName">Engineer Name</label>
                          <input
                            type="text"
                            id="engineerName"
                            name="engineerName"
                            className="form-control"
                            value={report.engineerName}
                            onChange={handleChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                      </div>

                      {/* Verified/Declined */}
                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="reportApproved">Verified/Declined</label>
                          <select
                            id="reportApproved"
                            name="reportApproved"
                            className="form-control"
                            value={report.reportApproved}
                            onChange={handleChange}
                            style={{ borderRadius: '10px' }}
                          >
                            <option value={true}>Verified</option>
                            <option value={false}>Declined</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Save Changes Button */}
                    <button type="submit" className="btn btn-success mb-2 mt-2">
                      Save Changes
                    </button>
                  </form>

                  <ToastContainer />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
        
        </div>
      </div>
    </div>
  );
};

export default EditReport;
