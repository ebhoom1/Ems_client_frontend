import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { API_URL } from '../../utils/apiConfig';
import './index.css'; // Ensure you have styles defined

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    width: '500px', // Fixed width for better design
    maxWidth: '90vw', // Ensures responsiveness
    height: 'auto',
    padding: '25px',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
    background: '#fff',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

const FlowDataModal = ({ isOpen, onRequestClose }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [userName, setUserName] = useState('');
  const [interval, setInterval] = useState('daily');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { userType, userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (userType === 'admin') {
      axios.get(`${API_URL}/api/getallusers`)
        .then(response => setUsers(response.data.users))
        .catch(error => console.error('Error fetching users:', error));
    } else if (userType === 'user' && userData?.validUserOne?.userName) {
      setUserName(userData.validUserOne.userName);
    }
  }, [userType, userData]);

  const handleViewClick = () => {
    navigate('/view-difference', {
      state: {
        userName,
        interval,
        fromDate: moment(fromDate).format('DD-MM-YYYY'),
        toDate: moment(toDate).format('DD-MM-YYYY'),
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <div className="modal-header d-flex justify-content-between align-items-center">
        <h5 className="modal-title">Flow Data</h5>
        <button type="button" className="close btn-close" onClick={onRequestClose} />
      </div>
      
      <div className="modal-body">
        {userType === 'admin' && (
          <div className="form-group">
            <label className="form-label">User Name</label>
            <select className="form-control form-select" onChange={(e) => setUserName(e.target.value)}>
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.userName} value={user.userName}>
                  {user.userName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Interval</label>
          <select className="form-control form-select" onChange={(e) => setInterval(e.target.value)}>
            <option value="daily">Daily</option>
          
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">From Date</label>
          <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">To Date</label>
          <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
      </div>

      <div className="modal-footer d-flex justify-content-between">
        <button className="btn btn-outline-secondary" onClick={onRequestClose}>Close</button>
        <button className="btn btn-primary" onClick={handleViewClick}>View Data</button>
      </div>
    </Modal>
  );
};

export default FlowDataModal;
