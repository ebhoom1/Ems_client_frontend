import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import SVGNode from './SVGnode';
import TextNode from './TextNode';
import { useSelector } from 'react-redux';
import axios from 'axios';

const nodeTypes = {
  svgNode: SVGNode,
  textNode: ({ data }) => (
    <div
      style={{
        padding: '10px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'move',
        textAlign: 'center',
      }}
    >
      {data.label}
    </div>
  ),
};

function Canvas() {
  const { userId } = useSelector((state) => state.selectedUser);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [noLiveStation, setNoLiveStation] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // New state for edit mode

  const { userData } = useSelector((state) => state.user);
  const userType = userData?.validUserOne?.userType || '';
  const loggedUserName = userData?.validUserOne?.userName || '';
  const storedUserId = sessionStorage.getItem('selectedUserId');

  const onDragStart = () => setIsDragging(true);
  const onDragStop = () => setIsDragging(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = (event) => {
    event.preventDefault();
  };

  const onDrop = (event) => {
    if (!isEditMode) return; // Disable dropping when not in edit mode

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

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode = {
      id: `${parsedShapeData.id}_${nodes.length}`,
      type: parsedShapeData.type,
      position,
      data: { label: parsedShapeData.label, svgPath: parsedShapeData.svgPath },
    };

    setNodes((nds) => nds.concat(newNode));
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
          nodes: nodes.map((node) => ({
            ...node,
            rotation: node.data.rotation,
            width: node.width,
            height: node.height,
          })),
          edges,
        },
      });
      console.log('Saved successfully:', response.data);
      alert('Map saved successfully!');
      setNoLiveStation(false);
      setIsEditMode(false); // Disable edit mode after saving
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
      setNoLiveStation(true);
    } catch (error) {
      console.error('Error deleting live station:', error);
      alert('Failed to delete live station. Please try again.');
    }
  };

  const fetchLiveStation = async (name) => {
    setNodes([]);
    setEdges([]);

    try {
      const response = await axios.get(`https://api.ocems.ebhoom.com/api/find-live-station/${name}`);
      const { data } = response.data;
      if (data) {
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setCurrentUserName(name);
        setIsEditing(true);
        setNoLiveStation(false);
      } else {
        setIsEditing(false);
        setNoLiveStation(true);
      }
    } catch (error) {
      console.error('Error fetching live station:', error);
      setIsEditing(false);
      setNoLiveStation(true);
    }
  };

  useEffect(() => {
    if (userType === 'admin') {
      const selectedUserFromStorage = storedUserId;
      if (selectedUserFromStorage) {
        fetchLiveStation(selectedUserFromStorage);
      }
    } else if (userType === 'user') {
      fetchLiveStation(loggedUserName);
    }
  }, [userType, loggedUserName, storedUserId]);

  return (
    <div className="react-flow-container">
      <div className="react-flow-scrollable">
        {noLiveStation && (
          <div className="text-center text-danger mt-3">
            <h5>{userType === 'admin' ? 'No live station available for this user.' : 'No live station available. Please create a new one.'}</h5>
          </div>
        )}
        <div className="reactflow-wrapper" style={{ width: '100%', height: '600px' }}>
          <div className="d-flex justify-content-end">
            <button className="btn btn-warning me-3" onClick={() => setIsEditMode((prev) => !prev)}>
              {isEditMode ? ' Edit' : ' Edit'}
            </button>
            <button className="btn btn-success me-3" onClick={handleSave} disabled={!isEditMode}>
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
            onNodesChange={isEditMode ? onNodesChange : undefined}
            onEdgesChange={isEditMode ? onEdgesChange : undefined}
            onConnect={isEditMode ? onConnect : undefined}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            style={{
              pointerEvents: isDragging || !isEditMode ? 'none' : 'auto',
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
