import  { createContext,useContext, useEffect, useState, useCallback, useRef, cloneElement } from "react";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight'; 



// Create Context
const AudioContext = createContext();

// Parent Component
export default function AudioPlayerContainer({ url, onSkipPrevious, onSkipNext, children }) {
  const streamUrl = `https://server-playnow-production.up.railway.app/musicapis/ytmusic/stream?url=${encodeURIComponent(url)}`;
  const audioRef = useRef(null);
  const [audioInfo, setAudioInfo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  
  // Fetch Audio Info
  const fetchAudioInfo = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://server-playnow-production.up.railway.app/musicapis/ytmusic/track?url=${encodeURIComponent(url)}`
      );
      if (response.data) {
        setAudioInfo(response.data);
      }
    } catch (error) {
      console.error("Error fetching audio info:", error);
    }
  }, [url]);

  useEffect(() => {
    fetchAudioInfo();
  }, [url, fetchAudioInfo]);
  
  
  /* Notification Control Panel */
  useEffect(() => {
    if ("mediaSession" in navigator && audioInfo) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: audioInfo.title,
        artist: audioInfo.author,
        album: "Playnow Music",
        artwork: [{ src: audioInfo.thumbnail, sizes: "192x192", type: "image/png" }],
      });
  
      navigator.mediaSession.setActionHandler("play", () => {
        audioRef.current.play();
        setIsPlaying(true);
      });
  
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current.pause();
        setIsPlaying(false);
      });
  
      navigator.mediaSession.setActionHandler("seekbackward", ({ seekOffset = 10 }) => {
        audioRef.current.currentTime = Math.max(audioRef.current.currentTime - seekOffset, 0);
      });
  
      navigator.mediaSession.setActionHandler("seekforward", ({ seekOffset = 10 }) => {
        audioRef.current.currentTime = Math.min(audioRef.current.currentTime + seekOffset, audioRef.current.duration);
      });
  
      navigator.mediaSession.setActionHandler("seekto", ({ seekTime }) => {
        audioRef.current.currentTime = seekTime;
      });
  
      navigator.mediaSession.setActionHandler("stop", () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      });
    }
 }, [url, audioInfo]);
  
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
   
  return (
    <AudioContext.Provider value={{ audioRef, audioInfo, isPlaying,setIsPlaying, togglePlay, onSkipNext,onSkipPrevious }}>
      <audio ref={audioRef} src={streamUrl}></audio>
      {children}
    </AudioContext.Provider>
  );
}

// Child Component
export const AudioPlayerMini = ({onExpand}) => {
  const { audioRef, audioInfo, togglePlay, isPlaying, setIsPlaying ,onSkipNext,onSkipPrevious} = useContext(AudioContext); // Access Context
  
  //console.log(audioInfo);
  return (
    <div  className="audio-player-mini">
      <div onClick={onExpand} className="infobox">
        <img className="thumbnail" src={audioInfo&& audioInfo.thumbnail} />
        <div className="info">
          {audioInfo && (
            <>
              <span>{audioInfo.title}</span>
              <span>{audioInfo.author}</span>
            </>
          )}
        </div>
      </div>
      <div className="controls">
        <IconButton className="control-btn" onClick={onSkipPrevious}>
          <SkipPreviousIcon className="control-btn-icon" />
        </IconButton>
        <IconButton className="control-btn" onClick={togglePlay}>
          {isPlaying ? <PauseIcon className="control-btn-icon" /> : <PlayArrowIcon className="control-btn-icon" />}
        </IconButton>
        <IconButton className="control-btn" onClick={onSkipNext}>
          <SkipNextIcon className="control-btn-icon" />
        </IconButton>
      </div>
    </div>
  );
}

export const AudioPlayer = ({ onClose }) => {
  const { audioRef, audioInfo, togglePlay, isPlaying } = useContext(AudioContext);
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bgImage, setBgImage] = useState(null);

  // Set background image when audio info is available
  useEffect(() => {
    if (audioInfo) setBgImage(audioInfo.thumbnail);
  }, [audioInfo]);

  // Update progress bar and current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100); // Avoid division by zero
    };

    const setMetadata = () => {
      if (audio.readyState >= 2) {
        setAudioDuration(audio.duration || 0);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", setMetadata);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", setMetadata);
    };
  }, [audioRef]);

  // Ensure duration is set properly
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.readyState >= 2 && audio.duration > 0) {
      setAudioDuration(audio.duration);
    }
  }, [audioRef?.current?.readyState]);

  // Format time helper function
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds <= 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Seek audio position
  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (e.target.value / 100) * (audio.duration || 1);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(e.target.value);
  };

  return (
    <div className="audio-player">
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "inherit",
          height: "inherit",
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(15px)",
          opacity: 0.4,
          zIndex: -1,
        }}
      />

      <div>
        <IconButton onClick={onClose} className="control-btn">
          <ArrowDropDownIcon className="control-btn-icon" />
        </IconButton>
      </div>

      <div className="info">
        {audioInfo && (
          <>
            <img className="audio-thumbnail" src={audioInfo.thumbnail} alt="thumbnail" />
            <span>{audioInfo.title}</span>
            <span>{audioInfo.author}</span>
          </>
        )}
      </div>

      <div className="audio-progress">
        <span>{formatTime(currentTime)}</span>
        <input
          className="progress-input"
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
        />
        <span>{formatTime(audioDuration)}</span>
      </div>

      <div className="controls">
        <IconButton className="control-btn">
          <SkipPreviousIcon className="control-btn-icon" />
        </IconButton>
        <IconButton className="control-btn" onClick={togglePlay}>
          {isPlaying ? <PauseIcon className="control-btn-icon" /> : <PlayArrowIcon className="control-btn-icon" />}
        </IconButton>
        <IconButton className="control-btn">
          <SkipNextIcon className="control-btn-icon" />
        </IconButton>
      </div>
    </div>
  );
};


