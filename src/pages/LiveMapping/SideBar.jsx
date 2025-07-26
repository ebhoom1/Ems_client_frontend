import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import airblower from '../../assests/images/wheel.svg';
import bluetank from '../../assests/images/bluetank.svg';
import pumpsingle from '../../assests/images/pumpsingle.svg';
import energymeter from '../../assests/images/energymeter.svg';
import settlingnew from '../../assests/images/settlingnew.svg';
import watertanknew from '../../assests/images/watertanknew.svg';
import expo from '../../assests/images/expo.svg'
import './livemapping.css';
import { API_URL } from '../../utils/apiConfig';

// Default shapes
const defaultShapes = [
  { id: 'settlingnew',  label: 'settlingnew',  isSVG: true, svgPath: settlingnew },
  { id: 'watertanknew', label: 'watertanknew', isSVG: true, svgPath: watertanknew },
  { id: 'flowmeter',    label: 'Flowmeter',    isSVG: true, svgPath: flowmeter,    isFlowmeter: true },
  { id: 'meter',        label: 'Meter',        isSVG: true, svgPath: meter },
  { id: 'pump',         label: 'Pump',         isSVG: true, svgPath: pump },
  { id: 'tank',         label: 'Tank',         isSVG: true, svgPath: tank,         isTank: true },
  { id: 'airblower',    label: 'Airblower',    isSVG: true, svgPath: airblower,    isAirblower: true },
  { id: 'pumpsingle',   label: 'Pump Single',  isSVG: true, svgPath: pumpsingle },
  { id: 'energymeter',  label: 'Energymeter',  isSVG: true, svgPath: energymeter },
    { id: 'expo',  label: 'expo',  isSVG: true, svgPath: expo },

];

// Accepted file types
const acceptedFileTypes = [
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
];

function Sidebar() {
  const [shapes, setShapes] = useState(defaultShapes);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newText, setNewText] = useState('');
  const [fileTypeError, setFileTypeError] = useState('');

  useEffect(() => {
    const loadServerImages = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/list-uploaded-files`);
        const removedPDFs = JSON.parse(localStorage.getItem("removedPDFs") || "[]");
    
        const serverShapes = res.data
          .map((filename, index) => {
            const extension = filename.split('.').pop().toLowerCase();
            const isImage = ['svg', 'png', 'jpg', 'jpeg'].includes(extension);
            const id = `server_${index}`;
    
            return {
              id,
              label: filename.replace(/\.[^/.]+$/, ''),
              isSVG: extension === 'svg',
              isImage: isImage && extension !== 'svg',
              isPDF: extension === 'pdf',
              filePath: `${API_URL}/uploads/${filename}`,
            };
          })
          .filter(shape => !removedPDFs.includes(shape.id)); // 🚫 skip removed
    
        setShapes((prev) => [...prev, ...serverShapes]);
      } catch (err) {
        console.error('Failed to load server files:', err);
      }
    };
    
    loadServerImages();
  }, []);

  const handleTextAdd = () => {
    if (!newText.trim()) return;
    setShapes((prev) => [
      ...prev,
      { id: `text_${prev.length}`, label: newText.trim(), isText: true },
    ]);
    setNewText('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && acceptedFileTypes.includes(file.type)) {
      setSelectedFile(file);
      setFileTypeError('');
    } else {
      setSelectedFile(null);
      setFileTypeError('Please select a valid file (SVG, PNG, JPG, or PDF)');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file before uploading.');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await axios.post(
        `${API_URL}/api/upload-file`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      const isImage = ['svg', 'png', 'jpg', 'jpeg'].includes(ext);
      setShapes((prev) => [
        ...prev,
        {
          id: `user_${prev.length}`,
          label: selectedFile.name.replace(/\.[^/.]+$/, ''),
          isSVG: ext === 'svg',
          isImage: isImage && ext !== 'svg',
          isPDF: ext === 'pdf',
          filePath: res.data.filePath,
        },
      ]);
      setSelectedFile(null);
      alert('File uploaded and saved to server!');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload file');
    }
  };

  const onDragStart = (event, shape) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({
        ...shape,
        type: shape.isPump
          ? 'pumpNode'
          : shape.isAirblower
          ? 'blowerNode'
          : shape.isText
          ? 'textNode'
          : shape.isPDF
          ? 'pdfNode'
          : shape.isImage
          ? 'imageNode'
          : shape.isFlowmeter
          ? 'flowMeterNode'
          : shape.isTank
          ? 'tankNode'
          : 'svgNode',
        isPump: shape.isPump,
        isAirblower: shape.isAirblower,
        isFlowmeter: shape.isFlowmeter,
        isTank: shape.isTank,
      })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  const getFileIcon = (shape) => {
    if (shape.isSVG || shape.isImage) {
      const src = shape.svgPath || shape.filePath;
      return <img src={src} alt={shape.label} style={{ width: 50, height: 50 }} />;
    }
    if (shape.isPDF) {
      return (
        <div
          style={{
            width: 50,
            height: 50,
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <strong style={{ fontSize: 10 }}>PDF</strong>
        </div>
      );
    }
    return (
      <div
        style={{
          padding: 10,
          backgroundColor: '#f0f0f0',
          textAlign: 'center',
          borderRadius: 4,
          cursor: 'grab',
        }}
      >
        {shape.label}
      </div>
    );
  };

  useEffect(() => {
    const handlePDFDrop = (e) => {
      const idToRemove = e.detail;
  
      // Save removed ID to localStorage
      const removed = JSON.parse(localStorage.getItem("removedPDFs") || "[]");
      localStorage.setItem("removedPDFs", JSON.stringify([...removed, idToRemove]));
  
      // Remove from current state
      setShapes((prevShapes) =>
        prevShapes.filter((shape) => shape.id !== idToRemove)
      );
    };
  
    window.addEventListener("pdf-dropped", handlePDFDrop);
    return () => window.removeEventListener("pdf-dropped", handlePDFDrop);
  }, []);
  
  return (
    <div className="sidebar-container">
      <aside>
        <div className="description">
          Drag a shape or text box to the canvas, or upload your own SVG, PNG, JPG, or PDF.
        </div>
        <div className="upload-container d-flex">
          <input
            type="file"
            accept=".svg,.png,.jpg,.jpeg,.pdf"
            onChange={handleFileChange}
            className="form-control mb-2"
          />
          {fileTypeError && <div className="text-danger small mb-2">{fileTypeError}</div>}
          <button
            className="btn text-light"
            style={{ backgroundColor: '#236a80' }}
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            Upload File
          </button>
        </div>
        <div className="text-input-container mt-2 d-flex">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter text"
            className="form-control "
          />
          <button
            onClick={handleTextAdd}
            className="btn text-light"
            style={{ backgroundColor: '#236a80' }}
            disabled={!newText.trim()}
          >
            Add Text
          </button>
        </div>

        {/* HORIZONTAL SHAPES LIST */}
        <div
          className="shapes-container"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            overflowX: 'auto',
            gap: '8px',
            padding: '8px 0',
          }}
        >
          {shapes.map((shape) => (
            <div
              key={shape.id}
              className="dndnode"
              onDragStart={(e) => onDragStart(e, shape)}
              draggable
              style={{ flex: '0 0 auto' }}
            >
              {getFileIcon(shape)}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;
