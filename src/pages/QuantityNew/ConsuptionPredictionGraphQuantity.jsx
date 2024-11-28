
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import Select from 'react-select';
import moment from 'moment';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import { API_URL } from '../../utils/apiConfig';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ConsuptionPredictionGraphQuantity = () => {
  const { userType, userData } = useSelector((state) => state.user);
  const [userName, setUserName] = useState('');
  const [stackNames, setStackNames] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [stackOptions, setStackOptions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: `${i + 1}`.padStart(2, '0'),
    label: moment(`${i + 1}`, 'M').format('MMMM'),
  }));

  useEffect(() => {
    if (userType === 'admin') {
      if (userData?.validUserOne?.adminType) {
        fetchUsersByAdminType(userData.validUserOne.adminType);
      } else {
        fetchAllUsers();
      }
    } else if (userType === 'user' && userData?.validUserOne?.userName) {
      setUserName(userData.validUserOne.userName);
      fetchStackOptions(userData.validUserOne.userName);
    }
  }, [userType, userData]);

  useEffect(() => {
    if (userName && stackNames.length > 0 && selectedMonth) {
      fetchGraphData();
    }
  }, [userName, stackNames, selectedMonth]);

  const fetchUsersByAdminType = async (adminType) => {
    try {
      const response = await axios.get(`${API_URL}/api/get-users-by-adminType/${adminType}`);
      const filteredUsers = response.data.users.filter((user) => user.userType === 'user');
      setUsers(
        filteredUsers.map((user) => ({
          value: user.userName,
          label: user.userName,
        }))
      );
    } catch (error) {
      console.error('Error fetching users by adminType:', error);
      alert('Failed to fetch users by adminType.');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/getallusers`);
      const filteredUsers = response.data.users.filter((user) => user.userType === 'user');
      setUsers(
        filteredUsers.map((user) => ({
          value: user.userName,
          label: user.userName,
        }))
      );
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users.');
    }
  };

  const handleUserChange = (selectedUser) => {
    setUserName(selectedUser.value);
    fetchStackOptions(selectedUser.value);
  };

  const fetchStackOptions = async (userName) => {
    if (!userName) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/get-stacknames-by-userName/${userName}`
      );
      setStackOptions(
        response.data.stackNames.map((stack) => ({
          value: stack.name,
          label: stack.name,
        }))
      );
    } catch (error) {
      console.error('Error fetching stack names:', error);
      alert('Failed to fetch stack names.');
    }
  };

  const fetchGraphData = async () => {
    setLoading(true);
    const stackNamesParams = stackNames
      .map((name) => `stackNames=${encodeURIComponent(name)}`)
      .join('&');
    const url = `${API_URL}/api/consumptionDataByStacks?userName=${userName}&month=${selectedMonth}&${stackNamesParams}`;

    try {
      const response = await axios.get(url);
      setGraphData(response.data);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      alert('Failed to fetch graph data.');
    } finally {
      setLoading(false);
    }
  };

  const processData = () => {
    const labels = graphData.map((data) => `${data.date}, ${data.hour}:00`);
    const datasets = stackNames.map((name, index) => {
      const color = `hsl(${(index * 360) / stackNames.length}, 70%, 50%)`;
      const stackData = graphData.map((entry) =>
        entry.stacks.find((s) => s.stackName === name)?.flowMonthlyConsumption || 0
      );

      return {
        label: name,
        data: stackData,
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 10,
        pointHoverBorderWidth: 3,
      };
    });

    return { labels, datasets };
  };

  const { labels, datasets } = processData();

  const chartData = { labels, datasets };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: 'white' },
      },
      title: {
        display: true,
        text: 'Monthly Flow Consumption Over Time',
        color: 'white',
      },
    },
    scales: {
      x: { title: { display: true, text: 'Date and Hour', color: 'white' }, ticks: { color: 'white' } },
      y: { title: { display: true, text: 'Flow (l)', color: 'white' }, ticks: { color: 'white' }, beginAtZero: true },
    },
  };

  return (
    <div className="energy-flow-containe">
      <h3 className="text-center mb-4 text-light">Monthly Flow </h3>
      <div className="row mb-4 d-flex align-items-center">
        <div className="col-md-6 mb-3">
          <Select
            options={users}
            onChange={handleUserChange}
            placeholder="Select User Name"
            isMulti={false}
          />
        </div>
        <div className="col-md-6 mb-3">
          <Select
            options={stackOptions}
            onChange={(options) =>
              setStackNames(options.map((option) => option.value))
            }
            placeholder="Select Stack Name(s)"
            isDisabled={!stackOptions.length}
            isMulti={true}
          />
        </div>
        <div className="col-md-6">
          <Select
            options={months}
            onChange={(option) => setSelectedMonth(option.value)}
            placeholder="Select Month"
            value={months.find((m) => m.value === selectedMonth)}
          />
        </div>
      </div>

      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '300px' }}
        >
          <Oval height="60" width="60" color="#3498db" />
          <p className="ml-3">Loading data, please wait...</p>
        </div>
      ) : (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default ConsuptionPredictionGraphQuantity;
