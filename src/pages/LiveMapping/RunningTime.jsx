


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import { API_URL} from "../../utils/apiConfig";
import { io } from "socket.io-client";

const socket = io(API_URL);

function RunTime() {
  const { userData } = useSelector((state) => state.user);
  const actualUser = userData?.validUserOne || {};
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchRuntime = async () => {
      setLoading(true);
      try {
        const today = moment().format("YYYY-MM-DD");
  
        // If admin, override userName from sessionStorage
        const userName = actualUser.userType === "admin"
          ? sessionStorage.getItem("selectedUserId")
          : actualUser.userName;
  
        const productID = actualUser.productID;
  
        if (!userName || !productID) return;
  
        const response = await axios.get(
          `${API_URL}/api/runtime/${productID}/${userName}/${today}`
        );
  
        const records = response.data.data.map((item, index) => ({
          id: index + 1,
          pumpId: item.pumpId,
          instrument: item.pumpName,
          run: item.runtime,
          lastOnTime: item.lastOnTime || null
        }));
  
        setData(records);
      } catch (err) {
        console.error("Error fetching runtime:", err);
      } finally {
        setLoading(false);
      }
    };
  
    const userName = actualUser.userType === "admin"
      ? sessionStorage.getItem("selectedUserId")
      : actualUser.userName;
  
    const productID = actualUser.productID;
  
    if (userName && productID) {
      fetchRuntime();
  
      socket.emit("joinRoom", productID);
  
      socket.on("pumpRuntimeUpdate", (update) => {
        setData((prev) => {
          const existingIndex = prev.findIndex(p => p.pumpId === update.pumpId);
          const updatedRow = {
            id: existingIndex !== -1 ? prev[existingIndex].id : prev.length + 1,
            pumpId: update.pumpId,
            instrument: update.pumpName,
            run: update.runtime,
            lastOnTime: update.lastOnTime || null
          };
  
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = updatedRow;
            return updated;
          } else {
            return [...prev, updatedRow];
          }
        });
      });
  
      return () => {
        socket.off("pumpRuntimeUpdate");
        socket.disconnect();
      };
    }
  }, [actualUser]);
  

  // ⏱ Ticking timer
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev =>
        prev.map(row => {
          if (row.lastOnTime) {
            const start = moment(row.lastOnTime);
            const now = moment();
            const duration = moment.duration(now.diff(start));
            const h = String(Math.floor(duration.asHours())).padStart(2, "0");
            const m = String(duration.minutes()).padStart(2, "0");
            const s = String(duration.seconds()).padStart(2, "0");

            return { ...row, run: `${h}:${m}:${s}` };
          }
          return row;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px",marginTop:"30px" }}>
      <h3>Running Time</h3>

      <div
        className="table-responsive"
        style={{ maxHeight: "500px", overflowY: "auto" }}
      >
        {loading ? (
          <div className="text-center p-3">Loading...</div>
        ) : (
          <table className="table table-bordered" style={{ minWidth: "600px" }}>
            <thead style={{ backgroundColor: "#236a80", color: "#fff" }}>
              <tr>
                <th>SL.NO</th>
                <th>Instrument Name</th>
                <th>Running Time</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={row.pumpId || index}>
                    <td>{index + 1}</td>
                    <td>{row.instrument}</td>
                    <td style={{ color: row.lastOnTime ? "green" : "black" }}>
                      {row.run}
                      {row.lastOnTime && <span> (Live)</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No runtime data available for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button
          onClick={() => navigate("/previous-data")}
          style={{
            border: "1px solid green",
            background: "transparent",
            padding: "8px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "green",
            borderRadius: "10px",
          }}
        >
          Previous Data
          <FaArrowRight style={{ marginLeft: "8px" }} />
        </button>
      </div>
    </div>
  );
}

export default RunTime;
