import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { CSVLink } from 'react-csv';

const ITEMS_PER_PAGE = 25;

const ViewComponent = () => {
  const location = useLocation();
  const { data, fromDate, toDate } = location.state || {};

  const [currentPage, setCurrentPage] = useState(0);
  const [currentData, setCurrentData] = useState([]);
  const [csvData, setCsvData] = useState([]);

  // Update currentData whenever currentPage or data changes
  useEffect(() => {
    const offset = currentPage * ITEMS_PER_PAGE;
    const slicedData = data?.slice(offset, offset + ITEMS_PER_PAGE) || [];
    setCurrentData(slicedData);
    prepareCsvData(data || []);
  }, [currentPage, data]);

  // Handle pagination click
  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}`;
  };

  const filterStackData = (stack) => {
    const { _id, ...filteredData } = stack;
    return filteredData;
  };

  // Prepare CSV data
  const prepareCsvData = (data) => {
    const headers = ['Date', 'Time', ...Object.keys(filterStackData(data[0]?.stackData[0] || {}))];
    const rows = data.flatMap((item) =>
      item.stackData.map((stack) => [
        formatDate(item.timestamp),
        formatTime(item.timestamp),
        ...Object.values(filterStackData(stack)),
      ])
    );

    const csvArray = [headers, ...rows];
    setCsvData(csvArray);
  };

  // Function to download the table as PDF
  const handleDownloadPdf = () => {
    const input = document.getElementById('data-table');

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape');
      pdf.addImage(imgData, 'PNG', 10, 10, 280, 150);
      pdf.save(`DataExport_${fromDate}_${toDate}.pdf`);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container-fluid">
      <h4>From Date: {fromDate}</h4>
      <h4>To Date: {toDate}</h4>

      {currentData.length > 0 ? (
        <div id="data-table" style={{ overflowX: 'auto' }}>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                {Object.keys(filterStackData(currentData[0]?.stackData[0] || {})).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) =>
                item.stackData.map((stack, stackIndex) => (
                  <tr key={`${index}-${stackIndex}`}>
                    <td>{formatDate(item.timestamp)}</td>
                    <td>{formatTime(item.timestamp)}</td>
                    {Object.values(filterStackData(stack)).map((value, i) => (
                      <td key={`${stackIndex}-${i}`}>{value}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available or data is in an unexpected format.</p>
      )}

      {data && data.length > ITEMS_PER_PAGE && (
        <ReactPaginate
          previousLabel={'Previous'}
          nextLabel={'Next'}
          breakLabel={'...'}
          pageCount={Math.ceil(data.length / ITEMS_PER_PAGE)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName={'pagination'}
          activeClassName={'active'}
          disabledClassName={'disabled'}
          breakClassName={'break-me'}
        />
      )}

      <div className="d-flex justify-content-start mt-3">
        <button className="btn btn-primary" onClick={handlePrint} style={{ marginRight: '10px' }}>
          <i className="fa-solid fa-print" style={{ marginRight: '5px' }}></i> Print
        </button>
        <button className="btn btn-primary" onClick={handleDownloadPdf} style={{ marginRight: '10px' }}>
          <i className="fa-solid fa-file-pdf" style={{ marginRight: '5px', color: '#ffff' }}></i> Download as PDF
        </button>
        <CSVLink
          data={csvData}
          filename={`DataExport_${fromDate}_${toDate}.csv`}
          className="btn btn-primary"
          style={{ color: '#ffff' }}
        >
          <i className="fa-solid fa-file-csv" style={{ marginRight: '5px', color: '#ffff' }}></i> Download as CSV
        </CSVLink>
      </div>
    </div>
  );
};

export default ViewComponent;
