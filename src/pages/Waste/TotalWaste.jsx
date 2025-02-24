import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { IoFilter } from "react-icons/io5";
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import Swal from 'sweetalert2';
import moment from 'moment';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './Waste.css';
import { useNavigate } from 'react-router-dom';
import bin from '../../assests/images/binnew.png';

function WasteDash() {
  const [wasteData, setWasteData] = useState([]);
  const [filteredWasteData, setFilteredWasteData] = useState([]);
  const [selectedWasteType, setSelectedWasteType] = useState('');
  const [totalWeight, setTotalWeight] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchWasteData();
  }, []);

  useEffect(() => {
    calculateTotalWeight();
  }, [selectedWasteType, selectedUser, wasteData]);

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
      setFilteredWasteData(sortedData);
    } catch (error) {
      console.error('Error fetching waste data:', error);
      Swal.fire('Error', 'Failed to fetch waste data.', 'error');
    }
  };

  const calculateTotalWeight = () => {
    if (!selectedWasteType || !selectedUser) {
      setTotalWeight(0);
      return;
    }
    const currentMonth = moment().format('YYYY-MM');
    const total = wasteData
      .filter(waste => waste.stationType === selectedWasteType && waste.userName === selectedUser && moment(waste.date).format('YYYY-MM') === currentMonth)
      .reduce((sum, waste) => sum + parseFloat(waste.weight), 0);
    setTotalWeight(total);
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center">
      <div className="row w-100">
        <div className="col-lg-6 col-md-8 col-sm-10 mx-auto">
          <div className="text-center mb-4">
            <h3>Total Waste <img src={bin} alt="Waste Bin" width="50px" /></h3>
          </div>
<div className='d-flex'>
<div className="d-flex align-items-center mb-3">
            <label className="me-2">Select User:</label>
            <select
              className="form-control w-50 me-3"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.userName} value={user.userName}>{user.userName}</option>
              ))}
            </select>
          </div>

          <div className="d-flex align-items-center mb-3">
            <label className="me-2">Select Waste Type:</label>
            <select
              className="form-control w-50"
              value={selectedWasteType}
              onChange={(e) => setSelectedWasteType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="General Waste">General Waste</option>
              <option value="Industrial Waste">Industrial Waste</option>
              <option value="Hazardous Waste">Hazardous Waste</option>
              <option value="Organic Waste">Organic Waste</option>
              <option value="Plastic Waste">Plastic Waste</option>
              <option value="Electronic and IT Waste">Electronic and IT Waste</option>
              <option value="Textile Waste">Textile Waste</option>
              <option value="Energy Waste">Energy Waste</option>
              <option value="Liquid Waste">Liquid Waste</option>
              <option value="Packaging Waste">Packaging Waste</option>
              <option value="Recyclable Waste">Recyclable Waste</option>
            </select>
          </div>
</div>
         

          <div className="d-flex justify-content-center">
            <div className="card p-4 text-center shadow-lg rounded-3 text-light bg-dark w-100">
              <h5>Total {selectedWasteType || 'Waste'} (This Month) for {selectedUser || 'All Users'}</h5>
              <p className="fs-4 fw-bold">{totalWeight} kg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WasteDash;
