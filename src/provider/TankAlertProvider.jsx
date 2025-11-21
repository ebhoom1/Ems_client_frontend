// src/provider/TankAlertProvider.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSocket } from "../Autonerve/socketService";
import { API_URL } from "../utils/apiConfig";


const TankAlertContext = createContext(null);
export const useTankAlert = () => useContext(TankAlertContext);

const STORAGE_KEY = "eb_tank_alert_v1";
  const backendUrl = API_URL || "http://localhost:5555";


export default function TankAlertProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [alert, setAlert] = useState(null);

  // 1) Restore from localStorage on load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw);

      if (saved && saved.alert && saved.visible && !saved.dismissed) {
        setAlert(saved.alert);
        setVisible(true);
      }
    } catch (err) {
      console.warn("[TankAlert] Failed to restore from storage:", err);
    }
  }, []);

  // Helper to persist state
  const persist = useCallback((nextVisible, nextAlert, extra = {}) => {
    try {
      const payload = {
        visible: nextVisible,
        alert: nextAlert,
        ...extra,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("[TankAlert] Failed to persist:", err);
    }
  }, []);

  // 2) Open alert when a NEW alert arrives
  const openAlert = useCallback(
    (alertPayload) => {
      setAlert(alertPayload);
      setVisible(true);
      persist(true, alertPayload, {
        dismissed: false,
        updatedAt: Date.now(),
      });
    },
    [persist]
  );

  // 3) Close alert when user clicks ×
  const closeAlert = useCallback(() => {
    setVisible(false);
    persist(false, alert, {
      dismissed: true,
      dismissedAt: Date.now(),
    });
  }, [alert, persist]);

  // 4) Subscribe to socket.io event from backend
  useEffect(() => {
    const socket = getSocket(backendUrl);
    console.log("[TankAlert] getSocket() returned:", socket);

    if (!socket) {
      console.warn("[TankAlert] No socket instance yet – make sure initSocket() is called in App");
      return;
    }

    const handleTankAlert = (payload) => {
      console.log("[TankAlert] 'tankAlert' event received:", payload);
      openAlert(payload);
    };

    socket.on("tankAlert", handleTankAlert);
    console.log("[TankAlert] Subscribed to 'tankAlert'");

    return () => {
      console.log("[TankAlert] Unsubscribing from 'tankAlert'");
      socket.off("tankAlert", handleTankAlert);
    };
  }, [openAlert]);

  const value = useMemo(
    () => ({
      visible,
      alert,
      openAlert,
      closeAlert,
    }),
    [visible, alert, openAlert, closeAlert]
  );

  return (
    <TankAlertContext.Provider value={value}>
      {children}
    </TankAlertContext.Provider>
  );
}
