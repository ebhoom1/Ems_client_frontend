

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { API_URL } from "../../utils/apiConfig";
// import { toast } from "react-toastify";

// const overlayStyle = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   width: "100%",
//   height: "100%",
//   backgroundColor: "rgba(0,0,0,0.4)",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   zIndex: 1000,
// };

// const boxStyle = {
//   background: "#fff",
//   padding: "20px",
//   borderRadius: "8px",
//   maxWidth: "400px",
//   width: "90%",
// };

// export default function MaintenanceTypeModal({
//   equipmentId,
//   equipmentName,
//   equipmentUserName,
//   onClose,
// }) {
//   const navigate = useNavigate();

//   const { validUserOne = {} } = useSelector(
//     (state) => state.user.userData || {}
//   );
//   const { isTechnician, isTerritorialManager } = validUserOne;

//   const [loading, setLoading] = useState(true);
//   const [canMechanical, setCanMechanical] = useState(false);
//   const [canElectrical, setCanElectrical] = useState(false);

//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const { data } = await axios.get(
//           `${API_URL}/api/equiment/${equipmentId}/maintenance-status`
//         );
//         setCanMechanical(data.canMechanical);
//         setCanElectrical(data.canElectrical);
//       } catch (err) {
//         console.error("Failed to fetch maintenance status", err);
//         toast.error("Failed to load maintenance status.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStatus();
//   }, [equipmentId]);

//   const pick = (type) => {
//     onClose(); // Close modal first
//     const path = `/maintenance/${type}/${equipmentId}`;
//     navigate(path, {
//       state: { equipmentName, equipmentId, equipmentUserName },
//     });
//   };


//   return (
//     <div style={overlayStyle}>
//       <div style={boxStyle}>
//         <h5>
//           Select Maintenance Type for: <strong>{equipmentName}</strong>
//         </h5>
//         <div className="d-grid gap-2">
//           {/* Territorial Managers */}
//           {isTerritorialManager && (
//             <>
//               <button
//                 className="btn"
//                 style={{ backgroundColor: "#236a80", color: "#fff" }}
//                 onClick={() => pick("mechanical")}
//               >
//                 Monthly Mechanical Maintenance
//               </button>
//               <button
//                 className="btn"
//                 style={{ backgroundColor: "#ffc107", color: "#000" }}
//                 onClick={() => pick("service")}
//               >
//                 Service Report
//               </button>
             
//             </>
//           )}

//           {/* Technicians */}
//           {isTechnician && (
//             <>
//               {canElectrical ? (
//                 <button
//                   className="btn"
//                   style={{ backgroundColor: "#236a80", color: "#fff" }}
//                   onClick={() => pick("electrical")}
//                 >
//                   Monthly Electrical Maintenance
//                 </button>
//               ) : (
//                 <button className="btn btn-outline-secondary" disabled>
//                   Electrical Already Done This Month
//                 </button>
//               )}
//               <button
//                 className="btn"
//                 style={{ backgroundColor: "#ffc107", color: "#000" }}
//                 onClick={() => pick("service")}
//               >
//                 Service Report
//               </button>
             
//             </>
//           )}

//           <button className="btn btn-link text-danger" onClick={onClose}>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/Inventory/MaintenanceTypeModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { API_URL } from "../../utils/apiConfig";
import { toast } from "react-toastify";
import { FaCheckCircle, FaEdit } from "react-icons/fa";

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
};

export default function MaintenanceTypeModal({
  equipmentId,
  equipmentName,
  equipmentUserName,
  onClose,
}) {
  const navigate = useNavigate();
  const { validUserOne = {} } = useSelector(
    (state) => state.user.userData || {}
  );
  const { isTechnician, isTerritorialManager } = validUserOne;

  const [loading, setLoading] = useState(true);
  const [hasMechanical, setHasMechanical] = useState(false);
  const [hasElectrical, setHasElectrical] = useState(false);
  const [hasService, setHasService] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/equiment/${equipmentId}/maintenance-status`
        );
        console.log("response status:",data);
        setHasMechanical(data.hasMechanical);
        setHasElectrical(data.hasElectrical);
        setHasService(data.hasService);
      } catch (err) {
        console.error("Failed to fetch maintenance status", err);
        toast.error("Failed to load maintenance status.");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [equipmentId]);

  const pick = (type, action = "add") => {
    onClose();
    const path =
      action === "edit"
        ? `/report/${type}/edit/${equipmentId}`
        : `/maintenance/${type}/${equipmentId}`;
    navigate(path, {
      state: { equipmentName, equipmentId, equipmentUserName },
    });
  };

  if (loading) {
    return (
      <div style={overlayStyle}>
        <div style={boxStyle}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <h5>
          Select Maintenance Type for: <strong>{equipmentName}</strong>
        </h5>
        <div className="d-grid gap-2">
          {/* Territorial Managers */}
          {isTerritorialManager && (
            <>
              <button
                className="btn d-flex justify-content-between align-items-center"
                style={{ backgroundColor: "#236a80", color: "#fff" }}
                onClick={() => pick("mechanical")}
              >
                Add Mechanical Report
                <span>
                  {hasMechanical && <FaCheckCircle color="limegreen" />}
                  {/* {hasMechanical && (
                    <FaEdit
                      className="ms-2"
                      color="white"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        pick("mechanical", "edit");
                      }}
                    />
                  )} */}
                </span>
              </button>

              <button
                className="btn d-flex justify-content-between align-items-center"
                style={{ backgroundColor: "#ffc107", color: "#000" }}
                onClick={() => pick("service")}
              >
                Add Service Report
                <span>
                  {hasService && <FaCheckCircle color="limegreen" />}
                  {/* {hasService && (
                    <FaEdit
                      className="ms-2"
                      color="black"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        pick("service", "edit");
                      }}
                    />
                  )} */}
                </span>
              </button>
            </>
          )}

          {/* Technicians */}
          {isTechnician && (
            <>
              <button
                className="btn d-flex justify-content-between align-items-center"
                style={{ backgroundColor: "#236a80", color: "#fff" }}
                onClick={() => pick("electrical")}
              >
                Add Electrical Report
                <span>
                  {hasElectrical && <FaCheckCircle color="limegreen" />}
                  {/* {hasElectrical && (
                    <FaEdit
                      className="ms-2"
                      color="white"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        pick("electrical", "edit");
                      }}
                    />
                  )} */}
                </span>
              </button>

              <button
                className="btn d-flex justify-content-between align-items-center"
                style={{ backgroundColor: "#ffc107", color: "#000" }}
                onClick={() => pick("service")}
              >
                Add Service Report
                <span>
                  {hasService && <FaCheckCircle color="limegreen" />}
                  {/* {hasService && (
                    <FaEdit
                      className="ms-2"
                      color="black"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        pick("service", "edit");
                      }}
                    />
                  )} */}
                </span>
              </button>
            </>
          )}

          <button className="btn btn-link text-danger" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
