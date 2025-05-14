import React, { useState, useCallback, useEffect,useMemo, useRef } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow
} from "react-flow-renderer";
import io from 'socket.io-client';
import SVGNode from "./SVGnode";
import TextNode from "./TextNode";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import PipingEdge from "./PipingEdge";
import PDFNode from "./PDFNode";
import DeviceNode from "./DeviceNode"; 
function Canvas({
  selectedStation,
  isEditMode,
  setIsEditMode,
  socket,
  socketConnected,
}) {
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

  // Map of pumpId → {status: boolean, pending: boolean}
  const [pumpStates, setPumpStates] = useState({});
  const [savedViewport, setSavedViewport] = useState({
  x: 0,
  y: 0,
  zoom: 1,
});

  // Handle pump toggle from child components
  const handlePumpToggle = useCallback((pumpId, pumpName, status, isPending) => {
    setPumpStates(prev => ({
      ...prev,
      [pumpId]: {
        status,
        pending: isPending,
        name: pumpName
      }
    }));
  }, []);

  // Setup socket listeners for acknowledgments
  useEffect(() => {
    if (!socket) return;

    const handlePumpAck = (ackData) => {
      if (!ackData.pumps) return;
      
      ackData.pumps.forEach((pump) => {
        setPumpStates(prev => ({
          ...prev,
          [pump.pumpId]: {
            status: pump.status === 1,
            pending: false,
            name: pump.pumpName
          }
        }));
      });
    };

    if (socketConnected) {
      socket.emit("joinRoom", { product_id: "27" });
      socket.on("pumpAck", handlePumpAck);
      socket.on("pumpStateUpdate", handlePumpAck);
    }

    return () => {
      socket.off("pumpAck", handlePumpAck);
      socket.off("pumpStateUpdate", handlePumpAck);
    };
  }, [socket, socketConnected]);

  // Update nodes with pump status when they change
// In Canvas.jsx
useEffect(() => {
  if (nodes.length > 0) {
    setNodes(nds =>
      nds.map(node => {
        const pumpState = pumpStates[node.id] || { 
          status: false, 
          pending: false 
        };
        
        return {
          ...node,
          data: {
            ...node.data,
            pumpStatus: pumpState.status,
            isPending: pumpState.pending,
            socketConnected,
            onPumpToggle: handlePumpToggle
          }
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

const onDrop = useCallback((event) => {
  if (!isEditMode) return;
  event.preventDefault();

  // 1) measure the full React-Flow area
  const bounds = reactFlowWrapper.current.getBoundingClientRect();

  // 2) grab the drag data
  const shapeData = event.dataTransfer.getData('application/reactflow');
  if (!shapeData) return;
  const parsed = JSON.parse(shapeData);

  // 3) compute the drop position within the canvas
  const position = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };

  // 4) decide if this is your PDF node
  const isPDF = parsed.isPDF || parsed.type === 'pdfNode';

  // 5) build the node, sizing PDFs to fill the entire bounds
  const newNode = {
    id: `${parsed.id}_${nodes.length}`,
    type: parsed.type,
    position,
    style: isPDF
      ? { width: bounds.width, height: bounds.height }
      : {},
    data: {
      ...parsed,
      isEditing: true,
      isPump:      parsed.label.toLowerCase().includes('pump'),
      isAirblower: parsed.label.toLowerCase().includes('blower'),
      isTank:      parsed.label.toLowerCase().includes('tank'),
      socket,
      socketConnected,
      pumpStatus: false,
      isPending:   false,
      onPumpToggle: handlePumpToggle,
    },
  };

  setNodes((nds) => nds.concat(newNode));
}, [
  isEditMode,
  nodes.length,
  socket,
  socketConnected,
  handlePumpToggle,
]);


  // Save/Delete handlers
 const handleSave = async () => {
  if (!stationName) {
    alert("Please enter a station name.");
    return;
  }

  try {
    const apiUrl = isEditing
      ? `${API_URL}/api/edit-live-station/${currentUserName || loggedUserName}/${stationName}`
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
          filePath:  n.data.filePath,
        },
        width: n.width,
        height: n.height,
      })),
      edges,
      viewport: savedViewport,   // ← add this line
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
        `${API_URL}/api/delete-live-station/${currentUserName || loggedUserName}/${stationName}`
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
            name: node.data.label
          };
        } catch {
          states[node.id] = {
            status: false,
            pending: false,
            name: node.data.label
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
 */    setPumpStates({});
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
            pumpStatus: initialPumpStates[node.id]?.status || false,
            isPending: initialPumpStates[node.id]?.pending || false,
            onPumpToggle: handlePumpToggle,
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
const nodeTypes = useMemo(() => {
  const getNodeTypes = (liveTankData) => ({
    svgNode: (props) => <SVGNode {...props} liveTankData={liveTankData} />,
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
      pumpNode:   props => <DeviceNode  {...props} />,
 blowerNode: props => <DeviceNode  {...props} />,
  });
  return getNodeTypes(liveTankData);
}, [liveTankData]);

//new
const edgeTypes = {
  piping: PipingEdge,
};
  return (
    <div className="react-flow-container">
      <div className="react-flow-scrollable">
        {noLiveStation && (
          <div className="text-danger text-center mb-3">
            <h5>
              {userType === "admin"
                ? "No station for this user."
                : "No station—create one."}
            </h5>
          </div>
        )}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <label>Station Name:</label>
            <input
              className="form-control"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              disabled={isEditing && userType !== "admin"}
            />
          </div>

          <div>
            <button
              className="btn btn-warning me-2"
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
              className="btn btn-success me-2"
              onClick={handleSave}
              disabled={!isEditMode}
            >
              {isEditing ? "Update" : "Save"}
            </button>
            {isEditing && userType === "admin" && (
              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
          </div>
        </div>
       <div
  ref={reactFlowWrapper}
   className="reactflow-wrapper"
  style={{ width: "100%", height: "600px" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            defaultViewport={savedViewport}
 onMoveEnd={({ viewport }) => setSavedViewport(viewport)}

  // disable all zoom/pan in view mode
 zoomOnScroll={isEditMode}
 zoomOnPinch={isEditMode}
 zoomOnDoubleClick={isEditMode}
 panOnDrag={isEditMode}
 panOnScroll={isEditMode}
            onNodesChange={isEditMode ? onNodesChange : undefined}
            onEdgesChange={isEditMode ? onEdgesChange : undefined}
            onConnect={isEditMode ? onConnect : undefined}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            // style={{
            //   pointerEvents: isDragging || !isEditMode ? "none" : "auto",
            // }}
            connectable={isEditMode}
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
export default Canvas;