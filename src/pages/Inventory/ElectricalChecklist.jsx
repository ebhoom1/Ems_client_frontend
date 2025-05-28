// src/components/ElectricalChecklist.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import { color } from '@mui/system';

export default function ElectricalChecklist({
  equipment = {},
  equipmentId,
  powerFactor = 0.8
}) {
  // --- Technician state & handlers ---
  const [technician, setTechnician] = useState(null);
  const [editingTech, setEditingTech] = useState(false);
  const [techForm, setTechForm] = useState({
    name: '',
    designation: '',
    email: ''
  });

  useEffect(() => {
    // Fetch the one-and-only technician record on mount
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/technician`);
        if (data.success && data.technician) {
          setTechnician(data.technician);
        }
      } catch (err) {
        console.error('Failed to fetch technician', err);
      }
    })();
  }, []);

  const startEditTech = () => {
    setTechForm({
      name: technician?.name || '',
      designation: technician?.designation || '',
      email: technician?.email || ''
    });
    setEditingTech(true);
  };
  const cancelEditTech = () => setEditingTech(false);

  const saveTech = async () => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/technician`,
        techForm
      );
      if (data.success) {
        setTechnician(data.technician);
        setEditingTech(false);
      }
    } catch (err) {
      console.error('Failed to save technician', err);
      alert('Could not save technician details.');
    }
  };

  // --- Checklist state & handlers ---
  const checklistItems = [
    { id: 1, label: 'Voltage (V)', type: 'measurement', actualKey: 'voltage' },
    { id: 2, label: 'Current (A)', type: 'measurement', actualKey: 'current' },
    { id: 3, label: 'Power (kW)', type: 'measurement', actualKey: 'power' },
    { id: 4, label: 'Check starter controls and connection', type: 'remark' },
    { id: 5, label: 'Check contractor for free movement operation and take services if needed', type: 'remark' },
    { id: 6, label: 'Check OLR condition and note the ampere set', type: 'remark' },
    { id: 7, label: 'Check earthing', type: 'remark' },
    { id: 8, label: 'Examine for any exposed cables, cable joint and bus bars', type: 'remark' },
  ];
  const phases = ['RY','YB','BR'];

  const [responses, setResponses] = useState(() =>
    checklistItems.reduce((acc, item) => {
      if (item.type === 'measurement') {
        acc[item.id] = {
          actual: equipment[item.actualKey] ?? '',
          RY: '',
          YB: '',
          BR: '',
          remark: ''
        };
      } else {
        acc[item.id] = { remark: '' };
      }
      return acc;
    }, {})
  );

  // Auto-calc power when voltage & current are filled
  useEffect(() => {
    const v = responses[1], i = responses[2];
    if (phases.every(p => v[p] && i[p])) {
      const newP = {};
      phases.forEach(p => {
        const V = parseFloat(v[p]), I = parseFloat(i[p]);
        newP[p] = (Math.sqrt(3) * V * I * powerFactor / 1000).toFixed(6);
      });
      setResponses(prev => ({
        ...prev,
        3: { ...prev[3], ...newP }
      }));
    }
  }, [responses[1], responses[2], powerFactor]);

  const onActualChange = (id, value) =>
    setResponses(prev => ({
      ...prev,
      [id]: { ...prev[id], actual: value }
    }));
  const onMeasChange = (id, phase, value) =>
    setResponses(prev => ({
      ...prev,
      [id]: { ...prev[id], [phase]: value }
    }));
  const onRemarkChange = (id, text) =>
    setResponses(prev => ({
      ...prev,
      [id]: { ...prev[id], remark: text }
    }));

  // --- Submit handler includes technician info ---
  const onSubmit = async e => {
    e.preventDefault();
    if (!technician) {
      alert('Please enter technician details first.');
      return;
    }
    try {
      const payload = {
        equipmentId,
        technician,
        equipment,
        responses
      };
      await axios.post(`${API_URL}/api/add-electricalreport`, payload);
      alert('Electrical report saved successfully!');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save report. Please try again.');
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Technician section */}
      <div className='shadow' style={{ marginBottom: 20, padding: 10, border: '1px solid #ccc' , borderRadius:'10px' }}>
        {!editingTech && technician ? (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <strong>Technician:</strong> {technician.name} — {technician.designation} (<a href={`mailto:${technician.email}`}>{technician.email}</a>)
            </div>
            <button className='btn' style={{backgroundColor:'#236a80' , color:'#fff'}} type="button" onClick={startEditTech}>Change</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <input
              type="text"
              placeholder="Name"
              value={techForm.name}
              onChange={e => setTechForm(f => ({ ...f, name: e.target.value }))}
              style={{
                padding: "5px",
                borderRadius: "10px",
                border: "2px solid #236a80"
              }}
                          />
            <input
              type="text"
              placeholder="Designation"
              value={techForm.designation}
              onChange={e => setTechForm(f => ({ ...f, designation: e.target.value }))}
              style={{
                padding: "5px",
                borderRadius: "10px",
                border: "2px solid #236a80"
              }}
            />
            <input
              type="email"
              placeholder="Email"
              value={techForm.email}
              onChange={e => setTechForm(f => ({ ...f, email: e.target.value }))}
              style={{
                padding: "5px",
                borderRadius: "10px",
                border: "2px solid #236a80"
              }}
            />
            <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
              <button className='btn btn-danger' type="button" onClick={cancelEditTech} style={{ marginRight: 8 }}>Cancel</button>
              <button className='btn btn-success'  type="button" onClick={saveTech}>Save</button>
            </div>
          </div>
        )}
      </div>

      {/* Equipment & Checklist */}
      <h2 style={{ textAlign: 'center' }}>Electrical Report</h2>
      <div style={{ marginBottom: 16 }}>
        <strong>Equipment:</strong> {equipment?.name || '—'}<br/>
        <strong>Model:</strong>     {equipment?.model || '—'}<br/>
        <strong>Capacity:</strong>  {equipment?.capacity || '—'}<br/>
        <strong>Rated Load:</strong>{equipment?.ratedLoad || '—'}
      </div>

      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            <th style={th} rowSpan={2}>Sl.no</th>
            <th style={th} rowSpan={2}>Category</th>
            <th style={th} rowSpan={2}>ACTUAL</th>
            <th style={th} colSpan={3}>MEASUREMENT</th>
            <th style={th} rowSpan={2}>REMARKS</th>
          </tr>
          <tr>
            {phases.map(p => <th key={p} style={th}>{p}</th>)}
          </tr>
        </thead>
        <tbody>
          {checklistItems.map(item => (
            <tr key={item.id}>
              <td style={tdCenter}>{item.id}</td>
              {item.type === 'measurement' ? (
                <>
                  <td style={td}>{item.label}</td>
                  <td style={tdCenter}>
                    <input
                      type="number"
                      placeholder={equipment[item.actualKey] ?? ''}
                      value={responses[item.id].actual}
                      onChange={e => onActualChange(item.id, e.target.value)}
                      style={input}
                    />
                  </td>
                  {phases.map(p => (
                    <td key={p} style={tdCenter}>
                      <input
                        type="number"
                        placeholder={item.id===1?p:item.id===2?p.charAt(0):''}
                        value={responses[item.id][p]}
                        onChange={e => onMeasChange(item.id, p, e.target.value)}
                        style={input}
                        readOnly={item.id===3}
                      />
                    </td>
                  ))}
                  {item.id===1 && (
                    <td style={td} rowSpan={3}>
                      <input
                        type="text"
                        placeholder="Enter remark"
                        value={responses[1].remark}
                        onChange={e => onRemarkChange(1, e.target.value)}
                        style={input}
                      />
                    </td>
                  )}
                </>
              ) : (
                <>
                  <td style={td} />
                  <td style={td} colSpan={4}>{item.label}</td>
                  <td style={td}>
                    <input
                      type="text"
                      placeholder="Enter remark"
                      value={responses[item.id].remark}
                      onChange={e => onRemarkChange(item.id, e.target.value)}
                      style={input}
                    />
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign:'center', marginTop:20 }}>
        <button type="submit" style={button}>Save Report</button>
      </div>
    </form>
  );
}

// --- Styles ---
const th = {
  border: '1px solid #000',
  padding: 6,
  backgroundColor: '#236a80',
  color:'#fff',
  
  textAlign: 'center'
};
const td = {
  border: '1px solid #000',
  padding: 6
};
const tdCenter = {
  ...td,
  textAlign: 'center',
  verticalAlign: 'middle'
};
const input = {
  width: '80%',
  padding: 4,
  boxSizing: 'border-box'
};
const button = {
  padding: '8px 16px',
  backgroundColor: '#236a80',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer'
};
