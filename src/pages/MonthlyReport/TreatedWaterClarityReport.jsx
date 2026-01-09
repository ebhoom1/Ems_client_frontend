// FILE: src/Components/MonthlyMaintenance/TreatedWaterClarityReport.jsx

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

// --- Helpers ---
const getDaysInMonth = (year, monthIndex) => {
  const date = new Date(year, monthIndex, 1);
  const days = [];
  while (date.getMonth() === monthIndex) {
    days.push(String(date.getDate()).padStart(2, "0")); // "01", "02", ...
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const formatDate = (dayStr, monthIndex, year) => {
  const d = String(dayStr).padStart(2, "0");
  const m = String(monthIndex + 1).padStart(2, "0");
  const y = String(year).slice(-2);
  return `${d}/${m}/${y}`;
};

const TreatedWaterClarityReport = () => {
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

  // entriesByDay[dayStr] = { photos: [URL] } (S3 URLs or local previews)
  const [entriesByDay, setEntriesByDay] = useState({});

  // pendingFilesByDay[dayStr] = [File] (uploaded on final Save)
  const [pendingFilesByDay, setPendingFilesByDay] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [viewPhotoUrl, setViewPhotoUrl] = useState(null); // for big preview

  // --- Load users like MonthlyPh ---
  useEffect(() => {
    if (isAdmin || isOperator) {
      dispatch(fetchUsers());
    }
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

  // --- Setup blank entries for current month ---
  useEffect(() => {
    const days = getDaysInMonth(year, month);
    const base = {};
    days.forEach((d) => {
      base[d] = { photos: [] };
    });
    setEntriesByDay(base);
    setPendingFilesByDay({});
  }, [year, month]);

  // --- Fetch existing clarity report from backend ---
  useEffect(() => {
    if (!targetUser.userId) return;

    const fetchReport = async () => {
      const days = getDaysInMonth(year, month);
      setLoading(true);

      try {
        // GET /api/treated-water-clarity/:userId/:year/:month
        const { data } = await axios.get(
          `${API_URL}/api/treated-water-clarity/${targetUser.userId}/${year}/${
            month + 1
          }`
        );
        if (DEBUG) {
          console.groupCollapsed(
            `🟦 Treated Water Clarity GET ✅ (${targetUser.userName}) ${year}-${
              month + 1
            }`
          );
          console.log("Raw response:", data);
          console.log("entries length:", data?.entries?.length || 0);
          console.log("first entry:", data?.entries?.[0]);
          console.groupEnd();
        }
        const map = {};
        days.forEach((dayStr) => {
          const dNum = parseInt(dayStr, 10);
          const entry = data?.entries?.find((e) => e.date === dNum);
          map[dayStr] = {
            photos: entry?.photos || [],
          };
        });
        if (DEBUG) {
          console.groupCollapsed("🟩 Mapped entriesByDay (preview)");
          console.log("map keys:", Object.keys(map));
          // show only first 3 days to avoid huge logs
          console.log("sample:", Object.entries(map).slice(0, 3));
          console.groupEnd();
        }

        setEntriesByDay(map);
        setPendingFilesByDay({});
      } catch (err) {
        if (err.response?.status === 404) {
          const map = {};
          days.forEach((dayStr) => {
            map[dayStr] = { photos: [] };
          });
          setEntriesByDay(map);
          setPendingFilesByDay({});
        } else {
          console.error("Failed to fetch treated water clarity report:", err);
          toast.error("Failed to fetch treated water clarity report");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [targetUser.userId, year, month]);

  // --- File selection: multiple photos per date, preview immediately ---
  const handlePhotoSelect = (dayStr, fileList, comment) => {
    if (!fileList || !fileList.length) return;
    if (!targetUser.userId) {
      toast.error("Select a user/site first.");
      return;
    }

    const filesArray = Array.from(fileList);
    const previewUrls = filesArray.map((file) => URL.createObjectURL(file));

    // Add previews to current entries
    setEntriesByDay((prev) => {
      const existing = prev[dayStr] || { photos: [], comment: "" };
      return {
        ...prev,
        [dayStr]: {
          photos: [...(existing.photos || []), ...previewUrls],
          comment: comment || existing.comment,
        },
      };
    });

    // Store Files for upload on Save
    setPendingFilesByDay((prev) => {
      const existing = prev[dayStr] || [];
      return {
        ...prev,
        [dayStr]: [...existing, ...filesArray],
      };
    });
  };

  // --- Save: upload photos for days that actually have pending files ---
  const handleSavePhotos = async () => {
    if (!targetUser.userId) {
      toast.error("Cannot save. User data is incomplete.");
      return;
    }

    const pendingDays = Object.entries(pendingFilesByDay).filter(
      ([, files]) => files && files.length > 0
    );

    if (!pendingDays.length) {
      toast.info("No new photos to upload for this month.");
      return;
    }

    setSaving(true);

    MySwal.fire({
      title: "Saving Report...",
      html: "Please wait while we upload photos.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      for (const [dayStr, files] of pendingDays) {
        const formData = new FormData();
        files.forEach((file) => formData.append("photos", file));
        formData.append("userName", targetUser.userName || "");
        formData.append("siteName", targetUser.siteName || "");

        const dayNum = parseInt(dayStr, 10);

        const res = await axios.post(
          `${API_URL}/api/treated-water-clarity/upload/${
            targetUser.userId
          }/${year}/${month + 1}/${dayNum}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const updatedEntry = res.data.entry;

        // Replace previews with final S3 URLs
        setEntriesByDay((prev) => ({
          ...prev,
          [dayStr]: {
            photos: updatedEntry.photos || [],
          },
        }));
      }

      // Clear pending after upload
      setPendingFilesByDay({});

      MySwal.fire({
        icon: "success",
        title: "Report Saved",
        html: `<p>Treated Water Clarity report saved for:</p>
               <p><b>${targetUser.siteName}</b> (${targetUser.userName})</p>`,
        confirmButtonColor: "#236a80",
      });

      toast.success("Treated water clarity photos saved");
    } catch (err) {
      console.error("Failed to save treated water clarity report:", err);

      MySwal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Something went wrong while saving the report. Please try again.",
        confirmButtonColor: "#d33",
      });

      toast.error("Failed to save treated water clarity report");
    } finally {
      setSaving(false);
    }
  };

  // --- Export helpers ---
  const daysOfMonth = getDaysInMonth(year, month);

  const buildExportRows = () =>
    daysOfMonth.map((dayStr) => {
      const entry = entriesByDay[dayStr] || { photos: [] };
      return {
        dateStr: formatDate(dayStr, month, year),
        photos: entry.photos || [],
        comment: entry.comment || "",
      };
    });

  const handleDownloadXLSX = async () => {
    if (!targetUser.userId) {
      toast.error("Select a user/site first.");
      return;
    }

    const rows = buildExportRows();

    const hasAny = rows.some((r) => (r.photos || []).length > 0);
    if (!hasAny) {
      toast.info("No photos in this month.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Clarity Report");

    sheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Photos", key: "photos", width: 50 },
    ];

    let rowNumber = 2; // Start after header row

    for (const row of rows) {
      const excelRow = sheet.getRow(rowNumber);
      excelRow.getCell(1).value = row.dateStr;
      excelRow.getCell(2).value = row.comment || "";

      let col = 3; // Start placing images from column B

      for (const url of row.photos) {
        try {
          const blob = await fetch(url).then((r) => r.blob());
          const buffer = await blob.arrayBuffer();

          const imageId = workbook.addImage({
            buffer: buffer,
            extension: "jpeg", // or "png" depending on your file
          });

          sheet.addImage(imageId, {
            tl: { col: col - 1, row: rowNumber - 1 },
            ext: { width: 150, height: 150 },
          });

          col++;
        } catch (err) {
          console.error("Image load failed:", url, err);
        }
      }

      sheet.getRow(rowNumber).height = 120; // Increase row height
      rowNumber++;
    }

    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `${targetUser.siteName}_${month + 1}-${year}_TreatedWaterClarity.xlsx`
      );
    });

    toast.success("XLSX downloaded with images!");
  };

  // const handleDownloadPDF = async () => {
  //   if (!targetUser.userId) {
  //     toast.error("Select a user/site first.");
  //     return;
  //   }

  //   // Build rows and keep ONLY days that have photos
  //   const allRows = buildExportRows(); // [{ dateStr, photos: [...] }]
  //   const rows = allRows.filter((r) => (r.photos || []).length > 0);
  //   if (!rows.length) {
  //     toast.info("No photos to export for this month.");
  //     return;
  //   }

  //   try {
  //     toast.info("Generating PDF...");

  //     const doc = new jsPDF();
  //     const pageWidth = doc.internal.pageSize.getWidth();

  //     // --- Header with logo & title ---
  //     const logoImg = new Image();
  //     logoImg.src = genexlogo;
  //     await new Promise((resolve) => {
  //       logoImg.onload = resolve;
  //       logoImg.onerror = resolve;
  //     });

  //     // Top blue bar
  //     doc.setFillColor("#236a80");
  //     doc.rect(0, 0, pageWidth, 35, "F");
  //     doc.addImage(logoImg, "PNG", 15, 5, 25, 25);

  //     doc.setFont("helvetica", "bold");
  //     doc.setTextColor("#FFFFFF");
  //     doc.setFontSize(14);
  //     doc.text("Genex Utility Management Pvt Ltd", pageWidth / 2 + 10, 12, {
  //       align: "center",
  //     });

  //     // 🔹 Wrapped address in two lines & moved slightly down
  //     doc.setFont("helvetica", "normal");
  //     doc.setFontSize(8);
  //     doc.text(
  //       "Sujatha Arcade, Second Floor, #32 Lake View Defence Colony,",
  //       110,
  //       18,
  //       { align: "center" }
  //     );
  //     doc.text(
  //       "Shettihalli Post, Jalahalli West, Bengaluru, Karnataka 560015",
  //       110,
  //       22,
  //       { align: "center" }
  //     );
  //     doc.text("Phone: +91-9663044156", 110, 26, { align: "center" });

  //     doc.setFontSize(9);
  //     doc.text("Treated Water Clarity Report", pageWidth / 2 + 10, 31, {
  //       align: "center",
  //     });

  //     const monthNames = [
  //       "January",
  //       "February",
  //       "March",
  //       "April",
  //       "May",
  //       "June",
  //       "July",
  //       "August",
  //       "September",
  //       "October",
  //       "November",
  //       "December",
  //     ];

  //     doc.setTextColor("#000000");
  //     doc.setFontSize(11);
  //     doc.setFont("helvetica", "bold");
  //     doc.text(`Site: ${targetUser.siteName} (${targetUser.userName})`, 15, 45);
  //     doc.text(`Month: ${monthNames[month]} ${year}`, 15, 52);

  //     // --- Prepare one row per DATE, with all images in that row ---
  //     const rowsWithImages = rows.map((r) => ({
  //       dateStr: r.dateStr,
  //       photoUrls: r.photos || [],
  //       _images: [],
  //     }));

  //     // Pre-load all images
  //     await Promise.all(
  //       rowsWithImages.flatMap((row) =>
  //         row.photoUrls.map(
  //           (url) =>
  //             new Promise((resolve) => {
  //               const img = new Image();
  //               img.crossOrigin = "Anonymous";
  //               img.src = url;

  //               img.onload = () => {
  //                 const lower = (url || "").toLowerCase();
  //                 const fmt = lower.includes(".png") ? "PNG" : "JPEG";
  //                 row._images.push({ img, fmt });
  //                 resolve();
  //               };
  //               img.onerror = () => {
  //                 resolve();
  //               };
  //             })
  //         )
  //       )
  //     );

  //     const tableBody = rowsWithImages.map((r) => ({
  //       date: r.dateStr,
  //       photos: "",
  //       _images: r._images,
  //     }));

  //     doc.autoTable({
  //       startY: 60,
  //       columns: [
  //         { header: "Date", dataKey: "date" },
  //         { header: "Photos", dataKey: "photos" },
  //       ],
  //       body: tableBody,
  //       theme: "grid",

  //       // 🔹 Smaller header row + clear white grid line between Date / Photos
  //       headStyles: {
  //         fillColor: "#236a80",
  //         minCellHeight: 16, // header height reduced
  //         lineWidth: 0.3,
  //         lineColor: [120, 120, 120], // white vertical separator
  //       },

  //       styles: {
  //         fontSize: 8,
  //         cellPadding: 3,
  //         minCellHeight: 100, // big body rows for large photos
  //         lineWidth: 0.1,
  //         lineColor: [120, 120, 120],
  //       },

  //       columnStyles: {
  //         date: { cellWidth: 30 },
  //         photos: { cellWidth: pageWidth - 30 - 20 },
  //       },

  //       didDrawCell: (data) => {
  //         // Draw all photos horizontally in Photos cell
  //         if (data.section === "body" && data.column.dataKey === "photos") {
  //           const row = data.row.raw;
  //           const images = row._images || [];
  //           if (!images.length) return;

  //           const cellWidth = data.cell.width;
  //           const cellHeight = data.cell.height;

  //           const padding = 2;
  //           const gap = 3;
  //           const count = images.length;

  //           const availWidth = cellWidth - padding * 2;
  //           const maxHeight = cellHeight - padding * 2;

  //           const slotWidth =
  //             count > 0 ? (availWidth - gap * (count - 1)) / count : availWidth;

  //           images.forEach((img, index) => {
  //             const size = Math.min(slotWidth, maxHeight); // 🔹 SAME width & height

  //             const xSlotStart =
  //               data.cell.x + padding + index * (slotWidth + gap);
  //             const ySlotStart = data.cell.y + padding;

  //             const x = xSlotStart + (slotWidth - size) / 2;
  //             const y = ySlotStart + (maxHeight - size) / 2;

  //             doc.addImage(img, "PNG", x, y, size, size);
  //           });
  //         }
  //       },
  //     });

  //     doc.save(
  //       `${targetUser.siteName}_${monthNames[month]}_${year}_TreatedWaterClarity.pdf`
  //     );

  //     toast.success("PDF generated successfully!");
  //   } catch (err) {
  //     console.error("PDF generation failed:", err);
  //     toast.error("Failed to generate PDF.");
  //   }
  // };

 // ---------------- HELPERS (keep above handleDownloadPDF) ----------------
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
  rows.forEach((r) => (r.photos || []).forEach((u) => u && urls.push(u)));

  const unique = Array.from(new Set(urls)).filter(
    (u) => u && !u.startsWith("blob:")
  );
  if (!unique.length) return {};

  const { data } = await axios.post(
    `${API_URL}/api/treated-water-clarity/signed-urls`,
    { urls: unique, expiresIn: 600 }
  );

  return data?.signedMap || {};
};

const getSignedUrlForOne = async (url) => {
  const { data } = await axios.post(
    `${API_URL}/api/treated-water-clarity/signed-urls`,
    { urls: [url], expiresIn: 600 }
  );
  return data?.signedMap?.[url] || null;
};

// ---------------- COMPLETE HANDLE DOWNLOAD PDF ----------------
const handleDownloadPDF = async () => {
  if (!targetUser.userId) {
    toast.error("Select a user/site first.");
    return;
  }

  // Build rows and keep ONLY days that have photos
  const allRows = buildExportRows(); // [{ dateStr, photos, comment }]
  const rows = allRows.filter((r) => (r.photos || []).length > 0);

  if (!rows.length) {
    toast.info("No photos to export for this month.");
    return;
  }

  try {
    toast.info("Generating PDF...");

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // ---------------- Header ----------------
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
    doc.text("Genex Utility Management Pvt Ltd", pageWidth / 2, 12, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "Sujatha Arcade, Second Floor, #32 Lake View Defence Colony,",
      pageWidth / 2,
      18,
      { align: "center" }
    );
    doc.text(
      "Shettihalli Post, Jalahalli West, Bengaluru, Karnataka 560015",
      pageWidth / 2,
      22,
      { align: "center" }
    );
    doc.text("Phone: +91-9663044156", pageWidth / 2, 26, { align: "center" });

    doc.setFontSize(9);
    doc.text("Treated Water Clarity Report", pageWidth / 2, 31, {
      align: "center",
    });

    const monthNamesLocal = [
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

    doc.setTextColor("#000000");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Site: ${targetUser.siteName} (${targetUser.userName})`, 15, 45);
    doc.text(`Month: ${monthNamesLocal[month]} ${year}`, 15, 52);

    // ---------------- Signed URL map (optional) ----------------
    let signedMap = {};
    try {
      signedMap = await getSignedUrlMap(rows);
    } catch (e) {
      console.warn("signed-urls failed, continuing without signed urls", e?.message);
      signedMap = {};
    }

    // ---------------- Prepare rows ----------------
    const rowsWithImages = rows.map((r) => ({
      dateStr: r.dateStr,
      comment: r.comment || "",
      photoUrls: (r.photos || []).filter((u) => u && !u.startsWith("blob:")),
      _images: [], // [{ originalUrl, dataUrl, fmt }]
      _rowHeight: 0,
    }));

    // ---------------- Preload ALL images BEFORE autoTable ----------------
    for (const row of rowsWithImages) {
      for (const originalUrl of row.photoUrls) {
        const directOrSigned = signedMap[originalUrl] || originalUrl;

        // Try direct/signed first
        try {
          const { dataUrl, fmt } = await fetchAsDataUrl(directOrSigned, 2);
          if (fmt === "WEBP") continue; // jsPDF often can't embed webp reliably
          row._images.push({ originalUrl, dataUrl, fmt });
          continue;
        } catch (e1) {
          // If not already signed, try one-time fresh signed url
          if (!signedMap[originalUrl]) {
            try {
              const freshSigned = await getSignedUrlForOne(originalUrl);
              if (freshSigned) {
                signedMap[originalUrl] = freshSigned;
                const { dataUrl, fmt } = await fetchAsDataUrl(freshSigned, 1);
                if (fmt === "WEBP") continue;
                row._images.push({ originalUrl, dataUrl, fmt });
                continue;
              }
            } catch (_e2) {}
          }
          console.warn("Skipping inaccessible image:", originalUrl, e1?.message);
        }
      }
    }

    // ---------------- Layout settings ----------------
    const PER_ROW = 3;
    const padding = 2;
    const gapX = 3;
    const gapY = 3;

    const dateColWidth = 30;
    const commentColWidth = 55;
    const photosColWidth = pageWidth - dateColWidth - commentColWidth - 20;

    const availWidth = photosColWidth - padding * 2;
    const imgSize = (availWidth - gapX * (PER_ROW - 1)) / PER_ROW;

    // Row height calc
    rowsWithImages.forEach((row) => {
      const count = row._images.length;
      if (!count) {
        row._rowHeight = 18; // small if no images loaded
        return;
      }
      const rowsNeeded = Math.ceil(count / PER_ROW);
      row._rowHeight =
        padding * 2 + rowsNeeded * imgSize + (rowsNeeded - 1) * gapY;
    });

    const tableBody = rowsWithImages.map((r) => ({
      date: r.dateStr,
      photos: " ", // keep cell not empty
      comment: r.comment || "",
      _images: r._images,
      _rowHeight: r._rowHeight,
    }));

    // ---------------- Draw table ----------------
    doc.autoTable({
      startY: 60,
      columns: [
        { header: "Date", dataKey: "date" },
        { header: "Photos", dataKey: "photos" },
        { header: "Comment", dataKey: "comment" },
      ],
      body: tableBody,
      theme: "grid",
      rowPageBreak: "avoid",

      headStyles: {
        fillColor: "#236a80",
        minCellHeight: 16,
        lineWidth: 0.3,
        lineColor: [120, 120, 120],
      },

      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [120, 120, 120],
        valign: "top",
      },

      columnStyles: {
        date: { cellWidth: dateColWidth },
        photos: { cellWidth: photosColWidth, cellPadding: 0 },
        comment: { cellWidth: commentColWidth },
      },

      didParseCell: (data) => {
        if (data.section !== "body") return;

        const rh = data.row?.raw?._rowHeight;
        if (rh) data.cell.styles.minCellHeight = rh;

        if (data.column.dataKey === "photos") {
          data.cell.text = [" "];
        }
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
          const countInThisRow = isLastRow
            ? images.length - rr * PER_ROW
            : PER_ROW;

          const rowWidth =
            countInThisRow * imgSize + (countInThisRow - 1) * gapX;
          const xOffset = (availWidth - rowWidth) / 2;

          const x = startX + xOffset + cc * (imgSize + gapX);
          const y = startY + rr * (imgSize + gapY);

          try {
            doc.addImage(dataUrl, fmt, x, y, imgSize, imgSize);
          } catch (e) {
            // fallback to JPEG if fmt fails
            try {
              doc.addImage(dataUrl, "JPEG", x, y, imgSize, imgSize);
            } catch (_e2) {}
          }
        });
      },
    });

    // ---------------- Save ----------------
    doc.save(
      `${targetUser.siteName}_${monthNamesLocal[month]}_${year}_TreatedWaterClarity.pdf`
    );

    toast.success("PDF generated successfully!");
  } catch (err) {
    console.error("PDF generation failed:", err);
    toast.error("Failed to generate PDF.");
  }
};


  const handleDeletePhoto = async (dayStr, photoIndex, url) => {
    if (!targetUser.userId) {
      toast.error("Select a user/site first.");
      return;
    }

    // 1) If it's a local preview (not yet saved), just remove it locally
    if (url.startsWith("blob:")) {
      setEntriesByDay((prev) => {
        const entry = prev[dayStr] || { photos: [] };
        const newPhotos = entry.photos.filter((p, i) => i !== photoIndex);
        return {
          ...prev,
          [dayStr]: { photos: newPhotos },
        };
      });

      setPendingFilesByDay((prev) => {
        const files = prev[dayStr] || [];
        if (!files.length) return prev;
        const newFiles = files.filter((f, i) => i !== photoIndex);
        return {
          ...prev,
          [dayStr]: newFiles,
        };
      });

      return;
    }

    // 2) Confirm & delete from backend for S3 URLs
    const confirmDelete = window.confirm("Delete this photo?");
    if (!confirmDelete) return;

    try {
      const dayNum = parseInt(dayStr, 10);

      const res = await axios.delete(
        `${API_URL}/api/treated-water-clarity/photo/${
          targetUser.userId
        }/${year}/${month + 1}/${dayNum}`,
        {
          data: { photoUrl: url },
        }
      );

      const updatedEntry = res.data.entry;

      setEntriesByDay((prev) => ({
        ...prev,
        [dayStr]: {
          photos: updatedEntry?.photos || [],
        },
      }));

      toast.success("Photo deleted");
    } catch (err) {
      console.error("Failed to delete photo:", err);
      toast.error("Failed to delete photo");
    }
  };

  // --- UI styles ---
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
    transition: "all 0.3s ease",
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

  useEffect(() => {
    if (!DEBUG) return;
    console.groupCollapsed("🟨 entriesByDay updated");
    console.log(entriesByDay);
    console.groupEnd();
  }, [entriesByDay]);

  return (
    <>
      <div className="d-flex">
        {/* Sidebar */}
        {!isOperator && (
          <div>
            <DashboardSam />
          </div>
        )}

        {/* Main Content */}
        <div
          style={{
            marginLeft: !isOperator ? "260px" : "0",
            width: "100%",
            minHeight: "100vh",
          }}
        >
          {!isOperator && (
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
          )}

          <div className="container-fluid py-4 px-4">
            <div className="row" style={{ marginTop: "0", padding: "0 68px" }}>
              <div className="col-12">
                {/* If no user selected */}
                {!targetUser.userName ? (
                  <div style={cardStyle}>
                    <div style={promptStyle}>
                      <i
                        className="fas fa-hand-pointer"
                        style={{
                          fontSize: "3rem",
                          marginBottom: "1.5rem",
                          color: "#236a80",
                        }}
                      ></i>
                      <h3 style={{ fontWeight: "600", color: "#236a80" }}>
                        Please Select a User
                      </h3>
                      <p
                        style={{
                          fontSize: "1.1rem",
                          color: "#34495e",
                          maxWidth: "420px",
                        }}
                      >
                        Use the dropdown in the header to select a user to view
                        or add their Treated Water Clarity report.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header bar */}
                    <div style={headerStyle}>
                      <div className="d-flex flex-wrap justify-content-between align-items-center">
                        <div>
                          <h3
                            className="mb-2"
                            style={{ fontWeight: "bold", fontSize: "1.8rem" }}
                          >
                            TREATED WATER CLARITY
                          </h3>
                          <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
                            <strong>SITE:</strong>{" "}
                            {targetUser.siteName || "N/A"}
                            <strong className="ms-2">
                              ({targetUser.userName || "No User Selected"})
                            </strong>
                            <span className="mx-3">|</span>
                            <strong>MONTH:</strong> {monthNames[month]} {year}
                          </div>
                        </div>

                        <div className="d-flex align-items-center mt-3 mt-md-0">
                          <select
                            className="form-select me-2"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            style={{
                              ...inputStyle,
                              backgroundColor: "white",
                              minWidth: "140px",
                            }}
                          >
                            {monthNames.map((name, index) => (
                              <option key={index} value={index}>
                                {name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="form-control"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            style={{
                              ...inputStyle,
                              width: "110px",
                              backgroundColor: "white",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Table card */}
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
                              Loading clarity data...
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
                                  fontSize: "0.95rem",
                                  border: "2px dotted rgba(255, 255, 255, 0.3)",
                                  minWidth: "120px",
                                }}
                              >
                                DATE
                              </th>
                              <th
                                style={{
                                  padding: "15px 10px",
                                  fontWeight: "bold",
                                  fontSize: "0.95rem",
                                  border: "2px dotted rgba(255, 255, 255, 0.3)",
                                  minWidth: "260px",
                                }}
                              >
                                PHOTOS
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {daysOfMonth.map((dayStr) => {
                              const entry = entriesByDay[dayStr] || {
                                photos: [],
                              };
                              return (
                                <tr
                                  key={dayStr}
                                  style={{
                                    backgroundColor:
                                      parseInt(dayStr, 10) % 2 === 0
                                        ? "#ffffff"
                                        : "#f8f9fa",
                                  }}
                                >
                                  <td
                                    style={{
                                      padding: "12px 10px",
                                      fontWeight: "600",
                                      color: "#2c3e50",
                                      fontSize: "0.9rem",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {formatDate(dayStr, month, year)}
                                  </td>

                                  {/* Photos cell */}
                                  <td style={{ padding: "8px 10px" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                      }}
                                    >
                                      {/* Thumbnails */}
                                      <div
                                        style={{
                                          display: "flex",
                                          flexWrap: "wrap",
                                          gap: "6px",
                                        }}
                                      >
                                        {(entry.photos || []).map(
                                          (url, idx) => (
                                            <div
                                              key={idx}
                                              style={{
                                                position: "relative",
                                                display: "inline-block",
                                              }}
                                            >
                                              <img
                                                src={url}
                                                alt={`Day ${dayStr} photo ${
                                                  idx + 1
                                                }`}
                                                style={{
                                                  width: "60px",
                                                  height: "60px",
                                                  objectFit: "cover",
                                                  borderRadius: "4px",
                                                  border: "1px solid #cbd8eb",
                                                  cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                  setViewPhotoUrl(url)
                                                }
                                              />

                                              {(isOperator || isAdmin) && (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation(); // don't open preview
                                                    handleDeletePhoto(
                                                      dayStr,
                                                      idx,
                                                      url
                                                    );
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
                                          )
                                        )}
                                      </div>
                                      {/* Add comment input */}
                                      <textarea
                                        placeholder="Add a comment"
                                        value={entry.comment || ""}
                                        onChange={(e) =>
                                          setEntriesByDay((prev) => ({
                                            ...prev,
                                            [dayStr]: {
                                              ...prev[dayStr],
                                              comment: e.target.value,
                                            },
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
                                                dayStr,
                                                e.target.files
                                              );
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
                        <div
                          className="text-center mt-4"
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: "12px",
                          }}
                        >
                          <button
                            style={buttonStyle}
                            onClick={handleSavePhotos}
                            disabled={saving || loading || !targetUser.userId}
                            onMouseOver={(e) =>
                              (e.target.style.transform = "translateY(-2px)")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.transform = "translateY(0)")
                            }
                          >
                            {saving ? "Saving..." : "💾 Save Report"}
                          </button>

                          <button
                            style={downloadPdfButtonStyle}
                            onClick={handleDownloadPDF}
                            disabled={loading || !targetUser.userId}
                            onMouseOver={(e) =>
                              (e.target.style.transform = "translateY(-2px)")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.transform = "translateY(0)")
                            }
                          >
                            📥 Download PDF
                          </button>

                          <button
                            style={downloadCsvButtonStyle}
                            onClick={handleDownloadXLSX}
                            disabled={loading || !targetUser.userId}
                            onMouseOver={(e) =>
                              (e.target.style.transform = "translateY(-2px)")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.transform = "translateY(0)")
                            }
                          >
                            📊 Download XLSX
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

      {/* Photo preview overlay */}
      {viewPhotoUrl && (
        <div style={overlayStyle} onClick={() => setViewPhotoUrl(null)}>
          <div style={overlayInnerStyle} onClick={(e) => e.stopPropagation()}>
            <button
              style={overlayCloseStyle}
              onClick={() => setViewPhotoUrl(null)}
            >
              &times;
            </button>
            <img
              src={viewPhotoUrl}
              alt="Preview"
              style={{
                maxWidth: "80vw",
                maxHeight: "80vh",
                display: "block",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TreatedWaterClarityReport;
