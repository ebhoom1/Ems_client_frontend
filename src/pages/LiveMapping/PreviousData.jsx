import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // For generating tables in PDF

function PreviousData() {
  // Updated sample data to include auto, run, trip
  const sampleData = [
    { id: 1, instrument: 'Instrument A', auto: '00:01:00', run: '00:00:30', trip: '00:00:30' },
    { id: 2, instrument: 'Instrument B', auto: '00:02:00', run: '00:01:00', trip: '00:01:00' },
    { id: 3, instrument: 'Instrument C', auto: '00:03:00', run: '00:01:30', trip: '00:01:30' },
    { id: 4, instrument: 'Instrument A', auto: '00:01:00', run: '00:00:30', trip: '00:00:30' },
    { id: 5, instrument: 'Instrument B', auto: '00:02:00', run: '00:01:00', trip: '00:01:00' },
    { id: 6, instrument: 'Instrument C', auto: '00:03:00', run: '00:01:30', trip: '00:01:30' },
    { id: 7, instrument: 'Instrument B', auto: '00:02:00', run: '00:01:00', trip: '00:01:00' },
    { id: 8, instrument: 'Instrument C', auto: '00:03:00', run: '00:01:30', trip: '00:01:30' },
  ];

  // 1. Create a function to generate and download PDF
  const handleDownloadPDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Optional: Add a title
    doc.setFontSize(14);
    doc.text('Previous Running Data', 14, 16);

    // 2. Define columns for autoTable
    // (Here we use a simple single-row header for the PDF, but you could do multi-level headers if you prefer.)
    const columns = [
      { header: 'SL No', dataKey: 'id' },
      { header: 'Instrument Name', dataKey: 'instrument' },
      { header: 'Auto', dataKey: 'auto' },
      { header: 'Run', dataKey: 'run' },
      { header: 'Trip', dataKey: 'trip' },
    ];

    // 3. Prepare the rows
    const rows = sampleData.map((item) => ({
      id: item.id,
      instrument: item.instrument,
      auto: item.auto,
      run: item.run,
      trip: item.trip,
    }));

    // 4. Generate the table
    doc.autoTable({
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      startY: 22, // Start just below the title
      styles: { halign: 'center' }, // Center align text in each cell
      headStyles: { fillColor: '#236a80' }, // Table header color
    });

    // 5. Save the PDF
    doc.save('previous_data.pdf');
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Top row with Back link on the left and Download button on the right */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        {/* Back button */}
        <Link
          to="/live-station"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
            color: 'green',
          }}
        >
          <FaArrowLeft style={{ marginRight: '8px' }} /> Back
        </Link>

        {/* Download PDF button */}
        <button
          onClick={handleDownloadPDF}
          style={{
            padding: '8px 16px',
            backgroundColor: '#236a80',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Download PDF
        </button>
      </div>

      {/* Table container with a fixed height and vertical scroll */}
      <div style={{ maxHeight: '100vh', overflowY: 'auto' }}>
        <h2>Previous Running Data</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#236a80', color: '#fff' }}>
            {/* First row: SL No and Instrument Name have rowSpan=2, 
                "Running Time" merges 3 columns (Auto, Run, Trip). */}
            <tr>
              <th
                rowSpan="2"
                style={{ 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  textAlign: 'center', 
                  backgroundColor:"#236a80",
                  color:'white'
                }}
              >
                SL No
              </th>
              <th
                rowSpan="2"
                style={{ 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  textAlign: 'center' ,
                   backgroundColor:"#236a80",
                  color:'white'
                }}
              >
                Instrument Name
              </th>
              <th
                colSpan="3"
                style={{ 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  textAlign: 'center' ,
                   backgroundColor:"#236a80",
                  color:'white'
                }}
              >
                Running Time
              </th>
            </tr>
            {/* Second row: sub-columns under Running Time */}
            <tr>
              <th
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                   backgroundColor:"#236a80",
                  color:'white'
                }}
              >
                Auto
              </th>
              <th
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                   backgroundColor:"#236a80",
                  color:'white'
                }}
              >
                Run
              </th>
              <th
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                   backgroundColor:"#236a80",
                  color:'white'
                }}
              >
                Trip
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row) => (
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
                <td
                  style={{
                    padding: '8px',
                    border: '1px solid #ddd',
                  }}
                >
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
    </div>
  );
}

export default PreviousData;
