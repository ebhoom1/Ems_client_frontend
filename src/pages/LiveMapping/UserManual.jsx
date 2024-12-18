import React from 'react';
import { useNavigate } from 'react-router-dom';

function UserManual() {
    const navigate = useNavigate()
    const handleBack=()=>{
        navigate('/live-station')
    }
  return (

   <div className=''>
    <button className='btn btn-success mt-2 ' style={{ margin: '20px', }}  onClick={handleBack}><i className="fa-solid fa-arrow-left me-1 "></i>Back</button>
     <div style={{ 
      padding: '20px', 
      lineHeight: '1.6', 
      fontFamily: 'Arial, sans-serif', 
      border: '2px solid #236a80', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
      borderRadius: '8px', 
      margin: '20px', 
      backgroundColor: '#fff'
    }}>
      <h1 style={{ textAlign: 'center' }}>How to Use Live Station</h1>
      
      <h2>For Users</h2>
      <ul>
        <li>When you log in, the <strong>Live Station</strong> of your company will be displayed.</li>
        <li>If you want to make any updates, make the required changes and click the <strong>Update</strong> button to save them.</li>
      </ul>
      
      <h2>For Admins</h2>
      <ul>
        <li>There will be a <strong>Username Box</strong> to search for a specific company's live station.</li>
        <li>Enter the <strong>Username</strong> of the company and click the <strong>Search</strong> button to fetch the respective live station.</li>
        <li>If you want to make any updates, apply the changes and click the <strong>Update</strong> button.</li>
        <li>If you need to delete a live station, click the <strong>Delete</strong> button.</li>
      </ul>

      <h2>Canvas and SVG Tools</h2>
      <ul>
        <li>
          <strong>Drag and Drop Shapes:</strong> In the sidebar, shapes represent various items. Drag a shape from the sidebar into the canvas and position it as needed.
        </li>
        <li>
          <strong>Selecting SVG:</strong> Click on any SVG shape to select it.
        </li>
        <li>
          <strong>Resizing and Rotating SVGs:</strong>
          <ul>
            <li>To <strong>resize</strong>, drag the edges of the SVG.</li>
            <li>
              To <strong>rotate</strong>, right-click and drag the leftmost edge. Alternatively, double-click the SVG to bring up the <strong>Rotate Icon</strong>.
              <ul>
                <li>Click the <strong>Rotate Icon</strong> to rotate the SVG by 45 degrees.</li>
                <li>Repeat until the SVG is positioned as required.</li>
                <li>To hide the Rotate Icon, double-click the SVG again.</li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <strong>Zooming and Centering the Map:</strong>
          <ul>
            <li>Use the <strong>+ (Zoom In)</strong> and <strong>- (Zoom Out)</strong> buttons in the bottom-right corner to adjust the screen size.</li>
            <li>To center the map, click the <strong>Screen Width</strong> button (third button).</li>
            <li>To move the map around, click the <strong>Lock Icon</strong> to unlock and reposition the map.</li>
          </ul>
        </li>
        <li>
          <strong>Deleting an SVG:</strong> Select the SVG by clicking on it and press the <strong>Delete</strong> key on your keyboard.
        </li>
      </ul>
    </div>
   </div>
  );
}

export default UserManual;
