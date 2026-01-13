import React from "react";
import "./FlowMeterNode.css";

export default function FlowMeterNode({ data }) {
  const title = data?.title || data?.stackName || "Flow Meter";

  const flowRate =
    typeof data?.flowRate === "number" ? data.flowRate.toFixed(2) : "--";

  const cumulatingFlow =
    typeof data?.cumulatingFlow === "number"
      ? data.cumulatingFlow.toFixed(2)
      : "--";

  return (
    <div className="flowmeter-node">
      <div className="flowmeter-title">{title}</div>

      <div className="flowmeter-row">
        <span className="k">Flow Rate:</span>
        <span className="v">{flowRate}</span>
      </div>

      <div className="flowmeter-row">
        <span className="k">cumulatingFlow:</span>
        <span className="v">{cumulatingFlow}</span>
      </div>

      {/* <div className="flowmeter-meta">
        {data?.lastUpdated ? "Live" : "Waiting…"}
      </div> */}
    </div>
  );
}
