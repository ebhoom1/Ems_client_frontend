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
import { API_URL } from '../../utils/apiConfig';
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

const EnergyGraph = ({ parameter, userName, stackName }) => {
    const [graphData, setGraphData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chartHeight, setChartHeight] = useState(window.innerHeight * 0.4);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/api/difference/${userName}?interval=daily`
            );
            const result = await response.json();
            console.log("Difference API Response:", result);
            if (result.success && Array.isArray(result.data)) {
                // Filter records for energy station and matching stackName
                const filtered = result.data.filter(
                    record => record.stationType === "energy" && record.stackName === stackName
                );
                // Group by date (using the "date" field) to remove duplicates.
                const uniqueDataMap = {};
                filtered.forEach(record => {
                    const dateKey = record.date;
                    if (!uniqueDataMap[dateKey]) {
                        uniqueDataMap[dateKey] = record;
                    } else {
                        // If duplicate exists, pick the one with the later timestamp.
                        if (new Date(record.timestamp) > new Date(uniqueDataMap[dateKey].timestamp)) {
                            uniqueDataMap[dateKey] = record;
                        }
                    }
                });
                let uniqueData = Object.values(uniqueDataMap);
                // Remove today's record from the graph.
                const today = moment().format('DD/MM/YYYY');
                uniqueData = uniqueData.filter(record => record.date !== today);
                // Sort unique data by date in ascending order.
                uniqueData.sort(
                    (a, b) => moment(a.date, "DD/MM/YYYY") - moment(b.date, "DD/MM/YYYY")
                );
                // Keep only the previous 5 days (most recent 5 unique dates).
                if (uniqueData.length > 5) {
                    uniqueData = uniqueData.slice(-5);
                }
                setGraphData(uniqueData);
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

    useEffect(() => {
        if (userName && stackName) {
            fetchData();
        }
    }, [userName, stackName]);

    useEffect(() => {
        const updateChartHeight = () => {
            setChartHeight(window.innerHeight * 0.4);
        };
        window.addEventListener('resize', updateChartHeight);
        return () => window.removeEventListener('resize', updateChartHeight);
    }, []);

    const processData = () => {
        if (!graphData || graphData.length === 0) {
            return { labels: [], values: [] };
        }
        const labels = [];
        const values = [];
        // Use the energyDifference if available; otherwise compute difference.
        graphData.forEach(record => {
            labels.push(record.date);
            let diff = 0;
            if (record.energyDifference !== undefined && record.energyDifference !== null) {
                diff = record.energyDifference;
            } else if (
                record.lastEnergy !== undefined &&
                record.initialEnergy !== undefined
            ) {
                diff = record.lastEnergy - record.initialEnergy;
            }
            values.push(diff);
        });
        return { labels, values };
    };

    const { labels, values } = processData();

    const chartData = {
        labels,
        datasets: [
            {
                label: `Energy Difference - ${stackName}`,
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
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: `Daily Energy Difference for ${stackName}`,
            },
            tooltip: {
                callbacks: {
                    title: (tooltipItems) => `Date: ${tooltipItems[0].label}`,
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        return `Difference: ${parseFloat(value).toFixed(2)} kW/hr`;
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
                    text: 'Energy Difference (kW/hr)',
                },
                beginAtZero: true,
                suggestedMax: Math.max(...values, 5),
            },
        },
    };

    return (
        <div className="graph-container">
            <h5 className="popup-title text-center">{parameter} - {stackName}</h5>
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
                    <h5>No data available for {parameter}</h5>
                </div>
            ) : (
                <div className="chart-wrapper" style={{ height: chartHeight, minHeight: "300px", maxHeight: "80vh" }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}
        </div>
    );
};

export default EnergyGraph;
