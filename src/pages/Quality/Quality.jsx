import React from 'react';
import Maindashboard from '../Maindashboard/Maindashboard';

function Quality() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Maindashboard />
      <div 
        className="border border-solid bg-light shadow p-5 mt-5" 
        style={{ 
          margin: '0 auto', 
          maxWidth: '90%', 
          width: '100%', 
          flex: '1'
        }}
      >
        Quality
      </div>
    </div>
  );
}

export default Quality;
