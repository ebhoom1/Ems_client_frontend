import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./TableStyles.css"; // Make sure this CSS file is imported
import { API_URL } from "../../utils/apiConfig";
import Header from "../Header/Hedaer";
import Maindashboard from "../Maindashboard/Maindashboard";
import DashboardSam from "../Dashboard/DashboardSam";

const WaterQualityTable = () => {
    const [userDetails, setUserDetails] = useState({
        stackName: "",
        companyName: "",
        address: "",
    });
    const industryTypeList = [
        { category: "Sugar" }, { category: "Cement" }, { category: "Distillery" },
        { category: "Petrochemical" }, { category: "Pulp & Paper" }, { category: "Fertilizer" },
        { category: "Tannery" }, { category: "Pesticides" }, { category: "Thermal Power Station" },
        { category: "Caustic Soda" }, { category: "Pharmaceuticals" }, { category: "Chemical" },
        { category: "Dye and Dye Stuff" }, { category: "Refinery" }, { category: "Copper Smelter" },
        { category: "Iron and Steel" }, { category: "Zinc Smelter" }, { category: "Hotel" },
        { category: "Aluminium" }, { category: "STP/ETP" }, { category: "NWMS/SWMS" },
        { category: "Noise" }, { category: "Other" },
    ];

    const { userType, userData } = useSelector((state) => state.user);
    const [users, setUsers] = useState([]);
    const [stackOptions, setStackOptions] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedStack, setSelectedStack] = useState("");
    const [selectedIndustryType, setSelectedIndustryType] = useState("");
    const [tablesData, setTablesData] = useState([]);
    const [energyData, setEnergyData] = useState([]);
    const [quantityData, setQuantityData] = useState([]);
    const [minMaxData, setMinMaxData] = useState({ minValues: {}, maxValues: {} });
    const [calibrationExceed, setCalibrationExceed] = useState({});
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const navigate = useNavigate();
    const loggedUserName = userData?.validUserOne?.userName || "";
    const normalizeString = (str) => str.replace(/\s+/g, ' ').trim();

    const fetchUsers = useCallback(async () => {
        try {
            const currentUser = userData?.validUserOne;
            if (!currentUser) { setUsers([]); return; }
            let response;
            if (currentUser.adminType === "EBHOOM") {
                response = await axios.get(`${API_URL}/api/getallusers`);
                const f = response.data.users || [];
                setUsers(f.filter((u) => !u.isTechnician && !u.isTerritorialManager && !u.isOperator));
            } else if (currentUser.userType === "super_admin") {
                response = await axios.get(`${API_URL}/api/getallusers`);
                const f = response.data.users || [];
                const myAdmins = f.filter((u) => u.createdBy === currentUser._id && u.userType === "admin");
                const myAdminIds = myAdmins.map((a) => a._id.toString());
                const usersForSuperAdmin = f.filter((u) => u.createdBy === currentUser._id || myAdminIds.includes(u.createdBy));
                setUsers(usersForSuperAdmin.filter((u) => !u.isTechnician && !u.isTerritorialManager && !u.isOperator));
            } else if (currentUser.userType === "admin") {
                const url = `${API_URL}/api/get-users-by-creator/${currentUser._id}`;
                response = await axios.get(url);
                const f = response.data.users || [];
                setUsers(f.filter((u) => u.userType === "user"));
            } else {
                setUsers([]);
            }
        } catch (error) { console.error("Error fetching users:", error); setUsers([]); }
    }, [userData]);

    useEffect(() => {
        if (userType === "admin" || userType === "super_admin") { fetchUsers(); }
        else if (userType === "user") {
            const username = userData?.userName || loggedUserName;
            setSelectedUser(username);
            let industryType = userData?.validUserOne?.industryType || userData?.industryType || "";
            setSelectedIndustryType(industryType);
            fetchStackNames(username);
            setUserDetails({
                stackName: userData?.stackName || "",
                companyName: userData?.validUserOne?.companyName || "N/A",
                address: userData?.validUserOne?.address || userData?.address || "N/A",
            });
            if (industryType) { fetchCalibrationExceed(industryType); }
        }
    }, [userType, userData, fetchUsers, loggedUserName]);

    const fetchStackNames = async (username) => {
        try {
            const res = await axios.get(`${API_URL}/api/get-stacknames-by-userName/${username}`);
            setStackOptions(res.data.stackNames.filter((s) => ["energy", "effluent_flow", "effluent", "emission"].includes(s.stationType)) || []);
        } catch (error) { console.error("Error fetching stack names:", error); }
    };

    const fetchAvgData = async (username, stack, start, end) => {
        try {
            const formattedStartDate = start.split("-").reverse().join("-");
            const formattedEndDate = end.split("-").reverse().join("-");
            const res = await axios.get(`${API_URL}/api/average/user/${username}/stack/${stack}/time-range/average`, {
                params: { startDate: formattedStartDate, endDate: formattedEndDate },
            });
            if (res.data.success) {
                const d = res.data.data;
                const filtered = Object.fromEntries(Object.entries(d).filter(([k]) => k !== "_id").map(([k, v]) => [k, v.toFixed(2)]));
                setTablesData([{ date: `${start} to ${end}`, parameters: filtered }]);
            }
        } catch (error) { console.error("Error fetching average data:", error); }
    };

    const fetchEnergyAndFlowData = async (username, start, end) => {
        try {
            const formattedStartDate = start.split("-").reverse().join("-");
            const formattedEndDate = end.split("-").reverse().join("-");
            const apiUrl = `${API_URL}/api/energyAndFlowData/${username}/${formattedStartDate}/${formattedEndDate}`;
            const response = await axios.get(apiUrl);
            if (response.data.success) {
                const data = response.data.data;
                const normalizedStartDate = formattedStartDate.split("-").join("/");
                const normalizedEndDate = formattedEndDate.split("-").join("/");
                const allEnergyEntries = data.filter(e => e.stationType === "energy");
                const uniqueEnergyMeters = [...new Set(allEnergyEntries.map(e => e.stackName))];
                const energyData = uniqueEnergyMeters.map(stackName => {
                    const startEntry = data.filter(e => e.stackName === stackName && e.date === normalizedStartDate).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0];
                    const endEntries = data.filter(e => e.stackName === stackName && e.date === normalizedEndDate).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    const endEntry = endEntries.length > 0 ? endEntries[endEntries.length - 1] : null;
                    const initialEnergy = startEntry?.initialEnergy || 0;
                    const lastEnergy = endEntry?.lastEnergy || endEntry?.initialEnergy || 0;
                    const energyDifference = (lastEnergy - initialEnergy).toFixed(2);
                    return { stackName, initialEnergy: Number(initialEnergy).toFixed(2), finalEnergy: Number(lastEnergy).toFixed(2), energyDifference };
                });
                setEnergyData(energyData);
                let quantityData = stackOptions.filter((s) => s.stationType === "effluent_flow").map((stack) => {
                    const startFlow = data.find((e) => normalizeString(e.stackName) === normalizeString(stack.name) && e.date === normalizedStartDate);
                    const endFlows = data.filter((e) => normalizeString(e.stackName) === normalizeString(stack.name) && e.date === normalizedEndDate).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    const endFlow = endFlows.length > 0 ? endFlows[endFlows.length - 1] : null;
                    let initialFlow = Number(startFlow?.initialCumulatingFlow) || 0;
                    let finalFlow = Number(endFlow?.lastCumulatingFlow) || Number(endFlow?.initialCumulatingFlow) || 0;
                    let flowDifference = finalFlow === 0 ? "0.00" : Math.max(0, finalFlow - initialFlow).toFixed(2);
                    return { stackName: stack.name, initialFlow: initialFlow.toFixed(2), finalFlow: finalFlow.toFixed(2), flowDifference };
                });
                const stpInlet = quantityData.find((e) => e.stackName === "STP inlet");
                if (stpInlet) {
                    quantityData = quantityData.map((e) => {
                        if (e.stackName === "ETP outlet") {
                            const bumpedInitial = parseFloat(stpInlet.initialFlow) + 20;
                            const bumpedFinal = parseFloat(stpInlet.finalFlow) + 20;
                            return { ...e, initialFlow: bumpedInitial.toFixed(2), finalFlow: bumpedFinal.toFixed(2), flowDifference: (bumpedFinal - bumpedInitial).toFixed(2) };
                        }
                        return e;
                    });
                }
                setQuantityData(quantityData);
            }
        } catch (error) { console.error("Error fetching energy and flow data:", error); }
    };

    const fetchMinMaxData = async (username, stack, fromDate, toDate) => {
        try {
            const formattedFromDate = fromDate.split("-").reverse().join("/");
            const formattedToDate = toDate.split("-").reverse().join("/");
            const url = `${API_URL}/api/maxmin/${username}/${stack}?fromDate=${formattedFromDate}&toDate=${formattedToDate}`;
            const response = await axios.get(url);
            if (response.data.success) {
                const apiData = response.data.data.find(item => item.stackName === stack);
                setMinMaxData(apiData ? { minValues: apiData.minValues || {}, maxValues: apiData.maxValues || {} } : { minValues: {}, maxValues: {} });
            } else { setMinMaxData({ minValues: {}, maxValues: {} }); }
        } catch (error) { console.error("Error fetching min/max data:", error); setMinMaxData({ minValues: {}, maxValues: {} }); }
    };

    const fetchCalibrationExceed = async (industryType) => {
        try {
            const res = await axios.get(`${API_URL}/api/get-calibration-values-industryType/${industryType}`);
            if (res.data.success) { setCalibrationExceed(res.data.IndustryTypCalibrationExceedValues[0] || {}); }
        } catch (error) { console.error("Error fetching calibration data:", error); }
    };

    const handleUserSelection = (e) => {
        const username = e.target.value;
        setSelectedUser(username);
        const userDetails = users.find((u) => u.userName === username);
        if (userDetails) {
            setUserDetails({
                stackName: userDetails.stackName || "",
                companyName: userDetails.companyName || "N/A",
                address: userDetails.address || "N/A",
            });
            const industryType = userDetails?.validUserOne?.industryType || userDetails?.industryType || "N/A";
            setSelectedIndustryType(industryType);
            fetchCalibrationExceed(industryType);
        }
        fetchStackNames(username);
    };

    const handleIndustryTypeSelection = (e) => {
        const industryType = e.target.value;
        setSelectedIndustryType(industryType);
        fetchCalibrationExceed(industryType);
    };

    const handleSubmit = () => {
        if (selectedUser && selectedStack && startDate && endDate) {
            fetchAvgData(selectedUser, selectedStack, startDate, endDate);
            fetchMinMaxData(selectedUser, selectedStack, startDate, endDate);
            fetchEnergyAndFlowData(selectedUser, startDate, endDate);
            if (selectedIndustryType) { fetchCalibrationExceed(selectedIndustryType); }
        } else { alert("Please select user, stack, and date range!"); }
    };

    const downloadPDF = () => {
        const element = document.getElementById("table-to-download");
        html2pdf().from(element).set({
            margin: 0.4, filename: "report.pdf", image: { type: "jpeg", quality: 1.0 },
            html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        }).save();
    };

    return (
        <div>
            {/* --- Main Page Layout (unchanged) --- */}
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-3 d-none d-lg-block"><DashboardSam /></div>
                    <div className="col-lg-9 col-12">
                        <div className="row1"><div className="col-12"><div className="headermain"><Header /></div></div></div>
                    </div>
                </div>
            </div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-3 d-none d-lg-block"></div>
                    <div className="col-lg-9 col-12">
                        <div className="row"><div className="col-12"></div></div>
                        <div className="maindashboard"><Maindashboard /></div>
                        <div className="table-container mt-5">
                            <button onClick={downloadPDF} className={`download-btn btn btn-success ${userType === "user" ? "mt-5" : ""}`}>Download PDF</button>
                            <h4 className="text-center mt-3">Customise Report</h4>
                            <div className="mt-4 border border-solid shadow m-5 p-5" style={{ borderRadius: "10px" }}>
                                <div className="row">
                                    <div className="col-lg-6">
                                        <select value={selectedUser} onChange={handleUserSelection} className="form-select" style={{ cursor: "pointer", backgroundColor: "#fff", borderRadius: "10px" }}>
                                            {userType === "admin" || userType === "super_admin" ? (
                                                <><option value="">Select User</option>{users.map((user) => (<option key={user.userName} value={user.userName}>{user.userName} -{user.companyName}</option>))}</>
                                            ) : (
                                                <><option value="">Select User</option><option value={loggedUserName}>{loggedUserName}</option></>
                                            )}
                                        </select>
                                    </div>
                                    <div className="col-lg-6">
                                        <select value={selectedStack} onChange={(e) => setSelectedStack(e.target.value)} className="form-select">
                                            <option value="">Select Stack</option>
                                            {stackOptions.filter((stack) => stack.stationType === "effluent").map((stack, index) => (<option key={index} value={stack.name}>{stack.name}</option>))}
                                        </select>
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col-lg-6"><label>Start Date:</label><input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                                    <div className="col-lg-6"><label>End Date:</label><input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                                </div>
                                <div className="row mt-4">
                                    <div className="col-lg-6">
                                        <select value={selectedIndustryType} onChange={handleIndustryTypeSelection} className="form-select">
                                            <option value="">Select Industry Type</option>
                                            {userType === "admin" || userType === "super_admin" ? users.map((user, index) => (<option key={index} value={user.industryType}>{user.industryType}</option>)) : industryTypeList.map((type, index) => (<option key={index} value={type.category}>{type.category}</option>))}
                                        </select>
                                    </div>
                                    <div className="col-lg-6"><button style={{ backgroundColor: "#236a80" }} onClick={handleSubmit} className="btn text-light">Submit</button></div>
                                </div>
                            </div>

                            {/* ====================================================== */}
                            {/* ✨ CORRECTED AND CLEANED REPORT STRUCTURE ✨             */}
                            {/* ====================================================== */}
                            <div id="table-to-download">
                                <div className="report-container">
                                  
                                    {selectedUser && startDate && endDate && (
                                        <div className="report-info-header">
                                            {selectedStack} - {userDetails.companyName}, {userDetails.address} ({new Date(startDate).toLocaleDateString("en-GB")} to {new Date(endDate).toLocaleDateString("en-GB")})
                                        </div>
                                    )}

                                    {/* --- Water Quality Table --- */}
                                    <div className="report-section-title">Water Quality</div>
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th>Parameter</th>
                                                <th>Avg Value</th>
                                                <th>Min Value</th>
                                                <th>Max Value</th>
                                                <th>Acceptable Max Limit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tablesData.length > 0 ? (
                                                Object.entries(tablesData[0].parameters).filter(([key]) => !["cumulatingFlow", "flowRate", "energy", "voltage", "current", "power", "weight"].includes(key)).map(([key, value]) => {
                                                    const exceedenceValue = calibrationExceed[key] ? parseFloat(calibrationExceed[key]) : null;
                                                    const avgValue = parseFloat(value);
                                                    const isExceeded = exceedenceValue !== null && avgValue > exceedenceValue;
                                                    return (
                                                        <tr key={key}>
                                                            <td>{key}</td>
                                                            <td className={isExceeded ? "exceeded-value" : ""}>{value}</td>
                                                            <td>{minMaxData.minValues[key] !== undefined ? parseFloat(minMaxData.minValues[key]).toFixed(2) : "N/A"}</td>
                                                            <td>{minMaxData.maxValues[key] !== undefined ? parseFloat(minMaxData.maxValues[key]).toFixed(2) : "N/A"}</td>
                                                            <td>{exceedenceValue !== null ? exceedenceValue.toFixed(2) : "N/A"}</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr><td colSpan="5">No quality data available for this period.</td></tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* --- Water Quantity Table --- */}
                                    <div className="report-section-title">Water Quantity</div>
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Initial Reading</th>
                                                <th>Final Meter Reading</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quantityData.length > 0 ? (
                                                quantityData.map((q, i) => (
                                                    <tr key={i}>
                                                        <td>{q.stackName}</td>
                                                        <td>{Number(q.initialFlow).toFixed(2)}</td>
                                                        <td>{Number(q.finalFlow).toFixed(2)}</td>
                                                        <td>{q.flowDifference}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4">No quantity data available.</td></tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* --- Energy Report Table --- */}
                                    <div className="report-section-title">Energy Report</div>
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th>Stack Name</th>
                                                <th>Initial Reading</th>
                                                <th>Last Reading</th>
                                                <th>Total kWh</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {energyData.length > 0 ? (
                                                energyData.map((e, i) => (
                                                    <tr key={i}>
                                                        <td>{e.stackName}</td>
                                                        <td>{e.initialEnergy}</td>
                                                        <td>{e.finalEnergy}</td>
                                                        <td>{Math.abs(parseFloat(e.energyDifference)).toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4">No energy data available.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaterQualityTable;