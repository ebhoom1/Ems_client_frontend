import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import "./inventory.css";

/* --- Helpers to generate Report No (FY + seq) --- */
const fiscalYearRange = (iso) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const s = m >= 4 ? y : y - 1;
  const e = s + 1;
  const short = (n) => String(n).slice(-2);
  return `${short(s)}-${short(e)}`;
};
const siteCode = (site) =>
  (site || "SITE")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6) || "SITE";
const nextReportNumber = async ({ apiBase, site, isoDate }) => {
  try {
    const fy = fiscalYearRange(isoDate);
    const { data } = await axios.get(
      `${apiBase}/api/engineer-reports/next-seq?fy=${fy}&site=${encodeURIComponent(
        site || ""
      )}`
    );
    if (data?.success && data?.reportNo) return data.reportNo;
  } catch {}
  return `${siteCode(site)}/VR/${fiscalYearRange(isoDate)}/001`;
};

/* --- Signature Modal --- */
/* --- Signature Modal --- */
function SignatureModal({ show, onClose, onSave }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  // Initialize canvas when modal opens
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

  // ✅ Prevent background scrolling when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
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


/* --- Main Component --- */
export default function EngineerVisitReportForm({
  equipmentId,
  equipmentName,
  equipmentUserName,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { equipmentId: paramEquipmentId } = useParams();
  const { user } = useParams();
  const currentEquipmentId = equipmentId || paramEquipmentId;
  const currentEquipmentName = equipmentName || location.state?.equipmentName;
  const initialCustomerName = equipmentUserName || location.state?.userName;

  const { validUserOne = {} } = useSelector((s) => s.user.userData || {});
  const submitterName = validUserOne.fname || "";

  // Header
  const [referenceNo, setReferenceNo] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState(user || "");
  const [plantCapacity, setPlantCapacity] = useState("");
  const [technology, setTechnology] = useState("");
  const [site, setSite] = useState("");

  // Parameters
  const [parameters, setParameters] = useState({
    phRaw: "",
    phTreated: "",
    mlss: "",
    frc: "",
    tds: "",
    hardness: "",
  });

  // Key Points
  const [keyPoints, setKeyPoints] = useState({
    logBookEntry: false,
    historyCards: false,
    grooming: false,
    housekeeping: false,
    training: false,
    checklist: false,
    noticeBoard: false,
  });

  // Consumables
  const [consumables, setConsumables] = useState({
    sodiumHypo: "",
    blowerOil: "",
    pumpOil: "",
    ppeStock: "",
    antiscalant: "",
    salt: "",
    cottonWaste: "",
    grease: "",
  });

  // Remarks
  const [visitDetails, setVisitDetails] = useState("");
  const [engineerRemarks, setEngineerRemarks] = useState("");
  const [customerRemarks, setCustomerRemarks] = useState("");

  // Signatures
  const [customerSig, setCustomerSig] = useState("");
  const [engineerSig, setEngineerSig] = useState("");
  const [custName, setCustName] = useState("");
  const [custDesig, setCustDesig] = useState("");
  const [engName, setEngName] = useState(submitterName || "");
  const [engDesig, setEngDesig] = useState("");
  const [showCustModal, setShowCustModal] = useState(false);
  const [showEngModal, setShowEngModal] = useState(false);

  useEffect(() => {
    const loadEq = async () => {
      if (!currentEquipmentId) return;
      try {
        const res = await axios.get(
          `${API_URL}/api/equiment/${currentEquipmentId}`
        );
        const eq = res.data.equipment;
        if (eq) {
          setPlantCapacity((p) => p || eq.capacity || "");
          setTechnology((p) => p || eq.technology || "");
          setSite((p) => p || eq.site || "");
          if (!customerName && eq.userName) setCustomerName(eq.userName);
        }
      } catch (err) {
        console.error("equipment fetch error", err);
      }
    };
    loadEq();
  }, [currentEquipmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !submitterName)
      return toast.error("Missing required fields");
    if (!customerSig || !engineerSig)
      return toast.error("Both signatures required");

    const fd = new FormData();
    fd.append("equipmentId", currentEquipmentId);
    fd.append("equipmentName", currentEquipmentName);
    fd.append("referenceNo", referenceNo);
    fd.append("date", date);
    fd.append("customerName", customerName);
    fd.append("engineerName", submitterName);
    fd.append("plantCapacity", plantCapacity);
    fd.append("technology", technology);
    fd.append("site", site);

    fd.append("parameters", JSON.stringify(parameters));
    fd.append("keyPoints", JSON.stringify(keyPoints));
    fd.append("consumables", JSON.stringify(consumables));
    fd.append("visitDetails", visitDetails);
    fd.append("engineerRemarks", engineerRemarks);
    fd.append("customerRemarks", customerRemarks);

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
    if (customerSig)
      fd.append("customerSignatureImage", blob(customerSig), "cust.png");
    if (engineerSig)
      fd.append("engineerSignatureImage", blob(engineerSig), "eng.png");

    try {
      const { data } = await axios.post(
        `${API_URL}/api/add-engineerreport`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (data.success) {
        toast.success("Engineer Visit Report submitted!");
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
        Engineer Visit Report - {currentEquipmentName}
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
            <div className="col-md-4">
              <label className="form-label">Reference No.</label>
              <input
                className="form-control"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g., GUMPL/VR/001/24-25"
              />
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
              <label className="form-label">Customer Id</label>
              <input
                className="form-control"
                value={user}
                onChange={(e) => setCustomerName(e.target.value)}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Plant Capacity</label>
              <input
                className="form-control"
                value={plantCapacity}
                onChange={(e) => setPlantCapacity(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Technology</label>
              <input
                className="form-control"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="card mb-3 border">
          <div
            className="card-header text-white"
            style={{ backgroundColor: "#236a80" }}
          >
            Parameters During Visit
          </div>
          <div className="card-body row g-2">
            {Object.entries(parameters).map(([k, v]) => (
              <div className="col-md-4" key={k}>
                <label className="form-label">{k}</label>
                <input
                  className="form-control"
                  value={v}
                  onChange={(e) =>
                    setParameters({ ...parameters, [k]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Key Points */}
        <div className="card mb-3 border">
          <div
            className="card-header text-white"
            style={{ backgroundColor: "#236a80" }}
          >
            Key Points Checked
          </div>
          <div className="card-body row">
            {Object.keys(keyPoints).map((k) => (
              <div className="col-md-6 form-check" key={k}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={keyPoints[k]}
                  onChange={(e) =>
                    setKeyPoints({ ...keyPoints, [k]: e.target.checked })
                  }
                />
                <label className="form-check-label">{k}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Consumables */}
        <div className="card mb-3 border">
          <div
            className="card-header text-white"
            style={{ backgroundColor: "#236a80" }}
          >
            Consumables Stock
          </div>
          <div className="card-body row g-2">
            {Object.entries(consumables).map(([k, v]) => (
              <div className="col-md-4" key={k}>
                <label className="form-label">{k}</label>
                <input
                  className="form-control"
                  value={v}
                  onChange={(e) =>
                    setConsumables({ ...consumables, [k]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Remarks */}
        <div className="card mb-3 border">
          <div
            className="card-header text-white"
            style={{ backgroundColor: "#236a80" }}
          >
            Visit & Remarks
          </div>
          <div className="card-body">
            <label className="form-label">Details of Visit Done</label>
            <textarea
              className="form-control mb-3"
              rows="3"
              value={visitDetails}
              onChange={(e) => setVisitDetails(e.target.value)}
            />
            <label className="form-label">Engineer’s Remarks</label>
            <textarea
              className="form-control mb-3"
              rows="3"
              value={engineerRemarks}
              onChange={(e) => setEngineerRemarks(e.target.value)}
            />
            <label className="form-label">Customer Remarks</label>
            <textarea
              className="form-control"
              rows="3"
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
                {customerSig
                  ? "✓ Signature Captured"
                  : "Click to Draw Signature"}
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
                {engineerSig
                  ? "✓ Signature Captured"
                  : "Click to Draw Signature"}
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
            Submit Engineer Visit Report
          </button>
        </div>
      </form>

      {/* Signature Modals */}
      <SignatureModal
        show={showCustModal}
        onClose={() => setShowCustModal(false)}
        onSave={setCustomerSig}
      />
      <SignatureModal
        show={showEngModal}
        onClose={() => setShowEngModal(false)}
        onSave={setEngineerSig}
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
