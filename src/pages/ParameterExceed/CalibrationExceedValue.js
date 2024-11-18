import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { fetchAllCalibrationExceedValues, deleteCalibrationExceedValue } from '../../redux/features/calibrationExceedValues/calibrationExceedValueSlice';

const CalibrationExceedValue = () => {
    const dispatch = useDispatch();
    const {allCalibrationExceedValues, loading, error } = useSelector(state => state.calibrationExceedValue);
    const [localCalibrationValues, setLocalCalibrationValues] = useState([]);
    useEffect(() => {
        dispatch(fetchAllCalibrationExceedValues());
    }, [dispatch]);
    useEffect(() => {
        if (allCalibrationExceedValues) {
            setLocalCalibrationValues(allCalibrationExceedValues);
        }
    }, [allCalibrationExceedValues]);
    const handleDelete = async (calibrationExceedvalueId) => {
        const shouldDelete = window.confirm('Are you sure you want to delete this Parameter Threshold exceedance  Value?');
        if (shouldDelete) {
            try {
                await dispatch(deleteCalibrationExceedValue(calibrationExceedvalueId)).unwrap();
                toast.success('Deleted Successfully');
                dispatch(fetchAllCalibrationExceedValues());
            } catch (error) {
                toast.error('Error deleting Parameter Threshold exceedance  value');
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
        <div className="main-panel">
            <div className="content-wrapper">
                <div className="row page-title-header">
                    <div className="col-12">
                        <div className="page-header">
                            <h4 className="page-title">Parameter Threshold exceedance  Values Dashboard</h4>
                            <p></p>
                            <div className="quick-link-wrapper w-100 d-md-flex flex-md-wrap">
                                <ul className="quick-links ml-auto"></ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mt-5">
                    <div className="col-12 col-md-4 grid-margin">
                        <Link to='/add-calibration-exceed-value'>
                            <div className="card">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-12">
                                            <h3 className="mb-3">Add New Parameter Threshold exceedance  Values</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="col-md-12">
                        <h2>Previous Parameter Threshold exceedance  Values  </h2>
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>User ID of Admin</th>
                                        <th>Admin Name</th>
                                        <th>User ID</th>
                                        <th>Product ID</th>
                                        <th>Industry Type</th>
                                        <th>pH - Above</th>
                                        <th>pH - Below</th>
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
                                <tbody>
                                {localCalibrationValues && localCalibrationValues.map((value, index) => (
                                        <tr key={index}>
                                            <td>{value.date}</td>
                                            <td>{value.adminUserName}</td>
                                            <td>{value.adminName}</td>
                                            <td>{value.userName}</td>
                                            <td>{value.product_id}</td>
                                            <td>{value.industryType}</td>
                                            <td>{value.phAbove}</td>
                                            <td>{value.phBelow}</td>
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
                                            <td><Link to={`/edit-calibration-exceed-value/${value.userName}`}><button type="button" className="btn btn-primary mb-2"> Edit </button></Link></td>
                                            <td><button type="button" className="btn btn-danger mb-2" onClick={() => handleDelete(value._id)}> Delete </button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <ToastContainer />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalibrationExceedValue;
