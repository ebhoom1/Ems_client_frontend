import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';
import { fetchCalibrations, deleteCalibration } from './../../redux/features/calibration/calibrationSlice'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '../Layout/Layout';
import { fetchIotDataByUserName } from '../../redux/features/iotData/iotDataSlice';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import Maindashboard from '../Maindashboard/Maindashboard';

function ViewCalibration() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  // Get the selected user ID from Redux
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);

  const { userCalibrations, error } = useSelector(state => state.calibration);

  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [currentUserName, setCurrentUserName] = useState("KSPCB001");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');  // State to handle input value
  const [searchTerm, setSearchTerm] = useState('');    // State to store final search term on button click

  // Fetch calibration data based on selected user or search term
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

  // Fetch all calibrations when the component loads
  useEffect(() => {
    dispatch(fetchCalibrations());
  }, [dispatch]);

  // Check sessionStorage for stored selectedUserId
  useEffect(() => {
    const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve from sessionStorage
    const userName = storedUserId || selectedUserIdFromRedux || currentUserName;
    fetchData(userName); // Fetch data based on user ID
    if (storedUserId) {
      setCurrentUserName(storedUserId);  // Set the user ID to the current state if present
    }
  }, [selectedUserIdFromRedux, searchTerm, currentUserName, dispatch]);

  // Handle input change in search bar
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value); // Update searchQuery as user types
  };

  // Handle search button click
  const handleSearch = () => {
    setSearchTerm(searchQuery); // Set searchTerm when search button is clicked
  };

  // Filter calibrations based on the selected userId from sessionStorage or Redux
  const filteredCalibrations = userCalibrations.filter((calibration) => {
    // Get userId from session storage
    const storedUserId = sessionStorage.getItem('selectedUserId');
    const userIdToFilter = storedUserId || selectedUserIdFromRedux;

    // If there's a userId (either from sessionStorage or Redux), filter calibrations by that userId
    if (userIdToFilter) {
      return calibration.userName?.toLowerCase() === userIdToFilter.toLowerCase();
    }

    // If no specific user is selected, apply the search term filter
    return calibration.userName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleEdit = (calibrationId) => {
    navigate(`/edit-calibration/${calibrationId}`);  // Pass the calibration ID to the edit page
  };

  const handleDelete = async (calibrationId) => {
    if (window.confirm('Are you sure you want to delete this calibration?')) {
      try {
        await dispatch(deleteCalibration(calibrationId)).unwrap();
        toast.success('Deleted Successfully');
      } catch (error) {
        toast.error('Error deleting calibration');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {JSON.stringify(error)}</div>;
  }

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
                    <h1 className='text-center mt-3'>Previous Calibration Data</h1>
                  </div>
                  <div className="card last-trips-card mt-2" style={{ overflowX: 'scroll' }}>
                    <div className="card-body">
                      <table className="table table-borderless">
                        <thead>
                          <tr>
                            <th className='custom-width'>Date Of Calibration Added</th>
                            <th className='custom-width'>Time of Calibration Added</th>
                            <th className='custom-width'>User ID of Admin</th>
                            <th className='custom-width'>Admin Name</th>
                            <th className='custom-width'>Date of Calibration</th>
                            <th className='custom-width'>User ID</th>
                            <th className='custom-width'>Model Name</th>
                            <th className='custom-width'>Before</th>
                            <th className='custom-width'>After</th>
                            <th className='custom-width'>Technician</th>
                            <th className='custom-width'>Notes</th>
                            <th className='custom-width'>Edit</th>
                            <th className='custom-width'>Delete</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCalibrations.length > 0 ? (
                            filteredCalibrations.map((calibration, index) => (
                              <tr key={index}>
                                <td>{calibration.dateOfCalibrationAdded}</td>
                                <td>{calibration.timeOfCalibrationAdded}</td>
                                <td>{calibration.adminID}</td>
                                <td>{calibration.adminName}</td>
                                <td>{calibration.date}</td>
                                <td>{calibration.userName}</td>
                                <td>{calibration.equipmentName}</td>
                                <td>{calibration.before}</td>
                                <td>{calibration.after}</td>
                                <td>{calibration.technician}</td>
                                <td>{calibration.notes}</td>
                                <td>
                                <Link to={`/edit-calibration/${calibration.userName}`}>
    <button type="button" className="btn btn-primary mb-2"> Edit </button>
</Link>
                                </td>
                                <td>
                                  <button className='btn btn-danger' onClick={() => handleDelete(calibration._id)}>
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="12">No calibration data available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      <ToastContainer />
                    </div>
                  </div>
                </div>
              </div>

              <footer className="footer">
                <div className="container-fluid clearfix">
                  <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
                    Ebhoom Control and Monitor System <br />
                    ©{" "}
                    <a href="" target="_blank">
                      Ebhoom Solutions LLP
                    </a>{" "}
                    2023
                  </span>
                </div>
              </footer>
            </div>

      
      </div>
    </div>
  </div>
  );
}

export default ViewCalibration;
