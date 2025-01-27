import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import icons for edit and delete
import DashboardSam from '../Dashboard/DashboardSam';
import Maindashboard from '../Maindashboard/Maindashboard';
import Header from '../Header/Hedaer';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import Swal from 'sweetalert2';
import waste from '../../assests/images/waste.svg';
import HeaderSim from '../Header/HeaderSim';

function WasteDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [wasteData, setWasteData] = useState([]);
  const [filteredWasteData, setFilteredWasteData] = useState([]);
  const [editModal, setEditModal] = useState(false); // State for edit modal
  const [editFormData, setEditFormData] = useState({}); // State for edit form

  const [filters, setFilters] = useState({
    userName: '',
    date: '',
    stationType: '',
  });
  const [formData, setFormData] = useState({
    userName: '',
    stationName: '',
    stationType: '',
    weight: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  // Get date range for pagination
  const getDateRange = (page, days = 3) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (page * days + i));
      dates.push(
        date.toLocaleDateString('en-GB').split('/').reverse().join('-') // Format: DD-MM-YYYY
      );
    }
    return dates;
  };

  const recentDates = getDateRange(page);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/getallusers`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire('Error', 'Failed to fetch users.', 'error');
    }
  };

  // Fetch waste data and sort by latest date
  const fetchWasteData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/getallwaste`);
      const sortedData = response.data.wasteData.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      ); // Sort by latest date
      setWasteData(sortedData);
      setFilteredWasteData(sortedData); // Initialize filtered data
    } catch (error) {
      console.error('Error fetching waste data:', error);
      Swal.fire('Error', 'Failed to fetch waste data.', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchWasteData();
  }, []);

  // Handle input change for form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior
    setLoading(true);
  
    try {
      await axios.post(`${API_URL}/api/addwaste`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      Swal.fire('Success', 'Waste bin added successfully!', 'success');
      setFormData({
        userName: '',
        stationName: '',
        stationType: '',
        weight: '',
        date: '',
      });
      setShowModal(false); // Close the modal
      fetchWasteData(); // Refresh the table
    } catch (error) {
      console.error('Error adding waste bin:', error);
      Swal.fire('Error', 'Failed to add waste bin.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle waste deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/waste/${id}`);
      Swal.fire('Success', 'Waste record deleted successfully!', 'success');
      fetchWasteData(); // Refresh table
    } catch (error) {
      console.error('Error deleting waste record:', error);
      Swal.fire('Error', 'Failed to delete waste record.', 'error');
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...wasteData];
    if (filters.userName) {
      filtered = filtered.filter((item) =>
        item.userName.toLowerCase().includes(filters.userName.toLowerCase())
      );
    }
    if (filters.date) {
      filtered = filtered.filter((item) => item.date === filters.date);
    }
    if (filters.stationType) {
      filtered = filtered.filter((item) =>
        item.stationType.toLowerCase().includes(filters.stationType.toLowerCase())
      );
    }
    setFilteredWasteData(filtered);
  }, [filters, wasteData]);

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior
    setLoading(true);
  
    try {
      await axios.put(`${API_URL}/api/editwaste/${editFormData._id}`, editFormData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      Swal.fire('Success', 'Waste record updated successfully!', 'success');
      setEditModal(false); // Close the modal
      fetchWasteData(); // Refresh the table
    } catch (error) {
      console.error('Error updating waste record:', error);
      Swal.fire('Error', 'Failed to update waste record.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
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
          <div className="row">
            <div className="col-12">
              <Maindashboard />
            </div>
          </div>
          <div className="text-center mt-4">
            <Button
              style={{ backgroundColor: '#236a80', color: 'white', border: 'none' }}
              onClick={() => setShowModal(true)}
            >
              Add Waste Bin
            </Button>
          </div>

          {/* Filters */}
          <div className="row mt-4">
            <div className="col-md-4">
              <input
                type="text"
                name="userName"
                placeholder="Filter by User Name"
                className="form-control"
                value={filters.userName}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-4">
              <input
                type="date"
                name="date"
                className="form-control"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="stationType"
                placeholder="Filter by Station Type"
                className="form-control"
                value={filters.stationType}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Waste Table */}
          <div className="mt-5">
  <h3 className="text-center">Waste Records <img src={waste} alt="waste image"  width={'150px'}/></h3>
  <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
    <table className="table table-bordered table-hover mt-3">
      {/* Header with updated background and font colors */}
      <thead >
        <tr  >
          <th style={{ backgroundColor: '#236a80', color: 'white' }}>User Name</th>
          <th style={{ backgroundColor: '#236a80', color: 'white' }}>Station Name</th>
          <th style={{ backgroundColor: '#236a80', color: 'white' }}>Station Type</th>
          {recentDates.map((date) => (
            <th style={{ backgroundColor: '#236a80', color: 'white' }} key={date}>{date}</th>
          ))}
          <th style={{ backgroundColor: '#236a80', color: 'white' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
  {filteredWasteData
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by latest date first
    .map((waste, index) => (
      // Alternate row colors with gradient
      <tr
        key={waste._id}
        style={{
          backgroundColor: index % 2 === 0 ? '#f1f5f9' : '#e9eff4', // Light gradient effect
        }}
      >
        <td>{waste.userName}</td>
        <td>{waste.stationName}</td>
        <td>{waste.stationType}</td>
        {recentDates.map((date) => (
          <td key={`${waste._id}-${date}`}>
            {waste.date === date ? waste.weight : '-'}
          </td>
        ))}
        <td>
          <FaEdit
            style={{ color: 'blue', cursor: 'pointer', marginRight: '10px' }}
            onClick={() => {
              setEditFormData(waste); // Set the selected waste data
              setEditModal(true); // Open edit modal
            }}
          />
          <FaTrash
            style={{ color: 'red', cursor: 'pointer' }}
            onClick={() => handleDelete(waste._id)}
          />
        </td>
      </tr>
    ))}
</tbody>

    </table>
  </div>

  {/* Pagination */}
  <div className="text-center mt-3">
    <Button
      style={{ marginRight: '10px', backgroundColor: '#236a80', border: 'none' }}
      onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
      disabled={page === 0}
    >
      <i className="fa-solid fa-arrow-left me-1"></i>Prev
    </Button>
    <Button
      style={{ backgroundColor: '#236a80', border: 'none' }}
      onClick={() => setPage((prev) => prev + 1)}
    >
      Next <i className="fa-solid fa-arrow-right"></i>
    </Button>
  </div>
</div>


          {/* Modal */}
          <Modal
  show={showModal || editModal} // Open the modal for either add or edit
  onHide={() => {
    setShowModal(false);
    setEditModal(false);
    setFormData({}); // Clear form data
    setEditFormData({});
  }}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>
      {editModal ? 'Edit Waste Bin' : 'Add Waste Bin'}{' '}
      <img src={waste} alt="waste image" width={'150px'} />
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
  <form
  onSubmit={(e) => {
    e.preventDefault();
    if (editModal) {
      handleEditSubmit(e); // Pass the event to the edit handler
    } else {
      handleSubmit(e); // Pass the event to the add handler
    }
  }}
>
      <div className="form-group">
        <label htmlFor="userName">{editModal ? 'Edit User' : 'Select User'}:</label>
        <select
          id="userName"
          name="userName"
          className="form-control"
          value={editModal ? editFormData.userName : formData.userName}
          onChange={(e) =>
            editModal
              ? handleEditInputChange(e)
              : handleInputChange(e)
          }
          required
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.userName} value={user.userName}>
              {user.userName}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group mt-3">
        <label htmlFor="stationName">Station Name:</label>
        <input
          type="text"
          id="stationName"
          name="stationName"
          className="form-control"
          value={editModal ? editFormData.stationName : formData.stationName}
          onChange={(e) =>
            editModal
              ? handleEditInputChange(e)
              : handleInputChange(e)
          }
          required
        />
      </div>
      <div className="form-group mt-3">
  <label htmlFor="stationType">Waste Type:</label>
  <select
    id="stationType"
    name="stationType"
    className="form-control"
    value={editModal ? editFormData.stationType : formData.stationType}
    onChange={(e) =>
      editModal ? handleEditInputChange(e) : handleInputChange(e)
    }
    required
  >
    <option value="">Select Waste Type</option>
    <option value="General Waste">General Waste</option>
    <option value="Industrial Waste">Industrial Waste</option>
    <option value="Hazardous Waste">Hazardous Waste</option>
    <option value="Construction and Demolition Waste">Construction and Demolition Waste</option>
    <option value="Organic Waste">Organic Waste</option>
    <option value="Plastic Waste">Plastic Waste</option>
    <option value="Electronic and IT Waste">Electronic and IT Waste</option>
    <option value="Textile Waste">Textile Waste</option>
    <option value="Energy Waste">Energy Waste</option>
    <option value="Liquid Waste">Liquid Waste</option>
    <option value="Packaging Waste">Packaging Waste</option>
    <option value="Emissions and Gaseous Waste">Emissions and Gaseous Waste</option>
    <option value="Recyclable Waste">Recyclable Waste</option>
  </select>
</div>



      <div className="form-group mt-3">
        <label htmlFor="weight">Weight:</label>
        <input
          type="text"
          id="weight"
          name="weight"
          className="form-control"
          value={editModal ? editFormData.weight : formData.weight}
          onChange={(e) =>
            editModal
              ? handleEditInputChange(e)
              : handleInputChange(e)
          }
          required
        />
      </div>
      <div className="form-group mt-3">
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          className="form-control"
          value={editModal ? editFormData.date : formData.date}
          onChange={(e) =>
            editModal
              ? handleEditInputChange(e)
              : handleInputChange(e)
          }
          required
        />
      </div>
      <div className="text-center mt-4">
        <Button
          type="submit"
          style={{ backgroundColor: '#236a80', color: 'white', border: 'none' }}
          disabled={loading}
        >
          {loading
            ? editModal
              ? 'Updating...'
              : 'Submitting...'
            : editModal
            ? 'Update'
            : 'Submit'}
        </Button>
      </div>
    </form>
  </Modal.Body>
</Modal>


        </div>
      </div>
    </div>
  );
}

export default WasteDashboard;
