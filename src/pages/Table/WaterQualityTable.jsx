import React from 'react';
import html2pdf from 'html2pdf.js';
import './TableStyles.css';

const WaterQualityTable = () => {
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
                        <th colSpan="7">Genex- Real Time Monitoring (RTM)</th>
                    </tr>
                    <tr>
                        <th colSpan="7">Recycled Water Management - The Brigade Gateway, Malleswaram, Bangalore</th>
                    </tr>
                    <tr className="section-header">
                        <td colSpan="8">Water Quality</td>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <th>Avg Value</th>
                        <th>Min Value</th>
                        <th>Max Value</th>
                        <th>Unit</th>
                        <th>Acceptable Min limit</th>
                        <th>Acceptable Max limit</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>pH</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>-</td>
                        <td>-</td> 
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Total Dissolved Solids</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>ppm</td>
                        <td>-</td> 
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>ORP</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>mV</td>
                        <td>-</td> 
                        <td>-</td>
                    </tr>
                    <tr className="highlight-orange">
                        <td>Turbidity</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>NTU</td>
                        <td>-</td> 
                        <td>-</td>
                    </tr>
                    <tr className="highlight-orange">
                        <td>Total Suspended Solids (TSS)</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>ppm</td>
                        <td>-</td> 
                        <td>-</td>
                    </tr>
                    <tr className="highlight-orange">
                        <td>BOD</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>mg/L</td>
                        <td>-</td> 
                        <td>-</td>
                    </tr>
                    <tr className="highlight-orange">
                        <td>COD</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>mg/L</td>
                        <td>-</td> 
                        <td>-</td>
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
