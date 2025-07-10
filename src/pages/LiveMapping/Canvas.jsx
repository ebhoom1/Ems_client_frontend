//Canvas new

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "react-flow-renderer";
import io from "socket.io-client";
import SVGNode from "./SVGnode";
import TextNode from "./TextNode";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import PipingEdge from "./PipingEdge";
import PDFNode from "./PDFNode";
import DeviceNode from "./DeviceNode";
import FlowMeterNode from "./FlowMeterNode";
import TankNode from "./TankNode";
import screenfull from "screenfull";
import { BiFullscreen } from "react-icons/bi";

function Canvas({
  selectedStation,
  isEditMode,
  setIsEditMode,
  socket,
  socketConnected,
  productId,
}) {
  const fullscreenRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { userId } = useSelector((state) => state.selectedUser);
  const { userData } = useSelector((state) => state.user);
  const userType = userData?.validUserOne?.userType || "";
  const loggedUserName = userData?.validUserOne?.userName || "";
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const reactFlowWrapper = useRef(null);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [noLiveStation, setNoLiveStation] = useState(false);
  const [stationName, setStationName] = useState("");
  //tankdata
  const [liveTankData, setLiveTankData] = useState([]);
  const [flowValues, setFlowValues] = useState({});

  // Map of pumpId → {status: boolean, pending: boolean}
  const [pumpStates, setPumpStates] = useState({});
  const [savedViewport, setSavedViewport] = useState({
    x: 0,
    y: 0,
    zoom: 1,
  });

  // Handle pump toggle from child components
  const handlePumpToggle = useCallback(
    (pumpId, pumpName, status, isPending) => {
      setPumpStates((prev) => ({
        ...prev,
        [pumpId]: {
          status,
          pending: isPending,
          name: pumpName,
        },
      }));
    },
    []
  );
  // In your Canvas.jsx component
  useEffect(() => {
    if (!socket || !socketConnected || !productId) return;

    // Always join the new room when productId changes
    console.log("Emitting joinRoom for productId:", productId);
    socket.emit("joinRoom", productId);

    // Handler for tank data
    const handler = (payload) => {
      console.log("Socket received payload:", payload);
      if (Array.isArray(payload.tankData)) {
        const tanks = payload.tankData.map((t) => ({
          tankName: t.tankName.trim(),
          percentage: parseFloat(t.percentage ?? t.depth ?? 0),
          ...t, // include all fields for debugging
        }));
        setLiveTankData(tanks);
      } else {
        setLiveTankData([]); // clear if no data
      }
    };

    socket.on("data", handler);

    // Clean up handler on unmount or productId change
    return () => {
      socket.off("data", handler);
    };
  }, [socket, socketConnected, productId]);

  // Update nodes with pump status when they change
  // In Canvas.jsx
  useEffect(() => {
    if (nodes.length > 0) {
      setNodes((nds) =>
        nds.map((node) => {
          const pumpState = pumpStates[node.id] || {
            status: false,
            pending: false,
          };

          return {
            ...node,
            data: {
              ...node.data,
              pumpStatus: pumpState.status,
              isPending: pumpState.pending,
              socketConnected,
              onPumpToggle: handlePumpToggle,
            },
          };
        })
      );
    }
  }, [pumpStates, socketConnected]);

  // Drag and connect handlers
  const onDragStart = () => setIsDragging(true);
  const onDragStop = () => setIsDragging(false);

  const onConnect = useCallback(
    (params) => {
      if (!isEditMode) return;
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "piping",
            data: {
              sourceHandle: params.sourceHandle,
              targetHandle: params.targetHandle,
            },
          },
          eds
        )
      );
    },
    [isEditMode, setEdges]
  );
  const onDragOver = (event) => {
    event.preventDefault();
  };

  // still in Canvas.jsx, inside your Canvas component

  const onDrop = useCallback(
    (event) => {
      if (!isEditMode) return;
      event.preventDefault();

      // 1) measure the full React-Flow area
      const bounds = reactFlowWrapper.current.getBoundingClientRect();

      // 2) grab the drag data
      const shapeData = event.dataTransfer.getData("application/reactflow");
      if (!shapeData) return;
      const parsed = JSON.parse(shapeData);

      // 3) compute the drop position within the canvas
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };

      // 4) decide if this is your PDF node
      const isPDF = parsed.isPDF || parsed.type === "pdfNode";

      // 5) build the node, sizing PDFs to fill the entire bounds
      // In your Canvas component where you create nodes:
      const newNode = {
        id: `${parsed.id}_${nodes.length}`,
        type: parsed.type,
        position,
        data: {
          ...parsed,
          isEditing: true,
          isPump: parsed.label.toLowerCase().includes("pump"),
          isAirblower: parsed.label.toLowerCase().includes("blower"),
          socket,
          socketConnected,
          pumpStatus: false,
          isPending: false,
          productId: productId,
          onPumpToggle: handlePumpToggle,
          onLabelChange: (id, newLabel) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n
              )
            );
          },
          onRotate: (id, newRotation) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === id
                  ? { ...n, data: { ...n.data, rotation: newRotation } }
                  : n
              )
            );
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [
      isEditMode,
      nodes.length,
      socket,
      socketConnected,
      handlePumpToggle,
      productId,
    ]
  );

  // Save/Delete handlers
  const handleSave = async () => {
    if (!stationName) {
      alert("Please enter a station name.");
      return;
    }

    try {
      const apiUrl = isEditing
        ? `${API_URL}/api/edit-live-station/${
            currentUserName || loggedUserName
          }/${stationName}`
        : `${API_URL}/api/build-live-station`;
      const method = isEditing ? "patch" : "post";

      const payload = {
        userName: isEditing
          ? currentUserName || loggedUserName
          : loggedUserName,
        stationName,
        ...(isEditing ? { newStationName: stationName } : {}),
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: {
            label: n.data.label,
            svgPath: n.data.svgPath,
            rotation: n.data.rotation,
            isPump: n.data.isPump,
            isAirblower: n.data.isAirblower,
            isTank: n.data.isTank,
            totalDepth: n.data.totalDepth,
            filePath: n.data.filePath,
            width: n.width,
            height: n.height,
          },
        })),
        edges,
        viewport: savedViewport, // ← add this line
      };

      await axios({ method, url: apiUrl, data: payload });
      alert("Map saved successfully!");
      setNoLiveStation(false);
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save map");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this station?")) return;
    try {
      await axios.delete(
        `${API_URL}/api/delete-live-station/${
          currentUserName || loggedUserName
        }/${stationName}`
      );
      alert("Deleted");
      setNodes([]);
      setEdges([]);
      setIsEditing(false);
      setNoLiveStation(true);
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };
  // Fetch initial pump states
  const fetchInitialPumpStates = async (pumpNodes) => {
    const states = {};
    await Promise.all(
      pumpNodes.map(async (node) => {
        try {
          const { data } = await axios.get(
            `${API_URL}/api/pump-states/27/${node.id}`
          );
          states[node.id] = {
            status: data.status,
            pending: data.pending,
            name: node.data.label,
          };
        } catch {
          states[node.id] = {
            status: false,
            pending: false,
            name: node.data.label,
          };
        }
      })
    );
    return states;
  };
  // Load station data
  const fetchLiveStation = async (user, station) => {
    setNodes([]);
    setEdges([]);
    /*     setSavedViewport(data.data.viewport || { x: 0, y: 0, zoom: 1 });
     */ setPumpStates({});
    try {
      const { data } = await axios.get(
        `${API_URL}/api/find-live-station/${user}/${station}`
      );
      if (!data.data) throw new Error();
      const { nodes: savedNodes, edges: savedEdges } = data.data;
      const pumpNodes = savedNodes.filter(
        (n) => n.data.label?.toLowerCase().includes("pump") || n.data.isPump
      );
      const initialPumpStates = await fetchInitialPumpStates(pumpNodes);
      setPumpStates(initialPumpStates);
      setNodes(
        savedNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isEditing: false,
            socket,
            socketConnected,
            productId: productId,
            pumpStatus: initialPumpStates[node.id]?.status || false,
            isPending: initialPumpStates[node.id]?.pending || false,
            onPumpToggle: handlePumpToggle,
            width: node.data.width,
            height: node.data.height,
          },
        }))
      );
      setEdges(savedEdges || []);
      setCurrentUserName(user);
      setIsEditing(true);
      setNoLiveStation(false);
      setStationName(station);
    } catch {
      setIsEditing(false);
      setNoLiveStation(true);
    }
  };
  // Load station when selected
  useEffect(() => {
    if (selectedStation?.stationName) {
      fetchLiveStation(selectedStation.userName, selectedStation.stationName);
    } else {
      setNodes([]);
      setEdges([]);
      setStationName("");
      setIsEditing(false);
    }
  }, [selectedStation, socketConnected]);
  // 👇 Connect socket.io for real-time tank data
  useEffect(() => {
    const socket = io("https://api.ocems.ebhoom.com"); // or your hosted URL

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);

      // Make sure this matches the `userName` used in backend `.emit()`
      socket.emit("joinRoom", "CROWN_PLAZA");
    });

    socket.on("data", (tankPayload) => {
      console.log("📦 Received tank payload:", tankPayload);
      if (tankPayload?.tankData) {
        setLiveTankData(tankPayload.tankData);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  // const nodeTypes = useMemo(() => {
  //   const getNodeTypes = (liveTankData) => ({
  //     svgNode: (props) => <SVGNode {...props} liveTankData={liveTankData} productId={productId} />,
  //     textNode: ({ data }) => (
  //       <div
  //         style={{
  //           padding: "10px",
  //           backgroundColor: "#fff",
  //           border: "1px solid #ccc",
  //           borderRadius: "4px",
  //           cursor: "move",
  //           textAlign: "center",
  //         }}
  //       >
  //         {data.label}
  //       </div>
  //     ),
  //      pdfNode: PDFNode,
  //        pumpNode: props => <SVGNode {...props} liveTankData={liveTankData} productId={productId} />,
  //   blowerNode: props => <SVGNode {...props} liveTankData={liveTankData} productId={productId} />,
  //  flowMeterNode: props => (
  //     <FlowMeterNode
  //       {...props}
  //       flowValues={flowValues}
  //     />
  //   ),
  //    tankNode:     (p) => <TankNode      {...p} liveTankData={liveTankData} productId={productId} />,
  //   });
  //   return getNodeTypes(liveTankData);
  // }, [liveTankData, flowValues, productId]);

  const nodeTypes = useMemo(
    () => ({
      svgNode: SVGNode,
      textNode: ({ data }) => (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "move",
            textAlign: "center",
          }}
        >
          {data.label}
        </div>
      ),
      pdfNode: PDFNode,
      pumpNode: SVGNode,
      blowerNode: SVGNode,
      flowMeterNode: FlowMeterNode, // Note: See step 4 for data passing
      tankNode: TankNode,
    }),
    []
  );

  //new
  const edgeTypes = {
    piping: PipingEdge,
  };

  // Add this effect to update only tank nodes when liveTankData changes
  useEffect(() => {
    if (!liveTankData || liveTankData.length === 0) return;
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.data.isTank) {
          // Find the matching tank data for this node
          const tankMatch = liveTankData.find(
            (t) =>
              t.tankName.trim().toLowerCase() ===
              (node.data.tankName || node.data.label || "").trim().toLowerCase()
          );
          if (tankMatch) {
            return {
              ...node,
              data: {
                ...node.data,
                // Update only the tank-related fields
                percentage: tankMatch.percentage,
                level: tankMatch.level,
                stackName: tankMatch.stackName,
                // Optionally add more fields if needed
              },
            };
          }
        }
        // For non-tank nodes, return as is
        return node;
      })
    );
  }, [liveTankData, setNodes]);

  useEffect(() => {
    // Do nothing if flowValues is empty
    if (Object.keys(flowValues).length === 0) return;

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        // Check if the current node is a flow meter
        if (node.type === "flowMeterNode") {
          const nodeLabel = (node.data.label || "").trim().toLowerCase();

          // Find the matching key in the flowValues state
          const matchedKey = Object.keys(flowValues).find(
            (k) => k.trim().toLowerCase() === nodeLabel
          );

          // If a match is found, update the node's data
          if (matchedKey) {
            return {
              ...node,
              data: {
                ...node.data,
                flowValue: flowValues[matchedKey], // Inject the specific value
              },
            };
          }
        }
        // For all other nodes, return as is
        return node;
      })
    );
  }, [flowValues, setNodes]); // This effect runs whenever flowValues changes

  useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        setIsFullscreen(screenfull.isFullscreen);
      });
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off("change");
      }
    };
  }, []);

  return (
    <div
      className="react-flow-container"
      ref={fullscreenRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <div
        className="react-flow-scrollable"
        style={{
          width: "100%",
          height: isFullscreen ? "100vh" : "calc(100vh - 200px)",
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {noLiveStation && (
          <div className="text-danger text-center mb-3">
            <h5>
              {userType === "admin"
                ? "No station for this user."
                : "No station—create one."}
            </h5>
          </div>
        )}
       <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-2">
          {/* 1) Fullscreen icon on the left */}
          <div className="mb-2 mb-md-0">
            <button
              className="btn btn-outline-dark"
              onClick={() => {
                if (screenfull.isEnabled && fullscreenRef.current) {
                  screenfull.toggle(fullscreenRef.current);
                }
              }}
            >
              <BiFullscreen size={20} />
            </button>
          </div>

          {/* 2) Centered input */}
          <div className="flex-fill text-center mb-2 mb-md-0 px-2">
            <input
              className="form-control mx-auto"
              style={{ maxWidth: "300px" }}
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              disabled={isEditing && userType !== "admin"}
            />
          </div>

          {/* 3) Right-aligned button group */}
          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <button
              className="btn btn-warning"
              onClick={() => {
                setIsEditMode((v) => !v);
                setNodes((nds) =>
                  nds.map((n) => ({
                    ...n,
                    data: { ...n.data, isEditing: !isEditMode },
                  }))
                );
              }}
            >
              {isEditMode ? "View" : "Edit"}
            </button>

            <button
              className="btn btn-success"
              onClick={handleSave}
              disabled={!isEditMode}
            >
              {isEditing ? "Update" : "Save"}
            </button>

            {isEditing && userType === "admin" && (
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
        </div>


        <div
          ref={reactFlowWrapper}
          className="reactflow-wrapper"
          style={{
            width: "100%",
            height: isFullscreen ? "calc(100vh - 60px)" : "600px",
            minWidth: isFullscreen ? "100%" : "1000px",
            minHeight: isFullscreen ? "100%" : "800px",
          }}
        >
          <ReactFlow
            style={{
              width: "100%",
              height: "100%",
              touchAction: "manipulation", // Helps with touch events
            }}
            nodes={nodes}
            edges={edges}
            viewport={savedViewport}
            onMoveEnd={(e) => e?.viewport && setSavedViewport(e.viewport)}
            /* only allow gestures in edit: */
            zoomOnScroll={isEditMode}
            zoomOnPinch={isEditMode}
            zoomOnDoubleClick={isEditMode}
            panOnDrag={isEditMode}
            panOnScroll={isEditMode}
            /* editing handlers */
            onNodesChange={isEditMode ? onNodesChange : undefined}
            onEdgesChange={isEditMode ? onEdgesChange : undefined}
            onConnect={isEditMode ? onConnect : undefined}
            /* drop/drag always works the same */
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectable={isEditMode}
            snapToGrid
            snapGrid={[15, 15]}
          >
            {/* only show the "+" ⟳" controls when editing */}
            {isEditMode && <Controls />}
            <Background />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
export default Canvas;
