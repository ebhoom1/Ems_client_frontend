import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { API_URL } from '../../utils/apiConfig';
import DashboardSam from '../Dashboard/DashboardSam'; // Assuming Sidebar
import Hedaer from '../Header/Hedaer'; // Assuming Header
import HeaderSim from '../Header/HeaderSim';

const ViewReportUser = () => {
  const { userName } = useParams(); // Get the userName from the route parameters
  const [report, setReport] = useState(null); // State to hold the report details

  // Fetch the report when the component mounts
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

  // Show a loading indicator while the report is being fetched
  if (!report) {
    return <div>Loading... </div>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 d-none d-lg-block">
         <DashboardSam/>
        </div>

        {/* Main content */}
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
             <HeaderSim/>
            </div>
          </div>

          {/* Page Title */}
        {/*   <div className="row page-title-header">
            <div className="col-12">
              <div className="page-header">
                <h4 className="page-title">Report Dashboard</h4>
                <div className="quick-link-wrapper w-100 d-md-flex flex-md-wrap">
                  <ul className="quick-links ml-auto">
                    <li><a href="#">Settings</a></li>
                    <li><a href="#">Option 1</a></li>
                    <li><a href="#">Option 2</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div> */}

          {/* Report Details Section */}
          <div className="row">
            <div className="col-12 col-md-12 grid-margin">
              <div className="card m-1 mt-5">
                <div className="card-body">
                  <h1 className='text-center mt-3'>Report Details for {userName}</h1>
                  <div className="m-3 p-3">
                    <div className="row">
                      {/* From Date */}
                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label className='mb-2'><strong>From Date : </strong>{ report.fromDate}</label> <br />
                          <label className='mb-2'><strong>To Date : </strong>{ report.toDate}</label> <br />
                          <label className='mb-2'><strong>Username : </strong>{report.userName}</label> <br />
                          <label className='mb-2'><strong>Company Name : </strong>{report.companyName}</label> <br />
                          <label className='mb-2'><strong>Industry Type : </strong>{report.industryType}</label> <br />
                          <label className='mb-2'><strong>Engineer Name : </strong>{report.engineerName}</label> <br />
                          <label className='mb-2'><strong>Verified/Declined : </strong>{report.reportApproved ? 'Verified' : 'Declined'}</label>

                        </div>
                      </div>

                      {/* To Date */}
                     

                      {/* Username */}
                    

                      {/* Company Name */}
                     

                      {/* Industry Type */}
                     

                      {/* Engineer Name */}
                     

                      {/* Verified/Declined */}
                    
                    </div>

                    {/* Calibration Exceeds Table */}
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
                          {report.calibrationExceeds && report.calibrationExceeds.length > 0 ? (
                            report.calibrationExceeds.map((item, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.parameter}</td>
                                <td>{item.value}</td>
                                <td>{item.formattedDate}</td>
                                <td>{item.formattedTime}</td>
                                <td>{item.userRemarkComment || 'N/A'}</td>
                                <td>{item.adminRemarkComment || 'N/A'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center">No calibration exceed data available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
       
        </div>
      </div>
    </div>
  );
}

export default ViewReportUser;
