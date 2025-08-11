

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
  { id: 17, category: "Other observation if any", description: "" },
];

const blowerChecklist = [
  { id: 1, category: "Check for safety Guards", description: "" },
  { id: 2, category: "Noise level in dB", description: "" },
  { id: 3, category: "Direction of rotation", description: "" },
  { id: 4, category: "Check for Vibration", description: "" },
  {
    id: 5,
    category: "Check if the blower is running smoothly",
    description: "",
  },
  { id: 6, category: "Check if motor is running smoothly", description: "" },
  { id: 7, category: "Check for oil & Grease leakage", description: "" },
  { id: 8, category: "Check if greasing is done", description: "" },
  {
    id: 9,
    category: "Check for blower Bearing sound & damage",
    description: "",
  },
  {
    id: 10,
    category: "Check for motor Bearing sound & damage",
    description: "",
  },
  { id: 11, category: "Check for Valve & pipe line & Damage", description: "" },
  {
    id: 12,
    category: "Check the discharge pressures in Kg/cm2",
    description: "",
  },
  { id: 13, category: "Check for pressure relief valves", description: "" },
  { id: 14, category: "Check for Air filter cleaning", description: "" },
  { id: 15, category: "Check for pulley alignment", description: "" },
  { id: 16, category: "Check for V-belt condition", description: "" },
  { id: 17, category: "Check for base support", description: "" },
  {
    id: 18,
    category: "Check for motor cooling fan condition",
    description: "",
  },
  { id: 19, category: "Other observations if any", description: "" },
];

const mechanicalConfig = {
  "shared-standard-pump": {
    rows: standardPumpChecklist,
  },
  "bar-screen": {
    rows: [
      { id: 1, category: "Material Type", description: "" },
      { id: 2, category: "Check for any damages", description: "" },
      { id: 3, category: "Fixed/Removable", description: "" },
      { id: 4, category: "Other observations if any", description: "" },
    ],
  },
  "oil-skimmer": {
    rows: [
      { id: 1, category: "Check for safety Guards", description: "" },
      { id: 2, category: "Direction of rotation", description: "" },
      { id: 3, category: "Check for Gear box sound", description: "" },
      { id: 4, category: "Check for Motor Condition", description: "" },
      { id: 5, category: "Check belt quality", description: "" },
      {
        id: 6,
        category: "Check for Star bush & coupling damage",
        description: "",
      },
      { id: 7, category: "Check for Bearing sound & damage", description: "" },
      { id: 8, category: "Check for Oil collection tray", description: "" },
      { id: 9, category: "Check for pulley condition", description: "" },
      { id: 10, category: "Check for base support", description: "" },
      { id: 11, category: "Other observations if any", description: "" },
    ],
  },
  "raw-sewage-pump": {
    rows: [
      {
        id: 1,
        category: "Type of Pump",
        description: "Submersible / Centrifugal pump",
      },
      { id: 2, category: "Check for safety Guards", description: "" },
      { id: 3, category: "Direction of rotation", description: "" },
      { id: 4, category: "Check for Impeller sound", description: "" },
      {
        id: 5,
        category: "Check if the Pump is running smoothly",
        description: "",
      },
      {
        id: 6,
        category: "Check for oil, Grease & water leakage",
        description: "",
      },
      {
        id: 7,
        category: "Check for Star bush & coupling damage",
        description: "",
      },
      { id: 8, category: "Check for Bearing sound & damage", description: "" },
      {
        id: 9,
        category: "Check for Valve & pipe line blockage",
        description: "",
      },
      { id: 10, category: "Check for Vibration", description: "" },
      {
        id: 11,
        category: "Check for terminal loose connection",
        description: "",
      },
      { id: 12, category: "Check for discharge pressure", description: "" },
      {
        id: 13,
        category: "Check if the NRV is in working condition",
        description: "",
      },
      { id: 14, category: "Other observations if any", description: "" },
    ],
  },
  "mbr-air-blower": {
    // Renamed for clarity and generalization
    rows: blowerChecklist,
  },
  "et&at-air-blower": {
    // Renamed for clarity and generalization
    rows: blowerChecklist,
  },
  "filter-press-unit": {
    rows: [
      {
        id: 1,
        category: "Check for the filter press cloth condition",
        description: "",
      },
      { id: 2, category: "Check for all connected valves", description: "" },
      {
        id: 3,
        category: "Check for all the pressure gauges working condition",
        description: "",
      },
      { id: 4, category: "Check for the hydraulic unit", description: "" },
      { id: 5, category: "Other observation if any", description: "" },
    ],
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
      { id: 10, category: "Other Observations", description: "" },
    ],
  },

  "softener-unit": {
    columns: ["Process Status"],
    rows: [
      { id: 1, category: "Inlet Pressure", description: "" },
      { id: 2, category: "Outlet Pressure", description: "" },
      {
        id: 3,
        category: "Check if Butterfly/ multiport valves working",
        description: "",
      },
      { id: 4, category: "Check for inlet hardness", description: "" },
      { id: 5, category: "Check for outlet hardness", description: "" },
      { id: 6, category: "Check for any Damage", description: "" },
      { id: 7, category: "Check for Condition of pipelines", description: "" },
      { id: 8, category: "Check Flow rate", description: "" },
      { id: 9, category: "Check if re-generation is done", description: "" },
      { id: 10, category: "Check for Condition of Vessel", description: "" },
      { id: 11, category: "Check Brine tank condition", description: "" },
      { id: 12, category: "Other Observations", description: "" },
    ],
  },

  "agitator-mechanism": {
    rows: [
      {
        id: 1,
        category: "Type of the Mechanism",
        description: "Direct Coupled / Chain driven / Belt Driven",
      },
      { id: 2, category: "Check for safety Guards", description: "" },
      { id: 3, category: "Direction of rotation", description: "" },
      { id: 4, category: "Check for Gear Box sound", description: "" },
      {
        id: 5,
        category: "Check if the Motor is running smoothly or not",
        description: "",
      },
      { id: 6, category: "Check the oil level", description: "" },
      {
        id: 7,
        category: "Check for Star bush & coupling damage (Size)",
        description: "",
      },
      { id: 8, category: "Check for Bearing sound & damage", description: "" },
      { id: 9, category: "Check if Oil replacement is done", description: "" },
      { id: 10, category: "Check for the Vibration", description: "" },
      { id: 11, category: "Other observation if any", description: "" },
    ],
  },
  "flash-mixer": {
    rows: [
      {
        id: 1,
        category: "Type of the Mechanism",
        description: "Direct Coupled, Chain driven, Belt Driven",
      },
      { id: 2, category: "Check for safety Guards", description: "" },
      { id: 3, category: "Direction of rotation", description: "working" },
      { id: 4, category: "Check for Gear Box sound", description: "Good Condition" },
      {
        id: 5,
        category: "Check if the Motor is Running smoothly or not",
        description: ""
      },
      { id: 6, category: "Check the oil level", description: "" },
      { id: 7, category: "Check for Star bush & coupling damage (Size)", description: "" },
      { id: 8, category: "Check for Bearing sound & damage", description: "" },
      { id: 9, category: "Check if Oil replacement is done", description: "" },
      { id: 10, category: "Check for the Vibration", description: "" },
      { id: 11, category: "Other observation if any", description: "" },
    ]
  },
  "clarifier-mechanism": {
    rows: [
      { id: 1, category: "Type of the Mechanism", description: "Belt Driven" },
      { id: 2, category: "Check for safety Guards", description: "Checked ok" },
      { id: 3, category: "Direction of rotation", description: "Ok" },
      { id: 4, category: "Check for Gear Box sound", description: "Normal" },
      { id: 5, category: "Check if the Motor is Running smoothly or not", description: "OK" },
      { id: 6, category: "Check the oil level", description: "Checked" },
      { id: 7, category: "Check for Star bush & coupling damage (Size)", description: "NA" },
      { id: 8, category: "Check for Bearing sound & damage.", description: "No Damage" },
      { id: 9, category: "Check if Oil replacement is done", description: "" },
      { id: 10, category: "Check for the Vibration", description: "No vibration" },
      { id: 11, category: "Other observation if any", description: "" },
    ]
  },
  "fresh-air": {
  rows: [
    { id: 1, category: "Check for safety Guards", description: "" },
    { id: 2, category: "Direction of rotation", description: "" },
    { id: 3, category: "Check for Gear box sound", description: "" },
    { id: 4, category: "Check for Motor condition", description: "" },
    { id: 5, category: "Check belt quality", description: "" },
    { id: 6, category: "Check for Star bush & coupling damage", description: "" },
    { id: 7, category: "Check for Bearing sound & damage", description: "" },
    { id: 8, category: "Check for Oil collection tray", description: "" },
    { id: 9, category: "Check for pulley condition", description: "" },
    { id: 10, category: "Check for base support", description: "" },
    { id: 11, category: "Other observations if any", description: "" },
  ],
},
 "exhaust": {
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
  "clariflocculator-mechanism": {
    rows: [
      { id: 1, category: "Type of the Mechanism", description: "Belt Driven" },
      { id: 2, category: "Check for safety Guards", description: "Checked ok" },
      { id: 3, category: "Direction of rotation", description: "Normal" },
      { id: 4, category: "Check for Gear Box sound", description: "normal" },
      { id: 5, category: "Check if the Motor is Running smoothly or not", description: "Running Smoothly" },
      { id: 6, category: "Check the oil level", description: "Checked ok" },
      { id: 7, category: "Check for Star bush & coupling damage (Size)", description: "NA" },
      { id: 8, category: "Check for Bearing sound & damage", description: "NO Damage" },
      { id: 9, category: "Check if Oil replacement is done", description: "" },
      { id: 10, category: "Check for the Vibration", description: "Normal" },
      { id: 11, category: "Other observation if any", description: "" },
    ]
  },
  "centrifuge-unit": {
    rows: [
      { id: 1, category: "Check for the Centrifuge cloth condition", description: "" },
      { id: 2, category: "Check for all connected pipes & valves", description: "" },
      { id: 3, category: "Check for all the pressure gauges working condition", description: "" },
      { id: 4, category: "Check for condition of transmission belt", description: "" },
      { id: 5, category: "Check for Vibration", description: "" },
      { id: 6, category: "Check the direction of rotation", description: "" },
      { id: 7, category: "Check for tightness of all fasteners", description: "" },
      { id: 8, category: "Other observation if any", description: "" },
    ]
  },
  "motor": {
    rows: [
      { id: 1, category: "Check for safety guards", description: "" },
      { id: 2, category: "Direction of Rotation", description: "" },
      { id: 3, category: "Impeller sound", description: "" },
      { id: 4, category: "Pump running smoothly", description: "" },
      { id: 5, category: "Check Oil & Grease & water leakage", description: "" },
      { id: 6, category: "Star bush & Coupling damage", description: "" },
      { id: 7, category: "Bearing sound & damage", description: "" },
      { id: 8, category: "Valve & Pipe line if damaged", description: "" },
      { id: 9, category: "Vibration", description: "" },
    ]
  },
  "gensludge": {
    rows: [
      { id: 1, category: "Total number of Sludge bags available", description: "(Size)" },
      { id: 2, category: "Days taking for one bag to dry", description: "" },
      { id: 3, category: "Check for Leakage", description: "" },
    ]
  },
  "sludge holding unit":{
    rows: [
      {
        id: 1,
        category: "Check for the filter press cloth condition",
        description: "",
      },
      { id: 2, category: "Check for all connected valves", description: "" },
      {
        id: 3,
        category: "Check for all the pressure gauges working condition",
        description: "",
      },
      { id: 4, category: "Check for the hydraulic unit", description: "" },
      { id: 5, category: "Other observation if any", description: "" },
    ],
  },
  "dosing-pump": {
    rows: [
      { id: 1, category: "Check the foot valve and NRV pipe", description: "" },
      { id: 2, category: "Check chemical level in the tank", description: "" },
      { id: 3, category: "Check for filter blockage", description: "" },
      { id: 4, category: "Check if pump is running smoothly", description: "" },
      { id: 5, category: "Other observations if any", description: "" },
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
if (lowerName.includes("fresh air") || lowerName.includes("fresh-air")) return "fresh-air";
if (lowerName.includes("exhaust")) return "exhaust";
    if (lowerName.includes("pump")) {
      if (
        lowerName.includes("raw sewage pump") ||
        lowerName.includes("raw sewage transfer pump")
      ) {
        return "raw-sewage-pump";
      }
      if (lowerName.includes("dosing pump")) return "dosing-pump";

      return "shared-standard-pump";
    }

    if (lowerName.includes("blower")) {
      if (lowerName.includes("mbr air blower")) return "mbr-air-blower";
      if (
        lowerName.includes("et&at air blower") ||
        lowerName.includes("eq & at air blower") ||
        lowerName.includes("air blower at & et")
      ) {
        return "et&at-air-blower";
      }
      return "et&at-air-blower";
    }

    if (lowerName.includes("bar screen")) return "bar-screen";
    if (lowerName.includes("oil skimmer")) return "oil-skimmer";
    // if (lowerName.includes("agitator") || lowerName.includes("mixer"))
    if (lowerName.includes("agitator")) return "agitator-mechanism";
    if (lowerName.includes("flash mixer")) return "flash-mixer";
    if (lowerName.includes("clarifier mechanism")) return "clarifier-mechanism";
    if (lowerName.includes("clariflocculator mechanism")) return "clariflocculator-mechanism";
    if (lowerName.includes("centrifuge unit")) return "centrifuge-unit";
    if (lowerName.includes("motor")) return "motor";
    if (lowerName.includes("gensludge")) return "gensludge";
    if (lowerName.includes("sludge holding unit")) return "sludge holding unit";
    if (lowerName.includes("sludge holding unit")) return "sludge holding unit";
    // if (lowerName.includes("dosing pump")) return "dosing pump";

    if (
      lowerName.includes("filter press") ||
      lowerName.includes("screw pump") ||
      lowerName.includes("sludge pump") ||
      // lowerName.includes("dosing pump") ||
      lowerName.includes("hydraulic filter press pump") ||
      lowerName.includes("polymer dosing pump") ||
      lowerName.includes("out side bypass pump")
    )
      return "filter-press-unit";

    if (lowerName.includes("psf") || lowerName.includes("acf"))
      return "psf-acf-unit";
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
    const defaultColumns = mechanicalConfig[matchedKey]?.columns || [
      "Process Status",
    ];
    return defaultColumns;
  };

  const originalCfg = matchedKey
    ? {
        ...mechanicalConfig[matchedKey],
        columns: initialColumns(),
      }
    : { columns: [], rows: [] };

  // pull only the territorial manager data
  const { validUserOne = {} } = useSelector(
    (state) => state.user.userData || {}
  );
  const [manager, setManager] = useState(null);

  const [cfg, setCfg] = useState(originalCfg);
  const [answers, setAnswers] = useState({});
  const [isWorking, setIsWorking] = useState("yes");
  const [comments, setComments] = useState("");
  // photos will now store objects { url: string } for existing, or File for new
  const [photos, setPhotos] = useState([]);
  const [existingReportId, setExistingReportId] = useState(null); // To store _id of existing report

  // detect pump/blower to allow adding columns
  const isPump = matchedKey?.includes("pump");
  const isBlower = matchedKey?.includes("blower");

  // Fetch equipment details and existing report on component mount
  useEffect(() => {
    if (!dbId) return;

    const fetchEquipmentAndReport = async () => {
      try {
        // Fetch equipment details
        const equipmentRes = await axios.get(`${API_URL}/api/equiment/${dbId}`);
        const equipment = equipmentRes.data?.equipment;
        if (equipment) {
          setUserName(equipment.userName || "");
          setCapacity(equipment.capacity || "");
        }

        // Fetch existing mechanical report for the current month
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // JS months are 0-11

        const reportRes = await axios.get(
          `${API_URL}/api/mechanicalreport/equipment/${dbId}?year=${currentYear}&month=${currentMonth}`
        );
        const fetchedReport = reportRes.data?.report;
        console.log("fetchedReport:",fetchedReport);
        if (fetchedReport) {
          setExistingReportId(fetchedReport._id);
          setIsWorking(fetchedReport.isWorking);
          setComments(fetchedReport.comments);

          // Set photos from fetched report (URLs)
          setPhotos(fetchedReport.photos.map((url) => ({ url })));

          // Reconstruct answers from fetched report entries
          const newAnswers = {};
          const fetchedColumns = fetchedReport.columns || initialColumns(); // Use fetched columns or default

          // Update cfg with fetched columns
          setCfg((c) => ({
            ...c,
            columns: fetchedColumns,
            rows: c.rows, // Keep original rows based on equipment type
          }));

          fetchedReport.entries.forEach((entry) => {
            const checksArray = Array(fetchedColumns.length).fill(""); // Initialize with empty strings
            entry.checks.forEach((check) => {
              const colIndex = fetchedColumns.indexOf(check.column);
              if (colIndex !== -1) {
                checksArray[colIndex] = check.value;
              }
            });
            newAnswers[entry.id] = {
              checks: checksArray,
              remarks: entry.remarks || "",
            };
          });
          setAnswers(newAnswers);
        } else {
          // If no existing report, initialize answers based on current config
          const init = {};
          originalCfg.rows.forEach((row) => {
            init[row.id] = {
              checks: Array(originalCfg.columns.length).fill(""),
              remarks: "",
            };
          });
          setAnswers(init);
          setPhotos([]); // Ensure photos are empty if no report
        }
      } catch (err) {
        console.error("❌ Error fetching equipment details or report:", err);
        // If report not found (404), it's fine, just means no existing report
        if (err.response && err.response.status !== 404) {
          toast.error("Could not fetch equipment details or existing report.");
        }
        // Ensure answers are initialized even if fetching fails
        const init = {};
        originalCfg.rows.forEach((row) => {
          init[row.id] = {
            checks: Array(originalCfg.columns.length).fill(""),
            remarks: "",
          };
        });
        setAnswers(init);
        setPhotos([]);
      }
    };

    fetchEquipmentAndReport();
  }, [dbId, location.state?.equipmentName]); // Re-run if equipmentId or name changes

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
    // If it's an existing photo URL being replaced, or a new file
    if (newPhotos[index] && newPhotos[index].url) {
      // Replace existing URL object with new File object
      newPhotos[index] = file;
    } else {
      // Add new file or replace existing file
      newPhotos[index] = file;
    }
    setPhotos(newPhotos);
  };

  const addPhotoField = () => {
    setPhotos([...photos, null]); // Add a placeholder for a new file input
  };

  // Remove a photo field (and its associated file/URL)
  const removePhotoField = (indexToRemove) => {
    setPhotos((prevPhotos) =>
      prevPhotos.filter((_, idx) => idx !== indexToRemove)
    );
  };

  const addAdditionalColumn = () => {
    if (isPump || isBlower) {
      const prefix = isPump ? "Pump" : "Blower";
      const newCol = `${prefix} ${cfg.columns.length + 1}`;
      setCfg((c) => ({ ...c, columns: [...c.columns, newCol] }));
      setAnswers((a) => {
        const copy = { ...a };
        Object.values(copy).forEach((r) => r.checks.push("")); // Add an empty check for the new column
        return copy;
      });
    }
  };

  const onCheck = (rowId, idx, val) => {
    setAnswers((a) => ({
      ...a,
      [rowId]: {
        ...a[rowId],
        checks: a[rowId].checks.map((c, i) => (i === idx ? val : c)),
      },
    }));
  };

  const onRemarks = (rowId, val) => {
    setAnswers((a) => ({
      ...a,
      [rowId]: { ...a[rowId], remarks: val },
    }));
  };

  const getRemarksColor = (rowId) => {
    const checks = answers[rowId]?.checks || [];
    if (checks.some((c) => c === "fail")) return "text-danger";
    if (checks.every((c) => c === "ok")) return "text-success";
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
    payload.append("capacity", capacity);
    payload.append("isWorking", isWorking);
    payload.append("comments", comments);
    payload.append(
      "territorialManager",
      JSON.stringify({
        name: manager.name,
        email: manager.email,
      })
    );

    // Append only new File objects (not existing URLs) to FormData
    photos.forEach((item) => {
      if (item instanceof File) {
        // Check if it's a File object (newly uploaded)
        payload.append("photos", item);
      }
    });

    if (isWorking === "yes") {
      payload.append("columns", JSON.stringify(cfg.columns));
      payload.append(
        "entries",
        JSON.stringify(
          cfg.rows.map((r) => ({
            id: r.id,
            category: r.category,
            description: r.description,
            checks: answers[r.id]?.checks || [],
            remarks: answers[r.id]?.remarks || "",
          }))
        )
      );
    }

    payload.append("timestamp", new Date().toISOString()); // Always update timestamp on submission

    try {
      const url = `${API_URL}/api/add-mechanicalreport`; // This endpoint now handles upsert
      const { data } = await axios.post(url, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        toast.success("Report submitted successfully!");
        
        navigate("/services?tab=equipmentList");
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
          <label className="form-label">
            <strong>Territorial Manager</strong>
          </label>
          <div className="p-2 shadow bg-light rounded">
            {manager ? (
              <div className="text-success">
                {manager.name} (
                <a href={`mailto:${manager.email}`}>{manager.email}</a>)
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
          <label className="form-label">
            <strong>Is the Equipment Working?</strong>
          </label>
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
          <label className="form-label">
            <strong>Comments</strong>
          </label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Enter any comments about the equipment..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">
            <strong>Upload Photos</strong>
          </label>
          {photos.map((item, idx) => (
            <div key={idx} className="mb-2 d-flex align-items-center">
              {item && item.url ? ( // If it's an existing URL
                <div className="me-2">
                  <img
                    src={item.url}
                    alt={`Existing Photo ${idx + 1}`}
                    style={{
                      width: "100px",
                      height: "auto",
                      borderRadius: "5px",
                    }}
                  />
                </div>
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(idx, e.target.files[0])}
                className="form-control"
              />
              {photos.length > 0 && ( // Allow removing if there's at least one photo field
                <button
                  type="button"
                  className="btn btn-danger btn-sm ms-2"
                  onClick={() => removePhotoField(idx)}
                >
                  Remove
                </button>
              )}
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
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                    #
                  </th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                    Category
                  </th>
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                    Description
                  </th>
                  {cfg.columns.map((col) => (
                    <th
                      key={col}
                      style={{ backgroundColor: "#236a80", color: "#fff" }}
                    >
                      {col}
                    </th>
                  ))}
                  <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
                    Remarks
                  </th>
                  {(isPump || isBlower) && (
                    <th style={{ backgroundColor: "#236a80", color: "#fff" }}>
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
                    remarks: "",
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
                            className={`btn btn-sm me-1 ${
                              rowData.checks[cidx] === "ok"
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
                              rowData.checks[cidx] === "fail"
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

        <button
          type="submit"
          className="btn"
          style={{ backgroundColor: "#236a80", color: "#fff" }}
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}
