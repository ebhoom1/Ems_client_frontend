import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCalibrationExceedValueByUserId,
  editCalibrationExceedValue,
  updateCalibrationExceedValueData,
} from '../../redux/features/calibrationExceedValues/calibrationExceedValueSlice';
import { fetchUser } from "../../redux/features/user/userSlice";
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';

const EditParameter = () => {
  const { userName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { calibrationExceedValueData, loading, error, userCalibrationExceedValues } = useSelector((state) => state.calibrationExceedValue);
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const validateUser = async () => {
      await dispatch(fetchUser()).unwrap();
    };

    const fetchByUserId = async () => {
      await dispatch(fetchCalibrationExceedValueByUserId(userName)).unwrap();
    };

    if (!userData) {
      validateUser();
    }

    if (!userCalibrationExceedValues) {
      fetchByUserId();
    }
  }, [dispatch, userName, userData, userCalibrationExceedValues]);

  useEffect(() => {
    if (userCalibrationExceedValues) {
      dispatch(updateCalibrationExceedValueData(userCalibrationExceedValues));
    }
  }, [userCalibrationExceedValues, dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    dispatch(updateCalibrationExceedValueData({ [name]: value }));
  };

  const handleSaveCalibration = async (event) => {
    event.preventDefault();
    try {
      await dispatch(editCalibrationExceedValue({ userName, updateData: calibrationExceedValueData })).unwrap();
      toast.success('Calibration Updated Successfully', { position: "top-center" });
      setTimeout(() => navigate('/view-parameter'), 2000);
    } catch (error) {
      console.error('Error in Updating Calibration', error);
      toast.error('Error in Updating Calibration');
    }
  };

  const handleCancel = () => {
    navigate('/calibration-exceed-value');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {JSON.stringify(error)}</div>;
  }

  const industryType = [
    { category: "Select" },
    { category: "Sugar" },
    { category: "Cement" },
    { category: "Distillery" },
    { category: "Petrochemical" },
    { category: "Pulp & Paper" },
    { category: "Fertilizer" },
    { category: "Tannery" },
    { category: "Pesticides" },
    { category: "Thermal Power Station" },
    { category: "Caustic Soda" },
    { category: "Pharmaceuticals" },
    { category: "Dye and Dye Stuff" },
    { category: "Refinery" },
    { category: "Copper Smelter" },
    { category: "Iron and Steel" },
    { category: "Zinc Smelter" },
    { category: "Aluminium" },
    { category: "STP/ETP" },
    { category: "NWMS/SWMS" },
    { category: "Noise" },
    { category: "Other" },
    { category: "Admin" },
  ];

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>

        {/* Main content */}
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <Hedaer />
            </div>
          </div>
          <div className="main-panel">
      <div className="content-wrapper">
     {/*    <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Control and Monitor Dashboard</h4>
              <div className="quick-link-wrapper w-100 d-md-flex flex-md-wrap">
                <ul className="quick-links ml-auto">
                  <li><a href="#">Settings</a></li>
                  <li><a href="#">Option 1</a></li>
                  <li><a href="#">Option 2</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div> */}
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <form>
                  <div className="row">
                    <div className="col-12">
                      <h2 className='text-center mb-5' >Calibration Edited by</h2>
                    </div>
                    <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="date">Date of Parameter Threshold exceedance Value Added</label>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            className="form-control"
                            value={calibrationExceedValueData.date}
                            onChange={handleChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="adminName">Admin User Name</label>
                          <input
                            type="text"
                            id="adminName"
                            name="adminName"
                            className="form-control"
                            value={userData?.validUserOne?.userName || ''}
                            style={{ borderRadius: '10px' }}
                            readOnly
                          />
                        </div>
                      </div>
                    <div className="col-12 mb-5">
                      <h2 className='text-center mt-5'>Edit Parameter Threshold exceedance  Values Details</h2>
                    </div>
                    <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="userName">User ID</label>
                          <input
                            type="text"
                            id="userName"
                            name="userName"
                            className="form-control"
                            value={calibrationExceedValueData.userName}
                            onChange={handleChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                      </div>
                    
                    <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="product_id">Product ID</label>
                          <input
                            type="text"
                            id="product_id"
                            name="product_id"
                            className="form-control"
                            value={calibrationExceedValueData.product_id}
                            onChange={handleChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 mb-4">
                        <div className="form-group">
                          <label htmlFor="industryType">Industry Type</label>
                          <select
                            id="industryType"
                            name="industryType"
                            className="form-control"
                            value={calibrationExceedValueData.industryType}
                            onChange={handleChange}
                            style={{ borderRadius: '10px' }}
                          >
                            {industryType.map((item) => (
                              <option key={item.category} value={item.category}>
                                {item.category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                     

                     
                          <div className="col-12">
                        <h1>Values</h1>
                      </div>
                      <div className="row">
                        {/* Input fields for various values */}
                        <div className="col-lg-4 col-md-6 mb-1">
                          <div className="input-container">

                            <input 
                              type="text" 
                              id="phAbove" 
                              name="phAbove" 
                              value={calibrationExceedValueData.phAbove} onChange={handleChange} 
                              placeholder=" " 
                              
                               
                            />
                                                        <label htmlFor="phBelow">pH-Above</label>

                            </div>
                            </div>

                            <div className="col-lg-4 col-md-6 mb-1">
                          <div className="input-container">
                            <input 
                              type="text" 
                              id="phBelow" 
                              name="phBelow" 
                              value={calibrationExceedValueData.phBelow} onChange={handleChange}   
                              placeholder=" " 
                               
                            />
                            <label htmlFor="phBelow">pH-Below</label>
                          </div>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-1">
                          <div className="input-container">
                            <input 
                              type="text" 
                              id="TDS" 
                              name="TDS" 
                              value={calibrationExceedValueData.TDS} onChange={handleChange}  
                              placeholder=" " 
                               
                            />
                            <label htmlFor="TDS">TDS</label>
                          </div>
                        </div>
                       
                        <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="turbidity" name="turbidity" placeholder=" "
                                value={calibrationExceedValueData.turbidity} onChange={handleChange}      
                             />
                                <label for="turbidity">Turbidity</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="temperature" value={calibrationExceedValueData.temperature} onChange={handleChange}  name="temperature" placeholder=" "  />
    <label for="temperature">Temperature</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="bod" name="BOD" value={calibrationExceedValueData.BOD} onChange={handleChange}  placeholder=" "  />
    <label for="bod">BOD</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="cod" name="COD" value={calibrationExceedValueData.COD} onChange={handleChange}  placeholder=" "  />
    <label for="cod">COD</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="tss" name="TSS" value={calibrationExceedValueData.TSS} onChange={handleChange}  placeholder=" "  />
    <label for="tss">TSS</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="orp" name="ORP" placeholder=" " value={calibrationExceedValueData.ORP} onChange={handleChange}   />
    <label for="orp">ORP</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="nitrate" name="nitrate" placeholder=" " value={calibrationExceedValueData.nitrate} onChange={handleChange}    />
    <label for="nitrate">Nitrate</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="ammonical-nitrogen" name="ammonicalNitrogen" value={calibrationExceedValueData.ammonicalNitrogen} onChange={handleChange} placeholder=" "  />
    <label for="ammonical-nitrogen">Ammonical Nitrogen</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="do" name="DO" placeholder=" "  value={calibrationExceedValueData.DO} onChange={handleChange}   />
    <label for="do">DO</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="chloride" name="chloride" placeholder=" "   value={calibrationExceedValueData.chloride} onChange={handleChange}  />
    <label for="chloride">Chloride</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="flow" name="Flow" placeholder=" " value={calibrationExceedValueData.Flow} onChange={handleChange}   />
    <label for="flow">Flow</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="co" name="CO" placeholder=" "   value={calibrationExceedValueData.CO} onChange={handleChange}   />
    <label for="co">CO</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="nox" name="NOX" placeholder=" "  value={calibrationExceedValueData.NOX} onChange={handleChange}   />
    <label for="nox">NOX</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="pressure" name="Pressure" placeholder=" "  value={calibrationExceedValueData.Pressure} onChange={handleChange}/>
    <label for="pressure">Pressure</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="pm" name="PM" placeholder=" " value={calibrationExceedValueData.PM} onChange={handleChange}  />
    <label for="pm">PM</label>
  </div>
</div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="so2" name="SO2" placeholder=" "   value={calibrationExceedValueData.SO2} onChange={handleChange}  />
                                <label for="so2">SO2</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="no2" name="NO2" placeholder=" "  value={calibrationExceedValueData.NO2} onChange={handleChange}  />
                                <label for="no2">NO2</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="mercury" name="Mercury" placeholder=" " value={calibrationExceedValueData.Mercury} onChange={handleChange}   />
                                <label for="mercury">Mercury</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="pm10" name="PM10" placeholder=" "  value={calibrationExceedValueData.PM10} onChange={handleChange}  />
                                <label for="pm10">PM 10</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="pm2" name="PM25" placeholder=" " value={calibrationExceedValueData.PM25} onChange={handleChange}   />
                                <label for="pm2">PM 2.5</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="noh" name="NOH" placeholder=" " value={calibrationExceedValueData.NOH} onChange={handleChange}/>
                                <label for="noh">NOH</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="nh3" name="NH3" placeholder=" " value={calibrationExceedValueData.NH3} onChange={handleChange} />
                                <label for="nh3">NH3</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container"> 
                                <input type="text" id="windspeed" name="WindSpeed" placeholder=" "  value={calibrationExceedValueData.WindSpeed} onChange={handleChange}   />
                                <label for="windspeed">Wind Speed</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="wind" name="WindDir" placeholder=" "  value={calibrationExceedValueData.WindDir} onChange={handleChange}  />
                                <label for="wind">Wind Direction</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="air" name="AirTemperature" placeholder=" " value={calibrationExceedValueData.AirTemperature} onChange={handleChange}   />
                                <label for="air">Air Temperature</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="humidity" name="Humidity" placeholder=" " value={calibrationExceedValueData.Humidity} onChange={handleChange}  
                            />
                                <label for="humidity">Humidity</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="solar" name="solarRadiation" placeholder=" "  value={calibrationExceedValueData.solarRadiation} onChange={handleChange}    />
                                <label for="solar">Solar Radiation</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="db" name="DB" placeholder=" "  value={calibrationExceedValueData.DB} onChange={handleChange} />
                                <label for="db">DB</label>
                                </div>
                                </div>
                     
                    
                    
                     
                      
                     
                    
                    
                    <div className="mt-4 mb-5 p-2">
                    <button type="submit" className="btn btn-primary mb-2" onClick={handleSaveCalibration}>Update Calibration</button>                      <button type="button" className="btn btn-danger mb-2" onClick={handleCancel}>Cancel</button>
                    </div>
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
            © <a href="" target="_blank">Ebhoom Solutions LLP</a> 2022
          </span>
        </div>
      </footer>
  </div>
  </div>
  </div>
  </div>
  );
};

export default EditParameter;
