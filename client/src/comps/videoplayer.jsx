import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const YtPlayer = ({ url, reso="360p", fmt = "video"}) => {
  
  const apiUrl = `http://localhost:3000/ytapis/dl?url=${encodeURIComponent(url)}&fmt=${fmt}&res=${reso}`;
 
  return (
    <>
      <div>
  
        <ToastContainer
          position="top-center"
          autoClose={6000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          theme="dark" />
        <ReactPlayer url={url} controls width="300px" height="200px" />
        <a href={apiUrl} onClick={() => {toast("Starting Download....");}} >Download</a>
        
      
      </div>
    </>
    
  );
};

export default YtPlayer;