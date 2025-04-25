

import React from 'react';

export default function PipingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data = {},

}) {
  let sourceHandle = data.sourceHandle;
  let targetHandle = data.targetHandle;

 
  // Then run your existing logic
  let path = '';
  const dx = Math.abs(targetX - sourceX);
  const dy = Math.abs(targetY - sourceY);

  if (dy < 10) {
    path = `M${sourceX},${sourceY} L${targetX},${targetY}`;
  } else if (dx < 10) {
    path = `M${sourceX},${sourceY} L${targetX},${targetY}`;
  } else if (sourceHandle === 'right' && targetHandle === 'bottom') {
    const midX = sourceX + 40;
    const midY = targetY - 40;
    path = `M${sourceX},${sourceY} L${midX},${sourceY} L${midX},${targetY} L${targetX},${targetY}`;
  } else if (sourceHandle === 'bottom' && targetHandle === 'right') {
    const midY = sourceY + 40;
    const midX = targetX - 40;
    path = `M${sourceX},${sourceY} L${sourceX},${midY} L${targetX},${midY} L${targetX},${targetY}`;
  } else if (sourceHandle === 'bottom' && targetHandle === 'top') {
    const midY = (sourceY + targetY) / 2;
    path = `M${sourceX},${sourceY} L${sourceX},${midY} L${targetX},${midY} L${targetX},${targetY}`;
  } else if (sourceHandle === 'top' && targetHandle === 'bottom') {
    const midY = (sourceY + targetY) / 2;
    path = `M${sourceX},${sourceY} L${sourceX},${midY} L${targetX},${midY} L${targetX},${targetY}`;
  } else {
    const midX = (sourceX + targetX) / 2;
    path = `M${sourceX},${sourceY} L${midX},${sourceY} L${midX},${targetY} L${targetX},${targetY}`;
  }

  return (
    <>
      <svg style={{ height: 0, width: 0 }}>
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0,0 10,5 0,10" fill="#0074D9" />
          </marker>
        </defs>
      </svg>

      <path
        id={id}
        d={path}
        stroke="#0074D9"
        strokeWidth={3}
        fill="none"
        markerEnd="url(#arrowhead)"
        
      />
    </>
  );
}


