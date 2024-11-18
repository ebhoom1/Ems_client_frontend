import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import { API_URL } from '../../utils/apiConfig';


const BillCalculator = () => {
  const { userData, userType } = useSelector(state => state.user);
  const [fixedCost, setFixedCost] = useState('');
  const [totalBill, setTotalBill] = useState(null);
  const [monthlyEnergyConsumption, setMonthlyEnergyConsumption] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (userType === 'admin') {
      fetchAllUsers();
    } else {
      setSelectedUser({ value: userData?.validUserOne?.userName, label: userData?.validUserOne?.userName });
    }
  }, [userType, userData]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/getallusers`);
      if (response.data && Array.isArray(response.data.users)) {
        const usersOptions = response.data.users.map(user => ({
          value: user.userName,
          label: user.userName,
        }));
        setAllUsers(usersOptions);
        setError('');
      } else {
        throw new Error('Unexpected data format received');
      }
    } catch (err) {
      setError('Error fetching users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateBill = async () => {
    if (!fixedCost) {
      setError('Please enter a valid fixed cost.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/calculate-bill`, {
        userName: selectedUser.value,
        fixedCost: Number(fixedCost),
      });
      setTotalBill(response.data.data.totalBill);
      setMonthlyEnergyConsumption(response.data.data.monthlyEnergyConsumption);
      setError('');
    } catch (err) {
      setError('Failed to calculate bill: ' + (err.response?.data?.message || err.message));
      setTotalBill(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (resultRef.current) {
      const element = resultRef.current;
      const options = {
        margin: 10,
        filename: 'bill-calculation.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      html2pdf().from(element).set(options).save();
    }
  };

  return (
    <div className="energy-flow-container mt-2 border border-solid shadow p-5" style={{borderRadius:'15px'}}>
      {userType === 'admin' && (
        <Select
          options={allUsers}
          onChange={setSelectedUser}
          value={selectedUser}
          placeholder="Select a user"
          isClearable
          isLoading={loading}
          className="mb-3"
        />
      )}

      {userType === 'user' && selectedUser && (
        <p className="mb-3">User: {selectedUser.label}</p>
      )}

      <div className="mb-3">
        <input
          type="number"
          className="form-control"
          placeholder="Enter fixed cost"
          value={fixedCost}
          onChange={e => setFixedCost(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <button
          onClick={calculateBill}
          disabled={!selectedUser || loading || !fixedCost}
          className="btn btn-primary"
        >
          Calculate Bill
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div ref={resultRef}>
        {totalBill !== null && (
          <div className="alert alert-success" role="alert" style={{ fontWeight: 'bold' }}>
            <p>Monthly Energy Consumption: {monthlyEnergyConsumption} kWh</p>
            <p>Fixed Cost: ₹{fixedCost}</p>
            <p>Total Bill: ₹{totalBill.toLocaleString()}</p>
          </div>
        )}
      </div>
      {totalBill !== null && (
        <button onClick={handleDownloadPDF} className="btn btn-info">Download Bill as PDF</button>
      )}
    </div>
  );
};

export default BillCalculator;
