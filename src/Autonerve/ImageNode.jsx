// import React from 'react';
// import { Handle, Position } from 'reactflow';

// function ImageNode({ data }) {
//   return (
//     <div style={{  borderRadius: '5px', padding: '5px', background: '#fff' }}>
//       <img src={data.filePath} alt={data.name} style={{ maxWidth: '200px', display: 'block' }} />
//       <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '5px', fontWeight: 'bold' }}>
//         {data.name}
//       </div>
//     </div>
//   );
// }

// export default ImageNode;

// src/components/ImageNode.jsx
import React from "react";

function ImageNode({ data }) {
  // Remove border completely for Expo image
  const isExpo = data.name?.toLowerCase().includes("expo");

  return (
    <div
      style={{
        borderRadius: "5px",
        padding: isExpo ? "0px" : "5px",
        background: isExpo ? "transparent" : "#fff",
        boxShadow: isExpo ? "none" : "0 0 3px rgba(0,0,0,0.1)",
      }}
    >
      <img
        src={data.filePath}
        alt={data.name}
        style={{
          maxWidth: isExpo ? "100px" : "200px",
          display: "block",
          margin: "auto",
        }}
      />
      {!isExpo && (
        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            marginTop: "5px",
            fontWeight: "bold",
          }}
        >
          {data.name}
        </div>
      )}
    </div>
  );
}

export default ImageNode;
