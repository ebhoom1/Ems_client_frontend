import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";

// ——— Full mechanicalConfig ———
const mechanicalConfig = {
  "bar-screen": {
    columns: [],
    rows: [
      { id: 1, category: "Material Type", description: "" },
      { id: 2, category: "Check for any damages", description: "" },
      { id: 3, category: "Fixed/Removable", description: "" },
      { id: 4, category: "Other observations if any", description: "" },
    ]
  },
  "oil-skimmer": {
    columns: [],
    rows: [
      { id: 1, category: "Check for safety Guards", description: "" },
      { id: 2, category: "Direction of rotation", description: "" },
      { id: 3, category: "Check for Gear box sound", description: "" },
      { id: 4, category: "Check for Motor Condition", description: "" },
      { id: 5, category: "Check belt quality", description: "" },
      { id: 6, category: "Check for Star bush & coupling damage", description: "" },
      { id: 7, category: "Check for Bearing sound & damage", description: "" },
      { id: 8, category: "Check for Oil collection tray", description: "" },
      { id: 9, category: "Check for pulley condition", description: "" },
      { id: 10, category: "Check for base support", description: "" },
      { id: 11, category: "Other observations if any", description: "" },
    ]
  },
  "raw-sewage-pump": {
    columns: ["Pump 1", "Pump 2"],
    rows: [
      { id: 1, category: "Type of Pump", description: "Submersible / Centrifugal pump" },
      { id: 2, category: "Check for safety Guards", description: "" },
      { id: 3, category: "Direction of rotation", description: "" },
      { id: 4, category: "Check for Impeller sound", description: "" },
      { id: 5, category: "Check if the Pump is running smoothly", description: "" },
      { id: 6, category: "Check for oil, Grease & water leakage", description: "" },
      { id: 7, category: "Check for Star bush & coupling damage", description: "" },
      { id: 8, category: "Check for Bearing sound & damage", description: "" },
      { id: 9, category: "Check for Valve & pipe line blockage", description: "" },
      { id: 10, category: "Check for Vibration", description: "" },
      { id: 11, category: "Check for terminal loose connection", description: "" },
      { id: 12, category: "Check for discharge pressure", description: "" },
      { id: 13, category: "Check if the NRV is in working condition", description: "" },
      { id: 14, category: "Other observations if any", description: "" },
    ]
  },
  "mbr-air-blower-1-2": {
    columns: ["Blower 1", "Blower 2"],
    rows: [
      { id: 1, category: "Check for safety Guards", description: "" },
      { id: 2, category: "Noise level in dB", description: "" },
      { id: 3, category: "Direction of rotation", description: "" },
      { id: 4, category: "Check for Vibration", description: "" },
      { id: 5, category: "Check if the blower is running smoothly", description: "" },
      { id: 6, category: "Check if motor is running smoothly", description: "" },
      { id: 7, category: "Check for oil & Grease leakage", description: "" },
      { id: 8, category: "Check if greasing is done", description: "" },
      { id: 9, category: "Check for blower Bearing sound & damage", description: "" },
      { id: 10, category: "Check for motor Bearing sound & damage", description: "" },
      { id: 11, category: "Check for Valve & pipe line & Damage", description: "" },
      { id: 12, category: "Check the discharge pressures in Kg/cm2", description: "" },
      { id: 13, category: "Check for pressure relief valves", description: "" },
      { id: 14, category: "Check for Air filter cleaning", description: "" },
      { id: 15, category: "Check for pulley alignment", description: "" },
      { id: 16, category: "Check for V-belt condition", description: "" },
      { id: 17, category: "Check for base support", description: "" },
      { id: 18, category: "Check for motor cooling fan condition", description: "" },
      { id: 19, category: "Other observations if any", description: "" }
    ]
  },
  "mbr-air-blower-3-4": {
    columns: ["Blower 3", "Blower 4"],
    rows: [
      { id: 1, category: "Check for safety Guards", description: "" },
      { id: 2, category: "Noise level in dB", description: "" },
      { id: 3, category: "Direction of rotation", description: "" },
      { id: 4, category: "Check for Vibration", description: "" },
      { id: 5, category: "Check if the blower is running smoothly", description: "" },
      { id: 6, category: "Check if motor is running smoothly", description: "" },
      { id: 7, category: "Check for oil & Grease leakage", description: "" },
      { id: 8, category: "Check if greasing is done", description: "" },
      { id: 9, category: "Check for blower Bearing sound & damage", description: "" },
      { id: 10, category: "Check for motor Bearing sound & damage", description: "" },
      { id: 11, category: "Check for Valve & pipe line & Damage", description: "" },
      { id: 12, category: "Check the discharge pressures in Kg/cm2", description: "" },
      { id: 13, category: "Check for pressure relief valves", description: "" },
      { id: 14, category: "Check for Air filter cleaning", description: "" },
      { id: 15, category: "Check for pulley alignment", description: "" },
      { id: 16, category: "Check for V-belt condition", description: "" },
      { id: 17, category: "Check for base support", description: "" },
      { id: 18, category: "Check for motor cooling fan condition", description: "" },
      { id: 19, category: "Other observations if any", description: "" }
    ]
  },
  "ras-pump": {
    columns: ["Pump 1", "Pump 2"],
    rows: [
      { id: 1, category: "Pump Type", description: "Coupled / Monoblock" },
      { id: 2, category: "Check for safety Guards", description: "" },
      { id: 3, category: "Check for alignment of the pump", description: "" },
      { id: 4, category: "Direction of rotation", description: "" },
      { id: 5, category: "Impeller sound", description: "" },
      { id: 6, category: "Check if the Pump is running smoothly", description: "" },
      { id: 7, category: "Check for oil, Grease & water leakage", description: "" },
      { id: 8, category: "Check for Star bush & coupling damage", description: "" },
      { id: 9, category: "Check for Bearing sound & damage", description: "" },
      { id: 10, category: "Check for Valve & pipe line blockage", description: "" },
      { id: 11, category: "Check for Vibration", description: "" },
      { id: 12, category: "Check for terminal loose connection", description: "" },
      { id: 13, category: "Check for discharge pressure", description: "" },
      { id: 14, category: "Check for the NRV working condition", description: "" },
      { id: 15, category: "Check for coupler safety guard", description: "" },
      { id: 16, category: "Check for coupler condition", description: "" },
      { id: 17, category: "Other observation if any", description: "" },
    ]
  },
  ...[
    "mbr-permeate-pump",
    "cip-pump",
    "treated-water-pump-c-block",
    "treated-water-pump-m-block",
    "dosing-pump",
    "drain-pump"
  ].reduce((acc, id) => {
    acc[id] = {
      columns: ["Pump 1", "Pump 2"],
      rows: [
        { id: 1, category: "Pump Type", description: "Coupled / Monoblock / Vertical multi-stage pumps" },
        ...Array.from({ length: 16 }, (_, i) => ({
          id: i + 2,
          category: `Check item ${i + 2}`,
          description: ""
        })),
        { id: 18, category: "Other observation if any", description: "" }
      ]
    };
    return acc;
  }, {}),
  "filter-press-unit": {
    columns: [],
    rows: [
      { id: 1, category: "Check for the filter press cloth condition", description: "" },
      { id: 2, category: "Check for all connected valves", description: "" },
      { id: 3, category: "Check for all the pressure gauges working condition", description: "" },
      { id: 4, category: "Check for the hydraulic unit", description: "" },
      { id: 5, category: "Other observation if any", description: "" }
    ]
  },
  "agitator-mechanism": {
    columns: [],
    rows: [
      { id: 1, category: "Type of the Mechanism", description: "Direct Coupled / Chain driven / Belt Driven" },
      { id: 2, category: "Check for safety Guards", description: "" },
      { id: 3, category: "Direction of rotation", description: "" },
      { id: 4, category: "Check for Gear Box sound", description: "" },
      { id: 5, category: "Check if the Motor is running smoothly or not", description: "" },
      { id: 6, category: "Check the oil level", description: "" },
      { id: 7, category: "Check for Star bush & coupling damage (Size)", description: "" },
      { id: 8, category: "Check for Bearing sound & damage", description: "" },
      { id: 9, category: "Check if Oil replacement is done", description: "" },
      { id: 10, category: "Check for the Vibration", description: "" },
      { id: 11, category: "Other observation if any", description: "" }
    ]
  }
};

export default function MaintenanceForm() {
  const { type, equipmentId: dbId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // slug = the config key you passed in via state
  const slug = location.state?.equipmentName;
  const cfg = mechanicalConfig[slug] || { columns: [], rows: [] };

  // technician from backend
  const [technician, setTechnician] = useState(null);
  // locally saved tech info
  const [tech, setTech] = useState(null);
  const [editingTech, setEditingTech] = useState(true);
  const [techForm, setTechForm] = useState({ name: "", designation: "", email: "" });
  const [answers, setAnswers] = useState({});

  // fetch technician record once
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/technician`);
        if (data.success && data.technician) {
          setTechnician(data.technician);
        }
      } catch (err) {
        console.error("Failed to fetch technician", err);
      }
    })();
  }, []);

  // load local techInfo + init answers when slug changes
  useEffect(() => {
    const saved = localStorage.getItem("techInfo");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTech(parsed);
      setTechForm(parsed);
      setEditingTech(false);
    }
    const init = {};
    cfg.rows.forEach(row => {
      init[row.id] = { checks: Array(cfg.columns.length).fill(""), remarks: "" };
    });
    setAnswers(init);
  }, [slug]);

  const startEditTech = () => {
    setTechForm({
      name: technician?.name || "",
      designation: technician?.designation || "",
      email: technician?.email || ""
    });
    setEditingTech(true);
  };

  const cancelEditTech = () => {
    // revert to saved or backend data
    if (tech) {
      setTechForm(tech);
    } else if (technician) {
      setTechForm({
        name: technician.name,
        designation: technician.designation,
        email: technician.email
      });
    } else {
      setTechForm({ name: "", designation: "", email: "" });
    }
    setEditingTech(false);
  };

  const saveTech = () => {
    if (!techForm.name || !techForm.designation || !techForm.email) {
      return toast.error("Please fill all technician fields");
    }
    localStorage.setItem("techInfo", JSON.stringify(techForm));
    setTech(techForm);
    setEditingTech(false);
  };

  const handleTechChange = e => {
    const { name, value } = e.target;
    setTechForm(f => ({ ...f, [name]: value }));
  };

  const onCheck = (rowId, idx, val) => {
    setAnswers(a => ({
      ...a,
      [rowId]: { ...a[rowId], checks: a[rowId].checks.map((c, i) => (i === idx ? val : c)) }
    }));
  };

  const onRemarks = (rowId, val) => {
    setAnswers(a => ({
      ...a,
      [rowId]: { ...a[rowId], remarks: val }
    }));
  };

  const submit = e => {
    e.preventDefault();
    if (!tech) {
      return toast.error("Provide technician info first");
    }
    const report = {
      equipmentId: dbId,
      equipmentName: slug,
      technician: tech,
      entries: cfg.rows.map(row => ({
        ...row,
        checks: answers[row.id].checks,
        remarks: answers[row.id].remarks
      })),
      timestamp: new Date().toISOString()
    };
    console.log("MECH REPORT →", report);
    toast.success("Report submitted!");
    navigate("/");
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">
        {type.charAt(0).toUpperCase() + type.slice(1)} Maintenance –{" "}
        {slug.replace(/-/g, " ")}
      </h3>

      {/* Technician Info Card */}
      <div className="p-3 mb-4 shadow">
        <div className="card-body">
          {!editingTech && technician ? (
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Technician:</strong> {technician.name} —{" "}
                {technician.designation} (
                <a href={`mailto:${technician.email}`}>{technician.email}</a>)
              </div>
              <button
              style={{backgroundColor:'#236a80' , color:'#fff'}}
                className="btn"
                onClick={startEditTech}
              >
                Change
              </button>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); saveTech(); }}>
              <div className="row g-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Name"
                    value={techForm.name}
                    onChange={handleTechChange}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    name="designation"
                    className="form-control"
                    placeholder="Designation"
                    value={techForm.designation}
                    onChange={handleTechChange}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Email"
                    value={techForm.email}
                    onChange={handleTechChange}
                  />
                </div>
                <div className="col-12 text-end">
                  <button
                    type="button"
                    className="btn btn-outline-danger me-2"
                    onClick={cancelEditTech}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Maintenance Table */}
      {!editingTech && (
        <form onSubmit={submit}>
          <div className="table-responsive mb-4">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Description</th>
                  {cfg.columns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {cfg.rows.map((row, idx) => (
                  <tr key={row.id}>
                    <td>{idx + 1}</td>
                    <td>Mechanical</td>
                    <td>{row.category}</td>
                    {cfg.columns.map((_, cidx) => (
                      <td key={cidx}>
                        <select
                          className="form-select"
                          value={answers[row.id]?.checks[cidx] || ""}
                          onChange={e => onCheck(row.id, cidx, e.target.value)}
                          required
                        >
                          <option value="">Select</option>
                          <option value="OK">OK</option>
                          <option value="Not OK">Not OK</option>
                        </select>
                      </td>
                    ))}
                    <td>
                      <input
                        className="form-control"
                        value={answers[row.id]?.remarks || ""}
                        onChange={e => onRemarks(row.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="submit" className="btn btn-primary">
            Submit Report
          </button>
        </form>
      )}
    </div>
  );
}
