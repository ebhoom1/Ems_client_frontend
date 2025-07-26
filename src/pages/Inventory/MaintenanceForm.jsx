// src/pages/Inventory/MaintenanceForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { useSelector } from "react-redux";


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
    rows: standardPumpChecklist
  },
  "bar-screen": {
    rows: [
      { id: 1, category: "Material Type", description: "" },
      { id: 2, category: "Check for any damages", description: "" },
      { id: 3, category: "Fixed/Removable", description: "" },
      { id: 4, category: "Other observations if any", description: "" }
    ]
  },
  "dosing-pump": {
  rows: [
    { id: 1, category: "Check the foot valve and NRV pipe", description: "" },
    { id: 2, category: "Check chemical level in the tank", description: "" },
    { id: 3, category: "Check for filter blockage", description: "" },
    { id: 4, category: "Check if pump is running smoothly", description: "" },
    { id: 5, category: "Other observations if any", description: "" }
  ]
},

  "oil-skimmer": {
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
  "mbr-air-blower": { // Renamed for clarity and generalization
    rows: blowerChecklist
  },
  "et&at-air-blower": { // Renamed for clarity and generalization
    rows: blowerChecklist
  },
  "filter-press-unit": {
    rows: [
      { id: 1, category: "Check for the filter press cloth condition", description: "" },
      { id: 2, category: "Check for all connected valves", description: "" },
      { id: 3, category: "Check for all the pressure gauges working condition", description: "" },
      { id: 4, category: "Check for the hydraulic unit", description: "" },
      { id: 5, category: "Other observation if any", description: "" }
    ]
  },
 "psf-acf-unit": {
  columns: ["Proccess Status"],
  rows: [
    { id: 1, category: "Inlet Pressure", description: "" },
    { id: 2, category: "Outlet Pressure", description: "" },
    { id: 3, category: "Check if Butterfly valves working", description: "" },
    { id: 4, category: "Check for Quality of water", description: "" },
    { id: 5, category: "Check for any Damage", description: "" },
    { id: 6, category: "Check for Condition of pipelines", description: "" },
    { id: 7, category: "Check Flow rate", description: "" },
    { id: 8, category: "Check if Open Backwash done", description: "" },
    { id: 9, category: "Check for Condition of Vessel", description: "" },
    { id: 10, category: "Other Observations", description: "" }
  ]
},

"softener-unit": {
  columns: ["Process Status"],
  rows: [
    { id: 1, category: "Inlet Pressure", description: "" },
    { id: 2, category: "Outlet Pressure", description: "" },
    { id: 3, category: "Check if Butterfly/ multiport valves working", description: "" },
    { id: 4, category: "Check for inlet hardness", description: "" },
    { id: 5, category: "Check for outlet hardness", description: "" },
    { id: 6, category: "Check for any Damage", description: "" },
    { id: 7, category: "Check for Condition of pipelines", description: "" },
    { id: 8, category: "Check Flow rate", description: "" },
    { id: 9, category: "Check if re-generation is done", description: "" },
    { id: 10, category: "Check for Condition of Vessel", description: "" },
    { id: 11, category: "Check Brine tank condition", description: "" },
    { id: 12, category: "Other Observations", description: "" }
  ]
},

  "agitator-mechanism": {
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

const getMatchingChecklistKey = (name) => {
  if (!name) return null;
  const lowerName = name.toLowerCase();

  if (lowerName.includes("pump")) {
    if (lowerName.includes("raw sewage pump") || lowerName.includes("raw sewage transfer pump")) {
      return "raw-sewage-pump";
    }
    return "shared-standard-pump";
  }

  if (lowerName.includes("blower")) {
    if (lowerName.includes("mbr air blower")) return "mbr-air-blower";
    if (lowerName.includes("et&at air blower") || lowerName.includes("eq & at air blower") || lowerName.includes("air blower at & et")) {
      return "et&at-air-blower";
    }
    return "et&at-air-blower";
  }

  if (lowerName.includes("bar screen")) return "bar-screen";
  if (lowerName.includes("oil skimmer")) return "oil-skimmer";
  if (lowerName.includes("agitator") || lowerName.includes("mixer")) return "agitator-mechanism";
if (
  lowerName.includes("filter press") ||
  lowerName.includes("screw pump") ||
  lowerName.includes("sludge pump") ||
  lowerName.includes("hydraulic filter press pump") ||
  lowerName.includes("polymer dosing pump") ||
  lowerName.includes("out side bypass pump")
) {
  return "filter-press-unit";
}

if (lowerName.includes("dosing pump")) return "dosing-pump";

  if (lowerName.includes("psf") || lowerName.includes("acf")) return "psf-acf-unit";
  if (lowerName.includes("softener")) return "softener-unit";

  return null;
};


  const slug = location.state?.equipmentName?.toLowerCase()?.trim();
  console.log("Selected equipment name:", location.state?.equipmentName);
  const matchedKey = slug ? getMatchingChecklistKey(slug) : null;

  // Determine initial columns based on matchedKey
  const initialColumns = () => {
    if (matchedKey?.includes("pump")) {
      return ["Pump 1"];
    }
    if (matchedKey?.includes("blower")) {
      return ["Blower 1"];
    }
    // For other types, use a default or what's defined in mechanicalConfig if available
    const defaultColumns = mechanicalConfig[matchedKey]?.columns || ["Process Status"];
    // If a type like 'bar-screen' or 'oil-skimmer' inherently has a "Process Status" column,
    // this will correctly pick it up. If it doesn't, it will default to ["Process Status"].
    return defaultColumns;
  };

  const originalCfg = matchedKey ? {
    ...mechanicalConfig[matchedKey],
    columns: initialColumns(), // Dynamically set columns here
  } : { columns: [], rows: [] };


  // pull only the territorial manager data
  const { validUserOne = {} } = useSelector((state) => state.user.userData || {});
  const [manager, setManager] = useState(null);

  const [cfg, setCfg] = useState(originalCfg);
  const [answers, setAnswers] = useState({});
  const [isWorking, setIsWorking] = useState("yes");
  const [comments, setComments] = useState("");
  const [photos, setPhotos] = useState([null]);

  // detect pump/blower to allow adding columns
  const isPump = matchedKey?.includes("pump");
  const isBlower = matchedKey?.includes("blower");
// Around line 258
useEffect(() => {
  if (!dbId) return;

  const fetchEquipment = async () => {
    try {
      // Note: The URL seems to have a typo "equiment" instead of "equipment"
      // I am using your provided URL. Correct it if it's a typo.
      const res = await axios.get(`${API_URL}/api/equiment/${dbId}`);
      const equipment = res.data?.equipment;
      if (equipment) {
        setUserName(equipment.userName || "");
        setCapacity(equipment.capacity || ""); // ✅ FIX: Set the capacity here
      }
    } catch (err) {
      console.error("❌ Error fetching equipment details:", err);
      toast.error("Could not fetch equipment details.");
    }
  };

  fetchEquipment();
}, [dbId]);
  // load manager info once validUserOne changes
  useEffect(() => {
    if (validUserOne.isTerritorialManager) {
      setManager({
        name: validUserOne.fname,
        email: validUserOne.email,
      });
    } else {
      setManager(null);
    }
  }, [validUserOne]);
  const handlePhotoChange = (index, file) => {
    const newPhotos = [...photos];
    newPhotos[index] = file;
    setPhotos(newPhotos);
  };

  const addPhotoField = () => {
    setPhotos([...photos, null]);
  };
  // re-init config when equipmentName changes
  useEffect(() => {
    const slug2 = location.state?.equipmentName?.toLowerCase()?.trim();
    const key = slug2 ? getMatchingChecklistKey(slug2) : null;
    setCfg(key ? {
      ...mechanicalConfig[key],
      columns: initialColumns(), // Re-apply dynamic column logic
    } : { columns: [], rows: [] });
  }, [location.state?.equipmentName]);

  // fetch userName for this equipment
  useEffect(() => {
    if (!dbId) return;
    axios.get(`${API_URL}/api/equiment/${dbId}`)
      .then(res => setUserName(res.data.equipment?.userName || ""))
      .catch(err => console.error("Error fetching equipment userName:", err));
  }, [dbId]);

  // initialize empty answers
  useEffect(() => {
    const init = {};
    cfg.rows.forEach(row => {
      init[row.id] = { checks: Array(cfg.columns.length).fill(""), remarks: "" };
    });
    setAnswers(init);
  }, [cfg]);

  const addAdditionalColumn = () => {
    if (isPump || isBlower) {
      const prefix = isPump ? "Pump" : "Blower";
      const newCol = `${prefix} ${cfg.columns.length + 1}`;
      setCfg(c => ({ ...c, columns: [...c.columns, newCol] }));
      setAnswers(a => {
        const copy = { ...a };
        Object.values(copy).forEach(r => r.checks.push(""));
        return copy;
      });
    }
  };

  const onCheck = (rowId, idx, val) => {
    setAnswers(a => ({
      ...a,
      [rowId]: {
        ...a[rowId],
        checks: a[rowId].checks.map((c, i) => (i === idx ? val : c))
      }
    }));
  };

  const onRemarks = (rowId, val) => {
    setAnswers(a => ({
      ...a,
      [rowId]: { ...a[rowId], remarks: val }
    }));
  };

  const getRemarksColor = rowId => {
    const checks = answers[rowId]?.checks || [];
    if (checks.some(c => c === "fail")) return "text-danger";
    if (checks.every(c => c === "ok")) return "text-success";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!manager) {
      toast.error("Territorial Manager information is required");
      return;
    }

    const payload = new FormData();
    payload.append("equipmentId", dbId);
    payload.append("equipmentName", slug);
    payload.append("userName", userName);
    payload.append("capacity", capacity); // ✅ FIX: Add capacity to the payload
    payload.append("isWorking", isWorking);
    payload.append("comments", comments);
    payload.append("territorialManager", JSON.stringify({
      name: manager.name,
      email: manager.email
    }));

    photos.filter(Boolean).forEach(file => payload.append("photos", file));

    if (isWorking === "yes") {
      payload.append("columns", JSON.stringify(cfg.columns));
      payload.append("entries", JSON.stringify(
        cfg.rows.map(r => ({
          id: r.id,
          category: r.category,
          description: r.description,
          checks: answers[r.id]?.checks || [],
          remarks: answers[r.id]?.remarks || ""
        }))
      ));
    }

    payload.append("timestamp", new Date().toISOString());

    try {
      const { data } = await axios.post(
        `${API_URL}/api/add-mechanicalreport`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (data.success) {
        toast.success("Report submitted successfully!");
        navigate("/services");
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

      <div className="row">
        {/* User Name */}
        <div className="col-md-6 col-12 mb-3">
          <label htmlFor="userName" className="form-label">
            <strong>User Name</strong>
          </label>
          <input
            type="text"
            id="userName"
            className="form-control"
            value={userName}
            readOnly
          />
        </div>

        {/* Territorial Manager Info */}
        <div className="col-md-6 mb-3">
          <label className="form-label"><strong>Territorial Manager</strong></label>
          <div className="p-2 shadow bg-light rounded">
            {manager ? (
              <div className="text-success">
                {manager.name} (
                <a href={`mailto:${manager.email}`}>{manager.email}</a>
                )
              </div>
            ) : (
              <div className="text-danger">
                Manager data not available or you’re not a manager.
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={submit}>
        <div className="mb-4">
          <label className="form-label"><strong>Is the Equipment Working?</strong></label>
          <div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="equipmentStatus"
                id="workingYes"
                value="yes"
                checked={isWorking === "yes"}
                onChange={() => setIsWorking("yes")}
              />
              <label className="form-check-label" htmlFor="workingYes">
                Yes
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="equipmentStatus"
                id="workingNo"
                value="no"
                checked={isWorking === "no"}
                onChange={() => setIsWorking("no")}
              />
              <label className="form-check-label" htmlFor="workingNo">
                No
              </label>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label"><strong>Comments</strong></label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Enter any comments about the equipment..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label"><strong>Upload Photos</strong></label>
          {photos.map((file, idx) => (
            <div key={idx} className="mb-2">
              <input
                type="file"
                accept="image/*"
                // capture="environment"
                onChange={(e) => handlePhotoChange(idx, e.target.files[0])}
                className="form-control"
              />
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={addPhotoField}
          >
            + Add Photo
          </button>
        </div>

        {isWorking === "yes" && (
          <div className="table-responsive mb-4">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#236a80', color: '#fff' }}>#</th>
                  <th style={{ backgroundColor: '#236a80', color: '#fff' }}>Category</th>
                  <th style={{ backgroundColor: '#236a80', color: '#fff' }}>Description</th>
                  {cfg.columns.map(col => (
                    <th
                      key={col}
                      style={{ backgroundColor: '#236a80', color: '#fff' }}
                    >
                      {col}
                    </th>
                  ))}
                  <th style={{ backgroundColor: '#236a80', color: '#fff' }}>Remarks</th>
                  {(isPump || isBlower) && (
                    <th style={{ backgroundColor: '#236a80', color: '#fff' }}>
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
                {cfg.rows.map((row, idx) => {
                  const rowData = answers[row.id] || {
                    checks: Array(cfg.columns.length).fill(""),
                    remarks: ""
                  };

                  return (
                    <tr key={row.id}>
                      <td>{idx + 1}</td>
                      <td>Mechanical</td>
                      <td>{row.category}</td>

                      {cfg.columns.map((_, cidx) => (
                        <td
                          key={cidx}
                          style={{ textAlign: "center", whiteSpace: "nowrap" }}
                        >
                          <button
                            type="button"
                            className={`btn btn-sm me-1 ${rowData.checks[cidx] === "ok"
                                ? "btn-success"
                                : "btn-outline-secondary"
                              }`}
                            onClick={() => onCheck(row.id, cidx, "ok")}
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${rowData.checks[cidx] === "fail"
                                ? "btn-danger"
                                : "btn-outline-secondary"
                              }`}
                            onClick={() => onCheck(row.id, cidx, "fail")}
                          >
                            ✕
                          </button>
                        </td>
                      ))}

                      <td>
                        <input
                          className={`form-control ${getRemarksColor(row.id)}`}
                          value={rowData.remarks}
                          onChange={(e) => onRemarks(row.id, e.target.value)}
                        />
                      </td>

                      {(isPump || isBlower) && <td />}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <button type="submit" className="btn" style={{ backgroundColor: "#236a80", color: "#fff" }}>
          Submit Report
        </button>
      </form>
    </div>
  );
}