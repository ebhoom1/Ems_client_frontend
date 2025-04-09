/* import React from 'react'
import './dashboard.css'
function DashboardSam() {
  return (
    <div className='dashboard-sam'>
        <div className='navdash'>
            <ul className='menu'>
                <h1 className='fontstyle text-center' style={{fontSize: '46px',lineHeight: '62px', color:'#ffffff'}}>EBHOOM </h1>
                <li className='list active text-center '>
                    <a href="/water"  style={{textDecoration:'none' ,color:'#ffffff'}}>
                        <span className='title'>Dashboard</span>
                    </a>
                </li>
                <li className='list active text-center' >
                    <a href="/live-emmision" style={{textDecoration:'none', color:'#ffffff'}}> 
                        <span className='title'>Live Emmission Video</span>
                    </a>
                </li>
                <li className='list active text-center'>
                    <a href="/manage-user" style={{textDecoration:'none', color:'#ffffff'}}>
                        <span className='title' >Manage Users</span>
                    </a>
                </li>
               
              
               <li className='list active text-center'>
                   <a href="/view-notification" style={{textDecoration:'none', color:'#ffffff'}}>
                       <span className='title' >Notification</span>
                   </a>
               </li>
               <li className='list active text-center'>
                   <a href="/account" style={{textDecoration:'none', color:'#ffffff'}}>
                       <span className='title' >Account</span>
                   </a>
               </li>
             
                <li className='list active text-center'>
                   <a href="/transaction" style={{textDecoration:'none', color:'#ffffff'}}>
                       <span className='title' >Transaction</span>
                   </a>
               </li>
               <li className='list active text-center'>
                   <a href="/subscribe" style={{textDecoration:'none', color:'#ffffff'}}>
                       <span className='title' >Subscribe</span>
                   </a>
               </li>
                <li className='list active text-center'>
                   <a href="/support-analyser" style={{textDecoration:'none', color:'#ffffff'}}>
                       <span className='title' >Supported Analyser</span>
                   </a>
               </li> 
           
            </ul> 
        </div>
    </div>
  )
}
export default DashboardSam */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'; // Import useSelector to access Redux store
import './dashboard.css';
import axios from 'axios';
import { toast } from "react-toastify"; // Import toast for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import { API_URL } from '../../utils/apiConfig';

function DashboardSam() {
  const userType = useSelector((state) => state.user.userType); // Assuming userType is stored in the user slice of Redux store
  const adminType = useSelector((state) => state.user.userData?.validUserOne?.adminType); // Retrieve adminType from the Redux store

  const [logoUrl, setLogoUrl] = useState(null); // State to store the logo URL

  // Fetch the logo when the component mounts or when adminType changes
  useEffect(() => {
    const fetchLogo = async () => {
      if (adminType) {
        console.log("Fetching logo for adminType:", adminType); // Log adminType for debugging
        try {
          const response = await axios.get(`${API_URL}/api/logo/${adminType}`);
          if (response.data?.data?.length > 0) {
            // Sort logos by createdAt to get the latest one
            const sortedLogos = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const latestLogoUrl = sortedLogos[0].logoUrl; // Get the latest logo URL
            setLogoUrl(latestLogoUrl);
            console.log("Latest logo URL:", latestLogoUrl); // Log the logo URL
          } else {
            console.warn("No logo found for the specified adminType.");
          }
        } catch (error) {
          console.error("Error fetching logo:", error);
          if (error.code === 'ERR_NETWORK') {
            toast.error("Network error: Unable to reach the server.", { position: "top-center" });
          } else {
            toast.error("Failed to fetch logo. Please try again later.", { position: "top-center" });
          }
        }
      } else {
        console.warn("AdminType is undefined or empty."); // Warn if adminType is not provided
      }
    };
  
    fetchLogo();
  }, [adminType]);
  
  
  

  // Default heading based on adminType
  const heading = adminType || 'EBHOOM'; // Fallback to 'EBHOOM' if adminType is not defined

  return (
    <div className='dashboard-sam'>
      <div className='navdash'>
        <ul className='menu'>
          {/* Dynamically render heading and logo */}
          <div className="text-center">
          {logoUrl ? (
    <img
      src={logoUrl}
      alt={`${adminType} Logo`}
      style={{ maxWidth: '120px', maxHeight: '120px', marginBottom: '10px' }}
    />
  ) : (
    <span>Loading logo...</span> // Optional loading indicator
  )}
           {/*  <h1
              className='fontstyle text-center'
              style={{ fontSize: '46px', lineHeight: '62px', color: '#ffffff' }}
            >
              {heading}
            </h1> */}
          </div>

          {/* Navigation links */}
          <li className='list active text-center'>
            <a href="/water" style={{ textDecoration: 'none', color: '#ffffff' }}>
              <span className='title'>Dashboard</span>
            </a>
          </li>
          {userType === 'admin' && (
            <>
            
              <li className='list active text-center'>
                <a href="/manage-user" style={{ textDecoration: 'none', color: '#ffffff' }}>
                  <span className='title'>Manage Users</span>
                </a>
              </li>
              <li className='list active text-center'>
                <a href="/view-notification" style={{ textDecoration: 'none', color: '#ffffff' }}>
                  <span className='title'>Notification</span>
                </a>
              </li>
              <li className='list active text-center'>
                <a href="/chat" style={{ textDecoration: 'none', color: '#ffffff' }}>
                  <span className='title'>Chat</span>
                </a>
              </li>
              <li className='list active text-center'>
            <a href="/inventory" style={{ textDecoration: 'none', color: '#ffffff' }}>
              <span className='title'>Inventory & Service</span>
            </a>
          </li>
          
              <li className='list active text-center'>
                <a href="/live-station" style={{ textDecoration: 'none', color: '#ffffff' }}>
                  <span className='title'>Digital Twin</span>
                </a>
              </li>
              <li className='list active text-center'>
                <a href="/live-emmision" style={{ textDecoration: 'none', color: '#ffffff' }}>
                  <span className='title'>Live Emission Video</span>
                </a>
              </li>
              <li className='list active text-center'>
                <a href="/subscribe" style={{ textDecoration: 'none', color: '#ffffff' }}>
                  <span className='title'>Subscribe</span>
                </a>
              </li>
            </>
          )}
          <li className='list active text-center'>
            <a href="/account" style={{ textDecoration: 'none', color: '#ffffff' }}>
              <span className='title'>Account</span>
            </a>
          </li>
          
         
          {userType === 'user' && (
            <>
              <li className='list active text-center'>
                <a href="/view-report" style={{ textDecoration: 'none', color: '#ffffff' }}>
                  <span className='title'>Report</span>
                </a>
              </li>
              <li className='list active text-center'>
                <a href="/download" style={{ textDecoration: 'none', color: '#ffffff' }}>
                  <span className='title'>Download</span>
                </a>
              </li>
              <li className='list active text-center'>
                <a href="/live-station" style={{ textDecoration: 'none', color: '#ffffff' }}>
                  <span className='title'>Digital Twin</span>
                </a>
              </li>
              <li className='list active text-center'>
                <a href="/chat" style={{ textDecoration: 'none', color: '#ffffff' }}>
                  <span className='title'>Chat</span>
                </a>
              </li>
              <li className='list active text-center'>
            <a href="/inventory" style={{ textDecoration: 'none', color: '#ffffff' }}>
              <span className='title'>Inventory & Service</span>
            </a>
          </li>
              <li className='list active text-center'>
                <a href="/transactions" style={{ textDecoration: 'none', color: '#ffffff' }}>
                  <span className='title'>Payment</span>
                </a>
              </li>
              <li className='list active text-center'>
                <a href="/live-emmision" style={{ textDecoration: 'none', color: '#ffffff' }}>
                  <span className='title'>Live Emission Video</span>
                </a>
              </li>
            </>
          )}
         {/*  <li className='list active text-center'>
            <a href="/support-analyser" style={{ textDecoration: 'none', color: '#ffffff' }}>
              <span className='title'>Supported Analyser</span>
            </a>
          </li> */}
        </ul>
      </div>
    </div>
  );
}

export default DashboardSam;

