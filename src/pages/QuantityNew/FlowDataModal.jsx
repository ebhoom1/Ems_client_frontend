import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { API_URL } from '../../utils/apiConfig';
import './index.css'; // For custom styling

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    width: 'fit-content',
    height: 'auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
};

const FlowDataModal = ({ isOpen, onRequestClose }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [userName, setUserName] = useState('');
  const [interval, setInterval] = useState('daily');
  const [users, setUsers] = useState([]);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const navigate = useNavigate();
  const { userType, userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (userType === 'admin') {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/getallusers`);
          setUsers(response.data.users);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      fetchUsers();
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

  const handleDownloadClick = async (format) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/downloadDifferenceData`,
        {
          params: {
            userName,
            fromDate: moment(fromDate).format('DD-MM-YYYY'),
            toDate: moment(toDate).format('DD-MM-YYYY'),
            format,
            intervalType: interval,
          },
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${userName}_${interval}_${fromDate}_${toDate}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      alert(`Failed to download ${format}.`);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <div className="modal-header">
        <h5 className="modal-title">Flow Data</h5>
        <button type="button" className="close" onClick={onRequestClose}>
          &times;
        </button>
      </div>
      <div className="modal-body">
        {userType === 'admin' ? (
          <div className="form-group">
            <label>User Name</label>
            <select className="form-control" onChange={(e) => setUserName(e.target.value)}>
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.userName} value={user.userName}>
                  {user.userName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="form-group">
            <label>User Name</label>
            <input type="text" className="form-control" value={userName} readOnly />
          </div>
        )}
        <div className="form-group">
          <label>Interval</label>
          <select className="form-control" onChange={(e) => setInterval(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>
        <div className="form-group">
          <label>From Date</label>
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>To Date</label>
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>
      <div className="modal-footer">
        <div className="dropdown">
          <button
            className="btn btn-secondary dropdown-toggle"
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
          >
            Download
          </button>
          {showDownloadOptions && (
            <div className="dropdown-menu show">
              <button className="dropdown-item" onClick={() => handleDownloadClick('csv')}>
                Download as CSV
              </button>
              <button className="dropdown-item" onClick={() => handleDownloadClick('pdf')}>
                Download as PDF
              </button>
            </div>
          )}
        </div>
        <button className="btn btn-primary" onClick={handleViewClick}>
          View Data
        </button>
      </div>
    </Modal>
  );
};

export default FlowDataModal;
