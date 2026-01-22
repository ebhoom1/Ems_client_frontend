import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import { toast } from "react-toastify";
import "./MonthlyReport.css";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import InletAndOutlet from "./InletAndOutlet";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import genexlogo from "../../assests/images/logonewgenex.png";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PARAMETER_COLORS = {
  MLSS: {
    border: "#1a70b8", // blue
    background: "rgba(26,112,184,0.15)",
  },
  PH: {
    border: "#e74c3c", // red
    background: "rgba(231,76,60,0.15)",
  },
};

// fallback colors for dynamically added parameters
const EXTRA_PARAM_COLORS = [
  { border: "#27ae60", background: "rgba(39,174,96,0.15)" }, // green
  { border: "#8e44ad", background: "rgba(142,68,173,0.15)" }, // purple
  { border: "#f39c12", background: "rgba(243,156,18,0.15)" }, // orange
  { border: "#16a085", background: "rgba(22,160,133,0.15)" }, // teal
];
const getParameterColor = (paramKey, index) => {
  if (PARAMETER_COLORS[paramKey]) {
    return PARAMETER_COLORS[paramKey];
  }
  return EXTRA_PARAM_COLORS[index % EXTRA_PARAM_COLORS.length];
};

const MySwal = withReactContent(Swal);

const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(String(date.getDate()).padStart(2, "0"));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const formatDate = (day, month, year) => {
  const d = String(day).padStart(2, "0");
  const m = String(month + 1).padStart(2, "0");
  const y = String(year).slice(-2);
  return `${d}/${m}/${y}`;
};

const MonthlyPh = () => {
  const dispatch = useDispatch();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [readings, setReadings] = useState([]);
  const [currentDate] = useState(new Date());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());
  const [photos, setPhotos] = useState([]);
  const [hiddenParamKeys, setHiddenParamKeys] = useState(new Set());
  const [localAddedParams, setLocalAddedParams] = useState([]); // [{key,label,unit,isDefault:false}]


  // const mlssChartRef = useRef(null);
  // const phChartRef = useRef(null);

  const chartRefs = useRef({});
  const chartInstanceRefs = useRef({});

  // const getChartDataForParam = (paramKey, label, color) => ({
  //   labels,
  //   datasets: [
  //     {
  //       label,
  //       data: readings.map((r) => r.values?.[paramKey] ?? null),
  //       borderWidth: 3,
  //       pointRadius: 4,
  //       pointHoverRadius: 6,
  //       spanGaps: true,
  //       tension: 0.3,
  //     },
  //   ],
  // });

  const getChartDataForParam = (paramKey, label, index) => {
    const color = getParameterColor(paramKey, index);

    return {
      labels,
      datasets: [
        {
          label,
          data: readings.map((r) => r.values?.[paramKey] ?? null),

          // 🎨 COLORS
          borderColor: color.border,
          backgroundColor: color.background,
          fill: true,

          // ✨ VISUAL QUALITY
          borderWidth: 3,
          pointRadius: 3,
          pointHoverRadius: 6,
          spanGaps: true,
          tension: 0.35,
        },
      ],
    };
  };

  const { userData } = useSelector((state) => state.user);
  const selectedUserId = useSelector((state) => state.selectedUser.userId);
  const { users: allUsers } = useSelector((state) => state.userLog);

  const currentUser = userData?.validUserOne;
  const isOperator = currentUser?.userType === "operator";
  const isAdmin =
    ["admin", "super_admin"].includes(currentUser?.userType) ||
    currentUser?.adminType === "EBHOOM";
  const canManage = isAdmin || isOperator;
  const DEFAULT_PARAMETERS = [
    { key: "MLSS", label: "MLSS (mg/ltr)", unit: "mg/ltr", isDefault: true },
    { key: "PH", label: "pH - TREATED WATER", unit: "", isDefault: true },
  ];

  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);

  useEffect(() => {
    if (isAdmin || isOperator) {
      dispatch(fetchUsers());
    }
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
      return {
        userName: selectedUserId,
        siteName: "Loading Site...",
        userId: null,
      };
    }
    return { userName: null, siteName: "N/A", userId: null };
  }, [isOperator, isAdmin, selectedUserId, allUsers]);

//  useEffect(() => {
//   const days = getDaysInMonth(year, month);

//   const reportParams = report?.readings
//     ? buildParamsFromReport(report, DEFAULT_PARAMETERS, hiddenParamKeys)
//     : DEFAULT_PARAMETERS;

//   // ✅ merge report params + locally added params (and avoid duplicates)
//   const mergedParams = (() => {
//     const map = new Map();
//     [...reportParams, ...localAddedParams].forEach((p) => map.set(p.key, p));
//     return Array.from(map.values());
//   })();

//   setParameters(mergedParams);

//   const activeParams = mergedParams;

//   if (report?.readings) {
//     setReadings(
//       days.map((day) => {
//         const found = report.readings.find((r) => r.date === day);
//         return {
//           date: day,
//           values: activeParams.reduce((acc, p) => {
//             acc[p.key] = found?.values?.[p.key] ?? "";
//             return acc;
//           }, {}),
//           comment: found?.comment || "",
//         };
//       })
//     );
//   } else {
//     setReadings(
//       days.map((day) => ({
//         date: day,
//         values: Object.fromEntries(activeParams.map((p) => [p.key, ""])),
//         comment: "",
//       }))
//     );
//   }
// }, [report, year, month, hiddenParamKeys, localAddedParams]);

useEffect(() => {
  const days = getDaysInMonth(year, month);

  const reportParams = report?.readings
    ? buildParamsFromReport(report, DEFAULT_PARAMETERS, hiddenParamKeys)
    : DEFAULT_PARAMETERS;

  // ✅ merge report params + globally added params (and avoid duplicates)
  const mergedParams = (() => {
    const map = new Map();
    [...reportParams, ...localAddedParams].forEach((p) => map.set(p.key, p));
    return Array.from(map.values());
  })();

  setParameters(mergedParams);

  const activeParams = mergedParams;

  if (report?.readings) {
    setReadings(
      days.map((day) => {
        const found = report.readings.find((r) => r.date === day);
        return {
          date: day,
          values: activeParams.reduce((acc, p) => {
            acc[p.key] = found?.values?.[p.key] ?? "";
            return acc;
          }, {}),
          comment: found?.comment || "",
        };
      })
    );
  } else {
    setReadings(
      days.map((day) => ({
        date: day,
        values: Object.fromEntries(activeParams.map((p) => [p.key, ""])),
        comment: "",
      }))
    );
  }
}, [report, year, month, hiddenParamKeys, localAddedParams]);

  useEffect(() => {
    if (!targetUser.userName) return;
    const fetchReport = async () => {
      setLoading(true);
      try {
        const url = `${API_URL}/api/mlss-ph/${targetUser.userName}/${year}/${
          month + 1
        }`;
        const { data } = await axios.get(url);
        setReport(data);
      } catch (error) {
        if (error.response?.status === 404) setReport(null);
        else {
          console.error(error);
          toast.error("Failed to fetch report");
        }
      }
      setLoading(false);
    };
    fetchReport();
  }, [targetUser.userName, year, month]);

  // useEffect(() => {
  //   const days = getDaysInMonth(year, month);

  //   // ✅ If report has extra parameter keys, add them into `parameters`
  //   const nextParams = report?.readings
  //     ? buildParamsFromReport(report, DEFAULT_PARAMETERS, hiddenParamKeys)
  //     : parameters;

  //   // Update parameters only when needed (prevents render loops)
  //   if (report?.readings) {
  //     setParameters((prev) => {
  //       const prevKeys = prev.map((p) => p.key).join("|");
  //       const nextKeys = nextParams.map((p) => p.key).join("|");
  //       return prevKeys === nextKeys ? prev : nextParams;
  //     });
  //   }

  //   const activeParams = report?.readings ? nextParams : parameters;

  //   if (report?.readings) {
  //     setReadings(
  //       days.map((day) => {
  //         const found = report.readings.find((r) => r.date === day);
  //         return {
  //           date: day,
  //           values: activeParams.reduce((acc, p) => {
  //             acc[p.key] = found?.values?.[p.key] ?? "";
  //             return acc;
  //           }, {}),
  //           comment: found?.comment || "",
  //         };
  //       })
  //     );
  //   } else {
  //     setReadings(
  //       days.map((day) => ({
  //         date: day,
  //         values: Object.fromEntries(activeParams.map((p) => [p.key, ""])),
  //         comment: "",
  //       }))
  //     );
  //   }
  // }, [report, year, month, parameters]);

  // const handleInputChange = (index, paramKey, value) => {
  //   const updated = [...readings];
  //   updated[index].values[paramKey] = value;
  //   setReadings(updated);
  // };
  const handleInputChange = (index, paramKey, value) => {
    setReadings((prev) => {
      const updated = [...prev];

      if (paramKey === "comment") {
        updated[index].comment = value;
      } else {
        updated[index].values[paramKey] = value;
      }

      return updated;
    });
  };

  // 🔹 ENTER key handler – move to next row
  const handleFieldKeyDown = (e, rowIndex, paramKey) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const nextRow = rowIndex + 1;
    if (nextRow >= readings.length) return;

    // 🔽 SAME COLUMN, NEXT ROW
    if (paramKey === "comment") {
      document.getElementById(`comment-${nextRow}`)?.focus();
    } else {
      document.getElementById(`cell-${nextRow}-${paramKey}`)?.focus();
    }
  };

  const handleSave = async () => {
    if (!targetUser.userId || !targetUser.userName) {
      toast.error("Cannot save. User data is incomplete.");
      return;
    }
    const validReadings = readings.map((r) => ({
      date: r.date,
      values: Object.fromEntries(
        Object.entries(r.values).map(([k, v]) => [
          k,
          v === "" ? null : Number(v),
        ])
      ),
      comment: r.comment || null,
    }));

    const payload = {
      userId: targetUser.userId,
      userName: targetUser.userName,
      siteName: targetUser.siteName,
      year,
      month: month + 1,
      readings: validReadings,
    };

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/mlss-ph`, payload);
      setReport(data);
      MySwal.fire({
        title: "Report Saved!",
        html: `<p>Report saved for <b>${data.userName}</b></p><p>Site: ${data.siteName}</p>`,
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
      });
      console.log("Saved report:", data);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save report");
    }
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    toast.info("Generating PDF...");
    try {
      const doc = new jsPDF();
      const logoImg = new Image();
      logoImg.src = genexlogo;
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });

      doc.setFillColor("#236a80");
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, "F");
      doc.addImage(logoImg, "PNG", 15, 5, 25, 25);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#FFFFFF");
      doc.setFontSize(14);
      doc.text("Genex Utility Management Pvt Ltd", 110, 12, {
        align: "center",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        "Sujatha Arcade, Second Floor, #32 Lake View Defence Colony, Shettihalli, Post, Jalahalli West, Bengaluru, Karnataka 560015",
        110,
        20,
        { align: "center" }
      );
      doc.text("Phone: +91-9663044156", 110, 25, { align: "center" });

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
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Site: ${targetUser.siteName}`, 15, 45);
      doc.text(`Month: ${monthNames[month]} ${year}`, 15, 52);

      const tableHead = [
        ["Date", ...parameters.map((p) => p.label), "Comment"],
      ];

      const tableBody = readings.map((r) => [
        formatDate(r.date, month, year),
        ...parameters.map((p) => r.values?.[p.key] ?? "N/A"),
        r.comment || "N/A",
      ]);
      doc.autoTable({
        startY: 60,
        head: tableHead,
        body: tableBody,
        theme: "grid",
        headStyles: { fillColor: "#236a80" },
      });

      if (canManage) {
        let y = doc.autoTable.previous.finalY + 15;

        for (const p of parameters) {
          const el = chartRefs.current[p.key];
          if (!el) continue;

          if (y + 100 > doc.internal.pageSize.getHeight() - 10) {
            doc.addPage();
            y = 15;
          }

          doc.setFontSize(14);
          doc.text(`${p.label}`, 15, y);

          const chart = chartInstanceRefs.current[p.key];

          // ✅ BEST: export chart canvas directly (sharp)
          let imgDataUrl = null;

          if (chart?.toBase64Image) {
            imgDataUrl = chart.toBase64Image(); // PNG by default
          } else {
            // fallback only if needed
            const canvas = await html2canvas(el, {
              scale: 4, // ✅ higher
              useCORS: true,
              backgroundColor: "#fff",
            });
            imgDataUrl = canvas.toDataURL("image/png", 1.0);
          }

          doc.addImage(imgDataUrl, "PNG", 15, y + 10, 180, 90);

          y += 110;
        }

        // if (phChartRef.current) {
        //   if (y + 100 > doc.internal.pageSize.getHeight() - 10) {
        //     doc.addPage();
        //     y = 15;
        //   }
        //   doc.setFontSize(14);
        //   doc.text("pH Levels Over Time", 15, y);
        //   const c2 = await html2canvas(phChartRef.current, { scale: 2 });
        //   doc.addImage(c2.toDataURL("image/png"), "PNG", 15, y + 10, 180, 90);
        // }
      }

      doc.save(
        `${targetUser.siteName}_${monthNames[month]}_${year}_Report.pdf`
      );
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF.");
    }
    setLoading(false);
  };

  const handleDownloadCSV = () => {
    setLoading(true);
    let csv =
      ["Date", ...parameters.map((p) => p.label), "Comment"].join(",") + "\n";

    readings.forEach((r) => {
      const row = [
        formatDate(r.date, month, year),
        ...parameters.map((p) => r.values?.[p.key] ?? ""),
        `"${r.comment || ""}"`,
      ];
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetUser.siteName}_${month + 1}-${year}_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setLoading(false);
    toast.success("CSV downloaded successfully!");
  };

  const handleUploadPhotos = async () => {
    if (!photos.length) {
      return MySwal.fire({
        title: "No Photos Selected",
        text: "Please select at least one photo before uploading.",
        icon: "warning",
        confirmButtonColor: "#236a80",
      });
    }

    MySwal.fire({
      title: "Uploading Photos...",
      text: "Please wait while we upload your photos to the server.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const formData = new FormData();
    photos.forEach((p) => p && formData.append("photos", p));

    try {
      const res = await axios.post(
        `${API_URL}/api/monthly-report/upload/${targetUser.userId}/${year}/${month}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      MySwal.fire({
        title: "✅ Upload Successful!",
        html: `<p>Your photos have been uploaded successfully.</p>`,
        icon: "success",
        confirmButtonColor: "#236a80",
      });
      console.log("S3 URLs:", res.data.photos);
    } catch (err) {
      console.error("Upload failed:", err);
      MySwal.fire({
        title: "Upload Failed!",
        text: "Something went wrong while uploading. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const labels = readings.map((r) => formatDate(r.date, month, year));
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 3,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 12, weight: "bold" }, color: "#2c3e50" },
      },
      title: {
        display: true,
        font: { size: 16, weight: "bold" },
        color: "#236a80",
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 15,
          color: "#34495e",
          font: { size: 11 },
        },
        grid: { color: "rgba(52, 73, 94, 0.1)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#34495e", font: { size: 11 } },
        grid: { color: "rgba(52, 73, 94, 0.1)" },
      },
    },
  };

  const handleDeleteParameter = (paramKey) => {
    MySwal.fire({
      title: "Delete Parameter?",
      text: `Are you sure you want to delete "${paramKey}"? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#236a80",
      confirmButtonText: "Yes, delete",
   }).then((result) => {
  if (!result.isConfirmed) return;

  setHiddenParamKeys((prev) => {
    const next = new Set(prev);
    next.add(paramKey);
    return next;
  });

  // ✅ also remove from local-added list
  setLocalAddedParams((prev) => prev.filter((p) => p.key !== paramKey));

  // 1️⃣ Remove from parameters
  setParameters((prev) => prev.filter((p) => p.key !== paramKey));

  // 2️⃣ Remove from readings
  setReadings((prev) =>
    prev.map((r) => {
      const updatedValues = { ...r.values };
      delete updatedValues[paramKey];
      return { ...r, values: updatedValues };
    })
  );

  toast.success(`Parameter "${paramKey}" deleted`);
});

  };

  const mlssData = {
    labels,
    datasets: [
      {
        label: "MLSS (mg/ltr)",
        data: readings.map((r) => r.values?.MLSS ?? null),
        borderColor: "#236a80",
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true,
        tension: 0.3,
      },
    ],
  };
  const phData = {
    labels,
    datasets: [
      {
        label: "pH - TREATED WATER",
        data: readings.map((r) => r.values?.PH ?? null),
        borderColor: "#e74c3c",
        backgroundColor: "rgba(231, 76, 60, 0.1)",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true,
        tension: 0.3,
      },
    ],
  };
 useEffect(() => {
  setHiddenParamKeys(new Set());
  setLocalAddedParams([]);
}, [targetUser.userName, year, month]);


  const buildParamsFromReport = (report, defaultParams, hiddenSet) => {
    const defaultKeys = new Set(defaultParams.map((p) => p.key));
    const foundKeys = new Set();

    (report?.readings || []).forEach((r) => {
      Object.keys(r?.values || {}).forEach((k) => {
        if (!hiddenSet?.has(k)) foundKeys.add(k);
      });
    });

    const extraParams = [...foundKeys]
      .filter((k) => !defaultKeys.has(k))
      .sort()
      .map((k) => ({ key: k, label: k, unit: "", isDefault: false }));

    return [...defaultParams, ...extraParams];
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

  const headerStyle = {
    background: "linear-gradient(135deg, #236a80 0%, #236a80 100%)",
    color: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginTop: "2rem",
  };
  const operatorheaderStyle = {
    background: "linear-gradient(135deg, #236a80 0%, #236a80 100%)",
    color: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginTop: "2.8rem",
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

  return (
    <>
      <div className="d-flex">
        {/* Sidebar */}

        <div>
          <DashboardSam />
        </div>

        {/* Main Content Area */}
        <div
          style={{
            marginLeft: "260px",
            width: "100%",
            minHeight: "100vh",
          }}
        >
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
                        or add their monthly report.
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
                            MLSS &amp; pH PARAMETER READINGS
                          </h3>
                          <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
                            <strong>SITE:</strong>{" "}
                            {targetUser.siteName || "N/A"}
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
                      <div className="row">
                        <div className={"col-lg-6"}>
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
                            {canManage && (
                              <div className="mb-3 d-flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Parameter Name (e.g. COD)"
                                  id="newParam"
                                  className="form-control"
                                  style={{ maxWidth: 250 }}
                                />
                                <button
                                  className="btn btn-primary"
                                  onClick={() => {
  const key = document.getElementById("newParam").value.trim().toUpperCase();
  if (!key) return;

  // prevent duplicates across all params
  const exists =
    parameters.some((p) => p.key === key) ||
    localAddedParams.some((p) => p.key === key);

  if (exists) {
    toast.error("Parameter already exists");
    return;
  }

  const newParam = { key, label: key, unit: "", isDefault: false };

  setLocalAddedParams((prev) => [...prev, newParam]);

  setReadings((prev) =>
    prev.map((r) => ({
      ...r,
      values: { ...r.values, [key]: "" },
    }))
  );

  document.getElementById("newParam").value = "";
}}

                                >
                                  ➕ Add Parameter
                                </button>
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
                                      border:
                                        "2px dotted rgba(255, 255, 255, 0.3)",
                                    }}
                                  >
                                    DATE
                                  </th>
                                  {parameters.map((p) => (
                                    <th
                                      key={p.key}
                                      style={{
                                        position: "relative",
                                        padding: "15px 10px",
                                        fontWeight: "bold",
                                        fontSize: "0.95rem",
                                        border:
                                          "2px dotted rgba(255,255,255,0.3)",
                                      }}
                                    >
                                      {p.label}

                                      {/* 🗑️ Delete button (only for non-default, admin only) */}
                                      {canManage && !p.isDefault && (
                                        <span
                                          onClick={() =>
                                            handleDeleteParameter(p.key)
                                          }
                                          style={{
                                            marginLeft: "8px",
                                            cursor: "pointer",
                                            color: "#ffdddd",
                                            fontWeight: "bold",
                                          }}
                                          title="Delete parameter"
                                        >
                                          🗑️
                                        </span>
                                      )}
                                    </th>
                                  ))}

                                  <th
                                    style={{
                                      padding: "15px 10px",
                                      fontWeight: "bold",
                                      fontSize: "0.95rem",
                                      border:
                                        "2px dotted rgba(255, 255, 255, 0.3)",
                                      minWidth: "150px",
                                    }}
                                  >
                                    COMMENT
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {readings.map((reading, index) => (
                                  <tr
                                    key={index}
                                    style={{
                                      backgroundColor:
                                        index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                                    }}
                                  >
                                    <td
                                      style={{
                                        padding: "12px 10px",
                                        fontWeight: "600",
                                        color: "#2c3e50",
                                        fontSize: "0.9rem",
                                      }}
                                    >
                                      {formatDate(reading.date, month, year)}
                                    </td>
                                    {parameters.map((p) => (
                                      <td
                                        key={p.key}
                                        style={{ padding: "8px 10px" }}
                                      >
                                        <input
                                          id={`cell-${index}-${p.key}`}
                                          type="number"
                                          className="form-control form-control-sm"
                                          value={reading.values[p.key]}
                                          onChange={(e) =>
                                            handleInputChange(
                                              index,
                                              p.key,
                                              e.target.value
                                            )
                                          }
                                          onKeyDown={(e) =>
                                            handleFieldKeyDown(e, index, p.key)
                                          }
                                          disabled={
                                            (!isOperator && !isAdmin) || loading
                                          }
                                          style={inputStyle}
                                        />
                                      </td>
                                    ))}

                                    <td style={{ padding: "8px 10px" }}>
                                      <input
                                        id={`comment-${index}`}
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={reading.comment}
                                        onChange={(e) =>
                                          handleInputChange(
                                            index,
                                            "comment",
                                            e.target.value
                                          )
                                        }
                                        onKeyDown={(e) =>
                                          handleFieldKeyDown(
                                            e,
                                            index,
                                            "comment"
                                          )
                                        }
                                        disabled={
                                          (!isOperator && !isAdmin) || loading
                                        }
                                        style={commentInputStyle}
                                        placeholder="Enter comment..."
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {canManage && (
                          <div className="col-lg-6">
                            <div
                              style={{
                                border: "3px dotted #3498db",
                                borderRadius: "12px",
                                padding: "20px",
                                backgroundColor: "#f8f9fa",
                                height: "550px",
                                overflowY: "auto",
                              }}
                            >
                              {parameters.map((p, index) => (
                                <div
                                  key={p.key}
                                  ref={(el) => (chartRefs.current[p.key] = el)}
                                  style={{
                                    height: "240px",
                                    marginBottom: "25px",
                                    padding: "15px",
                                    backgroundColor: "white",
                                    borderRadius: "10px",
                                    border: "2px dotted #3498db",
                                  }}
                                >
                                  <Line
                                    ref={(chart) => {
                                      if (chart)
                                        chartInstanceRefs.current[p.key] =
                                          chart; // ✅ ADD THIS
                                    }}
                                    data={getChartDataForParam(
                                      p.key,
                                      p.label,
                                      index
                                    )}
                                    options={{
                                      ...chartOptions,
                                      plugins: {
                                        ...chartOptions.plugins,
                                        title: {
                                          display: true,
                                          text: `${p.label}`,
                                          color: getParameterColor(p.key, index)
                                            .border,
                                        },
                                      },
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {(isOperator || isAdmin) && (
                        <div className="text-center mt-4">
                          <button
                            style={buttonStyle}
                            onClick={handleSave}
                            disabled={loading || !targetUser.userId}
                            onMouseOver={(e) =>
                              (e.target.style.transform = "translateY(-2px)")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.transform = "translateY(0)")
                            }
                          >
                            {loading ? "Saving..." : "💾 Save Report"}
                          </button>

                          {canManage && (
                            <>
                              <button
                                style={downloadPdfButtonStyle}
                                onClick={handleDownloadPDF}
                                disabled={loading || !targetUser.userId}
                                onMouseOver={(e) =>
                                  (e.target.style.transform =
                                    "translateY(-2px)")
                                }
                                onMouseOut={(e) =>
                                  (e.target.style.transform = "translateY(0)")
                                }
                              >
                                {loading ? "..." : "📥 Download PDF"}
                              </button>

                              <button
                                style={downloadCsvButtonStyle}
                                onClick={handleDownloadCSV}
                                disabled={loading || !targetUser.userId}
                                onMouseOver={(e) =>
                                  (e.target.style.transform =
                                    "translateY(-2px)")
                                }
                                onMouseOut={(e) =>
                                  (e.target.style.transform = "translateY(0)")
                                }
                              >
                                {loading ? "..." : "📊 Download CSV"}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Operator-only Inlet/Outlet + Photos */}
                    {/* {isOperator && (
                      <>
                        <div
                          style={{
                            width: "100%",
                            maxWidth: "1200px",
                            margin: "0 auto",
                          }}
                        >
                          <InletAndOutlet />
                        </div>
                        <div className="photo-upload-section mt-4">
                          <h4>Upload Site Photos</h4>
                          <div className="photo-upload-grid">
                            {[0, 1].map((i) => (
                              <div className="photo-box" key={i}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`photoUpload${i}`}
                                  className="photo-input"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      const file = e.target.files[0];
                                      const imgUrl = URL.createObjectURL(file);
                                      document.getElementById(
                                        `photoPreview${i}`
                                      ).src = imgUrl;
                                      const updated = [...photos];
                                      updated[i] = file;
                                      setPhotos(updated);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`photoUpload${i}`}
                                  className="photo-label"
                                >
                                  <img
                                    id={`photoPreview${i}`}
                                    className="photo-preview"
                                    alt={`Preview ${i}`}
                                  />
                                  <div className="photo-placeholder">
                                    <i className="fas fa-camera photo-icon"></i>
                                    <span>Upload / Take Photo</span>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                          <div className="text-center mt-3">
                            <button
                              style={buttonStyle}
                              onClick={handleUploadPhotos}
                              disabled={!targetUser.userId || !photos.length}
                            >
                              📸 Upload Photos
                            </button>
                          </div>
                        </div>
                      </>
                    )} */}
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

export default MonthlyPh;
