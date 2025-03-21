import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // For generating tables in PDF

function PreviousData() {
  // Sample data for demonstration
  const sampleData = [
    { id: 1, instrument: 'Instrument A', time: '00:01:00' },
    { id: 2, instrument: 'Instrument B', time: '00:02:00' },
    { id: 3, instrument: 'Instrument C', time: '00:03:00' },
    { id: 1, instrument: 'Instrument A', time: '00:01:00' },
    { id: 2, instrument: 'Instrument B', time: '00:02:00' },
    { id: 3, instrument: 'Instrument C', time: '00:03:00' },   
    { id: 2, instrument: 'Instrument B', time: '00:02:00' },
    { id: 3, instrument: 'Instrument C', time: '00:03:00' },
  ];

  // 1. Create a function to generate and download PDF
  const handleDownloadPDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Optional: Add a title
    doc.setFontSize(14);
    doc.text('Previous Running Data', 14, 16);

    // 2. Define table columns and rows for autoTable
    const columns = [
      { header: 'SL No', dataKey: 'id' },
      { header: 'Instrument Name', dataKey: 'instrument' },
      { header: 'Running Time', dataKey: 'time' },
    ];
    const rows = sampleData.map((item) => ({
      id: item.id,
      instrument: item.instrument,
      time: item.time,
    }));

    // 3. Generate the table
    doc.autoTable({
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      startY: 22, // Start just below the title
      styles: { halign: 'center' }, // Center align text in each cell
      headStyles: { fillColor: '#236a80' }, // Table header color
    });

    // 4. Save the PDF
    doc.save('previous_data.pdf');
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Top row with Back link on the left and Download button on the right */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        {/* Back button */}
        <Link 
          to="/live-station" 
          style={{ 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '16px', 
            color: 'green'
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
            borderRadius: '4px' 
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
            <tr>
              <th style={{ padding: '8px',backgroundColor: '#236a80', color: '#fff' , border: '1px solid #ddd' }}>SL No</th>
              <th style={{ padding: '8px',backgroundColor: '#236a80', color: '#fff' , border: '1px solid #ddd' }}>Instrument Name</th>
              <th style={{ padding: '8px',backgroundColor: '#236a80', color: '#fff' , border: '1px solid #ddd' }}>Running time</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {row.id}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {row.instrument}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {row.time}
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
