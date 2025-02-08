import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPlayer from "react-player";


const YtPlayer = ({ url, reso="480p", fmt = "video"}) => {
  const iframeRef = useRef(null)
  
  
  const downloadVideo = () => {
    /* current method for downloading videos */
    //needs improvement
    
    if (!url) return;
    // Construct direct API URL with query parameters
    const apiUrl = `http://localhost:3000/ytapis/dl?url=${encodeURIComponent(url)}&fmt=${fmt}&res=${reso}`;
    iframeRef.current.src = apiUrl;
  };

  
  
  
  return (
    <>
      <div>
        {/*Hidden Iframe to download */}
        <iframe ref={iframeRef} style={{ display: "none" }} title="hiddenDownload"></iframe>
        <ReactPlayer url={url} controls width="300px" height="200px" />
        <button onClick={downloadVideo}>Download</button>
      </div>
    </>
    
  );
};

export default YtPlayer;