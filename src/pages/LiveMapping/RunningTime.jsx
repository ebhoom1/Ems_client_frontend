import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function RunningTime() {
  // Sample data rows for demonstration
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

      {/* Mobile‐friendly horizontal & vertical scroll */}
      <div
        className="table-responsive"
        style={{
          maxHeight: '500px',
          overflowY: 'auto',
          marginBottom: '10px',
        }}
      >
        <table
          className="table table-bordered mb-0"
          style={{ minWidth: '600px', borderCollapse: 'collapse' }}
        >
          <thead style={{ backgroundColor: '#236a80', color: '#fff' }}>
            <tr>
              <th
                rowSpan="2"
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#236a80', color: '#fff' 
                }}
              >
                SL.NO
              </th>
              <th
                rowSpan="2"
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#236a80', color: '#fff' 
                }}
              >
                Instrument Name
              </th>
              <th
                colSpan="3"
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#236a80', color: '#fff' 
                }}
              >
                Running Time
              </th>
            </tr>
            <tr>
              <th
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#236a80', color: '#fff' 
                }}
              >
                Auto
              </th>
              <th
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#236a80', color: '#fff' 
                }}
              >
                Run
              </th>
              <th
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#236a80', color: '#fff' 
                }}
              >
                Trip
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td
                  style={{
                    padding: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                  }}
                >
                  {row.id}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {row.instrument}
                </td>
                <td
                  style={{
                    padding: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                  }}
                >
                  {row.auto}
                </td>
                <td
                  style={{
                    padding: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                  }}
                >
                  {row.run}
                </td>
                <td
                  style={{
                    padding: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                  }}
                >
                  {row.trip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Previous Data button */}
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
