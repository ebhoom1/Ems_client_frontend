import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Sidebar from './SideBar';
import Canvas from './Canvas';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import { useNavigate } from 'react-router-dom';
import RunningTime from './RunningTime';
import Chemicals from './Chemicals';
import { useSelector } from 'react-redux';

function LIveLayout() {
  const { userData } = useSelector((state) => state.user);

  const navigate = useNavigate()
  const handleHowtoUse=()=>{
    navigate('/how-to-use')
  }
  return (
    <DndProvider backend={HTML5Backend}>
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
                <div className="col-12 d-flex  align-items-center justify-content-center m-2">
   
    <h1 className="text-center mt-3">
        Live Station Mapping
    </h1>
</div>
<div className='d-flex align-items-end justify-content-end mb-2'>
    <button 
    onClick={handleHowtoUse}
        className='btn' 
        style={{ 
            color: '#236a80',          // Text color
            border: '2px solid #236a80' // Border color
        }}
    >
        How to use
    </button>
</div>

                  <div className="cardn m-">
                    <div className="card-body">
                      <div className="row">
                        {/* Sidebar (for DnD) */}
                        <div className="col-md-3">
                          <Sidebar />
                        </div>
                        {/* Canvas Area */}
                        <div className="col-md-9 shadow" >
                          <Canvas />
                         <button className='btn btn-success mb-2 mt-2 d-flex justify-content-end align-items-center'>Add another station +</button>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                              <RunningTime/>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-12">
                              <Chemicals/>
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <footer className="footer">
          <div className="container-fluid clearfix">
            <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
             
            </span>
            <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
            AquaBox Control and Monitor System <br />
              © <a href="https://ebhoom.com" target="_blank">Ebhoom</a> 2022
            </span>
          </div>
        </footer>
      </div>
    </DndProvider>
  );
}

export default LIveLayout;