// src/TankAlertBanner.jsx
import React from "react";
import { useTankAlert } from "../provider/TankAlertProvider";

const bandTextMap = {
  critical_low: "Tank is critically low (< 5%). Immediate action required.",
  low_25: "Tank dropped around 25%. Please plan refilling.",
  high_85: "Tank is above 85%. Tank is almost full.",
  critical_high_95: "Tank is at / above 95%. Overflow risk!",
};

export default function TankAlertBanner() {
  const { visible, alert, closeAlert } = useTankAlert();
  console.log("TankAlertBanner render → visible:", visible, "alert:", alert);

  if (!visible || !alert) return null;

  const { tankName, percentage, band, userName, product_id } = alert;

  const pctText =
    typeof percentage === "number"
      ? `${percentage.toFixed(1)}%`
      : `${percentage}%`;

  const isCritical = band === "critical_low" || band === "critical_high_95";

  const badgeBg = isCritical ? "#b91c1c" : "#f97316";
  const borderColor = isCritical ? "#fecaca" : "#fed7aa";

  return (
    <div
      style={{
        position: "fixed",
        top: 16, // 🔼 move to top
        left: "50%", // 🔼 center horizontally
        transform: "translateX(-50%)",
        maxWidth: 420,
        width: "90%",
        background: "#111827",
        color: "#f9fafb",
        padding: "12px 16px",
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        border: `1px solid ${borderColor}`,
        zIndex: 9999,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "999px",
          background: badgeBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        !
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
          Tank level alert – {tankName || "Tank"}
        </div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>
          {bandTextMap[band] || "Tank level changed."} Current level:{" "}
          <strong>{pctText}</strong>.
        </div>
        {(userName || product_id) && (
          <div
            style={{
              fontSize: 11,
              marginTop: 6,
              opacity: 0.7,
            }}
          >
            {userName && <>Site: {userName}</>}{" "}
            {product_id && <>· Product ID: {product_id}</>}
          </div>
        )}
      </div>

      <button
        onClick={closeAlert}
        style={{
          border: "none",
          background: "transparent",
          color: "#9ca3af",
          cursor: "pointer",
          fontSize: 18,
          marginLeft: 4,
        }}
        aria-label="Close tank alert"
      >
        ×
      </button>
    </div>
  );
}
