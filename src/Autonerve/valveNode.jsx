import React from "react";
import "./ValveNode.css";

export default function ValveNode({ id, data, sendValveControlMessage }) {
  const { valveName, isOn, isPending, productId } = data;

  const toggleValve = () => {
    if (isPending) return;
    sendValveControlMessage(productId, [
      {
        valveId: id,
        valveName,
        status: !isOn ? "ON" : "OFF",
      },
    ]);
  };

  return (
    <div className="valve-node">
      <div className="valve-title">{valveName}</div>

      <label className="valve-switch">
        <input 
          type="checkbox" 
          checked={isOn} 
          disabled={isPending}
          onChange={toggleValve}
        />
        <span className="valve-slider"></span>
      </label>

      <div className={`valve-status ${isPending ? "pending" : isOn ? "on" : "off"}`}>
        {isPending ? "Pending…" : isOn ? "Open" : "Closed"}
      </div>
    </div>
  );
}
