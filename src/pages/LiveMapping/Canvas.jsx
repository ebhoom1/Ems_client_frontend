// Canvas.jsx

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
import TextNode from "./TextNode"; // Assuming you have this
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import PipingEdge from "./PipingEdge";
import PDFNode from "./PDFNode"; // Assuming you have this
import DeviceNode from "./DeviceNode"; // Assuming you have this
import FlowMeterNode from "./FlowMeterNode"; // Assuming you have this
import TankNode from "./TankNode"; // Assuming you have this

function Canvas({
  selectedStation,
  isEditMode,
  setIsEditMode,
  socket, // Assuming socket prop is passed from parent
  socketConnected, // Assuming socketConnected prop is passed from parent
}) {
  const { userId } = useSelector((state) => state.selectedUser);
  const { userData } = useSelector((state) => state.user);
  const userType = userData?.validUserOne?.userType || "";
  const loggedUserName = userData?.validUserOne?.userName || "";
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const reactFlowWrapper = useRef(null);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDragging, setIsDragging] = useState(false); // Not directly used in the provided code, but kept
  const [currentUserName, setCurrentUserName] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Tracks if a saved station is currently loaded
  const [noLiveStation, setNoLiveStation] = useState(false);
  const [stationName, setStationName] = useState("");

  // Live Data States
  const [liveTankData, setLiveTankData] = useState([]);
  const [flowValues, setFlowValues] = useState({});

  // Map of pumpId → {status: boolean, pending: boolean, name: string}
  const [pumpStates, setPumpStates] = useState({});

  // Viewport for saving/loading
  const [savedViewport, setSavedViewport] = useState({
    x: 0,
    y: 0,
    zoom: 1,
  });

  const product_id = userData?.validUserOne?.productID;
  console.log('new product Id', product_id);

  // Handle pump toggle from child components (SVGNode)
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

  // Effect to join socket room and handle incoming real-time data
  useEffect(() => {
    if (!socket || !socketConnected) return;

    // Join the room using the actual userName from userData
    const userName = userData?.validUserOne?.userName;
    console.log('🔌 Connecting socket for user:', userName);
    if (userName) { // Ensure userName exists before joining room
      socket.emit('joinRoom', userName);
    }

    // Tank data handler
    const handleTankData = (payload) => {
      console.log('📦 [TANK DATA RECEIVED]', payload);

      if (payload.tankData) {
        console.log('🏭 Processing tank data:', payload.tankData);
        setLiveTankData(payload.tankData);

        // Update nodes with tank data
        setNodes(nds => nds.map(node => {
          if (node.data.isTank) {
            const tankMatch = payload.tankData.find(
              t => t.tankName?.toLowerCase() === node.data.label?.toLowerCase()
            );

            if (tankMatch) {
              console.log(`💧 Updating tank ${node.data.label} with depth:`, tankMatch.depth);
              // Ensure totalDepth is a number to prevent NaN in calculation
              const totalDepthNum = parseFloat(node.data.totalDepth) || 1;
              const currentDepthNum = parseFloat(tankMatch.depth) || 0;
              return {
                ...node,
                data: {
                  ...node.data,
                  currentDepth: currentDepthNum,
                  waterLevel: Math.round((currentDepthNum / totalDepthNum) * 100)
                }
              };
            }
          }
          return node;
        }));
      }
    };

    // Sensor data handler (e.g., flow values)
    const handleSensorData = (payload) => {
      if (payload.stacks) {
        const effluentMap = {};
        payload.stacks
          .filter(s => s.stationType === 'effluent_flow')
          .forEach(s => {
            effluentMap[s.stackName] = s.cumulatingFlow;
            console.log(`🌊 Flow update for ${s.stackName}:`, s.cumulatingFlow);
          });
        setFlowValues(prev => ({ ...prev, ...effluentMap }));
      }
    };

    // Main 'data' listener for all incoming real-time updates
    socket.on('data', (payload) => {
      console.group('📡 Incoming Data Payload');
      console.log('Product ID:', payload.product_id);
      console.log('User:', payload.userName);

      if (payload.tankData) {
        handleTankData(payload);
      } else if (payload.stacks) {
        handleSensorData(payload);
      }

      console.groupEnd();
    });

    return () => {
      socket.off('data');
    };
  }, [socket, socketConnected, userData, setNodes]); // Added setNodes to dependencies for useCallback safety

  // Update nodes with pump status when pumpStates or socketConnected or isEditMode changes
  // This useEffect ensures individual node editability reflects Canvas's isEditMode
  useEffect(() => {
    if (nodes.length > 0) {
      setNodes(nds =>
        nds.map(node => {
          // If the node is a pump or blower, update its status and pending state
          // and crucially, pass down the current `isEditMode` state of the Canvas.
          if (node.data.isPump || node.data.isAirblower) {
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
                onPumpToggle: handlePumpToggle,
                isEditing: isEditMode, // <-- **CRITICAL FIX: Pass Canvas's isEditMode**
              }
            };
          }
          // For other node types, just update `isEditing` based on Canvas's mode
          return {
            ...node,
            data: {
              ...node.data,
              isEditing: isEditMode, // <-- **CRITICAL FIX: Pass Canvas's isEditMode**
            },
          };
        })
      );
    }
  }, [pumpStates, socketConnected, isEditMode, handlePumpToggle, nodes.length, setNodes]); // Added nodes.length and setNodes to dependencies

  // Drag and connect handlers for React Flow
  const onDragStart = useCallback(() => setIsDragging(true), []); // Not used directly, but kept
  const onDragStop = useCallback(() => setIsDragging(false), []); // Not used directly, but kept

  const onConnect = useCallback(
    (params) => {
      if (!isEditMode) return; // Only allow connecting in edit mode
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

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle dropping a new element from the sidebar onto the canvas
  const onDrop = useCallback((event) => {
    if (!isEditMode) return; // Only allow dropping in edit mode
    event.preventDefault();

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const shapeData = event.dataTransfer.getData('application/reactflow');
    if (!shapeData) return;

    const parsed = JSON.parse(shapeData);
    const position = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };

    const isPDF = parsed.isPDF || parsed.type === 'pdfNode';

    const newNode = {
      id: `${parsed.id}_${nodes.length}_${Date.now()}`, // Ensure unique ID
      type: parsed.type,
      position,
      data: {
        ...parsed,
        isEditing: isEditMode, // <-- **CRITICAL FIX: New nodes get current Canvas edit mode**
        isPump: parsed.label?.toLowerCase().includes('pump') || parsed.type === 'pumpNode',
        isAirblower: parsed.label?.toLowerCase().includes('blower') || parsed.type === 'blowerNode',
        isTank: parsed.label?.toLowerCase().includes('tank') || parsed.type === 'tankNode',
        socket,
        socketConnected,
        pumpStatus: false,
        isPending: false,
        onPumpToggle: handlePumpToggle,
        // Callbacks for child components to update label/rotation
        onLabelChange: (id, newLabel) => {
          setNodes(nds => nds.map(n =>
            n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n
          ));
        },
        onRotate: (id, newRotation) => {
          setNodes(nds => nds.map(n =>
            n.id === id ? { ...n, data: { ...n.data, rotation: newRotation } } : n
          ));
        },
        // Preserve initial width/height for new nodes if available
        width: parsed.width || 100,
        height: parsed.height || 100,
      },
      // Set default width/height for React Flow nodes themselves
      width: parsed.width || 100,
      height: parsed.height || 100,
    };
    setNodes((nds) => nds.concat(newNode));

    // Notify Sidebar to remove dragged PDF (if it's a PDF)
    if (isPDF) {
      const dropEvent = new CustomEvent("pdf-dropped", { detail: parsed.id });
      window.dispatchEvent(dropEvent);
    }
  }, [
    isEditMode,
    nodes.length,
    socket,
    socketConnected,
    handlePumpToggle,
    setNodes, // Add setNodes to dependencies
  ]);

  // Save map data to backend
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
        ...(isEditing ? { newStationName: stationName } : {}), // For renaming station
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          // Only save relevant data properties, not transient UI states or functions
          data: {
            label: n.data.label,
            svgPath: n.data.svgPath,
            rotation: n.data.rotation,
            isPump: n.data.isPump || false,
            isAirblower: n.data.isAirblower || false,
            isTank: n.data.isTank || false,
            totalDepth: n.data.totalDepth,
            filePath: n.data.filePath,
            width: n.data.width || n.width, // Save current rendered width/height
            height: n.data.height || n.height,
          },
          width: n.width, // React Flow node dimensions
          height: n.height,
        })),
        edges,
        viewport: savedViewport,
      };

      await axios({ method, url: apiUrl, data: payload });
      alert("Map saved successfully!");
      setNoLiveStation(false);
      setIsEditMode(false); // Exit edit mode after saving
    } catch (err) {
      console.error("Failed to save map:", err.response ? err.response.data : err.message);
      alert("Failed to save map");
    }
  };

  // Delete map data from backend
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this station? This action cannot be undone.")) return;
    try {
      await axios.delete(
        `${API_URL}/api/delete-live-station/${currentUserName || loggedUserName}/${stationName}`
      );
      alert("Station deleted successfully!");
      setNodes([]);
      setEdges([]);
      setIsEditing(false); // No station is loaded now
      setNoLiveStation(true);
      setStationName(""); // Clear station name
    } catch (err) {
      console.error("Failed to delete station:", err.response ? err.response.data : err.message);
      alert("Failed to delete station");
    }
  };

  // Fetch initial pump states from backend for loaded map
  const fetchInitialPumpStates = async (pumpNodes) => {
    const states = {};
    const pumpIds = pumpNodes.map(node => node.id);
    if (pumpIds.length === 0 || !product_id) {
        return states;
    }
    
    // Fetch all pump states for the product in one go if API supports
    // For now, keeping individual fetches as per existing code, but optimizing here:
    try {
        const { data: allPumpStates } = await axios.get(`${API_URL}/api/pump-states/${product_id}`);
        allPumpStates.forEach(pumpState => {
            if (pumpIds.includes(pumpState.pumpId)) {
                states[pumpState.pumpId] = {
                    status: pumpState.status,
                    pending: pumpState.pending,
                    name: pumpNodes.find(n => n.id === pumpState.pumpId)?.data.label // Get label from node
                };
            }
        });
    } catch (error) {
        console.error("Failed to fetch all pump states:", error);
        // Fallback to individual fetches if batch fails or set defaults
        for (const node of pumpNodes) {
            try {
                const { data } = await axios.get(`${API_URL}/api/pump-states/${product_id}/${node.id}`);
                states[node.id] = {
                    status: data.status,
                    pending: data.pending,
                    name: node.data.label
                };
            } catch (err) {
                console.error(`Failed to fetch state for pump ${node.id}:`, err);
                states[node.id] = {
                    status: false,
                    pending: false,
                    name: node.data.label
                };
            }
        }
    }
    return states;
  };


  // Load station data from backend when `selectedStation` changes
  const fetchLiveStation = useCallback(async (user, station) => {
    setNodes([]);
    setEdges([]);
    setPumpStates({});
    setStationName(station); // Set station name immediately for UI
    setCurrentUserName(user);
    setIsEditing(true); // Assume editing until proven otherwise

    try {
      const { data } = await axios.get(
        `${API_URL}/api/find-live-station/${user}/${station}`
      );

      if (!data.data) {
        throw new Error("No station data found");
      }

      const { nodes: savedNodes, edges: savedEdges, viewport: savedVp } = data.data;

      // Filter out pump/blower nodes to fetch their states
      const pumpNodes = savedNodes.filter(
        (n) => n.data.isPump || n.data.isAirblower
      );

      const initialPumpStates = await fetchInitialPumpStates(pumpNodes);
      setPumpStates(initialPumpStates);

      setNodes(
        savedNodes.map((node) => ({
          ...node,
          // Ensure that the node's dimensions are set correctly from saved data
          width: node.width || node.data.width || 100,
          height: node.height || node.data.height || 100,
          data: {
            ...node.data,
            // crucial: `isEditing` for the node should reflect the current Canvas `isEditMode`
            isEditing: isEditMode, // <-- **CRITICAL FIX: Pass Canvas's isEditMode**
            socket,
            socketConnected,
            pumpStatus: initialPumpStates[node.id]?.status || false,
            isPending: initialPumpStates[node.id]?.pending || false,
            onPumpToggle: handlePumpToggle,
            // Pass label/rotation change handlers to allow node to update its own label/rotation
            onLabelChange: (id, newLabel) => {
              setNodes(nds => nds.map(n =>
                n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n
              ));
            },
            onRotate: (id, newRotation) => {
              setNodes(nds => nds.map(n =>
                n.id === id ? { ...n, data: { ...n.data, rotation: newRotation } } : n
              ));
            },
          },
        }))
      );
      setEdges(savedEdges || []);
      setSavedViewport(savedVp || { x: 0, y: 0, zoom: 1 }); // Apply saved viewport
      setNoLiveStation(false); // A station was found
    } catch (err) {
      console.error("Failed to load live station:", err.response ? err.response.data : err.message);
      setIsEditing(false); // No station loaded, so not in 'editing' context
      setNoLiveStation(true); // Indicate no station found
      setNodes([]); // Clear any partial nodes
      setEdges([]); // Clear any partial edges
      setStationName(""); // Clear station name
    }
  }, [isEditMode, socket, socketConnected, handlePumpToggle, setNodes, setEdges, product_id]); // Added dependencies

  // Effect hook to trigger loading when `selectedStation` changes
  useEffect(() => {
    if (selectedStation?.stationName && selectedStation.userName) {
      fetchLiveStation(selectedStation.userName, selectedStation.stationName);
    } else {
      // If no station selected, clear the canvas
      setNodes([]);
      setEdges([]);
      setStationName("");
      setIsEditing(false); // Not editing any specific saved station
      setNoLiveStation(false); // Don't show "no live station" message unless explicitly fetching one
    }
  }, [selectedStation, fetchLiveStation]); // Added fetchLiveStation to dependencies

  // Define node types for React Flow
  const nodeTypes = useMemo(() => {
    // This factory function ensures that `liveTankData` and `flowValues` are
    // passed down correctly to `SVGNode` and `FlowMeterNode` respectively.
    const getNodeTypes = (currentLiveTankData, currentFlowValues) => ({
      svgNode: (props) => <SVGNode {...props} liveTankData={currentLiveTankData} />,
      textNode: TextNode, // Assuming TextNode handles its own data
      pdfNode: PDFNode, // Assuming PDFNode handles its own data
      deviceNode: DeviceNode, // Assuming DeviceNode handles its own data
      pumpNode: (props) => <SVGNode {...props} liveTankData={currentLiveTankData} />, // Pumps are SVGNodes
      blowerNode: (props) => <SVGNode {...props} liveTankData={currentLiveTankData} />, // Blowers are SVGNodes
      flowMeterNode: (props) => (
        <FlowMeterNode
          {...props}
          flowValues={currentFlowValues}
        />
      ),
      tankNode: (props) => <TankNode {...props} liveTankData={currentLiveTankData} />,
    });
    return getNodeTypes(liveTankData, flowValues);
  }, [liveTankData, flowValues]);

  // Define edge types for React Flow
  const edgeTypes = useMemo(() => ({
    piping: PipingEdge,
  }), []);

  return (
    <div className="react-flow-container" style={{
      width: '100%',
      height: '100%',
      position: 'relative'
    }}>
      <div className="react-flow-scrollable" style={{
        width: '100%',
        height: 'calc(100vh - 200px)', // Adjust based on your header/sidebar height
        overflow: 'auto',
        '-webkit-overflow-scrolling': 'touch' // For smooth scrolling on iOS
      }}>
        {noLiveStation && (
          <div className="text-danger text-center mb-3">
            <h5>
              {userType === "admin"
                ? "No station for this user."
                : "No station—create one."}
            </h5>
          </div>
        )}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2">
          {/* Station name input */}
          <div className="flex-fill mb-2 mb-md-0 me-md-3">
            <input
              className="form-control w-100"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              disabled={!isEditMode || (isEditing && userType !== "admin")} // Disable if not in edit mode, or if editing and not admin
              placeholder="Enter Station Name"
            />
          </div>
          {/* Button group */}
          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-warning"
              onClick={() => {
                setIsEditMode((v) => !v); // Toggle edit mode
                // When toggling edit mode, update all nodes' isEditing prop
                setNodes((nds) =>
                  nds.map((n) => ({
                    ...n,
                    data: { ...n.data, isEditing: !isEditMode },
                  }))
                );
              }}
            >
              {isEditMode ? "View Mode" : "Edit Mode"}
            </button>
            <button
              className="btn btn-success"
              onClick={handleSave}
              disabled={!isEditMode || !stationName} // Disable if not in edit mode or no station name
            >
              {isEditing ? "Update Station" : "Save Station"}
            </button>
            {isEditing && userType === "admin" && ( // Only admin can delete existing stations
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Station
              </button>
            )}
          </div>
        </div>
        <div
          ref={reactFlowWrapper}
          className="reactflow-wrapper"
          style={{ width: "100%", height: '800px' }}
          //          style={{ width: "100%", minWidth: '1000px', height: '800px' }}

        >
          <ReactFlow
            style={{
              width: '100%',
              height: '100%',
              touchAction: 'manipulation' // Helps with touch events
            }}
            nodes={nodes}
            edges={edges}
            viewport={savedViewport}
            onMoveEnd={e => {
              if (e?.viewport) {
                setSavedViewport(e.viewport);
              }
            }}
            // Only allow gestures when in edit mode
            zoomOnScroll={isEditMode}
            zoomOnPinch={isEditMode}
            zoomOnDoubleClick={isEditMode}
            panOnDrag={isEditMode}
            panOnScroll={isEditMode}
            // Editing handlers only active in edit mode
            onNodesChange={isEditMode ? onNodesChange : undefined}
            onEdgesChange={isEditMode ? onEdgesChange : undefined}
            onConnect={isEditMode ? onConnect : undefined}
            // Drag and Drop (dropping new elements) always works
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectable={isEditMode} // Show handles only in edit mode
            snapToGrid
            snapGrid={[15, 15]}
          >
            {/* Only show the controls ("+ - ⟳") when editing */}
            {isEditMode && <Controls showZoom={true} showFitView={true} showInteractive={true} />}
            <Background />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default Canvas;