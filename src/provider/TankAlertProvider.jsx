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

const TankAlertContext = createContext(null);
export const useTankAlert = () => useContext(TankAlertContext);

const STORAGE_KEY = "eb_tank_alert_v1";

export default function TankAlertProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [alert, setAlert] = useState(null);

  // 1) Restore from localStorage
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
      console.warn("Failed to restore tank alert from storage:", err);
    }
  }, []);

  const persist = useCallback((nextVisible, nextAlert, extra = {}) => {
    try {
      const payload = {
        visible: nextVisible,
        alert: nextAlert,
        ...extra,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("Failed to persist tank alert:", err);
    }
  }, []);

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

  const closeAlert = useCallback(() => {
    setVisible(false);
    persist(false, alert, {
      dismissed: true,
      dismissedAt: Date.now(),
    });
  }, [alert, persist]);

  // 2) Listen to socket.io tankAlert event
  useEffect(() => {
    const socket = getSocket();
    console.log("[TankAlert] getSocket() returned:", socket);

    if (!socket) return;

    const handleTankAlert = (payload) => {
      console.log("[TankAlert] tankAlert event received:", payload);
      openAlert(payload);
    };

    socket.on("tankAlert", handleTankAlert);
    console.log("[TankAlert] Subscribed to tankAlert");

    return () => {
      console.log("[TankAlert] Unsubscribing tankAlert");
      socket.off("tankAlert", handleTankAlert);
    };
  }, [openAlert]);

  const value = useMemo(
    () => ({ visible, alert, openAlert, closeAlert }),
    [visible, alert, openAlert, closeAlert]
  );

  return (
    <TankAlertContext.Provider value={value}>
      {children}
    </TankAlertContext.Provider>
  );
}
