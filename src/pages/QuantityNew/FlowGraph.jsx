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

const FlowGraph = ({ parameter, userName, stackName }) => {
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartHeight, setChartHeight] = useState(window.innerHeight * 0.4); // 40% of screen height

  useEffect(() => {
    if (userName && stackName && parameter === 'dailyConsumption') {
      fetchDailyConsumptionData();
    }
  }, [userName, stackName, parameter]);

  useEffect(() => {
    const updateChartHeight = () => {
      setChartHeight(window.innerHeight * 0.4);
    };
    window.addEventListener('resize', updateChartHeight);
    return () => window.removeEventListener('resize', updateChartHeight);
  }, []);

  // Fetch all daily consumption data, then filter and display only the latest 5 days in descending order.
  const fetchDailyConsumptionData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/daily-consumption`);
      const result = await response.json();
      console.log("Daily Consumption API Response:", result);
      if (result.success && Array.isArray(result.data)) {
        // Filter by userName and stackName
        let filteredData = result.data.filter(
          item => item.userName === userName && item.stackName === stackName
        );

        // Sort data descending (most recent first) using moment (today will be first)
        filteredData.sort(
          (a, b) =>
            moment(b.date, 'DD/MM/YYYY').valueOf() -
            moment(a.date, 'DD/MM/YYYY').valueOf()
        );

        // Take only the latest 5 records
        const latestFive = filteredData.slice(0, 5).reverse();
        setGraphData(latestFive);

        // Note: We keep the descending order so that today's data is first
        setGraphData(latestFive);
      } else {
        toast.error('No daily consumption data available');
        setGraphData([]);
      }
    } catch (error) {
      toast.error('Failed to fetch daily consumption data');
      console.error('Error fetching daily consumption data:', error);
      setGraphData([]);
    } finally {
      setLoading(false);
    }
  };

  // Process data to create labels and values arrays for the chart.
  const processGraphData = () => {
    const labels = graphData.map(item => item.date);
    const values = graphData.map(item => item.consumption);
    return { labels, values };
  };

  const { labels, values } = processGraphData();

  const chartData = {
    labels,
    datasets: [
      {
        label: `Daily Consumption - ${stackName}`,
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
        text: 'Daily Consumption Values Over Time',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => `Date: ${tooltipItems[0].label}`,
          label: (tooltipItem) => {
            const value = tooltipItem.raw;
            return `Consumption: ${parseFloat(value).toFixed(2)} m³`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 5,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Daily Consumption (m³)',
        },
        beginAtZero: true,
        suggestedMax: Math.max(...values, 5),
      },
    },
  };

  return (
    <div className="graph-container">
      <h5 className="popup-title text-center mt-5">
        Daily Consumption - {stackName}
      </h5>
      {loading ? (
        <div className="loading-container">
          <Oval
            height={60}
            width={60}
            color="#236A80"
            ariaLabel="Fetching details"
            strokeWidth={2}
          />
          <p>Loading data, please wait...</p>
        </div>
      ) : graphData.length === 0 ? (
        <div className="no-data-container">
          <h5>No data available for daily consumption</h5>
        </div>
      ) : (
        <div
          className="chart-wrapper"
          style={{ height: chartHeight, minHeight: '300px', maxHeight: '80vh' }}
        >
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default FlowGraph;
