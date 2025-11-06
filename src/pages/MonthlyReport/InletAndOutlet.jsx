import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
// --- CHART IMPORTS ---
import { Line } from 'react-chartjs-2';
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
// --- END CHART IMPORTS ---
import DashboardSam from '../Dashboard/DashboardSam';
import Header from '../Header/Hedaer';
import { toast } from 'react-toastify';
import './InletAndOutlet.css'; // All styles are here now
import { fetchUsers } from '../../redux/features/userLog/userLogSlice';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';

// --- PDF & Alert Imports ---
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'sweetalert2/dist/sweetalert2.min.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import genexlogo from "../../assests/images/logonewgenex.png";

// --- REGISTER CHART.JS ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MySwal = withReactContent(Swal);

// Helper function to get days in month
const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(String(date.getDate()).padStart(2, '0'));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Helper to format date for display
const formatDate = (day, month, year) => {
  const d = String(day).padStart(2, '0');
  const m = String(month + 1).padStart(2, '0');
  const y = String(year).slice(-2);
  return `${d}/${m}/${y}`;
};

const InletAndOutlet = () => {
  const dispatch = useDispatch();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [readings, setReadings] = useState([]); 
  const [currentDate] = useState(new Date());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());

  // --- Refs for Graphs ---
  const inletChartRef = useRef(null);
  const outletChartRef = useRef(null);

  // Redux State
  const { userData } = useSelector((state) => state.user);
  const selectedUserId = useSelector((state) => state.selectedUser.userId); 
  const { users: allUsers } = useSelector((state) => state.userLog);

  // User Role Logic
  const currentUser = userData?.validUserOne;
  const isOperator = currentUser?.userType === "operator";
  const isAdmin = ["admin", "super_admin"].includes(currentUser?.userType) || currentUser?.adminType === "EBHOOM";

  // Fetch all users if admin OR operator
  useEffect(() => {
    if (isAdmin || isOperator) {
      dispatch(fetchUsers());
    }
  }, [dispatch, isAdmin, isOperator]);

  // CRITICAL: Target User Logic
  const targetUser = useMemo(() => {
    if ((isAdmin || isOperator) && selectedUserId) {
      const foundUser = allUsers.find(u => u.userName === selectedUserId);
      if (foundUser) {
        return {
          userName: foundUser.userName,
          siteName: foundUser.companyName || "Selected Site",
          userId: foundUser._id,
        };
      } else {
         return {
            userName: selectedUserId,
            siteName: "Loading Site...", 
            userId: null, 
         }
      }
    }
    return {
      userName: null,
      siteName: "N/A",
      userId: null,
    };
  }, [isOperator, isAdmin, currentUser, selectedUserId, allUsers]);

  // Initialize Table
  useEffect(() => {
    const days = getDaysInMonth(year, month);
    const initialReadings = days.map(day => ({
      date: day,
      inletInitial: "",
      inletFinal: "",
      inletComment: "",
      outletInitial: "",
      outletFinal: "",
      outletComment: "",
    }));
    setReadings(initialReadings);
    setReport(null); 
  }, [year, month, targetUser.userName]);

  // Data Fetching
  useEffect(() => {
    if (targetUser.userName) {
      const fetchReport = async () => {
        setLoading(true);
        try {
          const apiUrlToFetch = `${API_URL}/api/flow-report/${targetUser.userName}/${year}/${month}`;
          console.log("🔄 Fetching report from:", apiUrlToFetch);
          const { data } = await axios.get(apiUrlToFetch);
          setReport(data); 
          console.log("✅ Report fetched successfully for:", targetUser.userName);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setReport(null); 
            console.log("ℹ️ No existing report found (404) for:", targetUser.userName);
          } else {
            console.error("❌ Error fetching report:", error);
            toast.error("Failed to fetch report");
          }
        }
        setLoading(false);
      };

      fetchReport();
    }
  }, [targetUser.userName, year, month]);

  // Populate form with fetched data
  useEffect(() => {
    const days = getDaysInMonth(year, month);
    let initialReadings = days.map(day => ({
      date: day,
      inletInitial: "",
      inletFinal: "",
      inletComment: "",
      outletInitial: "",
      outletFinal: "",
      outletComment: "",
    }));

    if (report && report.readings) {
      initialReadings = initialReadings.map(dayReading => {
        const found = report.readings.find(r => r.date === dayReading.date);
        return found ? { ...dayReading, ...found } : dayReading;
      });
    }

    // Auto-fill next day's initial from previous day's final
    for (let i = 1; i < initialReadings.length; i++) {
        if (initialReadings[i].inletInitial === "" && initialReadings[i-1].inletFinal) {
            initialReadings[i].inletInitial = initialReadings[i-1].inletFinal;
        }
        if (initialReadings[i].outletInitial === "" && initialReadings[i-1].outletFinal) {
            initialReadings[i].outletInitial = initialReadings[i-1].outletFinal;
        }
    }
    if (initialReadings.length > 0 && initialReadings[0].inletInitial === "" && report?.previousInletFinal) {
        initialReadings[0].inletInitial = report.previousInletFinal;
    }
    if (initialReadings.length > 0 && initialReadings[0].outletInitial === "" && report?.previousOutletFinal) {
        initialReadings[0].outletInitial = report.previousOutletFinal;
    }

    setReadings(initialReadings);
  }, [report, year, month]); 

  // --- NEW: Calculate Row Totals ---
  // This memo calculates totals for the table and graphs
  const processedReadings = useMemo(() => {
    let totalInlet = 0;
    let totalOutlet = 0;

    const chartData = readings.map(r => {
      const inletInitial = r.inletInitial || 0;
      const outletInitial = r.outletInitial || 0;
      const inletFinal = r.inletFinal || 0;
      const outletFinal = r.outletFinal || 0;

      const inletTotal = (inletFinal && inletInitial) ? (parseFloat(inletFinal) - parseFloat(inletInitial)) : 0;
      const outletTotal = (outletFinal && outletInitial) ? (parseFloat(outletFinal) - parseFloat(outletInitial)) : 0;

      totalInlet += inletTotal;
      totalOutlet += outletTotal;

      return {
        ...r,
        inletInitial,
        outletInitial,
        inletTotal: inletTotal.toFixed(2),
        outletTotal: outletTotal.toFixed(2)
      };
    });

    return {
      tableData: chartData,
      totalInlet: totalInlet.toFixed(2),
      totalOutlet: totalOutlet.toFixed(2)
    };
  }, [readings]);


  // Form Handlers
  const handleInputChange = (index, field, value) => {
    const newReadings = [...readings];
    newReadings[index] = {
      ...newReadings[index],
      [field]: value,
    };

    // Auto-fill logic when user types in FINAL
    if (field === 'inletFinal' && index + 1 < newReadings.length) {
        newReadings[index + 1].inletInitial = value;
    }
    if (field === 'outletFinal' && index + 1 < newReadings.length) {
        newReadings[index + 1].outletInitial = value;
    }

    setReadings(newReadings);
  };

  // CRITICAL: Data Saving Function
  const handleSave = async () => {
    console.log("=== 💾 SAVE BUTTON CLICKED ===");
    
    if (!targetUser.userId || !targetUser.userName) {
      console.error("❌ SAVE BLOCKED: Missing user ID or Username");
      toast.error("Cannot save. User data is incomplete. (Try re-selecting user)");
      return;
    }
    
    const validReadings = readings
      .map(r => ({
        date: r.date,
        inletInitial: r.inletInitial === "" ? null : Number(r.inletInitial),
        inletFinal: r.inletFinal === "" ? null : Number(r.inletFinal),
        inletComment: r.inletComment === "" ? null : r.inletComment,
        outletInitial: r.outletInitial === "" ? null : Number(r.outletInitial),
        outletFinal: r.outletFinal === "" ? null : Number(r.outletFinal),
        outletComment: r.outletComment === "" ? null : r.outletComment,
      }))
      .filter(r => r.inletInitial !== null || r.inletFinal !== null || r.inletComment !== null || r.outletInitial !== null || r.outletFinal !== null || r.outletComment !== null);

    const payload = {
      userId: targetUser.userId,
      userName: targetUser.userName,
      siteName: targetUser.siteName,
      year: year,
      month: month,
      readings: validReadings, 
    };

    console.log("📤 PAYLOAD BEING SENT:", JSON.stringify(payload, null, 2));
    
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/flow-report`, payload);
      
      console.log("✅ SERVER RESPONSE:", data);
      setReport(data); 
      
      MySwal.fire({
        title: 'Report Saved!',
        html: (
          <div>
            <h3 style={{ color: '#236a80', marginTop: 0, fontWeight: 'bold' }}>Success!</h3>
            <p style={{ fontSize: '1.1rem' }}>Report saved for: <strong>{data.userName}</strong></p>
            <p style={{ fontSize: '0.9rem' }}>Site: {data.siteName}</p>
          </div>
        ),
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error("❌ SAVE ERROR:", error);
      if (error.response) {
        toast.error(error.response.data.message || "Failed to save report");
      } else {
        toast.error("Failed to save report. Check console for details.");
      }
    }
    setLoading(false);
  };

  // --- PDF Download Handler ---
  const handleDownloadPDF = async () => {
    setLoading(true);
    toast.info("Generating PDF... Please wait.");

    try {
        const doc = new jsPDF();
        const logoImg = new Image();
        logoImg.src = genexlogo;

        await new Promise((resolve) => {
            logoImg.onload = resolve;
            logoImg.onerror = () => {
                console.error("Failed to load logo");
                resolve(); 
            };
        });

        // 1. Add Header
        doc.setFillColor("#236a80");
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, 'F'); 
        doc.addImage(logoImg, 'PNG', 10, 5, 25, 25); // Logo moved left
        doc.setFont("helvetica", "bold");
        doc.setTextColor("#FFFFFF");
        doc.setFontSize(14);
        doc.text("Genex Utility Management Pvt Ltd", 110, 12, { align: 'center' });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("Sujatha Arcade, Second Floor, #32 Lake View Defence Colony, Shettihalli, Post, Jalahalli West, Bengaluru, Karnataka 560015", 110, 20, { align: 'center' });
        doc.text("Phone: +91-9663044156", 110, 25, { align: 'center' });

        // 2. Add Report Title
        doc.setTextColor("#000000");
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Site: ${targetUser.siteName} (${targetUser.userName})`, 15, 45);
        doc.text(`Month: ${monthNames[month]} ${year}`, 15, 52);

        // 3. Add Table
        const tableHead = [
          ["Date", "Inlet-Initial", "Inlet-Final", "Inlet-Total", "Inlet-Comment", "Outlet-Initial", "Outlet-Final", "Outlet-Total", "Outlet-Comment"]
        ];
        
        const tableBody = processedReadings.tableData.map(r => [
            formatDate(r.date, month, year),
            r.inletInitial || 'N/A',
            r.inletFinal || 'N/A',
            r.inletTotal,
            r.inletComment || 'N/A',
            r.outletInitial || 'N/A',
            r.outletFinal || 'N/A',
            r.outletTotal,
            r.outletComment || 'N/A'
        ]);

        // --- ADD TOTAL ROW TO TABLE BODY ---
        tableBody.push([
          { content: 'TOTALS', styles: { fontStyle: 'bold', halign: 'right' } },
          '', '', // Skip initial/final
          { content: processedReadings.totalInlet, styles: { fontStyle: 'bold' } },
          '', // Skip comment
          '', '', // Skip initial/final
          { content: processedReadings.totalOutlet, styles: { fontStyle: 'bold' } },
          '' // Skip comment
        ]);

        doc.autoTable({
            startY: 60,
            head: tableHead,
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: '#236a80' },
            styles: { fontSize: 7 } 
        });

        // 4. Add Graphs (if admin)
        if (isAdmin) {
            let chartYPosition = doc.autoTable.previous.finalY + 15; 
            
            if (inletChartRef.current) {
                if (chartYPosition + 100 > doc.internal.pageSize.getHeight() - 10) {
                   doc.addPage();
                   chartYPosition = 15;
                }
                doc.setFontSize(14);
                doc.text("Inlet Flow (KL) Over Time", 15, chartYPosition);
                const inletCanvas = await html2canvas(inletChartRef.current, { scale: 2 });
                const inletImgData = inletCanvas.toDataURL('image/png');
                doc.addImage(inletImgData, 'PNG', 15, chartYPosition + 10, 180, 90);
                chartYPosition += 110; 
            }
            
            if (outletChartRef.current) {
                if (chartYPosition + 100 > doc.internal.pageSize.getHeight() - 10) {
                   doc.addPage();
                   chartYPosition = 15;
                }
                doc.setFontSize(14);
                doc.text("Outlet Flow (KL) Over Time", 15, chartYPosition);
                const outletCanvas = await html2canvas(outletChartRef.current, { scale: 2 });
                const outletImgData = outletCanvas.toDataURL('image/png');
                doc.addImage(outletImgData, 'PNG', 15, chartYPosition + 10, 180, 90); 
            }
        }

        // 5. Save PDF
        doc.save(`${targetUser.siteName}_${monthNames[month]}_${year}_Flow_Report.pdf`);
        toast.success("PDF generated successfully!");

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF.");
    }

    setLoading(false);
  };

  // --- CSV Download Handler ---
  const handleDownloadCSV = () => {
    setLoading(true);
    
    let csvContent = "Date,Inlet-Initial,Inlet-Final,Inlet-Total,Inlet-Comment,Outlet-Initial,Outlet-Final,Outlet-Total,Outlet-Comment\n";
    
    processedReadings.tableData.forEach((r) => {
      const dateStr = formatDate(r.date, month, year);
      const inletComment = `"${r.inletComment || ''}"`; 
      const outletComment = `"${r.outletComment || ''}"`; 

      csvContent += `${dateStr},${r.inletInitial || ''},${r.inletFinal || ''},${r.inletTotal},${inletComment},${r.outletInitial || ''},${r.outletFinal || ''},${r.outletTotal},${outletComment}\n`;
    });

    // Add Total Row
    csvContent += `\nTOTAL,,${processedReadings.totalInlet},,,${processedReadings.totalOutlet},`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetUser.siteName}_${monthNames[month]}_${year}_Flow_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    setLoading(false);
    toast.success("CSV downloaded successfully!");
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // --- NEW: Chart Configuration ---
  const chartLabels = processedReadings.tableData.map(r => formatDate(r.date, month, year));
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { font: { size: 12, weight: 'bold' } } },
      title: { display: true, font: { size: 16, weight: 'bold' }, color: '#236a80' }
    },
    scales: {
      x: { ticks: { autoSkip: true, maxTicksLimit: 15 } },
      y: { beginAtZero: true, ticks: { callback: (value) => `${value} KL` } }
    },
  };

  const inletFlowData = {
    labels: chartLabels,
    datasets: [{
      label: "Inlet Total (KL)",
      data: processedReadings.tableData.map(r => r.inletTotal), 
      borderColor: "#236a80",
      backgroundColor: "rgba(52, 152, 219, 0.1)",
      borderWidth: 3,
      spanGaps: true,
      tension: 0.3,
    }],
  };
  
  const outletFlowData = {
    labels: chartLabels,
    datasets: [{
      label: "Outlet Total (KL)",
      data: processedReadings.tableData.map(r => r.outletTotal),
      borderColor: "#e74c3c",
      backgroundColor: "rgba(231, 76, 60, 0.1)",
      borderWidth: 3,
      spanGaps: true,
      tension: 0.3,
    }],
  };


  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>

        <div className="col-lg-9 col-12">
          <Header />
          
          <div className="row main-content-row"> 
            <div className="col-12">
              
              {!targetUser.userName ? (
                // --- A. SHOW PROMPT TO SELECT USER ---
                <div className="card-style">
                  <div className="prompt-style">
                    <i className="fas fa-hand-pointer prompt-icon"></i>
                    <h3 className="prompt-title">Please Select a User</h3>
                    <p className="prompt-text">
                      Use the dropdown in the header to select a user to view or add their monthly report.
                    </p>
                  </div>
                </div>

              ) : (
                
                // --- B. SHOW THE FULL REPORT INTERFACE ---
                <> 
                  {/* Header Card */}
                  <div className="header-style">
                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                      <div>
                        <h3 className="header-title">
                          INLET & OUTLET FLOW READINGS
                        </h3>
                        <div className="header-subtitle">
                          <strong>SITE:</strong> {targetUser.siteName || "N/A"}
                          <strong className='ms-2'>({targetUser.userName || "No User Selected"})</strong>
                          <span className="mx-3">|</span>
                          <strong>MONTH:</strong> {monthNames[month]} {year}
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center mt-3 mt-md-0">
                        <select
                          className="form-select me-2 date-picker-style"
                          value={month}
                          onChange={(e) => setMonth(Number(e.target.value))}
                        >
                          {monthNames.map((name, index) => (
                            <option key={index} value={index}>{name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          className="form-control date-picker-style"
                          value={year}
                          onChange={(e) => setYear(Number(e.target.value))}
                          style={{ width: "110px" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="card-style">
                    <div className="row">
                      {/* Data Table */}
                      <div className={isAdmin ? "col-lg-6" : "col-12"}> {/* SPLIT SCREEN FOR ADMIN */}
                        <div className="table-container">
                          <table className="table table-hover report-table">
                            <thead>
                              <tr>
                                <th rowSpan="2" className="table-header-style">DATE</th>
                                <th colSpan="4" className="table-header-style">INLET FLOW METER (KL)</th>
                                <th colSpan="4" className="table-header-style">OUTLET FLOW METER (KL)</th>
                              </tr>
                              <tr>
                                <th className="table-subheader-style">INITIAL</th>
                                <th className="table-subheader-style">FINAL</th>
                                <th className="table-subheader-style">TOTAL</th>
                                <th className="table-subheader-style">COMMENT</th>
                                <th className="table-subheader-style">INITIAL</th>
                                <th className="table-subheader-style">FINAL</th>
                                <th className="table-subheader-style">TOTAL</th>
                                <th className="table-subheader-style">COMMENT</th>
                              </tr>
                            </thead>
                            <tbody>
                              {processedReadings.tableData.map((reading, index) => (
                                  <tr key={index} className="table-row-style">
                                    <td className="table-cell-style">{formatDate(reading.date, month, year)}</td>
                                    
                                    {/* Inlet */}
                                    <td className="table-cell-input-style">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm input-style"
                                        value={reading.inletInitial} 
                                        onChange={(e) => handleInputChange(index, "inletInitial", e.target.value)} 
                                        disabled={loading}
                                      />
                                    </td>
                                    <td className="table-cell-input-style">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm input-style"
                                        value={reading.inletFinal}
                                        onChange={(e) => handleInputChange(index, "inletFinal", e.target.value)}
                                        disabled={loading}
                                      />
                                    </td>
                                    <td className="table-cell-style">
                                      <input type="number" value={reading.inletTotal} className="read-only-style" disabled />
                                    </td>
                                    <td className="table-cell-input-style">
                                      <input
                                        type="text"
                                        className="form-control form-control-sm comment-input-style"
                                        value={reading.inletComment}
                                        onChange={(e) => handleInputChange(index, "inletComment", e.target.value)}
                                        disabled={loading}
                                      />
                                    </td>

                                    {/* Outlet */}
                                    <td className="table-cell-input-style">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm input-style"
                                        value={reading.outletInitial}
                                        onChange={(e) => handleInputChange(index, "outletInitial", e.target.value)}
                                        disabled={loading}
                                      />
                                    </td>
                                    <td className="table-cell-input-style">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm input-style"
                                        value={reading.outletFinal}
                                        onChange={(e) => handleInputChange(index, "outletFinal", e.target.value)}
                                        disabled={loading}
                                      />
                                    </td>
                                    <td className="table-cell-style">
                                      <input type="number" value={reading.outletTotal} className="read-only-style" disabled />
                                    </td>
                                    <td className="table-cell-input-style">
                                      <input
                                        type="text"
                                        className="form-control form-control-sm comment-input-style"
                                        value={reading.outletComment}
                                        onChange={(e) => handleInputChange(index, "outletComment", e.target.value)}
                                        disabled={loading}
                                      />
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                            {/* --- NEW: TABLE FOOTER FOR TOTALS --- */}
                            <tfoot>
                              <tr className="table-footer-style">
                                <td>TOTAL (KL)</td>
                                <td colSpan="2"></td> {/* Skip Initial, Final */}
                                <td>{processedReadings.totalInlet}</td>
                                <td></td> {/* Skip Comment */}
                                <td colSpan="2"></td> {/* Skip Initial, Final */}
                                <td>{processedReadings.totalOutlet}</td>
                                <td></td> {/* Skip Comment */}
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* --- NEW: GRAPHS (Admin Only) --- */}
                      {isAdmin && (
                        <div className="col-lg-6">
                          <div className="graph-container-wrapper">
                            {/* Inlet Chart Container */}
                            <div 
                              ref={inletChartRef} // Add ref here
                              className="graph-container">
                              <Line 
                                options={{
                                  ...chartOptions, 
                                  plugins: {
                                    ...chartOptions.plugins, 
                                    title: { ...chartOptions.plugins.title, text: "Inlet Total (KL) Over Time" }
                                  }
                                }} 
                                data={inletFlowData} 
                              />
                            </div>
                            {/* Outlet Chart Container */}
                            <div 
                              ref={outletChartRef} // Add ref here
                              className="graph-container"
                              style={{ border: '2px dotted #e74c3c' }} // Red border for outlet
                            >
                              <Line 
                                options={{
                                  ...chartOptions, 
                                  plugins: {
                                    ...chartOptions.plugins, 
                                    title: { ...chartOptions.plugins.title, text: "Outlet Total (KL) Over Time" }
                                  }
                                }} 
                                data={outletFlowData} 
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {(isOperator || isAdmin) && (
                      <div className="text-center mt-4">
                        <button
                          className="button-style"
                          onClick={handleSave}
                          disabled={loading || !targetUser.userId}
                        >
                          {loading ? "Saving..." : "💾 Save Report"}
                        </button>
                        
                        {(isOperator || isAdmin) && ( 
                          <>
                            <button
                              className="button-style-pdf"
                              onClick={handleDownloadPDF}
                              disabled={loading || !targetUser.userId}
                            >
                              {loading ? "..." : "📥 Download PDF"} 
                            </button>

                            <button
                              className="button-style-csv"
                              onClick={handleDownloadCSV}
                              disabled={loading || !targetUser.userId}
                            >
                              {loading ? "..." : "📊 Download CSV"} 
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </> 
              )} 
              {/* End of conditional rendering */}

            </div>
          </div>
        </div> 
      </div>
    </div>
  );
};

export default InletAndOutlet;