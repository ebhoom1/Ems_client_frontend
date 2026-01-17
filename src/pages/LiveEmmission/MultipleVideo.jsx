import React, { useEffect, useRef, useState } from 'react';

// Sub-component to handle individual video streams
const VideoPlayer = ({ id, name, onClick, isExpanded }) => {
    const canvasRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        // Point to the specific camera ID route
        const streamUrl = `ws://localhost:2000/api/stream/${id}`;

        const initPlayer = () => {
            if (window.JSMpeg && canvasRef.current) {
                if (playerRef.current) {
                    playerRef.current.destroy();
                }

                playerRef.current = new window.JSMpeg.Player(streamUrl, {
                    canvas: canvasRef.current,
                    autoplay: true,
                    audio: false, 
                    loop: true
                });
            }
        };

        const timer = setTimeout(initPlayer, 500);

        return () => {
            clearTimeout(timer);
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [id]);

    return (
        <div 
            onClick={onClick}
            style={{ 
                cursor: isExpanded ? 'default' : 'pointer', 
                transition: 'transform 0.2s',
                // Removing the specific card color/background
                background: 'transparent',
                border: 'none',
                marginBottom: '20px'
            }}
            className="video-wrapper"
        >
            <div style={{ 
                width: '100%', 
                backgroundColor: '#000', 
                borderRadius: '8px', 
                overflow: 'hidden',
                boxShadow: isExpanded ? '0 10px 30px rgba(0,0,0,0.5)' : '0 4px 6px rgba(0,0,0,0.1)' 
            }}>
                <canvas 
                    ref={canvasRef} 
                    style={{ width: '100%', height: 'auto', display: 'block' }} 
                />
            </div>
            <h4 className="mt-2 text-center" style={{ color: '#333' }}>
                {name} {isExpanded ? '' : <small className="text-muted" style={{fontSize: '0.7em'}}>(Click to expand)</small>}
            </h4>
        </div>
    );
};

function MultipleVideo() {
    // State to track which camera is currently expanded (null = show all)
    const [expandedId, setExpandedId] = useState(null);

    const cameras = [
        { id: '1', name: 'Camera 1' },
        { id: '2', name: 'Camera 2' },
        { id: '3', name: 'Camera 3' },
        { id: '4', name: 'Camera 4' }
    ];

    // Handler to go back to grid view
    const handleBack = () => {
        setExpandedId(null);
    };

    return (
        <div className="row mt-4">
            {/* If a camera is expanded, show the Back button and the single large video */}
            {expandedId ? (
                <div className="col-12">
                    <button 
                        className="btn btn-secondary mb-3" 
                        onClick={handleBack}
                    >
                        ← Back to All Cameras
                    </button>
                    
                    {/* Find and render only the selected camera */}
                    {cameras.filter(c => c.id === expandedId).map(camera => (
                        <VideoPlayer 
                            key={camera.id} 
                            id={camera.id} 
                            name={camera.name} 
                            isExpanded={true}
                            onClick={null} // No click action when already expanded
                        />
                    ))}
                </div>
            ) : (
                /* Otherwise, show the grid of all cameras */
                cameras.map(camera => (
                    <div key={camera.id} className="col-md-6 mb-4">
                        <VideoPlayer 
                            id={camera.id} 
                            name={camera.name} 
                            isExpanded={false}
                            onClick={() => setExpandedId(camera.id)}
                        />
                    </div>
                ))
            )}
        </div>
    );
}

export default MultipleVideo;