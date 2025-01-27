import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import DashboardSam from '../Dashboard/DashboardSam';
import Maindashboard from '../Maindashboard/Maindashboard';
import Header from '../Header/Hedaer';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import Swal from 'sweetalert2';
import waste from '../../assests/images/waste.svg';
import moment from 'moment';
import Dropdown from 'react-bootstrap/Dropdown';
import { IoFilter } from "react-icons/io5";
import './Waste.css'
function WasteDash() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [wasteData, setWasteData] = useState([]);
  const [filteredWasteData, setFilteredWasteData] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [formData, setFormData] = useState({
    userName: '',
    stationName: '',
    stationType: '',
    weight: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    date: '',
    wasteType: '',
  });
  const [filterDropdown, setFilterDropdown] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState(
    sessionStorage.getItem('selectedUserId') || ''
  );

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/getallusers`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire('Error', 'Failed to fetch users.', 'error');
    }
  };

  const fetchWasteData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/getallwaste`);
      const sortedData = response.data.wasteData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setWasteData(sortedData);

      if (selectedUserId) {
        const filteredData = sortedData.filter((waste) => waste.userName === selectedUserId);
        setFilteredWasteData(filteredData);
      } else {
        setFilteredWasteData(sortedData);
      }
    } catch (error) {
      console.error('Error fetching waste data:', error);
      Swal.fire('Error', 'Failed to fetch waste data.', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchWasteData();
  }, [selectedUserId]);

  useEffect(() => {
    applyFilters();
  }, [filterCriteria]);

  const handleUserSelection = (userId) => {
    setSelectedUserId(userId);
    sessionStorage.setItem('selectedUserId', userId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/addwaste`, formData);
      Swal.fire('Success', 'Waste bin added successfully!', 'success');
      setFormData({ userName: '', stationName: '', stationType: '', weight: '', date: '' });
      setShowModal(false);
      fetchWasteData();
    } catch (error) {
      console.error('Error adding waste bin:', error);
      Swal.fire('Error', 'Failed to add waste bin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API_URL}/api/editwaste/${editFormData._id}`, editFormData);
      Swal.fire('Success', 'Waste record updated successfully!', 'success');
      setEditModal(false);
      fetchWasteData();
    } catch (error) {
      console.error('Error updating waste record:', error);
      Swal.fire('Error', 'Failed to update waste record.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/waste/${id}`);
      Swal.fire('Deleted!', 'Waste data has been deleted.', 'success');
      fetchWasteData();
    } catch (error) {
      console.error('Error deleting waste record:', error);
      Swal.fire('Error', 'Failed to delete waste data.', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let data = wasteData;
    if (filterCriteria.date) {
      data = data.filter((item) => item.date === filterCriteria.date);
    }
    if (filterCriteria.wasteType) {
      data = data.filter((item) => item.stationType === filterCriteria.wasteType);
    }
    setFilteredWasteData(data);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12">
          <Header onUserSelect={handleUserSelection} />
          <Maindashboard />

          <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
  <div></div>
  <Button
    style={{ backgroundColor: '#236a80', color: 'white', border: 'none' }}
    onClick={() => setShowModal(true)} // Properly toggles the modal visibility
  >
    Add Waste Bin
  </Button>
  <IoFilter
    size={24}
    style={{ cursor: 'pointer', color: '#236a80' }}
    onClick={() => setFilterDropdown(!filterDropdown)}
  />
</div>
<div>
    <h3 className='text-center'><i>{selectedUserId}</i></h3>
</div>

      <div
        className={`filter-container ${filterDropdown ? 'show' : ''}`}
      >
        <div className="bg-light p-3 rounded shadow-sm">
          <div className="row">
            <div className="col-md-6">
              <label htmlFor="filterDate">Filter by Date:</label>
              <input
                type="date"
                id="filterDate"
                className="form-control"
                value={filterCriteria.date}
                onChange={(e) =>
                  setFilterCriteria((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="filterWasteType">Filter by Waste Type:</label>
              <select
                id="filterWasteType"
                className="form-control"
                value={filterCriteria.wasteType}
                onChange={(e) =>
                  setFilterCriteria((prev) => ({ ...prev, wasteType: e.target.value }))
                }
              >
                <option value="">Select Waste Type</option>
                <option value="General Waste">General Waste</option>
                <option value="Industrial Waste">Industrial Waste</option>
                <option value="Hazardous Waste">Hazardous Waste</option>
              </select>
            </div>
          </div>
        </div>
      </div>

          <div className="container-fluid">
            <div className="row">
              {Object.entries(
                filteredWasteData.reduce((stations, waste) => {
                  if (!stations[waste.stationName]) {
                    stations[waste.stationName] = [];
                  }
                  stations[waste.stationName].push(waste);
                  return stations;
                }, {})
              ).map(([stationName, wastes], index) => (
                <div
                  key={index}
                  className="col-md-12 col-lg-12 col-sm-12 bg-light shadow mb-4 p-3 border-none"
                  style={{ borderRadius: '15px' }}
                >
                  <h3 className="text-center mb-3" style={{ color: '#236a80' , border:'none'}}>
                    {stationName} <img src={waste} alt="waste" width="150px" />
                  </h3>
                  <div className="row">
                    {wastes.map((waste, idx) => (
                      <div key={idx} className="col-md-3 col-lg-3 col-sm-6 mb-3">
                      <div
  className="card"
  style={{
    backgroundColor: '#236a80',
    color: '#fff',
    borderRadius: '10px',
    padding: '15px',
    textAlign: 'center',
    border: 'none',
    boxShadow: '0 24px 18px rgba(2, 20, 28, 0.1), 0 16px 20px rgba(14, 1, 1, 0.1)',
  }}
>
                          <h5>{waste.stationType}</h5>
                          <p>
                            <strong>Weight:</strong> {waste.weight} kg
                          </p>
                          <p>
                            <strong>Date:</strong> {moment(waste.date).format('DD-MM-YYYY')}
                          </p>
                          <div className="d-flex justify-content-end mt-3 ">
                            <FaEdit
                            className='me-2'
                              style={{ cursor: 'pointer', color: 'orange' }}
                              onClick={() => {
                                setEditFormData(waste);
                                setEditModal(true);
                              }}
                            />
                            <FaTrash
                              style={{ cursor: 'pointer', color: 'red' }}
                              onClick={() => handleDelete(waste._id)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Modal
            show={showModal || editModal}
            onHide={() => {
              setShowModal(false);
              setEditModal(false);
              setFormData({});
              setEditFormData({});
            }}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>{editModal ? 'Edit Waste Bin' : 'Add Waste Bin'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  editModal ? handleEditSubmit(e) : handleSubmit(e);
                }}
              >
                <div className="form-group">
                  <label htmlFor="userName">User Name:</label>
                  <select
                    id="userName"
                    name="userName"
                    className="form-control"
                    value={editModal ? editFormData.userName : formData.userName}
                    onChange={(e) =>
                      editModal ? handleEditInputChange(e) : handleInputChange(e)
                    }
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((user, index) => (
                      <option key={index} value={user.userName}>
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
                      editModal ? handleEditInputChange(e) : handleInputChange(e)
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
                      editModal ? handleEditInputChange(e) : handleInputChange(e)
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
                      editModal ? handleEditInputChange(e) : handleInputChange(e)
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

export default WasteDash;
