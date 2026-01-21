import React from "react";
import "./PSFNode.css";

export default function PSFNode({
  id,
  data,
  sendValveControlMessage,
  setNodes,
}) {
  console.log("data:",data);
  const VALVE_ID_MAP = {
    V1: "valve_1",
    V2: "valve_2",
    V3: "valve_3",
    V4: "valve_4",
    V5: "valve_5",
  };

  // const handleToggle = (valveName) => {
  //   if (data.pending?.[valveName]) return;

  //   const current = data.valves[valveName] || 0;
  //   const valveId = VALVE_ID_MAP[valveName];

  //   // Optimistic UI (lock button)
  //   setNodes((nodes) =>
  //     nodes.map((n) =>
  //       n.id === id
  //         ? {
  //             ...n,
  //             data: {
  //               ...n.data,
  //               pending: { ...n.data.pending, [valveName]: true },
  //             },
  //           }
  //         : n
  //     )
  //   );

  //   sendValveControlMessage(data.productId, [
  //     {
  //       valveId,
  //       valveName,
  //       status: current ? 0 : 1,
  //     },
  //   ]);
  // };

  const handleToggle = (valveName) => {
  if (data.pending?.[valveName]) return;

  const current = Number(data.valves?.[valveName] ?? 0);   // ✅ safe
  const next = current ? 0 : 1;                           // ✅ toggle
  const valveId = VALVE_ID_MAP[valveName];

  // ✅ Optimistic UI: lock + update valve state immediately
  setNodes((nodes) =>
    nodes.map((n) =>
      n.id === id
        ? {
            ...n,
            data: {
              ...n.data,
              valves: { ...(n.data.valves || {}), [valveName]: next }, // ✅ add this
              pending: { ...(n.data.pending || {}), [valveName]: true },
            },
          }
        : n
    )
  );
 // ✅ LOG THE COMMAND (ON/OFF)
  const payload = [
    {
      valveId,
      valveName,
      status: next, // 1 = ON, 0 = OFF
    },
  ];

  console.log("[VALVE CMD]", {
    nodeId: id,
    productId: data.productId,
    valveName,
    valveId,
    from: current,
    to: next,
    payload,
    ts: new Date().toISOString(),
  });

  sendValveControlMessage(data.productId, [
    {
      valveId,
      valveName,
      status: next, // 0/1 is OK with your backend
    },
  ]);
};

  return (
    <div className="psf-box">
<div className="psf-title">Pressure Sand Filter</div>

<div className="psf-metrics">
  <div className="psf-metric">
    <span className="k">Turb</span>
    <span className="v">
      {typeof data?.turb === "number" ? data.turb.toFixed(2) : "--"}
    </span>
  </div>

  <div className="psf-metric">
    <span className="k">Pressure</span>
    <span className="v">
      {typeof data?.pressure === "number" ? data.pressure.toFixed(3) : "--"}
    </span>
  </div>
</div>

      <div className="psf-grid">
        {["V1", "V4", "V3", "V5", "V2"].map((valveName) => {
          const isBottom = valveName === "V2";
          // const state = data.valves[valveName] || 0;
          const state = Number(data.valves?.[valveName] ?? 0);
          const isPending = data.pending?.[valveName];

          return (
            <div
              key={valveName}
              className={`psf-valve-card ${isBottom ? "psf-bottom" : ""}`}
            >
              <div className="valve-label">{valveName}</div>

              <div
                className={`valve-indicator 
                ${state ? "indicator-on" : "indicator-off"} 
                ${isPending ? "indicator-pending" : ""}`}
              />

              <label className="valve-toggle">
                <input
                  type="checkbox"
                  // checked={state === 1}
                  checked={Number(state) === 1}
                  disabled={isPending}
                  onChange={() => handleToggle(valveName)}
                />
                <span className="toggle-slider" />
              </label>

              {isPending && <div className="pending-text">Pending…</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
