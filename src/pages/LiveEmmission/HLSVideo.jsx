import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const HLSVideo = ({ src }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // 🔹 Safari / native HLS
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.play().catch(() => {});
    }
    // 🔹 Chrome / Firefox / Edge
    else if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 30,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error", data);
      });

      return () => {
        hls.destroy();
      };
    } else {
      console.error("HLS not supported in this browser");
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      muted
      autoPlay
      playsInline
      style={{
        width: "100%",
        height: "100%",
        background: "black",
        borderRadius: "12px",
      }}
    />
  );
};

export default HLSVideo;
