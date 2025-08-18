import React, { useMemo } from "react";
import "./TankNode.css";

/**
 * data: {
 *   tankName?: string
 *   name?: string
 *   percentage?: number   // 0..100 only will be shown
 * }
 */
function TankNode({ id, data }) {
  const title = (data?.tankName ?? data?.name ?? id)?.toString();

  const raw = Number(data?.percentage);
  const valid = Number.isFinite(raw) && raw >= 0 && raw <= 100;
  const pct = valid ? raw : null;
  const clamped = valid ? Math.min(100, Math.max(0, raw)) : 0;

  // Horizontal gauge geometry
  const W = 120;            // total width (px)
  const H = 10;             // total height (px)
  const PAD = 1.5;          // inner padding
  const innerW = W - PAD * 2;
  const fillW = Math.round((clamped / 100) * innerW);

  const fillColor =
  clamped > 85 ? "red" :
  clamped > 40 ? "orange" :
  "green";

  return (
    <div className="tanknode" aria-label={`Tank ${title}`}>
      <div className="tanknode__title" title={title}>{title}</div>

      <div className="tanknode__row">
         <div className="tanknode__value">
          {pct !== null ? `${pct.toFixed(1)} %` : "—"}
        </div>
        <svg
          className="tanknode__hgauge"
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={valid ? `Level ${clamped.toFixed(1)} percent` : "Level unavailable"}
        >
          {/* Track */}
          <rect
            x="0.5" y="0.5" width={W - 1} height={H - 1}
            rx="5" ry="5"
            fill="none" stroke="#ddd"
          />
          {/* Fill */}
          <rect
            x={PAD} y={PAD} width={fillW} height={H - PAD * 2}
            rx="4" ry="4"
            fill={fillColor}
          />
        </svg>

       
      </div>
    </div>
  );
}

export default React.memo(TankNode);
