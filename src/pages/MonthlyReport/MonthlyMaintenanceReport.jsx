// FILE: src/Components/MonthlyMaintenance/MonthlyMaintenanceReport.jsx

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
import genexlogo from "../../assests/images/logonewgenex.png";

const MySwal = withReactContent(Swal);

// --- Helpers ---
const getDaysInMonth = (year, monthIndex) => {
  const date = new Date(year, monthIndex, 1);
  const days = [];
  while (date.getMonth() === monthIndex) {
    days.push(String(date.getDate()).padStart(2, "0"));
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

const MonthlyMaintenanceReport = () => {
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

  // entriesByDay[dayStr] = { comment: string, photos: [string URL] }
  const [entriesByDay, setEntriesByDay] = useState({});
  // pendingFilesByDay[dayStr] = [File, File, ...]
  const [pendingFilesByDay, setPendingFilesByDay] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Load users ---
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

  // --- Re-init blank entries for current month ---
  useEffect(() => {
    const days = getDaysInMonth(year, month);
    const base = {};
    days.forEach((d) => {
      base[d] = { comment: "", photos: [] };
    });
    setEntriesByDay(base);
    setPendingFilesByDay({});
  }, [year, month]);

  // --- Fetch existing maintenance report ---
  useEffect(() => {
    if (!targetUser.userId) return;

    const fetchReport = async () => {
      const days = getDaysInMonth(year, month);
      setLoading(true);

      try {
        const { data } = await axios.get(
          `${API_URL}/api/monthly-maintenance/${targetUser.userId}/${year}/${
            month + 1
          }`
        );

        const map = {};
        days.forEach((dayStr) => {
          const dNum = parseInt(dayStr, 10);
          const entry = data?.entries?.find((e) => e.date === dNum);
          map[dayStr] = {
            comment: entry?.comment || "",
            photos: entry?.photos || [],
          };
        });
        setEntriesByDay(map);
        setPendingFilesByDay({});
      } catch (err) {
        if (err.response?.status === 404) {
          const map = {};
          days.forEach((dayStr) => {
            map[dayStr] = { comment: "", photos: [] };
          });
          setEntriesByDay(map);
          setPendingFilesByDay({});
        } else {
          console.error("Failed to fetch maintenance report:", err);
          toast.error("Failed to fetch maintenance report");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [targetUser.userId, year, month]);

  // --- Input handlers ---
  const handleCommentChange = (dayStr, value) => {
    setEntriesByDay((prev) => ({
      ...prev,
      [dayStr]: {
        comment: value,
        photos: prev[dayStr]?.photos || [],
      },
    }));
  };

  // Multiple photos per date, preview immediately (upload on final Save)
  const handlePhotoSelect = (dayStr, fileList) => {
    if (!fileList || !fileList.length) return;
    if (!targetUser.userId) {
      toast.error("Select a user/site first.");
      return;
    }

    const filesArray = Array.from(fileList);

    const previewUrls = filesArray.map((file) => URL.createObjectURL(file));

    setEntriesByDay((prev) => {
      const existing = prev[dayStr] || { comment: "", photos: [] };
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
      return {
        ...prev,
        [dayStr]: [...existing, ...filesArray],
      };
    });
  };

  // Preview photo in SweetAlert
  const handlePhotoPreview = (url, dayStr, idx) => {
    MySwal.fire({
      title: `Photo - ${formatDate(dayStr, month, year)}`,
      imageUrl: url,
      imageAlt: `Maintenance photo ${idx + 1}`,
      showCloseButton: true,
      showConfirmButton: false,
      width: "80%",
      background: "#f8f9fa",
    });
  };

  // Helper: build export rows (only real S3 URLs, skip blob: previews & empty days)
  const buildExportRows = () =>
    Object.entries(entriesByDay)
      .map(([dayStr, entry]) => {
        const comment = entry.comment?.trim() || "";
        const photos = (entry.photos || []).filter(
          (u) => u && !u.startsWith("blob:")
        );
        const hasComment = comment !== "";
        const hasPhotos = photos.length > 0;
        if (!hasComment && !hasPhotos) return null;

        return {
          dayStr,
          dateStr: formatDate(dayStr, month, year),
          comment,
          photos,
        };
      })
      .filter(Boolean);

  // ✅ Save only non-empty days (comment OR photos)
  const handleSaveCommentsAndPhotos = async () => {
    if (!targetUser.userId) {
      toast.error("Cannot save. User data is incomplete.");
      return;
    }

    setSaving(true);

    MySwal.fire({
      title: "Saving Report...",
      html: "Please wait while we save comments and upload photos.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const pendingDays = Object.entries(pendingFilesByDay).filter(
        ([, files]) => files && files.length > 0
      );

      const entriesToSave = buildExportRows().map((row) => ({
        date: parseInt(row.dayStr, 10),
        comment: row.comment,
      }));

      if (entriesToSave.length === 0 && pendingDays.length === 0) {
        MySwal.close();
        toast.info("No comments or photos to save for this month.");
        setSaving(false);
        return;
      }

      // 1) Save comments
      if (entriesToSave.length > 0) {
        await axios.post(`${API_URL}/api/monthly-maintenance`, {
          userId: targetUser.userId,
          year,
          month: month + 1,
          entries: entriesToSave,
        });
      }

      // 2) Upload photos day-wise
      for (const [dayStr, files] of pendingDays) {
        const formData = new FormData();
        files.forEach((file) => formData.append("photos", file));
        const dayNum = parseInt(dayStr, 10);

        const res = await axios.post(
          `${API_URL}/api/monthly-maintenance/upload/${
            targetUser.userId
          }/${year}/${month + 1}/${dayNum}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const updatedEntry = res.data.entry;

        setEntriesByDay((prev) => ({
          ...prev,
          [dayStr]: {
            comment: prev[dayStr]?.comment || updatedEntry.comment || "",
            photos: updatedEntry.photos || [],
          },
        }));
      }

      setPendingFilesByDay({});

      MySwal.fire({
        icon: "success",
        title: "Report Saved",
        html: `<p>Monthly maintenance report saved for:</p>
               <p><b>${targetUser.siteName}</b> (${targetUser.userName})</p>`,
        confirmButtonColor: "#236a80",
      });

      toast.success("Maintenance report (comments + photos) saved");
    } catch (err) {
      console.error("Failed to save report:", err);

      MySwal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Something went wrong while saving the report. Please try again.",
        confirmButtonColor: "#d33",
      });

      toast.error("Failed to save report. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // --- Download CSV (show S3 URLs) ---
  const handleDownloadCSV = () => {
    if (!targetUser.userId) {
      toast.error("Select a user/site first.");
      return;
    }

    const rows = buildExportRows();
    if (!rows.length) {
      toast.info("No data to export for this month.");
      return;
    }

    let csv = "Date,Photo URLs,Comment\n";
    rows.forEach(({ dateStr, photos, comment }) => {
      const photoStr = photos.join(" | ");
      const safePhotos = `"${photoStr.replace(/"/g, '""')}"`;
      const safeComment = `"${(comment || "").replace(/"/g, '""')}"`;
      csv += `${dateStr},${safePhotos},${safeComment}\n`;
    });

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetUser.siteName}_${
      month + 1
    }-${year}_Maintenance_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("CSV downloaded successfully!");
  };

  // const handleDownloadPDF = async () => {
  //   if (!targetUser.userId) {
  //     toast.error("Select a user/site first.");
  //     return;
  //   }

  //   const rows = buildExportRows(); // uses the helper we already defined
  //   if (!rows.length) {
  //     toast.info("No data to export for this month.");
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

  //     doc.setFillColor("#236a80");
  //     doc.rect(0, 0, pageWidth, 35, "F");
  //     doc.addImage(logoImg, "PNG", 15, 5, 25, 25);

  //     doc.setFont("helvetica", "bold");
  //     doc.setTextColor("#FFFFFF");
  //     doc.setFontSize(14);
  //     doc.text("Genex Utility Management Pvt Ltd", pageWidth / 2 + 10, 12, {
  //       align: "center",
  //     });
  //     doc.setFont("helvetica", "normal");
  //     doc.setFontSize(8);
  //     doc.text(
  //       "Monthly Maintenance Activities Report",
  //       pageWidth / 2 + 10,
  //       20,
  //       { align: "center" }
  //     );

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
  //     doc.text(
  //       `Site: ${targetUser.siteName} (${targetUser.userName})`,
  //       15,
  //       45
  //     );
  //     doc.text(`Month: ${monthNames[month]} ${year}`, 15, 52);

  //     // --- Build 1 row PER PHOTO (for the table) ---
  //     // Each row: { dateStr, comment, photoUrl, _image: HTMLImageElement|null }
  //     const rowsWithPhotos = [];

  //     rows.forEach(({ dateStr, comment, photos }) => {
  //       if (photos.length === 0) {
  //         // comment only, no photos
  //         rowsWithPhotos.push({
  //           dateStr,
  //           comment,
  //           photoUrl: null,
  //           _image: null,
  //         });
  //       } else {
  //         photos.forEach((url, idx) => {
  //           rowsWithPhotos.push({
  //             dateStr,
  //             comment: idx === 0 ? comment : "", // comment only on first photo row
  //             photoUrl: url,
  //             _image: null,
  //           });
  //         });
  //       }
  //     });

  //     // --- Pre-load all images so we can draw them in the cells ---
  //     const photoRows = rowsWithPhotos.filter((r) => r.photoUrl);

  //     await Promise.all(
  //       photoRows.map(
  //         (row) =>
  //           new Promise((resolve) => {
  //             const img = new Image();
  //             img.crossOrigin = "Anonymous";
  //             img.src = row.photoUrl;

  //             img.onload = () => {
  //               row._image = img;
  //               resolve();
  //             };
  //             img.onerror = () => {
  //               row._image = null; // fall back to empty cell
  //               resolve();
  //             };
  //           })
  //       )
  //     );

  //     // --- Build table body for autoTable ---
  //     const tableBody = rowsWithPhotos.map((r) => ({
  //       date: r.dateStr,
  //       photo: "", // actual image drawn in didDrawCell
  //       comment: r.comment || "",
  //       _image: r._image, // custom field we use in didDrawCell
  //     }));

  //     // --- Draw table with Date | Photos | Comment ---
  //     doc.autoTable({
  //       startY: 60,
  //       columns: [
  //         { header: "Date", dataKey: "date" },
  //         { header: "Photos", dataKey: "photo" },
  //         { header: "Comment", dataKey: "comment" },
  //       ],
  //       body: tableBody,
  //       theme: "grid",
  //       headStyles: { fillColor: "#236a80" },
  //       styles: {
  //         fontSize: 8,
  //         cellPadding: 3,
  //         minCellHeight: 22, // give some height for thumbnail
  //       },
  //       columnStyles: {
  //         date: { cellWidth: 25 },
  //         photo: { cellWidth: 35 },
  //         comment: { cellWidth: pageWidth - 25 - 35 - 20 }, // rest of the width
  //       },
  //       didDrawCell: (data) => {
  //         // Draw image in "Photos" column cells
  //         if (data.section === "body" && data.column.dataKey === "photo") {
  //           const row = data.row.raw;
  //           const img = row._image;
  //           if (!img) return;

  //           const cellWidth = data.cell.width;
  //           const cellHeight = data.cell.height;

  //           // keep aspect ratio, fit in cell
  //           const aspect = img.width && img.height ? img.width / img.height : 1;
  //           let drawH = cellHeight - 4; // small padding
  //           let drawW = drawH * aspect;

  //           if (drawW > cellWidth - 4) {
  //             drawW = cellWidth - 4;
  //             drawH = drawW / aspect;
  //           }

  //           const x = data.cell.x + (cellWidth - drawW) / 2;
  //           const y = data.cell.y + (cellHeight - drawH) / 2;

  //           doc.addImage(img, "PNG", x, y, drawW, drawH);
  //         }
  //       },
  //     });

  //     doc.save(
  //       `${targetUser.siteName}_${monthNames[month]}_${year}_Maintenance_Report.pdf`
  //     );

  //     toast.success("PDF generated successfully!");
  //   } catch (err) {
  //     console.error("PDF generation failed:", err);
  //     toast.error("Failed to generate PDF.");
  //   }
  // };
  const handleDownloadPDF = async () => {
    if (!targetUser.userId) {
      toast.error("Select a user/site first.");
      return;
    }

    const rows = buildExportRows();
    if (!rows.length) {
      toast.info("No data to export for this month.");
      return;
    }

    try {
      toast.info("Generating PDF...");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // --- Header with logo, address, phone & title ---
      const logoImg = new Image();
      logoImg.src = genexlogo;
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });

      doc.setFillColor("#236a80");
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.addImage(logoImg, "PNG", 15, 7, 22, 22);

      doc.setFont("helvetica", "bold");
      doc.setTextColor("#FFFFFF");
      doc.setFontSize(14);
      doc.text("Genex Utility Management Pvt Ltd", pageWidth / 2 + 10, 12, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const addressLines = doc.splitTextToSize(
        "Sujatha Arcade, Second Floor, #32 Lake View Defence Colony, Shettihalli, Post, Jalahalli West, Bengaluru, Karnataka 560015",
        pageWidth - 60
      );
      doc.text(addressLines, pageWidth / 2 + 10, 18, { align: "center" });
      doc.text("Phone: +91-9663044156", pageWidth / 2 + 10, 26, {
        align: "center",
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(
        "Monthly Maintenance Activities Report",
        pageWidth / 2 + 10,
        34,
        { align: "center" }
      );

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

      doc.setTextColor("#000000");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Site: ${targetUser.siteName} (${targetUser.userName})`, 15, 52);
      doc.text(`Month: ${monthNames[month]} ${year}`, 15, 59);

      // --- Build table rows: one per date ---
      const tableRows = rows.map((r) => ({
        date: r.dateStr,
        comment: r.comment || "",
        photoUrls: r.photos || [],
        photoImages: [],
      }));

      // Preload images
      const imagePromises = [];
      tableRows.forEach((row) => {
        row.photoUrls.forEach((url) => {
          const p = new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = url;
            img.onload = () => {
              row.photoImages.push(img);
              resolve();
            };
            img.onerror = () => {
              resolve();
            };
          });
          imagePromises.push(p);
        });
      });
      await Promise.all(imagePromises);

      const body = tableRows.map((r) => ({
        date: r.date,
        photos: "",
        comment: r.comment,
        photoImages: r.photoImages,
      }));

      doc.autoTable({
        startY: 65,
        columns: [
          { header: "Date", dataKey: "date" },
          { header: "Photos", dataKey: "photos" },
          { header: "Comment", dataKey: "comment" },
        ],
        body,
        theme: "grid",
        headStyles: {
          fillColor: "#236a80",
          textColor: "#ffffff",
          fontStyle: "bold",
          fontSize: 9,
          minCellHeight: 16, // similar to Treated Water header
          lineColor: [120, 120, 120],
          lineWidth: 0.3,
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          minCellHeight: 50, // 🔹 same row height style as Treated Water
          lineColor: [120, 120, 120],
          lineWidth: 0.2,
        },
        columnStyles: {
          date: { cellWidth: 30 },
          photos: { cellWidth: 80 }, // wide photos column
          comment: { cellWidth: pageWidth - 30 - 80 - 20 }, // remaining for comment
        },
        didDrawCell: (data) => {
          // 🔹 Same image layout logic as Treated Water PDF
          if (data.section === "body" && data.column.dataKey === "photos") {
            const row = data.row.raw;
            const images = row.photoImages || [];
            if (!images.length) return;

            const cellWidth = data.cell.width;
            const cellHeight = data.cell.height;

            const padding = 2;
            const gap = 3;
            const count = images.length;

            const availWidth = cellWidth - padding * 2;
            const maxHeight = cellHeight - padding * 2;

            const slotWidth =
              count > 0 ? (availWidth - gap * (count - 1)) / count : availWidth;

            images.forEach((img, index) => {
              const aspect =
                img.width && img.height ? img.width / img.height : 1;

              let drawW = slotWidth;
              let drawH = drawW / aspect;

              if (drawH > maxHeight) {
                drawH = maxHeight;
                drawW = drawH * aspect;
              }

              const xSlotStart =
                data.cell.x + padding + index * (slotWidth + gap);
              const ySlotStart = data.cell.y + padding;

              const x = xSlotStart + (slotWidth - drawW) / 2;
              const y = ySlotStart + (maxHeight - drawH) / 2;

              doc.addImage(img, "PNG", x, y, drawW, drawH);
            });
          }
        },
      });

      doc.save(
        `${targetUser.siteName}_${monthNames[month]}_${year}_Maintenance_Report.pdf`
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

    // 1️⃣ Local preview (blob:) – not yet saved to backend
    if (url.startsWith("blob:")) {
      // Remove from entriesByDay
      setEntriesByDay((prev) => {
        const entry = prev[dayStr] || { comment: "", photos: [] };
        const newPhotos = (entry.photos || []).filter(
          (_p, i) => i !== photoIndex
        );
        return {
          ...prev,
          [dayStr]: { ...entry, photos: newPhotos },
        };
      });

      // Remove corresponding File from pendingFilesByDay
      setPendingFilesByDay((prev) => {
        const files = prev[dayStr] || [];
        if (!files.length) return prev;
        const newFiles = files.filter((_f, i) => i !== photoIndex);
        return {
          ...prev,
          [dayStr]: newFiles,
        };
      });

      return;
    }

    // 2️⃣ Already-uploaded S3 URL – delete via API
    const confirmed = window.confirm("Delete this photo?");
    if (!confirmed) return;

    try {
      const dayNum = parseInt(dayStr, 10);

      const res = await axios.delete(
        `${API_URL}/api/monthly-maintenance/photo/${
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
          comment: prev[dayStr]?.comment || updatedEntry?.comment || "",
          photos: updatedEntry?.photos || [],
        },
      }));

      toast.success("Photo deleted");
    } catch (err) {
      console.error("Failed to delete photo:", err);
      toast.error("Failed to delete photo");
    }
  };

  // --- Month/year select ---
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

  // --- Styles ---
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

  const daysOfMonth = getDaysInMonth(year, month);

  return (
    <>
      <div className="d-flex">
        {!isOperator && (
          <div>
            <DashboardSam />
          </div>
        )}

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
                          maxWidth: "400px",
                        }}
                      >
                        Use the dropdown in the header to select a user to view
                        or add their monthly maintenance report.
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
                            MONTHLY MAINTENANCE ACTIVITIES
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
                              Loading maintenance data...
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
                              <th
                                style={{
                                  padding: "15px 10px",
                                  fontWeight: "bold",
                                  fontSize: "0.95rem",
                                  border: "2px dotted rgba(255, 255, 255, 0.3)",
                                  minWidth: "220px",
                                }}
                              >
                                COMMENT
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {daysOfMonth.map((dayStr) => {
                              const entry = entriesByDay[dayStr] || {
                                comment: "",
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

                                  <td style={{ padding: "8px 10px" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                      }}
                                    >
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
                                                onClick={() =>
                                                  handlePhotoPreview(
                                                    url,
                                                    dayStr,
                                                    idx
                                                  )
                                                }
                                                style={{
                                                  width: "60px",
                                                  height: "60px",
                                                  objectFit: "cover",
                                                  borderRadius: "4px",
                                                  border: "1px solid #cbd8eb",
                                                  cursor: "pointer",
                                                }}
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

                                  <td style={{ padding: "8px 10px" }}>
                                    <textarea
                                      className="form-control form-control-sm"
                                      value={entry.comment}
                                      onChange={(e) =>
                                        handleCommentChange(
                                          dayStr,
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
                                      placeholder="Enter maintenance activities / remarks..."
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
                            disabled={loading || saving || !targetUser.userId}
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
                            onClick={handleDownloadCSV}
                            disabled={loading || saving || !targetUser.userId}
                            onMouseOver={(e) =>
                              (e.target.style.transform = "translateY(-2px)")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.transform = "translateY(0)")
                            }
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

export default MonthlyMaintenanceReport;
