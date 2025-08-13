
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import { API_URL } from "../../utils/apiConfig";

function PreviousData() {
  const { userData } = useSelector((state) => state.user);
  const actualUser = userData?.validUserOne || {};

  const [pumps, setPumps] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [from, setFrom] = useState(
    moment().subtract(6, "days").format("YYYY-MM-DD")
  ); // last 7 days
  const [to, setTo] = useState(moment().format("YYYY-MM-DD"));
  const [pumpId, setPumpId] = useState("ALL");

  const productID = actualUser?.productID;
  const selectedUserName =
    actualUser?.userType === "admin"
      ? sessionStorage.getItem("selectedUserId")
      : actualUser?.userName;
  console.log("selectedUserName:", selectedUserName);
  // Fetch pump list for filter (once user/product known)
  useEffect(() => {
    const fetchPumps = async () => {
      if (!productID || !selectedUserName) return;
      try {
        const { data } = await axios.get(
          `${API_URL}/api/runtime/pumps/${productID}/${selectedUserName}`
        );
        setPumps(data?.data || []);
      } catch (e) {
        console.error("Error fetching pumps:", e);
      }
    };
    fetchPumps();
  }, [productID, selectedUserName]);

  // Fetch history
  const fetchHistory = async () => {
    if (!productID || !selectedUserName || !from || !to) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        product_id: productID,
        userName: selectedUserName,
        from,
        to,
      });
      if (pumpId && pumpId !== "ALL") params.append("pumpId", pumpId);

      const { data } = await axios.get(
        `${API_URL}/api/runtime/history?${params.toString()}`
      );
      setRows(data?.data || []);
    } catch (e) {
      console.error("Error fetching history:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initial load with defaults

  const onApplyFilters = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const grouped = useMemo(() => {
    // group by date for display
    const byDate = {};
    for (const r of rows) {
      if (!byDate[r.date]) byDate[r.date] = [];
      byDate[r.date].push(r);
    }
    return byDate;
  }, [rows]);

  const downloadCSV = () => {
    if (!rows.length) return;
    const headers = [
      "Date",
      "Pump ID",
      "Pump Name",
      "Runtime (HH:MM:SS)",
      "Runtime (ms)",
    ];
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push(
        [r.date, r.pumpId, `"${r.pumpName}"`, r.runtime, r.totalRuntimeMs].join(
          ","
        )
      );
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `runtime_${selectedUserName}_${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 20, marginTop: 30 }}>
      <h3>Previous Data</h3>

      {/* Filters */}
      <form
        onSubmit={onApplyFilters}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(140px, 1fr))",
          gap: 12,
          alignItems: "end",
          marginBottom: 16,
        }}
      >
        <div>
          <label style={{ fontWeight: 600 }}>From</label>
          <input
            type="date"
            max={to}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="form-control"
          />
        </div>

        <div>
          <label style={{ fontWeight: 600 }}>To</label>
          <input
            type="date"
            min={from}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="form-control"
          />
        </div>

        <div>
          <label style={{ fontWeight: 600 }}>Pump</label>
          <select
            className="form-control"
            value={pumpId}
            onChange={(e) => setPumpId(e.target.value)}
          >
            <option value="ALL">All Pumps</option>
            {pumps.map((p) => (
              <option key={p.pumpId} value={p.pumpId}>
                {p.pumpName} ({p.pumpId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ backgroundColor: "#236a80", borderColor: "#236a80" }}
          >
            Apply
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={downloadCSV}
            className="btn btn-outline-secondary"
            disabled={!rows.length}
          >
            Download CSV
          </button>
        </div>
      </form>

      {/* Data */}
      {loading ? (
        <div className="text-center p-3">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="text-center p-3">
          No data found for the selected range.
        </div>
      ) : (
        Object.keys(grouped).map((d) => (
          <div key={d} style={{ marginBottom: 18 }}>
            <div
              style={{
                background: "#f3f7f9",
                padding: "8px 12px",
                fontWeight: 600,
                border: "1px solid #e1eef3",
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
              }}
            >
              {d}
            </div>
            <div className="table-responsive">
              <table
                className="table table-bordered"
                style={{ minWidth: 700, marginBottom: 0 }}
              >
                <thead style={{ backgroundColor: "#236a80", color: "#fff" }}>
                  <tr>
                    <th>SL.NO</th>
                    <th>Pump Name</th>
                    <th>Pump ID</th>
                    <th>Runtime (HH:MM:SS)</th>
                    <th>Runtime (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[d].map((r, idx) => (
                    <tr key={`${d}-${r.pumpId}`}>
                      <td>{idx + 1}</td>
                      <td>{r.pumpName}</td>
                      <td>{r.pumpId}</td>
                      <td>{r.runtime}</td>
                      <td>{r.totalRuntimeMs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
export default PreviousData;
