// import React from "react";
// import "./checklist.css";

// export default function SBRChecklistView({ checklist }) {
//   if (!checklist || Object.keys(checklist).length === 0)
//     return <p>No SBR checklist data available.</p>;

//   return (
//     <div className="checklist-wrapper">
//       <h5 className="checklist-title">SBR Safety CheckList</h5>

//       {Object.entries(checklist).map(([sectionName, items], sIndex) => (
//         <div key={sIndex}>
//           <div className="section-title">{sectionName}</div>

//           <table className="checklist-table">
//             <thead>
//               <tr>
//                 <th>Sl. No</th>
//                 <th>Safety Description</th>
//                 <th>Yes</th>
//                 <th>No</th>
//                 <th>NA</th>
//                 <th>Remarks</th>
//                 <th>Action Plan</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.entries(items).map(([i, obj]) => (
//                 <tr key={i}>
//                   <td>{parseInt(i) + 1}</td>
//                   <td style={{ textAlign: "left" }}>{obj.description || "—"}</td>
//                   <td className="status-yes">
//                     {obj.status === "yes" ? "✔" : ""}
//                   </td>
//                   <td className="status-no">
//                     {obj.status === "no" ? "✖" : ""}
//                   </td>
//                   <td className="status-na">
//                     {obj.status === "na" ? "NA" : ""}
//                   </td>
//                   <td>{obj.remarks || "—"}</td>
//                   <td>{obj.action || "—"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ))}
//     </div>
//   );
// }

//src/pages/Inventory/SBRChecklistView.jsx
import React from "react";
import "./checklist.css";

export default function SBRChecklistView({ checklist }) {
  if (!checklist || Object.keys(checklist).length === 0)
    return <p>No SBR checklist data available.</p>;

  return (
    <div className="checklist-wrapper">
      <h5 className="checklist-title text-center mb-3">SBR Safety CheckList</h5>
      {Object.entries(checklist)
        // ✅ Move "FIRST AID MATERIAL CONTENT LIST" to the bottom
        .sort(([aName], [bName]) => {
          if (aName === "FIRST AID MATERIAL CONTENT LIST") return 1;
          if (bName === "FIRST AID MATERIAL CONTENT LIST") return -1;
          return 0;
        })
        .map(([sectionName, items], sIndex) => {
          const isFirstAid = sectionName === "FIRST AID MATERIAL CONTENT LIST";

          return (
            <div key={sIndex} className="mb-4">
              <div
                className="section-title text-white p-2"
                style={{
                  backgroundColor: "#236a80",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                {sectionName}
              </div>

              <table
                className="checklist-table"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  {isFirstAid ? (
                    <tr style={{ backgroundColor: "#f5f8fb" }}>
                      <th>SL. NO</th>
                      <th>ITEM</th>
                      <th>QTY</th>
                      <th>YES</th>
                      <th>NO</th>
                      <th>EXPIRY DATE</th>
                    </tr>
                  ) : (
                    <tr style={{ backgroundColor: "#f5f8fb" }}>
                      <th>SL. NO</th>
                      <th>SAFETY DESCRIPTION</th>
                      <th>YES</th>
                      <th>NO</th>
                      <th>NA</th>
                      <th>REMARKS</th>
                      <th>ACTION PLAN</th>
                    </tr>
                  )}
                </thead>

                <tbody>
                  {Object.entries(items).map(([i, obj]) => (
                    <tr key={i}>
                      <td>{parseInt(i) + 1}</td>

                      {/* Common Description Column */}
                      <td style={{ textAlign: "left" }}>
                        {obj.description || "—"}
                      </td>

                      {isFirstAid ? (
                        <>
                          {/* QTY */}
                          <td>{obj.qty || "—"}</td>

                          {/* YES/NO status */}
                          <td className="status-yes">
                            {obj.status === "yes" ? "✔" : ""}
                          </td>
                          <td className="status-no">
                            {obj.status === "no" ? "✖" : ""}
                          </td>

                          {/* EXPIRY */}
                          <td>{obj.expiry || "—"}</td>
                        </>
                      ) : (
                        <>
                          {/* YES/NO/NA */}
                          <td className="status-yes">
                            {obj.status === "yes" ? "✔" : ""}
                          </td>
                          <td className="status-no">
                            {obj.status === "no" ? "✖" : ""}
                          </td>
                          <td className="status-no">
                            {obj.status === "na" ? "NA" : ""}
                          </td>

                          {/* REMARKS / ACTION */}
                          <td>{obj.remarks || "—"}</td>
                          <td>{obj.action || "—"}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
    </div>
  );
}
