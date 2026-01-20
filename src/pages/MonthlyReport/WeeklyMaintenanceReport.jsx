// FILE: src/Components/WeeklyMaintenance/WeeklyMaintenanceReport.jsx

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
import genexlogo from "../../assests/images/logonewgenex.png";
import imageCompression from "browser-image-compression";

const MySwal = withReactContent(Swal);

// Ensure all photos are in { url, type } format
const normalizePhotos = (photos = []) =>
  (photos || []).map((p) =>
    typeof p === "string"
      ? { url: p, type: "GENERAL" }
      : { url: p.url, type: p.type || "GENERAL" }
  );

// ---- Date helpers ----
const pad2 = (n) => String(n).padStart(2, "0");

// yyyy-mm-dd in local time
const toISODateLocal = (d) => {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
};

const fromISODateLocal = (iso) => {
  // iso: yyyy-mm-dd
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

// Monday start
const getWeekStartMonday = (dateObj) => {
  const d = new Date(dateObj);
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diffToMonday = (day === 0 ? -6 : 1) - day; // move to Monday
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (dateObj, days) => {
  const d = new Date(dateObj);
  d.setDate(d.getDate() + days);
  return d;
};

const formatHumanDate = (iso) => {
  const d = fromISODateLocal(iso);
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WeeklyMaintenanceReport = () => {
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);
  const selectedUserId = useSelector((state) => state.selectedUser.userId);
  const { users: allUsers } = useSelector((state) => state.userLog);

  const currentUser = userData?.validUserOne;
  const isOperator = currentUser?.userType === "operator";
  const isAdmin =
    ["admin", "super_admin"].includes(currentUser?.userType) ||
    currentUser?.adminType === "EBHOOM";

  // default week start = current week's Monday
  const [weekStartISO, setWeekStartISO] = useState(() =>
    toISODateLocal(getWeekStartMonday(new Date()))
  );

  // entriesByDateISO["yyyy-mm-dd"] = { comment, photos:[{url,type}] }
  const [entriesByDate, setEntriesByDate] = useState({});
  // pendingFilesByDate["yyyy-mm-dd"] = [{url,type,_file}]
  const [pendingFilesByDate, setPendingFilesByDate] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // --- Load users ---
  useEffect(() => {
    if (isAdmin || isOperator) dispatch(fetchUsers());
  }, [dispatch, isAdmin, isOperator]);

  // --- Resolve selected site/user ---
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
      return {
        userName: selectedUserId,
        siteName: "Loading Site...",
        userId: null,
      };
    }
    return { userName: null, siteName: "N/A", userId: null };
  }, [isOperator, isAdmin, selectedUserId, allUsers]);

  // --- build 7 days list ---
  const weekDaysISO = useMemo(() => {
    const start = fromISODateLocal(weekStartISO);
    return Array.from({ length: 7 }, (_, i) =>
      toISODateLocal(addDays(start, i))
    );
  }, [weekStartISO]);

  const weekLabel = useMemo(() => {
    const start = fromISODateLocal(weekStartISO);
    const end = addDays(start, 6);
    return `${pad2(start.getDate())} ${monthNames[start.getMonth()]} ${start.getFullYear()} - ${pad2(end.getDate())} ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
  }, [weekStartISO]);

  // --- init blank entries for the week ---
  useEffect(() => {
    const base = {};
    weekDaysISO.forEach((iso) => (base[iso] = { comment: "", photos: [] }));
    setEntriesByDate(base);
    setPendingFilesByDate({});
  }, [weekDaysISO]);

  // --- Fetch report for that week ---
  useEffect(() => {
    if (!targetUser.userId) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/api/weekly-maintenance/${targetUser.userId}/${weekStartISO}`
        );

        const map = {};
        weekDaysISO.forEach((iso) => {
          const entry = data?.entries?.find((e) => e.date === iso);
          map[iso] = {
            comment: entry?.comment || "",
            photos: normalizePhotos(entry?.photos || []),
          };
        });

        setEntriesByDate(map);
        setPendingFilesByDate({});
      } catch (err) {
        console.error("Failed to fetch weekly report:", err);
        toast.error("Failed to fetch weekly report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [targetUser.userId, weekStartISO, weekDaysISO]);

  // --- handlers ---
  const handleCommentChange = (dateISO, value) => {
    setEntriesByDate((prev) => ({
      ...prev,
      [dateISO]: {
        comment: value,
        photos: prev[dateISO]?.photos || [],
      },
    }));
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  const handlePhotoSelect = async (dateISO, fileList, photoType) => {
    if (!fileList?.length) return;

    const compressedFiles = [];
    for (const file of Array.from(fileList)) {
      const compressed = await compressImage(file);
      compressedFiles.push(compressed);
    }

    const previewEntries = compressedFiles.map((file) => {
      const url = URL.createObjectURL(file);
      return { url, type: photoType, _file: file };
    });

    // add previews in table
    setEntriesByDate((prev) => {
      const existing = prev[dateISO] || { comment: "", photos: [] };
      return {
        ...prev,
        [dateISO]: {
          comment: existing.comment || "",
          photos: [
            ...(existing.photos || []),
            ...previewEntries.map((p) => ({ url: p.url, type: p.type })),
          ],
        },
      };
    });

    // pending upload
    setPendingFilesByDate((prev) => {
      const existing = prev[dateISO] || [];
      return { ...prev, [dateISO]: [...existing, ...previewEntries] };
    });
  };

  const handlePhotoPreview = (url, dateISO, idx) => {
    MySwal.fire({
      title: `Photo - ${formatHumanDate(dateISO)}`,
      imageUrl: url,
      imageAlt: `Weekly maintenance photo ${idx + 1}`,
      showCloseButton: true,
      showConfirmButton: false,
      width: "80%",
      background: "#f8f9fa",
    });
  };

  // export rows (skip blob previews)
  const buildExportRows = () =>
    weekDaysISO
      .map((dateISO) => {
        const entry = entriesByDate[dateISO] || { comment: "", photos: [] };
        const comment = entry.comment?.trim() || "";
        const allPhotos = normalizePhotos(entry.photos || []);
        const realPhotos = allPhotos.filter(
          (p) => p.url && !p.url.startsWith("blob:")
        );
        const hasComment = comment !== "";
        const hasPhotos = realPhotos.length > 0;
        if (!hasComment && !hasPhotos) return null;
        return {
          dateISO,
          dateStr: formatHumanDate(dateISO),
          comment,
          photos: realPhotos,
        };
      })
      .filter(Boolean);

  // ---- signed url helpers (same pattern) ----
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
          blob.type === "image/png"
            ? "PNG"
            : blob.type === "image/webp"
              ? "WEBP"
              : "JPEG";

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
    rows.forEach((r) =>
      (r.photos || []).forEach((p) => p?.url && urls.push(p.url))
    );
    const unique = Array.from(new Set(urls));
    if (!unique.length) return {};
    const { data } = await axios.post(
      `${API_URL}/api/weekly-maintenance/signed-urls`,
      {
        urls: unique,
        expiresIn: 600,
      }
    );
    return data?.signedMap || {};
  };

  const getSignedUrlForOne = async (url) => {
    const { data } = await axios.post(
      `${API_URL}/api/weekly-maintenance/signed-urls`,
      {
        urls: [url],
        expiresIn: 600,
      }
    );
    return data?.signedMap?.[url] || null;
  };

  // ✅ Save comments + upload photos
  const handleSaveCommentsAndPhotos = async () => {
    if (!targetUser.userId) {
      toast.error("Cannot save. User data is incomplete.");
      return;
    }

    setSaving(true);

    MySwal.fire({
      title: "Saving Weekly Report...",
      html: "Please wait while we save comments and upload photos.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const exportRows = buildExportRows();

      const entriesToSave = exportRows.map((row) => ({
        date: row.dateISO,
        comment: row.comment,
      }));

      const pendingDays = Object.entries(pendingFilesByDate).filter(
        ([, fileEntries]) =>
          Array.isArray(fileEntries) && fileEntries.length > 0
      );

      if (entriesToSave.length === 0 && pendingDays.length === 0) {
        MySwal.close();
        toast.info("No comments or photos to save for this week.");
        setSaving(false);
        return;
      }

      // 1) Save comments
      if (entriesToSave.length > 0) {
        await axios.post(`${API_URL}/api/weekly-maintenance`, {
          userId: targetUser.userId,
          weekStart: weekStartISO,
          entries: entriesToSave,
        });
      }

      // 2) Upload photos per date, grouped by type
      for (const [dateISO, fileEntries] of pendingDays) {
        const formData = new FormData();
        fileEntries.forEach((fe) => formData.append("photos", fe._file));

        formData.append("userName", targetUser.userName || "");
        formData.append("siteName", targetUser.siteName || "");

        // Optional: keep as GENERAL for backend consistency
        formData.append("photoType", "GENERAL");

        const res = await axios.post(
          `${API_URL}/api/weekly-maintenance/upload/${targetUser.userId}/${weekStartISO}/${dateISO}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const updatedEntry = res.data.entry;

        setEntriesByDate((prev) => ({
          ...prev,
          [dateISO]: {
            comment: prev[dateISO]?.comment || updatedEntry?.comment || "",
            photos: normalizePhotos(updatedEntry?.photos || []),
          },
        }));
      }

      setPendingFilesByDate({});

      MySwal.fire({
        icon: "success",
        title: "Weekly Report Saved",
        html: `<p><b>${targetUser.siteName}</b> (${targetUser.userName})</p>
               <p>Week: <b>${weekLabel}</b></p>`,
        confirmButtonColor: "#236a80",
      });

      toast.success("Weekly maintenance report saved");
    } catch (err) {
      console.error("Failed to save weekly report:", err);
      MySwal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Something went wrong while saving the weekly report.",
        confirmButtonColor: "#d33",
      });
      toast.error("Failed to save weekly report");
    } finally {
      setSaving(false);
    }
  };

  // --- CSV ---
  const handleDownloadCSV = () => {
    if (!targetUser.userId) {
      toast.error("Select a user/site first.");
      return;
    }

    const rows = buildExportRows();
    if (!rows.length) {
      toast.info("No data to export for this week.");
      return;
    }

    let csv = "Date,Photo URLs,Comment\n";
    rows.forEach(({ dateStr, photos, comment }) => {
      const photoStr = (photos || []).map((p) => p.url).join(" | ");
      const safePhotos = `"${photoStr.replace(/"/g, '""')}"`;
      const safeComment = `"${(comment || "").replace(/"/g, '""')}"`;
      csv += `${dateStr},${safePhotos},${safeComment}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetUser.siteName}_${weekStartISO}_Weekly_Maintenance.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("CSV downloaded!");
  };

  // --- PDF (photo annexure like monthly) ---
  const handleDownloadPDF = async () => {
    if (!targetUser.userId) {
      toast.error("Select a user/site first.");
      return;
    }

    const rows = buildExportRows();
    if (!rows.length) {
      toast.info("No data to export for this week.");
      return;
    }

    setDownloadingPdf(true);

    let signedMap = {};
    try {
      try {
        signedMap = await getSignedUrlMap(rows);
      } catch (e) {
        console.warn(
          "signed-urls failed, continuing without signed urls",
          e?.message
        );
        signedMap = {};
      }

      toast.info("Generating PDF...");

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let cursorY = 15;

      const logoImg = new Image();
      logoImg.src = genexlogo;

      await new Promise((r) => {
        logoImg.onload = r;
        logoImg.onerror = r;
      });

      doc.setFillColor("#236a80");
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.addImage(logoImg, "PNG", 15, 7, 22, 22);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor("#fff");
      doc.text("Genex Utility Management Pvt Ltd", pageWidth / 2, 14, {
        align: "center",
      });

     doc.setFontSize(10);
doc.text("Weekly Maintenance Activities Report", pageWidth / 2, 20, {
  align: "center",
});

// ✅ SITE (left) + WEEK (right) inside the blue header (white text)
doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor("#fff");

const headerInfoY1 = 34; // line 1 inside blue bar
const headerInfoY2 = 38; // line 2 inside blue bar

// Left: SITE
doc.text(`SITE: ${targetUser.siteName || "N/A"}`, 15, headerInfoY1);

// Right: WEEK (right aligned)
doc.text(`WEEK: ${weekLabel}`, pageWidth - 15, headerInfoY1, { align: "right" });

// (Optional) If you want userName on 2nd line left
// doc.text(`USER: ${targetUser.userName || ""}`, 15, headerInfoY2);

// Move cursor below header
cursorY = 45;

// back to normal body text
doc.setTextColor("#000");
doc.setFontSize(11);


      doc.setFont("helvetica", "bold");
    //   doc.text("Photo Annexure", 15, cursorY);
      cursorY += 8;

      const IMAGE_W = 56;
      const IMAGE_H = 50;
      const GAP = 6;

      for (const row of rows) {
        const general = row.photos.filter((p) => p.type === "GENERAL");

        if (!general.length && !row.comment) continue;

        if (cursorY + 25 > pageHeight) {
          doc.addPage();
          cursorY = 20;
        }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Date: ${row.dateStr}`, 15, cursorY);
        cursorY += 6;

        if (row.comment) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);

          const wrapped = doc.splitTextToSize(row.comment, pageWidth - 30);
          doc.text("Comment:", 15, cursorY);
          cursorY += 5;
          doc.text(wrapped, 20, cursorY);
          cursorY += wrapped.length * 5 + 4;
        }

        const renderBlock = async (title, images, color) => {
          if (!images.length) return;

          doc.setFontSize(9);
          doc.setTextColor(...color);
          doc.text(title, 15, cursorY);
          cursorY += 4;

          let x = 15;
          let y = cursorY;

          for (const p of images) {
            if (x + IMAGE_W > pageWidth - 15) {
              x = 15;
              y += IMAGE_H + GAP;
            }
            if (y + IMAGE_H > pageHeight - 15) {
              doc.addPage();
              x = 15;
              y = 20;
            }

            try {
              let workingUrl = signedMap[p.url] || p.url;

              try {
                const { dataUrl, fmt } = await fetchAsDataUrl(workingUrl, 2);
                if (fmt === "WEBP") continue;
                doc.addImage(dataUrl, fmt, x, y, IMAGE_W, IMAGE_H);
                x += IMAGE_W + GAP;
              } catch (firstErr) {
                if (!signedMap[p.url]) {
                  try {
                    const freshSigned = await getSignedUrlForOne(p.url);
                    if (freshSigned) {
                      signedMap[p.url] = freshSigned;
                      const { dataUrl, fmt } = await fetchAsDataUrl(
                        freshSigned,
                        1
                      );
                      if (fmt === "WEBP") continue;
                      doc.addImage(dataUrl, fmt, x, y, IMAGE_W, IMAGE_H);
                      x += IMAGE_W + GAP;
                      continue;
                    }
                  } catch {}
                }
                throw firstErr;
              }
            } catch (e) {
              console.warn("Skipping inaccessible image:", p.url, e?.message);
            }
          }

          cursorY = y + IMAGE_H + 8;
          doc.setTextColor("#000");
        };

        await renderBlock("Photos", general, [44, 62, 80]);

        cursorY += 4;
      }

      doc.save(`${targetUser.siteName}_${weekStartISO}_Weekly_Maintenance.pdf`);
      toast.success("PDF generated!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDeletePhoto = async (dateISO, photoIndex, url) => {
    if (!targetUser.userId) {
      toast.error("Select a user/site first.");
      return;
    }

    // local blob preview
    if (url.startsWith("blob:")) {
      setEntriesByDate((prev) => {
        const entry = prev[dateISO] || { comment: "", photos: [] };
        const newPhotos = (entry.photos || []).filter(
          (_p, i) => i !== photoIndex
        );
        return { ...prev, [dateISO]: { ...entry, photos: newPhotos } };
      });

      setPendingFilesByDate((prev) => {
        const entries = prev[dateISO] || [];
        const newEntries = entries.filter((fe) => fe.url !== url);
        return { ...prev, [dateISO]: newEntries };
      });

      return;
    }

    const confirmed = window.confirm("Delete this photo?");
    if (!confirmed) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/weekly-maintenance/photo/${targetUser.userId}/${weekStartISO}/${dateISO}`,
        { data: { photoUrl: url } }
      );

      const updatedEntry = res.data.entry;

      setEntriesByDate((prev) => ({
        ...prev,
        [dateISO]: {
          comment: prev[dateISO]?.comment || updatedEntry?.comment || "",
          photos: normalizePhotos(updatedEntry?.photos || []),
        },
      }));

      toast.success("Photo deleted");
    } catch (err) {
      console.error("Failed to delete photo:", err);
      toast.error("Failed to delete photo");
    }
  };

  // --- UI styles (reuse your monthly style) ---
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

  const commentInputStyle = { ...inputStyle, width: "100%" };

  const buttonStyle = {
    padding: "12px 30px",
    borderRadius: "8px",
    border: "2px dotted #236a80",
    backgroundColor: "#236a80",
    color: "white",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
    marginRight: "10px",
  };

  const downloadPdfButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#e74c3c",
    borderColor: "#e74c3c",
  };

  const downloadCsvButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#27ae60",
    borderColor: "#27ae60",
  };

  const promptStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    textAlign: "center",
    color: "#236a80",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    border: "3px dotted #236a80",
  };

  const goPrevWeek = () => {
    const start = fromISODateLocal(weekStartISO);
    setWeekStartISO(toISODateLocal(addDays(start, -7)));
  };

  const goNextWeek = () => {
    const start = fromISODateLocal(weekStartISO);
    setWeekStartISO(toISODateLocal(addDays(start, 7)));
  };

  return (
    <>
      <div className="d-flex">
        <div>
          <DashboardSam />
        </div>

        <div style={{ marginLeft: "260px", width: "100%", minHeight: "100vh" }}>
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 5,
              marginLeft: "100px",
            }}
          >
            <Header />
          </div>

          <div className="container-fluid py-4 px-4">
            <div className="row" style={{ marginTop: "0", padding: "0 68px" }}>
              <div className="col-12">
                {!targetUser.userName ? (
                  <div style={cardStyle}>
                    <div style={promptStyle}>
                      <i
                        className="fas fa-hand-pointer"
                        style={{ fontSize: "3rem", marginBottom: "1.5rem" }}
                      />
                      <h3 style={{ fontWeight: "600" }}>
                        Please Select a User
                      </h3>
                      <p
                        style={{
                          fontSize: "1.1rem",
                          color: "#34495e",
                          maxWidth: "400px",
                        }}
                      >
                        Use the dropdown in the header to select a user to view
                        or add weekly maintenance report.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={headerStyle}>
                      <div className="d-flex flex-wrap justify-content-between align-items-center">
                        <div>
                          <h3
                            className="mb-2"
                            style={{ fontWeight: "bold", fontSize: "1.8rem" }}
                          >
                            WEEKLY MAINTENANCE ACTIVITIES
                          </h3>
                          <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
                            <strong>SITE:</strong>{" "}
                            {targetUser.siteName || "N/A"}
                            <span className="mx-3">|</span>
                            <strong>WEEK:</strong> {weekLabel}
                          </div>
                        </div>

                        <div
                          className="d-flex align-items-center mt-3 mt-md-0"
                          style={{ gap: 8 }}
                        >
                          <button
                            className="btn btn-sm btn-light"
                            onClick={goPrevWeek}
                            disabled={loading || saving}
                          >
                            ◀ Prev
                          </button>

                          <input
                            type="date"
                            value={weekStartISO}
                            onChange={(e) => {
                              const picked = fromISODateLocal(e.target.value);
                              const monday = getWeekStartMonday(picked);
                              setWeekStartISO(toISODateLocal(monday));
                            }}
                            style={{ ...inputStyle, backgroundColor: "white" }}
                            disabled={loading || saving}
                          />

                          <button
                            className="btn btn-sm btn-light"
                            onClick={goNextWeek}
                            disabled={loading || saving}
                          >
                            Next ▶
                          </button>
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
                            <span style={{ color: "#236a80" }}>
                              Loading weekly maintenance data...
                            </span>
                          </div>
                        )}

                        <table
                          className="table table-hover"
                          style={{ marginBottom: 0 }}
                        >
                          <thead
                            style={{
                              position: "sticky",
                              top: 0,
                              zIndex: 10,
                              background:
                                "linear-gradient(135deg, #236a80 0%, #3498db 100%)",
                              color: "white",
                            }}
                          >
                            <tr>
                              <th
                                style={{
                                  padding: "15px 10px",
                                  fontWeight: "bold",
                                  minWidth: "140px",
                                }}
                              >
                                DATE
                              </th>
                              <th
                                style={{
                                  padding: "15px 10px",
                                  fontWeight: "bold",
                                  minWidth: "320px",
                                }}
                              >
                                PHOTOS
                              </th>
                              <th
                                style={{
                                  padding: "15px 10px",
                                  fontWeight: "bold",
                                  minWidth: "260px",
                                }}
                              >
                                COMMENT
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {weekDaysISO.map((dateISO, i) => {
                              const entry = entriesByDate[dateISO] || {
                                comment: "",
                                photos: [],
                              };
                              const photos = normalizePhotos(
                                entry.photos || []
                              );

                              const photoCount = photos.length;

                              return (
                                <tr
                                  key={dateISO}
                                  style={{
                                    backgroundColor:
                                      i % 2 === 0 ? "#fff" : "#f8f9fa",
                                  }}
                                >
                                  <td
                                    style={{
                                      padding: "12px 10px",
                                      fontWeight: "600",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {formatHumanDate(dateISO)}
                                  </td>

                                  <td style={{ padding: "8px 10px" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                      }}
                                    >
                                      {/* Counts */}
                                      {/* Photo Count */}
                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "8px",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: "11px",
                                            padding: "2px 10px",
                                            borderRadius: "999px",
                                            backgroundColor: "#f4f6f8",
                                            color: "#2c3e50",
                                            border: "1px solid #cfd6dc",
                                            fontWeight: 600,
                                          }}
                                        >
                                          Photos: {photoCount}
                                        </span>
                                      </div>
                                      {/* Thumbnails (click to preview large) */}
                                      {photoCount > 0 && (
                                        <div
                                          style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "6px",
                                            marginTop: "4px",
                                          }}
                                        >
                                          {photos.map((photo, idx) => {
                                            const url =
                                              typeof photo === "string"
                                                ? photo
                                                : photo.url;

                                            return (
                                              <div
                                                key={`${url}-${idx}`}
                                                style={{
                                                  position: "relative",
                                                  display: "inline-block",
                                                }}
                                              >
                                                <img
                                                  src={url}
                                                  alt={`Weekly photo ${idx + 1}`}
                                                  onClick={() =>
                                                    handlePhotoPreview(
                                                      url,
                                                      dateISO,
                                                      idx
                                                    )
                                                  }
                                                  style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    objectFit: "cover",
                                                    borderRadius: "6px",
                                                    border: "2px solid #2c3e50",
                                                    cursor: "pointer",
                                                  }}
                                                />

                                                {(isOperator || isAdmin) && (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeletePhoto(
                                                        dateISO,
                                                        idx,
                                                        url
                                                      );
                                                    }}
                                                    style={{
                                                      position: "absolute",
                                                      top: "-6px",
                                                      right: "-6px",
                                                      backgroundColor:
                                                        "#e74c3c",
                                                      color: "#fff",
                                                      border: "none",
                                                      borderRadius: "50%",
                                                      width: "18px",
                                                      height: "18px",
                                                      fontSize: "11px",
                                                      lineHeight: "18px",
                                                      padding: 0,
                                                      cursor: "pointer",
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "center",
                                                      boxShadow:
                                                        "0 0 4px rgba(0,0,0,0.3)",
                                                    }}
                                                  >
                                                    ×
                                                  </button>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {(isOperator || isAdmin) && (
                                        <div
                                          style={{
                                            display: "flex",
                                            gap: "6px",
                                            marginTop: "4px",
                                          }}
                                        >
                                          {/* Add Photos (multiple) */}
                                          <label
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              padding: "5px 10px",
                                              borderRadius: "5px",
                                              border: "1px dashed #2c3e50",
                                              color: "#2c3e50",
                                              fontSize: "12px",
                                              fontWeight: 500,
                                              cursor: "pointer",
                                              background: "#f4f6f8",
                                            }}
                                          >
                                            + Add Photos
                                            <input
                                              type="file"
                                              accept="image/*"
                                              capture="environment"
                                              multiple
                                              onChange={(e) => {
                                                handlePhotoSelect(
                                                  dateISO,
                                                  e.target.files,
                                                  "GENERAL"
                                                );
                                                e.target.value = "";
                                              }}
                                              style={{ display: "none" }}
                                              disabled={loading || saving}
                                            />
                                          </label>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  <td style={{ padding: "8px 10px" }}>
                                    <textarea
                                      className="form-control form-control-sm"
                                      value={entry.comment}
                                      onChange={(e) =>
                                        handleCommentChange(
                                          dateISO,
                                          e.target.value
                                        )
                                      }
                                      disabled={
                                        (!isOperator && !isAdmin) || loading
                                      }
                                      style={{
                                        ...commentInputStyle,
                                        minHeight: "60px",
                                        resize: "vertical",
                                      }}
                                      placeholder="Enter weekly maintenance activities / remarks..."
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {(isOperator || isAdmin) && (
                        <div className="text-center mt-4">
                          <button
                            style={buttonStyle}
                            onClick={handleSaveCommentsAndPhotos}
                            disabled={saving || loading || !targetUser.userId}
                          >
                            {saving ? "Saving..." : "💾 Save Weekly Report"}
                          </button>

                          <button
                            style={{
                              ...downloadPdfButtonStyle,
                              opacity: downloadingPdf ? 0.7 : 1,
                              cursor: downloadingPdf
                                ? "not-allowed"
                                : "pointer",
                            }}
                            onClick={handleDownloadPDF}
                            disabled={
                              loading ||
                              saving ||
                              downloadingPdf ||
                              !targetUser.userId
                            }
                          >
                            {downloadingPdf
                              ? "⏳ Downloading..."
                              : "📥 Download PDF"}
                          </button>

                          <button
                            style={downloadCsvButtonStyle}
                            onClick={handleDownloadCSV}
                            disabled={loading || saving || !targetUser.userId}
                          >
                            📊 Download CSV
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
    </>
  );
};

export default WeeklyMaintenanceReport;
