

// import React from "react";
// import "./PSFNode.css";

// export default function PSFNode({
//   id,
//   data,
//   sendValveControlMessage,
//   setNodes,
// }) {
//  const VALVE_ID_MAP = {
//   V1: "valve_1",
//   V2: "valve_2",
//   V3: "valve_3",
//   V4: "valve_4",
//   V5: "valve_5",
// };

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



//   return (
//     <div className="psf-box">
//       <div className="psf-title">Pressure Sand Filter</div>

//       <div className="psf-grid">
//         {["V1", "V4", "V3", "V5", "V2"].map((valveName) => {
//           const isBottom = valveName === "V2";
//           const state = data.valves[valveName] || 0;
//           const isPending = data.pending?.[valveName];

//           return (
//             <button
//               key={valveName}
//               disabled={isPending}
//               className={`psf-valve ${isBottom ? "psf-bottom" : ""} 
//                 ${state ? "valve-on" : "valve-off"} 
//                 ${isPending ? "valve-pending" : ""}`}
//               onClick={() => handleToggle(valveName)}
//             >
//               {isPending ? "..." : valveName}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

import React from "react";
import "./PSFNode.css";

export default function PSFNode({
  id,
  data,
  sendValveControlMessage,
  setNodes,
}) {
 const VALVE_ID_MAP = {
  V1: "valve_1",
  V2: "valve_2",
  V3: "valve_3",
  V4: "valve_4",
  V5: "valve_5",
};

const handleToggle = (valveName) => {
  if (data.pending?.[valveName]) return;

  const current = data.valves[valveName] || 0;
  const valveId = VALVE_ID_MAP[valveName];

  // Optimistic UI (lock button)
  setNodes((nodes) =>
    nodes.map((n) =>
      n.id === id
        ? {
            ...n,
            data: {
              ...n.data,
              pending: { ...n.data.pending, [valveName]: true },
            },
          }
        : n
    )
  );

  sendValveControlMessage(data.productId, [
    {
      valveId,
      valveName,
      status: current ? 0 : 1,
    },
  ]);
};



 return (
  <div className="psf-box">
    <div className="psf-title">Pressure Sand Filter</div>

    <div className="psf-grid">
      {["V1", "V4", "V3", "V5", "V2"].map((valveName) => {
        const isBottom = valveName === "V2";
        const state = data.valves[valveName] || 0;
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
                checked={state === 1}
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
