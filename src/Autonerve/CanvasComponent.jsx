import React, { useCallback, useRef, useState, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './CanvasComponent.css';

import PumpBlowerNode from './PumpBlowerNode';
import ImageNode from './ImageNode';
import PdfNode from './PdfNode';

function CanvasComponent() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState(new Map()); // Store file objects

  const nodeTypes = useMemo(() => ({
    pumpBlowerNode: (props) => <PumpBlowerNode {...props} setNodes={setNodes} />,
    imageNode: ImageNode,
    pdfNode: PdfNode,
  }), [setNodes]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleSave = () => {
    if (nodes.length === 0) {
      alert("Canvas is empty. Add some devices before saving.");
      return;
    }
    const stationData = {
      nodes: nodes,
      edges: edges,
      savedAt: new Date().toISOString(),
    };
    console.log('--- Station Saved ---');
    console.log(JSON.stringify(stationData, null, 2));
    alert('Station layout has been saved to the console!');
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const dataString = event.dataTransfer.getData('application/reactflow');
      if (!dataString) return;
      const shapeData = JSON.parse(dataString);
      
      const isSpecialNode = shapeData.isPump || shapeData.isAirblower;
      const isPngNode = shapeData.isPNG;
      const isPdfNode = shapeData.isPDF;

      const promptLabel = shapeData.isPNG || shapeData.isPDF ? "file" : shapeData.label;

      const manualId = prompt(`Enter a unique ID for the new ${promptLabel}:`);
      if (!manualId) {
        alert("ID is required. Aborting.");
        return;
      }
      if (nodes.some(node => node.id === manualId)) {
        alert(`ID "${manualId}" already exists. Please choose a unique ID.`);
        return;
      }

      let deviceName = shapeData.label;
      if (isSpecialNode) {
        const nameInput = prompt(`Enter a name for device ${manualId}:`);
        if (!nameInput) {
          alert("Name is required. Aborting.");
          return;
        }
        deviceName = nameInput;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      let nodeType = 'default';
      if (isSpecialNode) nodeType = 'pumpBlowerNode';
      else if (isPngNode) nodeType = 'imageNode';
      else if (isPdfNode) nodeType = 'pdfNode';

      // For PDF nodes, store the file object and create a unique key
      let fileData = null;
      if (isPdfNode && shapeData.fileObject) {
        const fileKey = `${manualId}-${Date.now()}`;
        setUploadedFiles(prev => new Map(prev.set(fileKey, shapeData.fileObject)));
        fileData = fileKey;
      }

      const newNode = {
        id: manualId,
        type: nodeType,
        position,
        data: {
          id: manualId,
          name: deviceName,
          filePath: shapeData.filePath, // used by ImageNode
          fileKey: fileData, // used by PdfNode to reference the stored file
          label: (!isSpecialNode && !isPngNode && !isPdfNode) ? (
            <div style={{ textAlign: 'center' }}>
              <img src={shapeData.svgPath} alt={shapeData.label} />
              <div>{manualId}</div>
            </div>
          ) : null
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes, setUploadedFiles]
  );

  return (
    <div className="canvas-wrapper" ref={reactFlowWrapper}>
      <button onClick={handleSave} className="save-button">
        💾 Save
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      
      {/* Pass uploaded files to child components through context or props */}
      <div style={{ display: 'none' }}>
        {Array.from(uploadedFiles.entries()).map(([key, file]) => (
          <div key={key} data-file-key={key} data-file={file} />
        ))}
      </div>
    </div>
  );
}

export default CanvasComponent;