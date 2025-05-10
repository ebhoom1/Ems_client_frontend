import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "react-flow-renderer";
import SVGNode from "./SVGnode";
import TextNode from "./TextNode";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import PipingEdge from "./PipingEdge";

const nodeTypes = {
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
};

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
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDragging, setIsDragging] = useState(false);

  const [currentUserName, setCurrentUserName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [noLiveStation, setNoLiveStation] = useState(false);
  const [stationName, setStationName] = useState("");

  // Map of pumpId → {status: boolean, pending: boolean}
  const [pumpStates, setPumpStates] = useState({});

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

  const onDrop = (event) => {
    if (!isEditMode) return;
    event.preventDefault();

    const reactFlowBounds = event.target.getBoundingClientRect();
    const shapeData = event.dataTransfer.getData("application/reactflow");
    if (!shapeData) return;

    const parsed = JSON.parse(shapeData);
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

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
        onPumpToggle: handlePumpToggle,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

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
        userName: isEditing ? currentUserName || loggedUserName : loggedUserName,
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
          },
          width: n.width,
          height: n.height,
        })),
        edges,
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
    setPumpStates({});
    
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
          className="reactflow-wrapper"
          style={{ width: "100%", height: 600 }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={isEditMode ? onNodesChange : undefined}
            onEdgesChange={isEditMode ? onEdgesChange : undefined}
            onConnect={isEditMode ? onConnect : undefined}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={{ piping: PipingEdge }}
            style={{
              pointerEvents: isDragging || !isEditMode ? "none" : "auto",
            }}
            connectable={isEditMode}
            snapToGrid
            snapGrid={[15, 15]}
            panOnScroll
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