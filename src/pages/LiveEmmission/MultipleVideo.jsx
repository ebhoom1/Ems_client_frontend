import React, {  useState } from 'react';
/* import axios from 'axios';
import { API_URL } from '../../utils/apiConfig'; */
function MultipleVideo() {
    const [videoUrls, setVideoUrls] = useState({});

  const cameras = [
    { id: '1', name: 'Camera 1' },
    { id: '2', name: 'Camera 2' },
    { id: '3', name: 'Camera 3' },
    { id: '4', name: 'Camera 4' },
    { id: '5', name: 'Camera 5' }
  ];

 /*  useEffect(() => {
    const fetchVideoUrls = async () => {
      const urls = {};
      for (let camera of cameras) {
        try {
          const response = await axios.get(`${API_URL}}/api/get-video-url?id=${camera.id}`);
          urls[camera.id] = response.data.videoUrl;
        } catch (error) {
          console.error(`Failed to fetch video URL for ${camera.name}:`, error);
        }
      }
      setVideoUrls(urls);
    };

    fetchVideoUrls();
  }, []); */
  return (
   
    <div className="row mt-5">
    {cameras.map(camera => (
      <div key={camera.id} className="col-md-6 mb-4">
        <div className="card">
          <div className="card-body">
            <h2>{camera.name}</h2>
            <video controls autoPlay style={{ width: '100%', height: 'auto' }}>
              {videoUrls[camera.id] && <source src={videoUrls[camera.id]} type="video/mp4" />}
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    ))}
  </div>

  )
}

export default MultipleVideo