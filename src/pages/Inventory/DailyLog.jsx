// DailyLog.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";

const times = [
  "7.00",
  "8.00",
  "9.00",
  "10.00",
  "11.00",
  "12.00",
  "13.00",
  "14.00",
  "15.00",
  "16.00",
  "17.00",
  "18.00",
  "19.00",
  "20.00",
  "21.00",
  "22.00",
  "23.00",
  "24.00",
  "1.00",
  "2.00",
  "3.00",
  "4.00",
  "5.00",
  "6.00",
];

const initialTreatedWaterParams = [
  "Quality",
  "Color",
  "Odour",
  "P.H",
  "MLSS",
  "Hardness",
];
const initialChemicals = ["NaOCl", "NaCl", "Lime Powder"];
const backwashItems = ["PSF-", "ASF-", "Softener-"];
const runningHours = [
  "MBR Permeate Pump Main →",
  "MBR Permeate Pump Standby →",
  "MBR Back wash Pump →",
  "MBR Chemical Cleaning Pump →",
  "Filter Press Operating Time →",
];

export default function DailyLog() {
  const { userData } = useSelector((s) => s.user);
  const validUser = userData?.validUserOne || {};
  const isUser = validUser.userType === "user";

  const [msg, setMsg] = useState("");
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [treatedWaterParams, setTreatedWaterParams] = useState(
    initialTreatedWaterParams
  );
  const [chemicals, setChemicals] = useState(initialChemicals);
  const containerRef = useRef();
  const [statusTimes, setStatusTimes] = useState({});
  const [selectedUser, setSelectedUser] = useState(validUser.userName || "");
  const [userList, setUserList] = useState([]);
  const [capacity, setCapacity] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedUserCompany, setSelectedUserCompany] = useState(
    validUser.companyName || ""
  );
  const [existingImages, setExistingImages] = useState([]);
  const [flowReadings, setFlowReadings] = useState([
    {
      shift: "Shift 1",
      operatorName: "",
      inlet: { initial: "", final: "", total: "" },
      outlet: { initial: "", final: "", total: "" },
    },
    {
      shift: "Shift 2",
      operatorName: "",
      inlet: { initial: "", final: "", total: "" },
      outlet: { initial: "", final: "", total: "" },
    },
    {
      shift: "Shift 3",
      operatorName: "",
      inlet: { initial: "", final: "", total: "" },
      outlet: { initial: "", final: "", total: "" },
    },
  ]);

  // Fetch user list if user is operator
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/getallusers`);
        const data = await res.json();
        console.log("data", data);

        // Filter users with the same adminType and userType === "user"
        const filteredUsers = data.users.filter(
          (user) =>
            user.adminType === validUser.adminType && user.userType === "user"
        );
        setUserList(filteredUsers);
      } catch (error) {
        console.error("Failed to load user list", error);
      }
    };
    if (validUser.isOperator) {
      fetchUsers();
    }
  }, [validUser]);

  // Fetch equipment list on component mount
  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      setMsg("");
      try {
        const userToFetch = validUser.isOperator
          ? selectedUser
          : validUser.userName;

        if (!userToFetch) return;

        const res = await fetch(`${API_URL}/api/user/${userToFetch}`);
        if (!res.ok)
          throw new Error(
            "Failed to fetcFailed to load equipment listh equipment"
          );
        const data = await res.json();
        console.log("equipement list", data);
        setEquipmentList(data.equipment.map((item) => item.equipmentName));
        setMsg("");
      } catch (err) {
        console.error("Error fetching equipment:", err);
        setMsg("Failed to load equipment list");
      } finally {
        setLoading(false);
      }
    };

    const userToFetch = validUser.isOperator
      ? selectedUser
      : validUser.userName;
    if (userToFetch) fetchEquipment();
  }, [selectedUser, validUser.userName]);

  // Fetch today's log if user is operator and selectedUser is set
  useEffect(() => {
    const fetchExistingLog = async () => {
      const dateInput = validUser.isOperator ? 
        document.getElementById("log-date")?.value :
        new Date().toISOString().split("T")[0];
      if (!selectedUserCompany || !dateInput) return;

      try {
        const res = await fetch(
          `${API_URL}/api/dailylog/${selectedUserCompany}/${dateInput}`
        );

        console.log("selectedUserCompany", res);
        if (!res.ok) throw new Error("No log found");
        const data = await res.json();

        if (data.capacity) setCapacity(data.capacity);
        if (data.treatedWater?.length)
          setTreatedWaterParams(data.treatedWater.map((item) => item.key));
        if (data.chemicalConsumption?.length)
          setChemicals(data.chemicalConsumption.map((item) => item.key));

        const textarea = document.querySelector("textarea.remarks-area");
        if (textarea) textarea.value = data.remarks || "";

        data.runningHoursReading?.forEach((entry) => {
          const row = Array.from(
            document.querySelectorAll(".running-hours tbody tr")
          ).find((tr) => tr.cells[0]?.innerText.trim() === entry.equipment);
          if (row) row.cells[1].querySelector("input").value = entry.hours;
        });

        data.backwashTimings?.forEach((entry) => {
          const row = Array.from(
            document.querySelectorAll(".backwash tbody tr")
          ).find(
            (tr) =>
              tr.cells[0]?.innerText.trim().toLowerCase() ===
              entry.stage.toLowerCase()
          );
          if (row) row.cells[1].querySelector("input").value = entry.time;
        });

        data.signOff?.forEach((entry) => {
          const row = Array.from(
            document.querySelectorAll(".sign-off tbody tr")
          ).find((tr) => tr.cells[0]?.innerText.trim() === entry.shift);
          if (row) {
            row.cells[1].querySelector("input").value =
              entry.engineerSign || "";
            row.cells[2].querySelector("input").value = entry.remarks || "";
            row.cells[3].querySelector("input").value =
              entry.operatorName || "";
            row.cells[4].querySelector("input").value = entry.sign || "";
          }
        });

        const newStatusTimes = {};
        data.timeEntries?.forEach(({ time, statuses }) => {
          statuses.forEach((s, idx) => {
            newStatusTimes[`${time}-${idx}`] = {
              status: s.status,
              onTime: s.onTime || null,
              offTime: s.offTime || null,
            };
          });
        });
        setStatusTimes(newStatusTimes);

        if (data.flowReadings?.length) {
          setFlowReadings(
            ["Shift 1", "Shift 2", "Shift 3"].map((shiftLabel) => {
              const shiftData = data.flowReadings.find(
                (s) => s.shift === shiftLabel
              );
              return {
                shift: shiftLabel,
                operatorName: shiftData?.operatorName || "",
                inlet: {
                  initial: shiftData?.inlet?.initial || "",
                  final: shiftData?.inlet?.final || "",
                  total: shiftData?.inlet?.total || "",
                },
                outlet: {
                  initial: shiftData?.outlet?.initial || "",
                  final: shiftData?.outlet?.final || "",
                  total: shiftData?.outlet?.total || "",
                },
              };
            })
          );
        }
        if (data.allImages?.length) {
          setExistingImages(data.allImages);
        }
      } catch (err) {
        console.log("No previous log for selected user and date.");
      }
    };

    fetchExistingLog();
  }, [selectedUserCompany]);

  // const totalFlow = useMemo(() => {
  //   const sum = (keyPath) =>
  //     flowReadings.reduce((acc, shift) => {
  //       const val = keyPath.reduce((o, k) => (o ? o[k] : ""), shift);
  //       const num = parseFloat(val || 0);
  //       return !isNaN(num) ? acc + num : acc;
  //     }, 0);

  //   return {
  //     inlet: {
  //       initial: sum(["inlet", "initial"]),
  //       final: sum(["inlet", "final"]),
  //       total: sum(["inlet", "total"]),
  //     },
  //     outlet: {
  //       initial: sum(["outlet", "initial"]),
  //       final: sum(["outlet", "final"]),
  //       total: sum(["outlet", "total"]),
  //     },
  //   };
  // }, [flowReadings]);

const handleFlowChange = (index, field, value) => {
  setFlowReadings((prev) => {
    const updated = [...prev];
    const reading = { ...updated[index] };

    // 1) Update the current shift:
    if (field === "operatorName") {
      reading.operatorName = value;

    } else if (field === "inletInitial" || field === "inletFinal") {
      // Determine which side changed
      const side = field === "inletInitial" ? "initial" : "final";
      reading.inlet = { ...reading.inlet, [side]: value };

      // Recalculate total for this shift
      const i = parseFloat(reading.inlet.initial || 0);
      const f = parseFloat(reading.inlet.final   || 0);
      reading.inlet.total = isNaN(i) || isNaN(f) ? "" : (f - i).toString();

      // If final changed, propagate into next shift's initial
      if (side === "final" && index + 1 < updated.length) {
        const next = { ...updated[index + 1] };
        next.inlet = { ...next.inlet, initial: value };
        const ni = parseFloat(next.inlet.initial || 0);
        const nf = parseFloat(next.inlet.final   || 0);
        next.inlet.total = isNaN(ni) || isNaN(nf) ? "" : (nf - ni).toString();
        updated[index + 1] = next;
      }

    } else if (field === "outletInitial" || field === "outletFinal") {
      const side = field === "outletInitial" ? "initial" : "final";
      reading.outlet = { ...reading.outlet, [side]: value };

      const i = parseFloat(reading.outlet.initial || 0);
      const f = parseFloat(reading.outlet.final   || 0);
      reading.outlet.total = isNaN(i) || isNaN(f) ? "" : (f - i).toString();

      if (side === "final" && index + 1 < updated.length) {
        const next = { ...updated[index + 1] };
        next.outlet = { ...next.outlet, initial: value };
        const ni = parseFloat(next.outlet.initial || 0);
        const nf = parseFloat(next.outlet.final   || 0);
        next.outlet.total = isNaN(ni) || isNaN(nf) ? "" : (nf - ni).toString();
        updated[index + 1] = next;
      }
    }

    // 2) Commit change for this shift
    updated[index] = reading;
    return updated;
  });
};


  // const handleAddLog = async () => {
  //   if (loading) {
  //     setMsg("Equipment list still loading");
  //     return;
  //   }

  //   const root = containerRef.current;

  //   // 1) Date or fallback
  //   let dateInput = root.querySelector("#log-date")?.value;
  //   if (!dateInput) {
  //     const today = new Date();
  //     dateInput = today.toISOString().split("T")[0];
  //   }

  //   // 2) Time entries
  //   const mainRows = Array.from(
  //     root.querySelectorAll("table.main-log > tbody > tr")
  //   );
  //   const timeEntries = mainRows.map((row) => {
  //     const time = row.cells[0]?.innerText.trim() || "";
  //     const statuses = equipmentList.map((eq, idx) => {
  //       const onCell = row.cells[1 + idx * 2];
  //       const offCell = row.cells[1 + idx * 2 + 1];
  //       const timeKey = `${time}-${idx}`;
  //       const times = statusTimes[timeKey] || {};
  //       const onRadio = onCell?.querySelector(
  //         'input[type="radio"][value="on"]'
  //       );
  //       const offRadio = offCell?.querySelector(
  //         'input[type="radio"][value="off"]'
  //       );

  //       let status = null;
  //       if (onRadio?.checked) status = "on";
  //       else if (offRadio?.checked) status = "off";

  //       // Ensure only valid values are passed
  //       if (status !== "on" && status !== "off") status = "off";

  //       return {
  //         equipment: eq,
  //         status,
  //         onTime: times.onTime || null,
  //         offTime: times.offTime || null,
  //       };
  //     });
  //     return { time, statuses };
  //   });

  //   const treatedRows = Array.from(
  //     root.querySelectorAll("table.treated-water tbody tr")
  //   );
  //   const treatedWater = treatedRows.map((tr) => ({
  //     key:
  //       tr.cells[0]?.querySelector("input")?.value ||
  //       tr.cells[0]?.innerText.trim() ||
  //       "",
  //     value: tr.cells[1]?.querySelector("input")?.value || "",
  //   }));

  //   const remarks = root.querySelector("textarea.remarks-area")?.value || "";

  //   const chemicalConsumption = Array.from(
  //     root.querySelectorAll("table.chemical tbody tr")
  //   ).map((tr) => ({
  //     key:
  //       tr.cells[0]?.querySelector("input")?.value ||
  //       tr.cells[0]?.innerText.trim() ||
  //       "",
  //     value: tr.cells[1]?.querySelector("input")?.value || "",
  //   }));

  //   const backwashTimings = Array.from(
  //     root.querySelectorAll("table.backwash tbody tr")
  //   ).map((tr) => ({
  //     stage: tr.cells[0]?.innerText.trim() || "",
  //     time: tr.cells[1]?.querySelector("input")?.value || "",
  //   }));

  //   const runningHoursReading = Array.from(
  //     root.querySelectorAll("table.running-hours tbody tr")
  //   ).map((tr) => ({
  //     equipment: tr.cells[0]?.innerText.trim() || "",
  //     hours: tr.cells[1]?.querySelector("input")?.value || "",
  //   }));

  //   const signOff = Array.from(
  //     root.querySelectorAll("table.sign-off tbody tr")
  //   ).map((tr) => ({
  //     shift: tr.cells[0]?.innerText.trim() || "",
  //     engineerSign: tr.cells[1]?.querySelector("input")?.value || "",
  //     remarks: tr.cells[2]?.querySelector("input")?.value || "",
  //     operatorName: tr.cells[3]?.querySelector("input")?.value || "",
  //     sign: tr.cells[4]?.querySelector("input")?.value || "",
  //   }));

  //   // Assemble payload
  //   const payload = {
  //     date: dateInput,
  //     capacity,
  //     username: validUser.isOperator ? selectedUser : validUser.userName || "",
  //     companyName: validUser.isOperator
  //       ? selectedUserCompany
  //       : validUser.companyName || "",
  //     timeEntries,
  //     treatedWater,
  //     remarks,
  //     chemicalConsumption,
  //     backwashTimings,
  //     runningHoursReading,
  //     signOff,
  //     flowReadings,
  //   };

  //   try {
  //     // const endpoint = validUser.isOperatormethod
  //     //   ? `${API_URL}/api/dailyLog/upsert-dailylog`
  //     //   : `${API_URL}/api/dailyLog/add-dailylog`;
  //     // const method = validUser.isOperator ? "PUT" : "POST";

  //     const res = await fetch(`${API_URL}/api/dailyLog/upsert-dailylog`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!res.ok) {
  //       const errorText = await res.text();
  //       console.error(" Server error response:", errorText);
  //       throw new Error(errorText);
  //     }

  //     setMsg("✅ Log saved successfully!");
  //   } catch (err) {
  //     console.error(" Log submission failed:", err);
  //     setMsg("Failed to update log");
  //   }

  //   setTimeout(() => setMsg(""), 3000);
  // };

  const handleAddLog = async () => {
    if (loading) {
      setMsg("Equipment list still loading");
      return;
    }

    const root = containerRef.current;

    // 1) Date or fallback
    let dateInput = root.querySelector("#log-date")?.value;
    if (!dateInput) {
      const today = new Date();
      dateInput = today.toISOString().split("T")[0];
    }

    // 2) Time entries
    const mainRows = Array.from(
      root.querySelectorAll("table.main-log > tbody > tr")
    );
    const timeEntries = mainRows.map((row) => {
      const time = row.cells[0]?.innerText.trim() || "";
      const statuses = equipmentList.map((eq, idx) => {
        const onCell = row.cells[1 + idx * 2];
        const offCell = row.cells[1 + idx * 2 + 1];
        const timeKey = `${time}-${idx}`;
        const times = statusTimes[timeKey] || {};
        const onRadio = onCell?.querySelector(
          'input[type="radio"][value="on"]'
        );
        const offRadio = offCell?.querySelector(
          'input[type="radio"][value="off"]'
        );

        let status = null;
        if (onRadio?.checked) status = "on";
        else if (offRadio?.checked) status = "off";

        if (status !== "on" && status !== "off") status = "off";

        return {
          equipment: eq,
          status,
          onTime: times.onTime || null,
          offTime: times.offTime || null,
        };
      });
      return { time, statuses };
    });

    const treatedRows = Array.from(
      root.querySelectorAll("table.treated-water tbody tr")
    );

    const treatedWater = treatedRows
      .map((tr) => {
        const key =
          tr.cells[0]?.querySelector("input")?.value ||
          tr.cells[0]?.innerText.trim() ||
          "";
        const value = tr.cells[1]?.querySelector("input")?.value || "";

        if (
          key.toLowerCase().includes("add image") ||
          key.toLowerCase().includes("c:\\fakepath") ||
          value.toLowerCase().includes("c:\\fakepath")
        ) {
          return null;
        }

        return { key, value };
      })
      .filter(Boolean);

    const remarks = root.querySelector("textarea.remarks-area")?.value || "";

    const chemicalConsumption = Array.from(
      root.querySelectorAll("table.chemical tbody tr")
    ).map((tr) => ({
      key:
        tr.cells[0]?.querySelector("input")?.value ||
        tr.cells[0]?.innerText.trim() ||
        "",
      value: tr.cells[1]?.querySelector("input")?.value || "",
    }));

    const backwashTimings = Array.from(
      root.querySelectorAll("table.backwash tbody tr")
    ).map((tr) => ({
      stage: tr.cells[0]?.innerText.trim() || "",
      time: tr.cells[1]?.querySelector("input")?.value || "",
    }));

    const runningHoursReading = Array.from(
      root.querySelectorAll("table.running-hours tbody tr")
    ).map((tr) => ({
      equipment: tr.cells[0]?.innerText.trim() || "",
      hours: tr.cells[1]?.querySelector("input")?.value || "",
    }));

    const signOff = Array.from(
      root.querySelectorAll("table.sign-off tbody tr")
    ).map((tr) => ({
      shift: tr.cells[0]?.innerText.trim() || "",
      engineerSign: tr.cells[1]?.querySelector("input")?.value || "",
      remarks: tr.cells[2]?.querySelector("input")?.value || "",
      operatorName: tr.cells[3]?.querySelector("input")?.value || "",
      sign: tr.cells[4]?.querySelector("input")?.value || "",
    }));

    const formData = new FormData();
    formData.append("date", dateInput);
    formData.append("capacity", capacity);
    formData.append(
      "username",
      validUser.isOperator ? selectedUser : validUser.userName || ""
    );
    formData.append(
      "companyName",
      validUser.isOperator ? selectedUserCompany : validUser.companyName || ""
    );

    formData.append("timeEntries", JSON.stringify(timeEntries));
    formData.append("treatedWater", JSON.stringify(treatedWater));
    formData.append("remarks", remarks);
    formData.append("chemicalConsumption", JSON.stringify(chemicalConsumption));
    formData.append("backwashTimings", JSON.stringify(backwashTimings));
    formData.append("runningHoursReading", JSON.stringify(runningHoursReading));
    formData.append("signOff", JSON.stringify(signOff));
    formData.append("flowReadings", JSON.stringify(flowReadings));

    // ⬇️ Append selected image files
    if (selectedImages?.length) {
      selectedImages.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      const res = await fetch(`${API_URL}/api/dailyLog/upsert-dailylog`, {
        method: "PUT",
        body: formData, // ✅ no headers needed
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(" Server error response:", errorText);
        throw new Error(errorText);
      }

      setMsg("✅ Log saved successfully!");
    } catch (err) {
      console.error(" Log submission failed:", err);
      setMsg("Failed to update log");
    }

    setTimeout(() => setMsg(""), 3000);
  };

  const handleAddTreatedWaterParam = () => {
    setTreatedWaterParams([...treatedWaterParams, ""]);
  };

  const handleTreatedWaterParamChange = (index, value) => {
    const newParams = [...treatedWaterParams];
    newParams[index] = value;
    setTreatedWaterParams(newParams);
  };

  const handleAddChemical = () => {
    setChemicals([...chemicals, ""]);
  };

  const handleChemicalChange = (index, value) => {
    const newChemicals = [...chemicals];
    newChemicals[index] = value;
    setChemicals(newChemicals);
  };

  const handleTimeStamp = (timeKey, status) => {
    const now = new Date().toLocaleTimeString("en-In", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setStatusTimes((prev) => ({
      ...prev,
      [timeKey]: {
        ...prev[timeKey],
        status,
        [`${status}Time`]: now,
      },
    }));
  };

  const handleSelectUser = (e) => {
    const userName = e.target.value;
    setSelectedUser(userName);

    const selected = userList.find((u) => u.userName === userName);
    if (selected) {
      setSelectedUserCompany(selected.companyName);
    }
  };

  // TOTAL FLOW CALCULATION (for display and backend)
  const inletInitialTotal = flowReadings.reduce(
    (sum, r) => sum + (+r.inlet.initial || 0),
    0
  );
  const inletFinalTotal = flowReadings.reduce(
    (sum, r) => sum + (+r.inlet.final || 0),
    0
  );
  const inletTotalTotal = flowReadings.reduce(
    (sum, r) => sum + (+r.inlet.total || 0),
    0
  );
  const outletInitialTotal = flowReadings.reduce(
    (sum, r) => sum + (+r.outlet.initial || 0),
    0
  );
  const outletFinalTotal = flowReadings.reduce(
    (sum, r) => sum + (+r.outlet.final || 0),
    0
  );
  const outletTotalTotal = flowReadings.reduce(
    (sum, r) => sum + (+r.outlet.total || 0),
    0
  );

  if (loading) {
    return <div className="text-center py-5">Loading equipment list...</div>;
  }

  return (
    <div
      ref={containerRef}
      className="daily-log py-3"
      style={{ fontSize: "0.75rem" }}
    >
      {/* HEADER */}
      <div className="text-center mb-3">
        <h4>{validUser.companyName}</h4>
        <p>
          STP Operation &amp; Maintenance By{" "}
          <strong>{validUser.adminType} Utility Management Pvt Ltd</strong>
        </p>
        <label className="me-2">CAPACITY:</label>
        <input
          id="capacity"
          type="number"
          className="form-control form-control-sm d-inline-block"
          style={{ width: "80px" }}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="Enter capacity"
        />
        <label className="me-2 ms-4">DATE:</label>
        <input
          id="log-date"
          type="date"
          className="form-control form-control-sm d-inline-block w-auto"
        />
      </div>

      {/* MESSAGE */}
      {msg && (
        <div
          className={`alert ${
            msg.includes("success") ? "alert-success" : "alert-danger"
          } text-center`}
        >
          {msg}
        </div>
      )}

      {validUser.isOperator && (
        <div className="text-center mb-3">
          <label className="me-2">Select User:</label>
          <select
            className="form-select form-select-sm d-inline-block w-auto"
            value={selectedUser}
            onChange={handleSelectUser}
          >
            <option value="">-- Select --</option>
            {userList.map((u) => (
              <option key={u.userName} value={u.userName}>
                {u.userName} ({u.companyName})
              </option>
            ))}
          </select>
        </div>
      )}

      {validUser.isOperator && (
        <div className="text-center mt-3 mb-3">
          <button className="btn btn-warning" onClick={handleAddLog}>
            Update My Shift
          </button>
        </div>
      )}

      {/* MAIN EQUIPMENT LOG */}
      <div
        style={{
         /*  overflowX: "auto",
          maxHeight: "100vh", */
          border: "1px solid #ddd",
          padding: "0.5rem",
        }}
      >
        <table
          className="table table-bordered table-sm mb-4 main-log"
          style={{ minWidth: "1200px", tableLayout: "fixed" }}
        >
          {/* 1. EXPLICIT COLGROUP FOR FIXED WIDTHS */}
          <colgroup>
            {/* Time */}
            <col style={{ width: "80px" }} />

            {/* ON / OFF for each equipment */}
            {equipmentList
              .slice()
              .reverse()
              .map((_, i) => (
                <React.Fragment key={i}>
                  <col style={{ width: "60px" }} />
                  <col style={{ width: "60px" }} />
                </React.Fragment>
              ))}

            {/* Remarks */}
            <col style={{ width: "200px" }} />
          </colgroup>

          <thead className="text-center align-middle">
            <tr>
              <th rowSpan="2">Time</th>
              {equipmentList
                .slice() // make a copy
                .reverse() // reverse that copy
                .map((eq) => (
                  <th key={eq} colSpan="2">
                    {eq}
                  </th>
                ))}
              <th rowSpan="2">Remarks</th>
            </tr>
            <tr>
              {equipmentList
                .slice()
                .reverse()
                .map((eq) => (
                  <React.Fragment key={`${eq}-header`}>
                    <th>ON</th>
                    <th>OFF</th>
                  </React.Fragment>
                ))}
            </tr>
          </thead>

          <tbody>
            {times.map((t) => {
              let remarksCell = null;
              if (t === "7.00") {
                remarksCell = (
                  <td rowSpan={6} className="p-0">
                    <table className="table table-sm table-bordered mb-0 treated-water text-center">
                      <colgroup>
                        <col style={{ width: "60%" }} />
                        <col style={{ width: "60%" }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th colSpan="2">TREATED WATER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {treatedWaterParams
                          .filter(
                            (p) =>
                              p &&
                              !p.toLowerCase().includes("c:\\fakepath") &&
                              p !== "+ Add Image"
                          )
                          .map((p, index) => (
                            <React.Fragment key={index}>
                              <tr>
                                <td className="text-start">
                                  {index < initialTreatedWaterParams.length ? (
                                    p
                                  ) : (
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      value={p}
                                      onChange={(e) =>
                                        handleTreatedWaterParamChange(
                                          index,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter parameter"
                                    />
                                  )}
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                  />
                                </td>
                              </tr>

                              {/* Only once, after first param row, show image block */}
                              {index === 0 && (
                                <tr>
                                  <td colSpan="2" className="text-center">
                                    {/* + Add Image button */}
                                    <button
                                      type="button"
                                      className="btn btn-sm"
                                      style={{
                                        backgroundColor: "#236a80",
                                        color: "#fff",
                                        marginTop: "0.25rem",
                                      }}
                                      onClick={() =>
                                        document
                                          .getElementById("image-upload-input")
                                          .click()
                                      }
                                    >
                                      + Add Image
                                    </button>

                                    {/* Hidden file input */}
                                    <input
                                      id="image-upload-input"
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      style={{ display: "none" }}
                                      onChange={(e) => {
                                        const files = Array.from(
                                          e.target.files
                                        );
                                        setSelectedImages(files);
                                      }}
                                    />

                                    {/* ✅ Previously uploaded images */}
                                    {existingImages.length > 0 && (
                                      <div className="mt-3">
                                        <h6 className="text-center mb-2">
                                          Uploaded Images
                                        </h6>
                                        <div className="d-flex flex-wrap justify-content-center">
                                          {existingImages.map((url, idx) => (
                                            <div
                                              key={idx}
                                              style={{
                                                border: "1px solid #ccc",
                                                margin: "5px",
                                                padding: "4px",
                                                width: "140px",
                                                height: "140px",
                                                overflow: "hidden",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                              }}
                                            >
                                              <img
                                                src={url}
                                                alt={`Uploaded-${idx}`}
                                                style={{
                                                  maxWidth: "100%",
                                                  maxHeight: "100%",
                                                  objectFit: "contain",
                                                  cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                  window.open(url, "_blank")
                                                }
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* ✅ New selected previews */}
                                    {selectedImages.length > 0 && (
                                      <div className="d-flex flex-wrap justify-content-center mt-2">
                                        {selectedImages.map((file, idx) => (
                                          <div key={idx} className="me-2">
                                            <img
                                              src={URL.createObjectURL(file)}
                                              alt="preview"
                                              style={{
                                                width: 60,
                                                height: 60,
                                                objectFit: "cover",
                                                cursor: "pointer",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                              }}
                                              onClick={() =>
                                                window.open(
                                                  URL.createObjectURL(file),
                                                  "_blank"
                                                )
                                              }
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}

                        {/* + Add Parameter Button */}
                        {isUser && (
                          <tr>
                            <td colSpan="2" className="text-center">
                              <button
                                className="btn btn-sm"
                                style={{
                                  backgroundColor: "#236a80",
                                  color: "#fff",
                                }}
                                onClick={handleAddTreatedWaterParam}
                              >
                                + Add Parameter
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                );
              }
              if (t === "13.00") {
                remarksCell = (
                  <td rowSpan={6} className="p-0">
                    <textarea
                      className="form-control form-control-sm remarks-area"
                      rows={6}
                      placeholder="Enter remarks…"
                      style={{ resize: "none", border: 0, height: "100%" }}
                    />
                  </td>
                );
              }
              if (t === "20.00") {
                remarksCell = (
                  <td rowSpan={4} className="p-0">
                    <table className="table table-sm table-bordered mb-0 chemical text-center">
                      <colgroup>
                        <col style={{ width: "40%" }} />
                        <col style={{ width: "60%" }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th colSpan="2">Chemical Consumption</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chemicals.map((c, index) => (
                          <tr key={`${c}-${index}`}>
                            <td className="text-start">
                              {index < initialChemicals.length ? (
                                c
                              ) : (
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={c}
                                  onChange={(e) =>
                                    handleChemicalChange(index, e.target.value)
                                  }
                                  placeholder="Enter chemical"
                                />
                              )}
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                              />
                            </td>
                          </tr>
                        ))}
                        {isUser && (
                          <tr>
                            <td colSpan="2" className="text-center">
                              <button
                                className="btn btn-sm"
                                style={{
                                  backgroundColor: "#236a80",
                                  color: "#fff",
                                }}
                                onClick={handleAddChemical}
                              >
                                + Add Chemical
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                );
              }
              if (t === "24.00") {
                remarksCell = (
                  <td rowSpan={4} className="p-0">
                    <table className="table table-sm table-bordered mb-0 backwash text-center">
                      <thead>
                        <tr>
                          <th>Back wash timings:</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backwashItems.map((b) => (
                          <tr key={b}>
                            <td className="text-start">{b}</td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="hh:mm"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                );
              }
              return (
                <tr key={t}>
                  <td>{t}</td>
                  {equipmentList.map((eq, i) => {
                    const timeKey = `${t}-${i}`; // unique key per cell
                    const times = statusTimes[timeKey] || {};

                    return (
                      <React.Fragment key={`${t}-${eq}`}>
                        {/* ON radio */}
                        <td className="text-center">
                          <input
                            type="radio"
                            name={`onoff-${timeKey}`}
                            value="on"
                            className="form-check-input m-0"
                            checked={times.status === "on"}
                            onChange={() => handleTimeStamp(timeKey, "on")}
                          />
                          {/* only show onTime when status==='on' */}
                          <div style={{ fontSize: "0.6rem", marginTop: "2px" }}>
                            {times.status === "on" ? times.onTime : ""}
                          </div>
                        </td>

                        {/* OFF radio */}
                        <td className="text-center">
                          <input
                            type="radio"
                            name={`onoff-${timeKey}`}
                            value="off"
                            className="form-check-input m-0"
                            checked={times.status === "off"}
                            onChange={() => handleTimeStamp(timeKey, "off")}
                          />
                          {/* only show offTime when status==='off' */}
                          <div style={{ fontSize: "0.6rem", marginTop: "2px" }}>
                            {times.status === "off" ? times.offTime : ""}
                          </div>
                        </td>

                        {/* {remarksCell} */}
                      </React.Fragment>
                    );
                  })}
                  {remarksCell}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RUNNING HOURS */}
      <table className="table table-bordered table-sm w-75 mx-auto mt-3 running-hours">
        <thead className="text-center">
          <tr>
            <th colSpan="2">RUNNING HOURS READING</th>
          </tr>
        </thead>
        <tbody>
          {runningHours.map((r) => (
            <tr key={r}>
              <td className="text-start">{r}</td>
              <td>
                <input type="text" className="form-control form-control-sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* SIGN-OFF */}
      <table className="table table-bordered table-sm w-100 mx-auto mt-2 sign-off">
        <thead className="text-center align-middle">
          <tr>
            <th rowSpan="2">Shift</th>
            <th rowSpan="2">Operator’s Name</th>
            <th colSpan="3">Inlet Flow</th>
            <th colSpan="3">Outlet Flow</th>
          </tr>
          <tr>
            {/* Inlet Flow sub-columns */}
            <th>Initial</th>
            <th>Final</th>
            <th>Total L</th>
            {/* Outlet Flow sub-columns */}
            <th>Initial</th>
            <th>Final</th>
            <th>Total L</th>
          </tr>
        </thead>
        <tbody>
          {flowReadings.map((reading, index) => (
            <tr key={reading.shift}>
              <td>{reading.shift}</td>
              <td>
                <input
                  type="text"
                  value={reading.operatorName}
                  onChange={(e) =>
                    handleFlowChange(index, "operatorName", e.target.value)
                  }
                  className="form-control form-control-sm"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={reading.inlet.initial}
                  onChange={(e) =>
                    handleFlowChange(index, "inletInitial", e.target.value)
                  }
                  className="form-control form-control-sm"
                  placeholder="Inlet Initial"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={reading.inlet.final}
                  onChange={(e) =>
                    handleFlowChange(index, "inletFinal", e.target.value)
                  }
                  className="form-control form-control-sm"
                  placeholder="Inlet Final"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={reading.inlet.total}
                  className="form-control form-control-sm"
                  readOnly
                  placeholder="Inlet Total L"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={reading.outlet.initial}
                  onChange={(e) =>
                    handleFlowChange(index, "outletInitial", e.target.value)
                  }
                  className="form-control form-control-sm"
                  placeholder="Outlet Initial"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={reading.outlet.final}
                  onChange={(e) =>
                    handleFlowChange(index, "outletFinal", e.target.value)
                  }
                  className="form-control form-control-sm"
                  placeholder="Outlet Final"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={reading.outlet.total}
                  className="form-control form-control-sm"
                  readOnly
                  placeholder="Outlet Total L"
                />
              </td>
            </tr>
          ))}

          {flowReadings.some(
            (r) =>
              r.inlet.initial ||
              r.inlet.final ||
              r.outlet.initial ||
              r.outlet.final
          ) && (
            <tr className="fw-bold text-center bg-light">
              <td colSpan={2}>TOTAL</td>
              <td></td>
              <td></td>
              <td>{inletTotalTotal}</td>
              <td></td>
              <td></td>
              <td>{outletTotalTotal}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="text-center mt-3">
        <button className="btn btn-success" onClick={handleAddLog}>
          Add Log
        </button>
      </div>
    </div>
  );
}
