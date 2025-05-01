// src/pages/MonthSelectionModal.jsx
import React, { useState } from 'react';

export default function MonthSelectionModal({ onClose, onSelect }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSelect(year, month);
  };

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Select Month and Year</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="year" className="form-label">Year</label>
                <input
                  type="number"
                  className="form-control"
                  id="year"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  min="2000"
                  max="2100"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="month" className="form-label">Month</label>
                <select
                  className="form-select"
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn" style={{backgroundColor:'#236a80' , color:'#fff'}}>
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