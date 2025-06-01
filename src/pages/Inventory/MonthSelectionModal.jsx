// src/pages/MonthSelectionModal.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { API_URL } from '../../utils/apiConfig';
import { useNavigate } from 'react-router-dom';

export default function MonthSelectionModal({ onClose, reportType }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const navigate = useNavigate();

  // get adminType from Redux to fetch user list
  const { validUserOne } = useSelector((state) => state.user.userData || {});
  const adminType = validUserOne?.adminType;

  useEffect(() => {
    if (!adminType) return;

    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/get-users-by-adminType/${encodeURIComponent(adminType)}`
        );
        const data = await res.json();
        const list = data.users || [];
        setUsers(list);
        if (list.length) {
          setSelectedUser(list[0].userName);
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching user list');
      }
    })();
  }, [adminType]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (reportType === 'electrical') {
      navigate(`/report/electrical/download/${selectedUser}/${year}/${month}`);
    } else if (reportType === 'mechanical') {
      navigate(`/mechanical-report/${selectedUser}/${year}/${month}`);
    }
    onClose();
  };

  return (
    <div
      className="modal"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">Select User, Month &amp; Year</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit}>

              {/* User dropdown */}
              <div className="mb-3">
                <label htmlFor="userName" className="form-label">
                  User
                </label>
                <select
                  id="userName"
                  className="form-select"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    {users.length ? 'Select a user…' : 'Loading users…'}
                  </option>
                  {users.map((u) => (
                    <option key={u._id} value={u.userName}>
                      {u.userName} – {u.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year input */}
              <div className="mb-3">
                <label htmlFor="year" className="form-label">
                  Year
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="year"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  min="2000"
                  max="2100"
                  required
                />
              </div>

              {/* Month dropdown */}
              <div className="mb-3">
                <label htmlFor="month" className="form-label">
                  Month
                </label>
                <select
                  id="month"
                  className="form-select"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                  required
                >
                  {[...Array(12)].map((_, i) => {
                    const m = i + 1;
                    return (
                      <option key={m} value={m}>
                        {new Date(2000, i, 1).toLocaleString('default', {
                          month: 'long',
                        })}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Action buttons */}
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ backgroundColor: '#236a80', color: '#fff' }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
