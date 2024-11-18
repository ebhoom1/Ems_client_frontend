import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from "react-redux";
import { fetchIotDataByUserName } from '../../redux/features/iotData/iotDataSlice';
import './viewreport.css';
import Hedaer from '../Header/Hedaer';
import DashboardSam from '../Dashboard/DashboardSam';
import Maindashboard from '../Maindashboard/Maindashboard';

const ViewReport = () => {
  const dispatch = useDispatch();
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const [loading, setLoading] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("KSPCB001");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [userType, setUserType] = useState('');
  const [noReportMessage, setNoReportMessage] = useState(''); 
  const [dataLoaded, setDataLoaded] = useState(false);

  const navigate = useNavigate();

  // Fetch all reports and user type on component mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('userdatatoken');
        const userResponse = await axios.get(`${API_URL}/api/validuser`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        });
        const userData = userResponse.data;
  
        if (userData.status === 401 || !userData.validUserOne) {
          navigate('/');
        } else {
          console.log('user verified');
          
          setUserType(userData.validUserOne.userType);
          setDataLoaded(true);
          const storedUserId = sessionStorage.getItem('selectedUserId') || null;
  
          // Fetch all reports for admin or individual user reports based on userType
          if (userData.validUserOne.userType === 'admin') {
            const response = await axios.get(`${API_URL}/api/get-all-report`);
            const allReports = response.data.report;
  
            if (storedUserId) {
              // Filter reports by storedUserId if available
              const filteredByUserId = allReports.filter((report) =>
                report.userName?.toLowerCase() === storedUserId.toLowerCase()
              );
  
              if (filteredByUserId.length > 0) {
                setReports(filteredByUserId);
                setFilteredReports(filteredByUserId);
              } else {
                setNoReportMessage('No reports found for the selected user.');
              }
            } else {
              // Show all reports if no storedUserId is found
              if (allReports.length > 0) {
                setReports(allReports);
                setFilteredReports(allReports);
              } else {
                setNoReportMessage('No reports available.');
              }
            }
          } else {
            try {
              const response = await axios.get(`${API_URL}/api/get-a-report/${userData.validUserOne.userName}`);
              const userReports = response.data.reports || [];
  
              if (userReports.length > 0) {
                setReports(userReports);
                setFilteredReports(userReports);
              } else {
                setNoReportMessage('No report generated for this user.');
              }
            } catch (error) {
              if (error.response && error.response.status === 404) {
                setNoReportMessage('No report generated for this user.');
              } else {
                console.error('Error fetching user reports:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching reports or validating user:', error);
        navigate('/');
      }
    };
  
    fetchReports();
  }, [navigate, currentUserName]);
  

  // Delete report functionality
  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await axios.delete(`${API_URL}/api/delete-report/${reportId}`);
        setReports(reports.filter((report) => report._id !== reportId));
        setFilteredReports(filteredReports.filter((report) => report._id !== reportId));
        toast.success('Report deleted successfully');
      } catch (error) {
        console.error('Error deleting report:', error);
        toast.error('Error deleting report');
      }
    }
  };

  // Download report functionality
  const handleDownload = async (reportId, format) => {
    try {
      const response = await axios.get(`${API_URL}/api/report-download/${format}/${reportId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `report.${format}`;
      link.click();
    } catch (error) {
      console.error(`Error downloading report as ${format}:`, error);
      toast.error(`Error downloading report as ${format}`);
    }
  };

  // Edit report functionality
  const handleEdit = (report) => {
    navigate(`/edit-report/${report._id}`, { state: { report } });
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
       <div className="container-fluid water">
              <div className="row">
                <div className="col-12 col-md-12 grid-margin">
                  <div className="col-12 d-flex justify-content-between align-items-center m-3">
                    <h1 className="text-center mt-5">Report</h1>
                  </div>
                  <div className="card last-trips-card mt-2" style={{ overflowX: 'scroll' }}>
                    <div className="card-body">
                      <table className="table table-borderless">
                        <thead>
                          <tr>
                            <th>Sl No</th>
                            <th>From Date</th>
                            <th>To Date</th>
                            <th>Username</th>
                            <th className="custom-width">Company Name</th>
                            <th className="custom-width">Station Name</th>
                            <th className="custom-width">Industry Type</th>
                            <th className="custom-width">Engineer Name</th>
                            <th>Verified/Declined</th>
                            <th>View</th>
                            {userType === 'admin' && <th>Edit</th>}
                            {userType === 'admin' && <th>Delete</th>}
                            <th>Download</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReports && filteredReports.length > 0 ? (
                            filteredReports.map((report, index) => (
                              <tr key={index}>
                                <td className="customwidth">{index + 1}</td>
                                <td className="fw-bold custom-width">{report.fromDate}</td>
                                <td className="custom-width">{report.toDate}</td>
                                <td className="custom-width">{report.userName}</td>
                                <td className="custom-width">{report.companyName}</td>
                                <td className="custom-width">{report.stackName}</td>
                                <td className="custom-width">{report.industryType}</td>
                                <td className="custom-width">{report.engineerName}</td>
                                <td className={report.reportApproved ? 'text-success' : 'text-danger'}>
                                  {report.reportApproved ? 'Verified' : 'Declined'}
                                </td>
                                <td className="customwidth">
                                  <Link to={`/view-report/${report.userName}`}>
                                    <button type="button" className="btn btn-primary mb-2">
                                      View
                                    </button>
                                  </Link>
                                </td>
                                {userType === 'admin' && (
                                  <td className="customwidth">
                                    <Link to={`/edit-report/${report.userName}`}>
                                      <button type="button" className="btn btn-warning mb-2">
                                        Edit
                                      </button>
                                    </Link>
                                  </td>
                                )}
                                {userType === 'admin' && (
                                  <td className="customwidth">
                                    <button className="btn btn-danger" onClick={() => handleDelete(report._id)}>
                                      Delete
                                    </button>
                                  </td>
                                )}
                                <td className="customwidth">
                                  <select
                                    className="btn btn-outline-success"
                                    onChange={(e) => handleDownload(report._id, e.target.value)}
                                  >
                                    <option>Download</option>
                                    <option value="pdf">PDF</option>
                                    <option value="csv">CSV</option>
                                  </select>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="12" className="text-center">
                                No reports available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <ToastContainer />
            </div>


          
        </div>
      </div>
    </div>
  );
};

export default ViewReport;
