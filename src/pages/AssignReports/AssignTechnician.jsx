import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";

const AssignTechnician = () => {
  const { userData } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [territoryManagers, setTerritoryManagers] = useState([]);
  const [statuses, setStatuses] = useState({});

  const fetchUsers = useCallback(async () => {
    try {
      const currentUser = userData?.validUserOne;
      if (!currentUser) {
        setUsers([]);
        return;
      }

      let response;
      if (currentUser.adminType === "EBHOOM" || currentUser.userType === "super_admin") {
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

const fetchTechnicians = async () => {
  const res = await axios.get(`${API_URL}/api/getAll-technicians`);
  console.log("Technicians API response:", res.data);
  const techList = res.data.users || [];
  setTechnicians(techList);
};


 const fetchTerritoryManagers = async () => {
  const res = await axios.get(`${API_URL}/api/getAll-territory-managers`);
  console.log('territory manaager',res);
  
  const mgrList = res.data.users || []; // adjust key if needed
  setTerritoryManagers(mgrList);
};

  useEffect(() => {
    fetchUsers();
    fetchTechnicians();
    fetchTerritoryManagers();
  }, [fetchUsers]);

  const handleAssign = (userId, type, assignedTo) => {
    setStatuses((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [type]: { status: "Assigned", assignedTo }
      },
    }));
  };

  const handleComplete = (userId, type) => {
    setStatuses((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [type]: { ...prev[userId]?.[type], status: "Completed" },
      },
    }));
  };

  const renderStatusCell = (userId, type, list) => {
    const current = statuses[userId]?.[type] || { status: "Pending", assignedTo: "" };

    return (
      <td>
        {current.status === "Pending" && (
          <div>
            <select
              onChange={(e) =>
                handleAssign(userId, type, e.target.value)
              }
              defaultValue=""
            >
              <option value="" disabled>Select {type}</option>
              {list.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.userName}
                </option>
              ))}
            </select>
          </div>
        )}

        {current.status === "Assigned" && (
          <div>
            Assigned to: {current.assignedTo}{" "}
            <button onClick={() => handleComplete(userId, type)}>✅ Complete</button>
          </div>
        )}

        {current.status === "Completed" && <div>✅ Completed</div>}
      </td>
    );
  };

  return (
    <div className="container mt-4">
      <h3>User Assignment Table</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>User</th>
            <th>EPM</th>
            <th>MPM</th>
            <th>Service Report</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.userName}</td>
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
