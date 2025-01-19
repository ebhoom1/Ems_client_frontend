import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import Maindashboard from '../Maindashboard/Maindashboard';
import { API_URL } from '../../utils/apiConfig';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';
import moment from 'moment';

const WasteNew = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wasteData, setWasteData] = useState([]);
  const [formData, setFormData] = useState({
    userName: '',
    userType: 'user',
  
    stations: [
      {
        stationName: '',
        stationType: '',
        kg: '',
        date: '',
      },
    ],
  });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const loggedInUserName = userData?.validUserOne?.userName;
  const userType = userData?.validUserOne?.userType;
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve the stored user ID from session storage
  console.log('Stored User ID:', storedUserId);  // Log the stored user ID for debugging
  // Fetch all users
  // Define fetchUsers function
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/getallusers`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire('Error', 'Failed to fetch users.', 'error');
    }
  };
  // Fetch waste data
// Fetch waste data
// Fetch waste data
const fetchWasteData = async () => {
  try {
    setLoading(true);

    // Determine userId based on logged-in user's role
    const userId = userType === 'user' ? loggedInUserName : storedUserId || '';

    console.log('Fetching waste data for userId:', userId);

    const response = await axios.get(`${API_URL}/api/waste`, {
      params: { userId }, // Pass userId for filtering
    });

    setWasteData(response.data); // Set waste data based on API response
  } catch (error) {
    console.error('Error fetching waste data:', error);
    Swal.fire('Error', 'Failed to fetch waste data.', 'error');
  } finally {
    setLoading(false);
  }
};

// Effect to fetch waste data
useEffect(() => {
  fetchWasteData();
}, [storedUserId, loggedInUserName, userType]);


useEffect(() => {
  if (userType === 'admin') {
    fetchUsers();
  }
}, [userType]);

  useEffect(() => {
    fetchWasteData();
    if (userType === 'admin') {
      fetchUsers();
    }
  }, []);
  useEffect(() => {
    fetchWasteData();
  }, [storedUserId, loggedInUserName]);
  // Handle input changes
  const handleInputChange = (e, index, field) => {
    if (field) {
      const updatedStations = [...formData.stations];
      updatedStations[index][field] = e.target.value;
      setFormData((prevData) => ({ ...prevData, stations: updatedStations }));
    } else {
      const { name, value } = e.target;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // Add new station
  const addStation = () => {
    setFormData((prevData) => ({
      ...prevData,
      stations: [
        ...prevData.stations,
        {
          stationName: '',
          stationType: '',
          kg: '',
          date: moment().format('YYYY-MM-DD'),
        },
      ],
    }));
  };

  // Remove station
  const removeStation = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      stations: prevData.stations.filter((_, i) => i !== index),
    }));
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Ensure headers are set correctly if your server expects JSON data
    const config = {
        headers: {
            'Content-Type': 'application/json',
            // Add Authorization headers here if needed
        }
    };

    const url = `${API_URL}/api/waste${editing ? `/${editId}` : ''}`;
    console.log("Submitting data to:", url);  // Log the URL
    console.log("Data being submitted:", formData);  // Log the data being submitted

    try {
        const method = editing ? axios.put : axios.post;
        const response = await method(url, formData, config);
        console.log("Response from server:", response.data);  // Log the server response

        Swal.fire('Success', `Waste data ${editing ? 'updated' : 'added'} successfully!`, 'success');
        setShowModal(false);
        setFormData({
            userName: '',
            userType: 'user',
            stations: [{ stationName: '', stationType: '', kg: '', date: moment().format('DD-MM-YYYY') }],
        });
        setEditing(false);
        setEditId(null);
        fetchWasteData();
    } catch (error) {
        console.error('Error submitting waste data:', error.response ? error.response.data : error.message);
        Swal.fire('Error', error.response ? error.response.data.message : 'Failed to submit waste data.', 'error');
    } finally {
        setLoading(false);
    }
};

  // Handle edit button click
  // Handle edit button click
const handleEdit = (waste) => {
  const currentTime = moment();
  const createdAt = moment(waste.createdAt);
  const timeDiff = currentTime.diff(createdAt, 'hours');

  if (userType === 'admin' || (userType === 'user' && timeDiff <= 24)) {
    const editableFormData = {
      ...waste,
      stations: waste.stations.map(station => ({
        ...station,
        date: moment(station.date).format('DD-MM-YYYY'),
      })),
    };
    setFormData(editableFormData);
    setEditId(waste._id);
    setEditing(true);
    setShowModal(true);
  } else if (userType === 'user' && timeDiff > 24) {
    Swal.fire('Access Denied', 'You can only edit data within 24 hours. Please contact an admin for further assistance.', 'warning');
  }
};

// Include this updated handleEdit function in your component logic where you define other functions.


  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/waste/${id}`);
      Swal.fire('Deleted', 'Waste data deleted successfully!', 'success');
      fetchWasteData();
    } catch (error) {
      console.error('Error deleting waste data:', error);
      Swal.fire('Error', 'Failed to delete waste data.', 'error');
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
              <Hedaer />
            </div>
          </div>
          <div className="row">
            <div className={`col-12 ${userData?.validUserOne?.userType === 'user' ? 'mt-5' : 'mt-3'}`}>
              <Maindashboard />
            </div>
          </div>
          <div className="text-center mt-4">
            <Button
              style={{ backgroundColor: '#236a80', color: 'white', border: 'none' }}
              onClick={() => setShowModal(true)}
            >
              Add Waste
            </Button>
          </div>
         
          <div className="row mt-4">
  {wasteData.length > 0 ? (
    wasteData
      .filter((waste) => {
        // Additional filter to only show data where any station has a 'stationType' of 'waste'
        return waste.stations.some(station => station.stationType === 'waste');
      })
      .filter((waste) => {
        // For user role, show only their details
        if (userType === 'user') {
          return waste.userName === loggedInUserName;
        }
        // For admin, show all data or filtered by storedUserId
        if (storedUserId) {
          return waste.userName === storedUserId;
        }
        return true; // Show all data for admin if no filter is applied
      })
      .sort((a, b) => moment(b.updatedAt).valueOf() - moment(a.updatedAt).valueOf())
      .length > 0 ? (
        wasteData
          .filter((waste) => {
            return waste.stations.some(station => station.stationType === 'waste');
          })
          .filter((waste) => {
            if (userType === 'user') {
              return waste.userName === loggedInUserName;
            }
            if (storedUserId) {
              return waste.userName === storedUserId;
            }
            return true;
          })
          .sort((a, b) => moment(b.updatedAt).valueOf() - moment(a.updatedAt).valueOf())
          .map((waste) => (
            <div key={waste._id} className="col-md-4 mb-4">
              <div className="card border shadow">
                <div className="card-body">
                  <h5 className="card-title text-light">{waste.userName}</h5>
                  {waste.stations
                    .filter(station => station.stationType === 'waste')
                    .map((station) => (
                      <div key={station._id} className="mb-3">
                        <p className="text-light"><strong>Station Name:</strong> {station.stationName}</p>
                        <p className="text-light"><strong>Station Type:</strong> {station.stationType}</p>
                        <p className="text-light"><strong>Weight:</strong> {station.kg} kg</p>
                        <p className="text-light"><strong>Date:</strong> {moment(station.date).format('DD-MM-YYYY')}</p>
                      </div>
                    ))}
                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="warning" onClick={() => handleEdit(waste)}>
                      <i className="fa-solid fa-pen"></i>
                    </Button>
                    {userType === 'admin' && (
                      <Button variant="danger" onClick={() => handleDelete(waste._id)}>
                        <i className="fa-solid fa-trash"></i>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
      ) : (
        <p className="text-center" style={{ color: 'red' }}>No data available for the selected user.</p>
      )
  ) : (
    <p className="text-center" style={{ color: 'red' }}>No waste data available.</p>
  )}
</div>





          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>{editing ? 'Edit Waste Details' : 'Add Waste Details'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <form className="custom-report-form" onSubmit={handleSubmit}>
  <div className="row">
    <div className="form-group col-md-6">
      <label htmlFor="userName">User Name:</label>
      <select
        id="userName"
        name="userName"
        className="form-control"
        value={formData.userName}
        onChange={handleInputChange}
        style={{ borderRadius: '10px' }}
        required
      >
        <option value="">Select User</option>
        {userType === 'admin'
          ? users.map((user) => (
              <option key={user.userName} value={user.userName}>
                {user.userName}
              </option>
            ))
          : <option value={loggedInUserName}>{loggedInUserName}</option>}
      </select>
    </div>
  
    {formData.stations.map((station, index) => (
      <div key={index} className="row">
        <div className="form-group col-md-6">
          <label htmlFor="stationName">Station Name:</label>
          <input
            type="text"
            name="stationName"
            className="form-control"
            value={station.stationName}
            onChange={(e) => handleInputChange(e, index, 'stationName')}
            style={{ borderRadius: '10px' }}
            required
          />
        </div>
       
        <div className="form-group col-md-6">
          <label htmlFor="stationType">Station Type:</label>
          <input
            type="text"
            name="stationType"
            className="form-control"
            value={station.stationType}
            onChange={(e) => handleInputChange(e, index, 'stationType')}
            style={{ borderRadius: '10px' }}
            required
          />
        </div> 
        <div className="form-group col-md-6">
          <label htmlFor="kg">Weight (kg):</label>
          <input
            type="number"
            name="kg"
            className="form-control"
            value={station.kg}
            onChange={(e) => handleInputChange(e, index, 'kg')}
            style={{ borderRadius: '10px' }}
            required
          />
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            name="date"
            className="form-control"
            value={station.date}
            onChange={(e) => handleInputChange(e, index, 'date')}
            style={{ borderRadius: '10px' }}
            required
          />
        </div>
        <div className="form-group col-md-12 text-right mt-2">
          <Button
            variant="danger"
            onClick={() => removeStation(index)}
            style={{ borderRadius: '10px' }}
          >
            Remove Station
          </Button>
        </div>
      </div>
    ))}
    <div className="text-center mt-4">
      <Button
        onClick={addStation}
        style={{ backgroundColor: '#236a80', color: 'white', border: 'none' }}
      >
        Add Another Station
      </Button>
    </div>
    <div className="text-center mt-4">
      <Button
        type="submit"
        disabled={loading}
        style={{ backgroundColor: '#236a80', color: 'white', border: 'none' }}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </Button>
    </div>
    </div>
  </form>

            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default WasteNew;
