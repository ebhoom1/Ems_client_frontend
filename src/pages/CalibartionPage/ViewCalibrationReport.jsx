import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';
import { fetchCalibrations, deleteCalibration } from './../../redux/features/calibration/calibrationSlice'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchIotDataByUserName } from '../../redux/features/iotData/iotDataSlice';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import Maindashboard from '../Maindashboard/Maindashboard';

function ViewCalibrationReport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserName, setCurrentUserName] = useState('KSPCB001');
  const [companyName, setCompanyName] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const { userCalibrations } = useSelector(state => state.calibration);

  // Fetch calibration and IoT data concurrently
  useEffect(() => {
    const fetchDataConcurrently = async () => {
      setLoading(true);
      try {
        const [calibrationsResult, iotDataResult] = await Promise.all([
          dispatch(fetchCalibrations()).unwrap(),
          dispatch(fetchIotDataByUserName(currentUserName)).unwrap(),
        ]);
        setSearchResult(iotDataResult);
        setCompanyName(iotDataResult?.companyName || "Unknown Company");
      } catch (err) {
        setSearchResult(null);
        setCompanyName("Unknown Company");
      } finally {
        setLoading(false);
      }
    };

    const storedUserId = sessionStorage.getItem('selectedUserId');
    const userName = storedUserId || selectedUserIdFromRedux || currentUserName;
    setCurrentUserName(userName);
    fetchDataConcurrently();
  }, [dispatch, currentUserName, selectedUserIdFromRedux]);

  // Memoize filtered calibrations for performance
  const filteredCalibrations = useMemo(() => {
    const storedUserId = sessionStorage.getItem('selectedUserId');
    const userIdToFilter = storedUserId || selectedUserIdFromRedux;

    if (userIdToFilter) {
      return userCalibrations.filter(
        (calibration) => calibration.userName?.toLowerCase() === userIdToFilter.toLowerCase()
      );
    }
    return userCalibrations.filter((calibration) =>
      calibration.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userCalibrations, selectedUserIdFromRedux, searchTerm]);


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
            <Maindashboard />
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
                                <button
                                  className='btn btn-danger'
                                  onClick={() => handleDelete(calibration._id)}
                                >
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
                  © {" "}
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

export default ViewCalibrationReport;
