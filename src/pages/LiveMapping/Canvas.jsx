import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import SVGNode from './SVGnode';
import { useSelector } from 'react-redux'; // Import useSelector for Redux
import axios from 'axios';

const nodeTypes = {
  svgNode: SVGNode,
};

function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [searchUserName, setSearchUserName] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Tracks whether it's an edit
  const [noLiveStation, setNoLiveStation] = useState(false); // Tracks if no live station is found

  // Redux selectors
  const { userData } = useSelector((state) => state.user);
  const userType = userData?.validUserOne?.userType || '';
  const loggedUserName = userData?.validUserOne?.userName || ''; // Dynamically fetched username

  const onDragStart = () => setIsDragging(true);
  const onDragStop = () => setIsDragging(false);

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

  const handleSave = async () => {
    try {
      const apiUrl = isEditing
        ? `https://api.ocems.ebhoom.com/api/edit-live-station/${currentUserName || loggedUserName}`
        : 'https://api.ocems.ebhoom.com/api/build-live-station';
      const method = isEditing ? 'patch' : 'post';
      const response = await axios({
        method,
        url: apiUrl,
        data: {
          userName: currentUserName || loggedUserName,
          nodes,
          edges,
        },
      });
      console.log('Saved successfully:', response.data);
      alert('Map saved successfully!');
      setNoLiveStation(false); // After saving, there is now a live station
    } catch (error) {
      console.error('Error saving map:', error);
      alert('Failed to save map. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://api.ocems.ebhoom.com/api/delete-live-station/${currentUserName || loggedUserName}`);
      alert('Live station deleted successfully!');
      setNodes([]);
      setEdges([]);
      setIsEditing(false);
      setNoLiveStation(true); // Set no live station available
    } catch (error) {
      console.error('Error deleting live station:', error);
      alert('Failed to delete live station. Please try again.');
    }
  };

  const fetchLiveStation = async (name) => {
    try {
      const response = await axios.get(`https://api.ocems.ebhoom.com/api/find-live-station/${name}`);
      const { data } = response.data;
      if (data) {
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setCurrentUserName(name);
        setIsEditing(true); // Set editing mode if live station exists
        setNoLiveStation(false); // Live station is available
        console.log(`Live station data fetched for ${name}`);
      } else {
        setIsEditing(false);
        setNoLiveStation(true); // No live station found
      }
    } catch (error) {
      console.error('Error fetching live station:', error);
      setIsEditing(false);
      setNoLiveStation(true); // No live station found
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchUserName.trim()) {
      fetchLiveStation(searchUserName.trim());
    } else {
      alert('Please enter a valid username');
    }
  };

  useEffect(() => {
    if (userType === 'admin') {
      // Admin has a search box to fetch live stations for any user
      setCurrentUserName('');
    } else if (userType === 'user') {
      // User's live station is fetched directly
      fetchLiveStation(loggedUserName);
    }
  }, [userType, loggedUserName]);

  return (
    <div className="react-flow-container">
      <div className="react-flow-scrollable">
        {userType === 'admin' && (
          <div className="admin-search">
            <form className="d-flex" onSubmit={handleSearch} style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Enter username"
                value={searchUserName}
                onChange={(e) => setSearchUserName(e.target.value)}
                className="form-control"
              />
              <button type="submit" style={{ backgroundColor: '#236a80' }} className="btn text-light ms-3">
                Search
              </button>
            </form>
          </div>
        )}
        {noLiveStation && (
          <div className="text-center text-danger mt-3">
            <h5>{userType === 'admin' ? 'No live station available for this user.' : 'No live station available. Please create a new one.'}</h5>
          </div>
        )}
        <div className="reactflow-wrapper" style={{ width: '100%', height: '600px' }}>
          <div className="d-flex justify-content-end">
            <button className="btn btn-success me-3" onClick={handleSave}>
              {isEditing ? 'Update' : 'Save'}
            </button>
            {isEditing && userType === 'admin' && (
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            style={{
              pointerEvents: isDragging ? 'none' : 'auto',
            }}
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




/* 


import { FaTrash } from 'react-icons/fa'; 
  {nodes.map((node) => (
        <div
           key={node.id}
          style={{
            position: 'absolute',
            left: node.position.x + 50, 
            top: node.position.y,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '5px',
            zIndex: 1000,
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.68)',
          }} 
        >
         <FaTrash
            onClick={() => handleDeleteNode(node.id)}
            style={{ color: 'red', cursor: 'pointer' }}
          /> 
        </div>
      ))} */