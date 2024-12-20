import React, { useEffect, useState } from 'react';
import Header from '../Header/Hedaer';
import DashboardSam from '../Dashboard/DashboardSam';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ViewExceedenceList() {
  const [exceedenceList, setExceedenceList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the exceedence list
  const fetchExceedenceList = async () => {
    try {
      const response = await axios.get('https://api.ocems.ebhoom.com/api/list');
      if (response.data.message === "Avoid list fetched successfully") {
        setExceedenceList(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch exceedence list');
    } finally {
      setLoading(false);
    }
  };

  // Delete a specific username
  const deleteExceedence = async (userName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete user: ${userName}?`);
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`https://api.ocems.ebhoom.com/api/remove/${userName}`);
      if (response.data.message === "User removed from avoid list successfully") {
        toast.success(`User ${userName} deleted successfully`);
        fetchExceedenceList(); // Refresh the list after deletion
      } else {
        toast.error('Failed to delete the user. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to delete the user');
    }
  };

  useEffect(() => {
    fetchExceedenceList();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: 'white' }}>
        {/* Sidebar (hidden on mobile) */}
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        {/* Main content */}
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <Header />
            </div>
          </div>
          <div>
            <h2 className="mt-4">View Exceedence List</h2>
            <div className="table-responsive mt-4">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Sl No</th>
                    <th>User Name</th>
                    <th>Reason</th>
                    <th>Date and Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exceedenceList.length > 0 ? (
                    exceedenceList.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.userName}</td>
                        <td>{item.reason}</td>
                        <td>{new Date(item.timestamp).toLocaleString()}</td>
                        <td>
                          <button
                            className="btn btn-danger"
                            onClick={() => deleteExceedence(encodeURIComponent(item.userName))}
                          >
                            Delete  
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No exceedence records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ViewExceedenceList;
