import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../../redux/features/user/userSlice';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';

const Layout = () => {
 
  return (
    <div className="container-fluid" >
    {/*   <div className="row bg-light" >
       
        <div className="col-lg-3 d-none d-lg-block ">
          <DashboardSam />
        </div>
      
        <div className="col-lg-9 col-12 ">
          <div className="row">
            <div className="col-12">
              <Hedaer />
            </div>
          </div>
      
        </div>
      </div>  */}
    </div>
  );
};

export default Layout;
