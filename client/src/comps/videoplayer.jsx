import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const YtPlayer = ({ url }) => {
  
  const [format, setFormat] = useState('video');
  const [resolution, setResolution] = useState('480p');
  const apiUrl = `https://server-playnow-production.up.railway.app/ytapis/dl?url=${encodeURIComponent(url)}&fmt=${format}&res=${resolution}`;
  //const streamUrl = `http://localhost:3000/ytapis/stream?url=${encodeURIComponent(url)}`
  
  return (
    <>
      <div className="video-player">
  
        <ToastContainer
          position="top-center"
          autoClose={7000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false} 
          pauseOnFocusLoss
          theme="dark" />
      
        <ReactPlayer url={url} controls height="180px"  width="320px" />
        <div className="player-actions">
         
          <select className="player-format-select" value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>

          {format === "video" && (
            <select className="player-format-select" value={resolution} onChange={(e) => setResolution(e.target.value)}>
              <option value="144p">144p</option>
              <option value="240p">240p</option>
              <option value="360p">360p</option>
              <option value="480p">480p</option>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>
          )}
          
          <a  className="link player-act-button" href={apiUrl} onClick={() => {toast("Starting Download....");}} >Download</a>
        </div>
      </div>
    </>
    
  );
};

export default YtPlayer;