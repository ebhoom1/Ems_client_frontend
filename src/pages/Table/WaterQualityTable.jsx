import React, { useEffect, useState } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import './TableStyles.css';
import { API_URL } from '../../utils/apiConfig';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const WaterQualityTable = () => {
    const [userDetails, setUserDetails] = useState({
        stackName: '',
        companyName: '',
        address: '',
    });
    const { userType, userData } = useSelector((state) => state.user);
    const [selectedUser, setSelectedUser] = useState('');
    const [stackOptions, setStackOptions] = useState([]);
    const [selectedStack, setSelectedStack] = useState('');
    const [users, setUsers] = useState([]);
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

    const fetchUserData = async (username, stackName) => {
        const token = localStorage.getItem('userdatatoken');
        try {
            const response = await axios.get(`${API_URL}/api/validuser`, {
                headers: { Authorization: token },
            });

            if (response.data.status === 201 && response.data.validUserOne) {
                const user = username ? users.find((u) => u.userName === username) : response.data.validUserOne;

                const { userName, stackName: stacks, companyName, address } = user;
                const selectedStack = stackName || stacks[0]?.name || 'STP';

                setUserDetails({
                    stackName: selectedStack,
                    companyName,
                    address,
                });

                fetchMinMaxData(username || userName, selectedStack);
                fetchAvgData(username || userName, selectedStack);
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
                const avgData = response.data.data.flatMap((item) => 
                    item.stackData ? item.stackData[0]?.parameters || {} : {}
                );
    
                setParameters((prevParams) =>
                    prevParams.map((param) => {
                        // Filter valid numeric values
                        const validValues = avgData
                            .map((item) => item[param.name])
                            .filter((value) => typeof value === "number" && !isNaN(value));
    
                        // Calculate average
                        const avgValue = validValues.length > 0
                            ? (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(2)
                            : "N/A"; // If no valid values, set to N/A
    
                        return { ...param, avg: avgValue };
                    })
                );
            }
        } catch (error) {
            console.error('Error fetching Average data:', error);
        }
    };
    

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('userdatatoken');
            const response = await axios.get(`${API_URL}/api/getallusers`, {
                headers: { Authorization: token },
            });
            const filteredUsers = response.data.users.filter((user) => user.userType === 'user');
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchStackNames = async (username) => {
        try {
            const response = await axios.get(`${API_URL}/api/get-stacknames-by-userName/${username}`);
            setStackOptions(response.data.stackNames || []);
        } catch (error) {
            console.error('Error fetching stack names:', error);
        }
    };

    useEffect(() => {
        if (userType === 'admin') {
            fetchUsers();
        } else {
            fetchUserData();
        }
    }, [userType]);

    const handleUserSelection = (e) => {
        const username = e.target.value;
        setSelectedUser(username);
        fetchStackNames(username);
    };

    const handleSubmit = () => {
        if (selectedUser && selectedStack) {
            fetchUserData(selectedUser, selectedStack);
        } else {
            alert('Please select both user and stack name!');
        }
    };

    const downloadPDF = () => {
        const element = document.getElementById('table-to-download');
        html2pdf().from(element).set({
            margin: 0.5,
            filename: 'water_quality_report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        }).save();
    };

    const handleBack = () => {
        navigate('/view-report');
    };

    return (
        <div className="table-container">
            <button className='btn btn-warning me-2' onClick={handleBack}><i className="fa-solid fa-arrow-left me-1"></i>Back</button>
            <button onClick={downloadPDF} className="download-btn btn btn-success">Download PDF</button>
            {userType === 'admin' && (
                <div className='mt-2'>
                    <label htmlFor="user-select">Select User: </label>
                    <select id="user-select" value={selectedUser} onChange={handleUserSelection} style={{ padding: '8px', borderRadius: '5px', marginRight: '10px', border: '1px solid #ccc' }}>
                        <option value="">Select User</option>
                        {users.map((user) => (
                            <option key={user.userName} value={user.userName}>{user.userName}</option>
                        ))}
                    </select>

                    <label htmlFor="stack-select" className='ms-3'>Select Stack Name: </label>
                    <select id="stack-select" value={selectedStack} onChange={(e) => setSelectedStack(e.target.value)} style={{ padding: '8px', borderRadius: '5px', marginRight: '10px', border: '1px solid #ccc' }}>
                        <option value="">Select Stack</option>
                        {stackOptions.map((stack, index) => (
                            <option key={index} value={stack.name}>{stack.name}</option>
                        ))}
                    </select>
                    <button onClick={handleSubmit} className="btn text-light ms-3" style={{backgroundColor:'#236a80'}}>Submit</button>
                </div>
            )}
            <table className="report-table mt-3" id="table-to-download">
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
                        <th>Acceptable Min Limit</th>
                        <th>Acceptable Max Limit</th>

                    </tr>
                </thead>
                <tbody>
                    {parameters.map((param, index) => (
                        <tr key={index}>
                            <td>{param.name}</td>
                            <td>{param.avg}</td>
                            <td>{param.min} <br /> 
                            <span style={{fontSize: '10px'}}>Min Time:  {param.minTime}</span></td>
                            <td>{param.max} <br />
                            <span style={{fontSize: '10px'}}>Max Time: {param.maxTime}</span></td>
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
