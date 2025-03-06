import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
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

const WaterGraphPopup = ({ isOpen, onRequestClose, parameter, userName, stackName }) => {
    const [timeInterval, setTimeInterval] = useState('hour');
    const [graphData, setGraphData] = useState([]);
    const [loading, setLoading] = useState(false);

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
                // Fetch hourly data for today
                url = `${API_URL}/api/average/user/${userName}/stack/${stackName}/interval/hour`;
            } else {
                // For daily and monthly, fetch all data and then process/group it
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

        let filteredData = [];

        if (timeInterval === 'hour') {
            // Filter only today's entries
            filteredData = graphData.filter(entry =>
                moment(entry.timestamp).isSame(moment(), 'day')
            );
        } else {
            // For day and month, work with all available data
            filteredData = graphData;
        }

        let labels = [];
        let values = [];

        if (timeInterval === 'hour') {
            filteredData.forEach(entry => {
                const stack = entry.stackData.find(s => s.stackName === stackName);
                if (!stack) return;
                const paramKey = Object.keys(stack.parameters).find(
                    key => key.toLowerCase() === parameter.toLowerCase()
                );
                if (!paramKey) return;
                const paramValue = stack.parameters[paramKey] || 0;
                // Format label as hour:minute
                labels.push(moment(entry.timestamp).format("HH:mm"));
                values.push(parseFloat(paramValue));
            });
        } else if (timeInterval === 'day') {
            // Group data by date (DD/MM/YYYY) and take the latest entry of each day
            const groupedByDate = {};
            filteredData.forEach(entry => {
                const dateLabel = moment(entry.timestamp).format("DD/MM/YYYY");
                if (!groupedByDate[dateLabel]) {
                    groupedByDate[dateLabel] = [];
                }
                groupedByDate[dateLabel].push(entry);
            });

            // Sort dates in descending order so the latest date comes first
            Object.keys(groupedByDate)
                .sort((a, b) => moment(b, "DD/MM/YYYY") - moment(a, "DD/MM/YYYY"))
                .forEach(dateLabel => {
                    const entries = groupedByDate[dateLabel];
                    // Get the latest entry for that date
                    const latestEntry = entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[entries.length - 1];
                    const stack = latestEntry.stackData.find(s => s.stackName === stackName);
                    if (!stack) return;
                    const paramKey = Object.keys(stack.parameters).find(
                        key => key.toLowerCase() === parameter.toLowerCase()
                    );
                    if (!paramKey) return;
                    const paramValue = stack.parameters[paramKey] || 0;
                    labels.push(dateLabel);
                    values.push(parseFloat(paramValue));
                });
        } else if (timeInterval === 'month') {
            // Group data by month (e.g., "MMMM YYYY") and take the latest entry for each month
            const groupedByMonth = {};
            filteredData.forEach(entry => {
                const monthLabel = moment(entry.timestamp).format("MMMM YYYY");
                if (!groupedByMonth[monthLabel]) {
                    groupedByMonth[monthLabel] = [];
                }
                groupedByMonth[monthLabel].push(entry);
            });

            // Sort months in descending order so the latest month comes first
            Object.keys(groupedByMonth)
                .sort((a, b) => moment(b, "MMMM YYYY") - moment(a, "MMMM YYYY"))
                .forEach(monthLabel => {
                    const entries = groupedByMonth[monthLabel];
                    const latestEntry = entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[entries.length - 1];
                    const stack = latestEntry.stackData.find(s => s.stackName === stackName);
                    if (!stack) return;
                    const paramKey = Object.keys(stack.parameters).find(
                        key => key.toLowerCase() === parameter.toLowerCase()
                    );
                    if (!paramKey) return;
                    const paramValue = stack.parameters[paramKey] || 0;
                    labels.push(monthLabel);
                    values.push(parseFloat(paramValue));
                });
        }

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

    useEffect(() => {
        console.log('Graph Data:', graphData);
        console.log('Processed Labels:', labels);
        console.log('Processed Values:', values);
    }, [graphData, labels, values]);

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
        
            <div 
                className="col interval-buttons d-flex align-items-center justify-content-center mt-3 flex-wrap"
                style={{ gap: '10px' }}
            >
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
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}
        </div>
    );
};

export default WaterGraphPopup;
