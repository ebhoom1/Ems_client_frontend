import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { API_URL } from '../../utils/apiConfig';

export function AttendanceHistory() {
  const navigate = useNavigate();
  const [filterDate, setFilterDate] = useState('');
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userData } = useSelector(state => state.user);
  const adminType = userData?.validUserOne?.adminType;

  useEffect(() => {
    if (!adminType) return;
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/attendance/admin/${adminType}`,
          { credentials: 'include' }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Fetch failed');
        setAttendanceList(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [adminType]);

  if (loading) return <div className="p-4">Loading history…</div>;
  if (error)   return <div className="p-4 text-danger">Error: {error}</div>;

  // Apply date filter if set
  const filtered = filterDate
    ? attendanceList.filter(a => a.date === filterDate)
    : attendanceList;

  return (
    <div className="container mt-4">
      <button className="btn btn-link" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2>Previous Attendance</h2>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Select Date</label>
          <input
            type="date"
            className="form-control"
            value={filterDate}
            max={moment().format('YYYY-MM-DD')}
            onChange={e => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Hours</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => {
              const inTime  = moment(row.checkInTime);
              const outTime = row.checkOutTime ? moment(row.checkOutTime) : null;
              const hours   = outTime
                ? outTime.diff(inTime, 'hours', true).toFixed(2)
                : '—';

              return (
                <tr key={row._id}>
                  <td>{row.date}</td>
                  <td>{row.username}</td>
                  <td>{inTime.format('HH:mm')}</td>
                  <td>{outTime ? outTime.format('HH:mm') : '—'}</td>
                  <td>{hours}</td>
                  <td>{row.checkInMethod}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  No entries{filterDate && ' for this date'}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendanceHistory;
