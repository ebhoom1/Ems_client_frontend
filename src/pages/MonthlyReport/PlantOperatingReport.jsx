import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardSam from "../Dashboard/DashboardSam";
import Header from "../Header/Hedaer";
import { fetchUsers } from "../../redux/features/userLog/userLogSlice";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URL } from "../../utils/apiConfig";
import jsPDF from "jspdf";
import "jspdf-autotable";
import genexlogo from "../../assests/images/logonewgenex.png";
import seal from "../../assests/images/seal.png";

const THEME = "#236a80";
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

const defaultParameters = [
  {
    parameter: "pH",
    unit: "---",
    rawResult: "",
    kspcbStandard: "6.5–9",
    treatedResult: "",
  },
  {
    parameter: "Total Suspended Solids (TSS)",
    unit: "mg/L",
    rawResult: "",
    kspcbStandard: "<20",
    treatedResult: "",
  },
  {
    parameter: "Biochemical Oxygen Demand (BOD)",
    unit: "mg/L",
    rawResult: "",
    kspcbStandard: "<10",
    treatedResult: "",
  },
  {
    parameter: "Chemical Oxygen Demand (COD)",
    unit: "mg/L",
    rawResult: "",
    kspcbStandard: "<50",
    treatedResult: "",
  },
  {
    parameter: "Total Nitrogen",
    unit: "mg/L",
    rawResult: "",
    kspcbStandard: "<10",
    treatedResult: "",
  },
  {
    parameter: "Ammonical Nitrogen",
    unit: "mg/L",
    rawResult: "",
    kspcbStandard: "<5",
    treatedResult: "",
  },
  {
    parameter: "Total Phosphorous as P",
    unit: "mg/L",
    rawResult: "",
    kspcbStandard: "<1",
    treatedResult: "",
  },
  {
    parameter: "Fecal Coliform",
    unit: "MPN/100ml",
    rawResult: "",
    kspcbStandard: "<100",
    treatedResult: "",
  },
];

const PlantOperatingReport = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((s) => s.userLog);
  const selectedUserId = useSelector((s) => s.selectedUser.userId);
  const isOperator = useSelector(
    (s) => s.user?.userData?.validUserOne?.userType === "operator"
  );

  const [clientName, setClientName] = useState("");
  const [utility, setUtility] = useState("STP");
  const [capacity, setCapacity] = useState("450 KLD");

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(`November ${new Date().getFullYear()}`);
  const [parameters, setParameters] = useState(defaultParameters);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const targetUser = useMemo(() => {
    return users.find((u) => u.userName === selectedUserId);
  }, [users, selectedUserId]);

  /* LOAD */
  useEffect(() => {
    if (!targetUser) return;

    axios
      .get(`${API_URL}/api/plant-operating/${targetUser.userName}/${month}`)
      .then((res) => {
        if (res.data?.parameters?.length) {
          setParameters(res.data.parameters);
        }
      });
  }, [targetUser, month]);

  const handleChange = (i, field, value) => {
    const updated = [...parameters];
    updated[i][field] = value;
    setParameters(updated);
  };

  const handleSave = async () => {
    Swal.fire({ title: "Saving...", allowOutsideClick: false });
    Swal.showLoading();

    await axios.post(`${API_URL}/api/plant-operating`, {
      userId: targetUser._id,
      userName: targetUser.userName,
      siteName: targetUser.companyName,
      clientName,
      utility,
      capacity,
      month,
      parameters,
    });

    Swal.close();
    Swal.fire("Saved", "Report saved successfully", "success");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    /* ---------- HEADER ---------- */
    doc.setFillColor(THEME);
    doc.rect(0, 0, 210, 28, "F");

    doc.addImage(genexlogo, "PNG", 12, 5, 18, 18);

    doc.setTextColor("#fff");
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PLANT OPERATING PARAMETERS", 105, 17, { align: "center" });

    doc.setTextColor("#000");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    /* ---------- META INFO ---------- */
    let y = 36;

    doc.text(`Client Name : ${clientName}`, 14, y);
    doc.text(`Utility : ${utility}`, 140, y);
    y += 6;

    doc.text(`Site : ${targetUser?.companyName}`, 14, y);
    doc.text(`Capacity : ${capacity}`, 140, y);
    y += 6;

    doc.text(`Month : ${month}`, 14, y);

    /* ---------- TABLE ---------- */
    const tableBody = parameters.map((p, i) => [
      i + 1,
      p.parameter,
      p.unit,
      p.rawResult,
      p.kspcbStandard,
      p.treatedResult,
    ]);

    doc.autoTable({
      startY: y + 6,
      head: [
        [
          "SL.NO",
          "PARAMETERS",
          "UNITS",
          "RAW RESULT",
          "KSPCB STANDARD",
          "TREATED RESULT",
        ],
      ],
      body: tableBody,
      styles: {
        fontSize: 9,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [35, 106, 128],
        textColor: 255,
        fontStyle: "bold",
      },
      margin: { left: 14, right: 14 },
    });

    /* ---------- REMARK ---------- */
    let finalY = doc.lastAutoTable.finalY + 10;

    if (finalY > 260) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(9);
    doc.text(
      "Remark: All values are in mg/L (ppm) except Turbidity & pH",
      14,
      finalY
    );

    /* ---------- SEAL & SIGNATURE ---------- */
    finalY += 15;

    doc.setFontSize(10);
    doc.text("Seal & Signature", 160, finalY, { align: "center" });

    doc.addImage(seal, "PNG", 145, finalY + 4, 70, 70);

    /* ---------- SAVE ---------- */
    doc.save(`Plant_Operating_Report_${targetUser?.companyName}_${month}.pdf`);
  };

  /* ---------- GET REPORT ---------- */
  useEffect(() => {
    if (!targetUser || !month) return;

    const fetchReport = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/plant-operating/${targetUser.userName}/${month}`
        );

        if (res.data) {
          setClientName(res.data.clientName || "");
          setUtility(res.data.utility || "STP");
          setCapacity(res.data.capacity || "");
          setParameters(
            res.data.parameters?.length
              ? res.data.parameters
              : defaultParameters
          );
        }
      } catch (err) {
        // No report exists → reset
        setClientName("");
        setUtility("STP");
        setCapacity("");
        setParameters(defaultParameters);
      }
    };

    fetchReport();
  }, [targetUser, month]);

  return (
    <div className="d-flex">
      {!isOperator && <DashboardSam />}

      <div
        style={{
          marginLeft: !isOperator ? 280 : 0,
          width: "100%",
          paddingTop: 80,
        }}
      >
        <div
          style={{
            marginLeft: !isOperator ? 55 : 0,
            width: "100%",
          }}
        >
          {!isOperator && <Header />}
        </div>

        <div className="container-fluid px-5 mt-4">
          <div
            style={{
              background: THEME,
              color: "#fff",
              padding: 22,
              borderRadius: 14,
            }}
          >
            <div className="row align-items-center">
              {/* LEFT : TITLES */}
              <div className="col-md-6">
                <h3 style={{ margin: 0, fontWeight: 800 }}>
                  PLANT OPERATING PARAMETERS
                </h3>
                <div style={{ marginTop: 6 }}>
                  <b>SITE:</b> {targetUser?.companyName}
                </div>
              </div>

              {/* RIGHT : CONTROLS */}
              <div className="col-md-6">
                <div className="row g-2">
                  {/* Client Name */}
                  <div className="col-md-6">
                    <label className="form-label mb-1 text-white">
                      Client Name
                    </label>
                    <input
                      className="form-control"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Client Name"
                    />
                  </div>

                  {/* Utility */}
                  <div className="col-md-3">
                    <label className="form-label mb-1 text-white">
                      Utility
                    </label>
                    <select
                      className="form-select"
                      value={utility}
                      onChange={(e) => setUtility(e.target.value)}
                    >
                      <option value="STP">STP</option>
                      <option value="ETP">ETP</option>
                      <option value="WTP">WTP</option>
                    </select>
                  </div>

                  {/* Capacity */}
                  <div className="col-md-3">
                    <label className="form-label mb-1 text-white">
                      Capacity
                    </label>
                    <input
                      className="form-control"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="e.g. 450 KLD"
                    />
                  </div>

                  {/* Month Selector */}
                  <div className="col-md-6">
                    <label className="form-label mb-1 text-white">Month</label>
                    <select
                      className="form-select"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      {monthNames.map((m, i) => (
                        <option key={i} value={`${m} ${year}`}>
                          {m} {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Selector */}
                  <div className="col-md-3">
                    <label className="form-label mb-1 text-white">Year</label>
                    <input
                      type="number"
                      className="form-control"
                      value={year}
                      onChange={(e) => setYear(+e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <table className="table table-bordered text-center mt-3">
            <thead style={{ background: "#ffd6d6" }}>
              <tr>
                <th rowSpan={2}>SL.NO</th>
                <th rowSpan={2}>PARAMETERS</th>
                <th colSpan={2}>RAW SEWAGE QUALITY</th>
                <th colSpan={2}>TREATED WATER QUALITY</th>
              </tr>
              <tr>
                <th>UNITS</th>
                <th>RESULTS</th>
                <th>KSPCB STANDARD</th>
                <th>RESULTS</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map((p, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{p.parameter}</td>
                  <td>{p.unit}</td>
                  <td>
                    <input
                      className="form-control"
                      value={p.rawResult}
                      onChange={(e) =>
                        handleChange(i, "rawResult", e.target.value)
                      }
                    />
                  </td>
                  <td>{p.kspcbStandard}</td>
                  <td>
                    <input
                      className="form-control"
                      value={p.treatedResult}
                      onChange={(e) =>
                        handleChange(i, "treatedResult", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-center my-4">
            <button
              className="btn text-white"
              style={{ background: THEME }}
              onClick={handleSave}
            >
              💾 Save Report
            </button>

            <button
              className="btn btn-secondary ms-2"
              onClick={handleDownloadPDF}
            >
              📥 Download PDF
            </button>
          </div>

          <div style={{ fontStyle: "italic" }}>
            Remark: All values are in mg/L (ppm) except Turbidity & pH
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantOperatingReport;
