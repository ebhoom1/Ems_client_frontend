// src/pages/Inventory/SafetyReportForm.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import "./inventory.css";
import { nextReportNumber } from "./reportHelpers";
import SBRChecklistForm from "./SBRChecklistForm";
import ASPChecklistForm from "./ASPChecklistForm";
import MBRChecklistForm from "./MBRChecklistForm";
import { useLocation } from "react-router-dom";

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventScroll = (e) => e.preventDefault();

    // Disable page scroll while drawing
    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", preventScroll);
      canvas.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden"; // stop background scroll
    } else {
      document.body.style.overflow = "auto";
    }
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
          <button className="btn btn-secondary" onClick={clear}>
            Clear
          </button>
          <button className="btn btn-danger" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn"
            style={{ backgroundColor: "#236a80", color: "#fff" }}
            onClick={save}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
function ChecklistDisplay({ type }) {
  if (type === "SBR") return <SBRChecklistForm />;
  if (type === "ASP") return <ASPChecklistForm />;
  if (type === "MBR") return <MBRChecklistForm />;
  return <p className="text-muted">No checklist selected.</p>;
}

/* --- Main Safety Report Form --- */
export default function SafetyReportForm() {
  const navigate = useNavigate();
  const { user } = useParams();
  const { validUserOne = {} } = useSelector((s) => s.user.userData || {});
  const submitterName = validUserOne.fname || "";

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const checklistType = params.get("checklist") || "SBR";
const queryParams = new URLSearchParams(location.search);
const editId = queryParams.get("editId"); // check if editing

  // form states
  // const [refNo, setRefNo] = useState("");
  const [refNo, setRefNo] = useState("");
  const [site, setSite] = useState(""); // can reuse plantName or customerName
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

  // ✅ New dynamic checklist
  const [dynamicChecklist, setDynamicChecklist] = useState({});

  // Callback passed to child checklist form
  const handleChecklistFilled = (data) => {
    console.log("✅ Received checklist data:", data);
    setDynamicChecklist(data);
  };

  useEffect(() => {
    console.log("Current Dynamic Checklist:", dynamicChecklist);
  }, [dynamicChecklist]);

  <ChecklistDisplay
    type={checklistType}
    onChecklistFilled={(data) => setDynamicChecklist(data)}
  />;
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

  useEffect(() => {
  if (!editId) return;

  (async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/safetyreport/${editId}`);
      console.log("prefill data:",data);
      if (data.success && data.report) {
        const r = data.report;

        // Prefill all fields
        setRefNo(r.refNo || "");
        setDate(r.date ? new Date(r.date).toISOString().slice(0, 10) : "");
        setCustomerName(r.customerName || "");
        setPlantName(r.plantName || "");
        setCapacity(r.capacity || "");
        setEngineerName(r.engineerName || "");
        setAuditDetails(r.auditDetails || "");
        setObservation(r.observation || "");
        setCustomerRemarks(r.customerRemarks || "");
        setEngineerRemarks(r.engineerRemarks || "");
        setCustName(r.customerSigName || "");
        setCustDesig(r.customerSigDesignation || "");
        setEngName(r.engineerSigName || "");
        setEngDesig(r.engineerSigDesignation || "");

        // ✅ Prefill static checklist
        if (r.checklist) {
          try {
            const parsed = typeof r.checklist === "string" ? JSON.parse(r.checklist) : r.checklist;
            setChecklist({
              workplaceCondition: !!parsed.workplaceCondition,
              safetyPPEs: !!parsed.safetyPPEs,
              operatorsGrooming: !!parsed.operatorsGrooming,
              safetyEquipments: !!parsed.safetyEquipments,
            });
          } catch {
            console.warn("Checklist parse failed");
          }
        }

        // ✅ Prefill dynamic checklist (SBR/ASP/MBR)
        if (r.dynamicChecklist) {
          try {
            const parsed = typeof r.dynamicChecklist === "string"
              ? JSON.parse(r.dynamicChecklist)
              : r.dynamicChecklist;
            setDynamicChecklist(parsed || {});
          } catch {
            console.warn("Dynamic checklist parse failed");
          }
        }

        // ✅ Prefill signatures (if URLs exist)
        if (r.customerSignatureImage || r.customerSignatureImageUrl) {
          setCustSig(r.customerSignatureImage || r.customerSignatureImageUrl);
        }
        if (r.engineerSignatureImage || r.engineerSignatureImageUrl) {
          setEngSig(r.engineerSignatureImage || r.engineerSignatureImageUrl);
        }

        toast.info("Edit Mode: Report data loaded");
      }
    } catch (err) {
      console.error("Error loading safety report:", err);
      toast.error("Failed to load report data");
    }
  })();
}, [editId]);



  const toggleChecklist = (key) =>
    setChecklist({ ...checklist, [key]: !checklist[key] });

  // const handleSubmit = async (e) => {
  //   console.log("hi");
  //   e.preventDefault();
  //   if (!customerName || !engineerName) return console.log("helo");
  //   if (!custSig || !engSig) return toast.error("Both signatures required");

  //   const fd = new FormData();
  //   fd.append("refNo", refNo);
  //   fd.append("date", date);
  //   fd.append("customerName", customerName);
  //   fd.append("plantName", plantName);
  //   fd.append("capacity", capacity);
  //   fd.append("engineerName", engineerName);
  //   fd.append("checklist", JSON.stringify(checklist));
  //   fd.append("auditDetails", auditDetails);
  //   fd.append("observation", observation);
  //   fd.append("customerRemarks", customerRemarks);
  //   fd.append("engineerRemarks", engineerRemarks);
  //   fd.append("checklistType", checklistType); // ✅ store which checklist
  //   fd.append("dynamicChecklist", JSON.stringify(dynamicChecklist)); // ✅ store filled values
  //   fd.append("customerSigName", custName);
  //   fd.append("customerSigDesignation", custDesig);
  //   fd.append("engineerSigName", engName);
  //   fd.append("engineerSigDesignation", engDesig);

  //   const blob = (d) => {
  //     const [hdr, b64] = d.split(",");
  //     const bin = atob(b64);
  //     const u8 = new Uint8Array(bin.length);
  //     for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  //     return new Blob([u8], { type: "image/png" });
  //   };
  //   if (custSig) fd.append("customerSignatureImage", blob(custSig), "cust.png");
  //   if (engSig) fd.append("engineerSignatureImage", blob(engSig), "eng.png");
  //   console.log("formdataa:", fd);
  //   try {
  //     const { data } = await axios.post(`${API_URL}/api/add-safetyreport`, fd, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     console.log("response:", data.data);
  //     if (data.success) {
  //       toast.success("Safety Report submitted!");
  //       navigate("/services?tab=equipmentList");
  //     } else toast.error(data.message || "Error saving report");
  //   } catch (err) {
  //     console.error("submit error", err);
  //     toast.error("Server error submitting report");
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!customerName || !engineerName) {
    toast.error("Please fill required fields");
    return;
  }

  if (!custSig || !engSig) {
    toast.error("Both Customer and Engineer signatures are required");
    return;
  }

  try {
    const fd = new FormData();

    // Append all text fields
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
    fd.append("checklistType", checklistType);
    fd.append("dynamicChecklist", JSON.stringify(dynamicChecklist));
    fd.append("customerSigName", custName);
    fd.append("customerSigDesignation", custDesig);
    fd.append("engineerSigName", engName);
    fd.append("engineerSigDesignation", engDesig);

    // Convert base64 signatures to Blobs
    const blob = (dataUrl) => {
      const [header, base64] = dataUrl.split(",");
      const binary = atob(base64);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
      return new Blob([array], { type: "image/png" });
    };

    if (custSig)
      fd.append("customerSignatureImage", blob(custSig), "customerSignature.png");
    if (engSig)
      fd.append("engineerSignatureImage", blob(engSig), "engineerSignature.png");

    // ✅ Detect mode (add vs edit)
    const isEdit = !!editId;
    const url = isEdit
      ? `${API_URL}/api/safetyreport/update/${editId}`
      : `${API_URL}/api/add-safetyreport`;
    const method = isEdit ? "put" : "post";

    const { data } = await axios({
      method,
      url,
      data: fd,
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (data.success) {
      toast.success(isEdit ? "Safety Report updated successfully!" : "Safety Report submitted!");
      navigate("/services?tab=equipmentList");
    } else {
      toast.error(data.message || "Error saving safety report");
    }
  } catch (err) {
    console.error("❌ Error submitting safety report:", err);
    toast.error("Server error while saving report");
  }
};

  


  useEffect(() => {
    (async () => {
      if (!customerName || !date) return;
      const generated = await nextReportNumber({
        apiBase: API_URL,
        site: customerName,
        isoDate: date,
        prefix: "SAF", // Safety report
      });
      setRefNo(generated);
    })();
  }, [customerName, date]);

  return (
    <div className="container py-4">
      {/*🔹 Render the selected checklist component dynamically */}
      <div className="mb-3">
        {checklistType === "SBR" && (
          <SBRChecklistForm onChecklistFilled={handleChecklistFilled} initialData={dynamicChecklist} />
        )}
        {checklistType === "ASP" && (
          <ASPChecklistForm onChecklistFilled={handleChecklistFilled} initialData={dynamicChecklist}/>
        )}
        {checklistType === "MBR" && (
          <MBRChecklistForm onChecklistFilled={handleChecklistFilled} initialData={dynamicChecklist}/>
        )}
      </div>
      <h3 className="mb-4" style={{ color: "#236a80" }}>
        Safety Audit Report
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="card mb-3 border">
          <div
            className="card-header text-white"
            style={{ backgroundColor: "#236a80" }}
          >
            Report Header
          </div>
          <div className="card-body row g-2">
            {/* <div className="col-md-4">
              <label className="form-label">Ref No.</label>
              <input className="form-control" value={refNo} onChange={(e) => setRefNo(e.target.value)} />
            </div> */}
            <div className="col-md-4">
              <label className="form-label">Ref No.</label>
              <div className="d-flex gap-2">
                <input
                  className="form-control"
                  value={refNo}
                  readOnly
                  placeholder="AUTO"
                />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={async () => {
                    const newRefNo = await nextReportNumber({
                      apiBase: API_URL,
                      site: customerName,
                      isoDate: date,
                      prefix: "SAF",
                    });
                    setRefNo(newRefNo);
                  }}
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Engineer/Technician Name</label>
              <input
                className="form-control"
                value={engineerName}
                onChange={(e) => setEngineerName(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Customer Id</label>
              <input
                className="form-control"
                value={user}
                onChange={(e) => setCustomerName(e.target.value)}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Plant Name</label>
              <input
                className="form-control"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Capacity</label>
              <input
                className="form-control"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="card mb-3 border">
          <div
            className="card-header text-white"
            style={{ backgroundColor: "#236a80" }}
          >
            Safety Checklist
          </div>
          <div className="card-body row">
            <div className="col-md-6 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={checklist.workplaceCondition}
                onChange={() => toggleChecklist("workplaceCondition")}
              />
              <label className="form-check-label">
                Safety Working Condition at Workplace
              </label>
            </div>
            <div className="col-md-6 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={checklist.safetyPPEs}
                onChange={() => toggleChecklist("safetyPPEs")}
              />
              <label className="form-check-label">Safety PPEs</label>
            </div>
            <div className="col-md-6 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={checklist.operatorsGrooming}
                onChange={() => toggleChecklist("operatorsGrooming")}
              />
              <label className="form-check-label">Operators Grooming</label>
            </div>
            <div className="col-md-6 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={checklist.safetyEquipments}
                onChange={() => toggleChecklist("safetyEquipments")}
              />
              <label className="form-check-label">Safety Equipments</label>
            </div>
          </div>
        </div>

        {/* Observations */}
        <div className="card mb-3 border">
          <div
            className="card-header text-white"
            style={{ backgroundColor: "#236a80" }}
          >
            Observations & Remarks
          </div>
          <div className="card-body">
            <label className="form-label">Observation</label>
            <textarea
              className="form-control mb-2"
              rows="2"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
            <label className="form-label">Engineer Remarks</label>
            <textarea
              className="form-control mb-2"
              rows="2"
              value={engineerRemarks}
              onChange={(e) => setEngineerRemarks(e.target.value)}
            />
            <label className="form-label">Customer Remarks</label>
            <textarea
              className="form-control"
              rows="2"
              value={customerRemarks}
              onChange={(e) => setCustomerRemarks(e.target.value)}
            />
          </div>
        </div>

        {/* Signatures */}
        <div className="card mb-3 border">
          <div
            className="card-header text-white"
            style={{ backgroundColor: "#236a80" }}
          >
            Signatures
          </div>
          <div className="card-body row g-3">
            <div className="col-md-6">
              <label className="form-label">Customer Signature</label>
              <button
                type="button"
                className="btn w-100"
                style={{ backgroundColor: "#236a80", color: "#fff" }}
                onClick={() => setShowCustModal(true)}
              >
                {custSig ? "✓ Signature Captured" : "Click to Draw Signature"}
              </button>
              <input
                type="text"
                className="form-control mt-2"
                placeholder="Customer Name"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
              />
              <input
                type="text"
                className="form-control mt-2"
                placeholder="Customer Designation"
                value={custDesig}
                onChange={(e) => setCustDesig(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Engineer Signature</label>
              <button
                type="button"
                className="btn w-100"
                style={{ backgroundColor: "#236a80", color: "#fff" }}
                onClick={() => setShowEngModal(true)}
              >
                {engSig ? "✓ Signature Captured" : "Click to Draw Signature"}
              </button>
              <input
                type="text"
                className="form-control mt-2"
                placeholder="Engineer Name"
                value={engName}
                onChange={(e) => setEngName(e.target.value)}
              />
              <input
                type="text"
                className="form-control mt-2"
                placeholder="Engineer Designation"
                value={engDesig}
                onChange={(e) => setEngDesig(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/services?tab=equipmentList")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn"
            style={{ backgroundColor: "#236a80", color: "#fff" }}
          >
            Submit Safety Report
          </button>
        </div>
      </form>

      {/* Signature Modals */}
      <SignatureModal
        show={showCustModal}
        onClose={() => setShowCustModal(false)}
        onSave={setCustSig}
      />
      <SignatureModal
        show={showEngModal}
        onClose={() => setShowEngModal(false)}
        onSave={setEngSig}
      />
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
