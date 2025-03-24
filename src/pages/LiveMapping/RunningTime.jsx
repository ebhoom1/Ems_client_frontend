import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function RunningTime() {
  // Sample data rows for demonstration
  // Make sure each row has 'auto', 'run', and 'trip' fields for this layout
  const data = [
    { id: 1, instrument: 'Instrument 1', auto: '00:05:00', run: '00:02:00', trip: '00:03:00' },
    { id: 2, instrument: 'Instrument 2', auto: '00:10:00', run: '00:05:00', trip: '00:05:00' },
    { id: 3, instrument: 'Instrument 3', auto: '00:15:00', run: '00:07:00', trip: '00:08:00' },
    { id: 4, instrument: 'Instrument 4', auto: '00:08:00', run: '00:03:00', trip: '00:05:00' },
    { id: 5, instrument: 'Instrument 5', auto: '00:12:00', run: '00:06:00', trip: '00:06:00' },
    { id: 6, instrument: 'Instrument 6', auto: '00:20:00', run: '00:10:00', trip: '00:10:00' },
    // ...add more rows as needed
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
              {/* "SL.NO" and "Instrument Name" each span 2 rows */}
              <th
                rowSpan="2"
                style={{ padding: '8px', border: '1px solid #ddd',backgroundColor: '#236a80', color: '#fff' , textAlign: 'center' }}
              >
                SL.NO
              </th>
              <th
                rowSpan="2"
                style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#236a80', color: '#fff' ,textAlign: 'center' }}
              >
                Instrument Name
              </th>
              {/* "Running Time" header spans 3 columns */}
              <th
                colSpan="3"
                style={{ padding: '8px', border: '1px solid #ddd',backgroundColor: '#236a80', color: '#fff' , textAlign: 'center' }}
              >
                Running Time
              </th>
            </tr>
            <tr>
              {/* Sub-headers for Running Time */}
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center',backgroundColor: '#236a80', color: '#fff'  }}>Auto</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center',backgroundColor: '#236a80', color: '#fff'  }}>Run</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center',backgroundColor: '#236a80', color: '#fff'  }}>Trip</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {row.id}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.instrument}</td>
                {/* Corresponding cells for Auto, Run, Trip */}
                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {row.auto}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {row.run}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {row.trip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Previous Data button with green border and right arrow icon */}
      <div className="d-flex align-items-center justify-content-end">
        <button
          onClick={() => navigate('/previous-data')}
          style={{
            border: '1px solid green',
            background: 'transparent',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
            color: 'green',
            borderRadius: '10px',
          }}
        >
          Previous Data
          <FaArrowRight style={{ marginLeft: '8px' }} />
        </button>
      </div>
    </div>
  );
}

export default RunningTime;
