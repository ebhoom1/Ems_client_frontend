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
        <div className="col-lg-3 d-none d-lg-block ">
          <DashboardSam />
        </div>
        {/* Main content */}
        <div className="col-lg-9 col-12 ">
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
                        <div>
                          <p>User ID: {userData?.validUserOne?.userName || 'Admin developer'}</p>
                          <p>Company Name: {userData?.validUserOne?.companyName || 'Ebhoom Solutions'}</p>
                          <p>Model Name: {userData?.validUserOne?.modelName || 'NIL'}</p>
                          <p>Name: {userData?.validUserOne?.fname || 'Fazil'}</p>
                          <p>Email ID: {userData?.validUserOne?.email || 'fazilmm860@gmail.com'}</p>
                          <p>
                            Password: ************ 
                            <Link to='/reset'>
                              <button className="btn text-light" style={{ backgroundColor: '#236a80' }}>Change Password</button>
                            </Link>
                          </p>
                          <p>Subscription Date: {userData?.validUserOne?.subscriptionDate || '2024-06-05'}</p>
                          <p>Industry Type: {userData?.validUserOne?.industryType || 'Admin'}</p>
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
