import React, { useEffect, useState, useRef } from "react";

export default function AudioPlayer({ url }) {
  
  
  const streamUrl = `https://server-playnow-production.up.railway.app/musicapis/ytmusic/stream?url=${url}`
  return (
    <div>
     <audio id="audioPlayer" controls>
      <source src={streamUrl} type="audio/mpeg"/>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};
