import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "../../utils/apiConfig";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import './inventory.css';

/* ============== Lightweight Signature Pad (mouse + touch) ============== */
function SignaturePad({ value, onChange, height = 130 }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  // Initial paint + DPR scale
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const { width: cssW } = canvas.getBoundingClientRect();
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
    // background + border
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, cssW, height);
    ctx.strokeStyle = "#999";
    ctx.strokeRect(0.5, 0.5, cssW - 1, height - 1);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // preload previously drawn signature (if editing)
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, cssW, height);
      img.src = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches?.[0];
    const x = (t ? t.clientX : e.clientX) - rect.left;
    const y = (t ? t.clientY : e.clientY) - rect.top;
    return { x, y };
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

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onChange && onChange(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, rect.width, height);
    ctx.strokeStyle = "#999";
    ctx.strokeRect(0.5, 0.5, rect.width - 1, height - 1);
    ctx.strokeStyle = "#111";
    onChange && onChange(""); // cleared
  };

  return (
    <div>
      <div
        style={{
          width: "100%",
          border: "1px solid #c8d2dc",
          borderRadius: 6,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height,
            display: "block",
            cursor: "crosshair",
          }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm mt-2"
        onClick={clear}
      >
        Clear
      </button>
    </div>
  );
}

/* Convert dataURL → Blob for FormData */
const dataURLToBlob = (dataURL) => {
  if (!dataURL) return null;
  const [hdr, b64] = dataURL.split(",");
  const mime = /data:(.*?);base64/.exec(hdr)?.[1] || "image/png";
  const bin = atob(b64);
  const len = bin.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mime });
};

/* FY helpers for auto report number */
const fiscalYearRange = (iso) => {
  const d = new Date(iso);
  const y = d.getFullYear(),
    m = d.getMonth() + 1;
  const s = m >= 4 ? y : y - 1,
    e = s + 1;
  const short = (n) => String(n).slice(-2);
  return `${short(s)}-${short(e)}`;
};
const siteCode = (site) =>
  (site || "SITE")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6) || "SITE";
const localSeries = ({ site, isoDate }) => {
  const key = `sr-seq-${siteCode(site)}-${fiscalYearRange(isoDate)}`;
  const next = Number(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(next));
  return `${siteCode(site)}/SR/${fiscalYearRange(isoDate)}/${String(
    next
  ).padStart(3, "0")}`;
};
const nextReportNumber = async ({ apiBase, site, isoDate }) => {
  try {
    const fy = fiscalYearRange(isoDate);
    const { data } = await axios.get(
      `${apiBase}/api/service-reports/next-seq?fy=${fy}&site=${encodeURIComponent(
        site || ""
      )}`
    );
    if (data?.success && data?.reportNo) return data.reportNo;
  } catch {}
  return localSeries({ site, isoDate });
};

export default function ServiceReportForm({
  equipmentId,
  equipmentName,
  equipmentUserName,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { equipmentId: paramEquipmentId } = useParams();

  const currentEquipmentId = equipmentId || paramEquipmentId;
  const currentEquipmentName = equipmentName || location.state?.equipmentName;
  const initialCustomerUserName = equipmentUserName || location.state?.userName;

  const { validUserOne = {} } = useSelector((s) => s.user.userData || {});
  const role = validUserOne.isTechnician
    ? "Technician"
    : validUserOne.isTerritorialManager
    ? "TerritorialManager"
    : null;

  const submitter = role
    ? {
        name: validUserOne.fname,
        email: validUserOne.email,
        id: validUserOne._id,
        role,
      }
    : null;
  const technician = submitter
    ? { name: submitter.name, email: submitter.email }
    : null;

  // core fields
  const [customerNameInput, setCustomerNameInput] = useState(
    initialCustomerUserName || ""
  );
  const [equipmentDetailsName, setEquipmentDetailsName] = useState("");
  const [equipmentDetailsCapacity, setEquipmentDetailsCapacity] = useState("");
  const [equipmentDetailsMake, setEquipmentDetailsMake] = useState("");
  const [equipmentcustomerUserName, setequipmentcustomerUserName] =
    useState("");
  const [equipmentDescription, setEquipmentDescription] = useState("");
  const [detailsOfServiceDone, setDetailsOfServiceDone] = useState("");
  const [suggestionsFromEngineer, setSuggestionsFromEngineer] = useState("");
  const [customerRemarks, setCustomerRemarks] = useState("");
  const [selectedClassificationCode, setSelectedClassificationCode] =
    useState("");

  // signatures: now MANUAL ONLY (canvas → PNG)
  const [customerSignatureDataUrl, setCustomerSignatureDataUrl] = useState("");
  const [technicianSignatureDataUrl, setTechnicianSignatureDataUrl] =
    useState("");

  // new states for signatures
  const [customerSigName, setCustomerSigName] = useState("");
  const [customerSigDesignation, setCustomerSigDesignation] = useState("");
  const [technicianSigName, setTechnicianSigName] = useState("");
  const [technicianSigDesignation, setTechnicianSigDesignation] = useState("");

  // media
  const [photos, setPhotos] = useState([]);
  const [issueReported, setIssueReported] = useState("");
  const [issuePhotos, setIssuePhotos] = useState([]);
  const [beforeItems, setBeforeItems] = useState([]);
  const [afterItems, setAfterItems] = useState([]);
  const [incidentDateMode, setIncidentDateMode] = useState("date"); // "date" | "manual"

  // header
  const [headerSite, setHeaderSite] = useState("");
  const [headerDate, setHeaderDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [headerReportNo, setHeaderReportNo] = useState("");
  const [headerPlantCapacity, setHeaderPlantCapacity] = useState("");
  const [headerReference, setHeaderReference] = useState("");
  const [headerIncidentDate, setHeaderIncidentDate] = useState("");
  const [headerTypeOfService, setHeaderTypeOfService] = useState(
    "Operation and Maintenance"
  );
  const [headerPreparedBy, setHeaderPreparedBy] = useState("");

  useEffect(() => {
    if (currentEquipmentName) setEquipmentDetailsName(currentEquipmentName);
    if (initialCustomerUserName) setCustomerNameInput(initialCustomerUserName);

    const run = async () => {
      if (!currentEquipmentId) return;
      try {
        const res = await axios.get(
          `${API_URL}/api/equiment/${currentEquipmentId}`
        );
        const data = res.data.equipment;
        if (data) {
          setEquipmentDetailsCapacity((p) => p || data.capacity || "");
          setEquipmentDetailsMake((p) => p || data.make || "");
          setequipmentcustomerUserName((p) => p || data.userName || "");
          if (!customerNameInput && data.userName)
            setCustomerNameInput(data.userName);

          setHeaderSite((p) => p || data.site || data.userName || "");
          setHeaderPlantCapacity((p) => p || data.capacity || "");
          setHeaderPreparedBy((p) => p || submitter?.name || "");
        }
      } catch (e) {
        console.error("equipment fetch error", e);
      }

      // load current month report (for edit)
      const d = new Date(),
        y = d.getFullYear(),
        m = d.getMonth() + 1;
      try {
        const resp = await axios.get(
          `${API_URL}/api/equiment/${currentEquipmentId}?year=${y}&month=${m}`
        );
        const r = resp.data.reports?.[0];
        if (r) {
          setEquipmentDetailsName(
            r.equipmentDetails?.name || currentEquipmentName
          );
          setEquipmentDetailsCapacity(
            (p) => p || r.equipmentDetails?.capacity || ""
          );
          setEquipmentDetailsMake((p) => p || r.equipmentDetails?.make || "");
          setEquipmentDescription(r.equipmentDetails?.description || "");
          setDetailsOfServiceDone(r.detailsOfServiceDone || "");
          setSuggestionsFromEngineer(r.suggestionsFromEngineer || "");
          setCustomerRemarks(r.customerRemarks || "");
          setSelectedClassificationCode(r.classificationCode || "");

          const u = r.userName || initialCustomerUserName || "";
          setCustomerNameInput(u);
          setequipmentcustomerUserName(u);

          setPhotos(r.photos ? r.photos.map((url) => ({ url })) : []);
          setIssueReported(r.issueReported || "");
          setIssuePhotos(
            Array.isArray(r.issuePhotos)
              ? r.issuePhotos.map((url) => ({ url }))
              : []
          );
          setBeforeItems(
            Array.isArray(r.beforeImages)
              ? r.beforeImages.map((url, i) => ({
                  url,
                  caption: r.beforeCaptions?.[i] || "",
                }))
              : []
          );
          setAfterItems(
            Array.isArray(r.afterImages)
              ? r.afterImages.map((url, i) => ({
                  url,
                  caption: r.afterCaptions?.[i] || "",
                }))
              : []
          );

          // if backend had stored signature image URLs, you can preload them here by fetching the image → dataURL if needed.
          // (Keeping simple: start blank for fresh signatures.)

          const h = r.header || {};
          setHeaderSite(h.site || "");
          setHeaderDate(
            h.date ? new Date(h.date).toISOString().slice(0, 10) : headerDate
          );
          setHeaderReportNo(h.reportNo || "");
          setHeaderPlantCapacity(
            h.plantCapacity || h.areaOfInspection || headerPlantCapacity
          );
          setHeaderReference(h.reference || "");
          setHeaderIncidentDate(h.incidentDate || "");
          setHeaderTypeOfService(h.typeOfService || headerTypeOfService);
          setHeaderPreparedBy(h.preparedBy || headerPreparedBy);
        }
      } catch (e) {
        if (!(e.response && e.response.status === 404)) {
          console.error("report fetch error", e);
          toast.error("Error loading previous service report data.");
        }
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEquipmentId]);

  // auto-generate report no.
  useEffect(() => {
    (async () => {
      if (!headerSite || !headerDate) return;
      if (headerReportNo?.trim()) return;
      setHeaderReportNo(
        await nextReportNumber({
          apiBase: API_URL,
          site: headerSite,
          isoDate: headerDate,
        })
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerSite, headerDate]);

  const handlePhotoChange = (i, f) =>
    setPhotos((p) => Object.assign([...p], { [i]: f }));
  const addPhotoField = () => setPhotos((p) => [...p, null]);
  const removePhotoField = (i) =>
    setPhotos((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!technician) return toast.error("Submitter missing. Please log in.");

    const userNameToSubmit =
      equipmentcustomerUserName || customerNameInput || "";
    if (!currentEquipmentId || !currentEquipmentName || !userNameToSubmit)
      return toast.error("Equipment details or Customer Name missing.");
    if (!detailsOfServiceDone)
      return toast.error("Enter details of service done.");
    if (!selectedClassificationCode)
      return toast.error("Select a Classification Code.");

    // NEW: Require hand-written signatures
    if (!customerSignatureDataUrl)
      return toast.error("Please draw the customer's signature.");
    if (!technicianSignatureDataUrl)
      return toast.error("Please draw the engineer/technician signature.");

    const fd = new FormData();
    fd.append("equipmentId", currentEquipmentId);
    fd.append("equipmentName", currentEquipmentName);
    fd.append("userName", userNameToSubmit);

    // legacy technician fields
    fd.append("technicianName", technician.name);
    fd.append("technicianEmail", technician.email);

    // submitter
    fd.append("submittedByRole", submitter.role);
    fd.append("submittedByName", submitter.name);
    fd.append("submittedByEmail", submitter.email);
    if (submitter.id) fd.append("submittedById", submitter.id);

    // equipment details
    fd.append(
      "equipmentDetails",
      JSON.stringify({
        name: equipmentDetailsName,
        capacity: equipmentDetailsCapacity,
        make: equipmentDetailsMake,
        description: equipmentDescription,
      })
    );

    fd.append("detailsOfServiceDone", detailsOfServiceDone);
    fd.append("suggestionsFromEngineer", suggestionsFromEngineer);
    fd.append("customerRemarks", customerRemarks);
    fd.append("classificationCode", selectedClassificationCode);

    //after signature
    fd.append("customerSigName", customerSigName);
    fd.append("customerSigDesignation", customerSigDesignation);
    fd.append("technicianSigName", technicianSigName);
    fd.append("technicianSigDesignation", technicianSigDesignation);

    // header (Area of Inspection → Plant Capacity)
    fd.append("headerSite", headerSite);
    fd.append("headerDate", headerDate);
    fd.append(
      "headerReportNo",
      headerReportNo ||
        (await nextReportNumber({
          apiBase: API_URL,
          site: headerSite,
          isoDate: headerDate,
        }))
    );
    fd.append("headerPlantCapacity", headerPlantCapacity);
    fd.append("headerReference", headerReference);
    fd.append("headerIncidentDate", headerIncidentDate);
    fd.append("headerTypeOfService", headerTypeOfService);
    fd.append("headerPreparedBy", headerPreparedBy);

    // photos
    photos.forEach((it) => it instanceof File && fd.append("photos", it));

    // Issue + photos
    fd.append("issueReported", issueReported || "");
    issuePhotos.forEach(
      (f) => f instanceof File && fd.append("issuePhotos", f)
    );

    // Before/After with captions
    beforeItems.forEach((it) => {
      if (it.file instanceof File) fd.append("beforeImages", it.file);
      fd.append("beforeCaptions[]", it.caption || "");
    });
    afterItems.forEach((it) => {
      if (it.file instanceof File) fd.append("afterImages", it.file);
      fd.append("afterCaptions[]", it.caption || "");
    });

    // SIGNATURE IMAGES (PNG blobs)
    const custSigBlob = dataURLToBlob(customerSignatureDataUrl);
    const techSigBlob = dataURLToBlob(technicianSignatureDataUrl);
    if (custSigBlob)
      fd.append(
        "customerSignatureImage",
        custSigBlob,
        "customer-signature.png"
      );
    if (techSigBlob)
      fd.append(
        "technicianSignatureImage",
        techSigBlob,
        "technician-signature.png"
      );

    try {
      const resp = await axios.post(`${API_URL}/api/add-servicereport`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (resp.data.success) {
        toast.success("Service Report submitted successfully!");
        navigate("/services?tab=equipmentList");
      } else {
        toast.error(resp.data.message || "Failed to submit report.");
      }
    } catch (err) {
      console.error("submit error", err.response?.data || err.message);
      toast.error("Server error submitting report. Please try again.");
    }
  };

  const classificationCodes = [
    {
      code: "C1",
      desc: "Not in Working Condition/Replacement With New Equipment Required. Immediate action required.",
    },
    {
      code: "C2",
      desc: "Not in Working Condition Equipment/Part Replacement Required. Immediate action required.",
    },
    {
      code: "C3",
      desc: "Not In Working Condition Service Required. Immediate action required.",
    },
    {
      code: "C4",
      desc: "In Working Condition but Service Required. Immediate action required.",
    },
    { code: "C5", desc: "Minor service required and it is completed." },
  ];

  return (
    <div className="container py-4">
      <h3 className="mb-4">Service Report - {currentEquipmentName}</h3>

      <div className="row">
        <div className="col-md-6 col-12 mb-3">
          <label className="form-label">
            <strong>Customer:</strong>
          </label>
          <input
            type="text"
            className="form-control"
            value={equipmentcustomerUserName}
            readOnly
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">
            <strong>Submitted By:</strong>
          </label>
          <div className="p-2 shadow bg-light rounded">
            {submitter ? (
              <div className="text-success">
                {submitter.name} ({submitter.role}) (
                <a href={`mailto:${submitter.email}`}>{submitter.email}</a>)
              </div>
            ) : (
              <div className="text-danger">
                Submitter data missing. Please log in.
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* HEADER */}
        <div className="card mb-3 border">
          <div className="card-header text-white">Report Header (Metadata)</div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-md-4">
                <label className="form-label">Site</label>
                <input
                  className="form-control"
                  value={headerSite}
                  onChange={(e) => {
                    setHeaderSite(e.target.value);
                    setHeaderReportNo("");
                  }}
                  placeholder="PTP - VALDEL"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={headerDate}
                  onChange={(e) => {
                    setHeaderDate(e.target.value);
                    setHeaderReportNo("");
                  }}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Report No.</label>
                <div className="d-flex gap-2">
                  <input
                    className="form-control"
                    value={headerReportNo}
                    onChange={(e) => setHeaderReportNo(e.target.value)}
                    placeholder="AUTO"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={async () =>
                      setHeaderReportNo(
                        await nextReportNumber({
                          apiBase: API_URL,
                          site: headerSite,
                          isoDate: headerDate,
                        })
                      )
                    }
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label">Plant Capacity</label>
                <input
                  className="form-control"
                  value={headerPlantCapacity}
                  onChange={(e) => setHeaderPlantCapacity(e.target.value)}
                  placeholder="192 KLD STP"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Reference</label>
                <input
                  className="form-control"
                  value={headerReference}
                  onChange={(e) => setHeaderReference(e.target.value)}
                  placeholder="Email complaint"
                />
              </div>
              {/* <div className="col-md-4">
                <label className="form-label">Incident Date</label>
                <input
                  className="form-control"
                  value={headerIncidentDate}
                  onChange={(e) => setHeaderIncidentDate(e.target.value)}
                  placeholder="Before Takeover"
                />
              </div> */}
              <div className="col-md-4">
                <label className="form-label">Incident Date</label>
                <select
                  className="form-select mb-2"
                  value={incidentDateMode}
                  onChange={(e) => setIncidentDateMode(e.target.value)}
                >
                  <option value="date">Pick a Date</option>
                  <option value="manual">Manual Entry</option>
                </select>

                {incidentDateMode === "date" ? (
                  <input
                    type="date"
                    className="form-control"
                    value={headerIncidentDate}
                    onChange={(e) => setHeaderIncidentDate(e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter incident date manually"
                    value={headerIncidentDate}
                    onChange={(e) => setHeaderIncidentDate(e.target.value)}
                  />
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label">Type of Service</label>
                <input
                  className="form-control"
                  value={headerTypeOfService}
                  onChange={(e) => setHeaderTypeOfService(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Prepared by</label>
                <input
                  className="form-control"
                  value={headerPreparedBy}
                  onChange={(e) => setHeaderPreparedBy(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Details */}
        <div className="card mb-3 border">
          <div className="card-header text-white">Equipment Details</div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label">Name:</label>
                <input
                  className="form-control"
                  value={equipmentDetailsName}
                  onChange={(e) => setEquipmentDetailsName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Capacity:</label>
                <input
                  className="form-control"
                  value={equipmentDetailsCapacity}
                  onChange={(e) => setEquipmentDetailsCapacity(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Make:</label>
                <input
                  className="form-control"
                  value={equipmentDetailsMake}
                  onChange={(e) => setEquipmentDetailsMake(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Description:</label>
                <input
                  className="form-control"
                  value={equipmentDescription}
                  onChange={(e) => setEquipmentDescription(e.target.value)}
                  placeholder="e.g., Diffuser Pipe line work"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Issue Reported */}
        <div className="card mb-3 border">
          <div className="card-header text-white">Issue Reported</div>
          <div className="card-body">
            <textarea
              className="form-control mb-3"
              rows="3"
              value={issueReported}
              onChange={(e) => setIssueReported(e.target.value)}
              placeholder="Short description of the issue / complaint"
            />
            <label className="form-label">
              <strong>Issue Photos:</strong>
            </label>
            {issuePhotos.map((item, idx) => (
              <div key={idx} className="mb-2 d-flex align-items-center">
                {item?.url && (
                  <img
                    src={item.url}
                    alt=""
                    style={{ width: 140, borderRadius: 6, marginRight: 8 }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => {
                    const next = [...issuePhotos];
                    next[idx] = e.target.files[0] || null;
                    setIssuePhotos(next);
                  }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm ms-2"
                  onClick={() =>
                    setIssuePhotos((p) => p.filter((_, i) => i !== idx))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-btn btn-outline-primary btn-sm"
              onClick={() => setIssuePhotos((p) => [...p, null])}
            >
              + Add Issue Photo
            </button>
          </div>
        </div>

        {/* Classification */}
        <div className="card mb-3 border">
          <div className="card-header text-white">
            Classification Code Selection
          </div>
          <div className="card-body">
            <div className="row">
              {classificationCodes.map((it) => (
                <div className="col-md-6 mb-2" key={it.code}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="classificationCode"
                      id={`code-${it.code}`}
                      value={it.code}
                      checked={selectedClassificationCode === it.code}
                      onChange={(e) =>
                        setSelectedClassificationCode(e.target.value)
                      }
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`code-${it.code}`}
                    >
                      <strong>{it.code}:</strong> {it.desc}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details of Service + Before/After */}
        <div className="card mb-3 border">
          <div className="card-header text-white">Details of Service Done</div>
          <div className="card-body">
            <textarea
              className="form-control mb-3"
              rows="4"
              value={detailsOfServiceDone}
              onChange={(e) => setDetailsOfServiceDone(e.target.value)}
            />

            <h6 className="mt-2 mb-2">Before (photos + short name)</h6>
            {beforeItems.map((it, idx) => (
              <div key={idx} className="mb-2">
                <div className="d-flex align-items-center">
                  {it?.url && (
                    <img
                      src={it.url}
                      alt=""
                      style={{ width: 180, borderRadius: 6, marginRight: 8 }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => {
                      const next = [...beforeItems];
                      next[idx] = {
                        ...(next[idx] || {}),
                        file: e.target.files[0] || null,
                      };
                      setBeforeItems(next);
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm ms-2"
                    onClick={() =>
                      setBeforeItems((p) => p.filter((_, i) => i !== idx))
                    }
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  className="form-control mt-1"
                  placeholder="Image name / short description"
                  value={it?.caption || ""}
                  onChange={(e) => {
                    const next = [...beforeItems];
                    next[idx] = {
                      ...(next[idx] || {}),
                      caption: e.target.value,
                    };
                    setBeforeItems(next);
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              className="add-btn btn-outline-primary btn-sm"
              onClick={() =>
                setBeforeItems((p) => [...p, { file: null, caption: "" }])
              }
            >
              + Add Before Photo
            </button>

            <h6 className="mt-4 mb-2">After (photos + short name)</h6>
            {afterItems.map((it, idx) => (
              <div key={idx} className="mb-2">
                <div className="d-flex align-items-center">
                  {it?.url && (
                    <img
                      src={it.url}
                      alt=""
                      style={{ width: 180, borderRadius: 6, marginRight: 8 }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => {
                      const next = [...afterItems];
                      next[idx] = {
                        ...(next[idx] || {}),
                        file: e.target.files[0] || null,
                      };
                      setAfterItems(next);
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm ms-2"
                    onClick={() =>
                      setAfterItems((p) => p.filter((_, i) => i !== idx))
                    }
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  className="form-control mt-1"
                  placeholder="Image name / short description"
                  value={it?.caption || ""}
                  onChange={(e) => {
                    const next = [...afterItems];
                    next[idx] = {
                      ...(next[idx] || {}),
                      caption: e.target.value,
                    };
                    setAfterItems(next);
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              className="add-btn btn-outline-primary btn-sm"
              onClick={() =>
                setAfterItems((p) => [...p, { file: null, caption: "" }])
              }
            >
              + Add After Photo
            </button>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-3">
          <label className="form-label">
            Recommendations from Engineer/Technician:
          </label>
          <textarea
            className="form-control"
            rows="3"
            value={suggestionsFromEngineer}
            onChange={(e) => setSuggestionsFromEngineer(e.target.value)}
          />
        </div>

        {/* Customer Remarks */}
        <div className="mb-3">
          <label className="form-label">Customer Remarks:</label>
          <textarea
            className="form-control"
            rows="3"
            value={customerRemarks}
            onChange={(e) => setCustomerRemarks(e.target.value)}
          />
        </div>

        {/* SIGNATURES — MANUAL ONLY */}
        <div className="mb-3">
          <label className="form-label">
            <strong>Customer Signature (draw below):</strong>
          </label>
          <SignaturePad
            value={customerSignatureDataUrl}
            onChange={setCustomerSignatureDataUrl}
          />
          <input
            type="text"
            className="form-control mt-2"
            placeholder="Customer Name"
            value={customerSigName}
            onChange={(e) => setCustomerSigName(e.target.value)}
          />
          <input
            type="text"
            className="form-control mt-2"
            placeholder="Customer Designation"
            value={customerSigDesignation}
            onChange={(e) => setCustomerSigDesignation(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="form-label">
            <strong>Engineer/Technician Signature (draw below):</strong>
          </label>
          <SignaturePad
            value={technicianSignatureDataUrl}
            onChange={setTechnicianSignatureDataUrl}
          />
          <input
            type="text"
            className="form-control mt-2"
            placeholder="Engineer/Technician Name"
            value={headerPreparedBy}
            onChange={(e) => setTechnicianSigName(e.target.value)}
          />
          <input
            type="text"
            className="form-control mt-2"
            placeholder="Engineer/Technician Designation"
            value={technicianSigDesignation}
            onChange={(e) => setTechnicianSigDesignation(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/services?tab=equipmentList")}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Submit Service Report
          </button>
        </div>
      </form>
    </div>
  );
}
