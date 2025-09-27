/* import React, { useCallback, useMemo, useState } from "react";
import { Document, Page } from "react-pdf";


import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./PdfNode.css";

const getSafeUrl = (raw) => {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    if (url.searchParams.has("X-Amz-Algorithm") || url.searchParams.has("X-Amz-Signature")) {
      return raw;
    }
    url.pathname = encodeURI(url.pathname); 
    return url.toString();
  } catch {
    return encodeURI(raw);
  }
};

const PdfNode = ({ data }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  
  const safeUrl = useMemo(() => getSafeUrl(data?.filePath), [data?.filePath]);
  
  const onDocumentLoadSuccess = useCallback(
    ({ numPages }) => {
      setNumPages(numPages || 0);
      setPageNumber((p) => Math.min(Math.max(1, p), numPages || 1));
    },
    []
  );
  
  const goPrev = useCallback(() => {
    setPageNumber((p) => Math.max(1, p - 1));
  }, []);
  
  const goNext = useCallback(() => {
    setPageNumber((p) => Math.min(numPages || 1, p + 1));
  }, [numPages]);
  
  return (
    <div className="pdf-node">
      <div className="pdf-node-content">
        {safeUrl ? (
          <div className="pdf-scroll">
            <Document
              file={safeUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(e) => console.error("PDF load error:", e)}
              loading={<div>Loading PDF…</div>}
              error={<div>Failed to load PDF.</div>}
              options={{
                
                workerSrc: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs"
              }}
            >
              <Page
                pageNumber={pageNumber}
                
                scale={1}
               
                renderMode="svg"
                
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
            
           
            <div className="pdf-controls" style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={goPrev} disabled={pageNumber <= 1}>
                Prev
              </button>
              <div style={{ fontSize: 12 }}>
                Page {pageNumber} of {numPages || 0}
              </div>
              <button onClick={goNext} disabled={!numPages || pageNumber >= numPages}>
                Next
              </button>
            </div>
          </div>
        ) : (
          <div>No PDF file available.</div>
        )}
      </div>
    </div>
  );
};

export default PdfNode; */

// import React from 'react'

// function PdfNode() {
//   return (
//     <div>PdfNode</div>
//   )
// }

// export default PdfNode

import React, { useCallback, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./PdfNode.css";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const getSafeUrl = (raw) => {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    if (
      url.searchParams.has("X-Amz-Algorithm") ||
      url.searchParams.has("X-Amz-Signature")
    ) {
      return raw;
    }
    return raw; // don’t double encode
  } catch {
    return raw.replace(/ /g, "%20");
  }
};

function PdfNode({ data }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const safeUrl = useMemo(() => getSafeUrl(data?.filePath), [data?.filePath]);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages || 0);
    setPageNumber((p) => Math.min(Math.max(1, p), numPages || 1));
  }, []);

  const goPrev = useCallback(() => {
    setPageNumber((p) => Math.max(1, p - 1));
  }, []);

  const goNext = useCallback(() => {
    setPageNumber((p) => Math.min(numPages || 1, p + 1));
  }, [numPages]);

  return (
    <div className="pdf-node" style={{ width: "100%", height: "100%", overflow: "auto" }}>
      <div className="pdf-node-content" style={{ width: "100%", height: "100%" }}>
        {safeUrl ? (
          <div className="pdf-scroll" style={{ width: "100%", height: "100%" }}>
            <Document
              file={safeUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(e) => console.error("PDF load error:", e)}
              loading={<div>Loading PDF…</div>}
              error={<div>Failed to load PDF.</div>}
            >
              {/* 🔹 Render at natural size: full width + height */}
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>

            {numPages > 1 && (
              <div
                className="pdf-controls"
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 8,
                  justifyContent: "center",
                }}
              >
                <button onClick={goPrev} disabled={pageNumber <= 1}>
                  Prev
                </button>
                <div style={{ fontSize: 12 }}>
                  {pageNumber} / {numPages}
                </div>
                <button
                  onClick={goNext}
                  disabled={!numPages || pageNumber >= numPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>No PDF file available.</div>
        )}
      </div>
    </div>
  );
}

export default PdfNode;
