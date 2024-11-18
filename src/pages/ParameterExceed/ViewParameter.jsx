import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap'; // Import Button
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Toastify styles
import { fetchAllCalibrationExceedValues, deleteCalibrationExceedValue } from '../../redux/features/calibrationExceedValues/calibrationExceedValueSlice';
import DashboardSam from '../Dashboard/DashboardSam';
import HeaderSim from '../Header/HeaderSim';
import Maindashboard from '../Maindashboard/Maindashboard';
import Hedaer from '../Header/Hedaer';

function ViewParameter() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux state to get calibration exceed values
    const { allCalibrationExceedValues, loading, error } = useSelector(state => state.calibrationExceedValue);

    const [localCalibrationValues, setLocalCalibrationValues] = useState([]);
    const [filteredCalibrationValues, setFilteredCalibrationValues] = useState([]);
    const [currentUserName, setCurrentUserName] = useState('KSPCB001'); // Default user name
    const [searchQuery, setSearchQuery] = useState(''); // Search input state

    // Fetch all calibration exceed values when component loads
    useEffect(() => {
        dispatch(fetchAllCalibrationExceedValues());
    }, [dispatch]);

    // Set local state when calibration values are fetched
    useEffect(() => {
        if (allCalibrationExceedValues) {
            setLocalCalibrationValues(allCalibrationExceedValues);
            setFilteredCalibrationValues(allCalibrationExceedValues);
        }
    }, [allCalibrationExceedValues]);

    // Check for storedUserId in sessionStorage and filter data accordingly
    useEffect(() => {
        const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve from sessionStorage

        if (storedUserId) {
            setCurrentUserName(storedUserId); // Set stored user ID as current
            filterByUserName(storedUserId); // Filter data by user ID
        } else {
            setFilteredCalibrationValues(localCalibrationValues); // Show all values if no user ID is stored
        }
    }, [localCalibrationValues]);

    // Function to filter calibration exceed values by user ID
    const filterByUserName = (userName) => {
        const filteredValues = localCalibrationValues.filter(value =>
            value.userName?.toLowerCase() === userName.toLowerCase()
        );
        setFilteredCalibrationValues(filteredValues);
    };

    // Handle search input change
    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value); // Update search query
    };

    // Handle search button click
    const handleSearch = () => {
        if (searchQuery) {
            filterByUserName(searchQuery); // Filter data by search query
        } else {
            setFilteredCalibrationValues(localCalibrationValues); // Reset to all data if search query is empty
        }
    };

    // Handle adding a new parameter
    const handleParameter = () => {
        navigate('/add-parameter');
    };

    // Handle deleting a parameter exceedance value
    const handleDelete = async (calibrationExceedvalueId) => {
        const shouldDelete = window.confirm('Are you sure you want to delete this Parameter Threshold exceedance Value?');
        if (shouldDelete) {
            try {
                await dispatch(deleteCalibrationExceedValue(calibrationExceedvalueId)).unwrap();
                toast.success('Deleted Successfully');
                dispatch(fetchAllCalibrationExceedValues()); // Refresh the list
            } catch (error) {
                toast.error('Error deleting Parameter Threshold exceedance value');
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
         <div>
                        {/* Add Parameter Button */}
                        <div className="align-items-center justify-content-center d-flex mt-5 mb-4">
                            <Button onClick={handleParameter} className="p-3 btn parameterbtn align-items-center justify-content-center d-flex" style={{ border: 'none' }}>
                                Add Parameter Threshold exceedance Values
                            </Button>
                        </div>

                        {/* Table for Previous Parameter Threshold Exceedance Values */}
                        <div className="row mb-5">
                            <div className="col-12 col-md-12 grid-margin">
                                <div className="col-12 d-flex justify-content-between align-items-center m-3">
                                    <h1 className="text-center mt-3" style={{ justifyContent: 'center' }}>Previous Parameter Threshold exceedance Values</h1>
                                </div>
                                <div className="card last-trips-card mt-2" style={{ overflowX: 'scroll' }}>
                                   {/*  <div className="card-header p-3 pt-4 d-flex align-items-center search-container m-3">
                                        <input
                                            type="text"
                                            placeholder="Enter username"
                                            className="p-2 search-input"
                                            value={searchQuery}
                                            onChange={handleSearchInputChange}
                                            style={{ borderRadius: '10px' }}
                                        />
                                        <button className="btn btn-outline-primary ms-2 search-button" onClick={handleSearch}>
                                            Search
                                        </button>
                                    </div> */}
                                    <div className="card-body">
                                        <table className="table table-borderless">
                                            <thead className="m-5">
                                                <tr>
                                                    <th className='custom-width'>Date</th>
                                                    <th className='custom-width'>User ID of Admin</th>
                                                    <th className='custom-width'>Admin Name</th>
                                                    <th className='custom-width'>User ID</th>
                                                    <th className='custom-width'>Product ID</th>
                                                    <th className='custom-width'>Industry Type</th>
                                                    <th>pH - Below</th>
                                                    <th>pH - Above</th>
                                                    <th>TDS</th>
                                                    <th>Turbidity</th>
                                                    <th>Temperature</th>
                                                    <th>BOD</th>
                                                    <th>COD</th>
                                                    <th>TSS</th>
                                                    <th>ORP</th>
                                                    <th>Nitrate</th>
                                                    <th>Ammonical Nitrogen</th>
                                                    <th>DO</th>
                                                    <th>Chloride</th>
                                                    <th>PM</th>
                                                    <th>SO2</th>
                                                    <th>NO2</th>
                                                    <th>Mercury</th>
                                                    <th>PM 10</th>
                                                    <th>PM 2.5</th>
                                                    <th>NOH</th>
                                                    <th>NH3</th>
                                                    <th>Wind Speed</th>
                                                    <th>Wind Direction</th>
                                                    <th>Air Temperature</th>
                                                    <th>Humidity</th>
                                                    <th>Solar Radiation</th>
                                                    <th>DB</th>
                                                    <th>Edit</th>
                                                    <th>Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody className="m-5">
                                                {filteredCalibrationValues.length > 0 ? (
                                                    filteredCalibrationValues.map((value, index) => (
                                                        <tr key={index}>
                                                            <td>{value.date}</td>
                                                            <td>{value.adminUserName}</td>
                                                            <td>{value.adminName}</td>
                                                            <td>{value.userName}</td>
                                                            <td>{value.product_id}</td>
                                                            <td>{value.industryType}</td>
                                                            <td>{value.phBelow}</td>
                                                            <td>{value.phAbove}</td>
                                                            <td>{value.TDS}</td>
                                                            <td>{value.turbidity}</td>
                                                            <td>{value.temperature}</td>
                                                            <td>{value.BOD}</td>
                                                            <td>{value.COD}</td>
                                                            <td>{value.TSS}</td>
                                                            <td>{value.ORP}</td>
                                                            <td>{value.nitrate}</td>
                                                            <td>{value.ammonicalNitrogen}</td>
                                                            <td>{value.DO}</td>
                                                            <td>{value.chloride}</td>
                                                            <td>{value.PM}</td>
                                                            <td>{value.SO2}</td>
                                                            <td>{value.NO2}</td>
                                                            <td>{value.Mercury}</td>
                                                            <td>{value.PM10}</td>
                                                            <td>{value.PM25}</td>
                                                            <td>{value.NOH}</td>
                                                            <td>{value.NH3}</td>
                                                            <td>{value.WindSpeed}</td>
                                                            <td>{value.WindDir}</td>
                                                            <td>{value.AirTemperature}</td>
                                                            <td>{value.Humidity}</td>
                                                            <td>{value.solarRadiation}</td>
                                                            <td>{value.DB}</td>
                                                            <td>
                                                                <Link to={`/edit-parameter/${value.userName}`}>
                                                                    <button type="button" className="btn btn-primary mb-2"> Edit </button>
                                                                </Link>
                                                            </td>
                                                            <td>
                                                                <button type="button" className="btn btn-danger mb-2" onClick={() => handleDelete(value._id)}> Delete </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="35" className="text-center">No Parameter Threshold exceedance Values found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        <ToastContainer />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

  
  
            
          </div>
        </div>
      </div>
    );
}

export default ViewParameter;
