import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Handle, Position } from 'reactflow';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Use CDN for pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function PdfNode({ data }) {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const handleLoadError = (error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try uploading again.');
    setLoading(false);
  };

  // Determine what file to use
  const pdfSource = data.fileObject || data.filePath;

  return (
    <div style={{
      border: '2px solid #555',
      borderRadius: '5px',
      padding: '10px',
      background: '#fff',
      width: '300px',
      minHeight: '200px',
    }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ 
        marginBottom: '8px', 
        fontWeight: 'bold', 
        fontSize: '12px', 
        textAlign: 'center',
        color: '#333'
      }}>
        {data.name || 'PDF Document'}
      </div>
      
      <div style={{ 
        overflowY: 'auto', 
        maxHeight: '400px',
        border: '1px solid #ddd',
        borderRadius: '3px',
        padding: '5px'
      }}>
        {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading PDF...</div>}
        {error && <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>}
        
        {pdfSource && !error && (
          <Document
            file={pdfSource}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={<div style={{ textAlign: 'center', padding: '20px' }}>Loading PDF...</div>}
            error={<div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Failed to load PDF.</div>}
          >
            {numPages && Array.from({ length: numPages }, (_, i) => (
              <Page
                key={`page_${i + 1}`}
                pageNumber={i + 1}
                width={270}
                renderTextLayer={false} // Disable text layer for better performance
                renderAnnotationLayer={false} // Disable annotation layer
              />
            ))}
          </Document>
        )}
      </div>
      
      {numPages && (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '10px', 
          marginTop: '5px',
          color: '#666'
        }}>
          {numPages} page{numPages > 1 ? 's' : ''}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default PdfNode;