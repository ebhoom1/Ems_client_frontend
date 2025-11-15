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
// import { toast } from "react-toastify"; // Keep for error toasts if needed
// import "./MonthlyReport.css"; // Make sure this CSS file exists
// import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
// import axios from "axios";
// import { API_URL } from "../../utils/apiConfig";
// import InletAndOutlet from "./InletAndOutlet";
// // --- PDF & Alert Imports ---
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import "sweetalert2/dist/sweetalert2.min.css";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import html2canvas from "html2canvas";
// import genexlogo from "../../assests/images/logonewgenex.png"; // Import the logo

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

// const MonthlyPh = () => {
//   const dispatch = useDispatch();
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [readings, setReadings] = useState([]);
//   const [currentDate] = useState(new Date());
//   const [year, setYear] = useState(currentDate.getFullYear());
//   const [month, setMonth] = useState(currentDate.getMonth());
//   const [photos, setPhotos] = useState([]);

//   // --- Refs for Graph ---
//   const mlssChartRef = useRef(null);
//   const phChartRef = useRef(null);

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

//   // Log whenever targetUser changes
//   useEffect(() => {
//     console.log("📊 Target User Updated:", targetUser);
//   }, [targetUser]);

//   // Initialize Table
//   useEffect(() => {
//     const days = getDaysInMonth(year, month);
//     const initialReadings = days.map((day) => ({
//       date: day,
//       mlss: "",
//       ph: "",
//       comment: "", // Add comment field
//     }));
//     setReadings(initialReadings);
//     setReport(null);
//   }, [year, month]);

//   // Data Fetching
//   useEffect(() => {
//     if (targetUser.userName) {
//       const fetchReport = async () => {
//         setLoading(true);
//         try {
//           const apiUrlToFetch = `${API_URL}/api/monthly-report/${targetUser.userName}/${year}/${month}`;
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
//     if (report && report.readings) {
//       const days = getDaysInMonth(year, month);
//       const newReadings = days.map((day) => {
//         const found = report.readings.find((r) => r.date === day);
//         return {
//           date: day,
//           mlss: found?.mlss || "",
//           ph: found?.ph || "",
//           comment: found?.comment || "", // Add comment
//         };
//       });
//       setReadings(newReadings);
//     } else {
//       const days = getDaysInMonth(year, month);
//       const initialReadings = days.map((day) => ({
//         date: day,
//         mlss: "",
//         ph: "",
//         comment: "", // Add comment
//       }));
//       setReadings(initialReadings);
//     }
//   }, [report, year, month]);

//   // Form Handlers
//   const handleInputChange = (index, field, value) => {
//     const newReadings = [...readings];
//     newReadings[index][field] = value;
//     setReadings(newReadings);
//   };

//   // CRITICAL: Data Saving Function
//   const handleSave = async () => {
//     console.log("=== 💾 SAVE BUTTON CLICKED ===");
//     console.log("Target User at save time:", targetUser);

//     // Validation
//     if (!targetUser.userId || !targetUser.userName) {
//       console.error("❌ SAVE BLOCKED: Missing user ID or Username");
//       toast.error(
//         "Cannot save. User data is incomplete. (Try re-selecting user)"
//       );

//       if ((isAdmin || isOperator) && selectedUserId && !targetUser.userId) {
//         const foundUser = allUsers.find((u) => u.userName === selectedUserId);
//         if (foundUser) {
//           toast.warn("User data was loading. Please try saving again.");
//         }
//       }
//       return;
//     }

//     // Update validReadings to include comment
//     const validReadings = readings
//       .map((r) => ({
//         date: r.date,
//         mlss: r.mlss === "" ? null : Number(r.mlss),
//         ph: r.ph === "" ? null : Number(r.ph),
//         comment: r.comment === "" ? null : r.comment, // Add comment
//       }))
//       .filter((r) => r.mlss !== null || r.ph !== null || r.comment !== null); // Save if any field has data

//     // Update payload to include comment
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
//       const { data } = await axios.post(
//         `${API_URL}/api/monthly-report`,
//         payload
//       );

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
//         customClass: {
//           popup: "my-sweet-alert-popup",
//         },
//       });
//     } catch (error) {
//       console.error("❌ SAVE ERROR:", error);
//       if (error.response) {
//         console.error("Server Response:", error.response.data);
//         toast.error(error.response.data.message || "Failed to save report");
//       } else {
//         toast.error("Failed to save report. Check console for details.");
//       }
//     }
//     setLoading(false);
//   };

//   // --- PDF Download Handler (Updated) ---
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
//       doc.addImage(logoImg, "PNG", 15, 5, 25, 25);
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

//       // 3. Add Table (Updated with Comment)
//       const tableHead = [
//         ["Date", "MLSS (mg/ltr)", "pH - TREATED WATER", "Comment"],
//       ];
//       const tableBody = readings.map((r) => [
//         formatDate(r.date, month, year),
//         r.mlss || "N/A",
//         r.ph || "N/A",
//         r.comment || "N/A", // Add comment to table
//       ]);

//       doc.autoTable({
//         startY: 60,
//         head: tableHead,
//         body: tableBody,
//         theme: "grid",
//         headStyles: { fillColor: "#236a80" },
//       });

//       // 4. Add Graphs (if admin)
//       if (isAdmin) {
//         let chartYPosition = doc.autoTable.previous.finalY + 15;

//         if (mlssChartRef.current) {
//           if (chartYPosition + 100 > doc.internal.pageSize.getHeight() - 10) {
//             doc.addPage();
//             chartYPosition = 15;
//           }
//           doc.setFontSize(14);
//           doc.text("MLSS Levels Over Time", 15, chartYPosition);
//           const mlssCanvas = await html2canvas(mlssChartRef.current, {
//             scale: 2,
//           });
//           const mlssImgData = mlssCanvas.toDataURL("image/png");
//           doc.addImage(mlssImgData, "PNG", 15, chartYPosition + 10, 180, 90);
//           chartYPosition += 110;
//         }

//         if (phChartRef.current) {
//           if (chartYPosition + 100 > doc.internal.pageSize.getHeight() - 10) {
//             doc.addPage();
//             chartYPosition = 15;
//           }
//           doc.setFontSize(14);
//           doc.text("pH Levels Over Time", 15, chartYPosition);
//           const phCanvas = await html2canvas(phChartRef.current, { scale: 2 });
//           const phImgData = phCanvas.toDataURL("image/png");
//           doc.addImage(phImgData, "PNG", 15, chartYPosition + 10, 180, 90);
//         }
//       }

//       // 5. Save PDF
//       doc.save(
//         `${targetUser.siteName}_${monthNames[month]}_${year}_Report.pdf`
//       );
//       toast.success("PDF generated successfully!");
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       toast.error("Failed to generate PDF.");
//     }

//     setLoading(false);
//   };

//   // --- NEW: CSV Download Handler ---
//   const handleDownloadCSV = () => {
//     setLoading(true);

//     // Add Comment to CSV header
//     let csvContent = "Date,MLSS (mg/ltr),pH - TREATED WATER,Comment\n";

//     readings.forEach((reading) => {
//       const dateStr = formatDate(reading.date, month, year);
//       // Escape commas in comment by wrapping in double quotes
//       const comment = `"${reading.comment || ""}"`;
//       csvContent += `${dateStr},${reading.mlss || ""},${
//         reading.ph || ""
//       },${comment}\n`;
//     });

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${targetUser.siteName}_${monthNames[month]}_${year}_Report.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);

//     setLoading(false);
//     toast.success("CSV downloaded successfully!");
//   };

//   const handleUploadPhotos = async () => {
//     if (!photos.length) {
//       return MySwal.fire({
//         title: "No Photos Selected",
//         text: "Please select at least one photo before uploading.",
//         icon: "warning",
//         confirmButtonColor: "#236a80",
//       });
//     }

//     // Show loading alert immediately
//     MySwal.fire({
//       title: "Uploading Photos...",
//       text: "Please wait while we upload your photos to the server.",
//       allowOutsideClick: false,
//       didOpen: () => {
//         Swal.showLoading();
//       },
//     });

//     const formData = new FormData();
//     photos.forEach((p) => p && formData.append("photos", p));

//     try {
//       const res = await axios.post(
//         `${API_URL}/api/monthly-report/upload/${targetUser.userId}/${year}/${month}`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       // Close the loading alert and show success
//       MySwal.fire({
//         title: "✅ Upload Successful!",
//         html: `
//         <p>Your photos have been uploaded successfully.</p>
//         ${
//           res.data?.photos?.length
//             ? `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:10px;">
//                 ${res.data.photos
//                   .map(
//                     (url) =>
//                       `<img src="${url}" alt="uploaded" style="width:100px;height:100px;object-fit:cover;border-radius:8px;border:2px solid #236a80;" />`
//                   )
//                   .join("")}
//               </div>`
//             : ""
//         }
//       `,
//         icon: "success",
//         confirmButtonColor: "#236a80",
//       });

//       console.log("S3 URLs:", res.data.photos);
//     } catch (err) {
//       console.error("Upload failed:", err);
//       MySwal.fire({
//         title: "Upload Failed!",
//         text: "Something went wrong while uploading. Please try again.",
//         icon: "error",
//         confirmButtonColor: "#d33",
//       });
//     }
//   };

//   // Chart Configuration
//   const labels = readings.map((r) => formatDate(r.date, month, year));

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "top",
//         labels: {
//           font: { size: 12, weight: "bold" },
//           color: "#2c3e50",
//         },
//       },
//       title: {
//         display: true,
//         font: { size: 16, weight: "bold" },
//         color: "#236a80",
//       },
//     },
//     scales: {
//       x: {
//         ticks: {
//           autoSkip: true,
//           maxTicksLimit: 15,
//           color: "#34495e",
//           font: { size: 11 },
//         },
//         grid: {
//           color: "rgba(52, 73, 94, 0.1)",
//         },
//       },
//       y: {
//         beginAtZero: true,
//         ticks: {
//           color: "#34495e",
//           font: { size: 11 },
//         },
//         grid: {
//           color: "rgba(52, 73, 94, 0.1)",
//         },
//       },
//     },
//   };

//   const mlssData = {
//     labels,
//     datasets: [
//       {
//         label: "MLSS (mg/ltr)",
//         data: readings.map((r) => r.mlss || null),
//         borderColor: "#236a80",
//         backgroundColor: "rgba(52, 152, 219, 0.1)",
//         borderWidth: 3,
//         pointRadius: 4,
//         pointHoverRadius: 6,
//         spanGaps: true,
//         tension: 0.3,
//       },
//     ],
//   };

//   const phData = {
//     labels,
//     datasets: [
//       {
//         label: "pH - TREATED WATER",
//         data: readings.map((r) => r.ph || null),
//         borderColor: "#e74c3c",
//         backgroundColor: "rgba(231, 76, 60, 0.1)",
//         borderWidth: 3,
//         pointRadius: 4,
//         pointHoverRadius: 6,
//         spanGaps: true,
//         tension: 0.3,
//       },
//     ],
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

//   // Styles
//   const headerStyle = {
//     background: "linear-gradient(135deg, #236a80 0%, #236a80 100%)",
//     color: "white",
//     padding: "1.5rem",
//     borderRadius: "12px",
//     marginBottom: "1.5rem",
//     boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//   };
//   const adminheaderstyle = {
//     marginTop: "4.5rem",
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

//   const inputStyle = {
//     border: "2px dotted #3498db",
//     borderRadius: "6px",
//     padding: "8px",
//     fontSize: "0.9rem",
//     color: "#2c3e50",
//     transition: "all 0.3s ease",
//   };

//   // --- NEW: Style for comment input ---
//   const commentInputStyle = {
//     ...inputStyle,
//     width: "100%", // Make comment input wider
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

//   // --- Style for the "Select User" prompt ---
//   const promptStyle = {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     minHeight: "400px",
//     textAlign: "center",
//     color: "#236a80",
//     backgroundColor: "#f8f9fa",
//     borderRadius: "10px",
//     border: "3px dotted #236a80",
//   };

//   return (
//     <>
//       <div className="row">
//         {/* Left sidebar only for non-operators */}
//         {!isOperator && (
//           <div className="col-lg-3 d-none d-lg-block">
//             <DashboardSam />
//           </div>
//         )}
//         {!isOperator && <Header />}
//         {/* Adjust the alignment/padding here if needed, but primarily use the original content of the col-lg-9 */}
//         {/* Main area: take 9 cols when sidebar is shown, else full width */}
//         <div className={!isOperator ? "col-lg-9 col-12" : "col-12"}>
//           {/* Top header only for non-operators */}

//           <div className="row" style={{ marginTop: "0", padding: "0 15px" }}>
//             <div className="col-12">
//               {/* Conditional Rendering */}
//               {!targetUser.userName ? (
//                 // --- A. SHOW PROMPT TO SELECT USER ---
//                 <div style={cardStyle}>
//                   <div style={promptStyle}>
//                     <i
//                       className="fas fa-hand-pointer"
//                       style={{
//                         fontSize: "3rem",
//                         marginBottom: "1.5rem",
//                         color: "#236a80",
//                       }}
//                     ></i>
//                     <h3 style={{ fontWeight: "600", color: "#236a80" }}>
//                       Please Select a User
//                     </h3>
//                     <p
//                       style={{
//                         fontSize: "1.1rem",
//                         color: "#34495e",
//                         maxWidth: "400px",
//                       }}
//                     >
//                       Use the dropdown in the header to select a user to view or
//                       add their monthly report.
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 // --- B. SHOW THE FULL REPORT INTERFACE ---
//                 <>
//                   {/* Header Card */}
//                   <div style={headerStyle}>
//                     <div className="d-flex flex-wrap justify-content-between align-items-center">
//                       <div>
//                         <h3
//                           className="mb-2"
//                           style={{ fontWeight: "bold", fontSize: "1.8rem" }}
//                         >
//                           MLSS & pH PARAMETER READINGS
//                         </h3>
//                         <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
//                           <strong>SITE:</strong> {targetUser.siteName || "N/A"}
//                           <strong className="ms-2">
//                             ({targetUser.userName || "No User Selected"})
//                           </strong>
//                           <span className="mx-3">|</span>
//                           <strong>MONTH:</strong> {monthNames[month]} {year}
//                         </div>
//                       </div>

//                       <div className="d-flex align-items-center mt-3 mt-md-0">
//                         <select
//                           className="form-select me-2"
//                           value={month}
//                           onChange={(e) => setMonth(Number(e.target.value))}
//                           style={{
//                             ...inputStyle,
//                             backgroundColor: "white",
//                             minWidth: "140px",
//                           }}
//                         >
//                           {monthNames.map((name, index) => (
//                             <option key={index} value={index}>
//                               {name}
//                             </option>
//                           ))}
//                         </select>
//                         <input
//                           type="number"
//                           className="form-control"
//                           value={year}
//                           onChange={(e) => setYear(Number(e.target.value))}
//                           style={{
//                             ...inputStyle,
//                             width: "110px",
//                             backgroundColor: "white",
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Main Content */}
//                   <div style={cardStyle}>
//                     <div className="row">
//                       {/* Data Table */}
//                       <div className={isAdmin ? "col-lg-6" : "col-12"}>
//                         {" "}
//                         {/* Changed to lg-6 */}
//                         <div
//                           style={{
//                             height: isAdmin ? "550px" : "600px",
//                             overflowY: "auto",
//                             border: "3px dotted #236a80",
//                             borderRadius: "10px",
//                             padding: "10px",
//                             backgroundColor: "#f8f9fa",
//                           }}
//                         >
//                           <table
//                             className="table table-hover"
//                             style={{ marginBottom: 0 }}
//                           >
//                             <thead
//                               style={{
//                                 position: "sticky",
//                                 top: 0,
//                                 zIndex: 10,
//                                 background:
//                                   "linear-gradient(135deg, #236a80 0%, #3498db 100%)",
//                                 color: "white",
//                               }}
//                             >
//                               <tr>
//                                 <th
//                                   style={{
//                                     padding: "15px 10px",
//                                     fontWeight: "bold",
//                                     fontSize: "0.95rem",
//                                     border:
//                                       "2px dotted rgba(255, 255, 255, 0.3)",
//                                   }}
//                                 >
//                                   DATE
//                                 </th>
//                                 <th
//                                   style={{
//                                     padding: "15px 10px",
//                                     fontWeight: "bold",
//                                     fontSize: "0.95rem",
//                                     border:
//                                       "2px dotted rgba(255, 255, 255, 0.3)",
//                                   }}
//                                 >
//                                   MLSS (mg/ltr)
//                                 </th>
//                                 <th
//                                   style={{
//                                     padding: "15px 10px",
//                                     fontWeight: "bold",
//                                     fontSize: "0.95rem",
//                                     border:
//                                       "2px dotted rgba(255, 255, 255, 0.3)",
//                                   }}
//                                 >
//                                   pH - TREATED WATER
//                                 </th>
//                                 {/* --- NEW COMMENT HEADER --- */}
//                                 <th
//                                   style={{
//                                     padding: "15px 10px",
//                                     fontWeight: "bold",
//                                     fontSize: "0.95rem",
//                                     border:
//                                       "2px dotted rgba(255, 255, 255, 0.3)",
//                                     minWidth: "150px", // Give more space
//                                   }}
//                                 >
//                                   COMMENT
//                                 </th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {readings.map((reading, index) => (
//                                 <tr
//                                   key={index}
//                                   style={{
//                                     backgroundColor:
//                                       index % 2 === 0 ? "#ffffff" : "#f8f9fa",
//                                   }}
//                                 >
//                                   <td
//                                     style={{
//                                       padding: "12px 10px",
//                                       fontWeight: "600",
//                                       color: "#2c3e50",
//                                       fontSize: "0.9rem",
//                                     }}
//                                   >
//                                     {formatDate(reading.date, month, year)}
//                                   </td>
//                                   <td style={{ padding: "8px 10px" }}>
//                                     <input
//                                       type="number"
//                                       className="form-control form-control-sm"
//                                       value={reading.mlss}
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           index,
//                                           "mlss",
//                                           e.target.value
//                                         )
//                                       }
//                                       disabled={
//                                         (!isOperator && !isAdmin) || loading
//                                       }
//                                       style={inputStyle}
//                                     />
//                                   </td>
//                                   <td style={{ padding: "8px 10px" }}>
//                                     <input
//                                       type="number"
//                                       className="form-control form-control-sm"
//                                       value={reading.ph}
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           index,
//                                           "ph",
//                                           e.target.value
//                                         )
//                                       }
//                                       disabled={
//                                         (!isOperator && !isAdmin) || loading
//                                       }
//                                       style={inputStyle}
//                                     />
//                                   </td>
//                                   {/* --- NEW COMMENT INPUT --- */}
//                                   <td style={{ padding: "8px 10px" }}>
//                                     <input
//                                       type="text"
//                                       className="form-control form-control-sm"
//                                       value={reading.comment}
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           index,
//                                           "comment",
//                                           e.target.value
//                                         )
//                                       }
//                                       disabled={
//                                         (!isOperator && !isAdmin) || loading
//                                       }
//                                       style={commentInputStyle}
//                                     />
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>

//                       {/* Charts - Only for Admin */}
//                       {isAdmin && (
//                         <div className="col-lg-6">
//                           {" "}
//                           {/* Changed to lg-6 */}
//                           <div
//                             style={{
//                               border: "3px dotted #3498db",
//                               borderRadius: "12px",
//                               padding: "20px",
//                               backgroundColor: "#f8f9fa",
//                               height: "550px",
//                               overflowY: "auto",
//                             }}
//                           >
//                             {/* MLSS Chart Container */}
//                             <div
//                               ref={mlssChartRef} // Add ref here
//                               style={{
//                                 height: "240px",
//                                 position: "relative",
//                                 marginBottom: "25px",
//                                 padding: "15px",
//                                 backgroundColor: "white",
//                                 borderRadius: "10px",
//                                 border: "2px dotted #3498db",
//                               }}
//                             >
//                               <Line
//                                 options={{
//                                   ...chartOptions,
//                                   plugins: {
//                                     ...chartOptions.plugins,
//                                     title: {
//                                       ...chartOptions.plugins.title,
//                                       text: "MLSS Levels Over Time",
//                                     },
//                                   },
//                                 }}
//                                 data={mlssData}
//                               />
//                             </div>
//                             {/* pH Chart Container */}
//                             <div
//                               ref={phChartRef} // Add ref here
//                               style={{
//                                 height: "240px",
//                                 position: "relative",
//                                 padding: "15px",
//                                 backgroundColor: "white",
//                                 borderRadius: "10px",
//                                 border: "2px dotted #e74c3c",
//                               }}
//                             >
//                               <Line
//                                 options={{
//                                   ...chartOptions,
//                                   plugins: {
//                                     ...chartOptions.plugins,
//                                     title: {
//                                       ...chartOptions.plugins.title,
//                                       text: "pH Levels Over Time",
//                                     },
//                                   },
//                                 }}
//                                 data={phData}
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     {/* Action Buttons */}
//                     {(isOperator || isAdmin) && (
//                       <div className="text-center mt-4">
//                         <button
//                           style={buttonStyle}
//                           onClick={handleSave}
//                           disabled={loading || !targetUser.userId}
//                           onMouseOver={(e) =>
//                             (e.target.style.transform = "translateY(-2px)")
//                           }
//                           onMouseOut={(e) =>
//                             (e.target.style.transform = "translateY(0)")
//                           }
//                         >
//                           {loading ? "Saving..." : "💾 Save Report"}
//                         </button>

//                         {/* --- UPDATED DOWNLOAD BUTTONS --- */}
//                         {isAdmin && (
//                           <>
//                             <button
//                               style={downloadPdfButtonStyle}
//                               onClick={handleDownloadPDF} // Renamed function
//                               disabled={loading || !targetUser.userId}
//                               onMouseOver={(e) =>
//                                 (e.target.style.transform = "translateY(-2px)")
//                               }
//                               onMouseOut={(e) =>
//                                 (e.target.style.transform = "translateY(0)")
//                               }
//                             >
//                               {loading ? "..." : "📥 Download PDF"}
//                             </button>

//                             <button
//                               style={downloadCsvButtonStyle}
//                               onClick={handleDownloadCSV} // New function
//                               disabled={loading || !targetUser.userId}
//                               onMouseOver={(e) =>
//                                 (e.target.style.transform = "translateY(-2px)")
//                               }
//                               onMouseOut={(e) =>
//                                 (e.target.style.transform = "translateY(0)")
//                               }
//                             >
//                               {loading ? "..." : "📊 Download CSV"}
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   <InletAndOutlet />
//                   {/* --- Photo Upload Section --- */}
//                   <div className="photo-upload-section mt-4">
//                     <h4>Upload Site Photos</h4>

//                     <div className="photo-upload-grid">
//                       {[0, 1].map((i) => (
//                         <div className="photo-box" key={i}>
//                           <input
//                             type="file"
//                             accept="image/*"
//                             id={`photoUpload${i}`}
//                             className="photo-input"
//                             onChange={(e) => {
//                               if (e.target.files[0]) {
//                                 const file = e.target.files[0];
//                                 const imgUrl = URL.createObjectURL(file);
//                                 document.getElementById(
//                                   `photoPreview${i}`
//                                 ).src = imgUrl;

//                                 const updated = [...photos];
//                                 updated[i] = file;
//                                 setPhotos(updated);
//                               }
//                             }}
//                           />
//                           <label
//                             htmlFor={`photoUpload${i}`}
//                             className="photo-label"
//                           >
//                             <img
//                               id={`photoPreview${i}`}
//                               className="photo-preview"
//                               alt={`Preview ${i}`}
//                             />
//                             <div className="photo-placeholder">
//                               <i className="fas fa-camera photo-icon"></i>
//                               <span>Upload / Take Photo</span>
//                             </div>
//                           </label>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="text-center mt-3">
//                       <button
//                         style={buttonStyle}
//                         onClick={handleUploadPhotos}
//                         disabled={!targetUser.userId || !photos.length}
//                       >
//                         📸 Upload Photos
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default MonthlyPh;

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
import "./MonthlyReport.css";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import InletAndOutlet from "./InletAndOutlet";
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

const MonthlyPh = () => {
  const dispatch = useDispatch();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [readings, setReadings] = useState([]);
  const [currentDate] = useState(new Date());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());
  const [photos, setPhotos] = useState([]);

  const mlssChartRef = useRef(null);
  const phChartRef = useRef(null);

  const { userData } = useSelector((state) => state.user);
  const selectedUserId = useSelector((state) => state.selectedUser.userId);
  const { users: allUsers } = useSelector((state) => state.userLog);

  const currentUser = userData?.validUserOne;
  const isOperator = currentUser?.userType === "operator";
  const isAdmin =
    ["admin", "super_admin"].includes(currentUser?.userType) ||
    currentUser?.adminType === "EBHOOM";

  useEffect(() => {
    if (isAdmin || isOperator) {
      dispatch(fetchUsers());
    }
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

  useEffect(() => {
    const days = getDaysInMonth(year, month);
    const initialReadings = days.map((day) => ({
      date: day,
      mlss: "",
      ph: "",
      comment: "",
    }));
    setReadings(initialReadings);
    setReport(null);
  }, [year, month]);

  useEffect(() => {
    if (!targetUser.userName) return;
    const fetchReport = async () => {
      setLoading(true);
      try {
        const url = `${API_URL}/api/monthly-report/${targetUser.userName}/${year}/${month}`;
        const { data } = await axios.get(url);
        setReport(data);
      } catch (error) {
        if (error.response?.status === 404) setReport(null);
        else {
          console.error(error);
          toast.error("Failed to fetch report");
        }
      }
      setLoading(false);
    };
    fetchReport();
  }, [targetUser.userName, year, month]);

  useEffect(() => {
    const days = getDaysInMonth(year, month);
    if (report?.readings) {
      setReadings(
        days.map((day) => {
          const found = report.readings.find((r) => r.date === day);
          return {
            date: day,
            mlss: found?.mlss || "",
            ph: found?.ph || "",
            comment: found?.comment || "",
          };
        })
      );
    } else {
      setReadings(
        days.map((day) => ({ date: day, mlss: "", ph: "", comment: "" }))
      );
    }
  }, [report, year, month]);

  const handleInputChange = (index, field, value) => {
    const newReadings = [...readings];
    newReadings[index][field] = value;
    setReadings(newReadings);
  };

  const handleSave = async () => {
    if (!targetUser.userId || !targetUser.userName) {
      toast.error("Cannot save. User data is incomplete.");
      return;
    }
    const validReadings = readings
      .map((r) => ({
        date: r.date,
        mlss: r.mlss === "" ? null : Number(r.mlss),
        ph: r.ph === "" ? null : Number(r.ph),
        comment: r.comment === "" ? null : r.comment,
      }))
      .filter((r) => r.mlss !== null || r.ph !== null || r.comment !== null);

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
      const { data } = await axios.post(
        `${API_URL}/api/monthly-report`,
        payload
      );
      setReport(data);
      MySwal.fire({
        title: "Report Saved!",
        html: `<p>Report saved for <b>${data.userName}</b></p><p>Site: ${data.siteName}</p>`,
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save report");
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

      doc.setFillColor("#236a80");
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, "F");
      doc.addImage(logoImg, "PNG", 15, 5, 25, 25);
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

      const tableHead = [
        ["Date", "MLSS (mg/ltr)", "pH - TREATED WATER", "Comment"],
      ];
      const tableBody = readings.map((r) => [
        formatDate(r.date, month, year),
        r.mlss || "N/A",
        r.ph || "N/A",
        r.comment || "N/A",
      ]);

      doc.autoTable({
        startY: 60,
        head: tableHead,
        body: tableBody,
        theme: "grid",
        headStyles: { fillColor: "#236a80" },
      });

      if (isAdmin) {
        let y = doc.autoTable.previous.finalY + 15;
        if (mlssChartRef.current) {
          if (y + 100 > doc.internal.pageSize.getHeight() - 10) {
            doc.addPage();
            y = 15;
          }
          doc.setFontSize(14);
          doc.text("MLSS Levels Over Time", 15, y);
          const c1 = await html2canvas(mlssChartRef.current, { scale: 2 });
          doc.addImage(c1.toDataURL("image/png"), "PNG", 15, y + 10, 180, 90);
          y += 110;
        }
        if (phChartRef.current) {
          if (y + 100 > doc.internal.pageSize.getHeight() - 10) {
            doc.addPage();
            y = 15;
          }
          doc.setFontSize(14);
          doc.text("pH Levels Over Time", 15, y);
          const c2 = await html2canvas(phChartRef.current, { scale: 2 });
          doc.addImage(c2.toDataURL("image/png"), "PNG", 15, y + 10, 180, 90);
        }
      }

      doc.save(
        `${targetUser.siteName}_${monthNames[month]}_${year}_Report.pdf`
      );
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF.");
    }
    setLoading(false);
  };

  const handleDownloadCSV = () => {
    setLoading(true);
    let csv = "Date,MLSS (mg/ltr),pH - TREATED WATER,Comment\n";
    readings.forEach((r) => {
      const dateStr = formatDate(r.date, month, year);
      const comment = `"${r.comment || ""}"`;
      csv += `${dateStr},${r.mlss || ""},${r.ph || ""},${comment}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetUser.siteName}_${month + 1}-${year}_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setLoading(false);
    toast.success("CSV downloaded successfully!");
  };

  const handleUploadPhotos = async () => {
    if (!photos.length) {
      return MySwal.fire({
        title: "No Photos Selected",
        text: "Please select at least one photo before uploading.",
        icon: "warning",
        confirmButtonColor: "#236a80",
      });
    }

    MySwal.fire({
      title: "Uploading Photos...",
      text: "Please wait while we upload your photos to the server.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const formData = new FormData();
    photos.forEach((p) => p && formData.append("photos", p));

    try {
      const res = await axios.post(
        `${API_URL}/api/monthly-report/upload/${targetUser.userId}/${year}/${month}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      MySwal.fire({
        title: "✅ Upload Successful!",
        html: `<p>Your photos have been uploaded successfully.</p>`,
        icon: "success",
        confirmButtonColor: "#236a80",
      });
      console.log("S3 URLs:", res.data.photos);
    } catch (err) {
      console.error("Upload failed:", err);
      MySwal.fire({
        title: "Upload Failed!",
        text: "Something went wrong while uploading. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const labels = readings.map((r) => formatDate(r.date, month, year));
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 12, weight: "bold" }, color: "#2c3e50" },
      },
      title: {
        display: true,
        font: { size: 16, weight: "bold" },
        color: "#236a80",
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 15,
          color: "#34495e",
          font: { size: 11 },
        },
        grid: { color: "rgba(52, 73, 94, 0.1)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#34495e", font: { size: 11 } },
        grid: { color: "rgba(52, 73, 94, 0.1)" },
      },
    },
  };
  const mlssData = {
    labels,
    datasets: [
      {
        label: "MLSS (mg/ltr)",
        data: readings.map((r) => r.mlss || null),
        borderColor: "#236a80",
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true,
        tension: 0.3,
      },
    ],
  };
  const phData = {
    labels,
    datasets: [
      {
        label: "pH - TREATED WATER",
        data: readings.map((r) => r.ph || null),
        borderColor: "#e74c3c",
        backgroundColor: "rgba(231, 76, 60, 0.1)",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true,
        tension: 0.3,
      },
    ],
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
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
 marginTop:"2rem",

  };
  const operatorheaderStyle = {
    background: "linear-gradient(135deg, #236a80 0%, #236a80 100%)",
    color: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginTop:"2.8rem",
  };
  const cardStyle = {
    border: "3px dotted #3498db",
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  };

  const inputStyle = {
    border: "2px dotted #3498db",
    borderRadius: "6px",
    padding: "8px",
    fontSize: "0.9rem",
    color: "#2c3e50",
    transition: "all 0.3s ease",
  };
  const commentInputStyle = { ...inputStyle, width: "100%" };
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
    ...buttonStyle,
    backgroundColor: "#e74c3c",
    borderColor: "#e74c3c",
  };
  const downloadCsvButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#27ae60",
    borderColor: "#27ae60",
  };
  const promptStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    textAlign: "center",
    color: "#236a80",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    border: "3px dotted #236a80",
  };

  return (
    <>
      <div className="d-flex">
        {/* Sidebar */}
        {!isOperator && (
          <div>
            <DashboardSam />
          </div>
        )}

        {/* Main Content Area */}
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

          <div className="container-fluid py-4 px-4">
            {/* --- existing MonthlyPh content --- */}

            <div className="row" style={{ marginTop: "0", padding: "0 68px"}}>
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
                        or add their monthly report.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                  <div>

                  </div>
<div style={headerStyle}>
                      <div className="d-flex flex-wrap justify-content-between align-items-center">
                        <div>
                          <h3
                            className="mb-2"
                            style={{ fontWeight: "bold", fontSize: "1.8rem" }}
                          >
                            MLSS &amp; pH PARAMETER READINGS
                          </h3>
                          <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
                            <strong>SITE:</strong>{" "}
                            {targetUser.siteName || "N/A"}
                            <strong className="ms-2">
                              ({targetUser.userName || "No User Selected"})
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
                            style={{
                              ...inputStyle,
                              backgroundColor: "white",
                              minWidth: "140px",
                            }}
                          >
                            {monthNames.map((name, index) => (
                              <option key={index} value={index}>
                                {name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="form-control"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            style={{
                              ...inputStyle,
                              width: "110px",
                              backgroundColor: "white",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div className="row">
                        <div className={isAdmin ? "col-lg-6" : "col-12"}>
                          <div
                            style={{
                              height: isAdmin ? "550px" : "600px",
                              overflowY: "auto",
                              border: "3px dotted #236a80",
                              borderRadius: "10px",
                              padding: "10px",
                              backgroundColor: "#f8f9fa",
                            }}
                          >
                            <table
                              className="table table-hover"
                              style={{ marginBottom: 0 }}
                            >
                              <thead
                                style={{
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 10,
                                  background:
                                    "linear-gradient(135deg, #236a80 0%, #3498db 100%)",
                                  color: "white",
                                }}
                              >
                                <tr>
                                  <th
                                    style={{
                                      padding: "15px 10px",
                                      fontWeight: "bold",
                                      fontSize: "0.95rem",
                                      border:
                                        "2px dotted rgba(255, 255, 255, 0.3)",
                                    }}
                                  >
                                    DATE
                                  </th>
                                  <th
                                    style={{
                                      padding: "15px 10px",
                                      fontWeight: "bold",
                                      fontSize: "0.95rem",
                                      border:
                                        "2px dotted rgba(255, 255, 255, 0.3)",
                                    }}
                                  >
                                    MLSS (mg/ltr)
                                  </th>
                                  <th
                                    style={{
                                      padding: "15px 10px",
                                      fontWeight: "bold",
                                      fontSize: "0.95rem",
                                      border:
                                        "2px dotted rgba(255, 255, 255, 0.3)",
                                    }}
                                  >
                                    pH - TREATED WATER
                                  </th>
                                  <th
                                    style={{
                                      padding: "15px 10px",
                                      fontWeight: "bold",
                                      fontSize: "0.95rem",
                                      border:
                                        "2px dotted rgba(255, 255, 255, 0.3)",
                                      minWidth: "150px",
                                    }}
                                  >
                                    COMMENT
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {readings.map((reading, index) => (
                                  <tr
                                    key={index}
                                    style={{
                                      backgroundColor:
                                        index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                                    }}
                                  >
                                    <td
                                      style={{
                                        padding: "12px 10px",
                                        fontWeight: "600",
                                        color: "#2c3e50",
                                        fontSize: "0.9rem",
                                      }}
                                    >
                                      {formatDate(reading.date, month, year)}
                                    </td>
                                    <td style={{ padding: "8px 10px" }}>
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={reading.mlss}
                                        onChange={(e) =>
                                          handleInputChange(
                                            index,
                                            "mlss",
                                            e.target.value
                                          )
                                        }
                                        disabled={
                                          (!isOperator && !isAdmin) || loading
                                        }
                                        style={inputStyle}
                                      />
                                    </td>
                                    <td style={{ padding: "8px 10px" }}>
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={reading.ph}
                                        onChange={(e) =>
                                          handleInputChange(
                                            index,
                                            "ph",
                                            e.target.value
                                          )
                                        }
                                        disabled={
                                          (!isOperator && !isAdmin) || loading
                                        }
                                        style={inputStyle}
                                      />
                                    </td>
                                    <td style={{ padding: "8px 10px" }}>
                                      <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={reading.comment}
                                        onChange={(e) =>
                                          handleInputChange(
                                            index,
                                            "comment",
                                            e.target.value
                                          )
                                        }
                                        disabled={
                                          (!isOperator && !isAdmin) || loading
                                        }
                                        style={commentInputStyle}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="col-lg-6">
                            <div
                              style={{
                                border: "3px dotted #3498db",
                                borderRadius: "12px",
                                padding: "20px",
                                backgroundColor: "#f8f9fa",
                                height: "550px",
                                overflowY: "auto",
                              }}
                            >
                              <div
                                ref={mlssChartRef}
                                style={{
                                  height: "240px",
                                  position: "relative",
                                  marginBottom: "25px",
                                  padding: "15px",
                                  backgroundColor: "white",
                                  borderRadius: "10px",
                                  border: "2px dotted #3498db",
                                }}
                              >
                                <Line
                                  options={{
                                    ...chartOptions,
                                    plugins: {
                                      ...chartOptions.plugins,
                                      title: {
                                        ...chartOptions.plugins.title,
                                        text: "MLSS Levels Over Time",
                                      },
                                    },
                                  }}
                                  data={mlssData}
                                />
                              </div>
                              <div
                                ref={phChartRef}
                                style={{
                                  height: "240px",
                                  position: "relative",
                                  padding: "15px",
                                  backgroundColor: "white",
                                  borderRadius: "10px",
                                  border: "2px dotted #e74c3c",
                                }}
                              >
                                <Line
                                  options={{
                                    ...chartOptions,
                                    plugins: {
                                      ...chartOptions.plugins,
                                      title: {
                                        ...chartOptions.plugins.title,
                                        text: "pH Levels Over Time",
                                      },
                                    },
                                  }}
                                  data={phData}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {(isOperator || isAdmin) && (
                        <div className="text-center mt-4">
                          <button
                            style={buttonStyle}
                            onClick={handleSave}
                            disabled={loading || !targetUser.userId}
                            onMouseOver={(e) =>
                              (e.target.style.transform = "translateY(-2px)")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.transform = "translateY(0)")
                            }
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
                                  (e.target.style.transform =
                                    "translateY(-2px)")
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
                                  (e.target.style.transform =
                                    "translateY(-2px)")
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
                      )}
                    </div>

                    {/* ⛔ Render the Inlet/Outlet & Photo Upload ONLY for operators */}
                    {isOperator && (
                      <>
                        <div
                          style={{
                            width: "100%",
                            maxWidth: "1200px",
                            margin: "0 auto",
                          }}
                        >
                          <InletAndOutlet />
                        </div>
                        <div className="photo-upload-section mt-4">
                          <h4>Upload Site Photos</h4>
                          <div className="photo-upload-grid">
                            {[0, 1].map((i) => (
                              <div className="photo-box" key={i}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`photoUpload${i}`}
                                  className="photo-input"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      const file = e.target.files[0];
                                      const imgUrl = URL.createObjectURL(file);
                                      document.getElementById(
                                        `photoPreview${i}`
                                      ).src = imgUrl;
                                      const updated = [...photos];
                                      updated[i] = file;
                                      setPhotos(updated);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`photoUpload${i}`}
                                  className="photo-label"
                                >
                                  <img
                                    id={`photoPreview${i}`}
                                    className="photo-preview"
                                    alt={`Preview ${i}`}
                                  />
                                  <div className="photo-placeholder">
                                    <i className="fas fa-camera photo-icon"></i>
                                    <span>Upload / Take Photo</span>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                          <div className="text-center mt-3">
                            <button
                              style={buttonStyle}
                              onClick={handleUploadPhotos}
                              disabled={!targetUser.userId || !photos.length}
                            >
                              📸 Upload Photos
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    {/* ⛔ End operator-only block */}
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

export default MonthlyPh;
