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
            const response = await fetch(
                `${API_URL}/api/average/user/${userName}/stack/${stackName}/interval/${timeInterval}`
            );
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                setGraphData(data);
            } else {
                setGraphData([]);
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
            return { labels: [], values: [] };
        }

        const labels = graphData.map((entry) =>
            moment(entry.interval).format('DD/MM/YYYY HH:mm')
        );

        const values = graphData.map((entry) => {
            const stack = entry.stackData.find(
                (stack) => stack.stackName === stackName
            );
            return stack ? stack.parameters[parameter] : 0;
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
                pointRadius: 5, // Default size of the dots
                pointHoverRadius: 10, // Size of the dots on hover
                pointHoverBorderWidth: 3, // Border width on hover
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
                text: `${parameter} Values Over Time`,
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        let value = tooltipItem.raw;
                        return `Value: ${value}`; // Tooltip message
                    },
                    title: (tooltipItems) => {
                        let timestamp = tooltipItems[0].label;
                        return `Time: ${timestamp}`; // Tooltip title with timestamp
                    },
                },
                titleFont: { size: 18 }, // Larger font for tooltip title
                bodyFont: { size: 16 }, // Larger font for tooltip value
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Interval',
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
                suggestedMax: Math.max(...values, 5),
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
            <h3 className="popup-title mt-3 text-center">{parameter} - {stackName}</h3>

            <div className="interval-buttons align-items-center justify-content-center mt-3 " >
                {['hour', 'day', 'week', 'month', 'sixmonths', 'year'].map((interval) => (
                    <button
                        key={interval}
                        className={`interval-btn ${timeInterval === interval ? 'active' : ''}`}
                        onClick={() => setTimeInterval(interval)}
                        style={{backgroundColor:'#236a80' , margin:'5px' , color:'#ffff' , border:'none' , alignItems:'center' , justifyContent:'center' , padding:'7px' , borderRadius:'5px' , marginLeft:'10px'}}
                    >
                        {interval.charAt(0).toUpperCase() + interval.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-container align-item-center justify-content-center">
                    <Oval
                        height={60}
                        width={60}
                        color="#236A80"
                        ariaLabel="Fetching details"
                        secondaryColor="#e0e0e0"
                        strokeWidth={2}
                        strokeWidthSecondary={2}
                    />
                    <p className='mt-3'>Loading data, please wait...</p>
                </div>
            ) : graphData.length === 0 ? (
                <div className="no-data-container mt-3">
                    <h5>No data available for {parameter} ({timeInterval})</h5>
                    <p>Please try a different interval or check back later.</p>
                </div>
            ) : (
                <div className="chart-container mt-3">
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}
       </div>
    );
};

export default WaterGraphPopup;
