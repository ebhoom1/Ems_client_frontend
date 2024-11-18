import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCalibrationData, updateTimeOfCalibrationAdded, addCalibration } from '../../redux/features/calibration/calibrationSlice';
import { fetchUser } from '../../redux/features/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import Maindashboard from '../Maindashboard/Maindashboard';
import './calibration.css'
const Calibration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { calibrationData, loading, error } = useSelector((state) => state.calibration);
  const { userData } = useSelector((state) => state.user);

  const validateUser = async () => {
    const response = await dispatch(fetchUser()).unwrap(); 
};

if (!userData) {
  validateUser();
}
  // Fetch user data
  useEffect(() => {
    if (!userData) {
      dispatch(fetchUser());
    }
  }, [dispatch, userData]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'time') {
      dispatch(updateTimeOfCalibrationAdded(value));
    } else {
      dispatch(updateCalibrationData({ [name]: value }));
    }
  };

  const handleCancel = () => {
    navigate('/view-calibration');
  };

  const handleSubmit =async(event)=>{
    try {
      event.preventDefault();

      if (calibrationData.date === '') {
        toast.warning('Please add the date', { position: 'top-center' });
    } else if (calibrationData.equipmentName === '') {
        toast.warning('Please add the equipment Name', { position: 'top-center' });
    } else if (calibrationData.before === '') {
        toast.warning('Please add the before', { position: 'top-center' });
    } else if (calibrationData.after === '') {
        toast.warning('Please add the after', { position: 'top-center' });
    } else if (calibrationData.technician === '') {
        toast.warning('Please add the technician', { position: 'top-center' });
    } else {
        let calibrationDataToSend ={
          ...calibrationData,
          adminID:userData.userName,
          adminName:userData.fname,
        }
       await dispatch(addCalibration(calibrationDataToSend)).unwrap();
        toast.success( `The Calibration Added Successfully`, { position: 'top-right' })
        setTimeout(() => navigate('/view-calibration'), 3000);

      }
    } catch (error) {
      console.log(error);
      toast.error('An error occurred. Please try again.',error, );
      setTimeout(()=>{navigate('/view-calibration')},1000)
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error... {error}</div>;
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
       <div className="row" >
            <div className="col-12 col-md-12 grid-margin">
              <h1 className="text-center mt-5">Calibration Added By</h1>
              <div className="card m-1">
                <div className="card-body ">
                  <form onSubmit={handleSubmit} className=" calibcard">
                    <div className="row">
                      {/* User ID */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">User ID</label>
                          <input
                            type="text"
                            name="userName"
                            value={userData?.validUserOne?.userName || ''}
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                            name="fname"
                            value={userData?.validUserOne?.fname || ''}
                            onChange={handleInputChange}
                            placeholder="User Name"
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <h1 className="text-center">Add Calibration Details</h1>
                      {/* Model Name */}


                    {/*   <div className="col-lg-6 col-md-6 mb-4">
                            <label htmlFor="exampleFormControlInput5">User ID</label>
                            <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="User ID" name='userName' value= {calibrationData.userName}  onChange={handleInputChange}
                              style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                            /> */}
                            

                         {/*  </div> */}
                         <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">User ID</label>
                          <input
                            type="text"
                            name="userName"
                            value= {calibrationData.userName}
                            onChange={handleInputChange}
                            placeholder="User ID"
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>



                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">Model Name</label>
                          <input
                            type="text"
                            name="equipmentName"
                            value={calibrationData?.equipmentName || ''}
                            onChange={handleInputChange}
                            placeholder="Model Name"
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
                            onChange={handleInputChange}
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>
<h1 className='text-center'>Results</h1>
                      {/* Before */}
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label className="form-label">Before</label>
                          <textarea
                            name="before"
                            value={calibrationData?.before || ''}
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
                            placeholder="Notes"
                            className="form-control"
                            style={{ padding: '15px', borderRadius: '10px', border: 'none' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit and Cancel Buttons */}
                    <button type="submit" className="btn btn-success" style={{ color: 'white' }} onClick={handleSubmit} >
                      Add Calibration
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

export default Calibration;
