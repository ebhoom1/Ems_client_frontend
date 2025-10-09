// import React, { useState,useEffect } from "react";
// import "./checklist.css";

// const MBR_SECTIONS = [
//   {
//     title: "FACILITY ENTRANCE AND SAFETY FIRST IMPRESSION",
//     items: [
//       "Proper Safety protective equipment provided to everyone entering the STP",
//       "Proper induction training given to visitors entering the STP area",
//       "Safety signages/boards placed inside the STP plant",
//       "Work areas are generally safe and free from hazards and obstructions",
//       "Safety rules are being enforced visually throughout the whole facility",
//       "PPE's are being used as per the requirement",
//     ],
//   },
//   {
//     title: "EQUIPMENT NAME: BAR SCREEN",
//     items: [
//       "Provision of Handrails",
//       "Safe working Platform",
//       "Bar screen cleaning is done regularly and safely",
//       "Collection of waste from bar screen is done regularly",
//       "PPE's worn by operators during bar screen cleaning",
//       "Other observations if any",
//     ],
//   },
//   {
//     title: "EQUIPMENT NAME: RAW SEWAGE PUMP 1/2",
//     items: [
//       "Provided pump protected with safety shields",
//       "Mechanical Aid provision for pump lifting",
//       "Training provision for lifting the pump",
//       "Provision of proper discharge lines",
//       "Check for Oil & water leakage",
//       "Check terminals cover for loose connection",
//       "Discharge line perfect before operating",
//       "Are SOPs displayed near the pumps",
//       "Check noise within limits (dB)",
//       "Other observations if any",
//     ],
//   },
//   // ...continue rest per PDF
// ];

// export default function MBRChecklistForm({ onChecklistFilled }) {
//   const [responses, setResponses] = useState({});

//   const handleChange = (section, idx, field, value,description='') => {
//     setResponses((prev) => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [idx]: { ...prev[section]?.[idx], [field]: value,description },
//       },
//     }));
//   };

//     useEffect(() => {
//     onChecklistFilled && onChecklistFilled(responses);
//   }, [responses]);
//   return (
//     <div className="container py-4">
//       <h3 className="mb-4 text-center" style={{ color: "#236a80" }}>
//         MBR SAFETY CHECKLIST
//       </h3>

//       {MBR_SECTIONS.map((sec, sIndex) => (
//         <div key={sIndex} className="card mb-3 border">
//           <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
//             {sec.title}
//           </div>
//           <div className="card-body p-0">
//             <table className="table table-bordered checklist-table m-0">
//               <thead className="table-light">
//                 <tr>
//                   <th style={{ width: "5%" }}>SL. No</th>
//                   <th>Safety Description</th>
//                   <th style={{ width: "5%" }}>Yes</th>
//                   <th style={{ width: "5%" }}>No</th>
//                   <th style={{ width: "5%" }}>NA</th>
//                   <th>Remarks</th>
//                   <th>Previous Month Remarks</th>
//                   <th>Action Plan (Still Open/Closed)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {sec.items.map((item, i) => (
//                   <tr key={i}>
//                     <td>{i + 1}</td>
//                     <td>{item}</td>
//                     {["yes", "no", "na"].map((opt) => (
//                       <td key={opt} className="text-center">
//                         <input
//                           type="radio"
//                           name={`${sIndex}-${i}`}
//                           checked={responses[sec.title]?.[i]?.status === opt}
//                           onChange={() =>
//                             handleChange(sec.title, i, "status", opt,item)
//                           }
//                         />
//                       </td>
//                     ))}
//                     <td>
//                       <input
//                         type="text"
//                         className="form-control"
//                         value={responses[sec.title]?.[i]?.remarks || ""}
//                         onChange={(e) =>
//                           handleChange(sec.title, i, "remarks", e.target.value,item)
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="text"
//                         className="form-control"
//                         value={responses[sec.title]?.[i]?.previous || ""}
//                         onChange={(e) =>
//                           handleChange(sec.title, i, "previous", e.target.value,item)
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="text"
//                         className="form-control"
//                         value={responses[sec.title]?.[i]?.action || ""}
//                         onChange={(e) =>
//                           handleChange(sec.title, i, "action", e.target.value,item)
//                         }
//                       />
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import "./checklist.css";

const MBR_SECTIONS = [
  {
    title: "FACILITY ENTRANCE AND SAFETY FIRST IMPRESSION",
    items: [
      "Proper personal protective equipment provided to whomever enters into the STP",
      "Proper Site Information & safety rules are provided to visitors",
      "Safety signages provided inside the STP",
      "The use of mobile phones is strictly prohibited signage in the notice board",
      "Work areas are generally safe and free from hazards and other obstructions",
      "Safety rules are being enforced visually throughout the facility",
      "PPE's are being used as per requirement",
    ],
  },
  {
    title: "EQUIPMENT NAME: BAR SCREEN",
    items: [
      "Provision of Handrails",
      "Safe working Platform",
      "Bar screen cleaning is done regularly and safely",
      "Collection of waste from bar screen is done regularly",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: FINE SCREEN",
    items: [
      "Provision of Handrails",
      "Safe platform for working",
      "Provided Handrails are painted or not",
      "Fine screen cleaning is done regularly and safely",
      "Provided Handrails are corroded or not",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: RAW SEWAGE PUMP 1",
    items: [
      "Provided pump protected with safety shields",
      "Mechanical Aid provision for pump lifting",
      "Training provision for lifting the pump",
      "Provision of proper discharge lines",
      "Check for Oil & water leakage",
      "Check terminals cover for any loose connection",
      "Discharge line perfect before operating",
      "Are SOPs displayed near the pumps",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: RAW SEWAGE PUMP 2",
    items: [
      "Provided pump protected with safety shields",
      "Mechanical Aid provision for pump lifting",
      "Training provision for lifting the pump",
      "Provision of proper discharge lines",
      "Check for Oil & water leakage",
      "Check terminals cover for loose connection",
      "Discharge line perfect before operating",
      "Are SOPs displayed near the pumps",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: AIR BLOWER 1",
    items: [
      "Check for safety Guards around rotating parts",
      "Safe working Platform for air blower",
      "Check availability of Acoustic enclosure",
      "Check noise level is within limits (≤85 dB)",
      "Check for any Electrical loose connection",
      "Ensure v-belts connecting drive and driver are in good condition",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: AIR BLOWER 2",
    items: [
      "Check for safety Guards around rotating parts",
      "Safe working Platform for air blower",
      "Check availability of Acoustic enclosure",
      "Check noise level is within limits (≤85 dB)",
      "Check for any Electrical loose connection",
      "Ensure v-belts connecting drive and driver are in good condition",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: AIR BLOWER 3",
    items: [
      "Check for safety Guards around moving parts",
      "Safe working Platform for air blower",
      "Check availability of Acoustic enclosure",
      "Check noise level is within limits (≤85 dB)",
      "Check for any Electrical loose connection",
      "Ensure v-belts connecting drive and driver are in good condition",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: MBR AIR BLOWER 1",
    items: [
      "Check for safety Guards around moving parts",
      "Safe working Platform for air blower",
      "Check availability of Acoustic enclosure",
      "Check noise level is within limits (≤85 dB)",
      "Check for any Electrical loose connection",
      "Ensure v-belts connecting drive and driver are in good condition",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: MBR AIR BLOWER 2",
    items: [
      "Check for safety Guards around moving parts",
      "Safe working Platform for air blower",
      "Check availability of Acoustic enclosure",
      "Check noise level is within limits (≤85 dB)",
      "Check for any Electrical loose connection",
      "Ensure v-belts connecting drive and driver are in good condition",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: RAS PUMP 1",
    items: [
      "Type of Pump - Coupling pump",
      "Provided pump protected with safety guard",
      "Mechanical Aid provision for pump lifting",
      "Training provision for lifting the pump",
      "Provision of proper discharge lines",
      "Check for Oil & water leakage",
      "Check for terminal loose connection",
      "Discharge water lines perfect before operating",
      "Check for suction pressure line",
      "Check noise level within limits (dB)",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: RAS PUMP 2",
    items: [
      "Type of Pump - Coupling pump",
      "Provided pump protected with safety guard",
      "Mechanical Aid provision for pump lifting",
      "Training provision for lifting the pump",
      "Provision of proper discharge lines",
      "Check for Oil & water leakage",
      "Check for terminal loose connection",
      "Discharge water lines perfect before operating",
      "Check for suction pressure line",
      "Check noise level within limits (dB)",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: PERMEATE PUMP 1",
    items: [
      "Check for safety Guards",
      "Safe working Platform available or not",
      "Direction of rotation",
      "Condition of the pump",
      "Oil leakage",
      "Bearing sound & damage",
      "Base support",
      "Other observation if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: PERMEATE PUMP 2",
    items: [
      "Check for safety Guards",
      "Safe working Platform available or not",
      "Direction of rotation",
      "Condition of the pump",
      "Oil leakage",
      "Bearing sound & damage",
      "Base support",
      "Other observation if any",
    ],
  },
  {
    title: "FRESH AIR FAN",
    items: [
      "Condition of the fan",
      "Check for noise / vibrations in duct",
      "Check any blockage",
      "Other observation if any",
    ],
  },
  {
    title: "EXHAUST FAN",
    items: [
      "Condition of the exhaust fan",
      "Condition of the exhaust duct",
      "Check for noise / vibrations",
      "Other observation if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: DOSING PUMP",
    items: [
      "Induction training given before chemical handling",
      "Monitoring safe handling of chemicals",
      "Provision of PPEs for chemical handling",
      "Availability of MSDS on site",
      "Ensure suction lines or foot valve are proper",
    ],
  },
  {
    title: "FIRE & EMERGENCY",
    items: [
      "General condition of fire extinguishers satisfactory",
      "Fire extinguishers tagged with last inspection date",
      "Mock drills are conducted and recorded",
      "Emergency numbers posted appropriately",
      "Firefighting training given to operators",
    ],
  },
  {
    title: "FIRST AID AND ACCIDENT REPORTING",
    items: [
      "First aid stations in good condition and accessible during shifts",
      "First aid stations regularly inspected",
      "Items in first aid station sufficiently stocked",
      "At least one first aider present during working hours",
      "Investigation results communicated to internal teams",
      "Slippery surface / wet surface",
      "Sharp edges inside STP",
      "Inadequate / dim lighting",
      "Other observation if any",
    ],
  },
  {
    title: "ELECTRICAL CHECKLIST",
    items: [
      "Is electrical equipment being used safely",
      "Is work area free from trip hazard from cables",
      "Is grounding and earthing available",
      "Panel board holes covered with rubber bush/glands",
      "Damaged cables/MCC repaired or replaced immediately",
      "Contactors/sockets/MCBs not burnt inside panel",
      "Lighting adequate inside STP",
      "Cable trays in good condition",
      "SOPs in place for electrical pumps",
      "Electrical equipment like pumps, motors, blowers in good condition",
      "All rotating parts covered with safety guards",
      "Rubber mats available near panel board",
    ],
  },
  {
    title: "CHEMICAL CHECKLIST",
    items: [
      "Chemical storage area clean, neat, odour free",
      "MSDS available for Sodium Hypochlorite",
      "Sodium Hypochlorite stored according to compatibility",
      "COSHH/Hazardous material assessment available",
      "Operators aware of Sodium Hypochlorite use",
      "Operators trained in proper PPE use",
      "Appropriate PPE available for Sodium Hypochlorite",
      "Operators trained in eyewash/extinguisher use",
      "Chemical kept under proper ventilation",
    ],
  },
  {
    title: "FIRST AID MATERIAL CONTENT LIST",
    items: [
      "Soft Swab 7.5cm×7.5cm [pack of 5]",
      "Alchol Swab BD",
      "Hansaplast Plaster [20 regular patches + 4 Hansaplast round plaster]",
      "Soft Swab 10cm×10cm [pack of 5]",
      "Sterile Dressing 7cm×5cm",
      "Sterile Dressing 10cm×10cm",
      "Sterile Dressing 20cm×10cm",
      "Rolled Stretch Bandage 5cm×3m",
      "3M Adhesive Tape 2.5×9m",
      "Medicrepe Crepe Bandage 7.5cm×4m",
      "Cipladine Ointment 10g",
      "Triangular bandage",
      "Absorbent Cotton Wool 60g",
      "Zip Pouch Bags 15cm×20cm",
      "Safety pins [pack of 10]",
      "Scissors 11.5cm SS plastic Handle",
      "Tweezers",
      "Dettol Antiseptic Solution 60ml",
      "Wooden Splint 20cm×2.5cm 5mm Thickness Pair",
      "Tourniquet",
    ],
  },
];

export default function MBRChecklistForm({ onChecklistFilled }) {
  const [responses, setResponses] = useState({});

  const handleChange = (section, idx, field, value, description = "") => {
    setResponses((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [idx]: { ...prev[section]?.[idx], [field]: value, description },
      },
    }));
  };

  useEffect(() => {
    onChecklistFilled && onChecklistFilled(responses);
  }, [responses]);

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center" style={{ color: "#236a80" }}>
        MBR SAFETY CHECKLIST
      </h3>

      {MBR_SECTIONS.map((sec, sIndex) => (
        <div key={sIndex} className="card mb-3 border">
          <div
            className="card-header text-white"
            style={{ backgroundColor: "#236a80" }}
          >
            {sec.title}
          </div>
          <div className="card-body p-0">
            <table className="table table-bordered checklist-table m-0">
              <thead className="table-light">
                <tr>
                  {sec.title === "FIRST AID MATERIAL CONTENT LIST" ? (
                    <>
                      <th style={{ width: "5%" }}>SL. NO</th>
                      <th>ITEM</th>
                      <th style={{ width: "10%" }}>QTY</th>
                      <th style={{ width: "5%" }}>YES</th>
                      <th style={{ width: "5%" }}>NO</th>
                      <th>EXPIRY DATE</th>
                    </>
                  ) : (
                    <>
                      <th style={{ width: "5%" }}>SL. NO</th>
                      <th>Safety Description</th>
                      <th style={{ width: "5%" }}>YES</th>
                      <th style={{ width: "5%" }}>NO</th>
                      <th style={{ width: "5%" }}>NA</th>
                      <th>Remarks</th>
                      <th>Previous Month Remarks</th>
                      <th>Action Plan (Still Open/Closed)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {sec.items.map((item, i) => {
                  const isFirstAid =
                    sec.title === "FIRST AID MATERIAL CONTENT LIST";
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{item}</td>
                      {isFirstAid ? (
                        <>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={responses[sec.title]?.[i]?.qty || ""}
                              onChange={(e) =>
                                handleChange(
                                  sec.title,
                                  i,
                                  "qty",
                                  e.target.value,
                                  item
                                )
                              }
                            />
                          </td>
                          {["yes", "no"].map((opt) => (
                            <td key={opt} className="text-center">
                              <input
                                type="radio"
                                name={`${sIndex}-${i}`}
                                checked={
                                  responses[sec.title]?.[i]?.status === opt
                                }
                                onChange={() =>
                                  handleChange(
                                    sec.title,
                                    i,
                                    "status",
                                    opt,
                                    item
                                  )
                                }
                              />
                            </td>
                          ))}
                          <td>
                            <input
                              type="date"
                              className="form-control"
                              value={responses[sec.title]?.[i]?.expiry || ""}
                              onChange={(e) =>
                                handleChange(
                                  sec.title,
                                  i,
                                  "expiry",
                                  e.target.value,
                                  item
                                )
                              }
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          {["yes", "no", "na"].map((opt) => (
                            <td key={opt} className="text-center">
                              <input
                                type="radio"
                                name={`${sIndex}-${i}`}
                                checked={
                                  responses[sec.title]?.[i]?.status === opt
                                }
                                onChange={() =>
                                  handleChange(
                                    sec.title,
                                    i,
                                    "status",
                                    opt,
                                    item
                                  )
                                }
                              />
                            </td>
                          ))}
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={responses[sec.title]?.[i]?.remarks || ""}
                              onChange={(e) =>
                                handleChange(
                                  sec.title,
                                  i,
                                  "remarks",
                                  e.target.value,
                                  item
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={responses[sec.title]?.[i]?.previous || ""}
                              onChange={(e) =>
                                handleChange(
                                  sec.title,
                                  i,
                                  "previous",
                                  e.target.value,
                                  item
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={responses[sec.title]?.[i]?.action || ""}
                              onChange={(e) =>
                                handleChange(
                                  sec.title,
                                  i,
                                  "action",
                                  e.target.value,
                                  item
                                )
                              }
                            />
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
