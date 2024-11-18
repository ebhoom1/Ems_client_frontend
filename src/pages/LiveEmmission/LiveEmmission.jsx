import React, {  useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';  // Toastify styles
import DashboardSam from '../Dashboard/DashboardSam';
/* import axios from 'axios';
import { API_URL } from '../../utils/apiConfig'; */
import MultipleVideo from './MultipleVideo';
import './live.css'
import Hedaer from '../Header/Hedaer';

function LiveEmmission() {
    const [videoUrl, setVideoUrl] = useState('');

   /*  useEffect(() => {
        const fetchVideoUrl = async () => {
          try {
            const response = await axios.get(`${API_URL}/api/get-video-url`);
            setVideoUrl(response.data.videoUrl);
          } catch (error) {
            console.error('Failed to fetch video URL:', error);
          }
        };
    
        fetchVideoUrl();
      }, []);
     */
  return (
    <div className="container-fluid">
    <div className="row">
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
          <div className="row" style={{overflowX:'hidden'}}>
            <div className="col-12 col-md-12 grid-margin">
                {/* live video */}
                <div className="main-panel">
    <div className="content-wrapper">
      {/* Page Title Header Starts */}
      <div className="row page-title-header">
        <div className="col-12">
        <div className="page-header d-flex justify-content-between align-items-center mt-3">
  <h4 className="page-title">Live Emission Dashboard</h4>
  <div className="quick-link-wrapper">
    <ul className="quick-links d-flex" style={{textDecoration:'none'}}>
      <li><a href="#" style={{textDecoration:'none'}}>Settings</a></li>
      <li><a href="#" style={{textDecoration:'none'}}>Option 1</a></li>
      <li><a href="#" style={{textDecoration:'none'}}>Option 2</a></li>
    </ul>
  </div>
</div>

        </div>
      </div>
     
        
           
      <div className="cardm mt-5">
        <div className="card-body">
          <div className="row mt-5 liverow">
            <div className="col-md-12 ">
              <h2>Live Emission Video</h2>
              <video controls autoPlay style={{ width: '100%', height: 'auto' }}>
                  {videoUrl && <source src={videoUrl} type="video/mp4" />}
                  Your browser does not support the video tag.
                </video>
            </div>
          </div>
        </div>
      </div>

        <MultipleVideo/>

    
      <footer className="footer">
        <div className="container-fluid clearfix">
          
          <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
            {" "}
            ©{" "}
            <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
            AquaBox Control and Monitor System
          </span> <br />
            <a href="" target="_blank">
              Ebhoom Solutions LLP
            </a>{" "}
            2022
          </span>
        </div>
      </footer>
    </div>
  </div>
                
            
            </div>
           
        </div>
      </div>
        </div>
    </div>
</div>  )
}

export default LiveEmmission