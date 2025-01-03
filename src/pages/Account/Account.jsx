import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../../redux/features/user/userSlice';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';

const Account = () => {
  const dispatch = useDispatch();
  const { userData, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData) {
      dispatch(fetchUser());
      console.log("account:", userData);
    }
  }, [dispatch, userData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: 'white' }}>
        {/* Sidebar (hidden on mobile) */}
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
          <div>
            <div className="row" style={{ overflowX: 'hidden' }}>
              <div className="col-12 col-md-12 grid-margin">
                <div className="col-12 d-flex justify-content-center align-items-center m-2 text-center">
                  <h1 className="text-center mt-3" style={{ justifyContent: 'center' }}>Account</h1>
                </div>
                <div className="card m-">
                  <div className="card-body">
                    <form className="m-5">
                      <div className="row">
                        <div className="text-light">
                          <p className="text-light">User ID: {userData?.validUserOne?.userName || 'Admin developer'}</p>
                          <p className="text-light">Company Name: {userData?.validUserOne?.companyName || 'Ebhoom Solutions'}</p>
                          <p className="text-light">Model Name: {userData?.validUserOne?.modelName || 'NIL'}</p>
                          <div className="text-light">
                            <p>Model Image :   <img 
                              src={userData?.validUserOne?.modelImage || '/path/to/image1.png'} 
                              alt="N/A" 
                              style={{ width: '150px', height: '150px' }} 
                            /></p>
                          
                          </div>
                          <p className="text-light">Name: {userData?.validUserOne?.fname || 'Fazil'}</p>
                          <p className="text-light">Email ID: {userData?.validUserOne?.email || 'fazilmm860@gmail.com'}</p>
                          <p className="text-light">
                            Password: ************ 
                            <Link to="/reset">
                              <button className="btn btn-light ms-5" style={{ color: '#236a80' }}>Change Password</button>
                            </Link>
                          </p>
                          <p className="text-light">Subscription Date: {userData?.validUserOne?.subscriptionDate || '2024-06-05'}</p>
                          <p className="text-light">Industry Type: {userData?.validUserOne?.industryType || 'Admin'}</p>
                          <p className="text-light">Analyser Technology: N/A</p>
                          <div className="text-light">
                            <p>Analyser Technology Image:  <img 
                              src={userData?.validUserOne?.analyserImage || '/path/to/image2.png'} 
                               alt="N/A" 
                              style={{ width: '150px', height: '150px' }} 
                            /></p>
                           
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
