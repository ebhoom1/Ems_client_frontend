import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
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
  ChartTitle,
  Tooltip,
  Legend
);

const FlowGraph = ({ parameter, userName, stackName }) => {
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartHeight, setChartHeight] = useState(window.innerHeight * 0.4);

  // Adjust chart height on window resize
  useEffect(() => {
    const onResize = () => setChartHeight(window.innerHeight * 0.4);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Fetch appropriate data when props change
  useEffect(() => {
    if (!userName || !stackName) return;
    if (parameter === 'dailyConsumption') {
      fetchDailyConsumptionData();
    } else if (parameter === 'cumulatingFlow') {
      fetchCumulatingFlowData();
    } else {
      // For other params (e.g. flowRate), clear data
      setGraphData([]);
    }
  }, [parameter, userName, stackName]);

  // Fetch last 5 days' daily consumption
  const fetchDailyConsumptionData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/difference/${userName}?interval=daily`);
      const { success, data } = await res.json();
      if (!success || !Array.isArray(data)) throw new Error('Invalid data');

      let filtered = data
        .filter(
          i =>
            i.userName === userName &&
            i.stackName === stackName &&
            i.cumulatingFlowDifference != null
        )
        .sort(
          (a, b) =>
            moment(a.date, 'DD/MM/YYYY').valueOf() -
            moment(b.date, 'DD/MM/YYYY').valueOf()
        );

      if (filtered.length > 5) filtered = filtered.slice(-5);

      setGraphData(
        filtered.map(i => ({ label: i.date, value: i.cumulatingFlowDifference }))
      );
    } catch (err) {
      console.error(err);
      toast.error('No daily consumption data');
      setGraphData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's cumulating flow by hour
  const fetchCumulatingFlowData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/hourly/today?userName=${userName}`);
      const { success, data } = await res.json();
      if (!success || !Array.isArray(data)) throw new Error('Invalid data');

      const arr = data
        .map(entry => {
          const s = entry.stacks.find(s => s.stackName === stackName);
          return { label: `${entry.hour}:00`, value: s ? s.cumulatingFlow : 0 };
        })
        .sort((a, b) => parseInt(a.label) - parseInt(b.label));

      setGraphData(arr);
    } catch (err) {
      console.error(err);
      toast.error('No cumulating flow data');
      setGraphData([]);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data and config
  const labels = graphData.map(d => d.label);
  const values = graphData.map(d => d.value);

  const configs = {
    dailyConsumption: {
      title: `Daily Consumption (last ${labels.length} days)`,
      yLabel: 'Consumption (m³)',
      color: '#236A80',
    },
    cumulatingFlow: {
      title: `Cumulating Flow Today — ${stackName}`,
      yLabel: 'Cumulating Flow (m³)',
      color: '#22C55E',
    },
  };

  const config = configs[parameter] || {};

  const chartData = {
    labels,
    datasets: [
      {
        label: config.title,
        data: values,
        fill: false,
        backgroundColor: config.color,
        borderColor: config.color,
        tension: 0.1,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: config.title || '' },
    },
    scales: {
      x: {
        title: { display: true, text: parameter === 'dailyConsumption' ? 'Date' : 'Hour' },
      },
      y: {
        title: { display: true, text: config.yLabel || '' },
        beginAtZero: true,
        suggestedMax: Math.max(...values, 0),
      },
    },
  };

  // Render states
  if (loading) {
    return (
      <div className="loading-container mt-5">
        <Oval height={60} width={60} color={config.color || '#236A80'} strokeWidth={2} />
        <p>Loading data…</p>
      </div>
    );
  }

  if (parameter === 'flowRate') {
    return (
      <div className="no-data-container">
        <h5>Please click on Cumulating Flow or Daily Consumption to view graph</h5>
      </div>
    );
  }

  if (!graphData.length) {
    return (
      <div className="no-data-container">
        <h5>No data available</h5>
      </div>
    );
  }

  return (
    <div className="chart-wrapper mt-5" style={{ height: chartHeight, minHeight: '300px' }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default FlowGraph;
