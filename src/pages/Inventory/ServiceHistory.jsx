import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { useSelector } from "react-redux";

const ServiceHistory = () => {
  const { userData } = useSelector(s => s.user);
  const [faults, setFaults] = useState([]);

  useEffect(() => {
    const fetchFaults = async () => {
      try {
        let url = `${API_URL}/api/all-faults`;
        if (userData?.validUserOne?.userType !== "admin") {
          url = `${API_URL}/api/fault-user/${userData.validUserOne.userName}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        const arr = data.faults || [];
        setFaults(arr);
      } catch {
        toast.error("Error fetching service history");
      }
    };
    fetchFaults();
  }, [userData]);

  return (
    <div className="card">
      <div className="card-body">
        {faults.length===0 ? <p>No service history available.</p> : (
          <table className="table table-striped">
            <thead><tr><th>Equipment</th><th>By</th><th>Description</th><th>Reported</th><th>Status</th><th>Service Date</th><th>Tech</th><th>Details</th></tr></thead>
            <tbody>
              {faults.map(f => (
                <tr key={f._id}>
                  <td>{f.equipmentName}</td>
                  <td>{f.userName}</td>
                  <td>{f.faultDescription}</td>
                  <td>{new Date(f.reportedDate).toLocaleDateString()}</td>
                  <td><span className={`badge ${f.status==='Serviced'?'bg-success':'bg-warning'}`}>{f.status}</span></td>
                  <td>{f.serviceDate?new Date(f.serviceDate).toLocaleDateString():"N/A"}</td>
                  <td>{f.technicianName||"N/A"}</td>
                  <td>{f.serviceDetails||"N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ServiceHistory;
