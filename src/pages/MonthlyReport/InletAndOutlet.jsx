// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// // --- CHART IMPORTS ---
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// // --- END CHART IMPORTS ---
// import DashboardSam from "../Dashboard/DashboardSam";
// import Header from "../Header/Hedaer";
// import { toast } from "react-toastify";
// import "./InletAndOutlet.css"; // All styles are here now
// import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
// import axios from "axios";
// import { API_URL } from "../../utils/apiConfig";

// // --- PDF & Alert Imports ---
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import "sweetalert2/dist/sweetalert2.min.css";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import html2canvas from "html2canvas";
// import genexlogo from "../../assests/images/logonewgenex.png";

// // --- REGISTER CHART.JS ---
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const MySwal = withReactContent(Swal);

// // Helper function to get days in month
// const getDaysInMonth = (year, month) => {
//   const date = new Date(year, month, 1);
//   const days = [];
//   while (date.getMonth() === month) {
//     days.push(String(date.getDate()).padStart(2, "0"));
//     date.setDate(date.getDate() + 1);
//   }
//   return days;
// };

// // Helper to format date for display
// const formatDate = (day, month, year) => {
//   const d = String(day).padStart(2, "0");
//   const m = String(month + 1).padStart(2, "0");
//   const y = String(year).slice(-2);
//   return `${d}/${m}/${y}`;
// };

// const InletAndOutlet = ({ embedMode = false }) => {
//   const dispatch = useDispatch();
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [readings, setReadings] = useState([]);
//   const [currentDate] = useState(new Date());
//   const [year, setYear] = useState(currentDate.getFullYear());
//   const [month, setMonth] = useState(currentDate.getMonth());

//   // --- Refs for Graphs ---
//   const inletChartRef = useRef(null);
//   const outletChartRef = useRef(null);

//   // Redux State
//   const { userData } = useSelector((state) => state.user);
//   const selectedUserId = useSelector((state) => state.selectedUser.userId);
//   const { users: allUsers } = useSelector((state) => state.userLog);

//   // User Role Logic
//   const currentUser = userData?.validUserOne;
//   const isOperator = currentUser?.userType === "operator";
//   const isAdmin =
//     ["admin", "super_admin"].includes(currentUser?.userType) ||
//     currentUser?.adminType === "EBHOOM";

//   // Fetch all users if admin OR operator
//   useEffect(() => {
//     if (isAdmin || isOperator) {
//       dispatch(fetchUsers());
//     }
//   }, [dispatch, isAdmin, isOperator]);

//   // CRITICAL: Target User Logic
//   const targetUser = useMemo(() => {
//     if ((isAdmin || isOperator) && selectedUserId) {
//       const foundUser = allUsers.find((u) => u.userName === selectedUserId);
//       if (foundUser) {
//         return {
//           userName: foundUser.userName,
//           siteName: foundUser.companyName || "Selected Site",
//           userId: foundUser._id,
//         };
//       } else {
//         return {
//           userName: selectedUserId,
//           siteName: "Loading Site...",
//           userId: null,
//         };
//       }
//     }
//     return {
//       userName: null,
//       siteName: "N/A",
//       userId: null,
//     };
//   }, [isOperator, isAdmin, currentUser, selectedUserId, allUsers]);

//   // Initialize Table
//   useEffect(() => {
//     const days = getDaysInMonth(year, month);
//     const initialReadings = days.map((day) => ({
//       date: day,
//       inletInitial: "",
//       inletFinal: "",
//       inletComment: "",
//       outletInitial: "",
//       outletFinal: "",
//       outletComment: "",
//     }));
//     setReadings(initialReadings);
//     setReport(null);
//   }, [year, month, targetUser.userName]);

//   // Data Fetching
//   useEffect(() => {
//     if (targetUser.userName) {
//       const fetchReport = async () => {
//         setLoading(true);
//         try {
//           const apiUrlToFetch = `${API_URL}/api/flow-report/${targetUser.userName}/${year}/${month}`;
//           console.log("🔄 Fetching report from:", apiUrlToFetch);
//           const { data } = await axios.get(apiUrlToFetch);
//           setReport(data);
//           console.log(
//             "✅ Report fetched successfully for:",
//             targetUser.userName
//           );
//         } catch (error) {
//           if (error.response && error.response.status === 404) {
//             setReport(null);
//             console.log(
//               "ℹ️ No existing report found (404) for:",
//               targetUser.userName
//             );
//           } else {
//             console.error("❌ Error fetching report:", error);
//             toast.error("Failed to fetch report");
//           }
//         }
//         setLoading(false);
//       };

//       fetchReport();
//     }
//   }, [targetUser.userName, year, month]);

//   // Populate form with fetched data
//   useEffect(() => {
//     const days = getDaysInMonth(year, month);
//     let initialReadings = days.map((day) => ({
//       date: day,
//       inletInitial: "",
//       inletFinal: "",
//       inletComment: "",
//       outletInitial: "",
//       outletFinal: "",
//       outletComment: "",
//     }));

//     if (report && report.readings) {
//       initialReadings = initialReadings.map((dayReading) => {
//         const found = report.readings.find((r) => r.date === dayReading.date);
//         return found ? { ...dayReading, ...found } : dayReading;
//       });
//     }

//     // Auto-fill next day's initial from previous day's final
//     for (let i = 1; i < initialReadings.length; i++) {
//       if (
//         initialReadings[i].inletInitial === "" &&
//         initialReadings[i - 1].inletFinal
//       ) {
//         initialReadings[i].inletInitial = initialReadings[i - 1].inletFinal;
//       }
//       if (
//         initialReadings[i].outletInitial === "" &&
//         initialReadings[i - 1].outletFinal
//       ) {
//         initialReadings[i].outletInitial = initialReadings[i - 1].outletFinal;
//       }
//     }
//     if (
//       initialReadings.length > 0 &&
//       initialReadings[0].inletInitial === "" &&
//       report?.previousInletFinal
//     ) {
//       initialReadings[0].inletInitial = report.previousInletFinal;
//     }
//     if (
//       initialReadings.length > 0 &&
//       initialReadings[0].outletInitial === "" &&
//       report?.previousOutletFinal
//     ) {
//       initialReadings[0].outletInitial = report.previousOutletFinal;
//     }

//     setReadings(initialReadings);
//   }, [report, year, month]);

//   // --- NEW: Calculate Row Totals ---
//   // This memo calculates totals for the table and graphs
//   const processedReadings = useMemo(() => {
//     let totalInlet = 0;
//     let totalOutlet = 0;

//     const chartData = readings.map((r) => {
//       const inletInitial = r.inletInitial || 0;
//       const outletInitial = r.outletInitial || 0;
//       const inletFinal = r.inletFinal || 0;
//       const outletFinal = r.outletFinal || 0;

//       const inletTotal =
//         inletFinal && inletInitial
//           ? parseFloat(inletFinal) - parseFloat(inletInitial)
//           : 0;
//       const outletTotal =
//         outletFinal && outletInitial
//           ? parseFloat(outletFinal) - parseFloat(outletInitial)
//           : 0;

//       totalInlet += inletTotal;
//       totalOutlet += outletTotal;

//       return {
//         ...r,
//         inletInitial,
//         outletInitial,
//         inletTotal: inletTotal.toFixed(2),
//         outletTotal: outletTotal.toFixed(2),
//       };
//     });

//     return {
//       tableData: chartData,
//       totalInlet: totalInlet.toFixed(2),
//       totalOutlet: totalOutlet.toFixed(2),
//     };
//   }, [readings]);

//   // Form Handlers
//   const handleInputChange = (index, field, value) => {
//     const newReadings = [...readings];
//     newReadings[index] = {
//       ...newReadings[index],
//       [field]: value,
//     };

//     // Auto-fill logic when user types in FINAL
//     if (field === "inletFinal" && index + 1 < newReadings.length) {
//       newReadings[index + 1].inletInitial = value;
//     }
//     if (field === "outletFinal" && index + 1 < newReadings.length) {
//       newReadings[index + 1].outletInitial = value;
//     }

//     setReadings(newReadings);
//   };

//   // CRITICAL: Data Saving Function
//   const handleSave = async () => {
//     console.log("=== 💾 SAVE BUTTON CLICKED ===");

//     if (!targetUser.userId || !targetUser.userName) {
//       console.error("❌ SAVE BLOCKED: Missing user ID or Username");
//       toast.error(
//         "Cannot save. User data is incomplete. (Try re-selecting user)"
//       );
//       return;
//     }

//     const validReadings = readings
//       .map((r) => ({
//         date: r.date,
//         inletInitial: r.inletInitial === "" ? null : Number(r.inletInitial),
//         inletFinal: r.inletFinal === "" ? null : Number(r.inletFinal),
//         inletComment: r.inletComment === "" ? null : r.inletComment,
//         outletInitial: r.outletInitial === "" ? null : Number(r.outletInitial),
//         outletFinal: r.outletFinal === "" ? null : Number(r.outletFinal),
//         outletComment: r.outletComment === "" ? null : r.outletComment,
//       }))
//       .filter(
//         (r) =>
//           r.inletInitial !== null ||
//           r.inletFinal !== null ||
//           r.inletComment !== null ||
//           r.outletInitial !== null ||
//           r.outletFinal !== null ||
//           r.outletComment !== null
//       );

//     const payload = {
//       userId: targetUser.userId,
//       userName: targetUser.userName,
//       siteName: targetUser.siteName,
//       year: year,
//       month: month,
//       readings: validReadings,
//     };

//     console.log("📤 PAYLOAD BEING SENT:", JSON.stringify(payload, null, 2));

//     setLoading(true);
//     try {
//       const { data } = await axios.post(`${API_URL}/api/flow-report`, payload);

//       console.log("✅ SERVER RESPONSE:", data);
//       setReport(data);

//       MySwal.fire({
//         title: "Report Saved!",
//         html: (
//           <div>
//             <h3 style={{ color: "#236a80", marginTop: 0, fontWeight: "bold" }}>
//               Success!
//             </h3>
//             <p style={{ fontSize: "1.1rem" }}>
//               Report saved for: <strong>{data.userName}</strong>
//             </p>
//             <p style={{ fontSize: "0.9rem" }}>Site: {data.siteName}</p>
//           </div>
//         ),
//         icon: "success",
//         timer: 3000,
//         showConfirmButton: false,
//       });
//     } catch (error) {
//       console.error("❌ SAVE ERROR:", error);
//       if (error.response) {
//         toast.error(error.response.data.message || "Failed to save report");
//       } else {
//         toast.error("Failed to save report. Check console for details.");
//       }
//     }
//     setLoading(false);
//   };

//   // --- PDF Download Handler ---
//   const handleDownloadPDF = async () => {
//     setLoading(true);
//     toast.info("Generating PDF... Please wait.");

//     try {
//       const doc = new jsPDF();
//       const logoImg = new Image();
//       logoImg.src = genexlogo;

//       await new Promise((resolve) => {
//         logoImg.onload = resolve;
//         logoImg.onerror = () => {
//           console.error("Failed to load logo");
//           resolve();
//         };
//       });

//       // 1. Add Header
//       doc.setFillColor("#236a80");
//       doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, "F");
//       doc.addImage(logoImg, "PNG", 10, 5, 25, 25); // Logo moved left
//       doc.setFont("helvetica", "bold");
//       doc.setTextColor("#FFFFFF");
//       doc.setFontSize(14);
//       doc.text("Genex Utility Management Pvt Ltd", 110, 12, {
//         align: "center",
//       });
//       doc.setFont("helvetica", "normal");
//       doc.setFontSize(8);
//       doc.text(
//         "Sujatha Arcade, Second Floor, #32 Lake View Defence Colony, Shettihalli, Post, Jalahalli West, Bengaluru, Karnataka 560015",
//         110,
//         20,
//         { align: "center" }
//       );
//       doc.text("Phone: +91-9663044156", 110, 25, { align: "center" });

//       // 2. Add Report Title
//       doc.setTextColor("#000000");
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text(`Site: ${targetUser.siteName} (${targetUser.userName})`, 15, 45);
//       doc.text(`Month: ${monthNames[month]} ${year}`, 15, 52);

//       // 3. Add Table
//       const tableHead = [
//         [
//           "Date",
//           "Inlet-Initial",
//           "Inlet-Final",
//           "Inlet-Total",
//           "Inlet-Comment",
//           "Outlet-Initial",
//           "Outlet-Final",
//           "Outlet-Total",
//           "Outlet-Comment",
//         ],
//       ];

//       const tableBody = processedReadings.tableData.map((r) => [
//         formatDate(r.date, month, year),
//         r.inletInitial || "N/A",
//         r.inletFinal || "N/A",
//         r.inletTotal,
//         r.inletComment || "N/A",
//         r.outletInitial || "N/A",
//         r.outletFinal || "N/A",
//         r.outletTotal,
//         r.outletComment || "N/A",
//       ]);

//       // --- ADD TOTAL ROW TO TABLE BODY ---
//       tableBody.push([
//         { content: "TOTALS", styles: { fontStyle: "bold", halign: "right" } },
//         "",
//         "", // Skip initial/final
//         {
//           content: processedReadings.totalInlet,
//           styles: { fontStyle: "bold" },
//         },
//         "", // Skip comment
//         "",
//         "", // Skip initial/final
//         {
//           content: processedReadings.totalOutlet,
//           styles: { fontStyle: "bold" },
//         },
//         "", // Skip comment
//       ]);

//       doc.autoTable({
//         startY: 60,
//         head: tableHead,
//         body: tableBody,
//         theme: "grid",
//         headStyles: { fillColor: "#236a80" },
//         styles: { fontSize: 7 },
//       });

//       // 4. Add Graphs (if admin)
//       if (isAdmin) {
//         let chartYPosition = doc.autoTable.previous.finalY + 15;

//         if (inletChartRef.current) {
//           if (chartYPosition + 100 > doc.internal.pageSize.getHeight() - 10) {
//             doc.addPage();
//             chartYPosition = 15;
//           }
//           doc.setFontSize(14);
//           doc.text("Inlet Flow (KL) Over Time", 15, chartYPosition);
//           const inletCanvas = await html2canvas(inletChartRef.current, {
//             scale: 2,
//           });
//           const inletImgData = inletCanvas.toDataURL("image/png");
//           doc.addImage(inletImgData, "PNG", 15, chartYPosition + 10, 180, 90);
//           chartYPosition += 110;
//         }

//         if (outletChartRef.current) {
//           if (chartYPosition + 100 > doc.internal.pageSize.getHeight() - 10) {
//             doc.addPage();
//             chartYPosition = 15;
//           }
//           doc.setFontSize(14);
//           doc.text("Outlet Flow (KL) Over Time", 15, chartYPosition);
//           const outletCanvas = await html2canvas(outletChartRef.current, {
//             scale: 2,
//           });
//           const outletImgData = outletCanvas.toDataURL("image/png");
//           doc.addImage(outletImgData, "PNG", 15, chartYPosition + 10, 180, 90);
//         }
//       }

//       // 5. Save PDF
//       doc.save(
//         `${targetUser.siteName}_${monthNames[month]}_${year}_Flow_Report.pdf`
//       );
//       toast.success("PDF generated successfully!");
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       toast.error("Failed to generate PDF.");
//     }

//     setLoading(false);
//   };

//   // --- CSV Download Handler ---
//   const handleDownloadCSV = () => {
//     setLoading(true);

//     let csvContent =
//       "Date,Inlet-Initial,Inlet-Final,Inlet-Total,Inlet-Comment,Outlet-Initial,Outlet-Final,Outlet-Total,Outlet-Comment\n";

//     processedReadings.tableData.forEach((r) => {
//       const dateStr = formatDate(r.date, month, year);
//       const inletComment = `"${r.inletComment || ""}"`;
//       const outletComment = `"${r.outletComment || ""}"`;

//       csvContent += `${dateStr},${r.inletInitial || ""},${r.inletFinal || ""},${
//         r.inletTotal
//       },${inletComment},${r.outletInitial || ""},${r.outletFinal || ""},${
//         r.outletTotal
//       },${outletComment}\n`;
//     });

//     // Add Total Row
//     csvContent += `\nTOTAL,,${processedReadings.totalInlet},,,${processedReadings.totalOutlet},`;

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${targetUser.siteName}_${monthNames[month]}_${year}_Flow_Report.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);

//     setLoading(false);
//     toast.success("CSV downloaded successfully!");
//   };

//   const monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   // --- NEW: Chart Configuration ---
//   const chartLabels = processedReadings.tableData.map((r) =>
//     formatDate(r.date, month, year)
//   );

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "top",
//         labels: { font: { size: 12, weight: "bold" } },
//       },
//       title: {
//         display: true,
//         font: { size: 16, weight: "bold" },
//         color: "#236a80",
//       },
//     },
//     scales: {
//       x: { ticks: { autoSkip: true, maxTicksLimit: 15 } },
//       y: { beginAtZero: true, ticks: { callback: (value) => `${value} KL` } },
//     },
//   };

//   const inletFlowData = {
//     labels: chartLabels,
//     datasets: [
//       {
//         label: "Inlet Total (KL)",
//         data: processedReadings.tableData.map((r) => r.inletTotal),
//         borderColor: "#236a80",
//         backgroundColor: "rgba(52, 152, 219, 0.1)",
//         borderWidth: 3,
//         spanGaps: true,
//         tension: 0.3,
//       },
//     ],
//   };

//   const outletFlowData = {
//     labels: chartLabels,
//     datasets: [
//       {
//         label: "Outlet Total (KL)",
//         data: processedReadings.tableData.map((r) => r.outletTotal),
//         borderColor: "#e74c3c",
//         backgroundColor: "rgba(231, 76, 60, 0.1)",
//         borderWidth: 3,
//         spanGaps: true,
//         tension: 0.3,
//       },
//     ],
//   };

//   const headerStyle = {
//     background: "linear-gradient(135deg, #236a80 0%, #236a80 100%)",
//     color: "white",
//     padding: "1.5rem",
//     borderRadius: "12px",
//     marginBottom: "1.5rem",
//     boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//   };

//   const buttonStyle = {
//     padding: "12px 30px",
//     borderRadius: "8px",
//     border: "2px dotted #236a80",
//     backgroundColor: "#236a80",
//     color: "white",
//     fontWeight: "600",
//     fontSize: "1rem",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     marginRight: "10px",
//   };
//   const downloadPdfButtonStyle = {
//     // Renamed
//     ...buttonStyle,
//     backgroundColor: "#e74c3c", // Red for PDF
//     borderColor: "#e74c3c",
//   };

//   const downloadCsvButtonStyle = {
//     // New
//     ...buttonStyle,
//     backgroundColor: "#27ae60", // Green for CSV/Excel
//     borderColor: "#27ae60",
//   };

//   const cardStyle = {
//     border: "3px dotted #3498db",
//     borderRadius: "15px",
//     backgroundColor: "#ffffff",
//     boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
//     padding: "1.5rem",
//     marginBottom: "1.5rem",
//     marginTop: "2.8rem",
//   };

//   return (
//     <div>
//       <div>
//         <div>
//           <div>
//             <div>
//               <>
//                 {/* Header Card */}
//                 <div style={headerStyle}>
//                   <div className="d-flex flex-wrap justify-content-between align-items-center">
//                     <div>
//                       <h3 className="header-title">
//                         INLET & OUTLET FLOW READINGS
//                       </h3>
//                       <div className="header-subtitle">
//                         <strong>SITE:</strong> {targetUser.siteName || "N/A"}
//                         <strong className="ms-2">
//                           ({targetUser.userName || "No User Selected"})
//                         </strong>
//                         <span className="mx-3">|</span>
//                         <strong>MONTH:</strong> {monthNames[month]} {year}
//                       </div>
//                     </div>

//                     <div className="d-flex align-items-center mt-3 mt-md-0">
//                       <select
//                         className="form-select me-2 date-picker-style"
//                         value={month}
//                         onChange={(e) => setMonth(Number(e.target.value))}
//                       >
//                         {monthNames.map((name, index) => (
//                           <option key={index} value={index}>
//                             {name}
//                           </option>
//                         ))}
//                       </select>
//                       <input
//                         type="number"
//                         className="form-control date-picker-style"
//                         value={year}
//                         onChange={(e) => setYear(Number(e.target.value))}
//                         style={{ width: "110px" }}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Main Content */}
//                 <div style={cardStyle}>
//                   <div className="row">
//                     {/* Data Table */}
//                     <div className={isAdmin ? "col-lg-6" : "col-12"}>
//                       {" "}
//                       {/* SPLIT SCREEN FOR ADMIN */}
//                       <div className="table-container">
//                         <table className="table table-hover report-table">
//                           <thead>
//                             <tr>
//                               <th rowSpan="2" className="table-header-style">
//                                 DATE
//                               </th>
//                               <th colSpan="4" className="table-header-style">
//                                 INLET FLOW METER (KL)
//                               </th>
//                               <th colSpan="4" className="table-header-style">
//                                 OUTLET FLOW METER (KL)
//                               </th>
//                             </tr>
//                             <tr>
//                               <th className="table-subheader-style">INITIAL</th>
//                               <th className="table-subheader-style">FINAL</th>
//                               <th className="table-subheader-style">TOTAL</th>
//                               <th className="table-subheader-style">COMMENT</th>
//                               <th className="table-subheader-style">INITIAL</th>
//                               <th className="table-subheader-style">FINAL</th>
//                               <th className="table-subheader-style">TOTAL</th>
//                               <th className="table-subheader-style">COMMENT</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {processedReadings.tableData.map(
//                               (reading, index) => (
//                                 <tr key={index} className="table-row-style">
//                                   <td className="table-cell-style">
//                                     {formatDate(reading.date, month, year)}
//                                   </td>

//                                   {/* Inlet */}
//                                   <td className="table-cell-input-style">
//                                     <input
//                                       type="number"
//                                       className="form-control form-control-sm input-style"
//                                       value={reading.inletInitial}
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           index,
//                                           "inletInitial",
//                                           e.target.value
//                                         )
//                                       }
//                                       disabled={loading}
//                                     />
//                                   </td>
//                                   <td className="table-cell-input-style">
//                                     <input
//                                       type="number"
//                                       className="form-control form-control-sm input-style"
//                                       value={reading.inletFinal}
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           index,
//                                           "inletFinal",
//                                           e.target.value
//                                         )
//                                       }
//                                       disabled={loading}
//                                     />
//                                   </td>
//                                   <td className="table-cell-style">
//                                     <input
//                                       type="number"
//                                       value={reading.inletTotal}
//                                       className="read-only-style"
//                                       disabled
//                                     />
//                                   </td>
//                                   <td className="table-cell-input-style">
//                                     <input
//                                       type="text"
//                                       className="form-control form-control-sm comment-input-style"
//                                       value={reading.inletComment}
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           index,
//                                           "inletComment",
//                                           e.target.value
//                                         )
//                                       }
//                                       disabled={loading}
//                                     />
//                                   </td>

//                                   {/* Outlet */}
//                                   <td className="table-cell-input-style">
//                                     <input
//                                       type="number"
//                                       className="form-control form-control-sm input-style"
//                                       value={reading.outletInitial}
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           index,
//                                           "outletInitial",
//                                           e.target.value
//                                         )
//                                       }
//                                       disabled={loading}
//                                     />
//                                   </td>
//                                   <td className="table-cell-input-style">
//                                     <input
//                                       type="number"
//                                       className="form-control form-control-sm input-style"
//                                       value={reading.outletFinal}
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           index,
//                                           "outletFinal",
//                                           e.target.value
//                                         )
//                                       }
//                                       disabled={loading}
//                                     />
//                                   </td>
//                                   <td className="table-cell-style">
//                                     <input
//                                       type="number"
//                                       value={reading.outletTotal}
//                                       className="read-only-style"
//                                       disabled
//                                     />
//                                   </td>
//                                   <td className="table-cell-input-style">
//                                     <input
//                                       type="text"
//                                       className="form-control form-control-sm comment-input-style"
//                                       value={reading.outletComment}
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           index,
//                                           "outletComment",
//                                           e.target.value
//                                         )
//                                       }
//                                       disabled={loading}
//                                     />
//                                   </td>
//                                 </tr>
//                               )
//                             )}
//                           </tbody>
//                           {/* --- NEW: TABLE FOOTER FOR TOTALS --- */}
//                           <tfoot>
//                             <tr className="table-footer-style">
//                               <td>TOTAL (KL)</td>
//                               <td colSpan="2"></td> {/* Skip Initial, Final */}
//                               <td>{processedReadings.totalInlet}</td>
//                               <td></td> {/* Skip Comment */}
//                               <td colSpan="2"></td> {/* Skip Initial, Final */}
//                               <td>{processedReadings.totalOutlet}</td>
//                               <td></td> {/* Skip Comment */}
//                             </tr>
//                           </tfoot>
//                         </table>
//                       </div>
//                     </div>

//                     {/* --- NEW: GRAPHS (Admin Only) --- */}
//                     {isAdmin && (
//                       <div className="col-lg-6">
//                         <div className="graph-container-wrapper">
//                           {/* Inlet Chart Container */}
//                           <div
//                             ref={inletChartRef} // Add ref here
//                             className="graph-container"
//                           >
//                             <Line
//                               options={{
//                                 ...chartOptions,
//                                 plugins: {
//                                   ...chartOptions.plugins,
//                                   title: {
//                                     ...chartOptions.plugins.title,
//                                     text: "Inlet Total (KL) Over Time",
//                                   },
//                                 },
//                               }}
//                               data={inletFlowData}
//                             />
//                           </div>
//                           {/* Outlet Chart Container */}
//                           <div
//                             ref={outletChartRef} // Add ref here
//                             className="graph-container"
//                             style={{ border: "2px dotted #e74c3c" }} // Red border for outlet
//                           >
//                             <Line
//                               options={{
//                                 ...chartOptions,
//                                 plugins: {
//                                   ...chartOptions.plugins,
//                                   title: {
//                                     ...chartOptions.plugins.title,
//                                     text: "Outlet Total (KL) Over Time",
//                                   },
//                                 },
//                               }}
//                               data={outletFlowData}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Action Buttons */}
//                   {(isOperator || isAdmin) && (
//                     <div className="text-center mt-4">
//                       <button
//                         style={buttonStyle}
//                         onClick={handleSave}
//                         disabled={loading || !targetUser.userId}
//                       >
//                         {loading ? "Saving..." : "💾 Save Report"}
//                       </button>

//                       {isAdmin && (
//                         <>
//                           <button
//                             style={downloadCsvButtonStyle}
//                             onClick={handleDownloadPDF}
//                             disabled={loading || !targetUser.userId}
//                           >
//                             {loading ? "..." : "📥 Download PDF"}
//                           </button>

//                           <button
//                             style={downloadCsvButtonStyle}
//                             onClick={handleDownloadCSV}
//                             disabled={loading || !targetUser.userId}
//                           >
//                             {loading ? "..." : "📊 Download CSV"}
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </>

//               {/* End of conditional rendering */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InletAndOutlet;

// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// import DashboardSam from "../Dashboard/DashboardSam";
// import Header from "../Header/Hedaer";
// import { toast } from "react-toastify";
// import "./InletAndOutlet.css";
// import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
// import axios from "axios";
// import { API_URL } from "../../utils/apiConfig";

// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import "sweetalert2/dist/sweetalert2.min.css";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import html2canvas from "html2canvas";
// import genexlogo from "../../assests/images/logonewgenex.png";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const MySwal = withReactContent(Swal);

// const getDaysInMonth = (year, month) => {
//   const date = new Date(year, month, 1);
//   const days = [];
//   while (date.getMonth() === month) {
//     days.push(String(date.getDate()).padStart(2, "0"));
//     date.setDate(date.getDate() + 1);
//   }
//   return days;
// };

// const formatDate = (day, month, year) => {
//   const d = String(day).padStart(2, "0");
//   const m = String(month + 1).padStart(2, "0");
//   const y = String(year).slice(-2);
//   return `${d}/${m}/${y}`;
// };

// const InletAndOutlet = ({ embedMode = false }) => {
//   const dispatch = useDispatch();
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [readings, setReadings] = useState([]);
//   const [currentDate] = useState(new Date());
//   const [year, setYear] = useState(currentDate.getFullYear());
//   const [month, setMonth] = useState(currentDate.getMonth());

//   // graphs
//   const inletChartRef = useRef(null);
//   const outletChartRef = useRef(null);

//   // redux
//   const { userData } = useSelector((state) => state.user);
//   const selectedUserId = useSelector((state) => state.selectedUser.userId);
//   const { users: allUsers } = useSelector((state) => state.userLog);

//   // roles
//   const currentUser = userData?.validUserOne;
//   const isOperator = currentUser?.userType === "operator";
//   const isAdmin =
//     ["admin", "super_admin"].includes(currentUser?.userType) ||
//     currentUser?.adminType === "EBHOOM";

//   // fetch users for selector
//   useEffect(() => {
//     if (isAdmin || isOperator) dispatch(fetchUsers());
//   }, [dispatch, isAdmin, isOperator]);

//   // targetUser (matches MonthlyPh logic)
//   const targetUser = useMemo(() => {
//     if ((isAdmin || isOperator) && selectedUserId) {
//       const foundUser = allUsers.find((u) => u.userName === selectedUserId);
//       if (foundUser) {
//         return {
//           userName: foundUser.userName,
//           siteName: foundUser.companyName || "Selected Site",
//           userId: foundUser._id,
//         };
//       }
//       return { userName: selectedUserId, siteName: "Loading Site...", userId: null };
//     }
//     return { userName: null, siteName: "N/A", userId: null };
//   }, [isOperator, isAdmin, selectedUserId, allUsers]);

//   // init table
//   useEffect(() => {
//     const days = getDaysInMonth(year, month);
//     const initial = days.map((day) => ({
//       date: day,
//       inletInitial: "",
//       inletFinal: "",
//       inletComment: "",
//       outletInitial: "",
//       outletFinal: "",
//       outletComment: "",
//     }));
//     setReadings(initial);
//     setReport(null);
//   }, [year, month, targetUser.userName]);

//   // fetch existing report
//   useEffect(() => {
//     if (!targetUser.userName) return;
//     const run = async () => {
//       setLoading(true);
//       try {
//         const url = `${API_URL}/api/flow-report/${targetUser.userName}/${year}/${month}`;
//         const { data } = await axios.get(url);
//         setReport(data);
//       } catch (err) {
//         if (err.response?.status === 404) setReport(null);
//         else {
//           console.error(err);
//           toast.error("Failed to fetch report");
//         }
//       }
//       setLoading(false);
//     };
//     run();
//   }, [targetUser.userName, year, month]);

//   // populate from report + auto-carry
//   useEffect(() => {
//     const days = getDaysInMonth(year, month);
//     let initial = days.map((day) => ({
//       date: day,
//       inletInitial: "",
//       inletFinal: "",
//       inletComment: "",
//       outletInitial: "",
//       outletFinal: "",
//       outletComment: "",
//     }));

//     if (report?.readings) {
//       initial = initial.map((d) => {
//         const found = report.readings.find((r) => r.date === d.date);
//         return found ? { ...d, ...found } : d;
//       });
//     }

//     for (let i = 1; i < initial.length; i++) {
//       if (initial[i].inletInitial === "" && initial[i - 1].inletFinal)
//         initial[i].inletInitial = initial[i - 1].inletFinal;
//       if (initial[i].outletInitial === "" && initial[i - 1].outletFinal)
//         initial[i].outletInitial = initial[i - 1].outletFinal;
//     }
//     if (initial[0] && initial[0].inletInitial === "" && report?.previousInletFinal)
//       initial[0].inletInitial = report.previousInletFinal;
//     if (initial[0] && initial[0].outletInitial === "" && report?.previousOutletFinal)
//       initial[0].outletInitial = report.previousOutletFinal;

//     setReadings(initial);
//   }, [report, year, month]);

//   // totals + data for charts
//   const processedReadings = useMemo(() => {
//     let totalInlet = 0;
//     let totalOutlet = 0;

//     const tableData = readings.map((r) => {
//       const inletInitial = r.inletInitial || 0;
//       const outletInitial = r.outletInitial || 0;
//       const inletFinal = r.inletFinal || 0;
//       const outletFinal = r.outletFinal || 0;

//       const inletTotal =
//         inletFinal && inletInitial
//           ? parseFloat(inletFinal) - parseFloat(inletInitial)
//           : 0;
//       const outletTotal =
//         outletFinal && outletInitial
//           ? parseFloat(outletFinal) - parseFloat(outletInitial)
//           : 0;

//       totalInlet += inletTotal;
//       totalOutlet += outletTotal;

//       return {
//         ...r,
//         inletInitial,
//         outletInitial,
//         inletTotal: Number(inletTotal.toFixed(2)),
//         outletTotal: Number(outletTotal.toFixed(2)),
//       };
//     });

//     return {
//       tableData,
//       totalInlet: Number(totalInlet.toFixed(2)),
//       totalOutlet: Number(totalOutlet.toFixed(2)),
//     };
//   }, [readings]);

//   // handlers
//   const handleInputChange = (index, field, value) => {
//     const newReadings = [...readings];
//     newReadings[index] = { ...newReadings[index], [field]: value };

//     // carry forward finals to next day's initial
//     if (field === "inletFinal" && index + 1 < newReadings.length)
//       newReadings[index + 1].inletInitial = value;
//     if (field === "outletFinal" && index + 1 < newReadings.length)
//       newReadings[index + 1].outletInitial = value;

//     setReadings(newReadings);
//   };

//   const handleSave = async () => {
//     if (!targetUser.userId || !targetUser.userName) {
//       toast.error("Cannot save. User data is incomplete.");
//       return;
//     }

//     const validReadings = readings
//       .map((r) => ({
//         date: r.date,
//         inletInitial: r.inletInitial === "" ? null : Number(r.inletInitial),
//         inletFinal: r.inletFinal === "" ? null : Number(r.inletFinal),
//         inletComment: r.inletComment === "" ? null : r.inletComment,
//         outletInitial: r.outletInitial === "" ? null : Number(r.outletInitial),
//         outletFinal: r.outletFinal === "" ? null : Number(r.outletFinal),
//         outletComment: r.outletComment === "" ? null : r.outletComment,
//       }))
//       .filter(
//         (r) =>
//           r.inletInitial !== null ||
//           r.inletFinal !== null ||
//           r.inletComment !== null ||
//           r.outletInitial !== null ||
//           r.outletFinal !== null ||
//           r.outletComment !== null
//       );

//     const payload = {
//       userId: targetUser.userId,
//       userName: targetUser.userName,
//       siteName: targetUser.siteName,
//       year,
//       month,
//       readings: validReadings,
//     };

//     setLoading(true);
//     try {
//       const { data } = await axios.post(`${API_URL}/api/flow-report`, payload);
//       setReport(data);
//       MySwal.fire({
//         title: "Report Saved!",
//         html: `<p>Report saved for <b>${data.userName}</b></p><p>Site: ${data.siteName}</p>`,
//         icon: "success",
//         timer: 2000,
//         showConfirmButton: false,
//       });
//     } catch (error) {
//       console.error(error);
//       toast.error(error.response?.data?.message || "Failed to save report");
//     }
//     setLoading(false);
//   };

//   const handleDownloadPDF = async () => {
//     setLoading(true);
//     toast.info("Generating PDF...");

//     try {
//       const doc = new jsPDF();
//       const logoImg = new Image();
//       logoImg.src = genexlogo;

//       await new Promise((resolve) => {
//         logoImg.onload = resolve;
//         logoImg.onerror = resolve;
//       });

//       // header
//       doc.setFillColor("#236a80");
//       doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, "F");
//       doc.addImage(logoImg, "PNG", 10, 5, 25, 25);
//       doc.setFont("helvetica", "bold");
//       doc.setTextColor("#FFFFFF");
//       doc.setFontSize(14);
//       doc.text("Genex Utility Management Pvt Ltd", 110, 12, { align: "center" });
//       doc.setFont("helvetica", "normal");
//       doc.setFontSize(8);
//       doc.text(
//         "Sujatha Arcade, Second Floor, #32 Lake View Defence Colony, Shettihalli, Post, Jalahalli West, Bengaluru, Karnataka 560015",
//         110,
//         20,
//         { align: "center" }
//       );
//       doc.text("Phone: +91-9663044156", 110, 25, { align: "center" });

//       // title
//       const monthNames = [
//         "January","February","March","April","May","June",
//         "July","August","September","October","November","December",
//       ];
//       doc.setTextColor("#000000");
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text(`Site: ${targetUser.siteName} (${targetUser.userName})`, 15, 45);
//       doc.text(`Month: ${monthNames[month]} ${year}`, 15, 52);

//       // table
//       const tableHead = [[
//         "Date",
//         "Inlet-Initial","Inlet-Final","Inlet-Total","Inlet-Comment",
//         "Outlet-Initial","Outlet-Final","Outlet-Total","Outlet-Comment",
//       ]];

//       const tableBody = processedReadings.tableData.map((r) => [
//         formatDate(r.date, month, year),
//         r.inletInitial || "N/A",
//         r.inletFinal || "N/A",
//         r.inletTotal,
//         r.inletComment || "N/A",
//         r.outletInitial || "N/A",
//         r.outletFinal || "N/A",
//         r.outletTotal,
//         r.outletComment || "N/A",
//       ]);

//       tableBody.push([
//         { content: "TOTALS", styles: { fontStyle: "bold", halign: "right" } },
//         "", "",
//         { content: processedReadings.totalInlet, styles: { fontStyle: "bold" } },
//         "",
//         "", "",
//         { content: processedReadings.totalOutlet, styles: { fontStyle: "bold" } },
//         "",
//       ]);

//       doc.autoTable({
//         startY: 60,
//         head: tableHead,
//         body: tableBody,
//         theme: "grid",
//         headStyles: { fillColor: "#236a80" },
//         styles: { fontSize: 7 },
//       });

//       // charts for admin
//       if (isAdmin) {
//         let y = doc.autoTable.previous.finalY + 15;

//         if (inletChartRef.current) {
//           if (y + 100 > doc.internal.pageSize.getHeight() - 10) {
//             doc.addPage();
//             y = 15;
//           }
//           doc.setFontSize(14);
//           doc.text("Inlet Flow (KL) Over Time", 15, y);
//           const inletCanvas = await html2canvas(inletChartRef.current, { scale: 2 });
//           const inletImg = inletCanvas.toDataURL("image/png");
//           doc.addImage(inletImg, "PNG", 15, y + 10, 180, 90);
//           y += 110;
//         }

//         if (outletChartRef.current) {
//           if (y + 100 > doc.internal.pageSize.getHeight() - 10) {
//             doc.addPage();
//             y = 15;
//           }
//           doc.setFontSize(14);
//           doc.text("Outlet Flow (KL) Over Time", 15, y);
//           const outletCanvas = await html2canvas(outletChartRef.current, { scale: 2 });
//           const outletImg = outletCanvas.toDataURL("image/png");
//           doc.addImage(outletImg, "PNG", 15, y + 10, 180, 90);
//         }
//       }

//       doc.save(`${targetUser.siteName}_${monthNames[month]}_${year}_Flow_Report.pdf`);
//       toast.success("PDF generated successfully!");
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to generate PDF.");
//     }
//     setLoading(false);
//   };

//   const handleDownloadCSV = () => {
//     setLoading(true);
//     let csv = "Date,Inlet-Initial,Inlet-Final,Inlet-Total,Inlet-Comment,Outlet-Initial,Outlet-Final,Outlet-Total,Outlet-Comment\n";
//     processedReadings.tableData.forEach((r) => {
//       const dateStr = formatDate(r.date, month, year);
//       const inletComment = `"${r.inletComment || ""}"`;
//       const outletComment = `"${r.outletComment || ""}"`;
//       csv += `${dateStr},${r.inletInitial || ""},${r.inletFinal || ""},${r.inletTotal},${inletComment},${r.outletInitial || ""},${r.outletFinal || ""},${r.outletTotal},${outletComment}\n`;
//     });
//     csv += `\nTOTAL,,,,, , , ,\n,, ,${processedReadings.totalInlet},,, ,${processedReadings.totalOutlet},\n`;

//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${targetUser.siteName}_${month + 1}-${year}_Flow_Report.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//     setLoading(false);
//     toast.success("CSV downloaded successfully!");
//   };

//   // shared styles (match MonthlyPh)
//   const monthNames = [
//     "January","February","March","April","May","June",
//     "July","August","September","October","November","December",
//   ];

//   const headerStyle = {
//     background: "linear-gradient(135deg, #236a80 0%, #236a80 100%)",
//     color: "white",
//     padding: "1.5rem",
//     borderRadius: "12px",
//     marginBottom: "1.5rem",
//     boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//   };

//   const cardStyle = {
//     border: "3px dotted #3498db",
//     borderRadius: "15px",
//     backgroundColor: "#ffffff",
//     boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
//     padding: "1.5rem",
//     marginBottom: "1.5rem",
//     marginTop: "2.8rem",
//   };

//   const buttonStyle = {
//     padding: "12px 30px",
//     borderRadius: "8px",
//     border: "2px dotted #236a80",
//     backgroundColor: "#236a80",
//     color: "white",
//     fontWeight: "600",
//     fontSize: "1rem",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     marginRight: "10px",
//   };

//   const downloadPdfButtonStyle = {
//     ...buttonStyle,
//     backgroundColor: "#e74c3c",
//     borderColor: "#e74c3c",
//   };

//   const downloadCsvButtonStyle = {
//     ...buttonStyle,
//     backgroundColor: "#27ae60",
//     borderColor: "#27ae60",
//   };

//   // chart config
//   const chartLabels = processedReadings.tableData.map((r) =>
//     formatDate(r.date, month, year)
//   );
//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { position: "top", labels: { font: { size: 12, weight: "bold" } } },
//       title: { display: true, font: { size: 16, weight: "bold" }, color: "#236a80" },
//     },
//     scales: {
//       x: { ticks: { autoSkip: true, maxTicksLimit: 15 } },
//       y: { beginAtZero: true, ticks: { callback: (v) => `${v} KL` } },
//     },
//   };
//   const inletFlowData = {
//     labels: chartLabels,
//     datasets: [
//       {
//         label: "Inlet Total (KL)",
//         data: processedReadings.tableData.map((r) => r.inletTotal),
//         borderColor: "#236a80",
//         backgroundColor: "rgba(52, 152, 219, 0.1)",
//         borderWidth: 3,
//         spanGaps: true,
//         tension: 0.3,
//       },
//     ],
//   };
//   const outletFlowData = {
//     labels: chartLabels,
//     datasets: [
//       {
//         label: "Outlet Total (KL)",
//         data: processedReadings.tableData.map((r) => r.outletTotal),
//         borderColor: "#e74c3c",
//         backgroundColor: "rgba(231, 76, 60, 0.1)",
//         borderWidth: 3,
//         spanGaps: true,
//         tension: 0.3,
//       },
//     ],
//   };

//   const promptStyle = {
//   display: "flex",
//   flexDirection: "column",
//   alignItems: "center",
//   justifyContent: "center",
//   minHeight: "300px",
//   textAlign: "center",
//   color: "#236a80",
//   backgroundColor: "#f8f9fa",
//   borderRadius: "10px",
//   border: "3px dotted #236a80",
// };

//   return (
//     <>
//       <div >
//         {/* Left sidebar like MonthlyPh (only when not operator and not embedded) */}
//         {!isOperator && !embedMode && (
//           <div className="col-lg-3 d-none d-lg-block">
//             <DashboardSam />
//           </div>
//         )}

//         {/* Main: 9 cols when sidebar visible, else full width */}
//           {/* Top header like MonthlyPh (only when not operator and not embedded) */}
//           {!isOperator && !embedMode && <Header />}

//             <div >
//               {/* Header Card */}
//               <div style={headerStyle}>
//                 <div className="d-flex flex-wrap justify-content-between align-items-center">
//                   <div>
//                     <h3 className="mb-2" style={{ fontWeight: "bold", fontSize: "1.8rem" }}>
//                       INLET &amp; OUTLET FLOW READINGS
//                     </h3>
//                     <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
//                       <strong>SITE:</strong> {targetUser.siteName || "N/A"}
//                       <strong className="ms-2">
//                         ({targetUser.userName || "No User Selected"})
//                       </strong>
//                       <span className="mx-3">|</span>
//                       <strong>MONTH:</strong> {monthNames[month]} {year}
//                     </div>
//                   </div>

//                   <div className="d-flex align-items-center mt-3 mt-md-0">
//                     <select
//                       className="form-select me-2 date-picker-style"
//                       value={month}
//                       onChange={(e) => setMonth(Number(e.target.value))}
//                     >
//                       {monthNames.map((name, index) => (
//                         <option key={index} value={index}>
//                           {name}
//                         </option>
//                       ))}
//                     </select>
//                     <input
//                       type="number"
//                       className="form-control date-picker-style"
//                       value={year}
//                       onChange={(e) => setYear(Number(e.target.value))}
//                       style={{ width: "110px" }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Main Card */}
//               <div style={cardStyle}>
//                 <div className="row">
//                   {/* Table (col-6 for admin, full for others) */}
//                   <div className={isAdmin ? "col-lg-6" : "col-12"}>
//                     <div className="table-container">
//                       <table className="table table-hover report-table">
//                         <thead>
//                           <tr>
//                             <th rowSpan="2" className="table-header-style">DATE</th>
//                             <th colSpan="4" className="table-header-style">INLET FLOW METER (KL)</th>
//                             <th colSpan="4" className="table-header-style">OUTLET FLOW METER (KL)</th>
//                           </tr>
//                           <tr>
//                             <th className="table-subheader-style">INITIAL</th>
//                             <th className="table-subheader-style">FINAL</th>
//                             <th className="table-subheader-style">TOTAL</th>
//                             <th className="table-subheader-style">COMMENT</th>
//                             <th className="table-subheader-style">INITIAL</th>
//                             <th className="table-subheader-style">FINAL</th>
//                             <th className="table-subheader-style">TOTAL</th>
//                             <th className="table-subheader-style">COMMENT</th>
//                           </tr>
//                         </thead>

//                         <tbody>
//                           {processedReadings.tableData.map((reading, index) => (
//                             <tr key={index} className="table-row-style">
//                               <td className="table-cell-style">
//                                 {formatDate(reading.date, month, year)}
//                               </td>

//                               {/* Inlet */}
//                               <td className="table-cell-input-style">
//                                 <input
//                                   type="number"
//                                   className="form-control form-control-sm input-style"
//                                   value={reading.inletInitial}
//                                   onChange={(e) =>
//                                     handleInputChange(index, "inletInitial", e.target.value)
//                                   }
//                                   disabled={loading}
//                                 />
//                               </td>
//                               <td className="table-cell-input-style">
//                                 <input
//                                   type="number"
//                                   className="form-control form-control-sm input-style"
//                                   value={reading.inletFinal}
//                                   onChange={(e) =>
//                                     handleInputChange(index, "inletFinal", e.target.value)
//                                   }
//                                   disabled={loading}
//                                 />
//                               </td>
//                               <td className="table-cell-style">
//                                 <input
//                                   type="number"
//                                   value={reading.inletTotal}
//                                   className="read-only-style"
//                                   disabled
//                                 />
//                               </td>
//                               <td className="table-cell-input-style">
//                                 <input
//                                   type="text"
//                                   className="form-control form-control-sm comment-input-style"
//                                   value={reading.inletComment}
//                                   onChange={(e) =>
//                                     handleInputChange(index, "inletComment", e.target.value)
//                                   }
//                                   disabled={loading}
//                                 />
//                               </td>

//                               {/* Outlet */}
//                               <td className="table-cell-input-style">
//                                 <input
//                                   type="number"
//                                   className="form-control form-control-sm input-style"
//                                   value={reading.outletInitial}
//                                   onChange={(e) =>
//                                     handleInputChange(index, "outletInitial", e.target.value)
//                                   }
//                                   disabled={loading}
//                                 />
//                               </td>
//                               <td className="table-cell-input-style">
//                                 <input
//                                   type="number"
//                                   className="form-control form-control-sm input-style"
//                                   value={reading.outletFinal}
//                                   onChange={(e) =>
//                                     handleInputChange(index, "outletFinal", e.target.value)
//                                   }
//                                   disabled={loading}
//                                 />
//                               </td>
//                               <td className="table-cell-style">
//                                 <input
//                                   type="number"
//                                   value={reading.outletTotal}
//                                   className="read-only-style"
//                                   disabled
//                                 />
//                               </td>
//                               <td className="table-cell-input-style">
//                                 <input
//                                   type="text"
//                                   className="form-control form-control-sm comment-input-style"
//                                   value={reading.outletComment}
//                                   onChange={(e) =>
//                                     handleInputChange(index, "outletComment", e.target.value)
//                                   }
//                                   disabled={loading}
//                                 />
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>

//                         <tfoot>
//                           <tr className="table-footer-style">
//                             <td>TOTAL (KL)</td>
//                             <td colSpan="2"></td>
//                             <td>{processedReadings.totalInlet}</td>
//                             <td></td>
//                             <td colSpan="2"></td>
//                             <td>{processedReadings.totalOutlet}</td>
//                             <td></td>
//                           </tr>
//                         </tfoot>
//                       </table>
//                     </div>
//                   </div>

//                   {/* Graphs (admin only) */}
//                   {isAdmin && (
//                     <div className="col-lg-6">
//                       <div className="graph-container-wrapper">
//                         <div ref={inletChartRef} className="graph-container">
//                           <Line
//                             options={{
//                               ...chartOptions,
//                               plugins: {
//                                 ...chartOptions.plugins,
//                                 title: { ...chartOptions.plugins.title, text: "Inlet Total (KL) Over Time" },
//                               },
//                             }}
//                             data={inletFlowData}
//                           />
//                         </div>

//                         <div
//                           ref={outletChartRef}
//                           className="graph-container"
//                           style={{ border: "2px dotted #e74c3c" }}
//                         >
//                           <Line
//                             options={{
//                               ...chartOptions,
//                               plugins: {
//                                 ...chartOptions.plugins,
//                                 title: { ...chartOptions.plugins.title, text: "Outlet Total (KL) Over Time" },
//                               },
//                             }}
//                             data={outletFlowData}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Actions */}
//                 {(isOperator || isAdmin) && (
//                   <div className="text-center mt-4">
//                     <button
//                       style={buttonStyle}
//                       onClick={handleSave}
//                       disabled={loading || !targetUser.userId}
//                       onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
//                       onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
//                     >
//                       {loading ? "Saving..." : "💾 Save Report"}
//                     </button>

//                     {isAdmin && (
//                       <>
//                         <button
//                           style={downloadPdfButtonStyle}
//                           onClick={handleDownloadPDF}
//                           disabled={loading || !targetUser.userId}
//                           onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
//                           onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
//                         >
//                           {loading ? "..." : "📥 Download PDF"}
//                         </button>

//                         <button
//                           style={downloadCsvButtonStyle}
//                           onClick={handleDownloadCSV}
//                           disabled={loading || !targetUser.userId}
//                           onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
//                           onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
//                         >
//                           {loading ? "..." : "📊 Download CSV"}
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//     </>
//   );
// };

// export default InletAndOutlet;

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import { toast } from "react-toastify";
import "./InletAndOutlet.css";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import genexlogo from "../../assests/images/logonewgenex.png";

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

const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(String(date.getDate()).padStart(2, "0"));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const formatDate = (day, month, year) => {
  const d = String(day).padStart(2, "0");
  const m = String(month + 1).padStart(2, "0");
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

  const inletChartRef = useRef(null);
  const outletChartRef = useRef(null);

  const { userData } = useSelector((state) => state.user);
  const selectedUserId = useSelector((state) => state.selectedUser.userId);
  const { users: allUsers } = useSelector((state) => state.userLog);

  const currentUser = userData?.validUserOne;
  const isOperator = currentUser?.userType === "operator";
  const isAdmin =
    ["admin", "super_admin"].includes(currentUser?.userType) ||
    currentUser?.adminType === "EBHOOM";

  useEffect(() => {
    if (isAdmin || isOperator) dispatch(fetchUsers());
  }, [dispatch, isAdmin, isOperator]);

  const targetUser = useMemo(() => {
    if ((isAdmin || isOperator) && selectedUserId) {
      const foundUser = allUsers.find((u) => u.userName === selectedUserId);
      if (foundUser) {
        return {
          userName: foundUser.userName,
          siteName: foundUser.companyName || "Selected Site",
          userId: foundUser._id,
        };
      }
      return {
        userName: selectedUserId,
        siteName: "Loading Site...",
        userId: null,
      };
    }
    return { userName: null, siteName: "N/A", userId: null };
  }, [isOperator, isAdmin, selectedUserId, allUsers]);

  // initialize readings
  useEffect(() => {
    const days = getDaysInMonth(year, month);
    const initial = days.map((day) => ({
      date: day,
      inletInitial: "",
      inletFinal: "",
      inletComment: "",
      outletInitial: "",
      outletFinal: "",
      outletComment: "",
    }));
    setReadings(initial);
    setReport(null);
  }, [year, month, targetUser.userName]);

  // fetch report
  useEffect(() => {
    if (!targetUser.userName) return;
    const run = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/api/flow-report/${targetUser.userName}/${year}/${month}`
        );
        setReport(data);
      } catch (err) {
        if (err.response?.status === 404) setReport(null);
        else toast.error("Failed to fetch report");
      }
      setLoading(false);
    };
    run();
  }, [targetUser.userName, year, month]);

  // populate readings from report
  useEffect(() => {
    const days = getDaysInMonth(year, month);
    let initial = days.map((day) => ({
      date: day,
      inletInitial: "",
      inletFinal: "",
      inletComment: "",
      outletInitial: "",
      outletFinal: "",
      outletComment: "",
    }));

    if (report?.readings) {
      initial = initial.map((d) => {
        const found = report.readings.find((r) => r.date === d.date);
        return found ? { ...d, ...found } : d;
      });
    }
    setReadings(initial);
  }, [report, year, month]);

  const handleInputChange = (index, field, value) => {
    const newReadings = [...readings];
    newReadings[index][field] = value;
    setReadings(newReadings);
  };

  const processedReadings = useMemo(() => {
    let totalInlet = 0;
    let totalOutlet = 0;

    const tableData = readings.map((r) => {
      const inletTotal =
        r.inletFinal && r.inletInitial
          ? Number(r.inletFinal) - Number(r.inletInitial)
          : 0;
      const outletTotal =
        r.outletFinal && r.outletInitial
          ? Number(r.outletFinal) - Number(r.outletInitial)
          : 0;
      totalInlet += inletTotal;
      totalOutlet += outletTotal;
      return { ...r, inletTotal, outletTotal };
    });

    return {
      tableData,
      totalInlet: totalInlet.toFixed(2),
      totalOutlet: totalOutlet.toFixed(2),
    };
  }, [readings]);

  const handleSave = async () => {
    if (!targetUser.userId || !targetUser.userName) {
      toast.error("Cannot save. User data is incomplete.");
      return;
    }

    const validReadings = readings
      .map((r) => ({
        date: r.date,
        inletInitial: r.inletInitial === "" ? null : Number(r.inletInitial),
        inletFinal: r.inletFinal === "" ? null : Number(r.inletFinal),
        inletComment: r.inletComment || null,
        outletInitial: r.outletInitial === "" ? null : Number(r.outletInitial),
        outletFinal: r.outletFinal === "" ? null : Number(r.outletFinal),
        outletComment: r.outletComment || null,
      }))
      .filter(
        (r) =>
          r.inletInitial !== null ||
          r.inletFinal !== null ||
          r.inletComment ||
          r.outletInitial !== null ||
          r.outletFinal !== null ||
          r.outletComment
      );

    const payload = {
      userId: targetUser.userId,
      userName: targetUser.userName,
      siteName: targetUser.siteName,
      year,
      month,
      readings: validReadings,
    };

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/flow-report`, payload);
      setReport(data);
      MySwal.fire({
        title: "Report Saved!",
        html: `<p>Report saved for <b>${data.userName}</b></p><p>Site: ${data.siteName}</p>`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save report");
    }
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    toast.info("Generating PDF...");

    try {
      const doc = new jsPDF();
      const logoImg = new Image();
      logoImg.src = genexlogo;

      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });

      // header
      doc.setFillColor("#236a80");
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, "F");
      doc.addImage(logoImg, "PNG", 10, 5, 25, 25);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#FFFFFF");
      doc.setFontSize(14);
      doc.text("Genex Utility Management Pvt Ltd", 110, 12, {
        align: "center",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        "Sujatha Arcade, Second Floor, #32 Lake View Defence Colony, Shettihalli, Post, Jalahalli West, Bengaluru, Karnataka 560015",
        110,
        20,
        { align: "center" }
      );
      doc.text("Phone: +91-9663044156", 110, 25, { align: "center" });

      // title
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      doc.setTextColor("#000000");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Site: ${targetUser.siteName} (${targetUser.userName})`, 15, 45);
      doc.text(`Month: ${monthNames[month]} ${year}`, 15, 52);

      // table
      const tableHead = [
        [
          "Date",
          "Inlet-Initial",
          "Inlet-Final",
          "Inlet-Total",
          "Inlet-Comment",
          "Outlet-Initial",
          "Outlet-Final",
          "Outlet-Total",
          "Outlet-Comment",
        ],
      ];

      const tableBody = processedReadings.tableData.map((r) => [
        formatDate(r.date, month, year),
        r.inletInitial || "N/A",
        r.inletFinal || "N/A",
        r.inletTotal,
        r.inletComment || "N/A",
        r.outletInitial || "N/A",
        r.outletFinal || "N/A",
        r.outletTotal,
        r.outletComment || "N/A",
      ]);

      tableBody.push([
        { content: "TOTALS", styles: { fontStyle: "bold", halign: "right" } },
        "",
        "",
        {
          content: processedReadings.totalInlet,
          styles: { fontStyle: "bold" },
        },
        "",
        "",
        "",
        {
          content: processedReadings.totalOutlet,
          styles: { fontStyle: "bold" },
        },
        "",
      ]);

      doc.autoTable({
        startY: 60,
        head: tableHead,
        body: tableBody,
        theme: "grid",
        headStyles: { fillColor: "#236a80" },
        styles: { fontSize: 7 },
      });

      // charts for admin
      if (isAdmin) {
        let y = doc.autoTable.previous.finalY + 15;

        if (inletChartRef.current) {
          if (y + 100 > doc.internal.pageSize.getHeight() - 10) {
            doc.addPage();
            y = 15;
          }
          doc.setFontSize(14);
          doc.text("Inlet Flow (KL) Over Time", 15, y);
          const inletCanvas = await html2canvas(inletChartRef.current, {
            scale: 2,
          });
          const inletImg = inletCanvas.toDataURL("image/png");
          doc.addImage(inletImg, "PNG", 15, y + 10, 180, 90);
          y += 110;
        }

        if (outletChartRef.current) {
          if (y + 100 > doc.internal.pageSize.getHeight() - 10) {
            doc.addPage();
            y = 15;
          }
          doc.setFontSize(14);
          doc.text("Outlet Flow (KL) Over Time", 15, y);
          const outletCanvas = await html2canvas(outletChartRef.current, {
            scale: 2,
          });
          const outletImg = outletCanvas.toDataURL("image/png");
          doc.addImage(outletImg, "PNG", 15, y + 10, 180, 90);
        }
      }

      doc.save(
        `${targetUser.siteName}_${monthNames[month]}_${year}_Flow_Report.pdf`
      );
      toast.success("PDF generated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF.");
    }
    setLoading(false);
  };

  const handleDownloadCSV = () => {
    setLoading(true);
    let csv =
      "Date,Inlet-Initial,Inlet-Final,Inlet-Total,Inlet-Comment,Outlet-Initial,Outlet-Final,Outlet-Total,Outlet-Comment\n";
    processedReadings.tableData.forEach((r) => {
      const dateStr = formatDate(r.date, month, year);
      const inletComment = `"${r.inletComment || ""}"`;
      const outletComment = `"${r.outletComment || ""}"`;
      csv += `${dateStr},${r.inletInitial || ""},${r.inletFinal || ""},${
        r.inletTotal
      },${inletComment},${r.outletInitial || ""},${r.outletFinal || ""},${
        r.outletTotal
      },${outletComment}\n`;
    });
    csv += `\nTOTAL,,,,, , , ,\n,, ,${processedReadings.totalInlet},,, ,${processedReadings.totalOutlet},\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetUser.siteName}_${month + 1}-${year}_Flow_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setLoading(false);
    toast.success("CSV downloaded successfully!");
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const headerStyle = {
    background: "linear-gradient(135deg, #236a80 0%, #236a80 100%)",
    color: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        marginTop: "2rem",

  };

  const cardStyle = {
    border: "3px dotted #3498db",
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    marginTop: "2.8rem",
  };

  const promptStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    textAlign: "center",
    color: "#236a80",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    border: "3px dotted #236a80",
  };

  const buttonStyle = {
    padding: "12px 30px",
    borderRadius: "8px",
    border: "2px dotted #236a80",
    backgroundColor: "#236a80",
    color: "white",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginRight: "10px",
  };

  const downloadPdfButtonStyle = {
    // Renamed
    ...buttonStyle,
    backgroundColor: "#e74c3c", // Red for PDF
    borderColor: "#e74c3c",
  };

  const downloadCsvButtonStyle = {
    // New
    ...buttonStyle,
    backgroundColor: "#27ae60", // Green for CSV/Excel
    borderColor: "#27ae60",
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        font: { size: 16, weight: "bold" },
        color: "#236a80",
      },
    },
  };

  const inletFlowData = {
    labels: processedReadings.tableData.map((r) =>
      formatDate(r.date, month, year)
    ),
    datasets: [
      {
        label: "Inlet Total (KL)",
        data: processedReadings.tableData.map((r) => r.inletTotal),
        borderColor: "#236a80",
        borderWidth: 3,
        tension: 0.3,
      },
    ],
  };

  const outletFlowData = {
    labels: processedReadings.tableData.map((r) =>
      formatDate(r.date, month, year)
    ),
    datasets: [
      {
        label: "Outlet Total (KL)",
        data: processedReadings.tableData.map((r) => r.outletTotal),
        borderColor: "#e74c3c",
        borderWidth: 3,
        tension: 0.3,
      },
    ],
  };

  return (
    <>
      <div className="d-flex">
        {!isOperator && (
          <div>
            <DashboardSam />
          </div>
        )}
        <div
          style={{
            marginLeft: !isOperator ? "260px" : "0",
            width: "100%",
            minHeight: "100vh",
          }}
        >
          {!isOperator && (
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 5,
                marginLeft: "100px",
              }}
            >
              <Header />
            </div>
          )}

          {/**main content */}
          <div
            className="container-fluid py-4 "
            style={{
              width: "100%", // Fill the parent width
              maxWidth: "1200px", // Keeps consistent max layout width
              margin: "0 auto", // Centers content
              overflowX: "hidden",
            }}
          >
            <div className="row" style={{ marginTop: "0" }}>
              <div className="col-12">
                {!targetUser.userName ? (
                  <div style={cardStyle}>
                    <div style={promptStyle}>
                      <i
                        className="fas fa-hand-pointer"
                        style={{
                          fontSize: "3rem",
                          marginBottom: "1.5rem",
                          color: "#236a80",
                        }}
                      ></i>
                      <h3 style={{ fontWeight: "600", color: "#236a80" }}>
                        Please Select a User
                      </h3>
                      <p
                        style={{
                          fontSize: "1.1rem",
                          color: "#34495e",
                          maxWidth: "400px",
                        }}
                      >
                        Use the dropdown in the header to select a user to view
                        or add their monthly flow report.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={headerStyle}>
                      <div className="d-flex flex-wrap justify-content-between align-items-center">
                        <div>
                          <h3
                            className="mb-2"
                            style={{ fontWeight: "bold", fontSize: "1.8rem" }}
                          >
                            INLET & OUTLET FLOW READINGS
                          </h3>
                          <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
                            <strong>SITE:</strong> {targetUser.siteName}{" "}
                            <strong className="ms-2">
                              ({targetUser.userName})
                            </strong>
                            <span className="mx-3">|</span>
                            <strong>MONTH:</strong> {monthNames[month]} {year}
                          </div>
                        </div>
                        <div className="d-flex align-items-center mt-3 mt-md-0">
                          <select
                            className="form-select me-2"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            style={{ minWidth: "140px" }}
                          >
                            {monthNames.map((name, i) => (
                              <option key={i} value={i}>
                                {name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="form-control"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            style={{ width: "110px" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div className="row">
                        <div className={isAdmin ? "col-lg-6" : "col-12"}>
                          <div className="table-container">
                            <table className="table table-hover report-table">
                              <thead>
                                <tr>
                                  <th rowSpan="2">DATE</th>
                                  <th colSpan="4">INLET FLOW METER (KL)</th>
                                  <th colSpan="4">OUTLET FLOW METER (KL)</th>
                                </tr>
                                <tr>
                                  <th>INITIAL</th>
                                  <th>FINAL</th>
                                  <th>TOTAL</th>
                                  <th>COMMENT</th>
                                  <th>INITIAL</th>
                                  <th>FINAL</th>
                                  <th>TOTAL</th>
                                  <th>COMMENT</th>
                                </tr>
                              </thead>
                              <tbody>
                                {processedReadings.tableData.map((r, i) => (
                                  <tr key={i}>
                                    <td>{formatDate(r.date, month, year)}</td>
                                    <td>
                                      <input
                                        type="number"
                                        value={r.inletInitial}
                                        onChange={(e) =>
                                          handleInputChange(
                                            i,
                                            "inletInitial",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        value={r.inletFinal}
                                        onChange={(e) =>
                                          handleInputChange(
                                            i,
                                            "inletFinal",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        value={r.inletTotal}
                                        readOnly
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        value={r.inletComment}
                                        onChange={(e) =>
                                          handleInputChange(
                                            i,
                                            "inletComment",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        value={r.outletInitial}
                                        onChange={(e) =>
                                          handleInputChange(
                                            i,
                                            "outletInitial",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        value={r.outletFinal}
                                        onChange={(e) =>
                                          handleInputChange(
                                            i,
                                            "outletFinal",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        value={r.outletTotal}
                                        readOnly
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        value={r.outletComment}
                                        onChange={(e) =>
                                          handleInputChange(
                                            i,
                                            "outletComment",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td>TOTAL (KL)</td>
                                  <td colSpan="2"></td>
                                  <td>{processedReadings.totalInlet}</td>
                                  <td></td>
                                  <td colSpan="2"></td>
                                  <td>{processedReadings.totalOutlet}</td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="col-lg-6">
                            <div
                              ref={inletChartRef}
                              style={{ height: "220px", marginBottom: "30px" }}
                            >
                              <Line
                                options={{
                                  ...chartOptions,
                                  plugins: {
                                    ...chartOptions.plugins,
                                    title: {
                                      ...chartOptions.plugins.title,
                                      text: "Inlet Total (KL) Over Time",
                                    },
                                  },
                                }}
                                data={inletFlowData}
                              />
                            </div>
                            <div
                              ref={outletChartRef}
                              style={{ height: "220px" }}
                            >
                              <Line
                                options={{
                                  ...chartOptions,
                                  plugins: {
                                    ...chartOptions.plugins,
                                    title: {
                                      ...chartOptions.plugins.title,
                                      text: "Outlet Total (KL) Over Time",
                                    },
                                  },
                                }}
                                data={outletFlowData}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-center mt-4">
                        <button
                          className="btn btn-primary"
                          onClick={handleSave}
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "💾 Save Report"}
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              style={downloadPdfButtonStyle}
                              onClick={handleDownloadPDF}
                              disabled={loading || !targetUser.userId}
                              onMouseOver={(e) =>
                                (e.target.style.transform = "translateY(-2px)")
                              }
                              onMouseOut={(e) =>
                                (e.target.style.transform = "translateY(0)")
                              }
                            >
                              {loading ? "..." : "📥 Download PDF"}
                            </button>

                            <button
                              style={downloadCsvButtonStyle}
                              onClick={handleDownloadCSV}
                              disabled={loading || !targetUser.userId}
                              onMouseOver={(e) =>
                                (e.target.style.transform = "translateY(-2px)")
                              }
                              onMouseOut={(e) =>
                                (e.target.style.transform = "translateY(0)")
                              }
                            >
                              {loading ? "..." : "📊 Download CSV"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InletAndOutlet;
