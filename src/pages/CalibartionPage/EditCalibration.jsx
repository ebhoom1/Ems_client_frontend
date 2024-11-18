import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCalibrationById, editCalibration, updateCalibrationData } from '../../redux/features/calibration/calibrationSlice';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';

const EditCalibration = () => {
  const { userName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { calibrationData, loading, error } = useSelector((state) => state.calibration);

  useEffect(() => {
    dispatch(fetchCalibrationById(userName));
  }, [dispatch, userName]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    dispatch(updateCalibrationData({ [name]: value }));
  };

  const handleSaveCalibration = async (event) => {
    event.preventDefault();
    try {
      await dispatch(editCalibration({ userName, updatedData: calibrationData }));
      toast.success('Calibration Updated Successfully');
      setTimeout(() => {
        navigate('/view-calibration');
      }, 500);
    } catch (error) {
      console.error('Error in Updating Calibration', error);
      toast.error('Error in Updating Calibration');
      setTimeout(() => {
        navigate('/view-calibration');
      }, 3000);
    }
  };

  const handleCancel = () => {
    navigate('/view-calibration');
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
        <div className="col-lg-3 d-none d-lg-block ">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <Hedaer />
            </div>
          </div>
          <div className="row" style={{ overflowX: 'hidden' }}>
            <div className="col-12 col-md-12 grid-margin">
              <h1 className="text-center mt-5">Edit Calibration Added By</h1>
              <div className="card m-1">
                <div className="card-body">
                  <form onSubmit={handleSaveCalibration} className="m-5">
                    <div className="row">
                      {/* User ID */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">User ID</label>
                          <input
                            type="text"
                            name="adminID"
                            value={calibrationData.adminID || ''}
                            onChange={handleChange}
                            placeholder="User ID"
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>

                      {/* Date of Calibration Added */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">Date of Calibration Added</label>
                          <input
                            type="date"
                            name="dateOfCalibrationAdded"
                            value={calibrationData?.dateOfCalibrationAdded || ''}
                            onChange={handleChange}
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>

                      {/* Time of Calibration Added */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">Time of Calibration Added</label>
                          <input
                            type="text"
                            name="timeOfCalibrationAdded"
                            value={calibrationData?.timeOfCalibrationAdded || ''}
                            onChange={handleChange}
                            placeholder="Time"
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>

                      {/* User Name */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">User Name</label>
                          <input
                            type="text"
                            name="adminName"
                            value={calibrationData.adminName || ''}
                            onChange={handleChange}
                            placeholder="User Name"
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <h1 className="text-center">Edit Calibration Details</h1>

                      {/* User ID */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">User ID</label>
                          <input
                            type="text"
                            name="userName"
                            value={calibrationData?.userName || ''}
                            onChange={handleChange}
                            placeholder="Enter User ID"
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>

                      {/* Date */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">Date of Calibration</label>
                          <input
                            type="date"
                            name="date"
                            value={calibrationData?.date || ''}
                            onChange={handleChange}
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>

                      {/* Equipment Name */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">Equipment Name</label>
                          <input
                            type="text"
                            name="equipmentName"
                            value={calibrationData?.equipmentName || ''}
                            onChange={handleChange}
                            placeholder="Equipment Name"
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <h1 className="text-center">Results</h1>

                      {/* Before */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">Before</label>
                          <textarea
                            name="before"
                            value={calibrationData?.before || ''}
                            onChange={handleChange}
                            placeholder="Before"
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>

                      {/* After */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">After</label>
                          <textarea
                            name="after"
                            value={calibrationData?.after || ''}
                            onChange={handleChange}
                            placeholder="After"
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>

                      {/* Technician */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">Technician</label>
                          <input
                            type="text"
                            name="technician"
                            value={calibrationData?.technician || ''}
                            onChange={handleChange}
                            placeholder="Technician Name"
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">Notes</label>
                          <textarea
                            name="notes"
                            value={calibrationData?.notes || ''}
                            onChange={handleChange}
                            placeholder="Notes"
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit and Cancel Buttons */}
                    <button type="submit" className="btn btn-success" style={{ color: 'white' }}>
                      Update Calibration
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger ms-1"
                      onClick={handleCancel}
                      style={{ color: 'white' }}
                    >
                      Cancel
                    </button>
                    <ToastContainer position="top-right" autoClose={3000} />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCalibration;
