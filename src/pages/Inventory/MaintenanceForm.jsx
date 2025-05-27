// src/pages/Inventory/MaintenanceForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";

const standardPumpChecklist = [
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
  { id: 17, category: "Other observation if any", description: "" }
];

const blowerChecklist = [
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
];

const mechanicalConfig = {
  "shared-standard-pump": {
    columns: ["Pump 1"],
    rows: standardPumpChecklist
  },
  "bar-screen": {
    columns: ["Process Status"],
    rows: [
      { id: 1, category: "Material Type", description: "" },
      { id: 2, category: "Check for any damages", description: "" },
      { id: 3, category: "Fixed/Removable", description: "" },
      { id: 4, category: "Other observations if any", description: "" }
    ]
  },
  "oil-skimmer": {
    columns: ["Process Status"],
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
      { id: 11, category: "Other observations if any", description: "" }
    ]
  },
  "raw-sewage-pump": {
    columns: ["Pump 1"],
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
      { id: 14, category: "Other observations if any", description: "" }
    ]
  },
  "mbr-air-blower-3-4": {
    columns: ["Blower 3"],
    rows: blowerChecklist
  },
  "ET&AT AIR BLOWER 2": {
    columns: ["Blower 1"],
    rows: blowerChecklist
  },
  "filter-press-unit": {
    columns: ["Process Status"],
    rows: [
      { id: 1, category: "Check for the filter press cloth condition", description: "" },
      { id: 2, category: "Check for all connected valves", description: "" },
      { id: 3, category: "Check for all the pressure gauges working condition", description: "" },
      { id: 4, category: "Check for the hydraulic unit", description: "" },
      { id: 5, category: "Other observation if any", description: "" }
    ]
  },
  "agitator-mechanism": {
    columns: ["Process Status"],
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
const [capacity, setCapacity] = useState("");
const [userName, setUserName] = useState("");

  // Helper function to determine checklist key based on partial matches
  const getMatchingChecklistKey = (name) => {
    if (!name) return null;
    
    const keywordMap = [
      { keyword: "ras pump", key: "shared-standard-pump" },
      { keyword: "filter feed", key: "shared-standard-pump" },
      { keyword: "permeate", key: "shared-standard-pump" },
      { keyword: "sludge transfer", key: "shared-standard-pump" },
      { keyword: "sludge re-circulation", key: "shared-standard-pump" },
      { keyword: "softner feed", key: "shared-standard-pump" },
      { keyword: "cip", key: "shared-standard-pump" },
      { keyword: "uf feed", key: "shared-standard-pump" },
      { keyword: "mbr blower", key: "mbr-air-blower-3-4" },
      { keyword: "raw-sewage", key: "raw-sewage-pump" },
      { keyword: "et&at air blower", key: "ET&AT AIR BLOWER 2" },
      { keyword: "bar screen", key: "bar-screen" },
      { keyword: "oil skimmer", key: "oil-skimmer" },
      { keyword: "agitator", key: "agitator-mechanism" },
      { keyword: "filter press", key: "filter-press-unit" },
            { keyword: "screw pump", key: "filter-press-unit" },
              { keyword: "sludge pump", key: "filter-press-unit" },
              { keyword: "dosing pump", key: "filter-press-unit" }
            // sludge pump
//dosing pump
    ];

    const lowerName = name.toLowerCase();
    const match = keywordMap.find(item => lowerName.includes(item.keyword));
    return match ? match.key : null;
  };

  const slug = location.state?.equipmentName?.toLowerCase()?.trim();
  const matchedKey = getMatchingChecklistKey(slug);
  const originalCfg = matchedKey ? mechanicalConfig[matchedKey] : { columns: [], rows: [] };

  // State for additional columns (Pump 2/Blower 2)
  const [additionalColumns, setAdditionalColumns] = useState([]);
  const [cfg, setCfg] = useState(originalCfg);

  // technician from backend
  const [technician, setTechnician] = useState(null);
  const [answers, setAnswers] = useState({});

  // Check if equipment is a pump or blower
  const isPump = matchedKey?.includes('pump');
  const isBlower = matchedKey?.includes('blower');

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

  // Initialize answers when cfg changes
  useEffect(() => {
    const init = {};
    cfg.rows.forEach(row => {
      init[row.id] = { 
        checks: Array(cfg.columns.length).fill(""), 
        remarks: "" 
      };
    });
    setAnswers(init);
  }, [cfg]);

  const addAdditionalColumn = () => {
    if (isPump || isBlower) {
      const prefix = isPump ? "Pump" : "Blower";
      const newColumn = `${prefix} ${cfg.columns.length + 1}`;
      
      // Update cfg with the new column
      const newColumns = [...cfg.columns, newColumn];
      setCfg({...cfg, columns: newColumns});
      
      // Update answers to include the new column for each row
      const updatedAnswers = {...answers};
      Object.keys(updatedAnswers).forEach(rowId => {
        updatedAnswers[rowId].checks.push("");
      });
      setAnswers(updatedAnswers);
    }
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

  const submit = async (e) => {
    e.preventDefault();
  
    if (!technician) {
      toast.error("Technician information is required");
      return;
    }

    const payload = {
      equipmentId: dbId,
      equipmentName: slug,
      userName,
         // set this from earlier API or input
      capacity,    
      columns: cfg.columns,
      technician: technician,
      entries: cfg.rows.map(row => ({
        id: row.id,
        category: row.category,
        description: row.description,
        checks: answers[row.id]?.checks || [],
        remarks: answers[row.id]?.remarks || ""
      })),
      timestamp: new Date().toISOString()
    };

    try {
      const { data } = await axios.post(
        `${API_URL}/api/add-mechanicalreport`,
        payload
      );
      if (data.success) {
        toast.success("Report submitted!");
        navigate("/");
      } else {
        toast.error(data.message || "Failed to submit report");
      }
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("Server error: could not submit report");
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">
        {type.charAt(0).toUpperCase() + type.slice(1)} Maintenance –{" "}
        {slug?.replace(/-/g, " ")}
      </h3>
{/* Capacity Input */}
{/* User Name Input */}
<div className="mb-3">
  <label htmlFor="userName" className="form-label"><strong>User Name</strong></label>
  <input
    type="text"
    id="userName"
    className="form-control"
    placeholder="Enter user name (e.g., HH014)"
    value={userName}
    onChange={(e) => setUserName(e.target.value)}
    required
  />
</div>

{/* Capacity Input */}
<div className="mb-3">
  <label htmlFor="capacity" className="form-label"><strong>Capacity of Treatment Plant (e.g., 150 KLD)</strong></label>
  <input
    type="text"
    id="capacity"
    className="form-control"
    placeholder="Enter treatment plant capacity"
    value={capacity}
    onChange={(e) => setCapacity(e.target.value)}
    required
  />
</div>

      {/* Technician Info Card */}
      <div className="p-3 mb-4 shadow bg-light">
        {technician ? (
          <div>
            <strong>Technician:</strong> {technician.name} — {technician.designation} (
            <a href={`mailto:${technician.email}`}>{technician.email}</a>)
          </div>
        ) : (
          <div className="text-danger">Technician data not available</div>
        )}
      </div>

      {/* Maintenance Table */}
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
                {(isPump || isBlower) && (
                  <th>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-success"
                      onClick={addAdditionalColumn}
                    >
                      +
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {cfg.rows.map((row, idx) => (
                <tr key={row.id}>
                  <td>{idx + 1}</td>
                  <td>Mechanical</td>
                  <td>{row.category}</td>
                  {cfg.columns.map((col, cidx) => (
                    <td key={cidx}>
                      <input
                        type="text"
                        className="form-control"
                        value={answers[row.id]?.checks[cidx] || ""}
                        onChange={e => onCheck(row.id, cidx, e.target.value)}
                        required
                      />
                    </td>
                  ))}
                  <td>
                    <input
                      className="form-control"
                      value={answers[row.id]?.remarks || ""}
                      onChange={e => onRemarks(row.id, e.target.value)}
                    />
                  </td>
                  {(isPump || isBlower) && <td></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="submit" style={{backgroundColor:'#236a80' , color :'#fff'}} className="btn ">
          Submit Report
        </button>
      </form>
    </div>
  );
}