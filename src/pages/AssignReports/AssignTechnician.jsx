import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";
import { useNavigate } from "react-router-dom";

const AssignTechnician = () => {
  const { userData } = useSelector((state) => state.user);
  console.log("userData:", userData?.validUserOne?._id);
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [territoryManagers, setTerritoryManagers] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null); // State to manage which dropdown is open
  // State for date selection
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const navigate = useNavigate();
  // Statuses are now nested by year and month
  const fetchUsers = useCallback(async () => {
    try {
      const currentUser = userData?.validUserOne;
      if (!currentUser) {
        setUsers([]);
        return;
      }

      let response;
      if (
        currentUser.adminType === "EBHOOM" ||
        currentUser.userType === "super_admin"
      ) {
        response = await axios.get(`${API_URL}/api/getallusers`);
        const fetchedUsers = response.data.users || [];
        const filtered = fetchedUsers.filter(
          (user) =>
            user.isTechnician !== true &&
            user.isTerritorialManager !== true &&
            user.isOperator !== true
        );
        setUsers(filtered);
      } else if (currentUser.userType === "admin") {
        const url = `${API_URL}/api/get-users-by-creator/${currentUser._id}`;
        response = await axios.get(url);
        const fetchedUsers = response.data.users || [];
        const myUsers = fetchedUsers.filter((user) => user.userType === "user");
        setUsers(myUsers);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  }, [userData]);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/assignments?month=${selectedMonth + 1}&year=${selectedYear}`
      );
  
      const assignmentData = res.data.data || [];
  
      const newStatuses = {};
  
      assignmentData.forEach((a) => {
        if (!newStatuses[a.userId]) {
          newStatuses[a.userId] = {};
        }
        newStatuses[a.userId][a.type] = {
          status: a.status,
          assignedToId: a.assignedToId,
          assignedToName: a.assignedToName,
        };
      });
  
      setStatuses(newStatuses);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    }
  };
  
  const fetchCompletionStatuses = async () => {
    const results = {};
    await Promise.all(
      users.map(async (user) => {
        const types = ["EPM", "MPM"];
        for (const type of types) {
          try {
            const res = await axios.get(
              `${API_URL}/api/assignments/completion-status/${
                user._id
              }/${type}/${selectedMonth + 1}/${selectedYear}`
            );
            if (res.data.completed) {
              results[`${user._id}-${type}`] = true;
            }
          } catch (err) {
            console.error("Status fetch error", err);
          }
        }
      })
    );

    // Mark statuses as completed
    setStatuses((prev) => {
      const updated = { ...prev };
      for (const key in results) {
        const [userId, type] = key.split("-");
        if (updated[userId] && updated[userId][type]) {
          updated[userId][type].status = "Completed";
        }
      }
      return updated;
    });
  };

  const fetchTechnicians = async () => {
    const res = await axios.get(`${API_URL}/api/getAll-technicians`);
    const techList = res.data.users || [];
    setTechnicians(techList);
  };

  const fetchTerritoryManagers = async () => {
    const res = await axios.get(`${API_URL}/api/getAll-territory-managers`);
    const mgrList = res.data.users || [];
    setTerritoryManagers(mgrList);
  };

  useEffect(() => {
    fetchUsers();
    fetchTechnicians();
    fetchTerritoryManagers();
    fetchAssignments();
  }, [fetchUsers]);

  useEffect(() => {
    if (users.length > 0) {
      fetchCompletionStatuses();
    }
  }, [users, selectedMonth, selectedYear]);

  const handleAssign = async (userId, type, assignedToId, list) => {
    const person = list.find((item) => item._id === assignedToId);
    if (!person) return;

    const payload = {
      userId,
      type,
      assignedToId,
      assignedToName: person.fname,
      assignedBy: userData?.validUserOne?._id, // current logged in user
      assignedByName: userData?.validUserOne?.fname, // optional
      year: selectedYear,
      month: selectedMonth + 1,
    };

    try {
      const res = await axios.post(`${API_URL}/api/assign`, payload);
      console.log("handle assign response:", res.data);
      setStatuses((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [type]: {
            status: "Assigned",
            assignedToId: person._id,
            assignedToName: person.fname,
          },
        },
      }));
      setOpenDropdown(null);
    } catch (err) {
      console.error("Assignment failed:", err);
    }
  };

  
  const toggleDropdown = (userId, type) => {
    const dropdownId = `${userId}-${type}`;
    if (openDropdown === dropdownId) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(dropdownId);
    }
  };

  const renderStatusCell = (userId, type, list) => {
    const current = statuses[userId]?.[type] || {
      status: "Pending",
      assignedToId: "",
      assignedToName: "",
    };

    const commonButtonStyle = {
      borderRadius: "5px",
    };

    const dropdownId = `${userId}-${type}`;

    return (
      <td>
        {/* PENDING STATE */}
        {current.status === "Pending" && (
          <div className="dropdown">
            <button
              className="btn btn-warning btn-sm dropdown-toggle"
              style={commonButtonStyle}
              onClick={() => toggleDropdown(userId, type)}
            >
              Pending
            </button>
            {openDropdown === dropdownId && (
              <div
                className="dropdown-menu d-block"
                style={{ position: "absolute" }}
              >
                {list.map((item) => (
                  <a
                    key={item._id}
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAssign(userId, type, item._id, list);
                    }}
                  >
                    {item.fname}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ASSIGNED STATE */}
        {current.status === "Assigned" && (
          <div className="d-flex align-items-center">
            <button
              className="btn btn-primary btn-sm"
              style={commonButtonStyle}
              disabled
            >
              Assigned: {current.assignedToName}
            </button>
           
          </div>
        )}

        {/* COMPLETED STATE */}
        {current.status === "Completed" && (
          <button
            className="btn btn-success btn-sm"
            style={commonButtonStyle}
            disabled
          >
            ✅Completed
          </button>
        )}
      </td>
    );
  };

  return (
    <div className="container mt-2">
      <button onClick={() => navigate("/water")} className="btn btn-success">
        Back
      </button>
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
      <div
        className="d-flex gap-2 align-items-center justify-content-end mb-2"
        style={{ marginLeft: "1rem" }}
      >
        <select className="form-select" style={{ width: "auto" }}>
          <option value="">Month</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>

        <select className="form-select" style={{ width: "auto" }}>
          <option value="">Year</option>
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

      <table className="table table-bordered">
        <thead>
          <tr>
            <th style={{ backgroundColor: "#236a80", color: "white" }}>User</th>
            <th style={{ backgroundColor: "#236a80", color: "white" }}>EPM</th>
            <th style={{ backgroundColor: "#236a80", color: "white" }}>MPM</th>
            <th style={{ backgroundColor: "#236a80", color: "white" }}>
              Service Report
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.companyName}</td>
              {renderStatusCell(user._id, "EPM", technicians)}
              {renderStatusCell(user._id, "MPM", territoryManagers)}
              {renderStatusCell(user._id, "Service", technicians)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignTechnician;
