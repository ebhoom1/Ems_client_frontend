// src/components/ElectricalChecklist.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom"; // <-- Import useLocation

export default function ElectricalChecklist({
  equipment = {}, // This `equipment` prop might be partially filled or empty.
  powerFactor = 0.8
}) {
  // ----------------------------------------------------------------------------
  // 1) Pull logged‐in technician info from Redux
  // ----------------------------------------------------------------------------
  const { validUserOne = {} } = useSelector((state) => state.user.userData || {});
  const technician = validUserOne.isTechnician
    ? { name: validUserOne.fname, email: validUserOne.email }
    : null;

  // ----------------------------------------------------------------------------
  // 2) Get equipmentId and equipmentUserName from navigation state
  // ----------------------------------------------------------------------------
  const location = useLocation();
  // Destructure equipmentId, equipmentName, and equipmentUserName from location.state
  const { equipmentId, equipmentName, equipmentUserName } = location.state || {}; 

  // State to hold the full equipment details, potentially fetched if 'equipment' prop is incomplete
  const [fullEquipmentDetails, setFullEquipmentDetails] = useState(equipment);

  // ----------------------------------------------------------------------------
  // 3) Checklist items & phases
  // ----------------------------------------------------------------------------
  // Rows 1–3 = measurement; Rows 4–8 = remark‐only
  const checklistItems = [
    { id: 1, label: "Voltage (V)", type: "measurement", actualKey: "voltage" },
    { id: 2, label: "Current (A)", type: "measurement", actualKey: "current" },
    { id: 3, label: "Power (kW)", type: "measurement", actualKey: "power" },
    {
      id: 4,
      label: "Check starter controls and connection",
      type: "remark"
    },
    {
      id: 5,
      label:
        "Check contractor for free movement operation and take services if needed",
      type: "remark"
    },
    {
      id: 6,
      label: "Check OLR condition and note the ampere set",
      type: "remark"
    },
    { id: 7, label: "Check earthing", type: "remark" },
    {
      id: 8,
      label: "Examine for any exposed cables, cable joint and bus bars",
      type: "remark"
    }
  ];

  // For rows 1–3, we use these keys under “Measurement”:
  const phases = ["RY", "YB", "BR"];
  // For row 2 (Current), map RY→R, YB→Y, BR→B
  const curPhases = ["R", "Y", "B"];

  // ----------------------------------------------------------------------------
  // 4) Responses state: each row gets “actual” + each phase + “remark” text + “remarkStatus”
  // ----------------------------------------------------------------------------
  const [responses, setResponses] = useState(() =>
    checklistItems.reduce((acc, item) => {
      if (item.type === "measurement") {
        acc[item.id] = {
          actual:       equipment[item.actualKey] ?? "", // Initial from prop
          RY:           "",
          YB:           "",
          BR:           "",
          R:            "",
          Y:            "",
          B:            "",
          remark:       "",
          remarkStatus: ""
        };
      } else {
        acc[item.id] = {
          remark:       "",
          remarkStatus: ""
        };
      }
      return acc;
    }, {})
  );

  // ----------------------------------------------------------------------------
  // 5) Effect to fetch full equipment details if needed (and update initial 'actual' values)
  // ----------------------------------------------------------------------------
  useEffect(() => {
    const fetchFullEquipment = async () => {
      if (equipmentId) { // Use the equipmentId from location.state
        try {
          const response = await axios.get(`${API_URL}/api/get-equipment/${equipmentId}`);
          const fetchedEquipment = response.data.equipment;
          if (fetchedEquipment) {
            setFullEquipmentDetails(fetchedEquipment);
            // Update initial 'actual' values based on fetched equipment
            setResponses(prevResponses => {
              const newResponses = { ...prevResponses };
              checklistItems.forEach(item => {
                if (item.type === "measurement" && fetchedEquipment[item.actualKey] !== undefined) {
                  newResponses[item.id] = {
                    ...newResponses[item.id],
                    actual: fetchedEquipment[item.actualKey]
                  };
                }
              });
              return newResponses;
            });
          }
        } catch (error) {
          console.error("Error fetching full equipment details:", error);
          // Fallback to initial 'equipment' prop if fetching fails
          setFullEquipmentDetails(equipment);
        }
      }
    };
    // Only fetch if initial 'equipment' prop doesn't have enough details
    // For example, if it only came with _id, name, and you need capacity, ratedLoad etc.
    if (!fullEquipmentDetails.capacity || !fullEquipmentDetails.ratedLoad) {
      fetchFullEquipment();
    }
  }, [equipmentId, equipment]); // Depend on equipmentId from location.state and initial 'equipment' prop

  // ----------------------------------------------------------------------------
  // 6) Auto-calculate Power (row 3) when Voltage (row 1) or Current (row 2) change
  // ----------------------------------------------------------------------------
  useEffect(() => {
    const voltRow = responses[1];
    const currRow = responses[2];
    if (
      phases.every((p) => voltRow[p]) &&
      curPhases.every((p) => currRow[p])
    ) {
      const newPowerValues = {};
      phases.forEach((p, idx) => {
        const V = parseFloat(voltRow[p]);
        const I = parseFloat(currRow[curPhases[idx]]);
        if (!isNaN(V) && !isNaN(I)) {
          newPowerValues[p] = (
            (Math.sqrt(3) * V * I * powerFactor) /
            1000
          ).toFixed(6);
        } else {
          newPowerValues[p] = "";
        }
      });
      setResponses((prev) => ({
        ...prev,
        3: { ...prev[3], ...newPowerValues }
      }));
    }
  }, [responses[1], responses[2], powerFactor]);

  // ----------------------------------------------------------------------------
  // 7) Handlers for measurement & remark text
  // ----------------------------------------------------------------------------
  const onActualChange = (id, value) =>
    setResponses((prev) => ({
      ...prev,
      [id]: { ...prev[id], actual: value }
    }));

  const onMeasChange = (id, phaseKey, value) =>
    setResponses((prev) => ({
      ...prev,
      [id]: { ...prev[id], [phaseKey]: value }
    }));

  const onRemarkTextChange = (id, text) =>
    setResponses((prev) => ({
      ...prev,
      [id]: { ...prev[id], remark: text }
    }));

  // ----------------------------------------------------------------------------
  // 8) Toggle handler for “remarkStatus” in rows 4–8
  // ----------------------------------------------------------------------------
  const toggleRemarkStatus = (id, newValue) => {
    setResponses((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([key, row]) => {
          if (parseInt(key) !== id) return [key, row];
          const current = row.remarkStatus;
          return [key, { ...row, remarkStatus: current === newValue ? "" : newValue }];
        })
      )
    );
  };

  // ----------------------------------------------------------------------------
  // 9) Determine text color in measurements (red if measured > actual, green otherwise)
  // ----------------------------------------------------------------------------
  function getColorForMeasurement(id, phaseKey) {
    const measured = parseFloat(responses[id][phaseKey]);
    const actual   = parseFloat(responses[id].actual);
    if (isNaN(measured) || isNaN(actual)) {
      return "black";
    }
    return measured > actual ? "red" : "green";
  }

  // ----------------------------------------------------------------------------
  // 10) Determine CSS class for remark text input under rows 4–8
  //    ("text-success" if pass, "text-danger" if fail)
  // ----------------------------------------------------------------------------
  const getRemarksColor = (id) => {
    const status = responses[id].remarkStatus;
    if (status === "pass") return "text-success";
    if (status === "fail") return "text-danger";
    return "";
  };

  // ----------------------------------------------------------------------------
  // 11) Submit handler: POST entire `responses` object
  // ----------------------------------------------------------------------------
   const onSubmit = async (e) => {
    e.preventDefault();
    if (!technician) {
      alert("Please enter technician details first.");
      return;
    }
    if (!equipmentId || !equipmentUserName) {
      alert("Equipment details (ID or User Name) are missing. Cannot save report.");
      return;
    }

    try {
      const payload = {
        equipmentId,
        technician,
        equipment: fullEquipmentDetails,
        responses,
        userName: equipmentUserName,
        hasElectricalReport: true   // ← flag will now be saved
      };
      await axios.post(
        `${API_URL}/api/add-electricalreport`,
        payload
      );
      alert("Electrical report saved successfully!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save report. Please try again.");
    }
  };


  // ----------------------------------------------------------------------------
  // 12) Split out remark‐only rows (IDs 4–8)
  // ----------------------------------------------------------------------------
  const remarkOnlyRows = checklistItems.filter((item) => item.type === "remark");

  // ----------------------------------------------------------------------------
  // 13) Styles
  // ----------------------------------------------------------------------------
  const thMeasurement = {
    border: "1px solid #000",
    padding: 6,
    backgroundColor: "#236a80",
    color: "#fff",
    textAlign: "center"
  };
  const tdMeasurement = {
    border: "1px solid #000",
    padding: 6
  };
  const tdCenterMeasurement = {
    ...tdMeasurement,
    textAlign: "center",
    verticalAlign: "middle"
  };
  const inputMeasurement = {
    width: "80%",
    padding: 4,
    boxSizing: "border-box"
  };
  const saveButton = {
    padding: "8px 16px",
    backgroundColor: "#236a80",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer"
  };

  // ----------------------------------------------------------------------------
  // 14) Render
  // ----------------------------------------------------------------------------
  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* ---------- Technician Section ---------- */}
      <div className="shadow" style={{ marginBottom: 20, padding: 10, border: "1px solid #ccc", borderRadius: 10 }}>
        {technician ? (
          <div><strong>Technician:</strong> {technician.name} (<a href={`mailto:${technician.email}`}>{technician.email}</a>)</div>
        ) : (
          <div className="text-danger">You are not logged in as a technician.</div>
        )}
      </div>

      {/* ---------- Equipment Info ---------- */}
      <h2 style={{ textAlign: "center" }}>Electrical Report</h2>
      <div style={{ marginBottom: 16 }}>
        <strong>Equipment:</strong> {fullEquipmentDetails?.equipmentName || fullEquipmentDetails?.name || "—"}
        <br />
        <strong>Model:</strong> {fullEquipmentDetails?.modelSerial || fullEquipmentDetails?.model || "—"}
        <br />
        <strong>Capacity:</strong> {fullEquipmentDetails?.capacity || "—"}
        <br />
        <strong>Rated Load:</strong> {fullEquipmentDetails?.ratedLoad || "—"}
        <br />
        <strong>Managed By (User):</strong> {equipmentUserName || "N/A"} {/* Displaying equipmentUserName */}
      </div>

      {/* ---------- Table for Rows 1–3 (Measurement Rows) ---------- */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thMeasurement} rowSpan={2}>
              Sl.no
            </th>
            <th style={thMeasurement} rowSpan={2}>
              Category
            </th>
            <th style={thMeasurement} rowSpan={2}>
              ACTUAL
            </th>
            <th style={thMeasurement} colSpan={3}>
              MEASUREMENT
            </th>
            <th style={thMeasurement} rowSpan={2}>
              REMARKS
            </th>
          </tr>
          <tr>
            {phases.map((p) => (
              <th key={p} style={thMeasurement}>
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {checklistItems.map((item) =>
            item.type === "measurement" ? (
              <tr key={item.id}>
                {/* Sl.no */}
                <td style={tdCenterMeasurement}>{item.id}</td>

                {/* Category */}
                <td style={tdMeasurement}>{item.label}</td>

                {/* ACTUAL */}
                <td style={tdCenterMeasurement}>
                  <input
                    type="number"
                    placeholder={fullEquipmentDetails[item.actualKey] ?? ""}
                    value={responses[item.id].actual}
                    onChange={(e) =>
                      onActualChange(item.id, e.target.value)
                    }
                    style={inputMeasurement}
                  />
                </td>

                {/* RY, YB, BR (Color-coded) */}
                {phases.map((p, idx) => {
                  let phaseKey = p;
                  if (item.id === 2) {
                    // For Current row, map RY→R, YB→Y, BR→B
                    phaseKey = curPhases[idx];
                  }
                  return (
                    <td key={p} style={tdCenterMeasurement}>
                      <input
                        type="number"
                        placeholder={
                          item.id === 1
                            ? p
                            : item.id === 2
                            ? p.charAt(0)
                            : ""
                        }
                        value={responses[item.id][phaseKey]}
                        onChange={(e) =>
                          onMeasChange(item.id, phaseKey, e.target.value)
                        }
                        style={{
                          ...inputMeasurement,
                          color: getColorForMeasurement(
                            item.id,
                            phaseKey
                          )
                        }}
                        readOnly={item.id === 3}
                      />
                    </td>
                  );
                })}

                {/* REMARKS spans rows 1–3 */}
                {item.id === 1 && (
                  <td style={tdMeasurement} rowSpan={3}>
                    <input
                      type="text"
                      placeholder="Enter remark"
                      value={responses[1].remark}
                      onChange={(e) =>
                        onRemarkTextChange(1, e.target.value)
                      }
                      style={inputMeasurement}
                    />
                  </td>
                )}
              </tr>
            ) : null
          )}
        </tbody>
      </table>

      {/* ---------- Table for Rows 4–8 (Remark‐Only Rows) ---------- */}
      <div className="table-responsive" style={{ marginTop: 20 }}>
        <table className="table table-bordered">
          <tbody>
            {remarkOnlyRows.map((row, idx) => (
              <tr key={row.id}>
                {/* # */}
                <td>{idx + 1}</td>

                {/* Category */}
                <td>Electrical</td>

                {/* Description */}
                <td>{row.label}</td>

                {/* Process Status: ✓ / ✕ (Bootstrap‐styled) */}
                <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    className={`btn btn-sm me-1 ${
                      responses[row.id].remarkStatus === "pass"
                        ? "btn-success"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => toggleRemarkStatus(row.id, "pass")}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      responses[row.id].remarkStatus === "fail"
                        ? "btn-danger"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => toggleRemarkStatus(row.id, "fail")}
                  >
                    ✕
                  </button>
                </td>

                {/* Remarks: free‐text input, colored by pass/fail */}
                <td>
                  <input
                    type="text"
                    placeholder="Enter remark"
                    value={responses[row.id].remark}
                    onChange={(e) =>
                      onRemarkTextChange(row.id, e.target.value)
                    }
                    className={`form-control ${getRemarksColor(row.id)}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- Save Button ---------- */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button type="submit" style={saveButton}>
          Save Report
        </button>
      </div>
    </form>
  );
}