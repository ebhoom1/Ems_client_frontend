// DailyLog.jsx
import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";

const times = [
  "7.00","8.00","9.00","10.00","11.00","12.00",
  "13.00","14.00","15.00","16.00","17.00","18.00",
  "19.00","20.00","21.00","22.00","23.00","24.00",
  "1.00","2.00","3.00","4.00","5.00","6.00"
];

const initialTreatedWaterParams = ["Quality","Color","Odour","P.H","MLSS","Hardness"];
const initialChemicals = ["NaOCl","NaCl","Lime Powder"];
const backwashItems = ["PSF-","ASF-","Softener-"];
const runningHours = [
  "MBR Permeate Pump Main →",
  "MBR Permeate Pump Standby →",
  "MBR Back wash Pump →",
  "MBR Chemical Cleaning Pump →",
  "Filter Press Operating Time →"
];

export default function DailyLog() {
  const { userData } = useSelector((s) => s.user);
  const validUser = userData?.validUserOne || {};
  const isUser = validUser.userType === "user";

  const [msg, setMsg] = useState("");
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [treatedWaterParams, setTreatedWaterParams] = useState(initialTreatedWaterParams);
  const [chemicals, setChemicals] = useState(initialChemicals);
  const containerRef = useRef();

  // Fetch equipment list on component mount
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/${validUser.userName}`);
        if (!res.ok) throw new Error("Failed to fetch equipment");
        const data = await res.json();
        setEquipmentList(data.equipment.map(item => item.equipmentName));
      } catch (err) {
        console.error("Error fetching equipment:", err);
        setMsg("Failed to load equipment list");
      } finally {
        setLoading(false);
      }
    };

    if (validUser.userName) {
      fetchEquipment();
    }
  }, [validUser.userName]);

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

  const handleAddLog = async () => {
    if (loading) {
      setMsg("Equipment list still loading");
      return;
    }

    const root = containerRef.current;

    // 1) Date or fallback
    let date = root.querySelector("#log-date")?.value;
    if (!date) date = new Date().toISOString();

    // 2) Time entries
    const mainRows = Array.from(
          root.querySelectorAll("table.main-log > tbody > tr")
      );   
       const timeEntries = mainRows.map(row => {
      const time = row.cells[0]?.innerText.trim() || "";
      const statuses = equipmentList.map((eq, idx) => {
        const onCell = row.cells[1 + idx*2];
        const offCell = row.cells[1 + idx*2 + 1];
        const onRadio = onCell?.querySelector('input[type="radio"][value="on"]');
        const offRadio = offCell?.querySelector('input[type="radio"][value="off"]');
        let status = "off";           // default off
        if (onRadio?.checked) status = "on";
        else if (offRadio?.checked) status = "off";
        return { equipment: eq, status };
      });
      return { time, statuses };
    });

    const treatedRows = Array.from(
      root.querySelectorAll("table.treated-water tbody tr")
    );
    const treatedWater = treatedRows.map(tr => ({
      key: tr.cells[0]?.querySelector("input")?.value || tr.cells[0]?.innerText.trim() || "",
      value: tr.cells[1]?.querySelector("input")?.value || ""
    }));

    const remarks = root.querySelector("textarea.remarks-area")?.value || "";

    const chemicalConsumption = Array.from(
      root.querySelectorAll("table.chemical tbody tr")
    ).map(tr => ({
      key: tr.cells[0]?.querySelector("input")?.value || tr.cells[0]?.innerText.trim() || "",
      value: tr.cells[1]?.querySelector("input")?.value || ""
    }));

    const backwashTimings = Array.from(
      root.querySelectorAll("table.backwash tbody tr")
    ).map(tr => ({
      stage: tr.cells[0]?.innerText.trim() || "",
      time: tr.cells[1]?.querySelector("input")?.value || ""
    }));

    const runningHoursReading = Array.from(
      root.querySelectorAll("table.running-hours tbody tr")
    ).map(tr => ({
      equipment: tr.cells[0]?.innerText.trim() || "",
      hours: tr.cells[1]?.querySelector("input")?.value || ""
    }));

    const signOff = Array.from(
      root.querySelectorAll("table.sign-off tbody tr")
    ).map(tr => ({
      shift: tr.cells[0]?.innerText.trim() || "",
      engineerSign: tr.cells[1]?.querySelector("input")?.value || "",
      remarks: tr.cells[2]?.querySelector("input")?.value || "",
      operatorName: tr.cells[3]?.querySelector("input")?.value || "",
      sign: tr.cells[4]?.querySelector("input")?.value || ""
    }));

    // Assemble payload
    const payload = {
      date,
      username: validUser.userName || "",
      companyName: validUser.companyName || "",
      timeEntries,
      treatedWater,
      remarks,
      chemicalConsumption,
      backwashTimings,
      runningHoursReading,
      signOff
    };

    try {
      const res = await fetch(`${API_URL}/api/add-dailylog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("Log added successfully!");
    } catch (err) {
      console.error(err);
      setMsg("Failed to add log");
    }
    setTimeout(() => setMsg(""), 3000);
  };

  if (loading) {
    return <div className="text-center py-5">Loading equipment list...</div>;
  }

  return (
    <div ref={containerRef} className="daily-log py-3" style={{ fontSize: "0.75rem" }}>
      {/* HEADER */}
      <div className="text-center mb-3">
        <h4>350 KLD SEWAGE TREATMENT PLANT – {validUser.companyName}</h4>
        <p>
          STP Operation &amp; Maintenance By{" "}
          <strong>{validUser.adminType} Utility Management Pvt Ltd</strong>
        </p>
        <label className="me-2">DATE:</label>
        <input
          id="log-date"
          type="date"
          className="form-control form-control-sm d-inline-block w-auto"
          disabled={!isUser}
        />
      </div>

      {/* MESSAGE */}
      {msg && <div className={`alert ${msg.includes("success") ? "alert-success" : "alert-danger"} text-center`}>{msg}</div>}

      {/* MAIN EQUIPMENT LOG */}
      <div style={{ overflowX:"auto", maxHeight:"70vh", border:"1px solid #ddd", padding:"0.5rem" }}>
        <table className="table table-bordered table-sm mb-4 main-log" style={{ minWidth:"1200px" }}>
          <thead className="text-center align-middle">
            <tr>
              <th rowSpan="2">Time</th>
              {equipmentList.map(eq => <th key={eq} colSpan="2">{eq}</th>)}
              <th rowSpan="2">Remarks</th>
            </tr>
            <tr>
              {equipmentList.map(eq => (
                <React.Fragment key={`${eq}-header`}>
                  <th>ON</th><th>OFF</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map(t => {
              let remarksCell = null;
              if (t==="7.00") {
                remarksCell = (
                  <td rowSpan={6} className="p-0">
                    <table className="table table-sm table-bordered mb-0 treated-water text-center">
                      <colgroup><col style={{width:"40%"}}/><col style={{width:"60%"}}/></colgroup>
                      <thead>
                        <tr>
                          <th colSpan="2">TREATED WATER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {treatedWaterParams.map((p, index) => (
                          <tr key={`${p}-${index}`}>
                            <td className="text-start">
                              {index < initialTreatedWaterParams.length ? (
                                p
                              ) : (
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={p}
                                  onChange={(e) => handleTreatedWaterParamChange(index, e.target.value)}
                                  disabled={!isUser}
                                  placeholder="Enter parameter"
                                />
                              )}
                            </td>
                            <td>
                              <input 
                                type="text" 
                                className="form-control form-control-sm" 
                                disabled={!isUser}
                              />
                            </td>
                          </tr>
                        ))}
                        {isUser && (
                          <tr>
                            <td colSpan="2" className="text-center">
                              <button 
                                className="btn btn-sm"
                                style={{backgroundColor:'#236a80', color:'#fff'}}

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
              if (t==="13.00") {
                remarksCell = (
                  <td rowSpan={6} className="p-0">
                    <textarea
                      className="form-control form-control-sm remarks-area"
                      rows={6}
                      placeholder="Enter remarks…"
                      style={{ resize:"none", border:0, height:"100%" }}
                      disabled={!isUser}
                    />
                  </td>
                );
              }
              if (t==="20.00") {
                remarksCell = (
                  <td rowSpan={4} className="p-0">
                    <table className="table table-sm table-bordered mb-0 chemical text-center">
                      <colgroup><col style={{width:"40%"}}/><col style={{width:"60%"}}/></colgroup>
                      <thead><tr><th colSpan="2">Chemical Consumption</th></tr></thead>
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
                                  onChange={(e) => handleChemicalChange(index, e.target.value)}
                                  disabled={!isUser}
                                  placeholder="Enter chemical"
                                />
                              )}
                            </td>
                            <td>
                              <input 
                                type="text" 
                                className="form-control form-control-sm" 
                                disabled={!isUser}
                              />
                            </td>
                          </tr>
                        ))}
                        {isUser && (
                          <tr>
                            <td colSpan="2" className="text-center">
                              <button 
                                className="btn btn-sm"
                                style={{backgroundColor:'#236a80', color:'#fff'}}
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
              if (t==="24.00") {
                remarksCell = (
                  <td rowSpan={4} className="p-0">
                    <table className="table table-sm table-bordered mb-0 backwash text-center">
                      <thead><tr><th>Back wash timings:</th></tr></thead>
                      <tbody>
                        {backwashItems.map(b=>(
                          <tr key={b}>
                            <td className="text-start">{b}</td>
                            <td>
                              <input type="text" className="form-control form-control-sm" placeholder="hh:mm" disabled={!isUser}/>
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
                  {equipmentList.map((eq, i)=>(
                    <React.Fragment key={`${t}-${eq}`}>
                      <td className="text-center">
                        <input 
                          type="radio" 
                          name={`onoff-${t}-${i}`} 
                          value="on" 
                          className="form-check-input m-0" 
                          disabled={!isUser}
                        />
                      </td>
                      <td className="text-center">
                        <input 
                          type="radio" 
                          name={`onoff-${t}-${i}`} 
                          value="off" 
                          className="form-check-input m-0" 
                          disabled={!isUser}
                        />
                      </td>
                    </React.Fragment>
                  ))}
                  {remarksCell}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RUNNING HOURS */}
      <table className="table table-bordered table-sm w-75 mx-auto mt-3 running-hours">
        <thead className="text-center"><tr><th colSpan="2">RUNNING HOURS READING</th></tr></thead>
        <tbody>
          {runningHours.map(r=>(
            <tr key={r}>
              <td className="text-start">{r}</td>
              <td><input type="text" className="form-control form-control-sm" disabled={!isUser}/></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* SIGN-OFF */}
      <table className="table table-bordered table-sm w-75 mx-auto mt-2 sign-off">
        <thead className="text-center">
          <tr>
            <th>Shift</th><th>Shift Engineer Sign</th><th>Remarks</th><th>Operator's Name</th><th>Sign</th>
          </tr>
        </thead>
        <tbody>
          {["Shift 1","Shift 2","Shift 3"].map(s=>(
            <tr key={s}>
              <td>{s}</td>
              {[...Array(4)].map((_, j)=>(<td key={j}><input type="text" className="form-control form-control-sm" disabled={!isUser}/></td>))}
            </tr>
          ))}
        </tbody>
      </table>

      {isUser && (
        <div className="text-center mt-3">
          <button className="btn btn-success" onClick={handleAddLog}>Add Log</button>
        </div>
      )}
    </div>
  );
}