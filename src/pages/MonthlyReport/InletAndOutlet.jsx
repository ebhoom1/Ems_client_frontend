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
import "./InletAndOutlet.css";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";

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

const InletAndOutlet = () => {
  const dispatch = useDispatch();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [readings, setReadings] = useState([]);
  const [currentDate] = useState(new Date());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());
  const [flowMeters, setFlowMeters] = useState(["Inlet", "Outlet"]);

  const inletChartRef = useRef(null);
  const outletChartRef = useRef(null);
  const chartRefs = useRef({});
  const chartInstanceRefs = useRef({});

  const { userData } = useSelector((state) => state.user);
  const selectedUserId = useSelector((state) => state.selectedUser.userId);
  const { users: allUsers } = useSelector((state) => state.userLog);

  const currentUser = userData?.validUserOne;
  const isOperator = currentUser?.userType === "operator";
  const isAdmin =
    ["admin", "super_admin"].includes(currentUser?.userType) ||
    currentUser?.adminType === "EBHOOM";

  const DEFAULT_FLOW_METERS = ["Inlet", "Outlet"];

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
      return {
        userName: selectedUserId,
        siteName: "Loading Site...",
        userId: null,
      };
    }
    return { userName: null, siteName: "N/A", userId: null };
  }, [isOperator, isAdmin, selectedUserId, allUsers]);

  // initialize readings
  useEffect(() => {
    const days = getDaysInMonth(year, month);

    setReadings((prev) => {
      return days.map((day, idx) => {
        const existing = prev[idx] || { date: day };
        const updated = { ...existing, date: day };

        flowMeters.forEach((fm) => {
          const key = fm.toLowerCase().replace(/ /g, "_");
          if (!(key + "_initial" in updated)) updated[key + "_initial"] = "";
          if (!(key + "_final" in updated)) updated[key + "_final"] = "";
          if (!(key + "_comment" in updated)) updated[key + "_comment"] = "";
          if (!(key + "_total" in updated)) updated[key + "_total"] = "0.00";
        });

        return updated;
      });
    });
  }, [year, month, targetUser.userName, flowMeters]);

  // fetch report
  useEffect(() => {
    if (!targetUser.userName) return;

    const run = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/api/flow-report/${targetUser.userName}/${year}/${month}`
        );
        setReport(data);

        // ⭐ Load flow meters from backend if present
        if (data.flowMeters && Array.isArray(data.flowMeters)) {
          setFlowMeters(data.flowMeters);
        } else {
          // ensure default always exists
          setFlowMeters(["Inlet", "Outlet"]);
        }
      } catch (err) {
        setReport(null);
        setFlowMeters(["Inlet", "Outlet"]); // fallback
      }

      setLoading(false);
    };

    run();
  }, [targetUser.userName, year, month]);

  // populate readings from report
  // populate readings from report (dynamic for all flow meters)
  useEffect(() => {
    if (!flowMeters.length) return;

    const days = getDaysInMonth(year, month);

    let rows = days.map((day) => {
      const existing = report?.readings?.find((r) => r.date === day) || {
        date: day,
      };
      const updated = { ...existing };

      flowMeters.forEach((fm) => {
        const key = fm.toLowerCase().replace(/ /g, "_");

        updated[key + "_initial"] = updated[key + "_initial"] ?? "";
        updated[key + "_final"] = updated[key + "_final"] ?? "";
        updated[key + "_comment"] = updated[key + "_comment"] ?? "";
        updated[key + "_total"] =
          updated[key + "_total"] ??
          (!isNaN(parseFloat(updated[key + "_final"])) &&
          !isNaN(parseFloat(updated[key + "_initial"]))
            ? (
                parseFloat(updated[key + "_final"]) -
                parseFloat(updated[key + "_initial"])
              ).toFixed(2)
            : "0.00");
      });

      return updated;
    });

    setReadings(rows);
  }, [report, flowMeters, year, month]);

  const handleInputChange = (index, field, value) => {
    const newReadings = [...readings];
    newReadings[index][field] = value;

    const key = field.replace("_initial", "").replace("_final", "");

    const initialVal = parseFloat(newReadings[index][key + "_initial"]);
    const finalVal = parseFloat(newReadings[index][key + "_final"]);

    if (!isNaN(initialVal) && !isNaN(finalVal)) {
      newReadings[index][key + "_total"] = Number(
        finalVal - initialVal
      ).toFixed(2);
    }

    // Auto-fill next row initial value
    const nextIndex = index + 1;
    if (field.endsWith("_final") && nextIndex < newReadings.length) {
      newReadings[nextIndex][key + "_initial"] = value;
    }

    setReadings(newReadings);
  };

  // 🔹 ENTER key: go to same field in next row
  const handleFieldKeyDown = (e, rowIndex, field) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const nextIndex = rowIndex + 1;
    if (nextIndex >= readings.length) return;

    const nextId = `${field}-${nextIndex}`;
    const el = document.getElementById(nextId);
    if (el) {
      el.focus();
      el.select?.();
    }
  };

  const processedReadings = useMemo(() => {
    const tableData = readings.map((r) => {
      const obj = { ...r };

      flowMeters.forEach((fm) => {
        const key = fm.toLowerCase().replace(/ /g, "_");
        const initial = parseFloat(r[key + "_initial"]);
        const final = parseFloat(r[key + "_final"]);

        obj[key + "_total"] =
          !isNaN(initial) && !isNaN(final)
            ? Number(final - initial).toFixed(2)
            : "0.00";
      });

      return obj;
    });

    return { tableData };
  }, [readings, flowMeters]);

  const handleSave = async () => {
    if (!targetUser.userId || !targetUser.userName) {
      toast.error("Cannot save. User data is incomplete.");
      return;
    }

    const validReadings = readings.map((r) => {
      const obj = { date: r.date };

      flowMeters.forEach((fm) => {
        const key = fm.toLowerCase().replace(/ /g, "_");
        obj[key + "_initial"] = r[key + "_initial"] || null;
        obj[key + "_final"] = r[key + "_final"] || null;
        obj[key + "_comment"] = r[key + "_comment"] || null;
        obj[key + "_total"] = r[key + "_total"] || null;
      });

      return obj;
    });

    const payload = {
      userId: targetUser.userId,
      userName: targetUser.userName,
      siteName: targetUser.siteName,
      year,
      month,
      readings: validReadings,
      flowMeters: flowMeters,
    };

    setLoading(true);
    console.log("Saving payload:", payload);
    try {
      const { data } = await axios.post(`${API_URL}/api/flow-report`, payload);
      setReport(data);
      MySwal.fire({
        title: "Report Saved!",
        html: `<p>Report saved for <b>${data.userName}</b></p><p>Site: ${data.siteName}</p>`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save report");
    }
    setLoading(false);
  };

  // const handleDownloadPDF = async () => {
  //   setLoading(true);
  //   toast.info("Generating PDF...");

  //   try {
  //     const doc = new jsPDF();
  //     const logoImg = new Image();
  //     logoImg.src = genexlogo;

  //     await new Promise((resolve) => {
  //       logoImg.onload = resolve;
  //       logoImg.onerror = resolve;
  //     });

  //     // header
  //     doc.setFillColor("#236a80");
  //     doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, "F");
  //     doc.addImage(logoImg, "PNG", 10, 5, 25, 25);
  //     doc.setFont("helvetica", "bold");
  //     doc.setTextColor("#FFFFFF");
  //     doc.setFontSize(14);
  //     doc.text("Genex Utility Management Pvt Ltd", 110, 12, {
  //       align: "center",
  //     });
  //     doc.setFont("helvetica", "normal");
  //     doc.setFontSize(8);
  //     doc.text(
  //       "Sujatha Arcade, Second Floor, #32 Lake View Defence Colony, Shettihalli, Post, Jalahalli West, Bengaluru, Karnataka 560015",
  //       110,
  //       20,
  //       { align: "center" }
  //     );
  //     doc.text("Phone: +91-9663044156", 110, 25, { align: "center" });

  //     // title
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
  //     doc.setFontSize(12);
  //     doc.setFont("helvetica", "bold");
  //     doc.text(`Site: ${targetUser.siteName} (${targetUser.userName})`, 15, 45);
  //     doc.text(`Month: ${monthNames[month]} ${year}`, 15, 52);

  //     // table
  //     const tableHead = [
  //       [
  //         "Date",
  //         ...flowMeters.flatMap((fm) => [
  //           `${fm}-Initial`,
  //           `${fm}-Final`,
  //           `${fm}-Total`,
  //           `${fm}-Comment`,
  //         ]),
  //       ],
  //     ];

  //     const tableBody = processedReadings.tableData.map((r) => {
  //       const row = [formatDate(r.date, month, year)];

  //       flowMeters.forEach((fm) => {
  //         const key = fm.toLowerCase().replace(/ /g, "_");

  //         row.push(
  //           r[key + "_initial"] ?? "N/A",
  //           r[key + "_final"] ?? "N/A",
  //           r[key + "_total"] ?? "0.00",
  //           r[key + "_comment"] ?? "N/A"
  //         );
  //       });

  //       return row;
  //     });

  //     const totalRow = ["TOTAL"];

  //     flowMeters.forEach((fm) => {
  //       const key = fm.toLowerCase().replace(/ /g, "_");

  //       const total = processedReadings.tableData
  //         .reduce((sum, r) => sum + (parseFloat(r[key + "_total"]) || 0), 0)
  //         .toFixed(2);

  //       totalRow.push("", "", total, "");
  //     });

  //     tableBody.push(totalRow);

  //     doc.autoTable({
  //       startY: 60,
  //       head: tableHead,
  //       body: tableBody,
  //       theme: "grid",
  //       headStyles: { fillColor: "#236a80" },
  //       styles: { fontSize: 7 },
  //     });

  //     // charts for admin
  //     // ===== Dynamic charts for PDF =====
  //     if (isAdmin) {
  //       let y = doc.autoTable.previous.finalY + 15;

  //       for (let i = 0; i < dynamicChartData.length; i++) {
  //         const chartRef = document.querySelectorAll("canvas")[i];

  //         if (!chartRef) continue;

  //         if (y + 100 > doc.internal.pageSize.getHeight() - 10) {
  //           doc.addPage();
  //           y = 15;
  //         }

  //         doc.setFontSize(14);
  //         doc.text(`${dynamicChartData[i].meter} Flow  Over Time`, 15, y);

  //         const canvas = await html2canvas(chartRef, { scale: 2 });
  //         const img = canvas.toDataURL("image/png");

  //         doc.addImage(img, "PNG", 15, y + 10, 180, 90);

  //         y += 120;
  //       }
  //     }

  //     doc.save(
  //       `${targetUser.siteName}_${monthNames[month]}_${year}_Flow_Report.pdf`
  //     );
  //     toast.success("PDF generated successfully!");
  //   } catch (e) {
  //     console.error(e);
  //     toast.error("Failed to generate PDF.");
  //   }
  //   setLoading(false);
  // };
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };
  const handleDownloadPDF = async () => {
    setLoading(true);
    toast.info("Generating PDF...");

    try {
      const doc = new jsPDF("landscape", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      /* ---------- LOGO ---------- */
      const logoImg = new Image();
      logoImg.src = genexlogo;
      await new Promise((r) => (logoImg.onload = r));

      /* ---------- HEADER ---------- */
      const drawHeader = () => {
        doc.setFillColor("#236a80");
        doc.rect(0, 0, pageWidth, 28, "F");
        doc.addImage(logoImg, "PNG", 10, 4, 22, 22);

        doc.setTextColor("#fff");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("Genex Utility Management Pvt Ltd", pageWidth / 2, 12, {
          align: "center",
        });

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          "Sujatha Arcade, Second Floor, Jalahalli West, Bengaluru – 560015 | Ph: +91-9663044156",
          pageWidth / 2,
          20,
          { align: "center" }
        );
      };

      /* ---------- TITLE ---------- */
      const drawTitle = () => {
        const months = [
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
        doc.setTextColor("#000");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`Site: ${targetUser.siteName}`, 14, 38);
        doc.text(`Month: ${months[month]} ${year}`, 14, 45);
      };

      /* =====================================================
       PART 1: TABLE PAGES (COLUMN-CHUNKED)
    ===================================================== */

      const METERS_PER_PAGE = 2; // adjust if needed
      const meterChunks = chunkArray(flowMeters, METERS_PER_PAGE);

      for (let i = 0; i < meterChunks.length; i++) {
        if (i > 0) doc.addPage();

        drawHeader();
        drawTitle();

        const meters = meterChunks[i];

        const head = [
          [
            "Date",
            ...meters.flatMap((fm) => [
              `${fm} Initial`,
              `${fm} Final`,
              `${fm} Total`,
              `${fm} Comment`,
            ]),
          ],
        ];

        const body = processedReadings.tableData.map((r) => {
          const row = [formatDate(r.date, month, year)];
          meters.forEach((fm) => {
            const key = fm.toLowerCase().replace(/ /g, "_");
            row.push(
              r[key + "_initial"] ?? "",
              r[key + "_final"] ?? "",
              r[key + "_total"] ?? "0.00",
              r[key + "_comment"] ?? ""
            );
          });
          return row;
        });

        const totalRow = ["TOTAL"];
        meters.forEach((fm) => {
          const key = fm.toLowerCase().replace(/ /g, "_");
          const total = processedReadings.tableData
            .reduce((s, r) => s + (parseFloat(r[key + "_total"]) || 0), 0)
            .toFixed(2);
          totalRow.push("", "", total, "");
        });
        body.push(totalRow);

        doc.autoTable({
          startY: 55,
          head,
          body,
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 2,
            halign: "center",
            valign: "middle",
          },
          headStyles: {
            fillColor: "#236a80",
            textColor: "#fff",
          },
          didParseCell: (data) => {
            if (data.row.index === body.length - 1) {
              data.cell.styles.fontStyle = "bold";
            }
          },
        });
      }

      /* =====================================================
       PART 2: GRAPH PAGES (ALL GRAPHS AT END)
    ===================================================== */

      doc.addPage();
      drawHeader();

      doc.setTextColor("#000");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Flow Trend Graphs", pageWidth / 2, 40, { align: "center" });

      let y = 55;

      for (const fm of flowMeters) {
        const chart = chartInstanceRefs.current[fm];
        if (!chart) continue;

        // ✅ BEST: chart exports itself (sharp)
        let img = null;

        if (chart?.toBase64Image) {
          img = chart.toBase64Image(); // crisp PNG
        } else {
          // fallback only if needed
          const canvasEl = chartRefs.current[fm];
          if (!canvasEl) continue;

          const imgCanvas = await html2canvas(canvasEl, {
            scale: 4,
            useCORS: true,
            backgroundColor: "#fff",
          });
          img = imgCanvas.toDataURL("image/png", 1.0);
        }

        doc.addImage(img, "PNG", 14, y + 6, pageWidth - 28, 60);

        y += 75;
      }

      doc.save(`${targetUser.siteName}_${month + 1}_${year}_Flow_Report.pdf`);

      toast.success("PDF generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }

    setLoading(false);
  };

  const handleDownloadCSV = () => {
    setLoading(true);
    let csv =
      "Date,Inlet-Initial,Inlet-Final,Inlet-Total,Inlet-Comment,Outlet-Initial,Outlet-Final,Outlet-Total,Outlet-Comment\n";
    processedReadings.tableData.forEach((r) => {
      const dateStr = formatDate(r.date, month, year);
      const inletComment = `"${r.inletComment || ""}"`;
      const outletComment = `"${r.outletComment || ""}"`;
      csv += `${dateStr},${r.inlet_initial || ""},${r.inlet_final || ""},${
        r.inlet_total
      },${inletComment},${r.outletInitial || ""},${r.outletFinal || ""},${
        r.outletTotal
      },${outletComment}\n`;
    });
    csv += `\nTOTAL,,,,, , , ,\n,, ,${processedReadings.totalInlet},,, ,${processedReadings.totalOutlet},\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetUser.siteName}_${month + 1}-${year}_Flow_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setLoading(false);
    toast.success("CSV downloaded successfully!");
  };

  const handleDeleteFlowMeter = (meterName) => {
    // 🔒 Hard protection
    if (DEFAULT_FLOW_METERS.includes(meterName)) {
      toast.error("Inlet and Outlet flow meters cannot be deleted");
      return;
    }

    MySwal.fire({
      title: "Delete Flow Meter?",
      html: `<b>${meterName}</b> will be removed from table, charts and reports.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#236a80",
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      // 1️⃣ Remove meter from list
      const updatedMeters = flowMeters.filter((fm) => fm !== meterName);
      setFlowMeters(updatedMeters);

      // 2️⃣ Remove meter data from readings
      setReadings((prev) =>
        prev.map((r) => {
          const key = meterName.toLowerCase().replace(/ /g, "_");
          const updated = { ...r };

          delete updated[key + "_initial"];
          delete updated[key + "_final"];
          delete updated[key + "_total"];
          delete updated[key + "_comment"];

          return updated;
        })
      );

      // 3️⃣ Persist immediately to backend
      try {
        await axios.post(`${API_URL}/api/flow-report`, {
          userId: targetUser.userId,
          userName: targetUser.userName,
          siteName: targetUser.siteName,
          year,
          month,
          readings,
          flowMeters: updatedMeters,
        });

        toast.success(`Flow meter "${meterName}" deleted`);
      } catch (err) {
        toast.error("Failed to update server");
        console.error(err);
      }
    });
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
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    marginTop: "2rem",
  };

  const cardStyle = {
    border: "3px dotted #3498db",
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    marginTop: "2.8rem",
  };

  const promptStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    textAlign: "center",
    color: "#236a80",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    border: "3px dotted #236a80",
  };

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
  const saveButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#3c94e7ff",
    borderColor: "#3c94e7ff",
  };

  const downloadCsvButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#27ae60",
    borderColor: "#27ae60",
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 3,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        font: { size: 16, weight: "bold" },
        color: "#236a80",
      },
    },
  };

  const inletFlowData = {
    labels: processedReadings.tableData.map((r) =>
      formatDate(r.date, month, year)
    ),
    datasets: [
      {
        label: "Inlet Total",
        data: processedReadings.tableData.map((r) => r.inletTotal),
        borderColor: "#236a80",
        borderWidth: 3,
        tension: 0.3,
      },
    ],
  };

  const outletFlowData = {
    labels: processedReadings.tableData.map((r) =>
      formatDate(r.date, month, year)
    ),
    datasets: [
      {
        label: "Outlet Total",
        data: processedReadings.tableData.map((r) => r.outletTotal),
        borderColor: "#e74c3c",
        borderWidth: 3,
        tension: 0.3,
      },
    ],
  };

  const chartColors = [
    "#236a80",
    "#e74c3c",
    "#27ae60",
    "#8e44ad",
    "#d35400",
    "#16a085",
    "#2c3e50",
    "#f39c12",
    "#2980b9",
    "#c0392b",
  ];

  // ==== Dynamic multi-meter chart data ====
  const dynamicChartData = flowMeters.map((fm, idx) => {
    const key = fm.toLowerCase().replace(/ /g, "_");

    return {
      meter: fm,
      data: {
        labels: processedReadings.tableData.map((r) =>
          formatDate(r.date, month, year)
        ),
        datasets: [
          {
            label: `${fm} Total `,
            data: processedReadings.tableData.map(
              (r) => parseFloat(r[key + "_total"]) || 0
            ),
            borderColor: chartColors[idx % chartColors.length],
            borderWidth: 3,
            tension: 0.3,
          },
        ],
      },
    };
  });

  const totalByMeter = useMemo(() => {
    const totals = {};

    flowMeters.forEach((fm) => {
      const key = fm.toLowerCase().replace(/ /g, "_");
      totals[key] = processedReadings.tableData
        .reduce((sum, r) => sum + (parseFloat(r[key + "_total"]) || 0), 0)
        .toFixed(2);
    });

    return totals;
  }, [processedReadings, flowMeters]);

  const handleEnterNavigation = (
    e,
    rowIndex,
    meterIndex,
    fieldType // "initial" | "final" | "comment"
  ) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const fields = ["initial", "final", "total", "comment"];
    const fieldPos = fields.indexOf(fieldType);

    let nextRow = rowIndex + 1;
    let nextMeter = meterIndex;
    let nextField = fieldType;

    // If next row exists → same column, next row
    if (nextRow < readings.length) {
      // do nothing, valid
    } else {
      // move to next column (meter/field)
      nextRow = 0;

      if (fieldPos < fields.length - 1) {
        nextField = fields[fieldPos + 1];
      } else {
        nextField = "initial";
        nextMeter = meterIndex + 1;
      }
    }

    const nextId = `cell-${nextRow}-${nextMeter}-${nextField}`;
    const el = document.getElementById(nextId);
    if (el) el.focus();
  };

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

          {/* main content */}
          <div
            className="container-fluid py-4 "
            style={{
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
              overflowX: "hidden",
            }}
          >
            <div className="row" style={{ marginTop: "0" }}>
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
                        or add their monthly flow report.
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
                            INLET & OUTLET FLOW READINGS
                          </h3>
                          <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
                            <strong>SITE:</strong> {targetUser.siteName}{" "}
                            <span className="mx-3">|</span>
                            <strong>MONTH:</strong> {monthNames[month]} {year}
                          </div>
                        </div>
                        <div className="d-flex align-items-center mt-3 mt-md-0">
                          <select
                            className="form-select me-2"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            style={{ minWidth: "140px" }}
                          >
                            {monthNames.map((name, i) => (
                              <option key={i} value={i}>
                                {name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="form-control"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            style={{ width: "110px" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={cardStyle}>
                      <div className="row">
                        <div className={isAdmin ? "col-lg-6" : "col-12"}>
                          <div className="table-container">
                            <div className="mb-3">
                              <button
                                className="btn btn-success"
                                onClick={async () => {
                                  const name = prompt("Enter Flow Meter Name");

                                  if (!name || !name.trim()) return;

                                  const cleaned = name.trim();

                                  if (flowMeters.includes(cleaned)) {
                                    toast.error("Flow Meter already exists!");
                                    return;
                                  }

                                  const updatedMeters = [
                                    ...flowMeters,
                                    cleaned,
                                  ];
                                  setFlowMeters(updatedMeters);

                                  // Save flow meters to backend immediately
                                  await axios.post(
                                    `${API_URL}/api/flow-report`,
                                    {
                                      userId: targetUser.userId,
                                      userName: targetUser.userName,
                                      siteName: targetUser.siteName,
                                      year,
                                      month,
                                      readings,
                                      flowMeters: updatedMeters,
                                    }
                                  );

                                  toast.success("Flow Meter added!");
                                }}
                              >
                                + Add Flow Meter
                              </button>
                            </div>

                            <table className="table table-hover report-table">
                              <thead>
                                <tr>
                                  <th>DATE</th>
                                  {flowMeters.map((fm) => (
                                    <th
                                      key={fm}
                                      colSpan="4"
                                      style={{ position: "relative" }}
                                    >
                                      {fm.toUpperCase()}
                                      {/* 🗑️ Delete (Admin + Non-default only) */}
                                      {isAdmin &&
                                        !DEFAULT_FLOW_METERS.includes(fm) && (
                                          <span
                                            title="Delete flow meter"
                                            onClick={() =>
                                              handleDeleteFlowMeter(fm)
                                            }
                                            style={{
                                              marginLeft: "8px",
                                              cursor: "pointer",
                                              color: "#ffdada",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            🗑️
                                          </span>
                                        )}
                                    </th>
                                  ))}
                                </tr>
                                <tr>
                                  <th></th>
                                  {flowMeters.map((fm) =>
                                    [
                                      "INITIAL",
                                      "FINAL",
                                      "TOTAL",
                                      "COMMENT",
                                    ].map((h) => <th key={fm + h}>{h}</th>)
                                  )}
                                </tr>
                              </thead>

                              <tbody>
                                {processedReadings.tableData.map(
                                  (r, rowIndex) => (
                                    <tr key={rowIndex}>
                                      <td>{formatDate(r.date, month, year)}</td>

                                      {flowMeters.map((fm, meterIndex) => {
                                        const key = fm
                                          .toLowerCase()
                                          .replace(/ /g, "_");
                                        const init = key + "_initial";
                                        const final = key + "_final";
                                        const total = key + "_total";
                                        const comment = key + "_comment";

                                        return (
                                          <React.Fragment key={key}>
                                            <td>
                                              <input
                                                id={`cell-${rowIndex}-${meterIndex}-initial`}
                                                type="number"
                                                value={r[init]}
                                                onChange={(e) =>
                                                  handleInputChange(
                                                    rowIndex,
                                                    init,
                                                    e.target.value
                                                  )
                                                }
                                                onKeyDown={(e) =>
                                                  handleEnterNavigation(
                                                    e,
                                                    rowIndex,
                                                    meterIndex,
                                                    "initial"
                                                  )
                                                }
                                              />
                                            </td>
                                            <td>
                                              <input
                                                id={`cell-${rowIndex}-${meterIndex}-final`}
                                                type="number"
                                                value={r[final]}
                                                onChange={(e) =>
                                                  handleInputChange(
                                                    rowIndex,
                                                    final,
                                                    e.target.value
                                                  )
                                                }
                                                onKeyDown={(e) =>
                                                  handleEnterNavigation(
                                                    e,
                                                    rowIndex,
                                                    meterIndex,
                                                    "final"
                                                  )
                                                }
                                              />
                                            </td>
                                            <td>
                                              <input
                                                type="text"
                                                value={r[total]}
                                                readOnly
                                              />
                                            </td>
                                            <td>
                                              <input
                                                id={`cell-${rowIndex}-${meterIndex}-comment`}
                                                type="text"
                                                value={r[comment]}
                                                onChange={(e) =>
                                                  handleInputChange(
                                                    rowIndex,
                                                    comment,
                                                    e.target.value
                                                  )
                                                }
                                                onKeyDown={(e) =>
                                                  handleEnterNavigation(
                                                    e,
                                                    rowIndex,
                                                    meterIndex,
                                                    "comment"
                                                  )
                                                }
                                              />
                                            </td>
                                          </React.Fragment>
                                        );
                                      })}
                                    </tr>
                                  )
                                )}
                              </tbody>

                              <tfoot>
                                <tr>
                                  <td>TOTAL</td>
                                  {flowMeters.map((fm) => {
                                    const key = fm
                                      .toLowerCase()
                                      .replace(/ /g, "_");
                                    const total = processedReadings.tableData
                                      .reduce(
                                        (sum, r) =>
                                          sum +
                                          (parseFloat(r[key + "_total"]) || 0),
                                        0
                                      )
                                      .toFixed(2);

                                    return (
                                      <React.Fragment key={fm}>
                                        <td colSpan="2"></td>
                                        <td>{total}</td>
                                        <td></td>
                                      </React.Fragment>
                                    );
                                  })}
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="col-lg-6">
                            {dynamicChartData.map((chartObj, index) => (
                              <div
                                key={index}
                                style={{
                                  height: "220px",
                                  marginBottom: "40px",
                                }}
                              >
                                {/* <Line
                                  ref={(el) => {
                                    if (el?.canvas) {
                                      chartRefs.current[chartObj.meter] =
                                        el.canvas;
                                    }
                                  }}
                                  data={chartObj.data}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: { position: "top" },
                                      title: {
                                        display: true,
                                        text: `${chartObj.meter} Total Over Time`,
                                        font: { size: 16, weight: "bold" },
                                        color: "#236a80",
                                      },
                                    },
                                  }}
                                /> */}
                                <Line
                                  ref={(chart) => {
                                    if (!chart) return;

                                    // ✅ store chart instance (best for PDF)
                                    chartInstanceRefs.current[chartObj.meter] =
                                      chart;

                                    // optional: still store canvas if you want fallback
                                    if (chart?.canvas)
                                      chartRefs.current[chartObj.meter] =
                                        chart.canvas;
                                  }}
                                  data={chartObj.data}
                                  options={{
                                    ...chartOptions,
                                    plugins: {
                                      ...chartOptions.plugins,
                                      title: {
                                        display: true,
                                        text: `${chartObj.meter} Total Over Time`,
                                        font: { size: 16, weight: "bold" },
                                        color: "#236a80",
                                      },
                                    },
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-center mt-4">
                        <button
                          style={saveButtonStyle}
                          onClick={handleSave}
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "💾 Save Report"}
                        </button>
                        {isAdmin && (
                          <>
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
                              {loading ? "..." : "📥 Download PDF"}
                            </button>

                            <button
                              style={downloadCsvButtonStyle}
                              onClick={handleDownloadCSV}
                              disabled={loading || !targetUser.userId}
                              onMouseOver={(e) =>
                                (e.target.style.transform = "translateY(-2px)")
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

export default InletAndOutlet;
