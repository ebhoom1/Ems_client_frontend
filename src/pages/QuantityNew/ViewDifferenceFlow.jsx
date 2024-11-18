import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../../utils/apiConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewDifferenceFlow = () => {
  const location = useLocation();
  const { userName, interval, fromDate, toDate } = location.state || {};

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (currentPage) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/differenceData/${userName}/${interval}/${fromDate}/${toDate}`,
        {
          params: { page: currentPage, limit: 10 },
        }
      );
      setData(response.data.data);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
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
      <h2>Flow Data View</h2>
      {error && <p className="text-danger">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>SL. NO</th>
                <th>Initial Flow</th>
                <th>Final Flow </th>
                <th>Flow Difference</th>
                <th>Date</th>
                <th>Time</th>
                <th>Day</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{(page - 1) * 10 + index + 1}</td>
                  <td>{item.initialFlow}</td>
                  <td>{item.finalFlow}</td>
                  <td>{item.flowDifference}</td>
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

export default ViewDifferenceFlow;


