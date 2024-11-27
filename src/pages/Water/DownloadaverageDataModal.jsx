import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { API_URL } from "../../utils/apiConfig";



const DownloadaverageDataModal = ({ isOpen, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeInterval, setTimeInterval] = useState('Hour');
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [stackOptions, setStackOptions] = useState([]);
  const [stackName, setStackName] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/getallusers`);
        const filteredUsers = response.data.users.filter(user => user.userType === "user");
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users.");
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchStackOptions = async () => {
      if (!userName) return;

      try {
        const response = await axios.get(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
        setStackOptions(response.data.stackNames || []);
      } catch (error) {
        console.error("Error fetching stack names:", error);
        alert("Failed to fetch stack names.");
      }
    };

    fetchStackOptions();
  }, [userName]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName || !stackName || !startDate || !endDate || !timeInterval) {
      alert("All fields are required!");
      return;
    }

    const formattedStartDate = startDate.split('-').reverse().join('-');
    const formattedEndDate = endDate.split('-').reverse().join('-');

    const downloadUrl = `${API_URL}/api/average/download/user/${userName}/stack/${stackName}/interval/${timeInterval}/time-range?startTime=${formattedStartDate}&endTime=${formattedEndDate}&format=csv`;

    try {
      const response = await axios.get(downloadUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${userName}_${stackName}_${timeInterval}_${formattedStartDate}_to_${formattedEndDate}.csv`;
      link.click();

      alert("Download successful!");
    } catch (error) {
      console.error("Error downloading data:", error);
      alert("Failed to download data.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Download Data Modal"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1050,
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '500px',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <h3 className="text-center">Download Average Data</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="user">User</label>
          <select
            id="user"
            name="user"
            className="form-control"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{ borderRadius: '10px' }}
          >
            <option value="">Select User</option>
            {users.map((item) => (
              <option key={item.userName} value={item.userName}>
                {item.userName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="stackName">Stack Name</label>
          <select
            id="stackName"
            name="stackName"
            className="form-control"
            value={stackName}
            onChange={(e) => setStackName(e.target.value)}
            style={{ borderRadius: '10px' }}
          >
            <option value="">Select Stack Name</option>
            {stackOptions.map((option, index) => (
              <option key={index} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ borderRadius: '10px' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ borderRadius: '10px' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="timeInterval">Time Interval</label>
          <select
            id="timeInterval"
            name="timeInterval"
            className="form-control"
            value={timeInterval}
            onChange={(e) => setTimeInterval(e.target.value)}
            style={{ borderRadius: '10px' }}
          >
            <option value="Hour">Hour</option>
            <option value="Day">Day</option>
            <option value="Month">Month</option>
            <option value="Year">Year</option>
          </select>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-primary mt-3">
            Submit
          </button>
          <button type="button" className="btn btn-secondary mt-3 ml-2" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DownloadaverageDataModal;
