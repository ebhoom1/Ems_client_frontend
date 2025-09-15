import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/apiConfig";
import Header from "../Header/Hedaer";
import Maindashboard from "../Maindashboard/Maindashboard";
import DashboardSam from "../Dashboard/DashboardSam";

const DayReport = () => {
  const [userDetails, setUserDetails] = useState({
    stackName: "",
    companyName: "",
    address: "",
  });
  const industryTypeList = [
    { category: "Sugar" },
    { category: "Cement" },
    { category: "Distillery" },
    { category: "Petrochemical" },
    { category: "Pulp & Paper" },
    { category: "Fertilizer" },
    { category: "Tannery" },
    { category: "Pesticides" },
    { category: "Thermal Power Station" },
    { category: "Caustic Soda" },
    { category: "Pharmaceuticals" },
    { category: "Chemical" },
    { category: "Dye and Dye Stuff" },
    { category: "Refinery" },
    { category: "Copper Smelter" },
    { category: "Iron and Steel" },
    { category: "Zinc Smelter" },
    { category: "Hotel" },
    { category: "Aluminium" },
    { category: "STP/ETP" },
    { category: "NWMS/SWMS" },
    { category: "Noise" },
    { category: "Other" },
  ];

  const { userType, userData } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [stackOptions, setStackOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedStack, setSelectedStack] = useState("");
  const [selectedIndustryType, setSelectedIndustryType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [tablesData, setTablesData] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [quantityData, setQuantityData] = useState([]);
  const [quantityReportData, setQuantityReportData] = useState([]);
  const [minMaxData, setMinMaxData] = useState({ minValues: {}, maxValues: {} });
  const [calibrationExceed, setCalibrationExceed] = useState({});

  const navigate = useNavigate();
  const loggedUserName = userData?.validUserOne?.userName || "";

  const normalizeString = (str) => str.replace(/\s+/g, ' ').trim();

  // Fields to exclude from display
  const excludedFields = ['cumulatingFlow', 'flowRate', 'energy', 'voltage', 'current', 'power', 'weight', '_id'];
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // Fetch users for admin/super_admin
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

  // Fetch stacks by username
  const fetchStackNames = async (username) => {
    try {
      const resp = await axios.get(
        `${API_URL}/api/get-stacknames-by-userName/${username}`
      );
      setStackOptions(resp.data.stackNames || []);
    } catch (err) {
      console.error("Error fetching stack names:", err);
    }
  };

  // Fetch daily averages
  const fetchAvgData = async (username, stack, start, end) => {
    try {
      const s = start.split("-").reverse().join("-");
      const e = end.split("-").reverse().join("-");
      const url = `${API_URL}/api/average/user/${username}/stack/${encodeURIComponent(stack)}/daily-range`;
      const resp = await axios.get(url, { params: { startDate: s, endDate: e } });
      
      if (resp.data.success) {
        // First format all dates to ensure consistent comparison
        const formattedData = resp.data.data.map(item => ({
          ...item,
          date: formatDate(item.date)
        }));

        // Then filter for unique dates (keeping first occurrence)
        const uniqueDates = new Set();
        const filteredData = formattedData
          .filter(item => {
            if (!uniqueDates.has(item.date)) {
              uniqueDates.add(item.date);
              return true;
            }
            return false;
          })
          .map(item => {
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

  // Fetch energy & flow data
  const fetchEnergyAndFlowData = async (username, start, end) => {
    try {
      const from = start.split("-").reverse().join("-");
      const to = end.split("-").reverse().join("-");
      const apiUrl = `${API_URL}/api/energyAndFlowData/${username}/${from}/${to}`;
      const res = await axios.get(apiUrl);
      if (!res.data.success) return;
      const data = res.data.data;

      // Energy
      const allEnergy = data.filter(d => d.stationType === "energy");
      const uniqueEnergy = [...new Set(allEnergy.map(d => d.stackName))];
      const eData = uniqueEnergy.map(name => {
        const startEntry = data.filter(d => d.stackName === name && d.date === from)
          .sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp))[0];
        const endArr = data.filter(d => d.stackName === name && d.date === to)
          .sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));
        const endEntry = endArr.length ? endArr[endArr.length-1] : null;
        const init = startEntry?.initialEnergy||0;
        const last = endEntry?.lastEnergy||startEntry?.lastEnergy||0;
        return { stackName: name, initialEnergy: init.toFixed(2), finalEnergy: last.toFixed(2), energyDifference: (last-init).toFixed(2) };
      });
      setEnergyData(eData);

      // Quantity
      let qData = stackOptions.filter(s => s.stationType === "effluent_flow").map(stack => {
        const startF = data.find(d => normalizeString(d.stackName) === normalizeString(stack.name) && d.date === from);
        const endArr = data.filter(d => normalizeString(d.stackName) === normalizeString(stack.name) && d.date === to)
          .sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));
        const endF = endArr.length ? endArr[endArr.length-1] : null;
        const initF = Number(startF?.initialCumulatingFlow) || 0;
        const lastF = Number(endF?.lastCumulatingFlow) || initF;
        const diff = Math.max(0, lastF-initF).toFixed(2);
        return { stackName: stack.name, initialFlow: initF.toFixed(2), finalFlow: lastF.toFixed(2), flowDifference: diff };
      });

      // bump ETP outlet
      const stpInlet = qData.find(e => e.stackName === "STP inlet");
      if (stpInlet) qData = qData.map(e => e.stackName==="ETP outlet"
        ? { ...e, initialFlow: (parseFloat(stpInlet.initialFlow)+20).toFixed(2), finalFlow: (parseFloat(stpInlet.finalFlow)+20).toFixed(2), flowDifference: (parseFloat(stpInlet.finalFlow)+20 - (parseFloat(stpInlet.initialFlow)+20)).toFixed(2) }
        : e
      );
      setQuantityData(qData);
    } catch (error) {
      console.error("Error fetching energy/flow:", error);
      setEnergyData([]);
      setQuantityData([]);
    }
  };

  // Fetch quantity report data
  const fetchQuantityReportData = async (username, start, end) => {
    try {
      const response = await axios.get(`${API_URL}/api/report`, {
        params: {
          userName: username,
          fromDate: start,
          toDate: end
        }
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

  // Fetch min/max
  const fetchMinMaxData = async (username, stack, from, to) => {
    try {
      const f = from.split("-").reverse().join("/");
      const t = to.split("-").reverse().join("/");
      const url = `${API_URL}/api/maxmin/${username}/${stack}?fromDate=${f}&toDate=${t}`;
      const res = await axios.get(url);
      if (res.data.success) {
        const item = res.data.data.find(i => i.stackName===stack) || {};
        // Filter out excluded fields from min/max data
        const filteredMinValues = {};
        const filteredMaxValues = {};
        
        Object.keys(item.minValues || {}).forEach(key => {
          if (!excludedFields.includes(key)) {
            filteredMinValues[key] = item.minValues[key];
          }
        });
        
        Object.keys(item.maxValues || {}).forEach(key => {
          if (!excludedFields.includes(key)) {
            filteredMaxValues[key] = item.maxValues[key];
          }
        });
        
        setMinMaxData({ minValues: filteredMinValues, maxValues: filteredMaxValues });
      } else setMinMaxData({ minValues:{}, maxValues:{} });
    } catch (err) {
      console.error("Error fetching min/max:", err);
      setMinMaxData({ minValues:{}, maxValues:{} });
    }
  };

  // Fetch calibration exceed
  const fetchCalibrationExceed = async (industryType) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/get-calibration-values-industryType/${industryType}`
      );
      if (res.data.success) {
        // Filter out excluded fields from calibration data
        const calibrationData = res.data.IndustryTypCalibrationExceedValues[0] || {};
        const filteredCalibration = {};
        
        Object.keys(calibrationData).forEach(key => {
          if (!excludedFields.includes(key)) {
            filteredCalibration[key] = calibrationData[key];
          }
        });
        
        setCalibrationExceed(filteredCalibration);
      }
    } catch (err) {
      console.error("Error fetching calibration exceed:", err);
      setCalibrationExceed({});
    }
  };

  // Handlers
  const handleUserSelection = (e) => {
    const uname = e.target.value;
    setSelectedUser(uname);
    const u = users.find(u=>u.userName===uname);
    setUserDetails({ stackName: u?.stackName||"", companyName: u?.companyName||"N/A", address: u?.address||"N/A" });
    const it = u?.validUserOne?.industryType||u?.industryType||"";
    setSelectedIndustryType(it);
    fetchCalibrationExceed(it);
    fetchStackNames(uname);
  };

  const handleIndustryTypeSelection = (e) => {
    const it = e.target.value;
    setSelectedIndustryType(it);
    fetchCalibrationExceed(it);
  };

  const handleSubmit = () => {
    if (selectedUser && startDate && endDate) {
      fetchAvgData(selectedUser, selectedStack, startDate, endDate);
      fetchEnergyAndFlowData(selectedUser, startDate, endDate);
      fetchMinMaxData(selectedUser, selectedStack, startDate, endDate);
      fetchQuantityReportData(selectedUser, startDate, endDate);
    } else alert("Please select user and date range!");
  };

  const downloadPDF = () => {
    const element = document.getElementById("table-to-download");
    html2pdf().from(element).set({ margin: 0.5, filename: "day_report.pdf", html2canvas:{scale:2}}).save();
  };

  const handleBack = () => navigate("/view-report");

  useEffect(()=>{
    if (userType==="admin"||userType==="super_admin") fetchUsers();
    else if (userType==="user") {
      setSelectedUser(loggedUserName);
      const it = userData?.validUserOne?.industryType||userData?.industryType||"";
      setSelectedIndustryType(it);
      setUserDetails({ stackName:userData?.stackName||"", companyName:userData?.validUserOne?.companyName||"N/A", address:userData?.validUserOne?.address||"N/A" });
      fetchCalibrationExceed(it);
      fetchStackNames(loggedUserName);
    }
  },[userType, userData, fetchUsers]);

  // Function to filter out excluded fields from table headers
  const getFilteredHeaders = (data) => {
    if (!data || data.length === 0) return [];
    const sampleItem = data[0];
    return Object.keys(sampleItem).filter(key => !excludedFields.includes(key) && key !== "date");
  };

  // Helper function to group data by stack name
  const groupByStackName = (data) => {
    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.stackName]) {
        grouped[item.stackName] = [];
      }
      grouped[item.stackName].push(item);
    });
    return grouped;
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 d-none d-lg-block"><DashboardSam/></div>
        <div className="col-lg-9 col-12">
          <Header />
          <div className="mt-5">
             <Maindashboard />
          </div>
        

          <div className="border shadow m-4 p-4" style={{borderRadius:10}}>
            <div className="row">
              <div className="col-lg-6">
                <select className="form-select" value={selectedUser} onChange={handleUserSelection}>
                  <option value="">Select User</option>
                  {userType!=="user" ? users.map((u,i)=><option key={i} value={u.userName}>{u.userName}</option>)
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
              <div className="col-lg-6"><input type="date" className="form-control" value={startDate} onChange={e=>setStartDate(e.target.value)}/></div>
              <div className="col-lg-6"><input type="date" className="form-control" value={endDate} onChange={e=>setEndDate(e.target.value)}/></div>
              <div className="col-lg-3 mt-2"><button className="btn" style={{backgroundColor:'#236a80', color:'#fff'}} onClick={handleSubmit}>Submit</button></div>
              <div className="col-lg-3 mt-2"><button className="btn btn-success" onClick={downloadPDF}>Download PDF</button></div>
            </div>
          </div>

          <div id="table-to-download" className="m-4">
            <h4 className="text-center">Quality Report</h4>
            {tablesData.length>0 ? (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    {getFilteredHeaders(tablesData).map((k,i) => (
                      <th key={i}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tablesData.map(r => (
                    <tr key={r.date}>
                      <td>{r.date}</td>
                      {getFilteredHeaders(tablesData).map((k,i) => (
                        <td key={i}>{parseFloat(r[k]).toFixed(2)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-center">No quality data for this period.</p>}

            <h4 className="text-center mt-4">Energy Report</h4>
            {energyData.length>0 ? (
              <table className="table table-striped">
                <thead><tr><th>Stack</th><th>Initial</th><th>Last</th><th>Total (kWh)</th></tr></thead>
                <tbody>
                  {energyData.map((e,i)=>(<tr key={i}><td>{e.stackName}</td><td>{e.initialEnergy}</td><td>{e.finalEnergy}</td><td>{Math.abs(parseFloat(e.energyDifference)).toFixed(2)}</td></tr>))}
                </tbody>
              </table>
            ) : <p className="text-center">No energy meters configured.</p>}

            <h4 className="text-center mt-4">Quantity Report</h4>
            {quantityReportData.length > 0 ? (
              <>
                {/* Summary Table */}
              

                {/* Detailed Daily Tables */}
                {Object.entries(groupByStackName(quantityReportData)).map(([stackName, stackData]) => (
                  <div key={stackName} className="mb-4">
                    <h5 className="text-center">{stackName}</h5>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Initial Flow (m³)</th>
                          <th>Final Flow (m³)</th>
                          <th>Difference (m³)</th>
                          <th>Initial Energy (kWh)</th>
                          <th>Final Energy (kWh)</th>
                          <th>Difference (kWh)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stackData.map((item, index) => (
                          <tr key={index}>
                            <td>{item.date}</td>
                            <td>{parseFloat(item.initialCumulatingFlow).toFixed(1)}</td>
                            <td>{parseFloat(item.lastCumulatingFlow).toFixed(1)}</td>
                            <td>{parseFloat(item.cumulatingFlowDifference).toFixed(1)}</td>
                            <td>{parseFloat(item.initialEnergy).toFixed(2)}</td>
                            <td>{parseFloat(item.lastEnergy).toFixed(2)}</td>
                            <td>{parseFloat(item.energyDifference).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-center">No flow data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayReport;