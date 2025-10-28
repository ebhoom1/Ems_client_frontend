// import React, { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { API_URL } from "../../utils/apiConfig";
// import { useNavigate } from "react-router-dom";
// import html2canvas from "html2canvas";
// import html2pdf from "html2pdf.js";
// import jsPDF from "jspdf";
// import "./assign.css";

// const AssignTechnician = () => {
//   const pageRef = useRef();
//   const { userData } = useSelector((state) => state.user);
//   const [users, setUsers] = useState([]);
//   const [statuses, setStatuses] = useState({});
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//   const navigate = useNavigate();

//   // Fetch Users (same logic as before)
//   const fetchUsers = useCallback(async () => {
//     try {
//       const currentUser = userData?.validUserOne;
//       if (!currentUser) return setUsers([]);

//       let response;
//       if (
//         currentUser.adminType === "EBHOOM" ||
//         currentUser.userType === "super_admin"
//       ) {
//         response = await axios.get(`${API_URL}/api/getallusers`);
//         const fetched = response.data.users || [];
//         const filtered = fetched.filter(
//           (u) => !u.isTechnician && !u.isTerritorialManager && !u.isOperator
//         );
//         setUsers(filtered);
//       } else if (currentUser.userType === "admin") {
//         const res = await axios.get(
//           `${API_URL}/api/get-users-by-creator/${currentUser._id}`
//         );
//         const fetched = res.data.users || [];
//         setUsers(fetched.filter((u) => u.userType === "user"));
//       } else {
//         setUsers([]);
//       }
//     } catch (err) {
//       console.error("User fetch failed:", err);
//       setUsers([]);
//     }
//   }, [userData]);

//   //🟢Fetch Summary for All Reports (auto-status logic)
//   const fetchSummary = async () => {
//     try {
//       const res = await axios.get(
//         `${API_URL}/api/summary/${selectedMonth + 1}/${selectedYear}`
//       );
//       const data = res.data.summary || {};
//       console.log("response:", data);
//       const updated = {};

//       users.forEach((u) => {
//         const name = u.userName || u.companyName || u.customerName;
//         const info = data[name] || {};
//         console.log("info:", info);
//         updated[u._id] = {
//           EPM: { status: info.EPM ? "Completed" : "Pending" },
//           MPM: { status: info.MPM ? "Completed" : "Pending" },
//           Service: { status: info.Service ? "Completed" : "Pending" },
//           Safety: { status: info.Safety ? "Completed" : "Pending" },
//           selectedVisits: Array.from(
//             { length: Number(info.EngineerVisits) || 0 },
//             (_, i) => i + 1
//           ),
//           totalVisits: u.engineerVisitNo || 0,
//         };
//       });

//       setStatuses(updated);
//     } catch (err) {
//       console.error("Summary fetch failed:", err);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   useEffect(() => {
//     if (users.length > 0) fetchSummary();
//   }, [users, selectedMonth, selectedYear]);

//   const handleDownloadPDF = async () => {
//     try {
//       const element = pageRef.current;

//       const options = {
//         margin: [5, 5, 5, 5], // reduce side margins to widen content
//         filename: "User_Assignments.pdf",
//         image: { type: "jpeg", quality: 1 },
//         html2canvas: {
//           scale: 3, // higher resolution
//           useCORS: true,
//           scrollX: 0,
//           scrollY: 0,
//           windowWidth: document.documentElement.scrollWidth * 1.5, // widen capture width
//           windowHeight: document.documentElement.scrollHeight,
//         },
//         jsPDF: {
//           unit: "mm",
//           format: "a4",
//           orientation: "landscape", // use landscape for wider layout
//         },
//         pagebreak: {
//           mode: ["avoid-all", "css", "legacy"],
//         },
//       };

//       await html2pdf().set(options).from(element).save();
//     } catch (err) {
//       console.error("❌ PDF generation failed:", err);
//     }
//   };

//   const handleMonthChange = (e) =>
//     setSelectedMonth(parseInt(e.target.value) - 1);
//   const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value));

//   const renderCell = (userId, type) => {
//     const current = statuses[userId]?.[type]?.status || "Pending";
//     const isCompleted = current === "Completed";
//     return (
//       <td className="text-center">
//         <span
//           className={`badge ${
//             isCompleted ? "bg-success" : "bg-warning text-dark"
//           }`}
//           style={{ fontSize: "0.85rem" }}
//         >
//           {isCompleted ? "Completed" : "Pending"}
//         </span>
//       </td>
//     );
//   };

//   const renderEngineerVisits = (userId) => {
//     const total = statuses[userId]?.totalVisits || 0;
//     const completed = statuses[userId]?.selectedVisits || [];
//     return (
//       <td>
//         {total > 0 ? (
//           <div className="d-flex flex-wrap gap-2">
//             {[...Array(total)].map((_, idx) => {
//               const visitNum = idx + 1;
//               const isSelected = completed.includes(visitNum);
//               return (
//                 <div
//                   key={visitNum}
//                   style={{
//                     width: "35px",
//                     height: "25px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     backgroundColor: isSelected ? "#035c18ff" : "#b10617ff",
//                     color: "white",
//                     fontWeight: "700",
//                     fontSize: "0.8rem",
//                     borderRadius: "5px",
//                     userSelect: "none",
//                     transition: "all 0.2s ease-in-out",
//                   }}
//                 >
//                   {visitNum}
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <span className="text-muted"></span>
//         )}
//       </td>
//     );
//   };

//   return (
//     <div className="container mt-2">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <button onClick={() => navigate("/water")} className="btn btn-success">
//           Back
//         </button>
//         <button onClick={handleDownloadPDF} className="btn btn-secondary">
//           📄 Download
//         </button>
//       </div>

//       <div ref={pageRef}>
//         <h3
//           style={{
//             textAlign: "center",
//             fontSize: "4rem",
//             fontWeight: "900",
//             color: "rgba(0, 0, 0, 0.2)",
//             textTransform: "uppercase",
//           }}
//         >
//           User Assignment
//         </h3>

//         {/* Month-Year Filters */}
//         <div className="d-flex gap-2 justify-content-end mb-3">
//           <select
//             className="form-select"
//             style={{ width: "auto" }}
//             value={selectedMonth + 1}
//             onChange={handleMonthChange}
//           >
//             <option value="">Month</option>
//             {[
//               "Jan",
//               "Feb",
//               "Mar",
//               "Apr",
//               "May",
//               "Jun",
//               "Jul",
//               "Aug",
//               "Sep",
//               "Oct",
//               "Nov",
//               "Dec",
//             ].map((m, i) => (
//               <option key={i} value={i + 1}>
//                 {m}
//               </option>
//             ))}
//           </select>

//           <select
//             className="form-select"
//             style={{ width: "auto" }}
//             value={selectedYear}
//             onChange={handleYearChange}
//           >
//             {Array.from({ length: 10 }, (_, i) => {
//               const year = new Date().getFullYear() - i;
//               return (
//                 <option key={year} value={year}>
//                   {year}
//                 </option>
//               );
//             })}
//           </select>
//         </div>

//         {/* Table */}
//         <table className="table table-bordered">
//           <thead>
//             <tr>
//               <th style={{ backgroundColor: "#236a80", color: "white" }}>
//                 User
//               </th>
//               <th style={{ backgroundColor: "#236a80", color: "white" }}>
//                 EPM
//               </th>
//               <th style={{ backgroundColor: "#236a80", color: "white" }}>
//                 MPM
//               </th>
//               <th style={{ backgroundColor: "#236a80", color: "white" }}>
//                 Service
//               </th>
//               <th style={{ backgroundColor: "#236a80", color: "white" }}>
//                 Safety
//               </th>
//               <th style={{ backgroundColor: "#236a80", color: "white" }}>
//                 Engineer Visit Count
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {users.map((u) => (
//               <tr key={u._id}>
//                 <td>{u.companyName || u.userName}</td>
//                 {renderCell(u._id, "EPM")}
//                 {renderCell(u._id, "MPM")}
//                 {renderCell(u._id, "Service")}
//                 {renderCell(u._id, "Safety")}
//                 {renderEngineerVisits(u._id)}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AssignTechnician;

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import "./assign.css";
import { Modal, Spinner } from "react-bootstrap";
import EngineerVisitReportModal from "./EngineerVisitReportModal";

const AssignTechnician = () => {
  const pageRef = useRef();
  const { userData } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [modalShow, setModalShow] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(""); // ✅ add this line
  const [loadingReport, setLoadingReport] = useState(false);
  const reportRef = useRef();
  const navigate = useNavigate();

  // Fetch Users (same logic as before)
  const fetchUsers = useCallback(async () => {
    try {
      const currentUser = userData?.validUserOne;
      if (!currentUser) return setUsers([]);

      let response;
      if (
        currentUser.adminType === "EBHOOM" ||
        currentUser.userType === "super_admin"
      ) {
        response = await axios.get(`${API_URL}/api/getallusers`);
        const fetched = response.data.users || [];
        const filtered = fetched.filter(
          (u) => !u.isTechnician && !u.isTerritorialManager && !u.isOperator
        );
        setUsers(filtered);
      } else if (currentUser.userType === "admin") {
        const res = await axios.get(
          `${API_URL}/api/get-users-by-creator/${currentUser._id}`
        );
        const fetched = res.data.users || [];
        setUsers(fetched.filter((u) => u.userType === "user"));
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("User fetch failed:", err);
      setUsers([]);
    }
  }, [userData]);

  //🟢Fetch Summary for All Reports (auto-status logic)
  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/summary/${selectedMonth + 1}/${selectedYear}`
      );
      const data = res.data.summary || {};
      console.log("response:", data);
      const updated = {};

      users.forEach((u) => {
        const name = u.userName || u.companyName || u.customerName;
        const info = data[name] || {};
        console.log("info:", info);
        updated[u._id] = {
          EPM: { status: info.EPM ? "Completed" : "Pending" },
          MPM: { status: info.MPM ? "Completed" : "Pending" },
          Service: { status: info.Service ? "Completed" : "Pending" },
          Safety: { status: info.Safety ? "Completed" : "Pending" },
          selectedVisits: Array.from(
            { length: Number(info.EngineerVisits) || 0 },
            (_, i) => i + 1
          ),
          totalVisits: u.engineerVisitNo || 0,
        };
      });

      setStatuses(updated);
    } catch (err) {
      console.error("Summary fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (users.length > 0) fetchSummary();
  }, [users, selectedMonth, selectedYear]);

  const handleDownloadPDF = async () => {
    try {
      const element = pageRef.current;

      const options = {
        margin: [5, 5, 5, 5], // reduce side margins to widen content
        filename: "User_Assignments.pdf",
        image: { type: "jpeg", quality: 1 },
        html2canvas: {
          scale: 3, // higher resolution
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.scrollWidth * 1.5, // widen capture width
          windowHeight: document.documentElement.scrollHeight,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape", // use landscape for wider layout
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
      };

      await html2pdf().set(options).from(element).save();
    } catch (err) {
      console.error("❌ PDF generation failed:", err);
    }
  };

  const fetchEngineerReport = async (userName, reportIndex) => {
    try {
      console.log("userName:",userName);
      setSelectedUserName(userName); // ✅ add this line
      setLoadingReport(true);
      setModalShow(true);

      const { data } = await axios.get(
        `${API_URL}/api/engineerreport/user/${encodeURIComponent(
          userName
        )}/${selectedYear}/${selectedMonth + 1}`
      );
console.log("reports:",data.reports);
      if (data.success && data.reports?.length) {
        setSelectedReport(data.reports[reportIndex] || data.reports[0]);
      } else {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      setSelectedReport(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleMonthChange = (e) =>
    setSelectedMonth(parseInt(e.target.value) - 1);
  const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value));

  const renderCell = (userId, type) => {
    const current = statuses[userId]?.[type]?.status || "Pending";
    const isCompleted = current === "Completed";
    return (
      <td className="text-center">
        <span
          className={`badge ${
            isCompleted ? "bg-success" : "bg-warning text-dark"
          }`}
          style={{ fontSize: "0.85rem" }}
        >
          {isCompleted ? "Completed" : "Pending"}
        </span>
      </td>
    );
  };

  const renderEngineerVisits = (userId) => {
    const total = statuses[userId]?.totalVisits || 0;
    const completed = statuses[userId]?.selectedVisits || [];
    const user = users.find((u) => u._id === userId);
    const userName =  user?.userName;

    return (
      <td>
        {total > 0 ? (
          <div className="d-flex flex-wrap gap-2">
            {[...Array(total)].map((_, idx) => {
              const visitNum = idx + 1;
              const isSelected = completed.includes(visitNum);

              return (
                <div
                  key={visitNum}
                  onClick={() =>
                    isSelected && fetchEngineerReport(userName, idx)
                  }
                  style={{
                    width: "35px",
                    height: "25px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected ? "#035c18ff" : "#b10617ff",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "0.8rem",
                    borderRadius: "5px",
                    cursor: isSelected ? "pointer" : "default",
                    opacity: isSelected ? 1 : 0.6,
                    userSelect: "none",
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {visitNum}
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-muted"></span>
        )}
      </td>
    );
  };

  return (
    <div className="container mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button onClick={() => navigate("/water")} className="btn btn-success">
          Back
        </button>
        <button onClick={handleDownloadPDF} className="btn btn-secondary">
          📄 Download
        </button>
      </div>

      <div ref={pageRef}>
        <h3
          style={{
            textAlign: "center",
            fontSize: "4rem",
            fontWeight: "900",
            color: "rgba(0, 0, 0, 0.2)",
            textTransform: "uppercase",
          }}
        >
          User Assignment
        </h3>

        {/* Month-Year Filters */}
        <div className="d-flex gap-2 justify-content-end mb-3">
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={selectedMonth + 1}
            onChange={handleMonthChange}
          >
            <option value="">Month</option>
            {[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ].map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: "auto" }}
            value={selectedYear}
            onChange={handleYearChange}
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        {/* Table */}
        <table className="table table-bordered">
          <thead>
            <tr>
              <th style={{ backgroundColor: "#236a80", color: "white" }}>
                User
              </th>
              <th style={{ backgroundColor: "#236a80", color: "white" }}>
                EPM
              </th>
              <th style={{ backgroundColor: "#236a80", color: "white" }}>
                MPM
              </th>
              <th style={{ backgroundColor: "#236a80", color: "white" }}>
                Service
              </th>
              <th style={{ backgroundColor: "#236a80", color: "white" }}>
                Safety
              </th>
              <th style={{ backgroundColor: "#236a80", color: "white" }}>
                Engineer Visit Count
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.companyName || u.userName}</td>
                {renderCell(u._id, "EPM")}
                {renderCell(u._id, "MPM")}
                {renderCell(u._id, "Service")}
                {renderCell(u._id, "Safety")}
                {renderEngineerVisits(u._id)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalShow && (
        <EngineerVisitReportModal
          show={modalShow}
          handleClose={() => setModalShow(false)}
          report={selectedReport}
          userName={selectedUserName}
          year={selectedYear}
          month={selectedMonth + 1}
        />
      )}
    </div>
  );
};

export default AssignTechnician;
