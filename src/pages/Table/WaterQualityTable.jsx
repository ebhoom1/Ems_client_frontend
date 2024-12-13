import React, { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import './TableStyles.css';

const WaterQualityTable = () => {
    const [waterQualityData, setWaterQualityData] = useState({
        stackName: '',
        pH: { min: 0, max: 0, minTime: '', maxTime: '', avg: 0 },
        turbidity: { min: 0, max: 0, minTime: '', maxTime: '', avg: 0 },
        BOD: { min: 0, max: 0, minTime: '', maxTime: '', avg: 0 },
        COD: { min: 0, max: 0, minTime: '', maxTime: '', avg: 0 },
        Temp: { min: 0, max: 0, minTime: '', maxTime: '', avg: 0 },
    });

    useEffect(() => {
        // Fetch the data from the minMax API
        const fetchMinMaxData = async () => {
            try {
                const response = await fetch('https://api.ocems.ebhoom.com/api/minMax/HH014/stack/STP');
                const data = await response.json();

                if (data.success) {
                    setWaterQualityData((prevData) => ({
                        ...prevData,
                        stackName: data.data.stackName,
                        pH: { 
                            min: data.data.minValues.ph, 
                            max: data.data.maxValues.ph, 
                            minTime: data.data.time, 
                            maxTime: data.data.maxTimestamps.ph ? data.data.maxTimestamps.ph.time : '',
                            avg: 0, // Set avg value initially to 0
                        },
                        turbidity: { 
                            min: data.data.minValues.turbidity, 
                            max: data.data.maxValues.turbidity, 
                            minTime: data.data.time, 
                            maxTime: data.data.maxTimestamps.turbidity ? data.data.maxTimestamps.turbidity.time : '',
                            avg: 0,
                        },
                        BOD: { 
                            min: data.data.minValues.BOD, 
                            max: data.data.maxValues.BOD, 
                            minTime: data.data.time, 
                            maxTime: data.data.maxTimestamps.BOD ? data.data.maxTimestamps.BOD.time : '',
                            avg: 0,
                        },
                        COD: { 
                            min: data.data.minValues.COD, 
                            max: data.data.maxValues.COD, 
                            minTime: data.data.time, 
                            maxTime: data.data.maxTimestamps.COD ? data.data.maxTimestamps.COD.time : '',
                            avg: 0,
                        },
                        Temp: { 
                            min: data.data.minValues.Temp, 
                            max: data.data.maxValues.Temp, 
                            minTime: data.data.time, 
                            maxTime: data.data.maxTimestamps.Temp ? data.data.maxTimestamps.Temp.time : '',
                            avg: 0,
                        },
                    }));
                }
            } catch (error) {
                console.error('Error fetching min/max data:', error);
            }
        };

        // Fetch the data from the average API
        const fetchAvgData = async () => {
            try {
                const response = await fetch('https://api.ocems.ebhoom.com/api/average/user/HH014/stack/STP');
                const data = await response.json();

                if (data.success) {
                    const avgData = data.data.map(item => item.stackData[0].parameters);
                    const avgValues = {
                        pH: (avgData.map(item => item.ph).reduce((a, b) => a + b, 0) / avgData.length).toFixed(2),
                        turbidity: (avgData.map(item => item.turbidity).reduce((a, b) => a + b, 0) / avgData.length).toFixed(2),
                        Temp: (avgData.map(item => item.Temp).reduce((a, b) => a + b, 0) / avgData.length).toFixed(2),
                        BOD: (avgData.map(item => item.BOD).reduce((a, b) => a + b, 0) / avgData.length).toFixed(2),
                        COD: (avgData.map(item => item.COD).reduce((a, b) => a + b, 0) / avgData.length).toFixed(2),
                    };
                    setWaterQualityData((prevData) => ({
                        ...prevData,
                        pH: { ...prevData.pH, avg: avgValues.pH },
                        turbidity: { ...prevData.turbidity, avg: avgValues.turbidity },
                        Temp: { ...prevData.Temp, avg: avgValues.Temp },
                        BOD: { ...prevData.BOD, avg: avgValues.BOD },
                        COD: { ...prevData.COD, avg: avgValues.COD },
                    }));
                }
            } catch (error) {
                console.error('Error fetching average data:', error);
            }
        };

        fetchMinMaxData();
        fetchAvgData();
    }, []); // Empty dependency array ensures this runs once when the component mounts

    const downloadPDF = () => {
        const element = document.getElementById('table-to-download');
        const options = {
            margin: 0.5,
            filename: 'water_quality_report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().from(element).set(options).save();
    };

    return (
        <div className="table-container">
            <button onClick={downloadPDF} className="download-btn">Download PDF</button>
            <table className="report-table" id="table-to-download">
                <thead>
                    <tr>
                        <th colSpan="8">Genex- Real Time Monitoring (RTM)</th>
                    </tr>
                    <tr>
                        <th colSpan="8">Recycled Water Management - The Brigade Gateway, Malleswaram, Bangalore</th>
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
                    <tr>
                        <td>pH</td>
                        <td>{waterQualityData.pH.avg}</td>
                        <td>{waterQualityData.pH.min}  
                            <br />
                            <span style={{fontSize: '10px'}}>Min Time: {waterQualityData.pH.minTime}</span>
                        </td>
                        <td>{waterQualityData.pH.max}
                            <br />
                            <span style={{fontSize: '10px'}}>Max Time: {waterQualityData.pH.maxTime}</span>
                        </td>
                        <td>{waterQualityData.stackName}</td>
                        <td>6.5</td> 
                        <td>8.5</td>
                    </tr>
                    <tr>
                        <td>Temp</td>
                        <td>{waterQualityData.Temp.avg}</td>
                        <td>{waterQualityData.Temp.min}  
                            <br />
                            <span style={{fontSize: '10px'}}>Min Time: {waterQualityData.Temp.minTime}</span>
                        </td>
                        <td>{waterQualityData.Temp.max}
                            <br />
                            <span style={{fontSize: '10px'}}>Max Time: {waterQualityData.Temp.maxTime}</span>
                        </td>
                        <td>{waterQualityData.stackName}</td>
                        <td>-</td> 
                        <td>-</td>
                    </tr>
                    <tr className="highlight-orange">
                        <td>Turbidity</td>
                        <td>{waterQualityData.turbidity.avg}</td>
                        <td>{waterQualityData.turbidity.min}  
                            <br />
                            <span style={{fontSize: '10px'}}>Min Time: {waterQualityData.turbidity.minTime}</span>
                        </td>
                        <td>{waterQualityData.turbidity.max}
                            <br />
                            <span style={{fontSize: '10px'}}>Max Time: {waterQualityData.turbidity.maxTime}</span>
                        </td>
                        <td>{waterQualityData.stackName}</td>
                        <td>0.00</td> 
                        <td>20.00</td>
                    </tr>
                    <tr className="highlight-orange">
                        <td>BOD</td>
                        <td>{waterQualityData.BOD.avg}</td>
                        <td>{waterQualityData.BOD.min}  
                            <br />
                            <span style={{fontSize: '10px'}}>Min Time: {waterQualityData.BOD.minTime}</span>
                        </td>
                        <td>{waterQualityData.BOD.max}
                            <br />
                            <span style={{fontSize: '10px'}}>Max Time: {waterQualityData.BOD.maxTime}</span>
                        </td>
                        <td>{waterQualityData.stackName}</td>
                        <td>0.00</td> 
                        <td>10.00</td>
                    </tr>
                    <tr className="highlight-orange">
                        <td>COD</td>
                        <td>{waterQualityData.COD.avg}</td>
                        <td>{waterQualityData.COD.min}  
                            <br />
                            <span style={{fontSize: '10px'}}>Min Time: {waterQualityData.COD.minTime}</span>
                        </td>
                        <td>{waterQualityData.COD.max}
                            <br />
                            <span style={{fontSize: '10px'}}>Max Time: {waterQualityData.COD.maxTime}</span>
                        </td>
                        <td>{waterQualityData.stackName}</td>
                        <td>0.00</td> 
                        <td>50.00</td>
                    </tr>
                    <tr className="section-header">
                        <td colSpan="8">Water Quality</td>
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
                    <tr>
                        <td>Inlet raw sewage</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>KLD</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Treated Water</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>KLD</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Toilet Flushing - M block </td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>KLD</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Toilet Flushing - G block</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>KLD</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Toilet Flushing - C block</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>KLD</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Garden Consumption</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>KLD</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
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
                    <tr>
                        <td>STP Incomer Energy Consumption</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>kWh</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>

                </tbody>
            </table>
        </div>
    );
};

export default WaterQualityTable;
