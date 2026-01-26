import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import genexlogo from "../../assests/images/logonewgenex.png";
import { API_URL } from "../../utils/apiConfig";

const THEME = "#236a80";

/* ---------- STATIC MASTER ---------- */
const SPARES_MASTER = [
  {
    slno: 1,
    equipment: "Permeate and Sewage Pump",
    items: ["Gland rope", "Spider Bush", "Bearing-6305", "Bearing-6205"],
  },
  {
    slno: 2,
    equipment: "Aeration and MBR Blower",
    items: [
      "Bearing-3207",
      "Oil seal - 45,62,10",
      "Grease stopper - 35,48,8",
      "Gear Oil",
      "Grease",
    ],
  },
  { slno: 3, equipment: "RAS Pump", items: ["Spider Bush L110"] },
  { slno: 4, equipment: "Aeration Blower", items: ["Belt"] },
  { slno: 5, equipment: "MBR blower", items: ["Belt"] },
  { slno: 6, equipment: "Hypo", items: ["Hypo"] },
];

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const daysInMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0).getDate();

const weekBuckets = (year, monthIndex) => {
  const dim = daysInMonth(year, monthIndex);
  return [
    { week: 1, label: "1 - 7", start: 1, end: 7 },
    { week: 2, label: "8 - 14", start: 8, end: 14 },
    { week: 3, label: "15 - 21", start: 15, end: 21 },
    { week: 4, label: `22 - ${dim}`, start: 22, end: dim },
  ];
};

const CriticalSpareAvailabilityWeeklyReport = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((s) => s.user);
  const selectedUserId = useSelector((s) => s.selectedUser.userId);
  const { users } = useSelector((s) => s.userLog);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [week, setWeek] = useState(1);

  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const targetUser = useMemo(() => {
    if (!selectedUserId) return null;
    const u = users.find((x) => x.userName === selectedUserId);
    return u
      ? { userId: u._id, userName: u.userName, siteName: u.companyName }
      : null;
  }, [users, selectedUserId]);

  /* ---------- GET WEEKLY REPORT (with prefill) ---------- */
  useEffect(() => {
    if (!targetUser) return;

    const fetchReport = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_URL}/api/critical-spares-weekly/${targetUser.userName}/${year}/${month + 1}/${week}?prefill=1`
        );

        const map = {};
        (res.data.spares || []).forEach((s) => {
          const grp = SPARES_MASTER.find((g) => g.equipment === s.equipment);
          if (!grp) return;
          const key = `${grp.slno}_${s.item}`;
          map[key] = s.quantity;
        });

        setQuantities(map);
      } catch (err) {
        setQuantities({});
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [targetUser, year, month, week]);

  /* ---------- SAVE WEEKLY ---------- */
  const handleSave = async () => {
    if (!targetUser) {
      Swal.fire("Select Site", "Please select a site", "warning");
      return;
    }

    try {
      setLoading(true);

      Swal.fire({
        title: "Saving Weekly Report",
        text: "Please wait...",
        allowOutsideClick: false,
        showConfirmButton: false,
      });
      Swal.showLoading();

      const sparesPayload = [];
      SPARES_MASTER.forEach((grp) => {
        grp.items.forEach((item) => {
          const key = `${grp.slno}_${item}`;
          sparesPayload.push({
            equipment: grp.equipment,
            item,
            quantity: quantities[key] || "",
          });
        });
      });

      const res = await axios.post(`${API_URL}/api/critical-spares-weekly`, {
        userId: targetUser.userId,
        userName: targetUser.userName,
        siteName: targetUser.siteName,
        year,
        month: month + 1,
        week,
        spares: sparesPayload,
      });
console.log("Save response:", res.data);
      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Saved Successfully",
        text: "Weekly Critical Spare Availability saved",
        timer: 1800,
        showConfirmButton: false,
      });

      // re-map from response to be safe
      const map = {};
      (res.data.report?.spares || []).forEach((s) => {
        const grp = SPARES_MASTER.find((g) => g.equipment === s.equipment);
        if (!grp) return;
        const key = `${grp.slno}_${s.item}`;
        map[key] = s.quantity;
      });
      setQuantities(map);
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- PDF (WEEKLY) ---------- */
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // header
    doc.setFillColor(THEME);
    doc.rect(0, 0, pageWidth, 30, "F");
    try {
      doc.addImage(genexlogo, "PNG", 12, 6, 18, 18);
    } catch {}

    doc.setTextColor("#fff");
    doc.setFontSize(14);
    doc.text("Critical Spare Availability Report (Weekly)", pageWidth / 2, 18, {
      align: "center",
    });

    doc.setTextColor("#000");

    const wb = weekBuckets(year, month).find((w) => w.week === week);
    const weekLabel = wb ? `${wb.start} - ${wb.end}` : `${week}`;

    // meta
    doc.setFontSize(10);
    doc.text(`Site: ${targetUser?.siteName || ""}`, 14, 36);
    doc.text(`Month: ${monthNames[month]} ${year}`, 14, 42);
    doc.text(`Week: ${week} (${weekLabel})`, 14, 48);

    // table body
    const body = [];
    SPARES_MASTER.forEach((grp) =>
      grp.items.forEach((item, idx) =>
        body.push([
          idx === 0 ? grp.slno : "",
          idx === 0 ? grp.equipment : "",
          item,
          quantities[`${grp.slno}_${item}`] || "",
        ])
      )
    );

    doc.autoTable({
      startY: 56,
      head: [["SL.NO", "Equipment", "Item", "Quantity"]],
      body,
      headStyles: { fillColor: THEME },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    // footer
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      `Site: ${targetUser?.siteName || ""} | ${monthNames[month]} ${year} | Week ${week} (${weekLabel})`,
      14,
      pageHeight - 10
    );

    doc.save(
      `Critical_Spares_WEEK-${week}_${targetUser?.siteName || "Site"}_${monthNames[month]}_${year}.pdf`
    );
  };

  return (
    <div className="d-flex">
      <DashboardSam />

      <div style={{ marginLeft: 260, width: "100%", paddingTop: 80 }}>
        <div style={{ position: "fixed", top: 0, left: 360, width: "calc(100% - 260px)", zIndex: 1000 }}>
          <Header />
        </div>

        <div className="container-fluid px-5 mt-4">
          {/* HEADER */}
          <div style={{ background: THEME, color: "#fff", padding: "22px", borderRadius: "14px" }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800 }}>
                  CRITICAL SPARE AVAILABILITY (WEEKLY)
                </h3>
                <div>
                  <b>SITE:</b> {targetUser?.siteName} | <b>MONTH:</b> {monthNames[month]} {year} |{" "}
                  <b>WEEK:</b> {week}
                </div>
              </div>

              <div className="d-flex" style={{ gap: 8 }}>
                <select
                  value={week}
                  onChange={(e) => setWeek(+e.target.value)}
                  className="form-select"
                  style={{ minWidth: 160 }}
                >
                  {weekBuckets(year, month).map((w) => (
                    <option key={w.week} value={w.week}>
                      Week {w.week} ({w.label})
                    </option>
                  ))}
                </select>

                <select
                  value={month}
                  onChange={(e) => setMonth(+e.target.value)}
                  className="form-select"
                >
                  {monthNames.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>

                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(+e.target.value)}
                  className="form-control"
                  style={{ width: 120 }}
                />
              </div>
            </div>
          </div>

          {loading && (
            <div style={{ marginTop: 10, color: THEME, fontWeight: 600 }}>
              Loading...
            </div>
          )}

          <table className="table table-bordered mt-3">
            <thead style={{ background: "#e0a1a1" }}>
              <tr>
                <th>SL.NO</th>
                <th>Equipment</th>
                <th>Item</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {SPARES_MASTER.map((grp) =>
                grp.items.map((item, idx) => {
                  const key = `${grp.slno}_${item}`;
                  return (
                    <tr key={key}>
                      <td>{idx === 0 ? grp.slno : ""}</td>
                      <td>{idx === 0 ? grp.equipment : ""}</td>
                      <td>{item}</td>
                      <td>
                        <input
                          className="form-control"
                          value={quantities[key] || ""}
                          onChange={(e) =>
                            setQuantities((p) => ({ ...p, [key]: e.target.value }))
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="text-center mb-5">
            <button className="btn btn-primary me-2" onClick={handleSave}>
              💾Save Report
            </button>
            <button className="btn btn-danger" onClick={downloadPDF}>
              📥Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriticalSpareAvailabilityWeeklyReport;
