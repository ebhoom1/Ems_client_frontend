import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './PieChartQuantity.css';
import { API_URL } from '../../utils/apiConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartQuantity = ({ primaryStation, userName }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [effluentFlowStacks, setEffluentFlowStacks] = useState([]); // New state to store effluentFlow stacks  const [realTimeData, setRealTimeData] = useState({})
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        fetchEffluentFlowStacks(userName);
    }, [userName]);

    useEffect(() => {
        if (effluentFlowStacks.length > 0) {
            fetchData();
        }
    }, [effluentFlowStacks, userName, primaryStation]);

    const fetchEffluentFlowStacks = async (userName) => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
            const data = response.data;
            const filteredStacks = data.stackNames.filter(stack => stack.stationType === 'effluent_flow').map(stack => stack.name);
            setEffluentFlowStacks(filteredStacks);
        } catch (error) {
            setError(`Error fetching flow stacks: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(`${API_URL}/api/consumptionDataByUserName?userName=${userName}`);
            const data = response.data;
            if (data && data.stacks && data.stacks.length > 0) {
                setChartData(processData(data.stacks, primaryStation));
            } else {
                setChartData(null);
                setError("No data found for this user.");
            }
        } catch (err) {
            setChartData(null);
            setError(`Failed to fetch data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const processData = (stacks, primaryStation) => {
        const total = stacks.reduce((acc, curr) => acc + curr.flowMonthlyConsumption, 0);
        const data = stacks.filter(stack => effluentFlowStacks.includes(stack.stackName)).map(stack => ({
            stackName: stack.stackName,
            percentage: (stack.flowMonthlyConsumption / total * 100).toFixed(2),
            value: stack.flowMonthlyConsumption,
        }));

        const backgroundColors = data.map((item, index) =>
            item.stackName === primaryStation
                ? 'rgba(215, 222, 24, 0.6)'
                : `hsla(${360 / data.length * index}, 70%, 50%, 0.6)`
        );

        const hoverBackgroundColors = data.map((item, index) =>
            item.stackName === primaryStation
                ? 'rgba(62, 19, 108, 0.8)'
                : `hsla(${360 / data.length * index}, 70%, 50%, 0.8)`
        );

        return {
            labels: data.map(item => item.stackName),
            datasets: [
                {
                    data: data.map(item => item.value),
                    backgroundColor: backgroundColors,
                    hoverBackgroundColor: hoverBackgroundColors,
                    borderWidth: 0,
                    hoverOffset: 10,
                },
            ],
            legendColors: backgroundColors,
        };
    };

    const options = {
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (tooltipItem) {
                        const label = chartData.labels[tooltipItem.dataIndex] || '';
                        const value = tooltipItem.raw.toFixed(2);
                        return `${label}: ${value} kWh`;
                    },
                },
            },
        },
        maintainAspectRatio: false,
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                setActiveIndex(activeIndex === index ? null : index);
            }
        },
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return <div className="alert alert-danger" role="alert">{error}</div>;
    }

    if (!chartData) {
        return <div className="alert alert-info" role="alert">No data available or still loading...</div>;
    }

    return (
        <div className="card pie-chart-card">
            <div className="pie-chart-header text-light">
               Flow Consumption Chart
            </div>
            <div className="card-body d-flex">
                <div className="pie-chart-container" style={{ width: '70%' }}>
                    <Pie data={chartData} options={options} />
                </div>
                <div className="legend-container" style={{ width: '30%', paddingLeft: '20px' }}>
                   
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {chartData.labels.map((label, index) => (
                            <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <div
                                    style={{
                                        width: '15px',
                                        height: '15px',
                                        backgroundColor: chartData.datasets[0].backgroundColor[index],
                                        marginRight: '10px',
                                    }}
                                ></div>
                                <span className='text-light'>{label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PieChartQuantity;
