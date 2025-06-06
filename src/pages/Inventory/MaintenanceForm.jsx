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
      { keyword: "air blower - 2", key: "ET&AT AIR BLOWER 2" },
        { keyword: "air blower 2", key: "ET&AT AIR BLOWER 2" },
      { keyword: "air blower 1", key: "ET&AT AIR BLOWER 2" },
       { keyword: "air blower - 1", key: "ET&AT AIR BLOWER 2" },
      //air blower - 1
      { keyword: "uf feed", key: "shared-standard-pump" },
      { keyword: "mbr blower", key: "mbr-air-blower-3-4" },
      { keyword: "raw sewage pump 1", key: "raw-sewage-pump" },
      { keyword: "raw sewage pump - 2", key: "raw-sewage-pump" },
      { keyword: "et&at air blower", key: "ET&AT AIR BLOWER 2" },
      { keyword: "bar screen", key: "bar-screen" },
      { keyword: "oil skimmer", key: "oil-skimmer" },
      { keyword: "agitator", key: "agitator-mechanism" },
      { keyword: "filter press", key: "filter-press-unit" },
      { keyword: "screw pump", key: "filter-press-unit" },
      { keyword: "sludge pump", key: "filter-press-unit" },
      { keyword: "dosing pump", key: "filter-press-unit" },
      { keyword: "out side bypass pump", key: "filter-press-unit" },
    ];

    const lowerName = name.toLowerCase();
    const match = keywordMap.find(item => lowerName.includes(item.keyword));
    return match ? match.key : null;
  };

  const slug = location.state?.equipmentName?.toLowerCase()?.trim();
  const matchedKey = slug ? getMatchingChecklistKey(slug) : null;
  const originalCfg = matchedKey ? mechanicalConfig[matchedKey] : { columns: [], rows: [] };
  const { userData } = useSelector((state) => state.user);

  const [additionalColumns, setAdditionalColumns] = useState([]);
  const [cfg, setCfg] = useState(originalCfg);
  const [technician, setTechnician] = useState(null); // State for technician data
  const [answers, setAnswers] = useState({});

  const isPump = matchedKey?.includes('pump');
  const isBlower = matchedKey?.includes('blower');
  const [isWorking, setIsWorking] = useState("yes");
  const [comments, setComments] = useState("");
  const [photos, setPhotos] = useState([null]);
console.log('userData in mainatnene form', userData);

  const handlePhotoChange = (index, file) => {
    const newPhotos = [...photos];
    newPhotos[index] = file;
    setPhotos(newPhotos);
  };

  const addPhotoField = () => {
    setPhotos([...photos, null]);
  };

  // --- START: Technician data from localStorage ---
  useEffect(() => {
    try {
       // Make sure this key matches your app's key
      if (userData?.validUserOne?.isTechnician== true) {
        const validUserOne = userData.validUserOne || userData; // Adjust if user_data itself is validUserOne
        
        if (validUserOne && validUserOne.isTechnician) {
          setTechnician({
            name: validUserOne.fname, // Use fname for the display name
            email: validUserOne.email,
            // If your userData has a 'designation' field, you can add it here too:
            // designation: validUserOne.designation || "",
          });
        } else {
          console.warn("Logged-in user is not a technician or user data structure is incorrect.");
          setTechnician(null);
          toast.warn("You are not authorized as a technician to submit reports.");
        }
      } else {
        console.warn("No user data found in local storage.");
        setTechnician(null);
        toast.error("Please log in to submit reports.");
      }
    } catch (error) {
      console.error("Error parsing user data from local storage:", error);
      setTechnician(null);
      toast.error("Error loading user data.");
    }
  }, []); // Empty dependency array means this runs once on component mount
  // --- END: Technician data from localStorage ---


  useEffect(() => {
    const slug = location.state?.equipmentName?.toLowerCase()?.trim();
    console.log("Current slug:", slug);
    const matchedKey = slug ? getMatchingChecklistKey(slug) : null;
    console.log("Matched key:", matchedKey);
    const originalCfg = matchedKey ? mechanicalConfig[matchedKey] : { columns: [], rows: [] };
    setCfg(originalCfg);
  }, [location.state?.equipmentName]);

  useEffect(() => {
    if (!dbId) return;

    const fetchEquipment = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/equiment/${dbId}`);
        const equipment = res.data?.equipment;
        if (equipment?.userName) {
          setUserName(equipment.userName);
        }
      } catch (err) {
        console.error("❌ Error fetching equipment for userName:", err);
      }
    };

    fetchEquipment();
  }, [dbId]);

  // IMPORTANT: REMOVE THIS useEffect block. It's causing the overwrite.
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const { data } = await axios.get(`${API_URL}/api/technician`);
  //       if (data.success && data.technician) {
  //         setTechnician(data.technician);
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch technician", err);
  //     }
  //   })();
  // }, []);


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

      const newColumns = [...cfg.columns, newColumn];
      setCfg({ ...cfg, columns: newColumns });

      const updatedAnswers = { ...answers };
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

  const getRemarksColor = (rowId) => {
    const rowAnswers = answers[rowId]?.checks;
    if (!rowAnswers || rowAnswers.length === 0) {
      return "";
    }
    if (rowAnswers.some(check => check === "fail")) {
      return "text-danger";
    }
    if (rowAnswers.every(check => check === "ok")) {
      return "text-success";
    }
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!technician) {
      toast.error("Technician information is required");
      return;
    }

    const payload = new FormData();
    payload.append("equipmentId", dbId);
    payload.append("equipmentName", slug);
    payload.append("userName", userName);
    payload.append("capacity", capacity);
    payload.append("isWorking", isWorking);
    payload.append("comments", comments);

    // Use the 'technician' state which is now populated from userData
    payload.append("technician", JSON.stringify({
      name: technician.name,
      email: technician.email,
      // Add other properties if needed for submission, e.g.,
      // designation: technician.designation || "Technician"
    }));

    photos.filter(Boolean).forEach((photo) => {
      payload.append(`photos`, photo);
    });

    if (isWorking === "yes") {
      payload.append("columns", JSON.stringify(cfg.columns));
      payload.append("entries", JSON.stringify(cfg.rows.map(row => ({
        id: row.id,
        category: row.category,
        description: row.description,
        checks: answers[row.id]?.checks || [],
        remarks: answers[row.id]?.remarks || ""
      }))));
    }

    payload.append("timestamp", new Date().toISOString());

    try {
      const { data } = await axios.post(
        `${API_URL}/api/add-mechanicalreport`,
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
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

        {/* Technician Info */}
        <div className="col-md-6 col-12 mb-3">
          <label className="form-label">
            <strong>Technician</strong>
          </label>
          <div className="p-2 shadow bg-light rounded">
            {technician ? (
              <div className="text-success" >
                {technician.name}
                {technician.designation ? ` — ${technician.designation}` : ''}
                {" "} (<a className="text-success" href={`mailto:${technician.email}`}>{technician.email}</a>)
              </div>
            ) : (
              <div className="text-danger">Technician data not available or not logged in as a technician.</div>
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
                capture="environment"
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
                    <th style={{ backgroundColor: '#236a80', color: '#fff' }} key={col}>{col}</th>
                  ))}
                  <th style={{ backgroundColor: '#236a80', color: '#fff' }}>Remarks</th>
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
                      <td key={cidx} style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          className={`btn btn-sm me-1 ${
                            answers[row.id]?.checks[cidx] === "ok"
                              ? "btn-success"
                              : "btn-outline-secondary"
                          }`}
                          onClick={() => onCheck(row.id, cidx, "ok")}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            answers[row.id]?.checks[cidx] === "fail"
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
        )}

        <button type="submit" style={{ backgroundColor: '#236a80', color: '#fff' }} className="btn ">
          Submit Report
        </button>
      </form>
    </div>
  );
}