import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function RunningTime() {
  // Sample data rows for demonstration
  const data = [
    { id: 1, instrument: 'Instrument 1', time: '00:05:00' },
    { id: 2, instrument: 'Instrument 2', time: '00:10:00' },
    { id: 3, instrument: 'Instrument 3', time: '00:15:00' },
    { id: 4, instrument: 'Instrument 1', time: '00:05:00' },
    { id: 5, instrument: 'Instrument 2', time: '00:10:00' },
    { id: 6, instrument: 'Instrument 3', time: '00:15:00' },
    { id: 1, instrument: 'Instrument 1', time: '00:05:00' },
    { id: 2, instrument: 'Instrument 2', time: '00:10:00' },
    { id: 3, instrument: 'Instrument 3', time: '00:15:00' },
    { id: 4, instrument: 'Instrument 1', time: '00:05:00' },
    { id: 5, instrument: 'Instrument 2', time: '00:10:00' },
    { id: 6, instrument: 'Instrument 3', time: '00:15:00' }, { id: 1, instrument: 'Instrument 1', time: '00:05:00' },
    { id: 2, instrument: 'Instrument 2', time: '00:10:00' },
    { id: 3, instrument: 'Instrument 3', time: '00:15:00' },
    { id: 4, instrument: 'Instrument 1', time: '00:05:00' },
    { id: 5, instrument: 'Instrument 2', time: '00:10:00' },
    { id: 6, instrument: 'Instrument 3', time: '00:15:00' },
    // add more rows as needed
  ];
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px' }}>
        <h3>Running Time</h3>
      {/* Table container with medium height and vertical scroll */}
      <div style={{ maxHeight: '500px', overflowY: 'auto', marginBottom: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#236a80', color: '#fff' }}>
            <tr>
              <th style={{ padding: '8px',backgroundColor: '#236a80', color:'white',  border: '1px solid #ddd' }}>SL.NO</th>
              <th style={{ padding: '8px',backgroundColor: '#236a80', color:'white', border: '1px solid #ddd' }}>Instrument Name</th>
              <th style={{ padding: '8px',backgroundColor: '#236a80', color:'white', border: '1px solid #ddd' }}>Running time</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{row.id}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.instrument}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Previous Data button with green border and right arrow icon */}
     <div className='d-flex align-items-center justify-content-end'>
     <button
      onClick={()=> navigate('/previous-data')}
        style={{
          border: '1px solid green',
          background: 'transparent',
          padding: '8px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          fontSize: '16px', 
          color:'green',
          borderRadius:"10px"
        }}
      >
       Previous Data<FaArrowRight style={{ marginLeft: '8px' }} />
      </button>
     </div>
    </div>
  );
}

export default RunningTime;
