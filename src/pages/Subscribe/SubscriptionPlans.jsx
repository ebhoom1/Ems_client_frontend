import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import './SubscriptionPlans.css'; // <-- We'll create a separate CSS file for custom styling
import DashboardSam from '../Dashboard/DashboardSam';
import HeaderSim from '../Header/HeaderSim';

const SubscriptionPlans = () => {
  // Use userName as the route parameter
  const { userName } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user data by userName
    const fetchUserData = async () => {
      try {
        // Use the endpoint that fetches user by userName
        // Adjust if your actual endpoint differs
        const res = await axios.get(`${API_URL}/api/get-user-by-userName/${userName}`);
        setUser(res.data.user);
        setLoading(false);
      } catch (err) {
        setError('Error fetching user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userName]);

  const handleProceedToPay = (plan) => {
    // Navigate to the Payment page with the selected plan and pass the userName
    navigate(`/payment/${userName}?plan=${plan}`);
  };

  if (loading) {
    return <div className="container mt-5">Loading user data...</div>;
  }

  if (error) {
    return <div className="container mt-5 text-danger">{error}</div>;
  }

  // Example: user.parametersCount is the number of saved parameters (update as needed)
  const parametersCount = user?.parametersCount || 0;

  return (
 <div className="container-fluid mb-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        
        {/* Main content */}
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <HeaderSim />
            </div>
          </div>
          <div className="container mt-5">
      <h2 className="text-center mb-3">EMS Pricing</h2>
      <p className="text-center">
        User: <strong>{user?.userName}</strong>
      </p>
      <p className="text-center mb-4">
        Parameters Saved: <strong>{parametersCount}</strong>
      </p>

      {/* Pricing Row */}
      <div className="row">
        {/* Business Basic */}
        <div className="col-md-4 mb-4">
          <div className=" pricing-card h-100">
            <div className="card-body d-flex flex-column">
              <h4 className="card-title text-center">Business Basic</h4>
              <h2 className="text-center mt-3 mb-2 price-text">₹10,000</h2>
              <p className="text-center subtext">Per month, billed annually</p>
              <p className="text-center subtext">Up to 30 parameters</p>

              <ul className="list-unstyled mt-3 mb-4 mx-auto text-start features-list">
                <li>Water usage and consumption data digitization</li>
                <li>pH sensor integration</li>
                <li>Basic analytics and reporting</li>
                <li>24/7 Email and Phone Support</li>
              </ul>

              <div className="mt-auto text-center">
                <button
                  className="btn "
                  style={{backgroundColor:'#236a80' , color:'#fff' , borderRadius:'30px'}}
                  onClick={() => handleProceedToPay('Business Basic')}
                >
                  Proceed to Pay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Business Standard */}
        <div className="col-md-4 mb-4">
          <div className=" pricing-card h-100">
            <div className="card-body d-flex flex-column">
              <h4 className="card-title text-center">Business Advanced</h4>
              <h2 className="text-center mt-3 mb-2 price-text">₹15,000</h2>
              <p className="text-center subtext">Per month, billed annually</p>
              <p className="text-center subtext">Up to 60 parameters</p>

              <ul className="list-unstyled mt-3 mb-4 mx-auto text-start features-list">
                <li>Water quality management</li>
                <li>Advanced data dashboards</li>
                <li>Industry documents management</li>
                <li>24/7 Email and Phone Support</li>
              </ul>

              <div className="mt-auto text-center">
                <button
                  className="btn "
                  style={{backgroundColor:'#236a80' , color:'#fff' , borderRadius:'30px'}}
                  onClick={() => handleProceedToPay('Business Standard')}
                >
                  Proceed to Pay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Business Premium */}
        <div className="col-md-4 mb-4">
          <div className=" pricing-card h-100">
            <div className="card-body d-flex flex-column">
              <h4 className="card-title text-center">Business Premium</h4>
              <h2 className="text-center mt-3 mb-2 price-text">₹20,000</h2>
              <p className="text-center subtext">Per month, billed annually</p>
              <p className="text-center subtext">Up to 100 parameters</p>

              <ul className="list-unstyled mt-3 mb-4 mx-auto text-start features-list">
                <li>Support for SCADA, DCS, and IoT</li>
                <li>Dedicated customer success manager</li>
                <li>Ecological impact analytics</li>
                <li>24/7 Priority Support</li>
              </ul>

              <div className="mt-auto text-center">
                <button
                  className="btn"
                  style={{backgroundColor:'#236a80' , color:'#fff' , borderRadius:'30px'}}
                  onClick={() => handleProceedToPay('Business Premium')}
                >
                  Proceed to Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
         
        </div>
      </div>
    </div>
    /*  */
   
  );
};

export default SubscriptionPlans;
