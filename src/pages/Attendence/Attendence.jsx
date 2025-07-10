// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DashboardSam from '../Dashboard/DashboardSam';
// import HeaderSim from '../Header/HeaderSim';
// import { useSelector } from 'react-redux';
// import moment from 'moment';
// import { API_URL } from '../../utils/apiConfig';

// export function Attendence() {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [attendanceList, setAttendanceList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const { userData } = useSelector(state => state.user);
//   const adminType = userData?.validUserOne?.adminType;

//   useEffect(() => {
//     if (!adminType) return;
//     const fetchAttendance = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `${API_URL}/api/attendance/admin/${adminType}`,
//           { credentials: 'include' }
//         );
//         const json = await res.json();
//         if (!res.ok) throw new Error(json.message || 'Fetch failed');
//         setAttendanceList(json.data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAttendance();
//   }, [adminType]);

//   if (loading) return <div className="p-4">Loading attendance…</div>;
//   if (error)   return <div className="p-4 text-danger">Error: {error}</div>;

//   // Filter down to today’s entries
//   const today = moment().format('YYYY-MM-DD');
//   const todayList = attendanceList.filter(item => item.date === today);

//   // Then apply the search
//   const displayedList = todayList.filter(item =>
//     item.username.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="container-fluid">
//       <div className="row" style={{ backgroundColor: 'white' }}>
//         <div className="col-lg-3 d-none d-lg-block">
//           <DashboardSam />
//         </div>
//         <div className="col-lg-9 col-12">
//           <HeaderSim />

//           <div className="row mt-4">
//             <div className="col-12 d-flex justify-content-between align-items-center">
//               <h2>Today's Attendance</h2>
//               <div>
//                 <input
//                   type="text"
//                   placeholder="Search by name"
//                   className="form-control d-inline-block me-2"
//                   style={{ width: '200px' }}
//                   value={searchTerm}
//                   onChange={e => setSearchTerm(e.target.value)}
//                 />
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => navigate('history')}
//                 >
//                   View History
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="row mt-4">
//             <div className="col-12 table-responsive">
//               <table className="table table-bordered table-striped">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Check-In</th>
//                     <th>Check-Out</th>
//                     <th>Hours</th>
//                     <th>Method</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {displayedList.map(row => {
//                     const inTime  = moment(row.checkInTime);
//                     const outTime = row.checkOutTime ? moment(row.checkOutTime) : null;
//                     const hours   = outTime
//                       ? outTime.diff(inTime, 'hours', true).toFixed(2)
//                       : '—';

//                     return (
//                       <tr key={row._id}>
//                         <td>{row.username}</td>
//                         <td>{inTime.format('HH:mm')}</td>
//                         <td>{outTime ? outTime.format('HH:mm') : '—'}</td>
//                         <td>{hours}</td>
//                         <td>{row.checkInMethod}</td>
//                       </tr>
//                     );
//                   })}
//                   {displayedList.length === 0 && (
//                     <tr>
//                       <td colSpan="5" className="text-center">
//                         No records for today.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// export default Attendence;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSam from "../Dashboard/DashboardSam";
import HeaderSim from "../Header/HeaderSim";
import { useSelector } from "react-redux";
import moment from "moment";
import { API_URL } from "../../utils/apiConfig";
import { useDispatch } from "react-redux";
// import { fetchUsers } from "../../redux/slices/user/userLogSlice";
import {fetchUsers} from "../../redux/features/userLog/userLogSlice";


export default function Attendence() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("operator");
  const [modalImage, setModalImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();
const { users } = useSelector((state) => state.userLog); // 👈 get all users


  const { userData } = useSelector((state) => state.user);
  const adminType = userData?.validUserOne?.adminType;

  useEffect(() => {
    if (!adminType) return;

    dispatch(fetchUsers());

    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/attendance/admin/${adminType}`,
          {
            credentials: "include",
          }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Fetch failed");
        setAttendanceList(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [adminType]);

  if (loading) return <div className="p-4">Loading attendance…</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  const today = moment().format("YYYY-MM-DD");
  const filteredList = attendanceList.filter(
    (item) => item.date === today && item.userRole === activeTab
  );

  const displayedList = filteredList.filter((item) =>
    item.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserFname = (username) => {
    const user = users.find((u) => u.userName === username);
    return user?.fname || username; // fallback to username if fname missing
  };

  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: "white" }}>
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>

        <div className="col-lg-9 col-12">
          <HeaderSim />

          <div className="row mt-4">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <h2>Today's Attendance</h2>
              <div>
                <input
                  type="text"
                  placeholder="Search by name"
                  className="form-control d-inline-block me-2"
                  style={{ width: "200px", fontSize: "15px" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className="btn "
                  style={{ backgroundColor: "#236a80", color: "#fff" }}
                  onClick={() => navigate("history")}
                >
                  View History
                </button>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="mt-3">
            <ul className="nav nav-tabs">
              {["operator", "technician", "territorialManager"].map((role) => (
                <li className="nav-item" key={role}>
                  <button
                    className={`nav-link ${activeTab === role ? "active" : ""}`}
                    onClick={() => setActiveTab(role)}
                    style={{
                      color: activeTab === role ? "#236a80" : "#000",
                      fontWeight: activeTab === role ? "bold" : "normal",
                    }}
                  >
                    {role.charAt(0).toUpperCase() +
                      role.slice(1).replace("Manager", " Manager")}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* TABLE */}
          <div className="row mt-4">
            <div className="col-12 table-responsive">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Name
                    </th>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Check-In
                    </th>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Check-Out
                    </th>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Hours
                    </th>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Method
                    </th>
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                      Photo
                    </th>
                    {displayedList.some((row) =>
                      ["technician", "territorialManager"].includes(
                        row.userRole
                      )
                    ) && <th>Map</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayedList.map((row) => {
                    const inTime = moment(row.checkInTime);
                    const outTime = row.checkOutTime
                      ? moment(row.checkOutTime)
                      : null;
                    const hours = outTime
                      ? outTime.diff(inTime, "hours", true).toFixed(2)
                      : "—";

                    return (
                      <tr key={row._id}>
                       <td>{getUserFname(row.username)}</td>
                        <td>{inTime.format("HH:mm")}</td>
                        <td>{outTime ? outTime.format("HH:mm") : "—"}</td>
                        <td>{hours}</td>
                        <td>{row.checkInMethod}</td>
                        <td>
                          {row.photoBase64 ? (
                            <img
                              src={row.photoBase64}
                              alt="Site"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setModalImage(row.photoBase64);
                                setShowModal(true);
                              }}
                            />
                          ) : (
                            "—"
                          )}
                        </td>

                        {["technician", "territorialManager"].includes(
                          row.userRole
                        ) && (
                          <td>
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() =>
                                navigate("/view-map", {
                                  state: {
                                    username: row.username,
                                    companyName: row.companyName,
                                    latitude: row.latitude,
                                    longitude: row.longitude,
                                    userRole: row.userRole,
                                  },
                                })
                              }
                            >
                              View Map
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}

                  {displayedList.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No records for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowModal(false)} // close on click outside
        >
          <img
            src={modalImage}
            alt="Full View"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              boxShadow: "0 0 10px #fff",
              borderRadius: "10px",
            }}
            onClick={(e) => e.stopPropagation()} // prevent closing on image click
          />
        </div>
      )}
    </div>
  );
}
