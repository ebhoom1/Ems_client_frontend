import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import SVGNode from './SVGnode';
/* import { FaTrash } from 'react-icons/fa'; 
 */
// nodeTypes definition with SVGNode
const nodeTypes = {
  svgNode: SVGNode,
};

function Canvas() {
  const initialNodes = [];
  const initialEdges = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragStop = () => {
    setIsDragging(false);
  };

  const onResizeStart = () => {
    setIsDragging(true);
  };

  const onResizeStop = () => {
    setIsDragging(false);
  };

  // Handle connection between nodes (if applicable)
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = (event) => {
    event.preventDefault(); // Allow dropping
  };

  const onDrop = async (event) => {
    event.preventDefault(); // Prevent default behavior

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

    // Simulate fetching backend value
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

  // Simulate backend data fetching based on the id
  const fetchBackendData = async (id) => {
    if (id === 'meter') {
      return '34ml/hr'; // Replace with actual backend API call
    } else if (id === 'energymeter') {
      return '22kw'; // Replace with actual backend API call
    } else if (id === 'tank') {
      return '500L'; // Simulated backend value for the tank
    }
    return '';
  };

  const handleDeleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId)); // Delete the selected node
  };

  return (
    <div className="react-flow-container">
      <div className="react-flow-scrollable">
        <div className="reactflow-wrapper" style={{ width: '100%', height: '600px' }}>
          <div className="d-flex justify-content-end">
            <button className="btn btn-success">Save</button>
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

      {/* Always render the Delete box next to each node */}
      {nodes.map((node) => (
        <div
         /*  key={node.id}
          style={{
            position: 'absolute',
            left: node.position.x + 50, 
            top: node.position.y,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '5px',
            zIndex: 1000,
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.68)',
          }} */
        >
          {/* <FaTrash
            onClick={() => handleDeleteNode(node.id)}
            style={{ color: 'red', cursor: 'pointer' }}
          /> */}
        </div>
      ))}
    </div>
  );
}

export default Canvas;
