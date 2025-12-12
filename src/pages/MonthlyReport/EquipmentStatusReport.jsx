// // FILE: src/Components/MonthlyMaintenance/EquipmentStatusReport.jsx

// import React, { useEffect, useMemo, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import DashboardSam from "../Dashboard/DashboardSam";
// import Header from "../Header/Hedaer";
// import { toast } from "react-toastify";
// import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
// import axios from "axios";
// import { API_URL } from "../../utils/apiConfig";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import "sweetalert2/dist/sweetalert2.min.css";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import genexlogo from "../../assests/images/logonewgenex.png";

// const MySwal = withReactContent(Swal);

// // 🔹 Replace these with your REAL default equipment list from Excel
// // 🔹 Exact defaults from your Excel (editable in UI)
// const DEFAULT_EQUIPMENT_ROWS = [
//   {
//     slNo: 1,
//     equipmentName: "Barscreen chamber",
//     capacity: "",
//     make: "Civil Tank with MS Barscreen",
//   },
//   {
//     slNo: 2,
//     equipmentName: "Raw Sewage transfer pump-1",
//     capacity: "5 HP",
//     make: "Kirloskar",
//   },
//   {
//     slNo: 4,
//     equipmentName: "Raw Sewage transfer pump-2",
//     capacity: "5 HP",
//     make: "Johnson pump",
//   },
//   {
//     slNo: 5,
//     equipmentName: "Air blower -1",
//     capacity: "12.5 HP",
//     make: "NGEF",
//   },
//   {
//     slNo: 6,
//     equipmentName: "Air blower -2",
//     capacity: "12.5 HP",
//     make: "NGEF",
//   },
//   {
//     slNo: 7,
//     equipmentName: "Filter feed pump-1",
//     capacity: "5 HP",
//     make: "Kirloskar",
//   },
//   {
//     slNo: 8,
//     equipmentName: "Filter feed pump-2",
//     capacity: "5 HP",
//     make: "Kirloskar",
//   },
//   {
//     slNo: 9,
//     equipmentName: "Clarifier Mechanism",
//     capacity: "2 HP",
//     make: "",
//   },
//   {
//     slNo: 10,
//     equipmentName: "Sludge transfer pump-1",
//     capacity: "2 HP Motor",
//     make: "Kirloskar Motor",
//   },
//   {
//     slNo: 11,
//     equipmentName: "Sludge transfer pump-2",
//     capacity: "3 HP Motor",
//     make: "Kirloskar Motor",
//   },
//   {
//     slNo: 12,
//     equipmentName: "ACF",
//     capacity: "",
//     make: "",
//   },
//   {
//     slNo: 13,
//     equipmentName: "PSF",
//     capacity: "",
//     make: "",
//   },
//   {
//     slNo: 14,
//     equipmentName: "Screw pump and Filter press unit",
//     capacity: "",
//     make: "",
//   },
//   {
//     slNo: 15,
//     equipmentName: "Inlet Flowmeter",
//     capacity: "",
//     make: "",
//   },
// {
//     slNo: 16,
//     equipmentName: "Outlet flowmeter",
//     capacity: "",
//     make: "",
//   },
//   {
//     slNo: 17,
//     equipmentName: "Exhaust & Fresh air duct",
//     capacity: "",
//     make: "",
//   },
//   {
//     slNo: 18,
//     equipmentName: "Dosing pump",
//     capacity: "",
//     make: "",
//   },
// ];

// const EquipmentStatusReport = () => {
//   const dispatch = useDispatch();

//   const { userData } = useSelector((state) => state.user);
//   const selectedUserId = useSelector((state) => state.selectedUser.userId);
//   const { users: allUsers } = useSelector((state) => state.userLog);

//   const currentUser = userData?.validUserOne;
//   const isOperator = currentUser?.userType === "operator";
//   const isAdmin =
//     ["admin", "super_admin"].includes(currentUser?.userType) ||
//     currentUser?.adminType === "EBHOOM";

//   const today = new Date();
//   const [year, setYear] = useState(today.getFullYear());
//   const [month, setMonth] = useState(today.getMonth()); // 0–11

//   const [rows, setRows] = useState(
//     DEFAULT_EQUIPMENT_ROWS.map((r) => ({ ...r, status: "WORKING", comment: "" }))
//   );

//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   // --- Load users (same as other reports) ---
//   useEffect(() => {
//     if (isAdmin || isOperator) {
//       dispatch(fetchUsers());
//     }
//   }, [dispatch, isAdmin, isOperator]);

//   // --- Resolve selected site/user ---
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
//       return {
//         userName: selectedUserId,
//         siteName: "Loading Site...",
//         userId: null,
//       };
//     }
//     return { userName: null, siteName: "N/A", userId: null };
//   }, [isOperator, isAdmin, selectedUserId, allUsers]);

//   // --- Reset to default template when month/year changes ---
//   useEffect(() => {
//     setRows(
//       DEFAULT_EQUIPMENT_ROWS.map((r) => ({
//         ...r,
//         status: "WORKING",
//         comment: "",
//       }))
//     );
//   }, [year, month]);

//   // --- Fetch existing report for selected site/month ---
//   useEffect(() => {
//     if (!targetUser.userId) return;

//     const fetchReport = async () => {
//       setLoading(true);
//       try {
//         const { data } = await axios.get(
//           `${API_URL}/api/equipment-status/${targetUser.userId}/${year}/${
//             month + 1
//           }`
//         );

//         if (data?.entries?.length) {
//           setRows(
//             data.entries.map((e) => ({
//               slNo: e.slNo,
//               equipmentName: e.equipmentName,
//               capacity: e.capacity || "",
//               make: e.make || "",
//               status: e.status || "",
//               comment: e.comment || "",
//             }))
//           );
//         } else {
//           setRows(
//             DEFAULT_EQUIPMENT_ROWS.map((r) => ({
//               ...r,
//               status: "WORKING",
//               comment: "",
//             }))
//           );
//         }
//       } catch (err) {
//         if (err.response?.status === 404) {
//           setRows(
//             DEFAULT_EQUIPMENT_ROWS.map((r) => ({
//               ...r,
//               status: "WORKING",
//               comment: "",
//             }))
//           );
//         } else {
//           console.error("Failed to fetch equipment status report:", err);
//           toast.error("Failed to fetch equipment status report");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReport();
//   }, [targetUser.userId, year, month]);

//   // --- Handlers ---
//   const handleCellChange = (index, field, value) => {
//     setRows((prev) => {
//       const copy = [...prev];
//       copy[index] = {
//         ...copy[index],
//         [field]: field === "slNo" ? Number(value) || "" : value,
//       };
//       return copy;
//     });
//   };

//   const handleAddRow = () => {
//     setRows((prev) => {
//       const nextSl = prev.length
//         ? Math.max(...prev.map((r) => Number(r.slNo) || 0)) + 1
//         : 1;
//       return [
//         ...prev,
//         {
//           slNo: nextSl,
//           equipmentName: "",
//           capacity: "",
//           make: "",
//           status: "WORKING",
//           comment: "",
//         },
//       ];
//     });
//   };

//   // build rows for saving/export (ignoring fully empty rows)
//   const buildExportRows = () =>
//     rows
//       .filter((r) => {
//         const hasEquipment =
//           r.equipmentName && r.equipmentName.toString().trim() !== "";
//         const hasOther =
//           (r.capacity && r.capacity.toString().trim() !== "") ||
//           (r.make && r.make.toString().trim() !== "") ||
//           (r.status && r.status.toString().trim() !== "") ||
//           (r.comment && r.comment.toString().trim() !== "");
//         return hasEquipment || hasOther;
//       })
//       .map((r, idx) => ({
//         slNo: r.slNo || idx + 1,
//         equipmentName: r.equipmentName || "",
//         capacity: r.capacity || "",
//         make: r.make || "",
//         status: r.status || "",
//         comment: r.comment || "",
//       }));

//   const handleSaveReport = async () => {
//     if (!targetUser.userId) {
//       toast.error("Cannot save. User data is incomplete.");
//       return;
//     }

//     const entriesToSave = buildExportRows();
//     if (!entriesToSave.length) {
//       toast.info("Nothing to save for this report.");
//       return;
//     }

//     setSaving(true);

//     MySwal.fire({
//       title: "Saving Equipment Status...",
//       html: "Please wait while we save the report.",
//       allowOutsideClick: false,
//       didOpen: () => {
//         Swal.showLoading();
//       },
//     });

//     try {
//       await axios.post(`${API_URL}/api/equipment-status`, {
//         userId: targetUser.userId,
//         userName: targetUser.userName,
//         siteName: targetUser.siteName,
//         year,
//         month: month + 1, // backend expects 1–12
//         entries: entriesToSave,
//       });

//       MySwal.fire({
//         icon: "success",
//         title: "Report Saved",
//         html: `<p>Equipment status report saved for:</p>
//                <p><b>${targetUser.siteName}</b> (${targetUser.userName})</p>`,
//         confirmButtonColor: "#236a80",
//       });

//       toast.success("Equipment status report saved");
//     } catch (err) {
//       console.error("Failed to save equipment status report:", err);

//       MySwal.fire({
//         icon: "error",
//         title: "Save Failed",
//         text: "Something went wrong while saving the report. Please try again.",
//         confirmButtonColor: "#d33",
//       });

//       toast.error("Failed to save equipment status report");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // --- CSV export ---
//   const handleDownloadCSV = () => {
//     if (!targetUser.userId) {
//       toast.error("Select a user/site first.");
//       return;
//     }

//     const exportRows = buildExportRows();
//     if (!exportRows.length) {
//       toast.info("No data to export for this month.");
//       return;
//     }

//     let csv = "SL.No,STP Equipment,Capacity,Make,Status,Comment\n";
//     exportRows.forEach((r) => {
//       const line = [
//         r.slNo,
//         `"${(r.equipmentName || "").replace(/"/g, '""')}"`,
//         `"${(r.capacity || "").replace(/"/g, '""')}"`,
//         `"${(r.make || "").replace(/"/g, '""')}"`,
//         `"${(r.status || "").replace(/"/g, '""')}"`,
//         `"${(r.comment || "").replace(/"/g, '""')}"`,
//       ].join(",");
//       csv += `${line}\n`;
//     });

//     const blob = new Blob([csv], {
//       type: "text/csv;charset=utf-8;",
//     });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${targetUser.siteName}_${month + 1}-${year}_EquipmentStatus.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//     toast.success("CSV downloaded successfully!");
//   };

//   // --- PDF export ---
//   const handleDownloadPDF = async () => {
//     if (!targetUser.userId) {
//       toast.error("Select a user/site first.");
//       return;
//     }

//     const exportRows = buildExportRows();
//     if (!exportRows.length) {
//       toast.info("No data to export for this month.");
//       return;
//     }

//     try {
//       toast.info("Generating PDF...");

//       const doc = new jsPDF();
//       const pageWidth = doc.internal.pageSize.getWidth();

//       // Header bar
//       const logoImg = new Image();
//       logoImg.src = genexlogo;
//       await new Promise((resolve) => {
//         logoImg.onload = resolve;
//         logoImg.onerror = resolve;
//       });

//       doc.setFillColor("#236a80");
//       doc.rect(0, 0, pageWidth, 35, "F");
//       doc.addImage(logoImg, "PNG", 15, 5, 25, 25);

//       doc.setFont("helvetica", "bold");
//       doc.setTextColor("#FFFFFF");
//       doc.setFontSize(14);
//       doc.text("Genex Utility Management Pvt Ltd", pageWidth / 2 + 10, 12, {
//         align: "center",
//       });

//       doc.setFont("helvetica", "normal");
//       doc.setFontSize(8);
//       doc.text(
//         "Sujatha Arcade, Second Floor, #32 Lake View Defence Colony, Shettihalli, Post,",
//         pageWidth / 2 + 10,
//         19,
//         { align: "center" }
//       );
//       doc.text(
//         "Jalahalli West, Bengaluru, Karnataka 560015",
//         pageWidth / 2 + 10,
//         24,
//         { align: "center" }
//       );
//       doc.text("Phone: +91-9663044156", pageWidth / 2 + 10, 29, {
//         align: "center",
//       });

//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(10);
//       doc.text("Equipment Status Report", pageWidth / 2 + 10, 34, {
//         align: "center",
//       });

//       const monthNames = [
//         "January",
//         "February",
//         "March",
//         "April",
//         "May",
//         "June",
//         "July",
//         "August",
//         "September",
//         "October",
//         "November",
//         "December",
//       ];

//       doc.setTextColor("#000000");
//       doc.setFontSize(11);
//       doc.setFont("helvetica", "bold");
//       doc.text(
//         `Site: ${targetUser.siteName} (${targetUser.userName})`,
//         15,
//         48
//       );
//       doc.text(`Month: ${monthNames[month]} ${year}`, 15, 55);

//       const body = exportRows.map((r) => [
//         r.slNo,
//         r.equipmentName,
//         r.capacity,
//         r.make,
//         r.status,
//         r.comment,
//       ]);

//       doc.autoTable({
//         startY: 63,
//         head: [
//           [
//             "SL.No",
//             "STP Equipment",
//             "Capacity",
//             "Make",
//             "Status",
//             "Comment",
//           ],
//         ],
//         body,
//         theme: "grid",
//         headStyles: {
//           fillColor: "#236a80",
//           textColor: "#ffffff",
//           minCellHeight: 16,
//           lineWidth: 0.2,
//           lineColor: [120, 120, 120], // light black border
//         },
//         styles: {
//           fontSize: 8,
//           cellPadding: 3,
//           lineWidth: 0.2,
//           lineColor: [120, 120, 120], // same border color for body
//         },
//         columnStyles: {
//           0: { cellWidth: 12 }, // SL.No
//           1: { cellWidth: 50 }, // Equipment
//           2: { cellWidth: 25 }, // Capacity
//           3: { cellWidth: 25 }, // Make
//           4: { cellWidth: 25 }, // Status
//           5: { cellWidth: pageWidth - (12 + 50 + 25 + 25 + 25) - 30 }, // Comment
//         },
//       });

//       doc.save(
//         `${targetUser.siteName}_${monthNames[month]}_${year}_EquipmentStatus.pdf`
//       );

//       toast.success("PDF generated successfully!");
//     } catch (err) {
//       console.error("PDF generation failed:", err);
//       toast.error("Failed to generate PDF.");
//     }
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

//   // --- Styles ---
//   const headerStyle = {
//     background: "linear-gradient(135deg, #236a80 0%, #236a80 100%)",
//     color: "white",
//     padding: "1.5rem",
//     borderRadius: "12px",
//     marginBottom: "1.5rem",
//     boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//     marginTop: "2rem",
//   };

//   const cardStyle = {
//     border: "3px dotted #3498db",
//     borderRadius: "15px",
//     backgroundColor: "#ffffff",
//     boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
//     padding: "1.5rem",
//     marginBottom: "1.5rem",
//   };

//   const inputStyle = {
//     border: "2px dotted #3498db",
//     borderRadius: "6px",
//     padding: "6px",
//     fontSize: "0.85rem",
//     color: "#2c3e50",
//     transition: "all 0.3s ease",
//   };

//   const commentInputStyle = { ...inputStyle, width: "100%" };

//   const buttonStyle = {
//     padding: "10px 24px",
//     borderRadius: "8px",
//     border: "2px dotted #236a80",
//     backgroundColor: "#236a80",
//     color: "white",
//     fontWeight: "600",
//     fontSize: "0.95rem",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     marginRight: "10px",
//   };

//   const addRowButtonStyle = {
//     ...buttonStyle,
//     backgroundColor: "#27ae60",
//     borderColor: "#27ae60",
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
//       <div className="d-flex">
//         {/* Sidebar */}
//         {!isOperator && (
//           <div>
//             <DashboardSam />
//           </div>
//         )}

//         {/* Main Content */}
//         <div
//           style={{
//             marginLeft: !isOperator ? "260px" : "0",
//             width: "100%",
//             minHeight: "100vh",
//           }}
//         >
//           {/* Top Header (for non-operator) */}
//           {!isOperator && (
//             <div
//               style={{
//                 position: "sticky",
//                 top: 0,
//                 zIndex: 5,
//                 marginLeft: "100px",
//               }}
//             >
//               <Header />
//             </div>
//           )}

//           <div className="container-fluid py-4 px-4">
//             <div className="row" style={{ marginTop: "0", padding: "0 68px" }}>
//               <div className="col-12">
//                 {/* If no user selected, show prompt */}
//                 {!targetUser.userName ? (
//                   <div style={cardStyle}>
//                     <div style={promptStyle}>
//                       <i
//                         className="fas fa-hand-pointer"
//                         style={{
//                           fontSize: "3rem",
//                           marginBottom: "1.5rem",
//                           color: "#236a80",
//                         }}
//                       ></i>
//                       <h3 style={{ fontWeight: "600", color: "#236a80" }}>
//                         Please Select a User
//                       </h3>
//                       <p
//                         style={{
//                           fontSize: "1.1rem",
//                           color: "#34495e",
//                           maxWidth: "400px",
//                         }}
//                       >
//                         Use the dropdown in the header to select a user to view
//                         or add their equipment status report.
//                       </p>
//                     </div>
//                   </div>
//                 ) : (
//                   <>
//                     {/* Header bar */}
//                     <div style={headerStyle}>
//                       <div className="d-flex flex-wrap justify-content-between align-items-center">
//                         <div>
//                           <h3
//                             className="mb-2"
//                             style={{ fontWeight: "bold", fontSize: "1.8rem" }}
//                           >
//                             EQUIPMENT STATUS REPORT
//                           </h3>
//                           <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
//                             <strong>SITE:</strong>{" "}
//                             {targetUser.siteName || "N/A"}
//                             <strong className="ms-2">
//                               ({targetUser.userName || "No User Selected"})
//                             </strong>
//                             <span className="mx-3">|</span>
//                             <strong>MONTH:</strong> {monthNames[month]} {year}
//                           </div>
//                         </div>

//                         <div className="d-flex align-items-center mt-3 mt-md-0">
//                           <select
//                             className="form-select me-2"
//                             value={month}
//                             onChange={(e) => setMonth(Number(e.target.value))}
//                             style={{
//                               ...inputStyle,
//                               backgroundColor: "white",
//                               minWidth: "140px",
//                             }}
//                           >
//                             {monthNames.map((name, index) => (
//                               <option key={index} value={index}>
//                                 {name}
//                               </option>
//                             ))}
//                           </select>
//                           <input
//                             type="number"
//                             className="form-control"
//                             value={year}
//                             onChange={(e) => setYear(Number(e.target.value))}
//                             style={{
//                               ...inputStyle,
//                               width: "110px",
//                               backgroundColor: "white",
//                             }}
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Main card with table */}
//                     <div style={cardStyle}>
//                       <div
//                         style={{
//                           height: "550px",
//                           overflowY: "auto",
//                           border: "3px dotted #236a80",
//                           borderRadius: "10px",
//                           padding: "10px",
//                           backgroundColor: "#f8f9fa",
//                         }}
//                       >
//                         {loading && (
//                           <div className="text-center mb-2">
//                             <span style={{ color: "#236a80" }}>
//                               Loading equipment status...
//                             </span>
//                           </div>
//                         )}

//                         <table
//                           className="table table-hover"
//                           style={{ marginBottom: 0 }}
//                         >
//                           <thead
//                             style={{
//                               position: "sticky",
//                               top: 0,
//                               zIndex: 10,
//                               background:
//                                 "linear-gradient(135deg, #236a80 0%, #3498db 100%)",
//                               color: "white",
//                             }}
//                           >
//                             <tr>
//                               <th
//                                 style={{
//                                   padding: "10px 8px",
//                                   fontWeight: "bold",
//                                   fontSize: "0.9rem",
//                                   border:
//                                     "2px dotted rgba(255, 255, 255, 0.3)",
//                                   minWidth: "60px",
//                                 }}
//                               >
//                                 SL.No
//                               </th>
//                               <th
//                                 style={{
//                                   padding: "10px 8px",
//                                   fontWeight: "bold",
//                                   fontSize: "0.9rem",
//                                   border:
//                                     "2px dotted rgba(255, 255, 255, 0.3)",
//                                   minWidth: "200px",
//                                 }}
//                               >
//                                 STP Equipment
//                               </th>
//                               <th
//                                 style={{
//                                   padding: "10px 8px",
//                                   fontWeight: "bold",
//                                   fontSize: "0.9rem",
//                                   border:
//                                     "2px dotted rgba(255, 255, 255, 0.3)",
//                                   minWidth: "120px",
//                                 }}
//                               >
//                                 Capacity
//                               </th>
//                               <th
//                                 style={{
//                                   padding: "10px 8px",
//                                   fontWeight: "bold",
//                                   fontSize: "0.9rem",
//                                   border:
//                                     "2px dotted rgba(255, 255, 255, 0.3)",
//                                   minWidth: "120px",
//                                 }}
//                               >
//                                 Make
//                               </th>
//                               <th
//                                 style={{
//                                   padding: "10px 8px",
//                                   fontWeight: "bold",
//                                   fontSize: "0.9rem",
//                                   border:
//                                     "2px dotted rgba(255, 255, 255, 0.3)",
//                                   minWidth: "130px",
//                                 }}
//                               >
//                                 Status
//                               </th>
//                               <th
//                                 style={{
//                                   padding: "10px 8px",
//                                   fontWeight: "bold",
//                                   fontSize: "0.9rem",
//                                   border:
//                                     "2px dotted rgba(255, 255, 255, 0.3)",
//                                   minWidth: "200px",
//                                 }}
//                               >
//                                 Comment
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {rows.map((row, index) => (
//                               <tr
//                                 key={index}
//                                 style={{
//                                   backgroundColor:
//                                     index % 2 === 0 ? "#ffffff" : "#f8f9fa",
//                                 }}
//                               >
//                                 {/* SL.No */}
//                                 <td style={{ padding: "6px 8px", width: "70px" }}>
//                                   <input
//                                     type="number"
//                                     className="form-control form-control-sm"
//                                     value={row.slNo}
//                                     onChange={(e) =>
//                                       handleCellChange(
//                                         index,
//                                         "slNo",
//                                         e.target.value
//                                       )
//                                     }
//                                     disabled={loading || saving}
//                                     style={inputStyle}
//                                   />
//                                 </td>

//                                 {/* STP Equipment */}
//                                 <td style={{ padding: "6px 8px" }}>
//                                   <input
//                                     type="text"
//                                     className="form-control form-control-sm"
//                                     value={row.equipmentName}
//                                     onChange={(e) =>
//                                       handleCellChange(
//                                         index,
//                                         "equipmentName",
//                                         e.target.value
//                                       )
//                                     }
//                                     disabled={loading || saving}
//                                     style={inputStyle}
//                                   />
//                                 </td>

//                                 {/* Capacity */}
//                                 <td style={{ padding: "6px 8px" }}>
//                                   <input
//                                     type="text"
//                                     className="form-control form-control-sm"
//                                     value={row.capacity}
//                                     onChange={(e) =>
//                                       handleCellChange(
//                                         index,
//                                         "capacity",
//                                         e.target.value
//                                       )
//                                     }
//                                     disabled={loading || saving}
//                                     style={inputStyle}
//                                   />
//                                 </td>

//                                 {/* Make */}
//                                 <td style={{ padding: "6px 8px" }}>
//                                   <input
//                                     type="text"
//                                     className="form-control form-control-sm"
//                                     value={row.make}
//                                     onChange={(e) =>
//                                       handleCellChange(
//                                         index,
//                                         "make",
//                                         e.target.value
//                                       )
//                                     }
//                                     disabled={loading || saving}
//                                     style={inputStyle}
//                                   />
//                                 </td>

//                                 {/* Status */}
//                                 <td style={{ padding: "6px 8px" }}>
//                                   <input
//                                     type="text"
//                                     className="form-control form-control-sm"
//                                     value={row.status}
//                                     onChange={(e) =>
//                                       handleCellChange(
//                                         index,
//                                         "status",
//                                         e.target.value
//                                       )
//                                     }
//                                     disabled={loading || saving}
//                                     style={inputStyle}
//                                     // placeholder="Running / Standby / Not working..."
//                                   />
//                                 </td>

//                                 {/* Comment */}
//                                 <td style={{ padding: "6px 8px" }}>
//                                   <textarea
//                                     className="form-control form-control-sm"
//                                     value={row.comment}
//                                     onChange={(e) =>
//                                       handleCellChange(
//                                         index,
//                                         "comment",
//                                         e.target.value
//                                       )
//                                     }
//                                     disabled={loading || saving}
//                                     style={{
//                                       ...commentInputStyle,
//                                       minHeight: "48px",
//                                       resize: "vertical",
//                                     }}
//                                     // placeholder="Brief remark on condition / issues..."
//                                   />
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>

//                       {(isOperator || isAdmin) && (
//                         <div className="d-flex flex-wrap justify-content-between align-items-center mt-3">
//                           <button
//                             style={addRowButtonStyle}
//                             onClick={handleAddRow}
//                             disabled={loading || saving}
//                             onMouseOver={(e) =>
//                               (e.target.style.transform = "translateY(-2px)")
//                             }
//                             onMouseOut={(e) =>
//                               (e.target.style.transform = "translateY(0)")
//                             }
//                           >
//                             ➕ Add Equipment Row
//                           </button>

//                           <div className="mt-3 mt-md-0">
//                             <button
//                               style={buttonStyle}
//                               onClick={handleSaveReport}
//                               disabled={
//                                 saving || loading || !targetUser.userId
//                               }
//                               onMouseOver={(e) =>
//                                 (e.target.style.transform = "translateY(-2px)")
//                               }
//                               onMouseOut={(e) =>
//                                 (e.target.style.transform = "translateY(0)")
//                               }
//                             >
//                               {saving ? "Saving..." : "💾 Save Report"}
//                             </button>

//                             <button
//                               style={downloadPdfButtonStyle}
//                               onClick={handleDownloadPDF}
//                               disabled={loading || !targetUser.userId}
//                               onMouseOver={(e) =>
//                                 (e.target.style.transform = "translateY(-2px)")
//                               }
//                               onMouseOut={(e) =>
//                                 (e.target.style.transform = "translateY(0)")
//                               }
//                             >
//                               📄 Download PDF
//                             </button>

//                             <button
//                               style={downloadCsvButtonStyle}
//                               onClick={handleDownloadCSV}
//                               disabled={loading || !targetUser.userId}
//                               onMouseOver={(e) =>
//                                 (e.target.style.transform = "translateY(-2px)")
//                               }
//                               onMouseOut={(e) =>
//                                 (e.target.style.transform = "translateY(0)")
//                               }
//                             >
//                               📊 Download CSV
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default EquipmentStatusReport;
// FILE: src/Components/MonthlyMaintenance/EquipmentStatusReport.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import { toast } from "react-toastify";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import genexlogo from "../../assests/images/logonewgenex.png";

const MySwal = withReactContent(Swal);

// Load equipment list for userName
const fetchEquipmentList = async (userName) => {
  try {
    const res = await axios.get(`${API_URL}/api/user/${userName}`);
    console.log("response:", res.data);
    return res.data.equipment || [];
  } catch (err) {
    console.error("Error loading equipment list:", err);
    return [];
  }
};

const EquipmentStatusReport = () => {
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);
  const selectedUserId = useSelector((state) => state.selectedUser.userId);
  const { users: allUsers } = useSelector((state) => state.userLog);

  const currentUser = userData?.validUserOne;
  const isOperator = currentUser?.userType === "operator";
  const isAdmin =
    ["admin", "super_admin"].includes(currentUser?.userType) ||
    currentUser?.adminType === "EBHOOM";

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0–11

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Load users ---
  useEffect(() => {
    if (isAdmin || isOperator) {
      dispatch(fetchUsers());
    }
  }, [dispatch, isAdmin, isOperator]);

  // Resolve selected user
  const targetUser = useMemo(() => {
    if ((isAdmin || isOperator) && selectedUserId) {
      const found = allUsers.find((u) => u.userName === selectedUserId);
      if (found) {
        return {
          userName: found.userName,
          siteName: found.companyName || "Selected Site",
          userId: found._id,
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

  // 🔥 Load equipment dynamically and load saved report if exists
  useEffect(() => {
    const load = async () => {
      if (!targetUser.userName || !targetUser.userId) return;

      setLoading(true);
      try {
        // Load equipment list for this site
        const equipments = await fetchEquipmentList(targetUser.userName);

        // Convert DB equipment → table rows (MAKE EMPTY)
        const baseRows = equipments.map((eq, idx) => ({
          slNo: idx + 1,
          equipmentName: eq.equipmentName || "",
          capacity: eq.capacity || "",
          make: "",
          status: "WORKING",
          comment: "",
        }));

        // Try loading existing saved report
        const { data } = await axios.get(
          `${API_URL}/api/equipment-status/${targetUser.userId}/${year}/${
            month + 1
          }`
        );

        if (data?.entries?.length > 0) {
          setRows(
            data.entries.map((e) => ({
              slNo: e.slNo,
              equipmentName: e.equipmentName,
              capacity: e.capacity || "",
              make: e.make || "",
              status: e.status || "WORKING",
              comment: e.comment || "",
            }))
          );
        } else {
          setRows(baseRows);
        }
      } catch (err) {
        console.error("Error fetching report:", err);

        // fallback: load equipment list only
        const equipments = await fetchEquipmentList(targetUser.userName);
        setRows(
          equipments.map((eq, idx) => ({
            slNo: idx + 1,
            equipmentName: eq.equipmentName || "",
            capacity: eq.capacity || "",
            make: "",
            status: "WORKING",
            comment: "",
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [targetUser.userName, targetUser.userId, year, month]);

  // --- Field update handler ---
  const handleCellChange = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        slNo: prev.length + 1,
        equipmentName: "",
        capacity: "",
        make: "",
        status: "WORKING",
        comment: "",
      },
    ]);
  };

  // Build rows for saving
  const buildExportRows = () =>
    rows.map((r, idx) => ({
      slNo: r.slNo || idx + 1,
      equipmentName: r.equipmentName || "",
      capacity: r.capacity || "",
      make: r.make || "",
      status: r.status || "",
      comment: r.comment || "",
    }));

  // --- Save Report ---
  const handleSaveReport = async () => {
    if (!targetUser.userId) {
      toast.error("Cannot save. Select a site first.");
      return;
    }

    const entriesToSave = buildExportRows();
    setSaving(true);

    MySwal.fire({
      title: "Saving Report...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await axios.post(`${API_URL}/api/equipment-status`, {
        userId: targetUser.userId,
        userName: targetUser.userName,
        siteName: targetUser.siteName,
        year,
        month: month + 1,
        entries: entriesToSave,
      });

      MySwal.fire({
        icon: "success",
        title: "Saved Successfully",
        confirmButtonColor: "#236a80",
      });

      toast.success("Report saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save report");
      MySwal.fire({
        icon: "error",
        title: "Save Failed",
      });
    } finally {
      setSaving(false);
    }
  };

  // --- CSV ---
  const handleDownloadCSV = () => {
    if (!targetUser.userId) return toast.error("Select a site first.");
    const exportRows = buildExportRows();

    let csv = "SL.No,Equipment,Capacity,Make,Status,Comment\n";
    exportRows.forEach((r) => {
      csv += `${r.slNo},"${r.equipmentName}","${r.capacity}","${r.make}","${r.status}","${r.comment}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetUser.siteName}_${
      month + 1
    }-${year}_EquipmentStatus.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("CSV downloaded!");
  };

  // --- PDF ---
  const handleDownloadPDF = async () => {
    if (!targetUser.userId) return toast.error("Select a site first.");
    const exportRows = buildExportRows();

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      const logoImg = new Image();
      logoImg.src = genexlogo;
      await new Promise((res) => (logoImg.onload = res));

      doc.setFillColor("#236a80");
      doc.rect(0, 0, pageWidth, 35, "F");
      doc.addImage(logoImg, "PNG", 15, 5, 25, 25);

      doc.setTextColor("#fff");
      doc.setFontSize(14);
      doc.text("Equipment Status Report", pageWidth / 2 + 10, 15, {
        align: "center",
      });

      doc.setTextColor("#000");
      doc.setFontSize(10);
      doc.text(`Site: ${targetUser.siteName} (${targetUser.userName})`, 15, 45);
      doc.text(`Month: ${month + 1}/${year}`, 15, 52);

      doc.autoTable({
        startY: 58,
        head: [["SL.No", "Equipment", "Capacity", "Make", "Status", "Comment"]],
        body: exportRows.map((r) => [
          r.slNo,
          r.equipmentName,
          r.capacity,
          r.make,
          r.status,
          r.comment,
        ]),
        theme: "grid",
        headStyles: { fillColor: "#236a80", textColor: "#fff" },
        styles: { fontSize: 8 },
      });

      doc.save(
        `${targetUser.siteName}_${month + 1}_${year}_EquipmentStatus.pdf`
      );

      toast.success("PDF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("PDF failed!");
    }
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

  // Styling
  const inputStyle = {
    border: "2px dotted #3498db",
    borderRadius: "6px",
    padding: "6px",
    fontSize: "0.85rem",
    color: "#2c3e50",
  };

  const cardStyle = {
    border: "3px dotted #3498db",
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
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

          <div className="container-fluid py-4 px-4">
            <div className="row" style={{ marginTop: "0", padding: "0 68px" }}>
              <div className="col-12">
                {/* If no user selected */}
                {!targetUser.userName ? (
                  <div style={cardStyle}>
                    <h3>Please Select a User</h3>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div
                      style={{
                        background: "#236a80",
                        color: "white",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <h3 style={{ fontWeight: "bold" }}>
                        EQUIPMENT STATUS REPORT
                      </h3>
                      <div>
                        <strong>SITE:</strong> {targetUser.siteName} (
                        {targetUser.userName})<span className="mx-3">|</span>
                        <strong>MONTH:</strong> {monthNames[month]} {year}
                      </div>

                      <div className="d-flex mt-3">
                        <select
                          className="form-select me-2"
                          value={month}
                          onChange={(e) => setMonth(Number(e.target.value))}
                          style={{ ...inputStyle, backgroundColor: "white" }}
                        >
                          {monthNames.map((name, idx) => (
                            <option key={idx} value={idx}>
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

                    {/* Table */}
                    <div style={cardStyle}>
                      <div
                        style={{
                          height: "550px",
                          overflowY: "auto",
                          border: "3px dotted #236a80",
                          borderRadius: "10px",
                          padding: "10px",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        {loading && (
                          <div className="text-center mb-2">
                            Loading equipment...
                          </div>
                        )}

                        <table className="table table-hover">
                          <thead
                            style={{
                              backgroundColor: "#236a80",
                              color: "white",
                            }}
                          >
                            <tr>
                              <th>SL.No</th>
                              <th>Equipment</th>
                              <th>Capacity</th>
                              <th>Make</th>
                              <th>Status</th>
                              <th>Comment</th>
                            </tr>
                          </thead>

                          <tbody>
                            {rows.map((row, index) => (
                              <tr key={index}>
                                <td>
                                  <input
                                    type="number"
                                    value={row.slNo}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "slNo",
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      ...inputStyle,
                                      width: "60px", // ⬅️ SMALLER
                                      textAlign: "center",
                                    }}
                                  />
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    value={row.equipmentName}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "equipmentName",
                                        e.target.value
                                      )
                                    }
                                    style={inputStyle}
                                  />
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    value={row.capacity}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "capacity",
                                        e.target.value
                                      )
                                    }
                                    style={inputStyle}
                                  />
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    value={row.make}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "make",
                                        e.target.value
                                      )
                                    }
                                    style={inputStyle}
                                  />
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    value={row.status}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "status",
                                        e.target.value
                                      )
                                    }
                                    style={inputStyle}
                                  />
                                </td>

                                <td>
                                  <textarea
                                    value={row.comment}
                                    onChange={(e) =>
                                      handleCellChange(
                                        index,
                                        "comment",
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      ...inputStyle,
                                      width: "200px", // ⬅️ BIGGER COMMENT WIDTH
                                      minHeight: "50px",
                                    }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Buttons */}
                      <div className="d-flex justify-content-between mt-3">
                        <button
                          onClick={handleAddRow}
                          style={{
                            padding: "10px 24px",
                            borderRadius: "8px",
                            border: "2px dotted #27ae60",
                            backgroundColor: "#27ae60",
                            color: "white",
                            fontWeight: "600",
                          }}
                        >
                          + Add Row
                        </button>

                        <div>
                          <button
                            onClick={handleSaveReport}
                            style={{
                              padding: "10px 24px",
                              borderRadius: "8px",
                              backgroundColor: "#236a80",
                              color: "white",
                              marginRight: "10px",
                            }}
                          >
                            Save Report
                          </button>

                          <button
                            onClick={handleDownloadPDF}
                            style={{
                              padding: "10px 24px",
                              borderRadius: "8px",
                              backgroundColor: "#e74c3c",
                              color: "white",
                              marginRight: "10px",
                            }}
                          >
                            Download PDF
                          </button>

                          <button
                            onClick={handleDownloadCSV}
                            style={{
                              padding: "10px 24px",
                              borderRadius: "8px",
                              backgroundColor: "#27ae60",
                              color: "white",
                            }}
                          >
                            Download CSV
                          </button>
                        </div>
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

export default EquipmentStatusReport;
