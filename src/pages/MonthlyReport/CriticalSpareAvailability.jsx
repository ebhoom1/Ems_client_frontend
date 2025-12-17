

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
import seal from "../../assests/images/seal.png";

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

const CriticalSpareAvailability = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((s) => s.user);
  const selectedUserId = useSelector((s) => s.selectedUser.userId);
  const { users } = useSelector((s) => s.userLog);

  const isOperator = userData?.validUserOne?.userType === "operator";

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);

  /* ---------- USERS ---------- */
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

  /* ---------- GET REPORT ---------- */
  useEffect(() => {
    if (!targetUser) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_URL}/api/critical-spares/${targetUser.userName}/${year}/${month + 1}`
        );

        const map = {};
        res.data.spares.forEach((s) => {
          const grp = SPARES_MASTER.find((g) => g.equipment === s.equipment);
          if (!grp) return;
          const key = `${grp.slno}_${s.item}`;
          map[key] = s.quantity;
        });

        setQuantities(map);
      } catch {
        setQuantities({}); // no report yet
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [targetUser, year, month]);

  /* ---------- SAVE ---------- */
 const handleSave = async () => {
  if (!targetUser) {
    Swal.fire("Select Site", "Please select a site", "warning");
    return;
  }

  try {
    setLoading(true);

    // ✅ SAFE loading alert
    Swal.fire({
      title: "Saving Report",
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

const res=await axios.post(`${API_URL}/api/critical-spares`, {
  userId: targetUser.userId,
  userName: targetUser.userName,
  siteName: targetUser.siteName,
  year,
  month: month + 1,
  spares: sparesPayload,   // ✅ correct shape
});
console.log("Save response:", res.data);
    // ✅ CLOSE loading first
    Swal.close();

    // ✅ THEN show success
    Swal.fire({
      icon: "success",
      title: "Saved Successfully",
      text: "Critical Spare Availability saved",
      timer: 1800,
      showConfirmButton: false,
    });

  } catch (err) {
    Swal.close();
    Swal.fire("Error", "Save failed", "error");
  } finally {
    setLoading(false);
  }
};

  /* ---------- PDF ---------- */
  const downloadPDF = () => {
  const doc = new jsPDF();

  /* ---------- HEADER ---------- */
  doc.setFillColor(THEME);
  doc.rect(0, 0, 210, 30, "F");

  doc.addImage(genexlogo, "PNG", 12, 6, 18, 18);

  doc.setTextColor("#fff");
  doc.setFontSize(14);
  doc.text("Critical Spare Availability Report", 105, 18, { align: "center" });

  /* ---------- TABLE DATA ---------- */
  doc.setTextColor("#000");

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
    startY: 40,
    head: [["SL.NO", "Equipment", "Item", "Quantity"]],
    body,
    headStyles: { fillColor: THEME },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  /* ---------- SEAL & SIGNATURE (ALWAYS AT END) ---------- */
  /* ---------- SEAL & SIGNATURE (ALWAYS AT END) ---------- */
let finalY = doc.lastAutoTable.finalY + 20;

// If not enough space, move to new page
if (finalY > 240) {
  doc.addPage();
  finalY = 40;
}

// 🔹 TEXT FIRST
doc.setFontSize(10);
doc.setTextColor(0);
doc.text("Seal & Signature", 177.5, finalY, { align: "center" });

// 🔹 SEAL BELOW TEXT
const SEAL_WIDTH = 65;
const SEAL_HEIGHT = 65;
const SEAL_X = 150; // left position

doc.addImage(
  seal,
  "PNG",
  SEAL_X,
  finalY,          // 👈 gap below text
  SEAL_WIDTH,
  SEAL_HEIGHT
);

  

  /* ---------- FOOTER (OPTIONAL) ---------- */
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    `Site: ${targetUser?.siteName} | ${monthNames[month]} ${year}`,
    14,
    290
  );

  /* ---------- SAVE ---------- */
  doc.save(
    `Critical_Spares_${targetUser?.siteName}_${monthNames[month]}_${year}.pdf`
  );
};


  /* ---------- UI ---------- */
  return (
    <div className="d-flex">
      {!isOperator && <DashboardSam />}

      <div style={{ marginLeft: !isOperator ? 260 : 0, width: "100%", paddingTop: 80 }}>
        {!isOperator && (
          <div style={{ position: "fixed", top: 0, left: 360, width: "calc(100% - 260px)", zIndex: 1000 }}>
            <Header />
          </div>
        )}

        <div className="container-fluid px-5 mt-4">
         {/* HEADER */}
          <div
            style={{
              background: THEME,
              color: "#fff",
              padding: "22px",
              borderRadius: "14px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 style={{ margin: 0, fontWeight: 800 }}>
                  CRITICAL SPARE AVAILABILITY
                </h3>
                <div>
                  <b>SITE:</b> {targetUser?.siteName} |{" "}
                  <b>MONTH:</b> {monthNames[month]} {year}
                </div>
              </div>

              <div className="d-flex">
                <select
                  value={month}
                  onChange={(e) => setMonth(+e.target.value)}
                  className="form-select me-2"
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

          <table className="table table-bordered mt-3">
            <thead style={{ background: "#e0a1a1" }}>
              <tr><th>SL.NO</th><th>Equipment</th><th>Item</th><th>Quantity</th></tr>
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
            <button className="btn btn-primary me-2" onClick={handleSave}>💾Save Report</button>
            <button className="btn btn-danger" onClick={downloadPDF}>📥Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriticalSpareAvailability;
