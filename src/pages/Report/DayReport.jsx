import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/apiConfig";
import Header from "../Header/Hedaer";
import Maindashboard from "../Maindashboard/Maindashboard";
import DashboardSam from "../Dashboard/DashboardSam";
import "./DayReport.css"; // Import the new CSS file

const DayReport = () => {
  const [userDetails, setUserDetails] = useState({
    stackName: "",
    companyName: "",
    address: "",
  });
  const { userType, userData } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [stackOptions, setStackOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedStack, setSelectedStack] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tablesData, setTablesData] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [quantityReportData, setQuantityReportData] = useState([]);
  const navigate = useNavigate();
  const loggedUserName = userData?.validUserOne?.userName || "";

  const excludedFields = ['cumulatingFlow', 'flowRate', 'energy', 'voltage', 'current', 'power', 'weight', '_id'];
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const fetchUsers = useCallback(async () => {
    try {
      const currentUser = userData?.validUserOne;
      if (!currentUser) return setUsers([]);

      let response;
      if (currentUser.adminType === "EBHOOM") {
        response = await axios.get(`${API_URL}/api/getallusers`);
        setUsers(response.data.users.filter(u => !u.isTechnician && !u.isOperator && !u.isTerritorialManager));
      } else if (currentUser.userType === "super_admin") {
        response = await axios.get(`${API_URL}/api/getallusers`);
        const all = response.data.users;
        const myAdmins = all.filter(u => u.createdBy === currentUser._id && u.userType === "admin");
        const myAdminIds = myAdmins.map(a => a._id.toString());
        setUsers(all.filter(u => (u.createdBy === currentUser._id || myAdminIds.includes(u.createdBy))
          && !u.isTechnician && !u.isOperator && !u.isTerritorialManager));
      } else if (currentUser.userType === "admin") {
        response = await axios.get(`${API_URL}/api/get-users-by-creator/${currentUser._id}`);
        setUsers(response.data.users.filter(u => u.userType === "user"));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  }, [userData]);

  const fetchStackNames = async (username) => {
    try {
      const resp = await axios.get(`${API_URL}/api/get-stacknames-by-userName/${username}`);
      setStackOptions(resp.data.stackNames || []);
    } catch (err) { console.error("Error fetching stack names:", err); }
  };

  const fetchAvgData = async (username, stack, start, end) => {
    try {
      const s = start.split("-").reverse().join("-");
      const e = end.split("-").reverse().join("-");
      const url = `${API_URL}/api/average/user/${username}/stack/${encodeURIComponent(stack)}/daily-range`;
      const resp = await axios.get(url, { params: { startDate: s, endDate: e } });
      
      if (resp.data.success) {
        const formattedData = resp.data.data.map(item => ({ ...item, date: formatDate(item.date) }));
        const uniqueDates = new Set();
        const filteredData = formattedData.filter(item => {
          if (!uniqueDates.has(item.date)) {
            uniqueDates.add(item.date);
            return true;
          }
          return false;
        }).map(item => {
          const filteredItem = {};
          Object.keys(item).forEach(key => {
            if (!excludedFields.includes(key)) {
              filteredItem[key] = item[key];
            }
          });
          return filteredItem;
        });
        setTablesData(filteredData);
      } else {
        setTablesData([]);
        console.warn(resp.data.message);
      }
    } catch (err) {
      console.error("Error fetching avg data:", err);
      setTablesData([]);
    }
  };

  const fetchEnergyAndFlowData = async (username, start, end) => {
    try {
      const from = start.split("-").reverse().join("-");
      const to = end.split("-").reverse().join("-");
      const apiUrl = `${API_URL}/api/energyAndFlowData/${username}/${from}/${to}`;
      const res = await axios.get(apiUrl);
      if (!res.data.success) return;
      const data = res.data.data;

      const allEnergy = data.filter(d => d.stationType === "energy");
      const uniqueEnergy = [...new Set(allEnergy.map(d => d.stackName))];
      const eData = uniqueEnergy.map(name => {
        const startEntry = data.filter(d => d.stackName === name && d.date === from).sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp))[0];
        const endArr = data.filter(d => d.stackName === name && d.date === to).sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));
        const endEntry = endArr.length ? endArr[endArr.length-1] : null;
        const init = startEntry?.initialEnergy||0;
        const last = endEntry?.lastEnergy||startEntry?.lastEnergy||0;
        return { stackName: name, initialEnergy: init.toFixed(2), finalEnergy: last.toFixed(2), energyDifference: (last-init).toFixed(2) };
      });
      setEnergyData(eData);
    } catch (error) {
      console.error("Error fetching energy/flow:", error);
      setEnergyData([]);
    }
  };

  const fetchQuantityReportData = async (username, start, end) => {
    try {
      const response = await axios.get(`${API_URL}/api/report`, {
        params: { userName: username, fromDate: start, toDate: end }
      });
      if (response.data.success) {
        setQuantityReportData(response.data.data);
      } else {
        setQuantityReportData([]);
      }
    } catch (error) {
      console.error("Error fetching quantity report data:", error);
      setQuantityReportData([]);
    }
  };

  const handleUserSelection = (e) => {
    const uname = e.target.value;
    setSelectedUser(uname);
    const u = users.find(u=>u.userName===uname);
    setUserDetails({ stackName: u?.stackName||"", companyName: u?.companyName||"N/A", address: u?.address||"N/A" });
    fetchStackNames(uname);
  };

  const handleSubmit = () => {
    if (selectedUser && startDate && endDate) {
      fetchAvgData(selectedUser, selectedStack, startDate, endDate);
      fetchEnergyAndFlowData(selectedUser, startDate, endDate);
      fetchQuantityReportData(selectedUser, startDate, endDate);
    } else alert("Please select user and date range!");
  };

  const downloadPDF = () => {
    const element = document.getElementById("table-to-download");
    html2pdf().from(element).set({
      margin: 0.4,
      filename: "daily_report.pdf",
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    }).save();
  };
  
  useEffect(()=>{
    if (userType==="admin"||userType==="super_admin") fetchUsers();
    else if (userType==="user") {
      setSelectedUser(loggedUserName);
      setUserDetails({ stackName:userData?.stackName||"", companyName:userData?.validUserOne?.companyName||"N/A", address:userData?.validUserOne?.address||"N/A" });
      fetchStackNames(loggedUserName);
    }
  },[userType, userData, fetchUsers, loggedUserName]);

  const getFilteredHeaders = (data) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter(key => !excludedFields.includes(key) && key !== "date");
  };

  const groupByStackName = (data) => {
    return data.reduce((acc, item) => {
      (acc[item.stackName] = acc[item.stackName] || []).push(item);
      return acc;
    }, {});
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 d-none d-lg-block"><DashboardSam/></div>
        <div className="col-lg-9 col-12">
          <Header />
          <div className="mt-5"><Maindashboard /></div>
        
          <div className="border shadow m-4 p-4" style={{borderRadius:10}}>
            <div className="row">
              <div className="col-lg-6">
                <select className="form-select" value={selectedUser} onChange={handleUserSelection}>
                  <option value="">Select User</option>
                  {userType!=="user" ? users.map((u,i)=><option key={i} value={u.userName}>{u.userName} - {u.companyName}</option>)
                    : <option value={loggedUserName}>{loggedUserName}</option>}
                </select>
              </div>
              <div className="col-lg-6">
                <select className="form-select" value={selectedStack} onChange={e=>setSelectedStack(e.target.value)}>
                  <option value="">Select Stack</option>
                  {stackOptions.filter(s=>s.stationType==="effluent").map((s,i)=><option key={i} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-lg-4"><input type="date" className="form-control" value={startDate} onChange={e=>setStartDate(e.target.value)}/></div>
              <div className="col-lg-4"><input type="date" className="form-control" value={endDate} onChange={e=>setEndDate(e.target.value)}/></div>
              <div className="col-lg-4 d-flex gap-2">
                <button className="btn w-100" style={{backgroundColor:'#236a80', color:'#fff'}} onClick={handleSubmit}>Submit</button>
                <button className="btn btn-success w-100" onClick={downloadPDF}>Download PDF</button>
              </div>
            </div>
          </div>

          {/* ============================================= */}
          {/* ✨ NEW, ATTRACTIVE REPORT LAYOUT ✨            */}
          {/* ============================================= */}
          <div id="table-to-download">
            <div className="report-container-day">
              <div className="report-main-title-day">Daily Monitoring Report</div>

              {selectedUser && startDate && endDate && (
                <div className="report-info-header-day">
                  {userDetails.companyName}, {userDetails.address}<br />
                  Report from {formatDate(startDate)} to {formatDate(endDate)}
                </div>
              )}
              
              {/* --- Quality Report --- */}
              <div className="report-section-title-day">Quality Report ({selectedStack})</div>
              {tablesData.length > 0 ? (
                <table className="report-table-day">
                  <thead>
                    <tr>
                      <th>Date</th>
                      {getFilteredHeaders(tablesData).map((k,i) => (<th key={i}>{k}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {tablesData.map((r, index) => (
                      <tr key={index}>
                        <td>{r.date}</td>
                        {getFilteredHeaders(tablesData).map((k,i) => (<td key={i}>{parseFloat(r[k]).toFixed(2)}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="text-center">No quality data for this period.</p>}

             

              {/* --- Quantity Report --- */}
              <div className="report-section-title-day">Quantity Report</div>
              {quantityReportData.length > 0 ? (
                Object.entries(groupByStackName(quantityReportData)).map(([stackName, stackData]) => (
                  <div key={stackName}>
                    <h5 className="report-stack-title-day">{stackName}</h5>
                    <table className="report-table-day">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Initial Flow (m³)</th>
                          <th>Final Flow (m³)</th>
                          <th>Difference (m³)</th>
                        
                        </tr>
                      </thead>
                      <tbody>
                        {stackData.map((item, index) => (
                          <tr key={index}>
                            <td>{formatDate(item.date)}</td>
                            <td>{parseFloat(item.initialCumulatingFlow).toFixed(1)}</td>
                            <td>{parseFloat(item.lastCumulatingFlow).toFixed(1)}</td>
                            <td>{parseFloat(item.cumulatingFlowDifference).toFixed(1)}</td>
                           
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <p className="text-center">No flow data available for this period.</p>
              )}

               {/* --- Energy Report --- */}
              <div className="report-section-title-day">Energy Report</div>
              {energyData.length > 0 ? (
                <table className="report-table-day">
                  <thead><tr><th>Stack Name</th><th>Initial Reading</th><th>Last Reading</th><th>Total (kWh)</th></tr></thead>
                  <tbody>
                    {energyData.map((e,i)=>(<tr key={i}><td>{e.stackName}</td><td>{e.initialEnergy}</td><td>{e.finalEnergy}</td><td>{Math.abs(parseFloat(e.energyDifference)).toFixed(2)}</td></tr>))}
                  </tbody>
                </table>
              ) : <p className="text-center">No energy meters configured.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayReport;