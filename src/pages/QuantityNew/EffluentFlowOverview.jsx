import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom'; // Shared search context
import { Oval } from 'react-loader-spinner'; // Import Oval spinner
import { API_URL } from '../../utils/apiConfig';
import { useSelector } from 'react-redux'; // Redux for userType check
import ConsuptionPredictionGraphQuantity from './ConsuptionPredictionGraphQuantity';

const EffluentFlowOverview = () => {
  const { userType, userData } = useSelector((state) => state.user); // Fetch userType and userData from Redux
  const [summaryData, setSummaryData] = useState({ totalInflow: 0, totalFinalflow: 0 });
  const [predictionData, setPredictionData] = useState({ predictedInflow: 0, predictedFinalflow: 0 });
  const [loading, setLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const { searchTerm } = useOutletContext(); // Get search term from context
  const [currentUserName, setCurrentUserName] = useState('');
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve userId from session storage
  useEffect(() => {
    const userName = userType === 'admin' 
      ? storedUserId || currentUserName 
      : userData?.validUserOne?.userName;

    if (userName) {
      fetchData(userName);
      fetchPredictionData(userName);
      setCurrentUserName(userName);
    }
  }, [storedUserId, currentUserName, userType, userData]);

  const fetchData = async (userName) => {
    const intervals = ['monthly', 'daily', 'hourly', '30Minutes', '15Minutes'];
    let data = null;

    try {
      const today = new Date().toISOString().split('T')[0];
      setCurrentDate(
        new Date().toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );

      for (let interval of intervals) {
        const response = await axios.get(`${API_URL}/api/summary/${userName}/hourly`);
        if (response.data && response.data.length > 0) {
          const currentDateData = response.data.find(
            (entry) => new Date(entry.interval).toISOString().split('T')[0] === today
          );
          if (currentDateData) {
            data = currentDateData;
            break;
          }
        }
      }

      setSummaryData(data || { totalInflow: 0, totalFinalflow: 0 });
    } catch (error) {
      console.error('Error fetching data:', error);
      setSummaryData({ totalInflow: 0, totalFinalflow: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictionData = async (userName) => {
    try {
      const response = await axios.get(`${API_URL}/api/prediction-summary/${userName}/hourly`);
      const prediction = response.data[0];

      setPredictionData(prediction || { predictedInflow: 0, predictedFinalflow: 0 });
    } catch (error) {
      console.error('Error fetching prediction data:', error);
      setPredictionData({ predictedInflow: 0, predictedFinalflow: 0 });
    } finally {
      setPredictionLoading(false);
    }
  };

  if (loading || predictionLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Oval height={60} width={60} color="#236A80" ariaLabel="Fetching details" secondaryColor="#e0e0e0" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mt-4">
        {/* Left Section */}
        <div className="col-md-6">
          <h3 className="text-center">Total Inflow and Outflow</h3>
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow" style={{border:'none' , borderRadius:'15px'}}>
                <small className='text-center text-light mt-2'>{currentDate}</small>
                <div className="card-body">
                  <h5 className="card-title text-center text-light">Inflow</h5>
                  <p className="text-center text-light display-4">
                    {summaryData.totalInflow.toLocaleString()} m³
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card shadow"  style={{border:'none' , borderRadius:'15px'}}>
                <small className='text-center text-light mt-2'>{currentDate}</small>
                <div className="card-body">
                  <h5 className="card-title text-center text-light">Final Flow</h5>
                  <p className="text-center text-light display-4">
                    {summaryData.totalFinalflow.toLocaleString()} m³
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-center">Prediction for Next Month</h3>
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow" style={{border:'none' , borderRadius:'15px'}}>
                <small className='text-center text-light mt-2'>{currentDate}</small>
                <div className="card-body">
                  <h5 className="card-title text-center text-light">Predicted Inflow</h5>
                  <p className="text-center text-light display-4">
                    {predictionData.predictedInflow.toLocaleString()} m³
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card shadow " style={{border:'none' , borderRadius:'15px'}}>
                <small  className='text-center text-light mt-2'>{currentDate}</small>
                <div className="card-body">
                  <h5 className="card-title  text-light text-center">Predicted Outflow</h5>
                  <p className="text-center text-light display-4">
                    {predictionData.predictedFinalflow.toLocaleString()} m³
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-md-6">
          <div className="card" style={{ height: '100%' }}>
            <ConsuptionPredictionGraphQuantity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EffluentFlowOverview;
