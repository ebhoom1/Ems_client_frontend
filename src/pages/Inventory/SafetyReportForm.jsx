// // src/pages/Inventory/SafetyReportForm.jsx
// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { API_URL } from "../../utils/apiConfig";
// import "./inventory.css";

// /* --- Signature Modal --- */
// function SignatureModal({ show, onClose, onSave }) {
//   const canvasRef = useRef(null);
//   const drawing = useRef(false);
//   const last = useRef({ x: 0, y: 0 });

//   useEffect(() => {
//     if (!show) return;
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     ctx.fillStyle = "#fff";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//     ctx.strokeStyle = "#111";
//     ctx.lineWidth = 2;
//     ctx.lineCap = "round";
//   }, [show]);

//   const pos = (e) => {
//     const rect = canvasRef.current.getBoundingClientRect();
//     const t = e.touches?.[0];
//     return {
//       x: (t ? t.clientX : e.clientX) - rect.left,
//       y: (t ? t.clientY : e.clientY) - rect.top,
//     };
//   };
//   const start = (e) => {
//     e.preventDefault();
//     drawing.current = true;
//     last.current = pos(e);
//   };
//   const move = (e) => {
//     if (!drawing.current) return;
//     e.preventDefault();
//     const { x, y } = pos(e);
//     const ctx = canvasRef.current.getContext("2d");
//     ctx.beginPath();
//     ctx.moveTo(last.current.x, last.current.y);
//     ctx.lineTo(x, y);
//     ctx.stroke();
//     last.current = { x, y };
//   };
//   const end = () => (drawing.current = false);
//   const clear = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     ctx.fillStyle = "#fff";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//   };
//   const save = () => {
//     const dataUrl = canvasRef.current.toDataURL("image/png");
//     onSave(dataUrl);
//     onClose();
//   };

//   if (!show) return null;
//   return (
//     <div style={overlayStyle}>
//       <div style={modalBoxStyle}>
//         <h5 style={{ color: "#236a80" }}>Draw Signature</h5>
//         <canvas
//           ref={canvasRef}
//           width={450}
//           height={200}
//           style={{ border: "1px solid #ccc", borderRadius: 6, width: "100%" }}
//           onMouseDown={start}
//           onMouseMove={move}
//           onMouseUp={end}
//           onMouseLeave={end}
//           onTouchStart={start}
//           onTouchMove={move}
//           onTouchEnd={end}
//         />
//         <div className="d-flex justify-content-between mt-3">
//           <button className="btn btn-secondary" onClick={clear}>Clear</button>
//           <button className="btn btn-danger" onClick={onClose}>Cancel</button>
//           <button
//             className="btn"
//             style={{ backgroundColor: "#236a80", color: "#fff" }}
//             onClick={save}
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* --- Main Safety Report Form --- */
// export default function SafetyReportForm({ equipmentId, equipmentName }) {
//   const { equipmentId: paramEquipmentId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const currentEquipmentId = equipmentId || paramEquipmentId;
//   const currentEquipmentName = equipmentName || location.state?.equipmentName;

//   const { validUserOne = {} } = useSelector((s) => s.user.userData || {});
//   const submitterName = validUserOne.fname || "";

//   // form states
//   const [customerName, setCustomerName] = useState(location.state?.userName || "");
//   const [plantName, setPlantName] = useState("");
//   const [capacity, setCapacity] = useState("");
//   const [engineerName, setEngineerName] = useState(submitterName);
//   const [checklist, setChecklist] = useState({
//     workplaceCondition: false,
//     safetyPPEs: false,
//     operatorsGrooming: false,
//     safetyEquipments: false,
//   });
//   const [observation, setObservation] = useState("");
//   const [customerRemarks, setCustomerRemarks] = useState("");
//   const [engineerRemarks, setEngineerRemarks] = useState("");
//   const [photos, setPhotos] = useState([]);

//   // signatures
//   const [custSig, setCustSig] = useState("");
//   const [engSig, setEngSig] = useState("");
//   const [custName, setCustName] = useState("");
//   const [custDesig, setCustDesig] = useState("");
//   const [engName, setEngName] = useState(submitterName || "");
//   const [engDesig, setEngDesig] = useState("");
//   const [showCustModal, setShowCustModal] = useState(false);
//   const [showEngModal, setShowEngModal] = useState(false);

//   const handleFileChange = (e) => setPhotos([...e.target.files]);
//   const toggleChecklist = (key) =>
//     setChecklist({ ...checklist, [key]: !checklist[key] });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!customerName || !engineerName) return toast.error("Missing required fields");
//     if (!custSig || !engSig) return toast.error("Both signatures required");

//     const fd = new FormData();
//     fd.append("equipmentId", currentEquipmentId);
//     fd.append("equipmentName", currentEquipmentName);
//     fd.append("customerName", customerName);
//     fd.append("plantName", plantName);
//     fd.append("capacity", capacity);
//     fd.append("engineerName", engineerName);
//     fd.append("checklist", JSON.stringify(checklist));
//     fd.append("observation", observation);
//     fd.append("customerRemarks", customerRemarks);
//     fd.append("engineerRemarks", engineerRemarks);

//     fd.append("customerSigName", custName);
//     fd.append("customerSigDesignation", custDesig);
//     fd.append("engineerSigName", engName);
//     fd.append("engineerSigDesignation", engDesig);

//     const blob = (d) => {
//       const [hdr, b64] = d.split(",");
//       const bin = atob(b64);
//       const u8 = new Uint8Array(bin.length);
//       for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
//       return new Blob([u8], { type: "image/png" });
//     };
//     if (custSig) fd.append("customerSignatureImage", blob(custSig), "cust.png");
//     if (engSig) fd.append("engineerSignatureImage", blob(engSig), "eng.png");

//     photos.forEach((f) => fd.append("photos", f));

//     try {
//       const { data } = await axios.post(`${API_URL}/api/add-safetyreport`, fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       if (data.success) {
//         toast.success("Safety Report submitted!");
//         navigate("/services?tab=equipmentList");
//       } else toast.error(data.message || "Error saving report");
//     } catch (err) {
//       console.error("submit error", err);
//       toast.error("Server error submitting report");
//     }
//   };

//   return (
//     <div className="container py-4">
//       <h3 className="mb-4" style={{ color: "#236a80" }}>
//         Safety Audit Report - {currentEquipmentName}
//       </h3>

//       <form onSubmit={handleSubmit}>
//         {/* Basic Info */}
//         <div className="card mb-3 border">
//           <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
//             Report Header
//           </div>
//           <div className="card-body row g-2">
//             <div className="col-md-4">
//               <label className="form-label">Customer Name</label>
//               <input className="form-control" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Plant Name</label>
//               <input className="form-control" value={plantName} onChange={(e) => setPlantName(e.target.value)} />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Capacity</label>
//               <input className="form-control" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Engineer Name</label>
//               <input className="form-control" value={engineerName} onChange={(e) => setEngineerName(e.target.value)} />
//             </div>
//           </div>
//         </div>

//         {/* Checklist */}
//         <div className="card mb-3 border">
//           <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
//             Safety Checklist
//           </div>
//           <div className="card-body row">
//             {Object.keys(checklist).map((k) => (
//               <div className="col-md-6 form-check" key={k}>
//                 <input
//                   type="checkbox"
//                   className="form-check-input"
//                   checked={checklist[k]}
//                   onChange={() => toggleChecklist(k)}
//                 />
//                 <label className="form-check-label">{k}</label>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Remarks */}
//         <div className="card mb-3 border">
//           <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
//             Observations & Remarks
//           </div>
//           <div className="card-body">
//             <label className="form-label">Observation</label>
//             <textarea className="form-control mb-2" rows="2" value={observation} onChange={(e) => setObservation(e.target.value)} />
//             <label className="form-label">Engineer Remarks</label>
//             <textarea className="form-control mb-2" rows="2" value={engineerRemarks} onChange={(e) => setEngineerRemarks(e.target.value)} />
//             <label className="form-label">Customer Remarks</label>
//             <textarea className="form-control" rows="2" value={customerRemarks} onChange={(e) => setCustomerRemarks(e.target.value)} />
//           </div>
//         </div>

//         {/* Photos */}
//         <div className="mb-3">
//           <label className="form-label">Upload Photos</label>
//           <input type="file" multiple className="form-control" onChange={handleFileChange} />
//         </div>

//         {/* Signatures */}
//         <div className="card mb-3 border">
//           <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
//             Signatures
//           </div>
//           <div className="card-body row g-3">
//             <div className="col-md-6">
//               <label className="form-label">Customer Signature</label>
//               <button type="button" className="btn w-100" style={{ backgroundColor: "#236a80", color: "#fff" }} onClick={() => setShowCustModal(true)}>
//                 {custSig ? "✓ Signature Captured" : "Click to Draw Signature"}
//               </button>
//               <input type="text" className="form-control mt-2" placeholder="Customer Name" value={custName} onChange={(e) => setCustName(e.target.value)} />
//               <input type="text" className="form-control mt-2" placeholder="Customer Designation" value={custDesig} onChange={(e) => setCustDesig(e.target.value)} />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Engineer Signature</label>
//               <button type="button" className="btn w-100" style={{ backgroundColor: "#236a80", color: "#fff" }} onClick={() => setShowEngModal(true)}>
//                 {engSig ? "✓ Signature Captured" : "Click to Draw Signature"}
//               </button>
//               <input type="text" className="form-control mt-2" placeholder="Engineer Name" value={engName} onChange={(e) => setEngName(e.target.value)} />
//               <input type="text" className="form-control mt-2" placeholder="Engineer Designation" value={engDesig} onChange={(e) => setEngDesig(e.target.value)} />
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="d-flex justify-content-end gap-2">
//           <button type="button" className="btn btn-secondary" onClick={() => navigate("/services?tab=equipmentList")}>
//             Cancel
//           </button>
//           <button type="submit" className="btn" style={{ backgroundColor: "#236a80", color: "#fff" }}>
//             Submit Safety Report
//           </button>
//         </div>
//       </form>

//       {/* Signature Modals */}
//       <SignatureModal show={showCustModal} onClose={() => setShowCustModal(false)} onSave={setCustSig} />
//       <SignatureModal show={showEngModal} onClose={() => setShowEngModal(false)} onSave={setEngSig} />
//     </div>
//   );
// }

// /* --- Modal Styles --- */
// const overlayStyle = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   width: "100%",
//   height: "100%",
//   background: "rgba(0,0,0,0.5)",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   zIndex: 2000,
// };
// const modalBoxStyle = {
//   background: "#fff",
//   padding: 20,
//   borderRadius: 8,
//   width: "90%",
//   maxWidth: 500,
// };


// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { API_URL } from "../../utils/apiConfig";
// import "./inventory.css";

// /* --- Signature Modal --- */
// function SignatureModal({ show, onClose, onSave }) {
//   const canvasRef = useRef(null);
//   const drawing = useRef(false);
//   const last = useRef({ x: 0, y: 0 });

//   useEffect(() => {
//     if (!show) return;
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     ctx.fillStyle = "#fff";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//     ctx.strokeStyle = "#111";
//     ctx.lineWidth = 2;
//     ctx.lineCap = "round";
//   }, [show]);

//   const pos = (e) => {
//     const rect = canvasRef.current.getBoundingClientRect();
//     const t = e.touches?.[0];
//     return {
//       x: (t ? t.clientX : e.clientX) - rect.left,
//       y: (t ? t.clientY : e.clientY) - rect.top,
//     };
//   };
//   const start = (e) => {
//     e.preventDefault();
//     drawing.current = true;
//     last.current = pos(e);
//   };
//   const move = (e) => {
//     if (!drawing.current) return;
//     e.preventDefault();
//     const { x, y } = pos(e);
//     const ctx = canvasRef.current.getContext("2d");
//     ctx.beginPath();
//     ctx.moveTo(last.current.x, last.current.y);
//     ctx.lineTo(x, y);
//     ctx.stroke();
//     last.current = { x, y };
//   };
//   const end = () => (drawing.current = false);
//   const clear = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     ctx.fillStyle = "#fff";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//   };
//   const save = () => {
//     const dataUrl = canvasRef.current.toDataURL("image/png");
//     onSave(dataUrl);
//     onClose();
//   };

//   if (!show) return null;
//   return (
//     <div style={overlayStyle}>
//       <div style={modalBoxStyle}>
//         <h5 style={{ color: "#236a80" }}>Draw Signature</h5>
//         <canvas
//           ref={canvasRef}
//           width={450}
//           height={200}
//           style={{ border: "1px solid #ccc", borderRadius: 6, width: "100%" }}
//           onMouseDown={start}
//           onMouseMove={move}
//           onMouseUp={end}
//           onMouseLeave={end}
//           onTouchStart={start}
//           onTouchMove={move}
//           onTouchEnd={end}
//         />
//         <div className="d-flex justify-content-between mt-3">
//           <button className="btn btn-secondary" onClick={clear}>Clear</button>
//           <button className="btn btn-danger" onClick={onClose}>Cancel</button>
//           <button className="btn" style={{ backgroundColor: "#236a80", color: "#fff" }} onClick={save}>
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* --- Main Safety Report Form --- */
// export default function SafetyReportForm({ equipmentId, equipmentName, equipmentUserName }) {
//   const { equipmentId: paramEquipmentId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const currentEquipmentId = equipmentId || paramEquipmentId;
//   const currentEquipmentName = equipmentName || location.state?.equipmentName;
//   const initialCustomerName = equipmentUserName || location.state?.userName;

//   const { validUserOne = {} } = useSelector((s) => s.user.userData || {});
//   const submitterName = validUserOne.fname || "";

//   // form states
//   const [refNo, setRefNo] = useState("");
//   const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
//   const [customerName, setCustomerName] = useState(initialCustomerName || "");
//   const [plantName, setPlantName] = useState("");
//   const [capacity, setCapacity] = useState("");
//   const [engineerName, setEngineerName] = useState(submitterName);

//   const [checklist, setChecklist] = useState({
//     workplaceCondition: false,
//     safetyPPEs: false,
//     operatorsGrooming: false,
//     safetyEquipments: false,
//   });

//   const [auditDetails, setAuditDetails] = useState("");
//   const [observation, setObservation] = useState("");
//   const [customerRemarks, setCustomerRemarks] = useState("");
//   const [engineerRemarks, setEngineerRemarks] = useState("");

//   // signatures
//   const [custSig, setCustSig] = useState("");
//   const [engSig, setEngSig] = useState("");
//   const [custName, setCustName] = useState("");
//   const [custDesig, setCustDesig] = useState("");
//   const [engName, setEngName] = useState(submitterName || "");
//   const [engDesig, setEngDesig] = useState("");
//   const [showCustModal, setShowCustModal] = useState(false);
//   const [showEngModal, setShowEngModal] = useState(false);

//   const toggleChecklist = (key) =>
//     setChecklist({ ...checklist, [key]: !checklist[key] });

//   /* --- Prefill plant details from equipment API --- */
//   useEffect(() => {
//     const loadEq = async () => {
//       if (!currentEquipmentId) return;
//       try {
//         const res = await axios.get(`${API_URL}/api/equiment/${currentEquipmentId}`);
//         const eq = res.data.equipment;
//         if (eq) {
//           setCapacity((p) => p || eq.capacity || "");
//           setPlantName((p) => p || eq.technology || ""); 
//           if (!customerName && eq.userName) setCustomerName(eq.userName);
//         }
//       } catch (err) {
//         console.error("equipment fetch error", err);
//       }
//     };
//     loadEq();
//   }, [currentEquipmentId]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!customerName || !engineerName) return toast.error("Missing required fields");
//     if (!custSig || !engSig) return toast.error("Both signatures required");

//     const fd = new FormData();
//     fd.append("equipmentId", currentEquipmentId);
//     fd.append("equipmentName", currentEquipmentName);
//     fd.append("refNo", refNo);
//     fd.append("date", date);
//     fd.append("customerName", customerName);
//     fd.append("plantName", plantName);
//     fd.append("capacity", capacity);
//     fd.append("engineerName", engineerName);
//     fd.append("checklist", JSON.stringify(checklist));
//     fd.append("auditDetails", auditDetails);
//     fd.append("observation", observation);
//     fd.append("customerRemarks", customerRemarks);
//     fd.append("engineerRemarks", engineerRemarks);

//     fd.append("customerSigName", customerName);
//     fd.append("customerSigDesignation", custDesig);
//     fd.append("engineerSigName", engName);
//     fd.append("engineerSigDesignation", engDesig);

//     const blob = (d) => {
//       const [hdr, b64] = d.split(",");
//       const bin = atob(b64);
//       const u8 = new Uint8Array(bin.length);
//       for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
//       return new Blob([u8], { type: "image/png" });
//     };
//     if (custSig) fd.append("customerSignatureImage", blob(custSig), "cust.png");
//     if (engSig) fd.append("engineerSignatureImage", blob(engSig), "eng.png");

//     try {
//       const { data } = await axios.post(`${API_URL}/api/add-safetyreport`, fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       if (data.success) {
//         toast.success("Safety Report submitted!");
//         navigate("/services?tab=equipmentList");
//       } else toast.error(data.message || "Error saving report");
//     } catch (err) {
//       console.error("submit error", err);
//       toast.error("Server error submitting report");
//     }
//   };

//   return (
//     <div className="container py-4">
//       <h3 className="mb-4" style={{ color: "#236a80" }}>
//         Safety Audit Report - {currentEquipmentName}
//       </h3>

//       <form onSubmit={handleSubmit}>
//         {/* Header */}
//         <div className="card mb-3 border">
//           <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
//             Report Header
//           </div>
//           <div className="card-body row g-2">
//             <div className="col-md-4">
//               <label className="form-label">Ref No.</label>
//               <input className="form-control" value={refNo} onChange={(e) => setRefNo(e.target.value)} />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Date</label>
//               <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Engineer/Technician Name</label>
//               <input className="form-control" value={engineerName} onChange={(e) => setEngineerName(e.target.value)} />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Customer Name & Address</label>
//               <input className="form-control" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Plant Name</label>
//               <input className="form-control" value={plantName} onChange={(e) => setPlantName(e.target.value)} />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Capacity</label>
//               <input className="form-control" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
//             </div>
//           </div>
//         </div>

//         {/* Checklist */}
//         <div className="card mb-3 border">
//           <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
//             Safety Checklist
//           </div>
//           <div className="card-body row">
//             <div className="col-md-6 form-check">
//               <input type="checkbox" className="form-check-input" checked={checklist.workplaceCondition} onChange={() => toggleChecklist("workplaceCondition")} />
//               <label className="form-check-label">Safety Working Condition at Workplace</label>
//             </div>
//             <div className="col-md-6 form-check">
//               <input type="checkbox" className="form-check-input" checked={checklist.safetyPPEs} onChange={() => toggleChecklist("safetyPPEs")} />
//               <label className="form-check-label">Safety PPEs (Gloves, Helmet, Goggles, Mask, Apron, Ear Plugs)</label>
//             </div>
//             <div className="col-md-6 form-check">
//               <input type="checkbox" className="form-check-input" checked={checklist.operatorsGrooming} onChange={() => toggleChecklist("operatorsGrooming")} />
//               <label className="form-check-label">Operators Well Grooming</label>
//             </div>
//             <div className="col-md-6 form-check">
//               <input type="checkbox" className="form-check-input" checked={checklist.safetyEquipments} onChange={() => toggleChecklist("safetyEquipments")} />
//               <label className="form-check-label">Safety Equipments (Ladders, Life Tubes, Ropes, Eye Washer)</label>
//             </div>
//           </div>
//         </div>

//         {/* Safety Audit Details */}
//         <div className="card mb-3 border">
//           <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
//             Details of Safety Audit Done
//           </div>
//           <div className="card-body">
//             <textarea className="form-control" rows="3" placeholder="Enter details of safety audit performed..." value={auditDetails} onChange={(e) => setAuditDetails(e.target.value)} />
//           </div>
//         </div>

//         {/* Observations & Remarks */}
//         <div className="card mb-3 border">
//           <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
//             Observations & Remarks
//           </div>
//           <div className="card-body">
//             <label className="form-label">Observation</label>
//             <textarea className="form-control mb-2" rows="2" value={observation} onChange={(e) => setObservation(e.target.value)} />
//             <label className="form-label">Engineer Remarks</label>
//             <textarea className="form-control mb-2" rows="2" value={engineerRemarks} onChange={(e) => setEngineerRemarks(e.target.value)} />
//             <label className="form-label">Customer Remarks</label>
//             <textarea className="form-control" rows="2" value={customerRemarks} onChange={(e) => setCustomerRemarks(e.target.value)} />
//           </div>
//         </div>

//         {/* Signatures */}
//         <div className="card mb-3 border">
//           <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
//             Signatures
//           </div>
//           <div className="card-body row g-3">
//             <div className="col-md-6">
//               <label className="form-label">Customer Signature</label>
//               <button type="button" className="btn w-100" style={{ backgroundColor: "#236a80", color: "#fff" }} onClick={() => setShowCustModal(true)}>
//                 {custSig ? "✓ Signature Captured" : "Click to Draw Signature"}customerName
//               </button>
//               <input type="text" className="form-control mt-2" placeholder="Customer Name" value={customerName} onChange={(e) => setCustName(e.target.value)} />
//               <input type="text" className="form-control mt-2" placeholder="Customer Designation" value={custDesig} onChange={(e) => setCustDesig(e.target.value)} />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Engineer Signature</label>
//               <button type="button" className="btn w-100" style={{ backgroundColor: "#236a80", color: "#fff" }} onClick={() => setShowEngModal(true)}>
//                 {engSig ? "✓ Signature Captured" : "Click to Draw Signature"}
//               </button>
//               <input type="text" className="form-control mt-2" placeholder="Engineer Name" value={engName} onChange={(e) => setEngName(e.target.value)} />
//               <input type="text" className="form-control mt-2" placeholder="Engineer Designation" value={engDesig} onChange={(e) => setEngDesig(e.target.value)} />
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="d-flex justify-content-end gap-2">
//           <button type="button" className="btn btn-secondary" onClick={() => navigate("/services?tab=equipmentList")}>
//             Cancel
//           </button>
//           <button type="submit" className="btn" style={{ backgroundColor: "#236a80", color: "#fff" }}>
//             Submit Safety Report
//           </button>
//         </div>
//       </form>

//       {/* Signature Modals */}
//       <SignatureModal show={showCustModal} onClose={() => setShowCustModal(false)} onSave={setCustSig} />
//       <SignatureModal show={showEngModal} onClose={() => setShowEngModal(false)} onSave={setEngSig} />
//     </div>
//   );
// }

// /* --- Modal Styles --- */
// const overlayStyle = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   width: "100%",
//   height: "100%",
//   background: "rgba(0,0,0,0.5)",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   zIndex: 2000,
// };
// const modalBoxStyle = {
//   background: "#fff",
//   padding: 20,
//   borderRadius: 8,
//   width: "90%",
//   maxWidth: 500,
// };


// src/pages/Inventory/SafetyReportForm.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate,useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import "./inventory.css";

/* --- Signature Modal --- */
function SignatureModal({ show, onClose, onSave }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, [show]);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches?.[0];
    return {
      x: (t ? t.clientX : e.clientX) - rect.left,
      y: (t ? t.clientY : e.clientY) - rect.top,
    };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    last.current = pos(e);
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = pos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = { x, y };
  };
  const end = () => (drawing.current = false);
  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  const save = () => {
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSave(dataUrl);
    onClose();
  };

  if (!show) return null;
  return (
    <div style={overlayStyle}>
      <div style={modalBoxStyle}>
        <h5 style={{ color: "#236a80" }}>Draw Signature</h5>
        <canvas
          ref={canvasRef}
          width={450}
          height={200}
          style={{ border: "1px solid #ccc", borderRadius: 6, width: "100%" }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
        <div className="d-flex justify-content-between mt-3">
          <button className="btn btn-secondary" onClick={clear}>Clear</button>
          <button className="btn btn-danger" onClick={onClose}>Cancel</button>
          <button className="btn" style={{ backgroundColor: "#236a80", color: "#fff" }} onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Main Safety Report Form --- */
export default function SafetyReportForm() {
  const navigate = useNavigate();
  const { user} = useParams();
  const { validUserOne = {} } = useSelector((s) => s.user.userData || {});
  const submitterName = validUserOne.fname || "";

  // form states
  const [refNo, setRefNo] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState(user || "");
  const [plantName, setPlantName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [engineerName, setEngineerName] = useState(submitterName);

  const [checklist, setChecklist] = useState({
    workplaceCondition: false,
    safetyPPEs: false,
    operatorsGrooming: false,
    safetyEquipments: false,
  });

  const [auditDetails, setAuditDetails] = useState("");
  const [observation, setObservation] = useState("");
  const [customerRemarks, setCustomerRemarks] = useState("");
  const [engineerRemarks, setEngineerRemarks] = useState("");

  // signatures
  const [custSig, setCustSig] = useState("");
  const [engSig, setEngSig] = useState("");
  const [custName, setCustName] = useState("");
  const [custDesig, setCustDesig] = useState("");
  const [engName, setEngName] = useState(submitterName || "");
  const [engDesig, setEngDesig] = useState("");
  const [showCustModal, setShowCustModal] = useState(false);
  const [showEngModal, setShowEngModal] = useState(false);

  const toggleChecklist = (key) =>
    setChecklist({ ...checklist, [key]: !checklist[key] });

  const handleSubmit = async (e) => {
    console.log("hi")
    e.preventDefault();
    if (!customerName || !engineerName) return     console.log("helo")
;
    if (!custSig || !engSig) return toast.error("Both signatures required");

    const fd = new FormData();
    fd.append("refNo", refNo);
    fd.append("date", date);
    fd.append("customerName", customerName);
    fd.append("plantName", plantName);
    fd.append("capacity", capacity);
    fd.append("engineerName", engineerName);
    fd.append("checklist", JSON.stringify(checklist));
    fd.append("auditDetails", auditDetails);
    fd.append("observation", observation);
    fd.append("customerRemarks", customerRemarks);
    fd.append("engineerRemarks", engineerRemarks);

    fd.append("customerSigName", custName);
    fd.append("customerSigDesignation", custDesig);
    fd.append("engineerSigName", engName);
    fd.append("engineerSigDesignation", engDesig);

    const blob = (d) => {
      const [hdr, b64] = d.split(",");
      const bin = atob(b64);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return new Blob([u8], { type: "image/png" });
    };
    if (custSig) fd.append("customerSignatureImage", blob(custSig), "cust.png");
    if (engSig) fd.append("engineerSignatureImage", blob(engSig), "eng.png");

    try {
      const { data } = await axios.post(`${API_URL}/api/add-safetyreport`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("response:",data.data);
      if (data.success) {
        toast.success("Safety Report submitted!");
        navigate("/services?tab=equipmentList");
      } else toast.error(data.message || "Error saving report");
    } catch (err) {
      console.error("submit error", err);
      toast.error("Server error submitting report");
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4" style={{ color: "#236a80" }}>
        Safety Audit Report
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="card mb-3 border">
          <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
            Report Header
          </div>
          <div className="card-body row g-2">
            <div className="col-md-4">
              <label className="form-label">Ref No.</label>
              <input className="form-control" value={refNo} onChange={(e) => setRefNo(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Engineer/Technician Name</label>
              <input className="form-control" value={engineerName} onChange={(e) => setEngineerName(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Customer Id</label>
              <input className="form-control" value={user} onChange={(e) => setCustomerName(e.target.value)} readOnly/>
            </div>
            <div className="col-md-6">
              <label className="form-label">Plant Name</label>
              <input className="form-control" value={plantName} onChange={(e) => setPlantName(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Capacity</label>
              <input className="form-control" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="card mb-3 border">
          <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
            Safety Checklist
          </div>
          <div className="card-body row">
            <div className="col-md-6 form-check">
              <input type="checkbox" className="form-check-input" checked={checklist.workplaceCondition} onChange={() => toggleChecklist("workplaceCondition")} />
              <label className="form-check-label">Safety Working Condition at Workplace</label>
            </div>
            <div className="col-md-6 form-check">
              <input type="checkbox" className="form-check-input" checked={checklist.safetyPPEs} onChange={() => toggleChecklist("safetyPPEs")} />
              <label className="form-check-label">Safety PPEs</label>
            </div>
            <div className="col-md-6 form-check">
              <input type="checkbox" className="form-check-input" checked={checklist.operatorsGrooming} onChange={() => toggleChecklist("operatorsGrooming")} />
              <label className="form-check-label">Operators Grooming</label>
            </div>
            <div className="col-md-6 form-check">
              <input type="checkbox" className="form-check-input" checked={checklist.safetyEquipments} onChange={() => toggleChecklist("safetyEquipments")} />
              <label className="form-check-label">Safety Equipments</label>
            </div>
          </div>
        </div>

        {/* Observations */}
        <div className="card mb-3 border">
          <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
            Observations & Remarks
          </div>
          <div className="card-body">
            <label className="form-label">Observation</label>
            <textarea className="form-control mb-2" rows="2" value={observation} onChange={(e) => setObservation(e.target.value)} />
            <label className="form-label">Engineer Remarks</label>
            <textarea className="form-control mb-2" rows="2" value={engineerRemarks} onChange={(e) => setEngineerRemarks(e.target.value)} />
            <label className="form-label">Customer Remarks</label>
            <textarea className="form-control" rows="2" value={customerRemarks} onChange={(e) => setCustomerRemarks(e.target.value)} />
          </div>
        </div>

        {/* Signatures */}
        <div className="card mb-3 border">
          <div className="card-header text-white" style={{ backgroundColor: "#236a80" }}>
            Signatures
          </div>
          <div className="card-body row g-3">
            <div className="col-md-6">
              <label className="form-label">Customer Signature</label>
              <button type="button" className="btn w-100" style={{ backgroundColor: "#236a80", color: "#fff" }} onClick={() => setShowCustModal(true)}>
                {custSig ? "✓ Signature Captured" : "Click to Draw Signature"}
              </button>
              <input type="text" className="form-control mt-2" placeholder="Customer Name" value={custName} onChange={(e) => setCustName(e.target.value)} />
              <input type="text" className="form-control mt-2" placeholder="Customer Designation" value={custDesig} onChange={(e) => setCustDesig(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Engineer Signature</label>
              <button type="button" className="btn w-100" style={{ backgroundColor: "#236a80", color: "#fff" }} onClick={() => setShowEngModal(true)}>
                {engSig ? "✓ Signature Captured" : "Click to Draw Signature"}
              </button>
              <input type="text" className="form-control mt-2" placeholder="Engineer Name" value={engName} onChange={(e) => setEngName(e.target.value)} />
              <input type="text" className="form-control mt-2" placeholder="Engineer Designation" value={engDesig} onChange={(e) => setEngDesig(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/services?tab=equipmentList")}>
            Cancel
          </button>
          <button type="submit" className="btn" style={{ backgroundColor: "#236a80", color: "#fff" }}>
            Submit Safety Report
          </button>
        </div>
      </form>

      {/* Signature Modals */}
      <SignatureModal show={showCustModal} onClose={() => setShowCustModal(false)} onSave={setCustSig} />
      <SignatureModal show={showEngModal} onClose={() => setShowEngModal(false)} onSave={setEngSig} />
    </div>
  );
}

/* --- Modal Styles --- */
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};
const modalBoxStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: "90%",
  maxWidth: 500,
};
