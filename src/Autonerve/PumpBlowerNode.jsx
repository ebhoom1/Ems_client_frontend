import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import './PumpBlowerNode.css';

function PumpBlowerNode({ id, data, setNodes }) {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeName, setNodeName] = useState(data.name);
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    setNodeName(data.name);
  }, [data.name]);

  const handleSaveChanges = () => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, name: nodeName };
        }
        return node;
      })
    );
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveChanges();
    }
  };

  const handleToggle = () => {
    setIsOn((prev) => !prev);
    console.log(`Device ${data.id} is now ${!isOn ? 'ON' : 'OFF'}`);
  };

  return (
    <div className="pump-blower-node">
      <Handle type="target" position={Position.Top} />
      
      <div className="node-content">
        {isEditing ? (
          <input
            type="text"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            onBlur={handleSaveChanges}
            onKeyDown={handleKeyDown}
            className="node-name-input"
            autoFocus
          />
        ) : (
          <div className="node-name" onDoubleClick={() => setIsEditing(true)}>
            {nodeName}
          </div>
        )}

        <div className="node-id">{data.id}</div>

        <label className="switch">
          <input type="checkbox" checked={isOn} onChange={handleToggle} />
          <span className="slider"></span>
        </label>

        <div className={`switch-label ${isOn ? 'running' : 'off'}`}>
          {isOn ? 'RUNNING' : 'OFF'}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default PumpBlowerNode;