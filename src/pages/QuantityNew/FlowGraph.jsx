import React, { useEffect, useState } from 'react';
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
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { toast } from 'react-toastify';
import { Oval } from 'react-loader-spinner';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { API_URL } from '../../utils/apiConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FlowGraph = ({ parameter, userName, stackName, dailyConsumptionData }) => {
  const [timeInterval, setTimeInterval] = useState('day');
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartHeight, setChartHeight] = useState(window.innerHeight * 0.4); // 40% of screen height

  useEffect(() => {
    if (parameter !== 'dailyConsumption' && userName && stackName && parameter) {
      // For other parameters, fetch hourly data as before
      fetchData();
    } else if (parameter === 'dailyConsumption') {
      // When showing daily consumption, use the prop from the parent
      if (dailyConsumptionData && dailyConsumptionData[stackName] !== undefined) {
        const today = moment().format('DD/MM/YYYY');
        // Create an array with a single object (for now) containing the daily consumption value
        setGraphData([{ date: today, consumption: dailyConsumptionData[stackName] }]);
      }
    }
  }, [timeInterval, userName, stackName, parameter, dailyConsumptionData]);

  useEffect(() => {
    const updateChartHeight = () => {
      setChartHeight(window.innerHeight * 0.4);
    };
    window.addEventListener('resize', updateChartHeight);
    return () => window.removeEventListener('resize', updateChartHeight);
  }, []);

  const getFormattedDate = () => {
    switch (timeInterval) {
      case 'day':
        return moment().format('DD/MM/YYYY');
      case 'month':
        return moment().format('MM/YYYY');
      case 'year':
        return moment().format('YYYY');
      default:
        return '';
    }
  };

  const fetchData = async () => {
    const formattedDate = getFormattedDate();
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/hourly-data?userName=${userName}&stackName=${stackName}&date=${formattedDate}`
      );
      const result = await response.json();
      console.log("API Response:", result);
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        setGraphData(result.data);
      } else {
        toast.error('No data available');
        setGraphData([]);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error fetching graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process graph data based on the parameter
  const processGraphData = () => {
    if (parameter === 'dailyConsumption') {
      // For daily consumption, graphData is an array of objects with date and consumption
      const labels = graphData.map(item => item.date);
      const values = graphData.map(item => item.consumption);
      return { labels, values };
    } else {
      // For other parameters, process the hourly cumulative flow data
      if (!graphData || graphData.length === 0) {
        return { labels: [], values: [] };
      }
      const labels = [];
      const values = [];
      graphData.forEach(entry => {
        const matchingStack = entry.stacks.find(stack => stack.stackName === stackName);
        if (matchingStack) {
          labels.push(
            moment(`${entry.date} ${entry.hour}`, 'DD/MM/YYYY HH').format('DD/MM/YYYY HH:mm')
          );
          values.push(matchingStack.cumulatingFlow || 0);
        }
      });
      return { labels, values };
    }
  };

  const { labels, values } = processGraphData();

  const chartData = {
    labels,
    datasets: [
      {
        label:
          parameter === 'dailyConsumption'
            ? `Daily Consumption - ${stackName}`
            : `${parameter} - ${stackName}`,
        data: values.length > 0 ? values : [0],
        fill: false,
        backgroundColor: '#236a80',
        borderColor: '#236A80',
        tension: 0.1,
        pointRadius: 5,
        pointHoverRadius: 10,
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text:
          parameter === 'dailyConsumption'
            ? 'Daily Consumption Values Over Time'
            : `${parameter} Values Over Time`,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => `Date: ${tooltipItems[0].label}`,
          label: (tooltipItem) => {
            const value = tooltipItem.raw;
            return parameter === 'dailyConsumption'
              ? `Consumption: ${parseFloat(value).toFixed(2)} m³`
              : `Value: ${parseFloat(value).toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: parameter === 'dailyConsumption' ? 'Date' : 'Time Interval',
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        title: {
          display: true,
          text:
            parameter === 'dailyConsumption'
              ? 'Daily Consumption (m³)'
              : `${parameter} Value`,
        },
        beginAtZero: true,
        suggestedMax: Math.max(...values, 5),
      },
    },
  };

  return (
    <div className="graph-container">
      <h5 className="popup-title text-center">
        {parameter} - {stackName}
      </h5>
      <div className="interval-buttons align-items-center justify-content-center mt-3">
        {['day'].map((interval) => (
          <button
            key={interval}
            style={{
              backgroundColor: '#236a80',
              margin: '5px',
              color: '#fff',
              border: 'none',
              padding: '7px',
              borderRadius: '5px',
              marginLeft: '10px',
            }}
            className={`interval-btn ${timeInterval === interval ? 'active' : ''}`}
            onClick={() => setTimeInterval(interval)}
          >
            {interval.charAt(0).toUpperCase() + interval.slice(1)}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="loading-container">
          <Oval height={60} width={60} color="#236A80" ariaLabel="Fetching details" strokeWidth={2} />
          <p>Loading data, please wait...</p>
        </div>
      ) : graphData.length === 0 ? (
        <div className="no-data-container">
          <h5>No data available for {parameter} ({timeInterval})</h5>
        </div>
      ) : (
        <div className="chart-wrapper" style={{ height: chartHeight, minHeight: '300px', maxHeight: '80vh' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default FlowGraph;
