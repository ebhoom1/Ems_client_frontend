import React, { useEffect, useRef } from 'react';
import 'react-toastify/dist/ReactToastify.css'; 
import DashboardSam from '../Dashboard/DashboardSam';
import MultipleVideo from './MultipleVideo';
import './live.css';
import Hedaer from '../Header/Hedaer';

function LiveEmmission() {
    // 1. Create refs for the canvas and the player instance
    const canvasRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        // 2. Define the WebSocket URL (Pointing to your Node.js backend)
        // If you host this on a server later, change 'localhost' to the server's IP
const streamUrl = 'ws://localhost:2000/api/stream/live';
        // 3. Initialize the JSMpeg Player
        const initPlayer = () => {
            if (window.JSMpeg && canvasRef.current) {
                // If a player already exists, destroy it first to avoid duplicates
                if (playerRef.current) {
                    playerRef.current.destroy();
                }

                console.log("Starting Video Stream...");
                
                playerRef.current = new window.JSMpeg.Player(streamUrl, {
                    canvas: canvasRef.current,
                    autoplay: true,
                    audio: false, // Disable audio to prevent browser autoplay blocks
                    loop: true
                });
            } else {
                console.error("JSMpeg library not found. Make sure you added the <script> tag to index.html");
            }
        };

        // Small delay to ensure the script is loaded
        const timer = setTimeout(initPlayer, 500);

        // 4. Cleanup: Stop the stream when the user leaves this page
        return () => {
            clearTimeout(timer);
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, []);

    return (
        <div className="container-fluid">
            <div className="row">
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
                                <div className="main-panel">
                                    <div className="content-wrapper">
                                        
                                        {/* Page Title Header Starts */}
                                   {/*      <div className="row page-title-header">
                                            <div className="col-12">
                                                <div className="page-header d-flex justify-content-between align-items-center mt-3">
                                                    <h4 className="page-title">Live Emission Dashboard</h4>
                                                    <div className="quick-link-wrapper">
                                                        <ul className="quick-links d-flex" style={{ textDecoration: 'none' }}>
                                                            <li><a href="#" style={{ textDecoration: 'none' }}>Settings</a></li>
                                                            <li><a href="#" style={{ textDecoration: 'none' }}>Option 1</a></li>
                                                            <li><a href="#" style={{ textDecoration: 'none' }}>Option 2</a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> */}

                                        {/* Main Video Card */}
                                        <div className="cardm mt-5">
                                            <div className="card-body">
                                                <div className="row mt-5 liverow">
                                                    <div className="col-md-12">
                                                        <h2>Live Emission Video</h2>
                                                        
                                                        {/* REPLACED: Video tag with Canvas for RTSP Stream */}
                                                       {/*  <div className="video-container" style={{ width: '100%', backgroundColor: '#000', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <canvas 
                                                                ref={canvasRef} 
                                                                style={{ width: '100%', height: 'auto', display: 'block' }} 
                                                            />
                                                        </div> */}
                                                        {/* END REPLACEMENT */}

                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <MultipleVideo />

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
        </div>
    );
}

export default LiveEmmission;