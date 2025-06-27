import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import moment from 'moment';
import { toast } from 'react-toastify';
import { Oval } from 'react-loader-spinner'; 
import 'react-toastify/dist/ReactToastify.css';
import './index.css'; 
import { API_URL } from '../../utils/apiConfig';
import { FaChartLine, FaChartBar } from 'react-icons/fa'; // Import chart icons

// Register chart components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const WaterGraphPopup = ({ isOpen, onRequestClose, parameter, userName, stackName }) => {
    const [timeInterval, setTimeInterval] = useState('hour');
    const [graphData, setGraphData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chartType, setChartType] = useState('line'); // 'line' or 'bar'

    useEffect(() => {
        if (userName && stackName && parameter) {
            fetchData();
        }
    }, [timeInterval, userName, stackName, parameter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = '';
            if (timeInterval === 'hour') {
                url = `${API_URL}/api/average/user/${userName}/stack/${stackName}/interval/hour`;
            } else {
                url = `${API_URL}/api/average/user/${userName}/stack/${stackName}`;
            }
            const response = await fetch(url);
            const responseData = await response.json();
            if (responseData.success && Array.isArray(responseData.data)) {
                setGraphData(responseData.data);
            } else {
                setGraphData([]);
                toast.error("No data available.");
            }
        } catch (error) {
            toast.error('Failed to fetch data');
            console.error('Error fetching graph data:', error);
        } finally {
            setLoading(false);
        }
    };

  const processData = () => {
    if (!Array.isArray(graphData) || graphData.length === 0) {
        console.warn("⚠️ No valid data found in graphData!");
        return { labels: [], values: [] };
    }

    let labels = [];
    let values = [];

    // Group data by interval (hour, day, month)
    const groupedData = {};

    graphData.forEach(entry => {
        const stack = entry.stackData.find(s => s.stackName === stackName);
        if (!stack) return;

        const paramKey = Object.keys(stack.parameters).find(
            key => key.toLowerCase() === parameter.toLowerCase()
        );
        if (!paramKey) return;

        const paramValue = parseFloat(stack.parameters[paramKey] || 0);
        if (paramValue < 0) return;

        let key = '';
        if (timeInterval === 'hour') {
            // Filter to show only data from today
            if (!moment(entry.timestamp).isSame(moment(), 'day')) {
                return;
            }
            key = moment(entry.timestamp).format("HH:mm");
        } else if (timeInterval === 'day') {
            key = moment(entry.timestamp).format("DD/MM/YYYY");
        } else if (timeInterval === 'month') {
            key = moment(entry.timestamp).format("MMMM YYYY"); // Added year to avoid month collision
        }

        if (!groupedData[key]) {
            groupedData[key] = {
                timestamp: moment(entry.timestamp).toDate(),
                value: paramValue
            };
        } else {
            // Keep the latest value for the given time interval
            if (moment(entry.timestamp).isAfter(groupedData[key].timestamp)) {
                groupedData[key].timestamp = moment(entry.timestamp).toDate();
                groupedData[key].value = paramValue;
            }
        }
    });

    // Sort the keys (timestamps) and populate labels and values
    const sortedKeys = Object.keys(groupedData).sort((a, b) => {
        if (timeInterval === 'hour') {
            return moment(a, "HH:mm") - moment(b, "HH:mm");
        }
        if (timeInterval === 'day') {
            return moment(a, "DD/MM/YYYY") - moment(b, "DD/MM/YYYY");
        }
        if (timeInterval === 'month') {
            return moment(a, "MMMM YYYY") - moment(b, "MMMM YYYY");
        }
        return 0;
    });

    sortedKeys.forEach(key => {
        labels.push(key);
        values.push(groupedData[key].value);
    });

    return { labels, values };
};
    const { labels, values } = processData();
    
    const chartData = {
        labels,
        datasets: [
            {
                label: `${parameter} - ${stackName}`,
                data: values,
                fill: false,
                backgroundColor: '#236a80',
                borderColor: '#236A80',
                tension: 0.1,
                pointRadius: 5,
                pointHoverRadius: 10,
                pointHoverBorderWidth: 3,
                // For bar chart
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
            },
        ],
    };
    
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: `${parameter} Values Over Time (${timeInterval})`,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: timeInterval === 'hour'
                        ? 'Time (HH:mm)'
                        : timeInterval === 'day'
                        ? 'Date (DD/MM/YYYY)'
                        : 'Month',
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,
                },
            },
            y: {
                title: {
                    display: true,
                    text: `${parameter} Value`,
                },
                beginAtZero: true,
                suggestedMax: values.length ? Math.max(...values) : 5,
            },
        },
    };

    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '900px',
            height: '70%',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'auto',
        },
    };
    
    return (
        <div>
            <h5 style={{ marginTop: '20px' }} className="popup-title text-center">
                {parameter} - {stackName}
            </h5>
        
            <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                {/* Time interval buttons */}
                <div className="interval-buttons d-flex align-items-center justify-content-center flex-wrap" style={{ gap: '10px' }}>
                    {['hour', 'day', 'month'].map((interval) => (
                        <button
                            key={interval}
                            className={`interval-btn ${timeInterval === interval ? 'active' : ''}`}
                            onClick={() => setTimeInterval(interval)}
                            style={{
                                backgroundColor: '#236a80',
                                color: '#fff',
                                border: 'none',
                                padding: '7px 15px',
                                borderRadius: '5px',
                                textAlign: 'center',
                                minWidth: '80px',
                            }}
                        >
                            {interval.charAt(0).toUpperCase() + interval.slice(1)}
                        </button>
                    ))}
                </div>
                
                {/* Chart type toggle */}
                <div className="chart-type-toggle d-flex align-items-center" style={{ gap: '10px', marginLeft: '20px' }}>
                    <button
                        className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                        onClick={() => setChartType('line')}
                        style={{
                            backgroundColor: chartType === 'line' ? '#236a80' : '#e0e0e0',
                            color: chartType === 'line' ? '#fff' : '#333',
                            border: 'none',
                            padding: '7px 15px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            marginBottom:'18px'
                        }}
                        title="Line Chart"
                    >
                        <FaChartLine /> Line
                    </button>
                    <button
                        className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                        onClick={() => setChartType('bar')}
                        style={{
                            backgroundColor: chartType === 'bar' ? '#236a80' : '#e0e0e0',
                            color: chartType === 'bar' ? '#fff' : '#333',
                            border: 'none',
                            padding: '7px 15px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                               marginBottom:'18px'
                        }}
                        title="Bar Chart"
                    >
                        <FaChartBar /> Bar
                    </button>
                </div>
            </div>
        
            {loading ? (
                <div className="loading-container d-flex align-items-center justify-content-center">
                    <Oval
                        height={60}
                        width={60}
                        color="#236A80"
                        ariaLabel="Fetching details"
                        secondaryColor="#e0e0e0"
                        strokeWidth={2}
                        strokeWidthSecondary={2}
                    />
                    <p className="mt-3">Loading data, please wait...</p>
                </div>
            ) : labels.length === 0 ? (
                <div className="no-data-container mt-3">
                    <h5>No data available for {parameter} ({timeInterval})</h5>
                    <p>Please try a different interval or check back later.</p>
                </div>
            ) : (
                <div
                    className="chart-container mt-3 d-flex align-items-center justify-content-center"
                    style={{ height: '300px' }}
                >
                    {chartType === 'line' ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <Bar data={chartData} options={chartOptions} />
                    )}
                </div>
            )}
        </div>
    );
};

export default WaterGraphPopup;