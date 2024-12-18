import React, { useEffect, useState } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import './TableStyles.css';
import { API_URL } from '../../utils/apiConfig';
import { useNavigate } from 'react-router-dom';

const WaterQualityTable = () => {
    const [userDetails, setUserDetails] = useState({
        stackName: '',
        companyName: '',
        address: '',
    });
    const navigate = useNavigate();
    const [parameters, setParameters] = useState([]);
    const [consumptionData, setConsumptionData] = useState({
        waterConsumption: [
            { name: "Inlet Raw Sewage", total: 0, initial: 0, final: 0, unit: "KLD" },
            { name: "Treated Water", total: 0, initial: 0, final: 0, unit: "KLD" },
            { name: "Toilet Flushing - M block", total: 0, initial: 0, final: 0, unit: "KLD" },
            { name: "Toilet Flushing - G block", total: 0, initial: 0, final: 0, unit: "KLD" },
            { name: "Garden Consumption", total: 0, initial: 0, final: 0, unit: "KLD" },
        ],
        energyConsumption: [
            { name: "STP Incomer Energy Consumption", total: 0, initial: 0, final: 0, unit: "kWh" },
        ],
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('userdatatoken');
            try {
                const response = await axios.get(`${API_URL}/api/validuser`, {
                    headers: { Authorization: token },
                });

                if (response.data.status === 201 && response.data.validUserOne) {
                    const { userName, stackName, companyName, address } = response.data.validUserOne;
                    const selectedStack = stackName[0]?.name || 'STP';

                    setUserDetails({
                        stackName: selectedStack,
                        companyName,
                        address,
                    });

                    fetchMinMaxData(userName, selectedStack);
                    fetchAvgData(userName, selectedStack);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        const fetchMinMaxData = async (username, stack) => {
            try {
                const response = await axios.get(`${API_URL}/api/minMax/${username}/stack/${stack}`);
                if (response.data.success) {
                    const { minValues, maxValues, minTimestamps, maxTimestamps } = response.data.data;

                    const minMaxParams = Object.keys(minValues).map((param) => ({
                        name: param,
                        min: minValues[param],
                        max: maxValues[param],
                        minTime: minTimestamps?.[param]?.time || 'N/A',
                        maxTime: maxTimestamps?.[param]?.time || 'N/A',
                        avg: 0, // Avg will be updated later
                    }));
                    setParameters(minMaxParams);
                }
            } catch (error) {
                console.error('Error fetching Min/Max data:', error);
            }
        };

        const fetchAvgData = async (username, stack) => {
            try {
                const response = await axios.get(`${API_URL}/api/average/user/${username}/stack/${stack}`);
                if (response.data.success) {
                    const avgData = response.data.data.map((item) => item.stackData[0].parameters);

                    setParameters((prevParams) =>
                        prevParams.map((param) => {
                            const avgValue = (
                                avgData.map((item) => item[param.name]).reduce((a, b) => a + b, 0) / avgData.length
                            ).toFixed(2);

                            return { ...param, avg: avgValue || 'N/A' };
                        })
                    );
                }
            } catch (error) {
                console.error('Error fetching Average data:', error);
            }
        };

        fetchUserData();
    }, []);

    const downloadPDF = () => {
        const element = document.getElementById('table-to-download');
        const options = {
            margin: [0.5, 0.5, 0.5, 0.5], // Top, Right, Bottom, Left
            filename: 'water_quality_report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3 }, // Higher scale for better clarity
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }, // Ensures proper page breaks
        };
        html2pdf().from(element).set(options).save();
    };

const handleBack =()=>{
    navigate('/view-report')
}
    return (
        <div className="table-container">
            <button className='btn btn-warning me-2' onClick={handleBack}><i className="fa-solid fa-arrow-left me-1 "></i>Back</button>
            <button onClick={downloadPDF} className="download-btn btn btn-success ">Download PDF</button>
            <table className="report-table" id="table-to-download">
                <thead>
                    <tr>
                        <th colSpan="8">{userDetails.companyName} - Real Time Monitoring (RTM)</th>
                    </tr>
                    <tr>
                        <th colSpan="8">{userDetails.address}</th>
                    </tr>
                    <tr className="section-header">
                        <td colSpan="8">Water Quality</td>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <th>Avg Value</th>
                        <th>Min Value</th>
                       
                        <th>Max Value</th>
                        
                        <th>Stack Name</th>
                        <th>Acceptable Min limit</th>
                        <th>Acceptable Max limit</th>
                    </tr>
                </thead>
                <tbody>
                    {parameters.map((param, index) => (
                        <tr key={index}>
                            <td>{param.name}</td>
                            <td>{param.avg}</td>
                            <td>{param.min} <br />
                            <span style={{fontSize: '10px'}}>Min Time:  {param.minTime}</span>
                           </td>
                         
                            <td>{param.max} <br />
                            <span style={{fontSize: '10px'}}>Max Time: {param.maxTime}</span>
                            </td>
                            
                            <td>{userDetails.stackName}</td>
                            <td>-</td> 
                            <td>-</td>
                        </tr>
                    ))}
                    <tr className="section-header">
                        <td colSpan="8">Water Consumption</td>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <th>Total</th>
                        <th>Initial Meter reading</th>
                        <th>Final Meter reading</th>
                        <th>Unit</th>
                        <th>Acceptable Min limit</th>
                        <th>Acceptable Max limit</th>
                    </tr>
                    {consumptionData.waterConsumption.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.total}</td>
                            <td>{item.initial}</td>
                            <td>{item.final}</td>
                            <td>{item.unit}</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    ))}
                    <tr className="section-header">
                        <td colSpan="8">Energy Consumption</td>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <th>Total</th>
                        <th>Initial Meter Reading </th>
                        <th>Final Meter Reading</th>
                        <th>Unit</th>
                        <th>Acceptable Min limit</th>
                        <th>Acceptable Max limit</th>
                    </tr>
                    {consumptionData.energyConsumption.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.total}</td>
                            <td>{item.initial}</td>
                            <td>{item.final}</td>
                            <td>{item.unit}</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WaterQualityTable;









