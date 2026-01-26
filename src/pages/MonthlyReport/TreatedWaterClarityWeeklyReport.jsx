// FILE: src/Components/MonthlyMaintenance/TreatedWaterClarityWeeklyReport.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import { toast } from "react-toastify";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import genexlogo from "../../assests/images/logonewgenex.png";

const MySwal = withReactContent(Swal);

const daysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();

const weekBuckets = (year, monthIndex) => {
  const dim = daysInMonth(year, monthIndex);
  return [
    { week: 1, label: "1 - 7", start: 1, end: 7 },
    { week: 2, label: "8 - 14", start: 8, end: 14 },
    { week: 3, label: "15 - 21", start: 15, end: 21 },
    { week: 4, label: `22 - ${dim}`, start: 22, end: dim },
  ];
};

const getWeekDays = (year, monthIndex, weekNum) => {
  const buckets = weekBuckets(year, monthIndex);
  const b = buckets.find((x) => x.week === weekNum) || buckets[0];
  const days = [];
  for (let d = b.start; d <= b.end; d++) days.push(String(d).padStart(2, "0"));
  return days;
};

const formatDate = (dayStr, monthIndex, year) => {
  const d = String(dayStr).padStart(2, "0");
  const m = String(monthIndex + 1).padStart(2, "0");
  const y = String(year).slice(-2);
  return `${d}/${m}/${y}`;
};

const TreatedWaterClarityWeeklyReport = () => {
  const DEBUG = true;
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);
  const selectedUserId = useSelector((state) => state.selectedUser.userId);
  const { users: allUsers } = useSelector((state) => state.userLog);

  const currentUser = userData?.validUserOne;
  const isOperator = currentUser?.userType === "operator";
  const isAdmin =
    ["admin", "super_admin"].includes(currentUser?.userType) ||
    currentUser?.adminType === "EBHOOM";

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0–11
  const [week, setWeek] = useState(1); // 1–4

  const [entriesByDay, setEntriesByDay] = useState({});
  const [pendingFilesByDay, setPendingFilesByDay] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [viewPhotoUrl, setViewPhotoUrl] = useState(null);

  useEffect(() => {
    if (isAdmin || isOperator) dispatch(fetchUsers());
  }, [dispatch, isAdmin, isOperator]);

  const targetUser = useMemo(() => {
    if ((isAdmin || isOperator) && selectedUserId) {
      const foundUser = allUsers.find((u) => u.userName === selectedUserId);
      if (foundUser) {
        return {
          userName: foundUser.userName,
          siteName: foundUser.companyName || "Selected Site",
          userId: foundUser._id,
        };
      }
      return { userName: selectedUserId, siteName: "Loading Site...", userId: null };
    }
    return { userName: null, siteName: "N/A", userId: null };
  }, [isOperator, isAdmin, selectedUserId, allUsers]);

  const weekDays = useMemo(() => getWeekDays(year, month, week), [year, month, week]);

  // Setup blank entries for selected week
  useEffect(() => {
    const base = {};
    weekDays.forEach((d) => (base[d] = { photos: [], comment: "" }));
    setEntriesByDay(base);
    setPendingFilesByDay({});
  }, [weekDays]);

  // Fetch week report
  useEffect(() => {
    if (!targetUser.userId) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/api/treated-water-clarity-weekly/${targetUser.userId}/${year}/${month + 1}/${week}`
        );

        if (DEBUG) {
          console.groupCollapsed(`🟦 WEEKLY GET ✅ ${targetUser.userName} ${year}-${month + 1} week-${week}`);
          console.log("Raw:", data);
          console.groupEnd();
        }

        const map = {};
        weekDays.forEach((dayStr) => {
          const dNum = parseInt(dayStr, 10);
          const entry = data?.entries?.find((e) => e.date === dNum);
          map[dayStr] = {
            photos: entry?.photos || [],
            comment: entry?.comment || "",
          };
        });
        setEntriesByDay(map);
        setPendingFilesByDay({});
      } catch (err) {
        if (err.response?.status === 404) {
          const map = {};
          weekDays.forEach((dayStr) => (map[dayStr] = { photos: [], comment: "" }));
          setEntriesByDay(map);
          setPendingFilesByDay({});
        } else {
          console.error("Failed to fetch weekly report:", err);
          toast.error("Failed to fetch weekly treated water clarity report");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [targetUser.userId, year, month, week, weekDays]);

  const handlePhotoSelect = (dayStr, fileList) => {
    if (!fileList || !fileList.length) return;
    if (!targetUser.userId) return toast.error("Select a user/site first.");

    const filesArray = Array.from(fileList);
    const previewUrls = filesArray.map((file) => URL.createObjectURL(file));

    setEntriesByDay((prev) => {
      const existing = prev[dayStr] || { photos: [], comment: "" };
      return {
        ...prev,
        [dayStr]: {
          ...existing,
          photos: [...(existing.photos || []), ...previewUrls],
        },
      };
    });

    setPendingFilesByDay((prev) => {
      const existing = prev[dayStr] || [];
      return { ...prev, [dayStr]: [...existing, ...filesArray] };
    });
  };

  // ✅ Save weekly: uploads photos for pending days, AND also saves comment-only rows
  const handleSaveWeekly = async () => {
    if (!targetUser.userId) return toast.error("Cannot save. User data is incomplete.");

    const daysToSave = weekDays.filter((dayStr) => {
      const files = pendingFilesByDay[dayStr] || [];
      const comment = (entriesByDay[dayStr]?.comment || "").trim();
      return files.length > 0 || comment.length > 0; // comment-only allowed
    });

    if (!daysToSave.length) return toast.info("Nothing to save in this week.");

    setSaving(true);

    MySwal.fire({
      title: "Saving Weekly Report...",
      html: "Please wait while we upload/update.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      for (const dayStr of daysToSave) {
        const files = pendingFilesByDay[dayStr] || [];
        const comment = entriesByDay[dayStr]?.comment || "";

        const formData = new FormData();
        files.forEach((file) => formData.append("photos", file));
        formData.append("userName", targetUser.userName || "");
        formData.append("siteName", targetUser.siteName || "");
        formData.append("comment", comment);

        const dayNum = parseInt(dayStr, 10);

        const res = await axios.post(
          `${API_URL}/api/treated-water-clarity-weekly/upload/${targetUser.userId}/${year}/${month + 1}/${week}/${dayNum}`,
          formData
        );
console.log("weekly report res:",res.data);
        const updatedEntry = res.data.entry;

        setEntriesByDay((prev) => ({
          ...prev,
          [dayStr]: {
            photos: updatedEntry.photos || [],
            comment: updatedEntry.comment || "",
          },
        }));
      }

      setPendingFilesByDay({});

      MySwal.fire({
        icon: "success",
        title: "Weekly Report Saved",
        html: `<p><b>${targetUser.siteName}</b> (${targetUser.userName})</p><p>Week: ${week}</p>`,
        confirmButtonColor: "#236a80",
      });

      toast.success("Weekly treated water clarity saved");
    } catch (err) {
      console.error("Save weekly failed:", err);
      MySwal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Something went wrong while saving. Please try again.",
        confirmButtonColor: "#d33",
      });
      toast.error("Failed to save weekly treated water clarity");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- Signed URL helpers (same as your monthly, but weekly endpoint) ----------------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const fetchAsDataUrl = async (url, retries = 2) => {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, { mode: "cors", cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const dataUrl = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });

        const fmt =
          blob.type === "image/png" ? "PNG" :
          blob.type === "image/webp" ? "WEBP" : "JPEG";

        return { dataUrl, fmt };
      } catch (e) {
        lastErr = e;
        if (attempt < retries) await sleep(350 * (attempt + 1));
      }
    }
    throw lastErr;
  };

  const getSignedUrlMap = async (rows) => {
    const urls = [];
    rows.forEach((r) => (r.photos || []).forEach((u) => u && urls.push(u)));
    const unique = Array.from(new Set(urls)).filter((u) => u && !u.startsWith("blob:"));
    if (!unique.length) return {};

    const { data } = await axios.post(
      `${API_URL}/api/treated-water-clarity-weekly/signed-urls`,
      { urls: unique, expiresIn: 600 }
    );
    return data?.signedMap || {};
  };

  const getSignedUrlForOne = async (url) => {
    const { data } = await axios.post(
      `${API_URL}/api/treated-water-clarity-weekly/signed-urls`,
      { urls: [url], expiresIn: 600 }
    );
    return data?.signedMap?.[url] || null;
  };

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const buildExportRows = () =>
    weekDays.map((dayStr) => {
      const entry = entriesByDay[dayStr] || { photos: [], comment: "" };
      return {
        dateStr: formatDate(dayStr, month, year),
        photos: entry.photos || [],
        comment: entry.comment || "",
      };
    });

  const handleDownloadPDF = async () => {
    if (!targetUser.userId) return toast.error("Select a user/site first.");

    const rows = buildExportRows().filter((r) => (r.photos || []).length > 0);
    if (!rows.length) return toast.info("No photos to export in this week.");

    setDownloadingPdf(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      const logoImg = new Image();
      logoImg.src = genexlogo;
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });

      doc.setFillColor("#236a80");
      doc.rect(0, 0, pageWidth, 35, "F");
      doc.addImage(logoImg, "PNG", 15, 5, 25, 25);

      doc.setFont("helvetica", "bold");
      doc.setTextColor("#FFFFFF");
      doc.setFontSize(14);
      doc.text("Genex Utility Management Pvt Ltd", pageWidth / 2, 12, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Treated Water Clarity Weekly Report", pageWidth / 2, 31, { align: "center" });

      doc.setTextColor("#000000");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Site: ${targetUser.siteName}`, 15, 45);
      doc.text(`Month: ${monthNames[month]} ${year}`, 15, 52);
      doc.text(`Week: ${week}`, 15, 59);

      let signedMap = {};
      try {
        signedMap = await getSignedUrlMap(rows);
      } catch {
        signedMap = {};
      }

      const rowsWithImages = rows.map((r) => ({
        dateStr: r.dateStr,
        comment: r.comment || "",
        photoUrls: (r.photos || []).filter((u) => u && !u.startsWith("blob:")),
        _images: [],
        _rowHeight: 0,
      }));

      for (const row of rowsWithImages) {
        for (const originalUrl of row.photoUrls) {
          const directOrSigned = signedMap[originalUrl] || originalUrl;
          try {
            const { dataUrl, fmt } = await fetchAsDataUrl(directOrSigned, 2);
            if (fmt === "WEBP") continue;
            row._images.push({ originalUrl, dataUrl, fmt });
            continue;
          } catch (e1) {
            if (!signedMap[originalUrl]) {
              try {
                const freshSigned = await getSignedUrlForOne(originalUrl);
                if (freshSigned) {
                  signedMap[originalUrl] = freshSigned;
                  const { dataUrl, fmt } = await fetchAsDataUrl(freshSigned, 1);
                  if (fmt === "WEBP") continue;
                  row._images.push({ originalUrl, dataUrl, fmt });
                }
              } catch {}
            }
          }
        }
      }

      const PER_ROW = 3;
      const padding = 2;
      const gapX = 3;
      const gapY = 3;

      const dateColWidth = 30;
      const commentColWidth = 55;
      const photosColWidth = pageWidth - dateColWidth - commentColWidth - 20;

      const availWidth = photosColWidth - padding * 2;
      const imgSize = (availWidth - gapX * (PER_ROW - 1)) / PER_ROW;

      rowsWithImages.forEach((row) => {
        const count = row._images.length;
        if (!count) {
          row._rowHeight = 18;
          return;
        }
        const rowsNeeded = Math.ceil(count / PER_ROW);
        row._rowHeight = padding * 2 + rowsNeeded * imgSize + (rowsNeeded - 1) * gapY;
      });

      const tableBody = rowsWithImages.map((r) => ({
        date: r.dateStr,
        photos: " ",
        comment: r.comment || "",
        _images: r._images,
        _rowHeight: r._rowHeight,
      }));

      doc.autoTable({
        startY: 68,
        columns: [
          { header: "Date", dataKey: "date" },
          { header: "Photos", dataKey: "photos" },
          { header: "Comment", dataKey: "comment" },
        ],
        body: tableBody,
        theme: "grid",
        rowPageBreak: "avoid",
        headStyles: { fillColor: "#236a80", minCellHeight: 16, lineWidth: 0.3, lineColor: [120,120,120] },
        styles: { fontSize: 8, cellPadding: 3, lineWidth: 0.1, lineColor: [120,120,120], valign: "top" },
        columnStyles: {
          date: { cellWidth: dateColWidth },
          photos: { cellWidth: photosColWidth, cellPadding: 0 },
          comment: { cellWidth: commentColWidth },
        },
        didParseCell: (data) => {
          if (data.section !== "body") return;
          const rh = data.row?.raw?._rowHeight;
          if (rh) data.cell.styles.minCellHeight = rh;
          if (data.column.dataKey === "photos") data.cell.text = [" "];
        },
        didDrawCell: (data) => {
          if (data.section !== "body") return;
          if (data.column.dataKey !== "photos") return;

          const images = data.row?.raw?._images || [];
          if (!images.length) return;

          const startX = data.cell.x + padding;
          const startY = data.cell.y + padding;

          images.forEach(({ dataUrl, fmt }, i) => {
            const rr = Math.floor(i / PER_ROW);
            const cc = i % PER_ROW;

            const isLastRow = rr === Math.floor((images.length - 1) / PER_ROW);
            const countInThisRow = isLastRow ? images.length - rr * PER_ROW : PER_ROW;

            const rowWidth = countInThisRow * imgSize + (countInThisRow - 1) * gapX;
            const xOffset = (availWidth - rowWidth) / 2;

            const x = startX + xOffset + cc * (imgSize + gapX);
            const y = startY + rr * (imgSize + gapY);

            try {
              doc.addImage(dataUrl, fmt, x, y, imgSize, imgSize);
            } catch {
              try { doc.addImage(dataUrl, "JPEG", x, y, imgSize, imgSize); } catch {}
            }
          });
        },
      });

      doc.save(`${targetUser.siteName}_${monthNames[month]}_${year}_Week-${week}_TreatedWaterClarity.pdf`);
      toast.success("Weekly PDF generated!");
    } catch (err) {
      console.error("Weekly PDF generation failed:", err);
      toast.error("Failed to generate weekly PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDeletePhoto = async (dayStr, photoIndex, url) => {
    if (!targetUser.userId) return toast.error("Select a user/site first.");

    if (url.startsWith("blob:")) {
      setEntriesByDay((prev) => {
        const entry = prev[dayStr] || { photos: [], comment: "" };
        return {
          ...prev,
          [dayStr]: { ...entry, photos: entry.photos.filter((p, i) => i !== photoIndex) },
        };
      });

      setPendingFilesByDay((prev) => {
        const files = prev[dayStr] || [];
        return { ...prev, [dayStr]: files.filter((f, i) => i !== photoIndex) };
      });
      return;
    }

    if (!window.confirm("Delete this photo?")) return;

    try {
      const dayNum = parseInt(dayStr, 10);
      const res = await axios.delete(
        `${API_URL}/api/treated-water-clarity-weekly/photo/${targetUser.userId}/${year}/${month + 1}/${week}/${dayNum}`,
        { data: { photoUrl: url } }
      );

      const updatedEntry = res.data.entry;

      setEntriesByDay((prev) => ({
        ...prev,
        [dayStr]: {
          photos: updatedEntry?.photos || [],
          comment: updatedEntry?.comment || prev[dayStr]?.comment || "",
        },
      }));

      toast.success("Photo deleted");
    } catch (err) {
      console.error("Failed to delete weekly photo:", err);
      toast.error("Failed to delete photo");
    }
  };

  // ---- UI styles (same as your monthly) ----
  const headerStyle = {
    background: "linear-gradient(135deg, #236a80 0%, #236a80 100%)",
    color: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginTop: "2rem",
  };

  const cardStyle = {
    border: "3px dotted #3498db",
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  };

  const inputStyle = {
    border: "2px dotted #3498db",
    borderRadius: "6px",
    padding: "8px",
    fontSize: "0.9rem",
    color: "#2c3e50",
  };

  const buttonStyle = {
    padding: "10px 22px",
    borderRadius: "8px",
    border: "2px dotted #236a80",
    backgroundColor: "#236a80",
    color: "white",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginRight: "10px",
  };

  const downloadPdfButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#e74c3c",
    borderColor: "#e74c3c",
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };

  const overlayInnerStyle = {
    position: "relative",
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "8px",
    maxWidth: "90vw",
    maxHeight: "90vh",
  };

  const overlayCloseStyle = {
    position: "absolute",
    top: "6px",
    right: "8px",
    border: "none",
    background: "transparent",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#236a80",
  };

  return (
    <>
      <div className="d-flex">
        <div><DashboardSam /></div>

        <div style={{ marginLeft: "260px", width: "100%", minHeight: "100vh" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 5, marginLeft: "100px" }}>
            <Header />
          </div>

          <div className="container-fluid py-4 px-4">
            <div className="row" style={{ marginTop: "0", padding: "0 68px" }}>
              <div className="col-12">
                {!targetUser.userName ? (
                  <div style={cardStyle}>
                    <div style={{ textAlign: "center", padding: "40px", color: "#236a80" }}>
                      <h3>Please Select a User</h3>
                      <p>Use the dropdown in the header to select a user.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={headerStyle}>
                      <div className="d-flex flex-wrap justify-content-between align-items-center">
                        <div>
                          <h3 className="mb-2" style={{ fontWeight: "bold", fontSize: "1.8rem" }}>
                            TREATED WATER CLARITY (WEEKLY)
                          </h3>
                          <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
                            <strong>SITE:</strong> {targetUser.siteName || "N/A"}
                            <span className="mx-3">|</span>
                            <strong>MONTH:</strong> {monthNames[month]} {year}
                            <span className="mx-3">|</span>
                            <strong>WEEK:</strong> {week}
                          </div>
                        </div>

                        <div className="d-flex align-items-center mt-3 mt-md-0" style={{ gap: 8 }}>
                          <select
                            className="form-select"
                            value={week}
                            onChange={(e) => setWeek(Number(e.target.value))}
                            style={{ ...inputStyle, backgroundColor: "white", minWidth: "140px" }}
                          >
                            {weekBuckets(year, month).map((w) => (
                              <option key={w.week} value={w.week}>
                                Week {w.week} ({w.label})
                              </option>
                            ))}
                          </select>

                          <select
                            className="form-select"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            style={{ ...inputStyle, backgroundColor: "white", minWidth: "140px" }}
                          >
                            {monthNames.map((name, index) => (
                              <option key={index} value={index}>{name}</option>
                            ))}
                          </select>

                          <input
                            type="number"
                            className="form-control"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            style={{ ...inputStyle, width: "110px", backgroundColor: "white" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div
                        style={{
                          height: "550px",
                          overflowY: "auto",
                          border: "3px dotted #236a80",
                          borderRadius: "10px",
                          padding: "10px",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        {loading && (
                          <div className="text-center mb-2">
                            <span style={{ color: "#236a80" }}>Loading weekly clarity data...</span>
                          </div>
                        )}

                        <table className="table table-hover" style={{ marginBottom: 0 }}>
                          <thead
                            style={{
                              position: "sticky",
                              top: 0,
                              zIndex: 10,
                              background: "linear-gradient(135deg, #236a80 0%, #3498db 100%)",
                              color: "white",
                            }}
                          >
                            <tr>
                              <th style={{ padding: "15px 10px", minWidth: "120px" }}>DATE</th>
                              <th style={{ padding: "15px 10px", minWidth: "260px" }}>PHOTOS + COMMENT</th>
                            </tr>
                          </thead>

                          <tbody>
                            {weekDays.map((dayStr) => {
                              const entry = entriesByDay[dayStr] || { photos: [], comment: "" };
                              return (
                                <tr
                                  key={dayStr}
                                  style={{
                                    backgroundColor: parseInt(dayStr, 10) % 2 === 0 ? "#ffffff" : "#f8f9fa",
                                  }}
                                >
                                  <td style={{ padding: "12px 10px", fontWeight: "600", whiteSpace: "nowrap" }}>
                                    {formatDate(dayStr, month, year)}
                                  </td>

                                  <td style={{ padding: "8px 10px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {(entry.photos || []).map((url, idx) => (
                                          <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                                            <img
                                              src={url}
                                              alt={`Day ${dayStr} photo ${idx + 1}`}
                                              style={{
                                                width: "60px",
                                                height: "60px",
                                                objectFit: "cover",
                                                borderRadius: "4px",
                                                border: "1px solid #cbd8eb",
                                                cursor: "pointer",
                                              }}
                                              onClick={() => setViewPhotoUrl(url)}
                                            />

                                            {(isOperator || isAdmin) && (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeletePhoto(dayStr, idx, url);
                                                }}
                                                style={{
                                                  position: "absolute",
                                                  top: "-6px",
                                                  right: "-6px",
                                                  backgroundColor: "#e74c3c",
                                                  color: "#fff",
                                                  border: "none",
                                                  borderRadius: "50%",
                                                  width: "18px",
                                                  height: "18px",
                                                  fontSize: "11px",
                                                  lineHeight: "18px",
                                                  padding: 0,
                                                  cursor: "pointer",
                                                }}
                                              >
                                                ×
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>

                                      <textarea
                                        placeholder="Add a comment"
                                        value={entry.comment || ""}
                                        onChange={(e) =>
                                          setEntriesByDay((prev) => ({
                                            ...prev,
                                            [dayStr]: { ...prev[dayStr], comment: e.target.value },
                                          }))
                                        }
                                        style={{
                                          padding: "8px",
                                          fontSize: "0.9rem",
                                          borderRadius: "6px",
                                          border: "2px dotted #3498db",
                                          width: "100%",
                                          minHeight: "50px",
                                          resize: "none",
                                        }}
                                      />

                                      {(isOperator || isAdmin) && (
                                        <label
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: "5px 10px",
                                            borderRadius: "5px",
                                            border: "1px dashed #236a80",
                                            color: "#236a80",
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            background: "#f7fbff",
                                            width: "120px",
                                          }}
                                        >
                                          + Add Photos
                                          <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            multiple
                                            onChange={(e) => {
                                              handlePhotoSelect(dayStr, e.target.files);
                                              e.target.value = "";
                                            }}
                                            style={{ display: "none" }}
                                            disabled={loading || saving}
                                          />
                                        </label>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {(isOperator || isAdmin) && (
                        <div className="text-center mt-4" style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                          <button
                            style={buttonStyle}
                            onClick={handleSaveWeekly}
                            disabled={saving || loading || !targetUser.userId}
                          >
                            {saving ? "Saving..." : "💾 Save Week"}
                          </button>

                          <button
                            style={{
                              ...downloadPdfButtonStyle,
                              opacity: downloadingPdf ? 0.7 : 1,
                              cursor: downloadingPdf ? "not-allowed" : "pointer",
                            }}
                            onClick={handleDownloadPDF}
                            disabled={loading || saving || downloadingPdf || !targetUser.userId}
                          >
                            {downloadingPdf ? "⏳ Downloading..." : "📥 Download PDF"}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewPhotoUrl && (
        <div style={overlayStyle} onClick={() => setViewPhotoUrl(null)}>
          <div style={overlayInnerStyle} onClick={(e) => e.stopPropagation()}>
            <button style={overlayCloseStyle} onClick={() => setViewPhotoUrl(null)}>
              &times;
            </button>
            <img src={viewPhotoUrl} alt="Preview" style={{ maxWidth: "80vw", maxHeight: "80vh", display: "block" }} />
          </div>
        </div>
      )}
    </>
  );
};

export default TreatedWaterClarityWeeklyReport;
