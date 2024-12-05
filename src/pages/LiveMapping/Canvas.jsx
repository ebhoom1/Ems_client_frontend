import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import { toPng } from 'html-to-image'; // Import html-to-image
import { API_URL } from '../../utils/apiConfig';
import SVGNode from './SVGnode';

const nodeTypes = {
  svgNode: SVGNode,
};

function Canvas() {
  const initialNodes = [];
  const initialEdges = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isDragging, setIsDragging] = useState(false);
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('user'); // Default is user, can be 'admin'
  const [mapData, setMapData] = useState(null);
  const canvasRef = useRef(null); // Reference for the canvas container

  const apiEndpoint = `${API_URL}/api/build-live-station`;
  const getLiveStationEndpoint = `${API_URL}/api/find-live-station/`;

  const onDragStart = () => setIsDragging(true);
  const onDragStop = () => setIsDragging(false);
  const onResizeStart = () => setIsDragging(true);
  const onResizeStop = () => setIsDragging(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = (event) => {
    event.preventDefault();
  };

  const onDrop = async (event) => {
    event.preventDefault();
    const reactFlowBounds = event.target.getBoundingClientRect();
    const shapeData = event.dataTransfer.getData('application/reactflow');

    if (!shapeData) {
      console.error('No data found in drag event');
      return;
    }

    let parsedShapeData;
    try {
      parsedShapeData = JSON.parse(shapeData);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return;
    }

    const backendValue = await fetchBackendData(parsedShapeData.id);

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode = {
      id: `${parsedShapeData.id}_${nodes.length}`,
      type: 'svgNode',
      position,
      data: { label: parsedShapeData.label, svgPath: parsedShapeData.svgPath, backendValue },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const fetchBackendData = async (id) => {
    if (id === 'meter') {
      return '34ml/hr';
    } else if (id === 'energymeter') {
      return '22kw';
    } else if (id === 'tank') {
      return '500L';
    }
    return '';
  };

  const handleDeleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
  };

  const handleSave = async () => {
    if (!userName) {
      alert('Please enter a username');
      return;
    }

    if (!canvasRef.current) {
      alert('Canvas is not available');
      return;
    }

    try {
      // Convert the canvas to an image (base64 PNG string)
      const dataUrl = await toPng(canvasRef.current);

      // Convert base64 to Blob
      const response = await fetch(dataUrl);
      const imageBlob = await response.blob();

      // Create a form data object
      const formData = new FormData();
      formData.append('userName', userName);
      formData.append('liveStationImage', imageBlob, 'live-station.png'); // Name the file appropriately

      // If userType is admin, send the live station to the corresponding user
      const endpoint = userType === 'admin' ? `${API_URL}/api/edit-live-station/${userName}` : apiEndpoint;
      const saveResponse = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const responseData = await saveResponse.json();
      if (saveResponse.ok) {
        alert('Live Station saved successfully');
        setMapData(responseData.data);
      } else {
        alert(responseData.message || 'Failed to save Live Station');
      }
    } catch (error) {
      console.error('Error saving live station:', error);
    }
  };

  const fetchMapData = async () => {
    if (!userName) return;

    try {
      const endpoint = `${getLiveStationEndpoint}${userName}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (response.ok && data.data) {
        setMapData(data.data);
      } else {
        setMapData(null);
      }
    } catch (error) {
      console.error('Error fetching live station:', error);
    }
  };

  const handleEdit = () => {
    if (userType === 'admin') {
      setMapData(null); // Admin can edit live station
    } else {
      alert('Only admin can edit other users live stations');
    }
  };

  useEffect(() => {
    if (userName) {
      fetchMapData();
    }
  }, [userName, userType]);

  return (
    <div className="react-flow-container">
      {/* Admin: Search for user to manage their live station */}
      {userType === 'admin' && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            placeholder="Enter Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="form-control mr-2"
          />
          <button onClick={fetchMapData} className="btn btn-primary">
            Search
          </button>
        </div>
      )}

      {/* User: No search, just username and save */}
      {userType === 'user' && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            placeholder="Enter Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="form-control mr-2"
          />
          <button onClick={handleSave} className="btn btn-success">
            Save
          </button>
        </div>
      )}

      {/* Display and Edit Live Station */}
      {mapData ? (
        <div>
          <h3>Live Station Map</h3>
          <img
            src={`${API_URL}/${mapData.liveStationImage}`}
            alt="Live Station Map"
            style={{ width: '100%', height: '400px', objectFit: 'contain' }}
          />
          <button onClick={handleEdit} className="btn btn-primary mt-2">
            Edit
          </button>
        </div>
      ) : (
        <div className="react-flow-scrollable">
          <div
            className="reactflow-wrapper"
            ref={canvasRef} // Attach the reference to the container
            style={{ width: '100%', height: '600px' }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDragOver={onDragOver}
              onDrop={onDrop}
              nodeTypes={nodeTypes}
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;
