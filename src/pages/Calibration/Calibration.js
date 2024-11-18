import React, { useState,useEffect } from 'react'
import {useDispatch,useSelector} from 'react-redux';
import { updateCalibrationData,updateTimeOfCalibrationAdded, addCalibration} from '../../redux/features/calibration/calibrationSlice';
import { fetchUser } from '../../redux/features/user/userSlice';
import { Link,useNavigate  } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useForm } from "react-hook-form";
import CalibrationData from './Calibration-Data';
import axios from 'axios';



const Calibration = () => { 

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {calibrationData,loading,error} =useSelector((state)=>state.calibration);
  const {userData}=useSelector((state)=>state.user)

  const validateUser = async () => {
      const response = await dispatch(fetchUser()).unwrap(); 
  };

  if (!userData) {
    validateUser();
  }

  const handleInputChange =event =>{
    const {name,value} = event.target;
    if(name === 'time'){
      dispatch(updateTimeOfCalibrationAdded(value))
    }else{
      dispatch(updateCalibrationData({[name]:value}));
    }
  };
  const handleCancel = async()=>{
    navigate('/calibration')
  }

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
        dispatch(addCalibration(calibrationDataToSend));
        toast.success( `The Calibration Added Successfully`)
        setTimeout(()=>{navigate('/calibration')},500)
      }
    } catch (error) {
      console.log(error);
      toast.error('An error occurred. Please try again.',error, );
      setTimeout(()=>{navigate('/calibration')},1000)
    }
  }
if(loading){
  return <div>Loading...</div>

}
if(error){
 return <div>Error...{error}</div>

}
    return (
      <div className="main-panel">
        <div className="content-wrapper">
          {/* <!-- Page Title Header Starts--> */}
          <div className="row page-title-header">
            <div className="col-12">
              <div className="page-header">
                <h4 className="page-title">Control and Monitor Dashboard</h4>
                <div className="quick-link-wrapper w-100 d-md-flex flex-md-wrap">
                  {/* <!-- <ul className="quick-links">
                <li><a href="#">option 1</a></li>
                <li><a href="#">Own analysis</a></li>
                <li><a href="#"> data</a></li>
              </ul> --> */}
                  <ul className="quick-links ml-auto">
                    <li>
                      <a href="#">Settings</a>
                    </li>
                    <li>
                      <a href="#">Option 1</a>
                    </li>
                    <li>
                      <a href="#">option 2</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* <!-- Page Title Header Ends--> */}

          <div className="row">
            <div className="col-md-12 grid-margin">
              <div className="card">
                <div className="card-body ">
                      
                     
                <form >
                  
                      <div className="row">
                       
                          <div className="col-12">
                            <h1>Calibration Added by</h1>
                          </div>

                          <div className="col-12 col-lg-6 col-md-6 mb-3">
                                            <label htmlFor="exampleFormControlInput5">User ID</label>
                                            <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Equipment Name" name='userName' value={userData.validUserOne && userData.validUserOne.userName} onChange={handleInputChange} />
                                        </div>

                          <div className="col-12 col-lg-6 col-md-6 mb-3">
                            <label htmlFor="exampleFormControlInput4">Date of Calibration Added</label>
                            <input type="date" 
                            className="input-field" 
                            id="date" 
                            name='date'
                            value={calibrationData.dateOfCalibrationAdded}
                            onChange={handleInputChange}
                            placeholder="Date of Calibration" 
                           />
                           
                          </div>
                          
                          <div className="col-12 col-lg-6 col-md-6 mb-3">
                              <label htmlFor="exampleFormControlInput4">Time of Calibration Added</label>
                              <input type="text" className="input-field" id="time" name='time' value={calibrationData.timeOfCalibrationAdded} onChange={handleInputChange} placeholder="time of Calibration" />
                          </div>
                          <div className="col-12 col-lg-6 col-md-6 mb-3">
                              <label htmlFor="exampleFormControlInput5">User Name</label>
                              <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="User Name" name='fname' value= { userData.validUserOne && userData.validUserOne.fname} onChange={handleInputChange} 
                            />   
                          </div>
                          
                          <div className="col-12">
                            <h1>Add Calibration Details</h1>
                             {/* <h1>Update User</h1> */}
                          </div>

                          <div className="col-12 col-lg-6 col-md-6 mb-3">
                            <label htmlFor="exampleFormControlInput5">User ID</label>
                            <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="User ID" name='userName' value= {CalibrationData.userName}  onChange={handleInputChange}
                            />
                            
                          </div>

                          <div className="col-12 col-lg-6 col-md-6 mb-3">
                            <label htmlFor="exampleFormControlInput4">Date of Calibration</label>
                            <input type="date" 
                            className="input-field" 
                            id="date" 
                            name='date'
                            value={calibrationData.date}
                            onChange={handleInputChange}
                            placeholder="Date of Calibration" 
                           />
                            {/* <span className="error">Subscription Date required</span> */}
                          </div>
                          
                          

                          <div className="col-12 col-lg-6 col-md-6 mb-3">
                            <label htmlFor="exampleFormControlInput5">Model Name</label>
                            <input 
                            type="text" 
                            className="input-field" 
                            id="ModelName"
                            name='equipmentName'
                            value={calibrationData.equipmentName}
                            onChange={handleInputChange} 
                            placeholder="Equipment Name"
                            />
                         
                          </div>
                          <div className="col-12">
                            <h1>Results</h1>
                             {/* <h1>Update User</h1> */}
                          </div>
                          <div className="col-12 col-lg-6 col-md-6 mb-3">
                            <label htmlFor="exampleFormControlInput6">Before</label>
                            <textarea 
                            type="text" 
                            className="input-field" 
                            id="before"
                            name='before' 
                            value={calibrationData.before}
                            onChange={handleInputChange}
                            placeholder="Before" 
                            />
                            
                          </div>
                          <div className="col-12 col-lg-6 col-md-6 mb-3">
                            <label htmlFor="exampleFormControlInput6">After</label>
                            <textarea 
                            type="text" 
                            className="input-field" 
                            id="after"
                            name='after'
                            value={calibrationData.after}
                            onChange={handleInputChange} 
                            placeholder="After" 
                            />
                            {/* <span className="error">State required</span>
                            <span className="error">Invalid State name</span>
                            <span className="error">Minimum 3 Characters required</span> */}
                          </div>
                          <div className="col-12 col-lg-6 col-md-6 mb-3">
                            <label htmlFor="exampleFormControlInput6">Technician</label>
                            <input 
                            type="text" 
                            className="input-field" 
                            id="technician"
                            name='technician' 
                            value={calibrationData.technician}
                            onChange={handleInputChange}
                            placeholder="Technician Name" 
                            />
                           
                          </div>
                          <div className="col-12 col-lg-6 col-md-6 mb-3">
                            <label htmlFor="exampleFormControlInput6">Notes</label>
                            <textarea 
                            type="text" 
                            className="input-field" 
                            id="notes"
                            name='notes'
                            value={calibrationData.notes}
                            onChange={handleInputChange} 
                            placeholder="Notes" 
                            />
                            {/* <span className="error">State required</span>
                            <span className="error">Invalid State name</span>
                            <span className="error">Minimum 3 Characters required</span> */}
                          </div>
                         
                          <div className="mt-4 mb-5 p-2">
                            <button type="submit" className="btn btn-primary mb-2"  onClick={handleSubmit}  > Add Calibration </button>
                          </div>
                          
                            <div className="mt-4 mb-5 p-2">
                            <button type="button"  className="btn btn-danger mb-2" onClick={handleCancel}> Cancel </button>
                            </div>
                            
                          
                      </div>
                  </form>
                 <ToastContainer/>
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
    )
}


export default Calibration;