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

  // Fetch the difference data, then for the most recent date (with cumulatingFlowDifference),
  // filter and show data for that date and the previous 5 days.
  const fetchDailyConsumptionData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.ocems.ebhoom.com/api/difference/${userName}?interval=daily`);
      const result = await response.json();
      console.log("Difference API Response:", result);
      if (result.success && Array.isArray(result.data)) {
        // Filter data by userName, stackName and ensure cumulatingFlowDifference exists
        let filteredData = result.data.filter(
          item =>
            item.userName === userName &&
            item.stackName === stackName &&
            item.cumulatingFlowDifference !== undefined &&
            item.cumulatingFlowDifference !== null
        );

        if (filteredData.length === 0) {
          toast.error('No difference data available');
          setGraphData([]);
          return;
        }

        // Sort data descending by date (most recent first)
        filteredData.sort(
          (a, b) =>
            moment(b.date, 'DD/MM/YYYY').valueOf() -
            moment(a.date, 'DD/MM/YYYY').valueOf()
        );

        // Use the most recent date as the selected date.
        const selectedDate = filteredData[0].date;
        const selectedMoment = moment(selectedDate, 'DD/MM/YYYY');
        // Determine the start date (5 days before the selected date)
        const startDate = selectedMoment.clone().subtract(5, 'days');

        // Filter records with dates between startDate and selectedMoment (inclusive)
        let rangeData = filteredData.filter(item => {
          const itemDate = moment(item.date, 'DD/MM/YYYY');
          return itemDate.isBetween(startDate, selectedMoment, null, '[]');
        });

        // Sort the range data in ascending order so the oldest appears first
        rangeData.sort(
          (a, b) =>
            moment(a.date, 'DD/MM/YYYY').valueOf() -
            moment(b.date, 'DD/MM/YYYY').valueOf()
        );

        // Remove duplicate dates - keep only the first record for each unique date
        const dedupedData = [];
        const seenDates = new Set();
        rangeData.forEach(item => {
          if (!seenDates.has(item.date)) {
            dedupedData.push(item);
            seenDates.add(item.date);
          }
        });

        setGraphData(dedupedData);
      } else {
        toast.error('No difference data available');
        setGraphData([]);
      }
    } catch (error) {
      toast.error('Failed to fetch difference data');
      console.error('Error fetching difference data:', error);
      setGraphData([]);
    } finally {
      setLoading(false);
    }
  };

  // Process data to create labels and values arrays for the chart.
  const processGraphData = () => {
    const labels = graphData.map(item => item.date);
    const values = graphData.map(item => item.cumulatingFlowDifference);
    return { labels, values };
  };

  const { labels, values } = processGraphData();

  const chartData = {
    labels,
    datasets: [
      {
        label: `Cumulating Flow Difference - ${stackName}`,
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
        text: 'Cumulating Flow Difference Over Selected 5 Days',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => `Date: ${tooltipItems[0].label}`,
          label: (tooltipItem) => {
            const value = tooltipItem.raw;
            return `Cumulating Flow Difference: ${parseFloat(value).toFixed(2)} m³`;
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
          maxTicksLimit: 6,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Cumulating Flow Difference (m³)',
        },
        beginAtZero: true,
        suggestedMax: Math.max(...values, 5),
      },
    },
  };

  return (
    <div className="graph-container">
      <h5 className="popup-title text-center mt-5">
        Cumulating Flow Difference - {stackName}
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
          <h5>No data available for cumulating flow difference</h5>
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
