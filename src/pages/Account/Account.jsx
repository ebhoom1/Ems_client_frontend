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
    }
  }, [dispatch, userData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div
      className="container-fluid"
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div className="row w-100">
        {/* Sidebar */}
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        {/* Main content */}
        <div className="col-lg-9 col-12">
          <div
            className="card mx-auto mt-5"
            style={{
              borderRadius: '15px',
              maxWidth: '700px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '20px',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            {/* Profile Picture */}
            <div
              className="profile-picture"
              style={{
                position: 'absolute',
                top: '-80px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                borderRadius: '50%',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                padding: '5px',
                zIndex: 1,
              }}
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeZJHfe65ileJaDpjPxFtJSZvZfKFh_4sM9A&s"
                alt="Profile"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                }}
              />
            </div>
            {/* User Information */}
            <div className="text-center mt-5">
              <h3 className="mb-2 text-light">{userData?.validUserOne?.fname || 'First Name'}</h3>
              <p className=" text-light mb-1">{userData?.validUserOne?.email || 'abc@gmail.com'}</p>
              <p className=" text-light mb-3">{userData?.validUserOne?.companyName || 'Company Name'}</p>
            </div>
            {/* Additional Details */}
            <div className="text-light">
              <p><strong>User ID:</strong> {userData?.validUserOne?.userName || 'Admin developer'}</p>
              <p><strong>Model Name:</strong> {userData?.validUserOne?.modelName || 'NIL'}</p>
              <p>
                <strong>Model Image:</strong>
                <img
                  src={userData?.validUserOne?.modelImage || '/path/to/image1.png'}
                  alt="Model"
                  style={{ width: '100px', height: '100px', borderRadius: '8px', marginLeft: '10px' }}
                />
              </p>
              <p><strong>Subscription Date:</strong> {userData?.validUserOne?.subscriptionDate || '2024-06-05'}</p>
              <p><strong>Industry Type:</strong> {userData?.validUserOne?.industryType || 'Admin'}</p>
              <p><strong>Analyser Technology:</strong> N/A</p>
              <p>
                <strong>Analyser Technology Image:</strong>
                <img
                  src={userData?.validUserOne?.analyserImage || '/path/to/image2.png'}
                  alt="Analyser"
                  style={{ width: '100px', height: '100px', borderRadius: '8px', marginLeft: '10px' }}
                />
              </p>
              <p>
                <strong>Password:</strong> ************
                <Link to="/reset">
                  <button className="btn btn-outline-primary ms-3">Change Password</button>
                </Link>
              </p>
            </div>
           
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;