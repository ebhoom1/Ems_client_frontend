import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import CanvasComponent from './CanvasComponent';
import Iconbar from './Iconbar';
import './AutonerveLayout.css';
import Header from '../pages/Header/Hedaer';
import HeaderSim from '../pages/Header/HeaderSim';

function AutonerveLayout() {
  return (
    <ReactFlowProvider>
           <div className='col-12 w-100'>
         <HeaderSim/>
       </div>
      <div className="layout-container">
    
        <Iconbar />
        <CanvasComponent />
      </div>
    </ReactFlowProvider>
  );
}

export default AutonerveLayout;