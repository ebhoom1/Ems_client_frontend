import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardSam from '../Dashboard/DashboardSam';
import FooterM from '../FooterMain/FooterM';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig'; // API Configuration
import HeaderSim from '../Header/HeaderSim';
import './viewreport.css';

const ReportCheck = () => {
    const location = useLocation();
    const { dateFrom, dateTo, industry, company, userName, stackName } = location.state || {};
    const [entries, setEntries] = useState([]);
    const [engineerName, setEngineerName] = useState('');
    const [page, setPage] = useState(1); // State to manage current page
    const [totalPages, setTotalPages] = useState(10); // State to manage total pages
    const navigate = useNavigate();
    const limit = 10; // Number of records per page

    // Fetch Exceeded Data
    const fetchData = async (currentPage) => {
        try {
            const response = await axios.get(`${API_URL}/api/user-exceed-data`, {
                params: {
                    userName: userName.trim(),
                    industryType: industry.trim(),
                    companyName: company.trim(),
                    stackName: stackName.trim(),
                    fromDate: dateFrom.trim(),
                    toDate: dateTo.trim(),
                    page: currentPage,
                    limit: limit,
                },
            });
            console.log("API Response:", response.data);
            setEntries(response.data.data || []); // Set current page data
            setTotalPages(response.data.totalPages || 10); // Set total pages if provided by API
        } catch (error) {
            console.error("Error fetching exceed data:", error);
            toast.error("Failed to fetch exceeded data");
        }
    };

    // Fetch data when the component mounts or when the page changes
    useEffect(() => {
        if (dateFrom && dateTo && industry && company && userName && stackName) {
            fetchData(page); // Fetch data for the current page
        }
    }, [page, dateFrom, dateTo, industry, company, userName, stackName]);

    // Handle Report Approval
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
                stackName: stackName.trim(),
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
                    setTimeout(() => { navigate("/manage-user"); }, 1000);
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

    // Pagination Handlers
    const handleNext = () => {
        if (page < totalPages) {
            setPage(page + 1); // Increment the page state
        }
    };

    const handlePrev = () => {
        if (page > 1) {
            setPage(page - 1); // Decrement the page state
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
                    <div className="row">
                        <div className="col-12">
                            <HeaderSim />
                        </div>
                    </div>
                    <div>
                        <h3>Calibration Exceedance Data</h3>
                        <p><strong>From Date:</strong> {dateFrom}</p>
                        <p><strong>To Date:</strong> {dateTo}</p>
                        <p><strong>Industry:</strong> {industry}</p>
                        <p><strong>Company:</strong> {company}</p>
                        <p><strong>User Name:</strong> {userName}</p>
                        <p><strong>Station Name:</strong> {stackName}</p>
                    </div>

                    <div className="custom-table-responsive">
  <table className="custom-table">
    <thead className="custom-table-header">
      <tr>
        <th>SI.No</th>
        <th>Stack Name</th>
        <th>Exceeded Parameter</th>
        <th>Exceeded Value</th>
        <th>Date</th>
        <th>Time</th>
        <th>User Remark Comment</th>
        <th>Admin Remark Comment</th>
      </tr>
    </thead>
    <tbody>
      {entries.length > 0 ? (
        entries.map((item, index) => (
          <tr key={index} className="custom-table-row">
            <td>{index + 1 + (page - 1) * limit}</td>
            <td>{item.stackName}</td>
            <td>{item.parameter}</td>
            <td>{item.value}</td>
            <td>{item.formattedDate}</td>
            <td>{item.formattedTime}</td>
            <td>{item.commentByUser || 'N/A'}</td>
            <td>{item.commentByAdmin || 'N/A'}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="8" className="text-center custom-no-data">
            No Exceedance Data Available
          </td>
        </tr>
      )}
    </tbody>
  </table>

  {/* Pagination Controls */}
  <div className="custom-pagination">
    <button
      className="btn btn-primary custom-pagination-button"
      onClick={handlePrev}
      disabled={page === 1}
    >
      <i className="fa-solid fa-arrow-left me-1"></i>Prev
    </button>
    <span className="custom-pagination-info">Page {page} </span>
    <button
      className="btn btn-primary custom-pagination-button"
      onClick={handleNext}
      disabled={page === totalPages}
    >
      Next <i className="fa-solid fa-arrow-right"></i>
    </button>
  </div>
</div>

               

                    <div className="row mt-4">
                        <div className="col-12 col-md-12 grid-margin">
                            <div className="card m-1">
                                <div className="card-body">
                                    <h1 className="text-center mt-3">Validate Data</h1>
                                    <form className="m-5 p-5">
                                        <div className="row">
                                            <div className="col-lg-6 mb-4">
                                                <div className="form-group">
                                                    <label><strong>From Date:</strong></label>
                                                    <input type="text" className="form-control" value={dateFrom} readOnly />
                                                </div>
                                            </div>
                                            <div className="col-lg-6 mb-4">
                                                <div className="form-group">
                                                    <label><strong>To Date:</strong></label>
                                                    <input type="text" className="form-control" value={dateTo} readOnly />
                                                </div>
                                            </div>
                                            <div className="col-lg-6 mb-4">
                                                <div className="form-group">
                                                    <label><strong>Industry:</strong></label>
                                                    <input type="text" className="form-control" value={industry} readOnly />
                                                </div>
                                            </div>
                                            <div className="col-lg-6 mb-4">
                                                <div className="form-group">
                                                    <label><strong>Company:</strong></label>
                                                    <input type="text" className="form-control" value={company} readOnly />
                                                </div>
                                            </div>
                                            <div className="col-lg-6 mb-4">
                                                <div className="form-group">
                                                    <label><strong>User Name:</strong></label>
                                                    <input type="text" className="form-control" value={userName} readOnly />
                                                </div>
                                            </div>
                                            <div className="col-lg-6 mb-4">
                                                <div className="form-group">
                                                    <label><strong>Engineer Name:</strong></label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={engineerName}
                                                        onChange={(e) => setEngineerName(e.target.value)}
                                                        placeholder="Enter engineer name"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={handleVerified}
                                    >
                                        Verified
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger ms-2"
                                        onClick={handleDenied}
                                    >
                                        Denied
                                    </button>
                                    <ToastContainer />
                                </div>
                            </div>
                        </div>
                    </div>
                    <FooterM />
                </div>
            </div>
        </div>
    );
};

export default ReportCheck;
