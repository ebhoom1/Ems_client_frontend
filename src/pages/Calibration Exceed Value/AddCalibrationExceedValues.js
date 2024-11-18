import React, { useState, useEffect } from 'react';
import {useDispatch,useSelector} from 'react-redux';
import { fetchUser } from '../../redux/features/user/userSlice';
import {  addCalibrationExceedValue, setCurrentDateTime } from '../../redux/features/calibrationExceedValues/calibrationExceedValueSlice';
import { Link,useNavigate  } from 'react-router-dom';

import { ToastContainer,toast } from 'react-toastify'

const AddCalibrationExceedValues = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData, loading, error } = useSelector((state) => state.user);
  const { calibrationExceedValueData, currentDateTime } = useSelector((state) => state.calibrationExceedValue);

  const [formData, setFormData] = useState(calibrationExceedValueData);

  useEffect(() => {
      dispatch(setCurrentDateTime());
  }, [dispatch]);

  useEffect(() => {
      if (userData && currentDateTime) {
          setFormData((prevData) => ({
              ...prevData,
             adminUserName: userData.validUserOne.userName,
              adminName: userData.validUserOne.fname,
              dateOfCalibrationExceedValueAdded: currentDateTime.split('T')[0],
          }));
      }
  }, [userData, currentDateTime]);

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
          ...prevData,
          [name]: value
      }));
     
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          if(formData.userName === ''){
            toast.warning("Please add the UserName")
          }else if(formData.industryType === ""){
            toast.warning("Please add the Industry Type")
          }else{
            await dispatch(addCalibrationExceedValue(formData)).unwrap();
            toast.success("Parameter Threshold exceedance  Value Added Successfully!");
            setTimeout(()=>(navigate('/calibration-exceed-value')),500)
          }
        
      } catch (error) {
          toast.error(`Error: ${error.message}`);
      }
  };

  const handleCancel = () => {
      navigate('/calibration-exceed-value');
  };

  if (loading) {
      return <div>Loading...</div>
  }

  if (error) {
      return <div>Error...{error}</div>
  }
  const industryType=[
    {
      category:"Select"
    },
    {
      category:"Sugar"
    },
    {
      category:"Cement"
    },
    {
      category:"Distillery"
    },
    {
      category:"Petrochemical"
    },
    {
      category:"Plup & Paper"
    },
    {
      category:"Fertilizer"
    },
    {
      category:"Tannery"
    },
    {
      category:"Pecticides"
    },
    {
      category:"Thermal Power Station"
    },
    {
      category:"Caustic Soda"
    },
    {
      category:"Pharmaceuticals"
    },
    {
      category:"Dye and Dye Stuff"
    },
    {
      category:"Refinery"
    },
    {
      category:"Copper Smelter"
    },
    {
      category:"Iron and Steel"
    },
    {
      category:"Zinc Smelter"
    },
    {
      category:"Aluminium"
    },
    {
      category:"STP/ETP"
    },
    {
      category:"NWMS/SWMS"
    },
    {
      category:"Noise"
    },
    {
      category:"Zinc Smelter"
    },
    {
      category:"Other"
    },
    {
      category:"Admin"
    },
  
  ]
  return (
    <div className="main-panel">
    <div className="content-wrapper">
      {/* <!-- Page Title Header Starts--> */}
      <div className="row page-title-header">
        <div className="col-12">
          <div className="page-header">
            <h4 className="page-title">Add Parameter Thershold Exceedance Values </h4>
            <div className="quick-link-wrapper w-100 d-md-flex flex-md-wrap">
              
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
                        <h1>Parameter Threshold exceedance  Value Added by</h1>
                      </div>

                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Admin User ID</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" name='adminUserName' value= { userData.validUserOne && userData.validUserOne.userName}  
                        />   
                      </div>

                      <div className="col-12 col-lg-6 col-md-6 mb-3 ">
                        <label htmlFor="exampleFormControlInput4">Date of Parameter Threshold exceedance  value  Added</label>
                        <input type="date" 
                        className="input-field" 
                        id="dateOfCalibrationExceedValueAdde" 
                        name='date'
                        value={formData.dateOfCalibrationExceedValueAdded}
                      
                       />
                       
                      </div>
                      
                      
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Admin User Name</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="User Name" name='adminName' value= { userData.validUserOne && userData.validUserOne.fname}  
                        />   
                      </div>
                      
                      <div className="col-12">
                        <h1>Add Parameter Threshold exceedance  Values Details</h1>
                         {/* <h1>Update User</h1> */}
                      </div>

                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                        <label htmlFor="exampleFormControlInput5">User ID</label>
                        <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="User ID" name='userName' value={formData.userName}  onChange={handleInputChange}
                        />
                        
                      </div>

                  
                      
                      

                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                        <label htmlFor="exampleFormControlInput5">Product ID</label>
                        <input 
                        type="text" 
                        className="input-field" 
                        id="product_id"
                        name='product_id'
                        value={formData.product_id}
                        onChange={handleInputChange} 
                        placeholder="Product ID"
                        />
                     
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                              <label htmlFor="exampleFormControlInput5">Industry Type</label>
                              
                                <select 
                                className="input-field" 
                                id='industryType'
                                name='industryType'
                                value={formData.industryType}
                                onChange={handleInputChange}
                                >

                                {industryType.map((item)=>(
                                <option value={item.category}>{item.category}</option>
                                ))}
                              </select>
                             
                          </div>
                      <div className="col-12">
                        <h1>Values</h1>
                         {/* <h1>Update User</h1> */}
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">pH - Above</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="pH" name='phAbove' value={formData.phAbove} onChange={handleInputChange}   
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">pH - Below</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="pH" name='phBelow' value={formData.phBelow} onChange={handleInputChange}   
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">TDS</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="TDS" name='TDS' value={formData.TDS} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Turbidity</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Turbidity" name='turbidity' value={formData.turbidity} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Temprature</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Temprature" name='temperature' value={formData.temperature} onChange={handleInputChange} 
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">BOD</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="BOD" name='BOD' value={formData.BOD} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">COD</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="COD" name='COD' value={formData.COD} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">TSS</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="TSS" name='TSS' value={formData.TSS} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">ORP</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="ORP" name='ORP' value={formData.ORP} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Nitrate</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Nitrate" name='nitrate' value={formData.nitrate} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Ammonical Nitrogen</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Ammonical Nitrogen" name='ammonicalNitrogen' value={formData.ammonicalNitrogen} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">DO</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="DO" name='DO' value={formData.DO} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Chloride</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Chloride" name='chloride' value={formData.chloride} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Flow</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Flow" name='Flow' value={formData.Flow} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">CO</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="CO" name='CO' value={formData.CO} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">NOX</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="NOX" name='NOX' value={formData.Flow} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Pressure</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Pressure" name='Pressure' value={formData.Flow} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">PM</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="PM" name='PM' value={formData.PM} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">SO2</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="SO2" name='SO2' value={formData.SO2} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">NO2</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="NO2" name='NO2' value={formData.NO2} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Mercury</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Mercury" name='Mercury' value={formData.Mercury} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">PM 10</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="PM 10" name='PM10' value={formData.PM10} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">PM 2.5</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="PM 2.5" name='PM25' value={formData.PM25} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">NOH</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="NOH" name='NOH' value={formData.NOH} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">NH3</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="NH3" name='NH3' value={formData.NH3} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Wind Speed</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Wind Speed" name='WindSpeed' value={formData.WindSpeed} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Wind Direction</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Wind Direction" name='WindDir' value={formData.WindDir} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Air Temperature</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Air Temperature" name='AirTemperature' value={formData.AirTemperature} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Humidity</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Humidity" name='Humidity' value={formData.Humidity} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Solar Radiation</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Solar Radiation" name='solarRadiation' value={formData.solarRadiation} onChange={handleInputChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">DB</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="DB" name='DB' value={formData.DB} onChange={handleInputChange}  
                        />   
                      </div>
                     
                      <div className="mt-4 mb-5 p-2">
                        <button type="submit" className="btn btn-primary mb-2" onClick={handleSubmit}   > Add Calibration </button>
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

export default AddCalibrationExceedValues
