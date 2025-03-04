import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { IoFilter } from "react-icons/io5";
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import Swal from 'sweetalert2';
import moment from 'moment';
import './Vehicle.css';
import {  useNavigate } from 'react-router-dom';

function Vehicles() {
  const [showModal, setShowModal] = useState(false);
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(sessionStorage.getItem('selectedUserId') || '');

  const [filterCriteria, setFilterCriteria] = useState({
    date: '',
    fuelType: '',
    userName: '',
  });

  const [formData, setFormData] = useState({
    userName: '',
    entryType: 'Vehicle',
    vehicleName: '',
    vehicleNumber: '',
    fuelType: '',
    averageFuelEconomy: '',
    litresUsed: '',
    date: '',
  });
  const navigate = useNavigate();
  useEffect(() => {
    fetchUsers();
    fetchVehicles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterCriteria]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/getallusers`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire('Error', 'Failed to fetch users.', 'error');
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/getAllEntries?entryType=Vehicle`);
      const sortedData = response.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setVehicles(sortedData);
      setFilteredVehicles(sortedData);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      Swal.fire('Error', 'Failed to fetch vehicle data.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/addEntry`, formData);
      Swal.fire('Success', 'Vehicle details added successfully!', 'success');
      fetchVehicles();
      setShowModal(false);
      setFormData({
        userName: '',
        entryType: 'Vehicle',
        vehicleName: '',
        vehicleNumber: '',
        fuelType: '',
        averageFuelEconomy: '',
        litresUsed: '',
        date: '',
      });
    } catch (error) {
      console.error('Error saving vehicle details:', error);
      Swal.fire('Error', 'Failed to save vehicle details.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/deleteEntry/${id}`);
      Swal.fire('Deleted!', 'Vehicle data has been deleted.', 'success');
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle record:', error);
      Swal.fire('Error', 'Failed to delete vehicle data.', 'error');
    }
  };

  const applyFilters = () => {
    let data = vehicles;
  
    // Get today's and yesterday's dates in UTC format
    const today = moment().utc().format('YYYY-MM-DD');
    const yesterday = moment().utc().subtract(1, 'days').format('YYYY-MM-DD');
  
    // Filter only today's and yesterday's data
    data = data.filter((item) => {
      const vehicleDate = moment(item.date).utc().format('YYYY-MM-DD');
      return vehicleDate === today || vehicleDate === yesterday;
    });
  
    // Apply additional filters if selected
    if (filterCriteria.date) {
      const selectedDate = moment(filterCriteria.date).utc().format('YYYY-MM-DD');
      data = data.filter((item) => moment(item.date).utc().format('YYYY-MM-DD') === selectedDate);
    }
    if (filterCriteria.fuelType) {
      data = data.filter((item) => item.fuelType === filterCriteria.fuelType);
    }
    if (filterCriteria.userName) {
      data = data.filter((item) => item.userName === filterCriteria.userName);
    }
  
    // *** New: Filter based on the selectedUserId ***
    if (selectedUserId) {
      data = data.filter((item) => item.userName === selectedUserId);
    }
  
    setFilteredVehicles(data);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setFormData({
      userName: '',
      entryType: '',
      vehicleName: '',
      vehicleNumber: '',
      fuelType: '',
      averageFuelEconomy: '',
      litresUsed: '',
      date: '',
    });
  };

  return (
    <div className="container-fluid">
      <h2>VEHICLE DASHBOARD</h2>
      <div className="d-flex justify-content-center align-items-center mt-4 mb-4">
        <Button
          style={{ backgroundColor: '#236a80', color: 'white', border: 'none' }}
          onClick={() => setShowModal(true)}
        >
          Add Vehicle
        </Button>
      </div>
      <div className='d-flex align-items-end justify-content-end mb-2'>
        <IoFilter
          size={25}
          style={{ cursor: 'pointer', color: '#236a80' }}
          onClick={() => setFilterDropdown(!filterDropdown)}
        />
      </div>

      {/* Filter Section */}
      <div className={`filter-container ${filterDropdown ? 'show' : 'hide'}`}>
        <div className="p-3 text-dark rounded shadow-sm">
          <div className="row">
            <div className="col-md-4">
              <label style={{ color: 'black' }}>Filter by Date:</label>
              <input
                type="date"
                className="form-control"
                value={filterCriteria.date}
                onChange={(e) =>
                  setFilterCriteria((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div className="col-md-4">
              <label style={{ color: 'black' }}>Filter by Fuel Type:</label>
              <select
                className="form-control"
                value={filterCriteria.fuelType}
                onChange={(e) =>
                  setFilterCriteria((prev) => ({ ...prev, fuelType: e.target.value }))
                }
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </select>
            </div>
            <div className="col-md-4">
              <label style={{ color: 'black' }}>Filter by User:</label>
              <select
                className="form-control"
                value={filterCriteria.userName}
                onChange={(e) =>
                  setFilterCriteria((prev) => ({ ...prev, userName: e.target.value }))
                }
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user.userName}>
                    {user.userName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={() => setFilterDropdown(false)}>
              Close
            </Button>
          </div>
        </div>
      </div>

      <div className=' d-flex justify-content-end align-items-end mb-2'>
        <button className="btn btn-outline-success" onClick={()=> navigate('/vehicle-history')}>
          Show Prev Data <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
      {selectedUserId && <h3 className="text-center">Showing data for: {selectedUserId}</h3>}

      {/* Display Vehicles */}
      <div className="container-fluid">
        <div className="row">
          {filteredVehicles.map((vehicle, index) => (
            <div key={index} className="col-md-4 mb-3">
              <div className="card p-3 shadow" style={{ borderRadius: "10px", backgroundColor: "#236a80", color: "#fff", border: 'none' }}>
                <h5>{vehicle.vehicleName}</h5>
                <p><strong>UserName:{vehicle.userName}</strong></p>
                <p><strong>Number:</strong> {vehicle.vehicleNumber}</p>
                <p><strong>Fuel Type:</strong> {vehicle.fuelType}</p>
                <p><strong>Average Economy:</strong> {vehicle.averageFuelEconomy} km/l</p>
                <p><strong>Litres Used:</strong> {vehicle.litresUsed} L</p>
                <p><strong>Date:</strong> {moment(vehicle.date).format('DD-MM-YYYY')}</p>
                <div className="d-flex justify-content-end">
                  <FaEdit className="me-2" style={{ cursor: "pointer", color: "orange" }} />
                  <FaTrash style={{ cursor: "pointer", color: "red" }} onClick={() => handleDelete(vehicle._id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Vehicle Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="vehicleForm" onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>User Name:</Form.Label>
              <Form.Select
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user.userName}>
                    {user.userName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Entry Type:</Form.Label>
              <Form.Select
                name="entryType"
                value={formData.entryType}
                onChange={handleChange}
                required
              >
                <option value="">Select Entry Type</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Generator">Generator</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Vehicle Name:</Form.Label>
              <Form.Control
                type="text"
                name="vehicleName"
                value={formData.vehicleName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Vehicle Number:</Form.Label>
              <Form.Control
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fuel Type:</Form.Label>
              <Form.Select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                required
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Average Fuel Economy (km/l):</Form.Label>
              <Form.Control
                type="number"
                name="averageFuelEconomy"
                value={formData.averageFuelEconomy}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Litres Used:</Form.Label>
              <Form.Control
                type="number"
                name="litresUsed"
                value={formData.litresUsed}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date:</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="submit"
            form="vehicleForm"
            style={{ backgroundColor: '#236a80', color: 'white', border: 'none' }}
          >
            Save
          </Button>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Vehicles;