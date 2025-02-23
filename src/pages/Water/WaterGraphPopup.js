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
    
        const labels = [];
        const values = [];
    
        graphData.forEach((entry, index) => {
            console.log(`📌 Processing Entry ${index + 1}:`, entry);
    
            if (!entry.stackData || !Array.isArray(entry.stackData) || entry.stackData.length === 0) {
                console.warn(`⚠️ No stackData found in entry ${index + 1}`);
                return;
            }
    
            // ✅ Find the stack that matches the selected stackName
            const stack = entry.stackData.find((s) => s.stackName === stackName);
            
            if (!stack) {
                console.warn(`⚠️ No matching stack found for stackName: ${stackName}`);
                return;
            }
    
            console.log("✅ Filtered Stack:", stack);
    
            if (!stack.parameters || typeof stack.parameters !== "object") {
                console.warn(`⚠️ No parameters found in stack ${stackName}`);
                return;
            }
    
            console.log("📌 Stack Parameters:", stack.parameters);
    
            // ✅ Handle Case Sensitivity for `ph`
            const paramKey = Object.keys(stack.parameters).find(
                (key) => key.toLowerCase() === parameter.toLowerCase()
            );
    
            if (!paramKey) {
                console.warn(`⚠️ Parameter '${parameter}' not found in stack parameters!`);
                return;
            }
    
            const paramValue = stack.parameters[paramKey] || 0;
    
            // ✅ Add processed label and value
            labels.push(moment(entry.timestamp).format("DD/MM/YYYY HH:mm"));
            values.push(parseFloat(paramValue)); // Ensure value is a valid number
        });
    
        console.log("✅ Processed Labels:", labels);
        console.log("✅ Processed Values:", values);
    
        return { labels, values };
    };
    /*   const processData = () => {
    if (!Array.isArray(graphData) || graphData.length === 0) {
        console.warn("⚠️ No valid data found in graphData!");
        return { labels: [], values: [] };
    }

    let labels = [];
    let values = [];
    let dateMap = new Map(); // Store values by date to avoid duplicates

    // Sort data in descending order (latest first)
    const sortedData = [...graphData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get the first and last available timestamps
    const latestDate = moment().startOf('day'); // Use today's date as the latest
    const oldestDate = moment(sortedData[sortedData.length - 1].timestamp).startOf('day'); // Oldest date

    // Generate all dates from latestDate to oldestDate in descending order
    let currentDate = latestDate.clone();
    while (currentDate.isSameOrAfter(oldestDate, 'day')) {
        dateMap.set(currentDate.format("DD/MM/YYYY"), null); // Placeholder for missing values
        currentDate.subtract(1, 'days'); // Move to previous day
    }

    // Populate dateMap with actual values from data
    sortedData.forEach((entry, index) => {
        console.log(`📌 Processing Entry ${index + 1}:`, entry);

        if (!entry.stackData || !Array.isArray(entry.stackData) || entry.stackData.length === 0) {
            console.warn(`⚠️ No stackData found in entry ${index + 1}`);
            return;
        }

        const stack = entry.stackData.find((s) => s.stackName === stackName);
        if (!stack) return;

        if (!stack.parameters || typeof stack.parameters !== "object") return;

        const paramKey = Object.keys(stack.parameters).find(
            (key) => key.toLowerCase() === parameter.toLowerCase()
        );

        if (!paramKey) return;

        const paramValue = stack.parameters[paramKey] || 0;
        const formattedDate = moment(entry.timestamp).format("DD/MM/YYYY"); // Extract only the date

        if (dateMap.has(formattedDate)) {
            dateMap.set(formattedDate, parseFloat(paramValue)); // Replace null with value
        }
    });

    // Extract keys and values for graph
    labels = Array.from(dateMap.keys());
    values = Array.from(dateMap.values()).map(value => value ?? null); // Ensure missing values are null

    console.log("✅ Final Labels:", labels);
    console.log("✅ Final Values:", values);

    return { labels, values };
};
 */
    
    
    const { labels, values } = processData();
    const chartData = {
        labels,
        datasets: [
            {
                label:` ${parameter} - ${stackName}`,
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
            {['hour', 'day', 'week', 'month', 'sixmonths', 'year'].map((interval) => (
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
            <div className="loading-container d-flex align-items-center justify-content-center ">
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
        ) : graphData.length === 0 ? (
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
