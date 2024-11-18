import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../../redux/features/user/userSlice';
import { addCalibrationExceedValue, setCurrentDateTime } from '../../redux/features/calibrationExceedValues/calibrationExceedValueSlice';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import FooterM from '../FooterMain/FooterM';
import DashboardSam from '../Dashboard/DashboardSam';
import './Parameter.css'; 
import HeaderSim from '../Header/HeaderSim';
import Hedaer from '../Header/Hedaer';
import Maindashboard from '../Maindashboard/Maindashboard';

function AddParameters() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData, loading, error } = useSelector((state) => state.user);
  const { calibrationExceedValueData, currentDateTime } = useSelector((state) => state.calibrationExceedValue);
  
  const [formData, setFormData] = useState(calibrationExceedValueData);

 /*  useEffect(() => {
    console.log('Checking userData:', userData);

    if (!userData) {
      console.log('User data is missing. Fetching...');
      dispatch(fetchUser());
    }
 }, [userData, dispatch]); */

  useEffect(() => {
    dispatch(setCurrentDateTime());
   /*  dispatch(fetchUser()); */ // Fetch user data to populate fields
  }, [dispatch]);

  useEffect(() => {
    console.log('userData:', userData);
    console.log('currentDateTime:', currentDateTime);
    if (userData && currentDateTime) {
      setFormData((prevData) => ({
        ...prevData,
        adminUserName: userData?.validUserOne?.userName || '',
        adminName: userData?.validUserOne?.fname || '',
        dateOfCalibrationExceedValueAdded: currentDateTime?.split('T')[0] || ''
      }));
      console.log('Updated formData:', formData);
    }
  }, [userData, currentDateTime]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change detected: ${name} = ${value}`);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    console.log('Updated formData after input change:', formData);
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
          setTimeout(()=>(navigate('/view-parameter')),500)
        }
      
    } catch (error) {
        toast.error(`Error: ${error.message}`);
    }
};

  const handleCancel = () => {
    navigate('/view-parameter');
  };
  if (loading) {
    return <div>Loading...</div>
}

if (error) {
    return <div>Error...{error}</div>
}

  const industryType = [
    "Sugar", "Cement", "Distillery", "Petrochemical", "Pulp & Paper", "Fertilizer", "Tannery", "Pesticides",
    "Thermal Power Station", "Caustic Soda", "Pharmaceuticals", "Chemical", "Dye and Dye Stuff", "Refinery",
    "Copper Smelter", "Iron and Steel", "Zinc Smelter", "Aluminium", "STP/ETP", "NWMS/SWMS", "Noise", "Other"
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
          <Hedaer />
       <div className='maindashboard'>
       <Maindashboard/>
       </div>
          <div className="row" style={{ overflowX: 'hidden' }}>
            <div className="col-12 col-md-12 grid-margin">
              <div className="col-12 d-flex justify-content-between align-items-center m-3">
                <h1 className="text-center mt-5">Add Calibration Exceedance Values</h1>
              </div>
              <div className="card m-2">
                <div className="card-body">
                  <form className="m-2 p-5" >
                    <div className="row">
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label>Admin User ID</label>
                          <input
                            type="text"
                            name="adminUserName"
                            className="form-control"
                            value={formData.adminUserName || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label>Date of Parameter Threshold Exceedance Value Added</label>
                          <input
                            type="date"
                            className="form-control"
                            name="dateOfCalibrationExceedValueAdded"
                            value={formData.dateOfCalibrationExceedValueAdded || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label>Admin Name</label>
                          <input
                            type="text"
                            name="adminName"
                            className="form-control"
                            value={formData.adminName || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label>User ID</label>
                          <input
                            type="text"
                            name="userName"
                            className="form-control"
                            value={formData.userName || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="col-lg-6 col-md-6 mb-4">
                        <div className="form-group">
                          <label>Product ID</label>
                          <input
                            type="text"
                            className="form-control"
                            name="product_id"
                            value={formData.product_id || ''}
                            onChange={handleInputChange}
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
                            value={formData.industryType || ''}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Industry</option>
                            {industryType.map((industry, index) => (
                              <option key={index} value={industry}>{industry}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <h3>Values</h3>
                      <div className="row">
                        {/* Input fields for various values */}
                        <div className="col-lg-4 col-md-6 mb-1">
                          <div className="input-container">
                            <input 
                              type="text" 
                              id="phAbove" 
                              name="phAbove" 
                              value={formData.phAbove} onChange={handleInputChange} 
                              placeholder=" " 
                              
                               
                            />
                            <label htmlFor="phAbove">pH-Above</label>
                          </div>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-1">
                          <div className="input-container">
                            <input 
                              type="text" 
                              id="phBelow" 
                              name="phBelow" 
                              value={formData.phBelow} onChange={handleInputChange}   
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
                              value={formData.TDS} onChange={handleInputChange}  
                              placeholder=" " 
                               
                            />
                            <label htmlFor="TDS">TDS</label>
                          </div>
                        </div>
                       
                        <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="turbidity" name="turbidity" placeholder=" "
                                value={formData.turbidity} onChange={handleInputChange}      
                             />
                                <label for="turbidity">Turbidity</label>
                                </div>
                                </div>
                               
                                <div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="temperature" value={formData.temperature} onChange={handleInputChange}  name="temperature" placeholder=" "  />
    <label for="temperature">Temperature</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="bod" name="BOD" value={formData.BOD} onChange={handleInputChange}  placeholder=" "  />
    <label for="bod">BOD</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="cod" name="COD" value={formData.COD} onChange={handleInputChange}  placeholder=" "  />
    <label for="cod">COD</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="tss" name="TSS" value={formData.TSS} onChange={handleInputChange}  placeholder=" "  />
    <label for="tss">TSS</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="orp" name="ORP" placeholder=" " value={formData.ORP} onChange={handleInputChange}   />
    <label for="orp">ORP</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="nitrate" name="nitrate" placeholder=" " value={formData.nitrate} onChange={handleInputChange}    />
    <label for="nitrate">Nitrate</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="ammonical-nitrogen" name="ammonicalNitrogen" value={formData.ammonicalNitrogen} onChange={handleInputChange} placeholder=" "  />
    <label for="ammonical-nitrogen">Ammonical Nitrogen</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="do" name="DO" placeholder=" "  value={formData.DO} onChange={handleInputChange}   />
    <label for="do">DO</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="chloride" name="chloride" placeholder=" "   value={formData.chloride} onChange={handleInputChange}  />
    <label for="chloride">Chloride</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="flow" name="Flow" placeholder=" " value={formData.Flow} onChange={handleInputChange}   />
    <label for="flow">Flow</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="co" name="CO" placeholder=" "   value={formData.CO} onChange={handleInputChange}   />
    <label for="co">CO</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="nox" name="NOX" placeholder=" "  value={formData.NOX} onChange={handleInputChange}   />
    <label for="nox">NOX</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="pressure" name="Pressure" placeholder=" "  value={formData.Pressure} onChange={handleInputChange}/>
    <label for="pressure">Pressure</label>
  </div>
</div>

<div className="col-lg-4 col-md-6 mb-1">
  <div class="input-container">
    <input type="text" id="pm" name="PM" placeholder=" " value={formData.PM} onChange={handleInputChange}  />
    <label for="pm">PM</label>
  </div>
</div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="so2" name="SO2" placeholder=" "   value={formData.SO2} onChange={handleInputChange}  />
                                <label for="so2">SO2</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="no2" name="NO2" placeholder=" "  value={formData.NO2} onChange={handleInputChange}  />
                                <label for="no2">NO2</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="mercury" name="Mercury" placeholder=" " value={formData.Mercury} onChange={handleInputChange}   />
                                <label for="mercury">Mercury</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="pm10" name="PM10" placeholder=" "  value={formData.PM10} onChange={handleInputChange}  />
                                <label for="pm10">PM 10</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="pm2" name="PM25" placeholder=" " value={formData.PM25} onChange={handleInputChange}   />
                                <label for="pm2">PM 2.5</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="noh" name="NOH" placeholder=" " value={formData.NOH} onChange={handleInputChange}/>
                                <label for="noh">NOH</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="nh3" name="NH3" placeholder=" " value={formData.NH3} onChange={handleInputChange} />
                                <label for="nh3">NH3</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container"> 
                                <input type="text" id="windspeed" name="WindSpeed" placeholder=" "  value={formData.WindSpeed} onChange={handleInputChange}   />
                                <label for="windspeed">Wind Speed</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="wind" name="WindDir" placeholder=" "  value={formData.WindDir} onChange={handleInputChange}  />
                                <label for="wind">Wind Direction</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="air" name="AirTemperature" placeholder=" " value={formData.AirTemperature} onChange={handleInputChange}   />
                                <label for="air">Air Temperature</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="humidity" name="Humidity" placeholder=" " value={formData.Humidity} onChange={handleInputChange}  
                            />
                                <label for="humidity">Humidity</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="solar" name="solarRadiation" placeholder=" "  value={formData.solarRadiation} onChange={handleInputChange}    />
                                <label for="solar">Solar Radiation</label>
                                </div>
                                </div>

                                <div className="col-lg-4 col-md-6 mb-1">
                                <div class="input-container">
                                <input type="text" id="db" name="DB" placeholder=" "  value={formData.DB} onChange={handleInputChange} />
                                <label for="db">DB</label>
                                </div>
                                </div>


                      </div>
                    </div>
                    <button type="submit" onClick={handleSubmit} className="btn me-2" style={{ backgroundColor: '#236a80', color: 'white' }}>Add Calibration</button>
                    <button type="button" className="btn btn-danger me-2" onClick={handleCancel}>Cancel</button>
                  </form>
                  <ToastContainer />
                </div>
              </div>
            </div>
          </div>
          <FooterM />
        </div>
      </div>
    </div>
  );
}

export default AddParameters;
