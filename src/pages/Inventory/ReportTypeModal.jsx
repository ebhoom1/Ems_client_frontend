

// src/components/ReportTypeModal.jsx
// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const overlayStyle = {
//   position: 'fixed',
//   top: 0, left: 0,
//   width: '100%', height: '100%',
//   backgroundColor: 'rgba(0,0,0,0.4)',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   zIndex: 1000
// };

// const boxStyle = {
//   background: '#fff',
//   padding: '20px',
//   borderRadius: '8px',
//   maxWidth: '400px',
//   width: '90%',
//   textAlign: 'center'
// };

// export default function ReportTypeModal({ equipmentId, equipmentName, onClose }) {
//   const nav = useNavigate();

//   const pick = (type) => {
//     onClose();
//     // Assuming /report/:type/:equipmentId is the path for single report views
//     nav(`/report/${type}/${equipmentId}`);
//   };

//   return (
//     <div style={overlayStyle}>
//       <div style={boxStyle}>
//         <h5>Select Report</h5>
//         <p><strong>{equipmentName}</strong></p>
//         <div className="d-grid gap-2">
//           <button
//             className="btn w-100 mb-2"
//             style={{ backgroundColor: '#236a80', color: '#fff' }}
//             onClick={() => pick('mechanical')}
//           >
//             Mechanical Report
//           </button>
//           <button
//             className="btn btn-outline-secondary w-100 mb-3"
//             onClick={() => pick('electrical')}
//           >
//             Electrical Report
//           </button>
//           {/* NEW: Button for Service Report */}
//           <button
//             className="btn w-100 mb-2"
//             style={{ backgroundColor: '#ffc107', color: '#000' }} // Example color
//             onClick={() => pick('service')}
//           >
//             Service Report
//           </button>
//           <button
//             className="btn btn-link text-danger"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// src/components/ReportTypeModal.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const boxStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  maxWidth: "400px",
  width: "90%",
  textAlign: "center",
};

export default function ReportTypeModal({ equipmentId, equipmentName, onClose }) {
  const nav = useNavigate();

  const pick = (type) => {
    onClose();
    nav(`/report/${type}/${equipmentId}`);
  };

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <h5>Select Report</h5>
        <p><strong>{equipmentName}</strong></p>
        <div className="d-grid gap-2">
          <button
            className="btn w-100 mb-2"
            style={{ backgroundColor: "#236a80", color: "#fff" }}
            onClick={() => pick("mechanical")}
          >
            Mechanical Report
          </button>
          <button
            className="btn btn-outline-secondary w-100 mb-2"
            onClick={() => pick("electrical")}
          >
            Electrical Report
          </button>
          {/* <button
            className="btn w-100 mb-2"
            style={{ backgroundColor: "#ffc107", color: "#000" }}
            onClick={() => pick("service")}
          >
            Service Report
          </button> */}
         
          <button
            className="btn btn-link text-danger"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
