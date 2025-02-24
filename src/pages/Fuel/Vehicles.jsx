import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

function Vehicles() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    type: '',
    vehicleName: '',
    fuelType: '',
  });

  // Open the modal
  const openModal = () => {
    setShowModal(true);
  };

  // Close the modal and reset form data
  const closeModal = () => {
    setShowModal(false);
    setFormData({
      userName: '',
      type: '',
      vehicleName: '',
      fuelType: '',
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Vehicle Data:', formData);
    // You can send this data to your backend or store it in state as needed
    closeModal();
  };

  return (
    <div>
      <h2>VEHICLES DASHBOARD</h2>
      <Button
        style={{ backgroundColor: '#236a80', color: 'white', border: 'none' }}
        onClick={openModal}
      >
        Add Vehicle
      </Button>

      {/* React-Bootstrap Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Vehicle Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id="vehicleForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>User Name:</label>
              <input
                type="text"
                className="form-control"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Type:</label>
              <input
                type="text"
                className="form-control"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Vehicle Name:</label>
              <input
                type="text"
                className="form-control"
                name="vehicleName"
                value={formData.vehicleName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Fuel Type:</label>
              <input
                type="text"
                className="form-control"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                required
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          {/* Tie the submit button to the form via form="vehicleForm" */}
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
