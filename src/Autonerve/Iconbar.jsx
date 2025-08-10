import React, { useState } from 'react';

// --- Asset Imports ---
import settlingnew from '../assests/images/settlingnew.svg';
import watertanknew from '../assests/images/watertanknew.svg';
import flowmeter from '../assests/images/flowmeter.svg';
import meter from '../assests/images/meter.svg';
import pump from '../assests/images/pump.svg';
import tank from '../assests/images/tank.svg';
import airblower from '../assests/images/wheel.svg';
import pumpsingle from '../assests/images/pumpsingle.svg';
import energymeter from '../assests/images/energymeter.svg';
import expo from '../assests/images/expo.svg';

import './Iconbar.css';

const defaultShapes = [
  { id: 'settlingnew',  label: 'Settling Tank',  isSVG: true, svgPath: settlingnew },
  { id: 'watertanknew', label: 'Water Tank', isSVG: true, svgPath: watertanknew, isTank: true },
  { id: 'flowmeter',    label: 'Flowmeter',    isSVG: true, svgPath: flowmeter,    isFlowmeter: true },
  { id: 'meter',        label: 'Meter',        isSVG: true, svgPath: meter },
  { id: 'pump',         label: 'Pump',         isSVG: true, svgPath: pump, isPump: true },
  { id: 'tank',         label: 'Generic Tank',         isSVG: true, svgPath: tank, isTank: true },
  { id: 'airblower',    label: 'Air Blower',    isSVG: true, svgPath: airblower,    isAirblower: true },
  { id: 'pumpsingle',   label: 'Pump Single',  isSVG: true, svgPath: pumpsingle, isPump: true },
  { id: 'energymeter',  label: 'Energy Meter',  isSVG: true, svgPath: energymeter },
  { id: 'expo',         label: 'Expo',  isSVG: true, svgPath: expo },
];

function Iconbar() {
  const [shapes, setShapes] = useState(defaultShapes);

  const onDragStart = (event, shape) => {
    const nodeData = JSON.stringify(shape);
    event.dataTransfer.setData('application/reactflow', nodeData);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isPNG = file.type === 'image/png';
    const isPDF = file.type === 'application/pdf';

    if (!isPNG && !isPDF) {
      alert("Invalid file type. Please upload a PNG or PDF.");
      return;
    }

    // For PDF files, we'll store the file object directly
    // For PNG files, we can still use the blob URL
    const newShape = {
      id: `file-${Date.now()}`,
      label: file.name,
      isPNG,
      isPDF,
      filePath: isPNG ? URL.createObjectURL(file) : null,
      fileObject: isPDF ? file : null, // Store the actual file object for PDFs
    };

    setShapes((prevShapes) => [...prevShapes, newShape]);
  };

  const getFileIcon = (shape) => {
    if (shape.isPNG) {
      return <img src={shape.filePath} alt={shape.label} title={shape.label} className="uploaded-image-preview" />;
    }
    if (shape.isPDF) {
      return <div className="pdf-preview" title={shape.label}>📄</div>;
    }
    if (shape.isSVG) {
      return <img src={shape.svgPath} alt={shape.label} title={shape.label} />;
    }
    return null;
  };

  return (
    <aside className="sidebar">
      <div className="description">Drag an icon to the canvas.</div>
      <div className="shapes-container">
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className="shape-item"
            onDragStart={(event) => onDragStart(event, shape)}
            draggable
          >
            {getFileIcon(shape)}
          </div>
        ))}
      </div>
      
      <div className="upload-section">
        <label htmlFor="file-upload" className="upload-button">
          + Add File
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".png,.pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </aside>
  );
}

export default Iconbar;


