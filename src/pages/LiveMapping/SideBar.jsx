
import React, { useState } from 'react';
import stank from '../../assests/images/stank.svg';
import filtertank from '../../assests/images/filtertank.svg';
import connector from '../../assests/images/connector.svg';
import elbow from '../../assests/images/elbow.svg';
import filters from '../../assests/images/filters.svg';
import flowmeter from '../../assests/images/flowmeter.svg';
import image1 from '../../assests/images/image1.svg';
import meter from '../../assests/images/meter.svg';
import pump from '../../assests/images/pump.svg';
import tank from '../../assests/images/tank.svg';
import wheel from '../../assests/images/wheel.svg';
import zigzag from '../../assests/images/zigzag.svg';
import pipelong from '../../assests/images/pipelong.svg';
import connect from '../../assests/images/connect.svg';
import filterset from '../../assests/images/filterset.svg';
import yellowtank from '../../assests/images/yellowtank.svg';
import bluetank from '../../assests/images/bluetank.svg';
import pumpsingle from '../../assests/images/pumpsingle.svg';
import connectinginlet from '../../assests/images/conectinginlet.svg';
import flowout from '../../assests/images/flowout.svg';
import energymeter from '../../assests/images/energymeter.svg';
import upipe from '../../assests/images/upipe.svg';
import straightconnector from '../../assests/images/straightconnector.svg';
import blacktank from '../../assests/images/blacktank.svg';
import greentank from '../../assests/images/greentank.svg';
import imagenext from '../../assests/images/imagenext.svg';
import solar from '../../assests/images/solar.svg';
import imagenew from '../../assests/images/imagenew.svg';
import curvedpipe from '../../assests/images/curvedpipe.png';
import bubble from '../../assests/images/newbubble.svg'
import widetank from '../../assests/images/widetank.svg'
import tanksamp from '../../assests/images/tanksamp.svg'
import zvalve from '../../assests/images/z.png'
import lineround from '../../assests/images/lineround.svg'
import linearrow from '../../assests/images/arrowline.svg'
import aorangeline from '../../assests/images/aorangeline.svg'
import ablackline from '../../assests/images/ablackline.svg'
import agreenline from '../../assests/images/agreenline.svg'




import './livemapping.css';

// Default shapes
const defaultShapes = [
  { id: 'stank', label: 'Stank', isSVG: true, svgPath: stank },
  { id: 'filtertank', label: 'Filter Tank', isSVG: true, svgPath: filtertank },
  { id: 'connector', label: 'Connector', isSVG: true, svgPath: connector },
  { id: 'elbow', label: 'Elbow', isSVG: true, svgPath: elbow },
  { id: 'filters', label: 'Filters', isSVG: true, svgPath: filters },
  { id: 'flowmeter', label: 'Flowmeter', isSVG: true, svgPath: flowmeter },
  { id: 'image1', label: 'Image 1', isSVG: true, svgPath: image1 },
  { id: 'meter', label: 'Meter', isSVG: true, svgPath: meter },
  { id: 'pump', label: 'Pump', isSVG: true, svgPath: pump },
  { id: 'tank', label: 'Tank', isSVG: true, svgPath: tank },
  { id: 'wheel', label: 'Wheel', isSVG: true, svgPath: wheel },
  { id: 'zigzag', label: 'Zigzag', isSVG: true, svgPath: zigzag },
  { id: 'pipelong', label: 'Pipe Long', isSVG: true, svgPath: pipelong },
  { id: 'connect', label: 'Connect', isSVG: true, svgPath: connect },
  { id: 'filterset', label: 'Filter Set', isSVG: true, svgPath: filterset },
  { id: 'yellowtank', label: 'Yellow Tank', isSVG: true, svgPath: yellowtank },
  { id: 'bluetank', label: 'Blue Tank', isSVG: true, svgPath: bluetank },
  { id: 'pumpsingle', label: 'Pump Single', isSVG: true, svgPath: pumpsingle },
  { id: 'connectinginlet', label: 'Connecting Inlet', isSVG: true, svgPath: connectinginlet },
  { id: 'energymeter', label: 'Energymeter', isSVG: true, svgPath: energymeter },
  { id: 'upipe', label: 'Upipe', isSVG: true, svgPath: upipe },
  { id: 'straightconnector', label: 'Straight Connector', isSVG: true, svgPath: straightconnector },
  { id: 'blacktank', label: 'Black Tank', isSVG: true, svgPath: blacktank },
  { id: 'greentank', label: 'Green Tank', isSVG: true, svgPath: greentank },
  { id: 'imagenext', label: 'Image Next', isSVG: true, svgPath: imagenext },
  { id: 'solar', label: 'Solar', isSVG: true, svgPath: solar },
  { id: 'imagenew', label: 'Image New', isSVG: true, svgPath: imagenew },
  { id: 'flowout', label: 'Flow Out', isSVG: true, svgPath: flowout },
  { id: 'curvedpipe', label: 'Curved Pipe', isSVG: true, svgPath: curvedpipe },
  { id: 'bubble', label: 'Bubble', isSVG: true, svgPath: bubble },
  { id: 'widetank', label: 'Widetank', isSVG: true, svgPath: widetank },
  { id: 'tanksamp', label: 'Tanksamp', isSVG: true, svgPath: tanksamp },
  { id: 'zvalve', label: 'zvalve', isSVG: true, svgPath: zvalve },
  { id: 'lineround', label: 'lineround', isSVG: true, svgPath: lineround },
  { id: 'linearrow', label: 'linearrow', isSVG: true, svgPath: linearrow },
  { id: 'aorangeline', label: 'aorangeline', isSVG: true, svgPath: aorangeline },
  { id: 'agreenline', label: 'agreenline', isSVG: true, svgPath: agreenline },
  { id: 'ablackline', label: 'ablackline', isSVG: true, svgPath: ablackline },

];

function Sidebar() {
  const [shapes, setShapes] = useState(defaultShapes);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newText, setNewText] = useState(''); // Updated variable name to avoid conflicts

  const handleTextAdd = () => {
    if (newText.trim()) {
      const newTextShape = {
        id: `text_${shapes.length}`,
        label: newText.trim(),
        isText: true,
      };
      setShapes((prevShapes) => [...prevShapes, newTextShape]);
      setNewText('');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile && selectedFile.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const newShape = {
          id: `user_${shapes.length}`,
          label: `User SVG ${shapes.length + 1}`,
          isSVG: true,
          svgPath: reader.result,
        };
        setShapes((prevShapes) => [...prevShapes, newShape]);
        setSelectedFile(null);
        alert('SVG uploaded successfully!');
      };
      reader.readAsDataURL(selectedFile);
    } else {
      alert('Please select a valid SVG file before uploading.');
    }
  };

  const onDragStart = (event, shape) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({
        ...shape,
        type: shape.isText ? 'textNode' : 'svgNode',
      })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sidebar-container">
      <aside>
        <div className="description">
          Drag a shape or text box to the canvas, or upload your own SVG.
        </div>
        <div className="upload-container">
          <input
            type="file"
            accept=".svg"
            onChange={handleFileChange}
            className="form-control mb-2"
          />
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            Upload SVG
          </button>
        </div>
        <div className="text-input-container">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter text"
            className="form-control mb-2"
          />
          <button
            onClick={handleTextAdd}
            className="btn btn-primary"
            disabled={!newText.trim()}
          >
            Add Text
          </button>
        </div>
        <div className="shapes-container">
          {shapes.map((shape) => (
            <div
              key={shape.id}
              className="dndnode"
              onDragStart={(event) => onDragStart(event, shape)}
              draggable
            >
              {shape.isSVG ? (
                <img
                  src={shape.svgPath}
                  alt={shape.label}
                  style={{ width: '50px', height: '50px' }}
                />
              ) : (
                <div
                  style={{
                    padding: '10px',
                    backgroundColor: '#f0f0f0',
                    textAlign: 'center',
                    borderRadius: '4px',
                    cursor: 'grab',
                  }}
                >
                  {shape.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;

