
// import React, { useEffect, useState } from "react";
// import { useFaultAlert } from "../../provider/FaultAlertProvider";
// import "./FaultAlert.css";

// export default function FaultAlert() {
//   const { visible, alertPayload, closeAlert } = useFaultAlert();
//   const [blink, setBlink] = useState(true);

//   if (!visible || !alertPayload) return null;

//   const msg =
//     alertPayload?.message ||
//     (Array.isArray(alertPayload.pumps)
//       ? `Fault detected on: ${alertPayload.pumps
//           .filter(
//             (p) =>
//               String(p.fault).toUpperCase() === "YES" ||
//               p.fault === true ||
//               p.fault === 1
//           )
//           .map((p) => p.pumpName || p.pumpId)
//           .join(", ")}`
//       : "A fault was detected.");

//   return (
//     <div className="fault-alert-overlay" role="alert" aria-live="assertive">
//       <div className={`fault-alert-card ${blink ? "blink-alert" : ""}`}>
//         <div className="fault-alert-head">
//           <span className="fault-alert-title">🚨 Fault Alert</span>
//           <button
//             onClick={closeAlert}
//             className="fault-alert-close"
//             aria-label="Close"
//             title="Dismiss"
//           >
//             ✕
//           </button>
//         </div>

//         <div className="fault-alert-body">
//           <p className="fault-alert-message">{msg}</p>

//           <div className="fault-alert-meta">
//             {alertPayload?.product_id && (
//               <small>Product: {alertPayload.product_id}</small>
//             )}
//             {alertPayload?.userName && <small>User: {alertPayload.userName}</small>}
//             {(alertPayload?.ntpTime || alertPayload?.timestamp) && (
//               <small>
//                 Time: {alertPayload.ntpTime || alertPayload.timestamp}
//               </small>
//             )}
//           </div>
//         </div>

//         <div className="fault-alert-foot">
//           <button onClick={closeAlert} className="fault-alert-cta">
//             OK
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import { useFaultAlert } from "../../provider/FaultAlertProvider";
import "./FaultAlert.css";

export default function FaultAlert() {
  const { visible, alertPayload, closeAlert } = useFaultAlert();
  const [blink, setBlink] = useState(true);

  if (!visible || !alertPayload) return null;

  // Build message from faulty pumps
  let msg = "";
  let productNames = [];

  if (Array.isArray(alertPayload.pumps)) {
    const faultyPumps = alertPayload.pumps.filter(
      (p) =>
        String(p.fault).toUpperCase() === "YES" ||
        p.fault === true ||
        p.fault === 1
    );

    productNames = faultyPumps
      .map((p) => p.pumpName)
      .filter(Boolean);

    const faultMessages = faultyPumps
      .map((p) => {
        const user = p.userName || alertPayload.userName || "Unknown User";
        const pumpMsg = p.message?.trim() || "Fault detected";
        return `${user}: ${pumpMsg}`;
      })
      .filter(Boolean);

    if (faultMessages.length > 0) {
      msg = faultMessages.join(" | ");
    }
  }

  // Fallback if no faulty pump messages found
  if (!msg) {
    msg = "A fault was detected.";
  }

  return (
    <div className="fault-alert-overlay" role="alert" aria-live="assertive">
      <div className={`fault-alert-card ${blink ? "blink-alert" : ""}`}>
        <div className="fault-alert-head">
          <span className="fault-alert-title">🚨 Fault Alert</span>
          <button
            onClick={closeAlert}
            className="fault-alert-close"
            aria-label="Close"
            title="Dismiss"
          >
            ✕
          </button>
        </div>

        <div className="fault-alert-body">
          <p className="fault-alert-message">{msg}</p>

          <div className="fault-alert-meta">
            {productNames.length > 0 && (
              <small>{productNames.join(", ")}</small>
            )}
            {(alertPayload?.ntpTime || alertPayload?.timestamp) && (
              <small>
                Time: {alertPayload.ntpTime || alertPayload.timestamp}
              </small>
            )}
          </div>
        </div>

        <div className="fault-alert-foot">
          <button onClick={closeAlert} className="fault-alert-cta">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
