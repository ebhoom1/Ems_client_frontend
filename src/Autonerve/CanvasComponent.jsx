

// import React, {
//   useCallback,
//   useRef,
//   useState,
//   useMemo,
//   useEffect,
// } from "react";
// import ReactFlow, {
//   Controls,
//   Background,
//   addEdge,
//   useNodesState,
//   useEdgesState,
// } from "reactflow";
// import "reactflow/dist/style.css";
// import "./CanvasComponent.css";
// import { useSelector } from "react-redux";
// import io from "socket.io-client";

// import PumpBlowerNode from "./PumpBlowerNode";
// import ImageNode from "./ImageNode";
// import PdfNode from "./PdfNode";
// import { API_URL } from "../utils/apiConfig";
// import screenfull from "screenfull";
// import { BiFullscreen } from "react-icons/bi";
// import { getSocket } from "./socketService";

// function CanvasComponent({
//   selectedStationName,
//   onStationNameChange,
//   isEditMode,
//   onToggleEditMode,
//   onStationDeleted,
// }) {
//   const reactFlowWrapper = useRef(null);
//   const canvasContainerRef = useRef(null);

//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [reactFlowInstance, setReactFlowInstance] = useState(null);
//   const [uploadedFiles, setUploadedFiles] = useState(new Map());
//   const [realtimePumpData, setRealtimePumpData] = useState({});
//   const [pendingPumps, setPendingPumps] = useState({});

//   const [messageBox, setMessageBox] = useState({
//     isVisible: false,
//     message: "",
//     onConfirm: null,
//   });

//   const showMessageBox = (message, onConfirm = null) => {
//     setMessageBox({ isVisible: true, message, onConfirm });
//   };
//   const hideMessageBox = () => {
//     setMessageBox({ isVisible: false, message: "", onConfirm: null });
//   };

//   const { userData } = useSelector((state) => state.user);
//   const productId = String(userData?.validUserOne?.productID || "");
//   console.log("productId:", productId);
//   const socket = useRef(null);
//   const backendUrl = API_URL || "http://localhost:5555";

//   // useEffect(() => {
//   //   socket.current = io(backendUrl);
//   //   socket.current.on("connect", () => {
//   //     console.log("Socket.IO connected to backend:", socket.current.id);
//   //   });
//   //   socket.current.on("disconnect", () => {
//   //     console.log("Socket.IO disconnected");
//   //   });
//   //   socket.current.on("pumpFeedback", (payload) => {
//   //     console.log("Processing pump feedback:", payload);
//   //     const newRealtimeData = {};
//   //     payload.pumps.forEach((p) => {
//   //       newRealtimeData[p.pumpId] = p; // Store the entire pump object by its ID
//   //       setPendingPumps((prev) => ({ ...prev, [p.pumpId]: false }));
//   //     });
//   //     setRealtimePumpData((prevData) => ({
//   //       ...prevData,
//   //       ...newRealtimeData,
//   //     }));
//   //     setNodes((nds) =>
//   //       nds.map((node) => {
//   //         if (node.id === payload.pumpData.pumpId) {
//   //           return {
//   //             ...node,
//   //             data: { ...node.data, isOn: payload.pumpData.status === "ON" },
//   //           };
//   //         }
//   //         return node;
//   //       })
//   //     );
//   //   });

//   //   socket.current.on("pumpAck", (payload) => {
//   //     console.log("Processing pump acknowledgment:", payload);
//   //     const newRealtimeData = {};
//   //     payload.pumps.forEach((p) => {
//   //       newRealtimeData[p.pumpId] = p; // Store the entire pump object by its ID
//   //       setPendingPumps((prev) => ({ ...prev, [p.pumpId]: false }));
//   //     });
//   //     setRealtimePumpData((prevData) => ({
//   //       ...prevData,
//   //       ...newRealtimeData,
//   //     }));
//   //     setNodes((nds) =>
//   //       nds.map((node) => {
//   //         const updatedPump = payload.pumps.find((p) => p.pumpId === node.id);
//   //         if (updatedPump) {
//   //           return {
//   //             ...node,
//   //             data: {
//   //               ...node.data,
//   //               isOn: updatedPump.status === 1 || updatedPump.status === "ON",
//   //             },
//   //           };
//   //         }
//   //         return node;
//   //       })
//   //     );
//   //   });
//   //   socket.current.on("stackDataUpdate", (payload) => {
//   //     /* ... */
//   //   });
//   //   socket.current.on("data", (payload) => {
//   //     /* ... */
//   //   });
//   //   return () => {
//   //     if (socket.current) {
//   //       socket.current.disconnect();
//   //     }
//   //   };
//   // }, [backendUrl, setNodes, setPendingPumps, setRealtimePumpData]);

//   useEffect(() => {
//     socket.current = getSocket(backendUrl);

//      const handlePumpFeedback = (payload) => {
//       console.log("Processing pump feedback:", payload);
//       
//       // Check if pumpData is a valid object
//       if (!payload || typeof payload.pumpData !== 'object' || payload.pumpData === null) {
//         console.error("Invalid pumpFeedback payload received:", payload);
//         return;
//       }

//       const { pumpId, status } = payload.pumpData;

//       // Update realtimePumpData for the single pump
//       setRealtimePumpData((prevData) => ({
//         ...prevData,
//         [pumpId]: { ...payload.pumpData }, // Store the individual pump data
//       }));
//       
//       // Reset pending state for the single pump
//       setPendingPumps((prev) => ({ ...prev, [pumpId]: false }));

//       // Update the node's `isOn` status
//       setNodes((nds) =>
//         nds.map((node) => {
//           if (node.id === pumpId) {
//             return {
//               ...node,
//               data: { ...node.data, isOn: status === "ON" },
//             };
//           }
//           return node;
//         })
//       );
//     };

//     const handlePumpAck = (payload) => {
//       console.log("Processing pump acknowledgment:", payload);
//       const newRealtimeData = {};
//       payload.pumps.forEach((p) => {
//         newRealtimeData[p.pumpId] = p;
//         setPendingPumps((prev) => ({ ...prev, [p.pumpId]: false }));
//       });
//       setRealtimePumpData((prevData) => ({ ...prevData, ...newRealtimeData }));
//       setNodes((nds) =>
//         nds.map((node) => {
//           const updatedPump = payload.pumps.find((p) => p.pumpId === node.id);
//           if (updatedPump) {
//             return {
//               ...node,
//               data: {
//                 ...node.data,
//                 isOn: updatedPump.status === 1 || updatedPump.status === "ON",
//               },
//             };
//           }
//           return node;
//         })
//       );
//     };

//     socket.current.on("connect", () => {
//       console.log("Socket.IO connected:", socket.current.id);
//       if (productId) socket.current.emit("joinRoom", productId);
//     });

//     socket.current.on("pumpFeedback", handlePumpFeedback);
//     socket.current.on("pumpAck", handlePumpAck);

//     socket.current.on("reconnect", () => {
//       console.log("Reconnected to server");
//       if (productId) socket.current.emit("joinRoom", productId);
//     });

//     return () => {
//       socket.current.off("pumpFeedback", handlePumpFeedback);
//       socket.current.off("pumpAck", handlePumpAck);
//     };
//   }, [backendUrl, productId, setNodes, setPendingPumps, setRealtimePumpData]);

//   useEffect(() => {
//     if (productId) {
//       console.log(
//         `[FRONTEND] Attempting to join room with productId: ${productId}`
//       );
//       socket.current.emit("joinRoom", productId);
//     }
//   }, [productId]);

//   // const sendPumpControlMessage = useCallback((prodId, pumps) => {
//   //   if (socket.current && socket.current.connected) {
//   //      // Set the pending status for the sent pumps
//   //     const newPendingState = {};
//   //           const optimisticUpdate = {};
//   //     pumps.forEach(p => {
//   //       newPendingState[p.pumpId] = true;
//   //     });
//   //     setPendingPumps(prev => ({ ...prev, ...newPendingState }));
//   //     socket.current.emit("controlPump", { product_id: prodId, pumps });
//   //   } else {
//   //     console.error("Socket.IO client not connected. Cannot send command.");
//   //     showMessageBox("Connection error: Cannot send command. Please refresh.");
//   //   }
//   // }, []);
//   const sendPumpControlMessage = useCallback(
//     (prodId, pumps) => {
//       if (socket.current && socket.current.connected) {
//         // Set the pending status for the sent pumps
//         const newPendingState = {};
//         const optimisticUpdate = {};

//         pumps.forEach((p) => {
//           newPendingState[p.pumpId] = true;
//           // Find the current status of the pump to toggle it optimistically
//           const nodeToToggle = nodes.find((n) => n.id === p.pumpId);
//           if (nodeToToggle) {
//             optimisticUpdate[p.pumpId] = !nodeToToggle.data.isOn;
//           }
//         });
//         setPendingPumps((prev) => ({ ...prev, ...newPendingState }));

//         // Optimistically update the `isOn` status of the node
//         setNodes((nds) =>
//           nds.map((node) => {
//             if (optimisticUpdate.hasOwnProperty(node.id)) {
//               return {
//                 ...node,
//                 data: {
//                   ...node.data,
//                   isOn: optimisticUpdate[node.id],
//                 },
//               };
//             }
//             return node;
//           })
//         );

//         socket.current.emit("controlPump", { product_id: prodId, pumps });
//       } else {
//         console.error("Socket.IO client not connected. Cannot send command.");
//         showMessageBox(
//           "Connection error: Cannot send command. Please refresh."
//         );
//       }
//     },
//     [nodes]
//   );

//   const nodeTypes = useMemo(
//     () => ({
//       pumpBlowerNode: (props) => (
//         <PumpBlowerNode
//           {...props}
//           setNodes={setNodes}
//           sendPumpControlMessage={sendPumpControlMessage}
//           data={{
//             ...props.data,
//             productId: productId,
//             isEditMode,
//             realtimeValues: realtimePumpData[props.id],
//             // isPending: pendingPumps[props.id] || false // Pass the pending status
//             isPending: pendingPumps.hasOwnProperty(props.id)
//               ? pendingPumps[props.id]
//               : props.data.isPending || false,
//           }}
//         />
//       ),
//       imageNode: ImageNode,
//       pdfNode: PdfNode,
//     }),
//     [
//       setNodes,
//       sendPumpControlMessage,
//       productId,
//       isEditMode,
//       realtimePumpData,
//       pendingPumps,
//     ]
//   );

//   const onConnect = useCallback(
//     (params) => setEdges((eds) => addEdge(params, eds)),
//     [setEdges]
//   );

//   const loadStation = useCallback(
//     async (name) => {
//       if (!name) return;
//       try {
//         const response = await fetch(
//           `${API_URL}/api/find-live-station/${userData.validUserOne.userName}/${name}`
//         );
//         const result = await response.json();
//         console.log("selected station:", result);

//         if (response.ok) {
//           const pumpStatesResponse = await fetch(
//             `${API_URL}/api/pump-states/${productId}`
//           );
//           const pumpStatesData = await pumpStatesResponse.json();
//           console.log("pumpStatesData:", pumpStatesData); // <-- This is the new console log you requested

//           const pumpStatusMap = new Map();
//           const pendingStatusMap = new Map();

//           pumpStatesData.forEach((state) => {
//             pumpStatusMap.set(state.pumpId, state.status);
//             pendingStatusMap.set(state.pumpId, state.pending);
//           });

//           const newPendingPumps = {};
//           pumpStatesData.forEach((state) => {
//             newPendingPumps[state.pumpId] = state.pending;
//           });
//           setPendingPumps(newPendingPumps);

//           const updatedNodes = result.data.nodes.map((node) => {
//             if (node.type === "pumpBlowerNode") {
//               const isPending = pendingStatusMap.get(node.id) || false;
//               const isOn = pumpStatusMap.get(node.id) || false;

//               return {
//                 ...node,
//                 data: {
//                   ...node.data,
//                   isOn: isOn,
//                   isPending: isPending,
//                 },
//               };
//             }
//             return node;
//           });

//           setNodes(updatedNodes);
//           setEdges(result.data.edges);
//           onStationNameChange(result.data.stationName);
//           if (reactFlowInstance) {
//             reactFlowInstance.setViewport(result.data.viewport, {
//               duration: 800,
//             });
//           }
//         } else {
//           showMessageBox(`Error loading station: ${result.message}`);
//         }
//       } catch (error) {
//         console.error("Error loading station:", error);
//         showMessageBox("Network error. Could not load station.");
//       }
//     },
//     [
//       userData,
//       setNodes,
//       setEdges,
//       onStationNameChange,
//       reactFlowInstance,
//       productId,
//     ]
//   );
//   useEffect(() => {
//     if (selectedStationName) {
//       loadStation(selectedStationName);
//     } else {
//       setNodes([]);
//       setEdges([]);
//     }
//   }, [selectedStationName, loadStation]);

//   // Function to save a new station
//   const handleSaveNew = async () => {
//     if (nodes.length === 0) {
//       showMessageBox("Canvas is empty. Add some devices before saving.");
//       return;
//     }
//     const nameInput = prompt("Enter a name for the new station:");
//     if (!nameInput || !nameInput.trim()) {
//       showMessageBox("Station name is required. Aborting.");
//       return;
//     }

//     const stationData = {
//       userName: userData?.validUserOne?.userName,
//       stationName: nameInput,
//       nodes: nodes,
//       edges: edges,
//       viewport: reactFlowInstance.getViewport(),
//     };

//     try {
//       const response = await fetch(`${API_URL}/api/build-live-station`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(stationData),
//       });
//       const result = await response.json();
//       if (response.ok) {
//         showMessageBox(`Station "${nameInput}" saved successfully!`);
//         onStationNameChange(nameInput);
//         onToggleEditMode(false);
//       } else {
//         showMessageBox(`Error saving station: ${result.message}`);
//       }
//     } catch (error) {
//       console.error("Error saving station:", error);
//       showMessageBox("Network error. Could not save station.");
//     }
//   };

//   // Function to update an existing station
//   const handleUpdate = async () => {
//     if (!selectedStationName) {
//       showMessageBox("No station selected to update.");
//       return;
//     }

//     const stationData = {
//       userName: userData?.validUserOne?.userName,
//       nodes: nodes,
//       edges: edges,
//       viewport: reactFlowInstance.getViewport(),
//     };

//     try {
//       const response = await fetch(
//         `${API_URL}/api/edit-live-station/${userData.validUserOne.userName}/${selectedStationName}`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(stationData),
//         }
//       );
//       const result = await response.json();
//       if (response.ok) {
//         showMessageBox(
//           `Station "${selectedStationName}" updated successfully!`
//         );
//         onToggleEditMode(false);
//       } else {
//         showMessageBox(`Error updating station: ${result.message}`);
//       }
//     } catch (error) {
//       console.error("Error updating station:", error);
//       showMessageBox("Network error. Could not update station.");
//     }
//   };

//   const onDelete = async () => {
//     if (!selectedStationName) {
//       showMessageBox("No station selected to delete.");
//       return;
//     }
//     const isConfirmed = window.confirm(
//       `Are you sure you want to delete station "${selectedStationName}"?`
//     );
//     if (!isConfirmed) return;

//     try {
//       const response = await fetch(
//         `${API_URL}/api/delete-live-station/${userData.validUserOne.userName}/${selectedStationName}`,
//         {
//           method: "DELETE",
//         }
//       );
//       if (response.ok) {
//         showMessageBox(
//           `Station "${selectedStationName}" deleted successfully.`
//         );
//         setNodes([]);
//         setEdges([]);
//         onStationDeleted();
//       } else {
//         const result = await response.json();
//         showMessageBox(`Error deleting station: ${result.message}`);
//       }
//     } catch (error) {
//       console.error("Error deleting station:", error);
//       showMessageBox("Network error. Could not delete station.");
//     }
//   };

//   const onDragOver = useCallback(
//     (event) => {
//       event.preventDefault();
//       event.dataTransfer.dropEffect = isEditMode ? "move" : "none";
//     },
//     [isEditMode]
//   );

//   const onDrop = useCallback(
//     (event) => {
//       if (!isEditMode) return;
//       event.preventDefault();

//       const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
//       const dataString = event.dataTransfer.getData("application/reactflow");
//       if (!dataString) return;
//       const shapeData = JSON.parse(dataString);

//       const isSpecialNode = shapeData.isPump || shapeData.isAirblower;
//       const isPngNode = shapeData.isPNG;
//       const isPdfNode = shapeData.isPDF;

//       const promptLabel =
//         shapeData.isPNG || shapeData.isPDF ? "file" : shapeData.label;

//       const manualId = prompt(`Enter a unique ID for the new ${promptLabel}:`);
//       if (!manualId) {
//         showMessageBox("ID is required. Aborting.");
//         return;
//       }
//       if (nodes.some((node) => node.id === manualId)) {
//         showMessageBox(
//           `ID "${manualId}" already exists. Please choose a unique ID.`
//         );
//         return;
//       }

//       let deviceName = shapeData.label;
//       if (isSpecialNode) {
//         const nameInput = prompt(`Enter a name for device ${manualId}:`);
//         if (!nameInput) {
//           showMessageBox("Name is required. Aborting.");
//           return;
//         }
//         deviceName = nameInput;
//       }

//       const position = reactFlowInstance.project({
//         x: event.clientX - reactFlowBounds.left,
//         y: event.clientY - reactFlowBounds.top,
//       });

//       let nodeType = "default";
//       if (isSpecialNode) nodeType = "pumpBlowerNode";
//       else if (isPngNode) nodeType = "imageNode";
//       else if (isPdfNode) nodeType = "pdfNode";

//       let fileData = null;
//       if (isPdfNode && shapeData.fileObject) {
//         const fileKey = `${manualId}-${Date.now()}`;
//         setUploadedFiles(
//           (prev) => new Map(prev.set(fileKey, shapeData.fileObject))
//         );
//         fileData = fileKey;
//       }

//       const newNode = {
//         id: manualId,
//         type: nodeType,
//         position,
//         data: {
//           id: manualId,
//           name: deviceName,
//           productId: productId,
//           filePath: shapeData.filePath,
//           fileKey: fileData,
//           label:
//             !isSpecialNode && !isPngNode && !isPdfNode ? (
//               <div style={{ textAlign: "center" }}>
//                 <img src={shapeData.svgPath} alt={shapeData.label} />
//                 <div>{manualId}</div>
//               </div>
//             ) : null,
//         },
//       };

//       setNodes((nds) => nds.concat(newNode));
//     },
//     [
//       reactFlowInstance,
//       nodes,
//       setNodes,
//       setUploadedFiles,
//       productId,
//       showMessageBox,
//       isEditMode,
//     ]
//   );

//   // This useEffect ensures the correct `loadStation` function is used
//   useEffect(() => {
//     if (selectedStationName) {
//       loadStation(selectedStationName);
//     } else {
//       setNodes([]);
//       setEdges([]);
//     }
//   }, [selectedStationName, loadStation]);

//   const toggleFullScreen = () => {
//     if (screenfull.isEnabled && canvasContainerRef.current) {
//       screenfull.toggle(canvasContainerRef.current).then(() => {
//         if (screenfull.isFullscreen) {
//           canvasContainerRef.current.classList.add("fullscreen-mode");
//         } else {
//           canvasContainerRef.current.classList.remove("fullscreen-mode");
//         }
//       });
//     }
//   };

//   return (
//     <div className="canvas-wrapper" ref={canvasContainerRef}>
//       {/* <div className="canvas-header">
//         {selectedStationName && (
//           <h3 className="station-title">{selectedStationName}</h3>
//         )}
//         <div className="canvas-buttons">
//           {isEditMode ? (
//             selectedStationName ? (
//               <>
//                 <button
//                   onClick={handleUpdate}
//                   className="header-button update-button"
//                 >
//                   Update
//                 </button>
//                 <button
//                   onClick={onDelete}
//                   className="header-button delete-button"
//                 >
//                   Delete
//                 </button>
//               </>
//             ) : (
//               <button
//                 onClick={handleSaveNew}
//                 className="header-button save-new-button"
//               >
//                 Save New
//               </button>
//             )
//           ) : null}
//         </div>
//       </div> */}
//       <div className="canvas-header">
//         {selectedStationName && (
//           <h3 className="station-title">{selectedStationName}</h3>
//         )}
//         <div className="canvas-buttons">
//           <button
//             onClick={toggleFullScreen}
//             className="fullscreen-button"
//             title="Toggle Fullscreen"
//           >
//             <BiFullscreen size={20} />
//           </button>

//           {isEditMode ? (
//             selectedStationName ? (
//               <>
//                 <button
//                   onClick={handleUpdate}
//                   className="header-button update-button"
//                 >
//                   Update
//                 </button>
//                 <button
//                   onClick={onDelete}
//                   className="header-button delete-button"
//                 >
//                   Delete
//                 </button>
//               </>
//             ) : (
//               <button
//                 onClick={handleSaveNew}
//                 className="header-button save-new-button"
//               >
//                 Save New
//               </button>
//             )
//           ) : null}
//         </div>
//       </div>

//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={isEditMode ? onNodesChange : null}
//         onEdgesChange={isEditMode ? onEdgesChange : null}
//         onConnect={isEditMode ? onConnect : null}
//         onInit={setReactFlowInstance}
//         onDrop={isEditMode ? onDrop : null}
//         onDragOver={onDragOver}
//         nodeTypes={nodeTypes}
//         fitView
//       >
//         <Controls />
//         <Background variant="dots" gap={12} size={1} />
//       </ReactFlow>

//       {messageBox.isVisible && (
//         <div className="custom-message-box-overlay">
//           <div className="custom-message-box">
//             <p>{messageBox.message}</p>
//             <button onClick={messageBox.onConfirm || hideMessageBox}>OK</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default CanvasComponent;

import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import "./CanvasComponent.css";
import { useSelector } from "react-redux";
import io from "socket.io-client";

import PumpBlowerNode from "./PumpBlowerNode";
import ImageNode from "./ImageNode";
import PdfNode from "./PdfNode";
import { API_URL } from "../utils/apiConfig";
import screenfull from "screenfull";
import { BiFullscreen } from "react-icons/bi";
import { getSocket } from "./socketService";

function CanvasComponent({
  selectedStationName,
  onStationNameChange,
  isEditMode,
  onToggleEditMode,
  onStationDeleted,
}) {
  const reactFlowWrapper = useRef(null);
  const canvasContainerRef = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const nodesRef = useRef(nodes);
useEffect(() => {
  nodesRef.current = nodes;
}, [nodes]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState(new Map());
  const [realtimePumpData, setRealtimePumpData] = useState({});
  const [pendingPumps, setPendingPumps] = useState({});

  const [messageBox, setMessageBox] = useState({
    isVisible: false,
    message: "",
    onConfirm: null,
  });

  const showMessageBox = useCallback((message, onConfirm = null) => {
  setMessageBox({ isVisible: true, message, onConfirm });
}, []);

const hideMessageBox = useCallback(() => {
  setMessageBox({ isVisible: false, message: "", onConfirm: null });
}, []);

  const { userData } = useSelector((state) => state.user);
  const productId = String(userData?.validUserOne?.productID || "");
  console.log("productId:", productId);
  const socket = useRef(null);
  const backendUrl = API_URL || "http://localhost:5555";

  
  useEffect(() => {
    socket.current = getSocket(backendUrl);

     const handlePumpFeedback = (payload) => {
  console.log("Processing pump feedback:", payload);
  if (!payload || typeof payload.pumpData !== "object" || payload.pumpData === null) {
    console.error("Invalid pumpFeedback payload received:", payload);
    return;
  }
  const { pumpId, status } = payload.pumpData;

  // Update pending map
  setPendingPumps((prev) => ({ ...prev, [pumpId]: false }));

  // Update node data (realtimeValues + isOn + isPending)
  setNodes((nds) =>
    nds.map((node) => {
      if (node.id === pumpId) {
        return {
          ...node,
          data: {
            ...node.data,
            realtimeValues: { ...payload.pumpData },
            isOn: status === "ON" || status === 1,
            isPending: false,
          },
        };
      }
      return node;
    })
  );

  // keep a copy in realtimePumpData if you want (optional)
  setRealtimePumpData((prev) => ({ ...prev, [pumpId]: { ...payload.pumpData } }));
};

   const handlePumpAck = (payload) => {
  console.log("Processing pump acknowledgment:", payload);

  const pumpMap = {};
  payload.pumps.forEach((p) => {
    pumpMap[p.pumpId] = p;
  });

  // Clear pending flags
  setPendingPumps((prev) => {
    const copy = { ...prev };
    payload.pumps.forEach((p) => (copy[p.pumpId] = false));
    return copy;
  });

  // Update nodes in one pass
  setNodes((nds) =>
    nds.map((node) => {
      const updatedPump = pumpMap[node.id];
      if (updatedPump) {
        return {
          ...node,
          data: {
            ...node.data,
            realtimeValues: updatedPump,
            isOn: updatedPump.status === 1 || updatedPump.status === "ON",
            isPending: false,
          },
        };
      }
      return node;
    })
  );

  // Keep realtimePumpData if you use it elsewhere
  setRealtimePumpData((prev) => ({ ...prev, ...pumpMap }));
};


    socket.current.on("connect", () => {
      console.log("Socket.IO connected:", socket.current.id);
      if (productId) socket.current.emit("joinRoom", productId);
    });

    socket.current.on("pumpFeedback", handlePumpFeedback);
    socket.current.on("pumpAck", handlePumpAck);

    socket.current.on("reconnect", () => {
      console.log("Reconnected to server");
      if (productId) socket.current.emit("joinRoom", productId);
    });

    return () => {
      socket.current.off("pumpFeedback", handlePumpFeedback);
      socket.current.off("pumpAck", handlePumpAck);
    };
  }, [backendUrl, productId, setNodes, setPendingPumps, setRealtimePumpData]);

  useEffect(() => {
    if (productId) {
      console.log(
        `[FRONTEND] Attempting to join room with productId: ${productId}`
      );
      socket.current.emit("joinRoom", productId);
    }
  }, [productId]);

  
  const sendPumpControlMessage = useCallback(
  (prodId, pumps) => {
    if (socket.current && socket.current.connected) {
      // Build pending and optimistic update based on the current nodes snapshot
      const newPendingState = {};
      const optimisticUpdate = {};

      pumps.forEach((p) => {
        newPendingState[p.pumpId] = true;
        const nodeToToggle = nodesRef.current.find((n) => n.id === p.pumpId);
        if (nodeToToggle) {
          optimisticUpdate[p.pumpId] = !nodeToToggle.data.isOn;
        }
      });

      setPendingPumps((prev) => ({ ...prev, ...newPendingState }));

      // Optimistically update nodes' isOn in state
      setNodes((nds) =>
        nds.map((node) =>
          optimisticUpdate.hasOwnProperty(node.id)
            ? { ...node, data: { ...node.data, isOn: optimisticUpdate[node.id], isPending: true } }
            : node
        )
      );

      socket.current.emit("controlPump", { product_id: prodId, pumps });
    } else {
      console.error("Socket.IO client not connected. Cannot send command.");
      showMessageBox("Connection error: Cannot send command. Please refresh.");
    }
  },
  [showMessageBox] // showMessageBox is stable (from step 1)
);

  const nodeTypes = useMemo(
  () => ({
    pumpBlowerNode: (props) => (
      <PumpBlowerNode
        {...props}
        setNodes={setNodes}
        sendPumpControlMessage={sendPumpControlMessage}
      />
    ),
    imageNode: ImageNode,
    pdfNode: PdfNode,
  }),
  [setNodes, sendPumpControlMessage]
);


  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const loadStation = useCallback(
    async (name) => {
      if (!name) return;
      try {
        const response = await fetch(
          `${API_URL}/api/find-live-station/${userData.validUserOne.userName}/${name}`
        );
        const result = await response.json();
        console.log("selected station:", result);

        if (response.ok) {
          const pumpStatesResponse = await fetch(
            `${API_URL}/api/pump-states/${productId}`
          );
          const pumpStatesData = await pumpStatesResponse.json();
          console.log("pumpStatesData:", pumpStatesData); // <-- This is the new console log you requested

          const pumpStatusMap = new Map();
          const pendingStatusMap = new Map();

          pumpStatesData.forEach((state) => {
            pumpStatusMap.set(state.pumpId, state.status);
            pendingStatusMap.set(state.pumpId, state.pending);
          });

          const newPendingPumps = {};
          pumpStatesData.forEach((state) => {
            newPendingPumps[state.pumpId] = state.pending;
          });
          setPendingPumps(newPendingPumps);

          const updatedNodes = result.data.nodes.map((node) => {
  if (node.type === "pumpBlowerNode") {
    const isPending = pendingStatusMap.get(node.id) || false;
    const isOn = pumpStatusMap.get(node.id) || false;

    return {
      ...node,
      data: {
        ...node.data,
        isOn: isOn,
        isPending: isPending,
        productId: productId,
        isEditMode: isEditMode,
        realtimeValues: realtimePumpData[node.id] || {},
      },
    };
  }
  return node;
});


          setNodes(updatedNodes);
          setEdges(result.data.edges);
          onStationNameChange(result.data.stationName);
          if (reactFlowInstance) {
            reactFlowInstance.setViewport(result.data.viewport, {
              duration: 800,
            });
          }
        } else {
          showMessageBox(`Error loading station: ${result.message}`);
        }
      } catch (error) {
        console.error("Error loading station:", error);
        showMessageBox("Network error. Could not load station.");
      }
    },
    [
      userData,
      setNodes,
      setEdges,
      onStationNameChange,
      reactFlowInstance,
      productId,
    ]
  );
  useEffect(() => {
    if (selectedStationName) {
      loadStation(selectedStationName);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedStationName, loadStation]);

  // Function to save a new station
  const handleSaveNew = async () => {
    if (nodes.length === 0) {
      showMessageBox("Canvas is empty. Add some devices before saving.");
      return;
    }
    const nameInput = prompt("Enter a name for the new station:");
    if (!nameInput || !nameInput.trim()) {
      showMessageBox("Station name is required. Aborting.");
      return;
    }

    const stationData = {
      userName: userData?.validUserOne?.userName,
      stationName: nameInput,
      nodes: nodes,
      edges: edges,
      viewport: reactFlowInstance.getViewport(),
    };

    try {
      const response = await fetch(`${API_URL}/api/build-live-station`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stationData),
      });
      const result = await response.json();
      if (response.ok) {
        showMessageBox(`Station "${nameInput}" saved successfully!`);
        onStationNameChange(nameInput);
        onToggleEditMode(false);
      } else {
        showMessageBox(`Error saving station: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving station:", error);
      showMessageBox("Network error. Could not save station.");
    }
  };

  // Function to update an existing station
  const handleUpdate = async () => {
    if (!selectedStationName) {
      showMessageBox("No station selected to update.");
      return;
    }

    const stationData = {
      userName: userData?.validUserOne?.userName,
      nodes: nodes,
      edges: edges,
      viewport: reactFlowInstance.getViewport(),
    };

    try {
      const response = await fetch(
        `${API_URL}/api/edit-live-station/${userData.validUserOne.userName}/${selectedStationName}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stationData),
        }
      );
      const result = await response.json();
      if (response.ok) {
        showMessageBox(
          `Station "${selectedStationName}" updated successfully!`
        );
        onToggleEditMode(false);
      } else {
        showMessageBox(`Error updating station: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating station:", error);
      showMessageBox("Network error. Could not update station.");
    }
  };

  const onDelete = async () => {
    if (!selectedStationName) {
      showMessageBox("No station selected to delete.");
      return;
    }
    const isConfirmed = window.confirm(
      `Are you sure you want to delete station "${selectedStationName}"?`
    );
    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/delete-live-station/${userData.validUserOne.userName}/${selectedStationName}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        showMessageBox(
          `Station "${selectedStationName}" deleted successfully.`
        );
        setNodes([]);
        setEdges([]);
        onStationDeleted();
      } else {
        const result = await response.json();
        showMessageBox(`Error deleting station: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting station:", error);
      showMessageBox("Network error. Could not delete station.");
    }
  };

  const onDragOver = useCallback(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = isEditMode ? "move" : "none";
    },
    [isEditMode]
  );

  const onDrop = useCallback(
    (event) => {
      if (!isEditMode) return;
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const dataString = event.dataTransfer.getData("application/reactflow");
      if (!dataString) return;
      const shapeData = JSON.parse(dataString);

      const isSpecialNode = shapeData.isPump || shapeData.isAirblower;
      const isPngNode = shapeData.isPNG;
      const isPdfNode = shapeData.isPDF;

      const promptLabel =
        shapeData.isPNG || shapeData.isPDF ? "file" : shapeData.label;

      const manualId = prompt(`Enter a unique ID for the new ${promptLabel}:`);
      if (!manualId) {
        showMessageBox("ID is required. Aborting.");
        return;
      }
      if (nodes.some((node) => node.id === manualId)) {
        showMessageBox(
          `ID "${manualId}" already exists. Please choose a unique ID.`
        );
        return;
      }

      let deviceName = shapeData.label;
      if (isSpecialNode) {
        const nameInput = prompt(`Enter a name for device ${manualId}:`);
        if (!nameInput) {
          showMessageBox("Name is required. Aborting.");
          return;
        }
        deviceName = nameInput;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      let nodeType = "default";
      if (isSpecialNode) nodeType = "pumpBlowerNode";
      else if (isPngNode) nodeType = "imageNode";
      else if (isPdfNode) nodeType = "pdfNode";

      let fileData = null;
      if (isPdfNode && shapeData.fileObject) {
        const fileKey = `${manualId}-${Date.now()}`;
        setUploadedFiles(
          (prev) => new Map(prev.set(fileKey, shapeData.fileObject))
        );
        fileData = fileKey;
      }

      const newNode = {
        id: manualId,
        type: nodeType,
        position,
        data: {
          id: manualId,
          name: deviceName,
          productId: productId,
          filePath: shapeData.filePath,
          fileKey: fileData,
          label:
            !isSpecialNode && !isPngNode && !isPdfNode ? (
              <div style={{ textAlign: "center" }}>
                <img src={shapeData.svgPath} alt={shapeData.label} />
                <div>{manualId}</div>
              </div>
            ) : null,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [
      reactFlowInstance,
      nodes,
      setNodes,
      setUploadedFiles,
      productId,
      showMessageBox,
      isEditMode,
    ]
  );

  // This useEffect ensures the correct `loadStation` function is used
  useEffect(() => {
    if (selectedStationName) {
      loadStation(selectedStationName);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedStationName, loadStation]);

  const toggleFullScreen = () => {
    if (screenfull.isEnabled && canvasContainerRef.current) {
      screenfull.toggle(canvasContainerRef.current).then(() => {
        if (screenfull.isFullscreen) {
          canvasContainerRef.current.classList.add("fullscreen-mode");
        } else {
          canvasContainerRef.current.classList.remove("fullscreen-mode");
        }
      });
    }
  };

  return (
    <div className="canvas-wrapper" ref={canvasContainerRef}>
      <div className="canvas-header">
        {selectedStationName && (
          <h3 className="station-title">{selectedStationName}</h3>
        )}
        <div className="canvas-buttons">
          <button
            onClick={toggleFullScreen}
            className="fullscreen-button"
            title="Toggle Fullscreen"
          >
            <BiFullscreen size={20} />
          </button>

          {isEditMode ? (
            selectedStationName ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="header-button update-button"
                >
                  Update
                </button>
                <button
                  onClick={onDelete}
                  className="header-button delete-button"
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                onClick={handleSaveNew}
                className="header-button save-new-button"
              >
                Save New
              </button>
            )
          ) : null}
        </div>
      </div>

 <div className="react-flow-wrapper" ref={reactFlowWrapper} style={{ height: '100%' }}>
  <ReactFlow
    nodes={nodes}
    edges={edges}
    onNodesChange={isEditMode ? onNodesChange : null}
    onEdgesChange={isEditMode ? onEdgesChange : null}
    onConnect={isEditMode ? onConnect : null}
    onInit={setReactFlowInstance}
    onDrop={isEditMode ? onDrop : null}
    onDragOver={onDragOver}
    nodeTypes={nodeTypes}
    fitView
  >
    <Controls />
    <Background variant="dots" gap={12} size={1} />
  </ReactFlow>
</div>

      {messageBox.isVisible && (
        <div className="custom-message-box-overlay">
          <div className="custom-message-box">
            <p>{messageBox.message}</p>
            <button onClick={messageBox.onConfirm || hideMessageBox}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CanvasComponent;
