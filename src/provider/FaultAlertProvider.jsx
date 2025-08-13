import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getSocket } from "../Autonerve/socketService"; // adjust import to your path
import { API_URL } from "../utils/apiConfig";

const FaultAlertContext = createContext(null);
export const useFaultAlert = () => useContext(FaultAlertContext);

const COOLDOWN_MS = 30_000;

export default function FaultAlertProvider({ children }) {
  const { userData, userType } = useSelector((s) => s.user);
  const isAdmin = userType === "admin" || userData?.userType === "admin";

  const [visible, setVisible] = useState(false);
  const [alertPayload, setAlertPayload] = useState(null); // store latest ack/feedback
  const cooldownUntilRef = useRef(0);
  const joiningDoneRef = useRef(false);

  const backendUrl = API_URL || "http://localhost:5555";
  const socketRef = useRef(null);

  const closeAlert = useCallback(() => {
    setVisible(false);
    cooldownUntilRef.current = Date.now() + COOLDOWN_MS;
  }, []);

  // Helper: decide if we should show alert now (checks cooldown)
  const maybeShowAlert = useCallback((payload) => {
    const now = Date.now();
    if (now < cooldownUntilRef.current) return; // in cooldown, ignore

    // Check if any pump has fault YES/true
    const pumps = Array.isArray(payload?.pumps) ? payload.pumps : [];
    const hasFault = pumps.some(
      (p) => String(p.fault).toUpperCase() === "YES" || p.fault === true || p.fault === 1
    );
    if (!hasFault) return;

    setAlertPayload(payload);
    setVisible(true);
  }, []);

  // Join all rooms that match adminType: fetch all USERS with same adminType as logged-in admin
  const joinAdminRooms = useCallback(async () => {
    if (!isAdmin) return;
    const adminType = userData?.validUserOne?.adminType;
    if (!adminType) return;

    try {
      
      const resp = await fetch(`${API_URL}/api/users/by-admin-type?adminType=${encodeURIComponent(adminType)}`);
      if (!resp.ok) throw new Error("Fetch users failed");
      const users = await resp.json();
      console.log("users:",users);
      // Filter to "user" accounts only and collect productIDs
      const productIds = [...new Set(
        (users || [])
          .filter((u) => u?.userType === "user" && u?.productID)
          .map((u) => String(u.productID))
      )];

      // Also include admin’s own productID if they have one (optional)
      const adminProd = String(userData?.validUserOne?.productID || "");
      if (adminProd) productIds.push(adminProd);

      // Dedupe
      const rooms = [...new Set(productIds)].filter(Boolean);

      if (rooms.length && socketRef.current?.connected) {
        rooms.forEach((pid) => socketRef.current.emit("joinRoom", pid));
        joiningDoneRef.current = true;
      }

      // On reconnect, we’ll re-join below
      socketRef.current?.off("reconnect");
      socketRef.current?.on("reconnect", () => {
        if (!rooms.length) return;
        rooms.forEach((pid) => socketRef.current.emit("joinRoom", pid));
      });
    } catch (e) {
      console.error("joinAdminRooms error:", e);
    }
  }, [isAdmin, userData]);

  // Boot socket (once)
  useEffect(() => {
    socketRef.current = getSocket(backendUrl);

    const handlePumpAck = (payload) => {
      // show global alert only for admins
      if (!isAdmin) return;
      maybeShowAlert(payload);
    };
    const handlePumpFeedback = (payload) => {
      if (!isAdmin) return;
      maybeShowAlert(payload);
    };

    socketRef.current.on("pumpAck", handlePumpAck);
    socketRef.current.on("pumpFeedback", handlePumpFeedback);

    return () => {
      socketRef.current?.off("pumpAck", handlePumpAck);
      socketRef.current?.off("pumpFeedback", handlePumpFeedback);
    };
  }, [backendUrl, isAdmin, maybeShowAlert]);

  // Join rooms after we know user is admin
  useEffect(() => {
    if (!isAdmin) return;
    if (!socketRef.current?.connected) {
      socketRef.current?.once("connect", () => {
        joinAdminRooms();
      });
    } else if (!joiningDoneRef.current) {
      joinAdminRooms();
    }
  }, [isAdmin, joinAdminRooms]);

  const value = useMemo(
    () => ({
      visible,
      alertPayload,
      closeAlert,
    }),
    [visible, alertPayload, closeAlert]
  );

  return (
    <FaultAlertContext.Provider value={value}>
      {children}
    </FaultAlertContext.Provider>
  );
}
