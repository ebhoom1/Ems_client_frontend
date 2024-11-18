import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../../utils/apiConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewDifference = (props) => {
  const location = useLocation();
  
  // Use either the props or location.state
  const userName = props.userName || location.state?.userName;
  const interval = props.interval || location.state?.interval;
  const fromDate = props.fromDate || location.state?.fromDate;
  const toDate = props.toDate || location.state?.toDate;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (currentPage) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/differenceData/${userName}/${interval}/${fromDate}/${toDate}`,
        { params: { page: currentPage, limit: 10 } }
      );
      console.log('API Response:', response);
  
      if (response && response.data) {
        setData(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setLoading(false);
      } else {
        setError('No data received from API.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      console.error('Error Details:', error);
      if (error.response) {
        console.error('API Error Status:', error.response.status);
        console.error('API Error Data:', error.response.data);
      }
      setError('Failed to fetch data. Please try again.');
      setLoading(false);
    }
  };
  

  useEffect(() => {
    console.log('Fetching Data with Parameters:', { userName, interval, fromDate, toDate, page });
    if (userName && interval && fromDate && toDate) {
      fetchData(page);
    } else {
      setError('Invalid parameters. Please go back and try again.');
      setLoading(false);
    }
  }, [userName, interval, fromDate, toDate, page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Energy Data View</h2>
      {error && <p className="text-danger">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>SL. NO</th>
                <th>Initial Energy</th>
                <th>Last Energy</th>
                <th>Energy Difference</th>
                <th>Date</th>
                <th>Time</th>
                <th>Day</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{(page - 1) * 10 + index + 1}</td>
                  <td>{item.initialEnergy}</td>
                  <td>{item.lastEnergy}</td>
                  <td>{item.energyDifference}</td>
                  <td>{item.date}</td>
                  <td>{item.time}</td>
                  <td>{item.day}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination mt-3">
            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="mx-3">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ViewDifference;
