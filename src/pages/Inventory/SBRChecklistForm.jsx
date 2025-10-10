import React, { useState, useEffect } from "react";
import "./checklist.css";

const SBR_SECTIONS = [
  {
    title: "FACILITY ENTRANCE AND SAFETY FIRST IMPRESSION",
    equipment: "General Area",
    items: [
      "Proper Safety protective equipment provided to everyone entering the STP",
      "Proper induction training given to visitors entering the STP area",
      "Safety signages/boards placed inside the STP plant",
      "Work areas are generally safe and free from hazards and obstructions",
      "Safety rules are being enforced visually throughout the whole facility",
      "PPE's are being used as per the requirement",
    ],
  },
  {
    title: "EQUIPMENT NAME: BAR SCREEN",
    items: [
      "Provision of Handrails",
      "Safe working Platform",
      "Bar screen cleaning is done regularly and safely",
      "Collection of waste from bar screen is done regularly",
      "PPE's worn by operators during bar screen cleaning",
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
      "PPE's worn by the operators during the fine screen cleaning",
      "Is operators are wearing apron while cleaning the fine screen",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: RAW SEWAGE PUMP 1/2",
    items: [
      "Provided pump protected with safety shields",
      "Mechanical Aid provision for pump lifting",
      "Training provision for lifting the pump",
      "Provision of proper discharge lines",
      "Check for Oil & water leakage",
      "Check terminals cover for loose connection",
      "Discharge line perfect before operating",
      "Are SOPs displayed near the pumps",
      "Check noise within limits (dB)",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: EQUILISATION AIR BLOWER 1",
    items: [
      "Check for safety Guards around the rotating parts",
      "Safe working Platform for air blower",
      "Check for the availability of Acoustic enclosure",
      "Check the noise level is within the specified limits (decibels)",
      "Check for any Electrical loose connection",
      "Ensure that the v-belts connecting the drive and the driver are in good condition",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: EQUILISATION AIR BLOWER 2",
    items: [
      "Check for safety Guards around the rotating parts",
      "Safe working Platform for air blower",
      "Check for the availability of Acoustic enclosure",
      "Check the noise level is within the specified limits (decibels)",
      "Check for any Electrical loose connection",
      "Ensure that the v-belts connecting the drive and the driver are in good condition",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: SBR AIR BLOWER 1",
    items: [
      "Check for safety Guards around the rotating parts",
      "Safe working Platform for air blower",
      "Check for the availability of Acoustic enclosure",
      "Check the noise level is within the specified limits (decibels)",
      "Check for any Electrical loose connection",
      "Ensure that the v-belts connecting the drive and the driver are in good condition",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: SBR AIR BLOWER 2",
    items: [
      "Check for safety Guards around the rotating parts",
      "Safe working Platform for air blower",
      "Check for the availability of Acoustic enclosure",
      "Check the noise level is within the specified limits (decibels)",
      "Check for any Electrical loose connection",
      "Ensure that the v-belts connecting the drive and the driver are in good condition",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: SLUDGE RECIRCULATION PUMP",
    items: [
      "Check for safety Guards around the moving parts",
      "Safe working Platform",
      "Check for the direction of rotation",
      "Check the noise level is within the specified limits (decibels)",
      "Check for any Electrical loose connection",
      "Check for the oil and water leakage",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: SCREW PUMP",
    items: [
      "Check for the condition of equipment",
      "Check for safety Guards around the moving parts",
      "Safe working Platform for air blower",
      "Check for the oil and water leakage",
      "Check for the v-belt condition",
      "Check for any Electrical loose connection",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: FILTER FEED PUMP",
    items: [
      "Check for the condition of equipment",
      "Safe working Platform for filter feed pump unit",
      "Check for all pipe fittings and connections are tightened properly",
      "Check for any Electrical loose connection",
      "Check for the hydraulic condition and oil leakage",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: FILTER PRESS UNIT",
    items: [
      "Safe working Platform for filter press unit",
      "Provision of proper discharge lines",
      "Check for the suction pressure line",
      "Check for discharge pressure gauge",
      "Check for the SOPs availability near PSF",
      "Check for the water and air line leakage",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: PSF (PRESSURE SAND FILTER)",
    items: [
      "Safe working Platform for PSF",
      "Provision of proper discharge lines",
      "Check for the suction pressure line",
      "Check for discharge pressure gauge",
      "Check for the SOPs availability near PSF",
      "Check for the water and air line leakage",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: ACF (ACTIVATED CARBON FILTER)",
    items: [
      "Safe working Platform for ACF",
      "Provision of proper discharge lines",
      "Check for the suction pressure line",
      "Check for discharge pressure gauge",
      "Check for the SOPs availability near ACF",
      "Check for the water and air line leakage",
      "Other observations if any",
    ],
  },
  {
    title: "EQUIPMENT NAME: DOSING PUMP",
    items: [
      "Induction training given before chemical handling",
      "Monitoring the safe handling of chemicals",
      "Provision of PPEs for chemical handling",
      "Availability of MSDS on the site",
      "Ensure the suction lines or foot valve are proper",
      "Other observations if any",
    ],
  },
  {
    title: "FRESH AIR FAN",
    items: [
      "Condition of the fan",
      "Check for noise / vibrations from duct",
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
    title: "FIRE & EMERGENCY",
    items: [
      "The general condition of fire extinguishers is satisfactory",
      "Is the fire extinguishers tagged with last date of inspection",
      "Mock drills are given and recorded",
      "Emergency numbers are posted at appropriate places",
      "Are fire fighting training given to the operators",
      "Other observations if any",
    ],
  },
  {
    title: "FIRST AID AND ACCIDENT REPORTING",
    items: [
      "First aid stations are in good condition and accessible during all shifts",
      "First aid stations are regularly inspected",
      "Items in each first aid station are of sufficient quantities and adequately stocked",
      "At least one first aider is present at all times during working hours",
      "Accident & serious incident investigations are conducted to determine causes and recurrence",
      "Investigation results of accidents and serious incidents are communicated to all internal teams",
      "Slippery surface/wet surface",
      "Sharp edge",
      "Inadequate/dim lighting",
      "Other observations if any",
    ],
  },
  {
    title: "ELECTRICAL CHECKLIST",
    items: [
      "Is electrical equipment being used in safe manner",
      "Is work area free from trip hazard from cables",
      "Is grounding and earthing of all the equipment available",
      "Are panel board holes covered with rubber bush/glands",
      "Are damaged electrical cables/mcb repaired and replaced immediately",
      "Is lighting adequate inside the STP",
      "Are cable trays in good condition",
      "Are SOPs in place for operating electrical pumps",
      "Are all electrical equipment like pump, motor, air blowers in good condition",
      "Are all rotating parts covered with safety guards",
      "Are rubber mats available near electric panel board",
    ],
  },
  {
    title: "CHEMICAL CHECKLIST",
    items: [
      "Is chemical storage area clean, neat, odour free",
      "Is MSDS available for Sodium Hypochlorite",
      "Is Sodium Hypochlorite stored according to compatibility",
      "Is COSHH/Hazardous material assessment available",
      "Are operators aware of using Sodium Hypochlorite",
      "Are operators trained in proper PPEs to be used",
      "Is appropriate PPE available for Sodium Hypochlorite handling",
      "Are operators trained in use of eyewash and extinguisher",
      "Is chemical kept under proper ventilation area",
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

export default function SBRChecklistForm({ onChecklistFilled ,initialData = {} }) {
  const [responses, setResponses] = useState({});
  
// Prefill logic — if initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setResponses(initialData);
    }
  }, [initialData]);
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
        SBR SAFETY CHECKLIST
      </h3>

      {SBR_SECTIONS.map((sec, sIndex) => (
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
                      <th>Action Plan</th>
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
                          {/* QTY input */}
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

                          {/* YES / NO radio buttons */}
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

                          {/* Expiry Date input */}
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
                          {/* Normal checklist structure */}
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
