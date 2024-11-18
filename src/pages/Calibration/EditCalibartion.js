import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCalibrationById, editCalibration, updateCalibrationData } from '../../redux/features/calibration/calibrationSlice';

const EditCalibration = () => {
  const {userName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { calibrationData, loading, error } = useSelector(state => state.calibration);

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
      toast.success('Calibration Updated Successfully',);
      setTimeout(()=>{navigate('/calibration')},500)
     
    } catch (error) {
      console.error('Error in Updating Calibration', error);
      toast.error('Error in Updating Calibration');
      setTimeout(()=>{navigate('/calibration')},1000)
    }
  };

  const handleCancel = () => {
    navigate('/calibration');
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
              <h4 className="page-title">Control and Monitor Dashboard</h4>
              <div className="quick-link-wrapper w-100 d-md-flex flex-md-wrap">
                <ul className="quick-links ml-auto">
                  <li><a href="#">Settings</a></li>
                  <li><a href="#">Option 1</a></li>
                  <li><a href="#">option 2</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <form>
                  <div className="row">
                    <div className="col-12">
                      <h1>Calibration Edited by</h1>
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                      <label htmlFor="exampleFormControlInput5">User ID</label>
                      <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="User ID" name='adminID' value={calibrationData.adminID}  onChange={handleChange}/>
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                      <label htmlFor="exampleFormControlInput4">Date of Calibration Added</label>
                      <input
                        type="date"
                        className="input-field"
                        id="date"
                        name="dateOfCalibrationAdded"
                        value={calibrationData.dateOfCalibrationAdded}
                        onChange={handleChange}
                        placeholder="Date of Calibration Added"
                      />
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                      <label htmlFor="exampleFormControlInput4">Time of Calibration Added</label>
                      <input
                        type="text"
                        className="input-field"
                        id="time"
                        name="timeOfCalibrationAdded"
                        value={calibrationData.timeOfCalibrationAdded}
                        onChange={handleChange}
                        placeholder="Time of Calibration Added"
                      />
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                      <label htmlFor="exampleFormControlInput5">User Name</label>
                      <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="User Name" name='adminName' value={calibrationData.adminName} onChange={handleChange}  />
                    </div>
                    <div className="col-12">
                      <h1>Edit Calibration Details</h1>
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                      <label htmlFor="exampleFormControlInput5">User ID</label>
                      <input
                        type="text"
                        className="input-field"
                        id="userName"
                        placeholder="Enter User ID"
                        name='userName'
                        onChange={handleChange}
                        value={calibrationData.userName}
                      />
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                      <label htmlFor="exampleFormControlInput4">Date of Calibration</label>
                      <input
                        type="date"
                        className="input-field"
                        id="date"
                        name='date'
                        onChange={handleChange}
                        value={calibrationData.date}
                        placeholder="Date of Calibration"
                      />
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                      <label htmlFor="exampleFormControlInput5">Equipment Name</label>
                      <input
                        type="text"
                        className="input-field"
                        id="equipmentName"
                        name='equipmentName'
                        onChange={handleChange}
                        value={calibrationData.equipmentName}
                        placeholder="Equipment Name"
                      />
                    </div>
                    <div className="col-12">
                      <h1>Results</h1>
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                      <label htmlFor="exampleFormControlInput6">Before</label>
                      <textarea
                        className="input-field"
                        id="before"
                        name='before'
                        onChange={handleChange}
                        value={calibrationData.before}
                        placeholder="Before"
                      />
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                      <label htmlFor="exampleFormControlInput6">After</label>
                      <textarea
                        className="input-field"
                        id="after"
                        name='after'
                        onChange={handleChange}
                        value={calibrationData.after}
                        placeholder="After"
                      />
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                      <label htmlFor="exampleFormControlInput6">Technician</label>
                      <input
                        type="text"
                        className="input-field"
                        id="technician"
                        name='technician'
                        onChange={handleChange}
                        value={calibrationData.technician}
                        placeholder="Technician Name"
                      />
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                      <label htmlFor="exampleFormControlInput6">Notes</label>
                      <textarea
                        className="input-field"
                        id="notes"
                        name='notes'
                        onChange={handleChange}
                        value={calibrationData.notes}
                        placeholder="Notes"
                      />
                    </div>
                    <div className="mt-4 mb-5 p-2">
                      <button type="submit" className="btn btn-primary mb-2" onClick={handleSaveCalibration}>Update Calibration</button>
                    </div>
                    <div className="mt-4 mb-5 p-2">
                      <button type="button" className="btn btn-danger mb-2" onClick={handleCancel}>Cancel</button>
                    </div>
                  </div>
                </form>
                <ToastContainer />
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="container-fluid clearfix">
          <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
            AquaBox Control and Monitor System
          </span>
          <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
            {" "}
            ©{" "}
            <a href="" target="_blank">
              Ebhoom Solutions LLP
            </a>{" "}
            2022
          </span>
        </div>
      </footer>
    </div>
  );
};

export default EditCalibration;
