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

const FlowGraph = ({ isOpen, onRequestClose, parameter, userName, stackName }) => {
    const [timeInterval, setTimeInterval] = useState('day');
    const [graphData, setGraphData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userName && stackName && parameter) {
            fetchData();
        }
    }, [timeInterval, userName, stackName, parameter]);

    const getFormattedDate = () => {
        switch (timeInterval) {
            case 'day':
                return moment().format('DD/MM/YYYY'); // Today's date in the required format
            case 'month':
                return moment().format('MM'); // Current month
            case 'year':
                return moment().format('YYYY'); // Current year
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
            if (result.success && result.data.length > 0) {
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

    const processData = () => {
        const labels = graphData.map((entry) => moment(entry.date + ' ' + entry.hour, 'DD/MM/YYYY HH').format('DD/MM/YYYY HH:mm'));
        const values = graphData.map((entry) => entry.stack.flow);

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
                text: `${parameter} Values Over Time`,
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => `Value: ${tooltipItem.raw}`,
                    title: (tooltipItems) => `Time: ${tooltipItems[0].label}`,
                },
                titleFont: { size: 18 },
                bodyFont: { size: 16 },
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
            <h3 className="popup-title mb-3 mt-3 text-center">{parameter} - {stackName}</h3>
            <div className="interval-buttons align-items-center justify-content-center mt-3">
                {['day', 'month', 'year'].map((interval) => (
                    <button
                        key={interval}
                        style={{backgroundColor:'#236a80' , margin:'5px' , color:'#ffff' , border:'none' , alignItems:'center' , justifyContent:'center' , padding:'7px' , borderRadius:'5px' , marginLeft:'10px'}}

                        className={`interval-btn ${timeInterval === interval ? 'active' : ''}`}
                        onClick={() => setTimeInterval(interval)}
                    >
                        {interval.charAt(0).toUpperCase() + interval.slice(1)}
                    </button>
                ))}
            </div>
            {loading ? (
                <div className="loading-container">
                    <Oval
                        height={60}
                        width={60}
                        color="#236A80"
                        ariaLabel="Fetching details"
                        secondaryColor="#e0e0e0"
                        strokeWidth={2}
                        strokeWidthSecondary={2}
                    />
                    <p>Loading data, please wait...</p>
                </div>
            ) : graphData.length === 0 ? (
                <div className="no-data-container">
                    <h5>No data available for {parameter} ({timeInterval})</h5>
                    <p>Please try a different interval or check back later.</p>
                </div>
            ) : (
                <div className="chart-container">
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}
        </div>
    );
};

export default FlowGraph;
