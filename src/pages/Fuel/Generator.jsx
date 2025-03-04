import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import './Generator.css'; // Optional: for additional styling
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import Swal from 'sweetalert2';

function Generator() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    entryType: '',
    generatorName: '',
    fuelType: '',
    litresUsed: '',
    date: '',
  });
  const [users, setUsers] = useState([]);

  // Fetch users when modal is opened
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/getallusers`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire('Error', 'Failed to fetch users.', 'error');
    }
  };

  // Open the modal and fetch users
  const openModal = () => {
    fetchUsers();
    setShowModal(true);
  };

  // Close the modal and reset form data
  const closeModal = () => {
    setShowModal(false);
    setFormData({
      userName: '',
      entryType: '',
      generatorName: '',
      fuelType: '',
      litresUsed: '',
      date: '',
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Generator Data:', formData);

    try {
      await axios.post(`${API_URL}/api/addGenerator`, formData);
      Swal.fire('Success', 'Generator details added successfully!', 'success');
      closeModal();
    } catch (error) {
      console.error('Error saving generator details:', error);
      Swal.fire('Error', 'Failed to save generator details.', 'error');
    }
  };

  return (
    <div>
      <h2>GENERATOR DASHBOARD</h2>
      <Button
        style={{ backgroundColor: '#236a80', color: 'white', border: 'none' }}
        onClick={openModal}
      >
        Add Generator
      </Button>

      {/* React-Bootstrap Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Generator Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="generatorForm" onSubmit={handleSubmit}>
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
                <option value="Generator">Generator</option>
                <option value="Fuel">Fuel</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Generator Name:</Form.Label>
              <Form.Control
                type="text"
                name="generatorName"
                value={formData.generatorName}
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
              </Form.Select>
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
          {/* Tie the submit button to the form via form="generatorForm" */}
          <Button
            type="submit"
            form="generatorForm"
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

export default Generator;
