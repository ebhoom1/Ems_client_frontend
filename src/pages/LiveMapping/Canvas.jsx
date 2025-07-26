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
import TextNode from "./TextNode";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
import PipingEdge from "./PipingEdge";
import PDFNode from "./PDFNode";
import DeviceNode from "./DeviceNode"; 
import FlowMeterNode from "./FlowMeterNode";
import TankNode from "./TankNode";

function Canvas({
  selectedStation,
  isEditMode,
  setIsEditMode,
  socket,
  socketConnected,
  pumpStates, // <- Received from LiveLayout
  onPumpToggle, // <- Received from LiveLayout
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
  const [flowValues, setFlowValues] = useState({});

  const [savedViewport, setSavedViewport] = useState({
    x: 0,
    y: 0,
    zoom: 1,
  });

 const product_id = String(userData?.validUserOne?.productID || '');
   console.log('Canvas - Received pumpStates from LiveLayout:', pumpStates);
  console.log('Canvas - Product ID:', product_id);

  // Tank and sensor data handling from socket
  useEffect(() => {
    if (!socket || !socketConnected) return;

    const userName = userData?.validUserOne?.userName;
    console.log('🔌 Canvas - Connecting socket for user:', userName);
    socket.emit('joinRoom', userName);

    // Tank data handler
    const handleTankData = (payload) => {
      console.log('📦 [TANK DATA RECEIVED in Canvas]', payload);
      
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
              return {
                ...node,
                data: {
                  ...node.data,
                  currentDepth: tankMatch.depth,
                  waterLevel: Math.round((tankMatch.depth / (node.data.totalDepth || 1)) * 100)
                }
              };
            }
          }
          return node;
        }));
      }
    };

    // Sensor data handler (keep your existing flow value logic)
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

    // Set up listeners
    socket.on('data', (payload) => {
      console.group('📡 Canvas - Incoming Data Payload');
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
  }, [socket, socketConnected, userData, setNodes]);

  // Update nodes with pump status when pumpStates change from LiveLayout
  useEffect(() => {
    console.log('Canvas - pumpStates changed:', pumpStates);
    console.log('Canvas - nodes length:', nodes.length);
    
    if (nodes.length > 0 && Object.keys(pumpStates).length > 0) {
      console.log('Canvas - Updating nodes with pump states');
      
      setNodes(nds =>
        nds.map(node => {
          const pumpState = pumpStates[node.id];

          if (!pumpState || !node.data.isPump) {
            return node;
          }
          
          console.log(`Canvas - Updating node ${node.id} with pump details:`, pumpState);
          
          return {
            ...node,
            data: {
              ...node.data,
              // Pass the complete pump state as pumpDetails
              pumpDetails: pumpState,
              // Also update the legacy props for backward compatibility
              pumpStatus: pumpState.status,
              isPending: pumpState.pending || false,
            },
          };
        })
      );
    }
  }, [pumpStates, nodes.length, setNodes]);

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
      data: {
        ...parsed,
        isEditing: true,
        isPump: parsed.label.toLowerCase().includes('pump'),
        isAirblower: parsed.label.toLowerCase().includes('blower'),
        socket,
        socketConnected,
        pumpStatus: false,
        isPending: false,
        pumpDetails: pumpStates[`${parsed.id}_${nodes.length}`] || null, // Initialize with existing state if any
        onPumpToggle: onPumpToggle, // Use prop from LiveLayout
        onLabelChange: (id, newLabel) => {
          setNodes(nds => nds.map(n => 
            n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n
          ));
        },
        onRotate: (id, newRotation) => {
          setNodes(nds => nds.map(n => 
            n.id === id ? { ...n, data: { ...n.data, rotation: newRotation } } : n
          ));
        }
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [
    isEditMode,
    nodes.length,
    socket,
    socketConnected,
    onPumpToggle, // Use prop from LiveLayout
    pumpStates,
    setNodes,
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
            filePath: n.data.filePath,
            width: n.width,
            height: n.height,
          },
        })),
        edges,
        viewport: savedViewport,
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

  // Fetch initial pump states (this might not be needed if LiveLayout handles it)
  const fetchInitialPumpStates = async (pumpNodes) => {
    const states = {};
    await Promise.all(
      pumpNodes.map(async (node) => {
        try {
          const { data } = await axios.get(
            `${API_URL}/api/pump-states/${product_id}/${node.id}`
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
    console.log('Canvas - Fetching live station:', user, station);
    setNodes([]);
    setEdges([]);
    
    try {
      const { data } = await axios.get(
        `${API_URL}/api/find-live-station/${user}/${station}`
      );
      if (!data.data) throw new Error();
      
      const { nodes: savedNodes, edges: savedEdges } = data.data;
      
      console.log('Canvas - Loaded nodes:', savedNodes);
      
      // Set viewport if available
      if (data.data.viewport) {
        setSavedViewport(data.data.viewport);
      }
      
      setNodes(
        savedNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isEditing: false,
            socket,
            socketConnected,
            pumpStatus: pumpStates[node.id]?.status || false,
            isPending: pumpStates[node.id]?.pending || false,
            pumpDetails: pumpStates[node.id] || null, // Add pump details from LiveLayout
            onPumpToggle: onPumpToggle, // Use prop from LiveLayout
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
      
      console.log('Canvas - Station loaded successfully');
    } catch (error) {
      console.error('Canvas - Failed to load station:', error);
      setIsEditing(false);
      setNoLiveStation(true);
    }
  };

  // Load station when selected
  useEffect(() => {
    if (selectedStation?.stationName) {
      console.log('Canvas - Selected station changed:', selectedStation);
      fetchLiveStation(selectedStation.userName, selectedStation.stationName);
    } else {
      setNodes([]);
      setEdges([]);
      setStationName("");
      setIsEditing(false);
    }
  }, [selectedStation, socketConnected]);

  // Node types with live data
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
      pumpNode: props => <SVGNode {...props} liveTankData={liveTankData} />,
      blowerNode: props => <SVGNode {...props} liveTankData={liveTankData} />,
      flowMeterNode: props => (
        <FlowMeterNode
          {...props}
          flowValues={flowValues}
        />
      ),
      tankNode: (p) => <TankNode {...p} liveTankData={liveTankData} />,
    });
    return getNodeTypes(liveTankData);
  }, [liveTankData, flowValues]);

  const edgeTypes = {
    piping: PipingEdge,
  };

  return (
    <div className="react-flow-container" style={{ 
      width: '100%',
      height: '100%',
      position: 'relative'
    }}>
      <div className="react-flow-scrollable" style={{
        width: '100%',
        height: 'calc(100vh - 200px)',
        overflow: 'auto',
        '-webkit-overflow-scrolling': 'touch'
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
          <div className="flex-fill mb-2 mb-md-0 me-md-3">
            <input
              className="form-control w-100"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              disabled={isEditing && userType !== "admin"}
              placeholder="Enter station name"
            />
          </div>

          <div className="d-flex flex-wrap gap-2">
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
            height: "600px",
            minWidth: '1000px',
            minHeight: '600px'
          }}
        >
          <ReactFlow
            style={{
              width: '100%',
              height: '100%',
              touchAction: 'manipulation'
            }}
            nodes={nodes}
            edges={edges}
            viewport={savedViewport}
            onMoveEnd={e => e?.viewport && setSavedViewport(e.viewport)}

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
            snapGrid={[15,15]}
          >
            {/* only show the "+ – ⟳" controls when editing */}
            {isEditMode && <Controls />}  
            <Background />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default Canvas;