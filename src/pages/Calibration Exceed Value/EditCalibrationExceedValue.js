import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCalibrationExceedValueByUserId, editCalibrationExceedValue, updateCalibrationExceedValueData } from '../../redux/features/calibrationExceedValues/calibrationExceedValueSlice';
import { fetchUser } from "../../redux/features/user/userSlice";

const EditCalibrationExceedValue = () => {
  const { userName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { calibrationExceedValueData, loading, error, userCalibrationExceedValues } = useSelector(state => state.calibrationExceedValue);
  const { userData, userType } = useSelector((state) => state.user);

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
      setTimeout(() => navigate('/calibration-exceed-value'), 500);
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
        <div className="row page-title-header">
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
                    <div className="col-12 col-lg-6 col-md-6 mb-5">
                      <label htmlFor="date">Date of Parameter Threshold exceedance  Value Added</label>
                      <input
                        type="date"
                        className="input-field"
                        id="date"
                        name='date'
                        value={calibrationExceedValueData.date}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-5">
                      <label htmlFor="adminName">Admin User Name</label>
                      <input
                        type="text"
                        className="input-field"
                        id="adminName"
                        name='adminName'
                        value={userData?.validUserOne?.userName || ''}
                       
                      />
                    </div>
                    <div className="col-12 mb-5">
                      <h1>Edit Parameter Threshold exceedance  Values Details</h1>
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                      <label htmlFor="userName">User ID</label>
                      <input
                        type="text"
                        className="input-field"
                        id="userName"
                        name='userName'
                        value={calibrationExceedValueData.userName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-12 col-lg-6 col-md-6 mb-3">
                        <label htmlFor="exampleFormControlInput5">Product ID</label>
                        <input 
                        type="text" 
                        className="input-field" 
                        id="product_id"
                        name='product_id'
                        value={calibrationExceedValueData.product_id}
                        onChange={handleChange} 
                        placeholder="Product ID"
                        />                     
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                              <label htmlFor="exampleFormControlInput5">Industry Type</label>
                              
                                <select 
                                className="input-field" 
                                id='industryType'
                                name='industryType'
                                value={calibrationExceedValueData.industryType}
                                onChange={handleChange}
                                >

                                {industryType.map((item)=>(
                                <option value={item.category}>{item.category}</option>
                                ))}
                              </select>
                             
                          </div>
                          <div className="col-12">
                        <h1>Values</h1>
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">pH - Above</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="pH" name='phAbove' value={calibrationExceedValueData.phAbove} onChange={handleChange}   
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">pH - Below</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="pH" name='phBelow' value={calibrationExceedValueData.phBelow} onChange={handleChange}   
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">TDS</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="TDS" name='TDS' value={calibrationExceedValueData.TDS} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Turbidity</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Turbidity" name='turbidity' value={calibrationExceedValueData.turbidity} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Temprature</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Temprature" name='temperature' value={calibrationExceedValueData.temperature} onChange={handleChange} 
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">BOD</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="BOD" name='BOD' value={calibrationExceedValueData.BOD} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">COD</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="COD" name='COD' value={calibrationExceedValueData.COD} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">TSS</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="TSS" name='TSS' value={calibrationExceedValueData.TSS} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">ORP</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="ORP" name='ORP' value={calibrationExceedValueData.ORP} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Nitrate</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Nitrate" name='nitrate' value={calibrationExceedValueData.nitrate} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Ammonical Nitrogen</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Ammonical Nitrogen" name='ammonicalNitrogen' value={calibrationExceedValueData.ammonicalNitrogen} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">DO</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="DO" name='DO' value={calibrationExceedValueData.DO} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Chloride</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Chloride" name='chloride' value={calibrationExceedValueData.chloride} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Flow</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Flow" name='Flow' value={calibrationExceedValueData.Flow} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">CO</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="CO" name='CO' value={calibrationExceedValueData.CO} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">NOX</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="NOX" name='NOX' value={calibrationExceedValueData.Flow} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Pressure</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Pressure" name='Pressure' value={calibrationExceedValueData.Flow} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">PM</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="PM" name='PM' value={calibrationExceedValueData.PM} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">SO2</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="SO2" name='SO2' value={calibrationExceedValueData.SO2} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">NO2</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="NO2" name='NO2' value={calibrationExceedValueData.NO2} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Mercury</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Mercury" name='Mercury' value={calibrationExceedValueData.Mercury} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">PM 10</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="PM 10" name='PM10' value={calibrationExceedValueData.PM10} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">PM 2.5</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="PM 2.5" name='PM25' value={calibrationExceedValueData.PM25} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">NOH</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="NOH" name='NOH' value={calibrationExceedValueData.NOH} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">NH3</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="NH3" name='NH3' value={calibrationExceedValueData.NH3} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Wind Speed</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Wind Speed" name='WindSpeed' value={calibrationExceedValueData.WindSpeed} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Wind Direction</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Wind Direction" name='WindDir' value={calibrationExceedValueData.WindDir} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Air Temperature</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Air Temperature" name='AirTemperature' value={calibrationExceedValueData.AirTemperature} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Humidity</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Humidity" name='Humidity' value={calibrationExceedValueData.Humidity} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">Solar Radiation</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="Solar Radiation" name='solarRadiation' value={calibrationExceedValueData.solarRadiation} onChange={handleChange}  
                        />   
                      </div>
                      <div className="col-12 col-lg-6 col-md-6 mb-3">
                          <label htmlFor="exampleFormControlInput5">DB</label>
                          <input type="text" className="input-field" id="exampleFormControlInput5" placeholder="DB" name='DB' value={calibrationExceedValueData.DB} onChange={handleChange}  
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
            © <a href="" target="_blank">Ebhoom Solutions LLP</a> 2022
          </span>
        </div>
      </footer>
    </div>
  );
};

export default EditCalibrationExceedValue;
