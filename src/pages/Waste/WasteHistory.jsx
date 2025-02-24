import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import moment from 'moment';
import Swal from 'sweetalert2';
import DashboardSam from '../Dashboard/DashboardSam';
import HeaderSim from '../Header/HeaderSim';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const WasteHistory = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [wasteHistory, setWasteHistory] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [filterModal, setFilterModal] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    date: '',
    stationType: '',
    stationName: '',
  });
  const [sortCriteria, setSortCriteria] = useState('date');

  useEffect(() => {
    fetchWasteHistory();
  }, []);

  const fetchWasteHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/getallwaste`);
      const allWasteData = response.data.wasteData;

      // Filter waste data for the selected user and last one month
      const oneMonthAgo = moment().subtract(1, 'month').format('YYYY-MM-DD');
      const filteredWaste = allWasteData.filter(
        (waste) =>
          waste.userName === userId &&
          moment(waste.date).isAfter(oneMonthAgo) // Only show last month’s data
      );

      setWasteHistory(filteredWaste);
    } catch (error) {
      console.error('Error fetching waste history:', error);
      Swal.fire('Error', 'Failed to fetch waste history.', 'error');
    }
  };

  // Handle Edit - Open Modal with Selected Data
  const handleEdit = (waste) => {
    setEditFormData(waste);
    setEditModal(true);
  };

  // Handle Update (PUT request)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/editwaste/${editFormData._id}`, editFormData);
      Swal.fire('Success', 'Waste record updated successfully!', 'success');
      setEditModal(false);
      fetchWasteHistory();
    } catch (error) {
      console.error('Error updating waste record:', error);
      Swal.fire('Error', 'Failed to update waste record.', 'error');
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This waste record will be deleted permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#236a80',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/api/waste/${id}`);
          Swal.fire('Deleted!', 'Waste data has been deleted.', 'success');
          fetchWasteHistory();
        } catch (error) {
          console.error('Error deleting waste record:', error);
          Swal.fire('Error', 'Failed to delete waste data.', 'error');
        }
      }
    });
  };

  // Handle Filter Change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterCriteria({ ...filterCriteria, [name]: value });
  };

  // Apply Filter
  const applyFilter = () => {
    const filteredData = wasteHistory.filter((waste) => {
      return (
        (filterCriteria.date ? moment(waste.date).format('YYYY-MM-DD') === filterCriteria.date : true) &&
        (filterCriteria.stationType ? waste.stationType === filterCriteria.stationType : true) &&
        (filterCriteria.stationName ? waste.stationName === filterCriteria.stationName : true)
      );
    });
    setWasteHistory(filteredData);
    setFilterModal(false);
  };

  // Handle Sort Change
  const handleSortChange = (e) => {
    const criteria = e.target.value;
    setSortCriteria(criteria);
    const sortedData = [...wasteHistory].sort((a, b) => {
      if (criteria === 'date') {
        return moment(a.date).diff(moment(b.date));
      } else if (criteria === 'stationType') {
        return a.stationType.localeCompare(b.stationType);
      } else if (criteria === 'stationName') {
        return a.stationName.localeCompare(b.stationName);
      }
      return 0;
    });
    setWasteHistory(sortedData);
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row" style={{ backgroundColor: 'white' }}>
          <div className="col-lg-3 d-none d-lg-block">
            <DashboardSam />
          </div>
          <div className="col-lg-9 col-12">
            <div className="row">
              <div className="col-12">
                <HeaderSim />
              </div>
            </div>

            <div className="container mt-5">
              <h2 className="text-center mb-4">Previous Waste Data for {userId}</h2>

              <button className="btn btn-outline-success mb-3" onClick={() => navigate('/waste-dash')}>
                <i className="fa-solid fa-arrow-left me-1"></i> Back to Dashboard
              </button>

              <div className="d-flex justify-content-end  mb-3">
                <button className="btn btn-outline-dark me-2" onClick={() => setFilterModal(true)}>
                  <FaFilter className="me-2" /> Filter
                </button>
                <select className="form-select w-25" value={sortCriteria} onChange={handleSortChange}>
                  <option value="date">Sort by Date</option>
                 
                </select>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table">
                    <tr>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>Date</th>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>Waste Type</th>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>Station Name</th>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>Weight (kg)</th>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteHistory.length > 0 ? (
                      wasteHistory.map((waste, index) => (
                        <tr key={index}>
                          <td>{moment(waste.date).format('DD-MM-YYYY')}</td>
                          <td>{waste.stationType}</td>
                          <td>{waste.stationName}</td>
                          <td>{waste.weight} kg</td>
                          <td>
                            <FaEdit
                              className="me-2"
                              style={{ cursor: 'pointer', color: 'orange' }}
                              onClick={() => handleEdit(waste)}
                            />
                            <FaTrash
                              style={{ cursor: 'pointer', color: 'red' }}
                              onClick={() => handleDelete(waste._id)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No waste data found for the last month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ✅ Edit Modal */}
            <Modal show={editModal} onHide={() => setEditModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Edit Waste Record</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form onSubmit={handleEditSubmit}>
                  <div className="form-group mt-2">
                    <label>Station Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.stationName}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, stationName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group mt-3">
                    <label>Waste Type:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.stationType}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, stationType: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group mt-3">
                    <label>Weight (kg):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editFormData.weight}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, weight: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group mt-3">
                    <label>Date:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editFormData.date}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, date: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="text-center mt-4">
                    <Button type="submit" style={{ backgroundColor: '#236a80', color: 'white' }}>
                      Update
                    </Button>
                  </div>
                </form>
              </Modal.Body>
            </Modal>

            {/* ✅ Filter Modal */}
            <Modal show={filterModal} onHide={() => setFilterModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Filter Waste Records</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form>
                  <div className="form-group mt-2">
                    <label>Date:</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={filterCriteria.date}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div className="form-group mt-3">
                    <label>Waste Type:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="stationType"
                      value={filterCriteria.stationType}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div className="form-group mt-3">
                    <label>Station Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="stationName"
                      value={filterCriteria.stationName}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div className="text-center mt-4">
                    <Button
                      style={{ backgroundColor: '#236a80', color: 'white' }}
                      onClick={applyFilter}
                    >
                      Apply Filter
                    </Button>
                  </div>
                </form>
              </Modal.Body>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
};

export default WasteHistory;