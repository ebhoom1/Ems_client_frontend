import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CalibrationContext } from '../CalibartionPage/CalibrationContext';  // Context to store the report data
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import FooterM from '../FooterMain/FooterM';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig'; // API Configuration
import HeaderSim from '../Header/HeaderSim';

const ReportCheck = () => {
    const location = useLocation();
    const { dateFrom, dateTo, industry, company, userName } = location.state || {};
    const [entries, setEntries] = useState([]);
    const [engineerName, setEngineerName] = useState('');
    const { addReport } = useContext(CalibrationContext);
    const navigate = useNavigate();

    // Fetch Exceeded Data
    useEffect(() => {
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

                setEntries(response.data.comments || []);
            } catch (error) {
                console.error('Error fetching exceed data:', error);
            }
        };

        if (dateFrom && dateTo && industry && company && userName) {
            fetchData();
        }
    }, [dateFrom, dateTo, industry, company, userName]);

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
                    setTimeout(() => { navigate("/view-report"); }, 1000);
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
                    <div>
                        <h3>Calibration Exceedence Data</h3>
                        <p><strong>Filter Parameters:</strong></p>
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

                    <div className="row">
                        <div className="col-12 col-md-12 grid-margin">
                            <div className="card m-1">
                                <div className="card-body">
                                    <h1 className="text-center mt-3">Validate Data</h1>
                                    <form className="m-5 p-5">
                                        <div className="row">
                                            {/* Displaying existing data */}
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
                                    {/* Buttons for submit */}
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
