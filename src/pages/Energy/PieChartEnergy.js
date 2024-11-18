import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './PieChartEnergy.css';
import { API_URL } from '../../utils/apiConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartEnergy = ({ primaryStation, userName }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [energyStacks, setEnergyStacks] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        fetchEnergyStacks(userName);
    }, [userName]);

    useEffect(() => {
        if (energyStacks.length > 0) {
            fetchData();
        }
    }, [energyStacks, userName, primaryStation]);

    const fetchEnergyStacks = async (userName) => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
            const data = response.data;
            const filteredStacks = data.stackNames.filter(stack => stack.stationType === 'energy').map(stack => stack.name);
            setEnergyStacks(filteredStacks);
        } catch (error) {
            setError(`Error fetching energy stacks: ${error.message}`);
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
        const total = stacks.reduce((acc, curr) => acc + curr.energyMonthlyConsumption, 0);
        const data = stacks.filter(stack => energyStacks.includes(stack.stackName)).map(stack => ({
            stackName: stack.stackName,
            percentage: (stack.energyMonthlyConsumption / total * 100).toFixed(2),
            value: stack.energyMonthlyConsumption,
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
        };
    };

    const downloadPdf = () => {
        const chartElement = document.getElementById('pie-chart-container');
        html2canvas(chartElement).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape');
            pdf.addImage(imgData, 'PNG', 10, 10, 280, 150);
            pdf.save('EnergyConsumptionChart.pdf');
        });
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
            <div className="pie-chart-header text-light d-flex justify-content-between">
                <span>Energy Consumption Chart</span>
                <button className="btn btn-light btn-sm " style={{marginLeft:'100px', color: '#236a80',  border: 'none'}} onClick={downloadPdf}><i class="fa-solid fa-download"></i></button>
            </div>
            <div id="pie-chart-container" className="card-body d-flex">
                <div className="pie-chart-container" style={{ width: '50%' }}>
                    <Pie data={chartData} options={options} />
                </div>
                <div className="legend-container" style={{ paddingLeft: '20px' }}>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {chartData.labels.map((label, index) => (
                            <li key={index} style={{ display: 'flex', alignItems: 'start', marginBottom: '10px' }}>
                                <div
                                    style={{
                                        width: '15px',
                                        height: '15px',
                                        backgroundColor: chartData.datasets[0].backgroundColor[index],
                                        marginRight: '10px',
                                    }}
                                ></div>
                                <span className="text-light">{label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PieChartEnergy;
