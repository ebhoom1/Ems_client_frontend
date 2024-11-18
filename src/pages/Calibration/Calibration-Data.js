import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { fetchCalibrations, deleteCalibration } from './../../redux/features/calibration/calibrationSlice';

const CalibrationData = () => {
  const dispatch = useDispatch();
  const { userCalibrations, loading, error } = useSelector(state => state.calibration);

  useEffect(() => {
    dispatch(fetchCalibrations());
  }, [dispatch]);

  const handleDelete = async (calibrationId) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this calibration?');
    if (shouldDelete) {
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
    <div className="main-panel">
      <div className="content-wrapper">
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Calibration DASHBOARD</h4>
              <p></p>
              <div className="quick-link-wrapper w-100 d-md-flex flex-md-wrap">
                <ul className="quick-links ml-auto"></ul>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-12 col-md-4 grid-margin">
            <Link to='/calibration-new'>
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-12">
                      <h3 className="mb-3">Add New Calibration</h3>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-12">
            <h2>Previous Calibration Data</h2>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Date Of Calibration Added</th>
                    <th>Time of Calibration Added</th>
                    <th>User ID of Admin</th>
                    <th>Admin Name</th>
                    <th>Date of Calibration</th>
                    <th>User ID</th>
                    <th>Model Name</th>
                    <th>Before</th>
                    <th>After</th>
                    <th>Technician</th>
                    <th>Notes</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {userCalibrations && userCalibrations.map((calibration, index) => (
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
                      <td><Link to={`/edit-calibration/${calibration.userName}`}><button type="button" className="btn btn-primary mb-2"> Edit </button></Link></td>
                      <td><button type="button" className="btn btn-danger mb-2" onClick={() => handleDelete(calibration._id)}> Delete </button></td>
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

export default CalibrationData;
