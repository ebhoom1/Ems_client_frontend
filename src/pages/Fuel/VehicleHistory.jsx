import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import moment from 'moment';
import Swal from 'sweetalert2';
import DashboardSam from '../Dashboard/DashboardSam';
import HeaderSim from '../Header/HeaderSim';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const VehicleHistory = () => {
  const navigate = useNavigate();
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [filterModal, setFilterModal] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    date: '',
    fuelType: '',
    userName: '',
  });
  const [sortCriteria, setSortCriteria] = useState('date');

  // Fetch vehicle data and filter out today's and yesterday's entries
  const fetchVehicleHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/getAllEntries?entryType=Vehicle`);
      let data = response.data.data;
      const today = moment().format('YYYY-MM-DD');
      const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
      data = data.filter((item) => {
        const entryDate = moment(item.date).format('YYYY-MM-DD');
        return entryDate !== today && entryDate !== yesterday;
      });
      setVehicleHistory(data);
    } catch (error) {
      console.error('Error fetching vehicle history:', error);
      Swal.fire('Error', 'Failed to fetch vehicle history.', 'error');
    }
  };

  useEffect(() => {
    fetchVehicleHistory();
  }, []);

  // Handle editing a record
  const handleEdit = (vehicle) => {
    setEditFormData(vehicle);
    setEditModal(true);
  };

  // Handle update (PUT request)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/editEntry/${editFormData._id}`, editFormData);
      Swal.fire('Success', 'Vehicle record updated successfully!', 'success');
      setEditModal(false);
      fetchVehicleHistory();
    } catch (error) {
      console.error('Error updating vehicle record:', error);
      Swal.fire('Error', 'Failed to update vehicle record.', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This vehicle record will be deleted permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#236a80',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/api/deleteEntry/${id}`);
          Swal.fire('Deleted!', 'Vehicle data has been deleted.', 'success');
          fetchVehicleHistory();
        } catch (error) {
          console.error('Error deleting vehicle record:', error);
          Swal.fire('Error', 'Failed to delete vehicle record.', 'error');
        }
      }
    });
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterCriteria((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filter to vehicle history data
  const applyFilter = () => {
    axios
      .get(`${API_URL}/api/getAllEntries?entryType=Vehicle`)
      .then((response) => {
        let data = response.data.data;
        const today = moment().format('YYYY-MM-DD');
        const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
        data = data.filter((item) => {
          const entryDate = moment(item.date).format('YYYY-MM-DD');
          return entryDate !== today && entryDate !== yesterday;
        });
        if (filterCriteria.date) {
          const selectedDate = moment(filterCriteria.date).format('YYYY-MM-DD');
          data = data.filter((item) => moment(item.date).format('YYYY-MM-DD') === selectedDate);
        }
        if (filterCriteria.fuelType) {
          data = data.filter((item) => item.fuelType === filterCriteria.fuelType);
        }
        if (filterCriteria.userName) {
          data = data.filter((item) => item.userName === filterCriteria.userName);
        }
        setVehicleHistory(data);
        setFilterModal(false);
      })
      .catch((error) => {
        console.error('Error applying filter:', error);
        Swal.fire('Error', 'Failed to apply filter.', 'error');
      });
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const criteria = e.target.value;
    setSortCriteria(criteria);
    const sortedData = [...vehicleHistory].sort((a, b) => {
      if (criteria === 'date') {
        return moment(a.date).diff(moment(b.date));
      } else if (criteria === 'fuelType') {
        return a.fuelType.localeCompare(b.fuelType);
      } else if (criteria === 'userName') {
        return a.userName.localeCompare(b.userName);
      }
      return 0;
    });
    setVehicleHistory(sortedData);
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
              <h2 className="text-center mb-4">Previous Vehicle Data</h2>
              <button className="btn btn-outline-success mb-3" onClick={() => navigate('/fuel')}>
                <i className="fa-solid fa-arrow-left me-1"></i> Back to Dashboard
              </button>
              <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-outline-dark me-2" onClick={() => setFilterModal(true)}>
                  <FaFilter className="me-2" /> Filter
                </button>
                <select className="form-select w-25" value={sortCriteria} onChange={handleSortChange}>
                  <option value="date">Sort by Date</option>
                  <option value="fuelType">Sort by Fuel Type</option>
                  <option value="userName">Sort by User</option>
                </select>
              </div>
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table">
                    <tr>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>Date</th>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>Vehicle Name</th>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>Vehicle Number</th>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>Fuel Type</th>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>Avg. Economy</th>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>Litres Used</th>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>User Name</th>
                      <th style={{ backgroundColor: '#236a80', color: 'white' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleHistory.length > 0 ? (
                      vehicleHistory.map((vehicle, index) => (
                        <tr key={index}>
                          <td>{moment(vehicle.date).format('DD-MM-YYYY')}</td>
                          <td>{vehicle.vehicleName}</td>
                          <td>{vehicle.vehicleNumber}</td>
                          <td>{vehicle.fuelType}</td>
                          <td>{vehicle.averageFuelEconomy} km/l</td>
                          <td>{vehicle.litresUsed} L</td>
                          <td>{vehicle.userName}</td>
                          <td>
                            <FaEdit
                              className="me-2"
                              style={{ cursor: 'pointer', color: 'orange' }}
                              onClick={() => handleEdit(vehicle)}
                            />
                            <FaTrash
                              style={{ cursor: 'pointer', color: 'red' }}
                              onClick={() => handleDelete(vehicle._id)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No previous vehicle data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Modal */}
            <Modal show={editModal} onHide={() => setEditModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Edit Vehicle Record</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form onSubmit={handleEditSubmit}>
                  <div className="form-group mt-2">
                    <label>User Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.userName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, userName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group mt-3">
                    <label>Vehicle Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.vehicleName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, vehicleName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group mt-3">
                    <label>Vehicle Number:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.vehicleNumber || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, vehicleNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group mt-3">
                    <label>Fuel Type:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.fuelType || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fuelType: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group mt-3">
                    <label>Average Fuel Economy (km/l):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editFormData.averageFuelEconomy || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, averageFuelEconomy: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group mt-3">
                    <label>Litres Used:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editFormData.litresUsed || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, litresUsed: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group mt-3">
                    <label>Date:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={moment(editFormData.date).format('YYYY-MM-DD')}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
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

            {/* Filter Modal */}
            <Modal show={filterModal} onHide={() => setFilterModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Filter Vehicle Records</Modal.Title>
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
                    <label>Fuel Type:</label>
                    <select
                      className="form-control"
                      name="fuelType"
                      value={filterCriteria.fuelType}
                      onChange={handleFilterChange}
                    >
                      <option value="">Select Fuel Type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </div>
                  <div className="form-group mt-3">
                    <label>User Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="userName"
                      value={filterCriteria.userName}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="text-center mt-4">
                    <Button style={{ backgroundColor: '#236a80', color: 'white' }} onClick={applyFilter}>
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

export default VehicleHistory;
