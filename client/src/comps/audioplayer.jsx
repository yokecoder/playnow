import  { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';



// Create Context
//Context for playing Audio
const AudioContext = createContext();


/* Handles  Audio metadata and audio playin dynamically */
export default function AudioPlayerContainer({ url, onSkipPrevious, onSkipNext, children }) {
  const streamUrl = `https://server-playnow-production.up.railway.app/musicapis/ytmusic/stream?url=${encodeURIComponent(url)}`;
  const audioRef = useRef(null);
  
  
  const [audioInfo, setAudioInfo] = useState(()=>{
    const cachedInfo = localStorage.getItem("audioInfo");
    return cachedInfo ? JSON.parse(cachedInfo) :null;
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  
  
  // Fetch Audio Info
  const fetchAudioInfo = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://server-playnow-production.up.railway.app/musicapis/ytmusic/track?url=${encodeURIComponent(url)}`
      );
      if (response.data) {
        setAudioInfo(response.data);
        localStorage.setItem("audioInfo", JSON.stringify(response.data))
      }
    } catch (error) {
      console.error("Error fetching audio info:", error);
    }
  }, [url]);
  
  
  
  useEffect(() => {
    fetchAudioInfo();
  }, [url]);
  
  
  /* Notification Control Panel */
  useEffect(() => {
    if (!audioInfo || !audioRef.current) return;

    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: audioInfo.title || "Unknown Title",
            artist: audioInfo.author || "Unknown Artist",
            album: "PlayNow Music",
            artwork: audioInfo.thumbnail ? [{ src: audioInfo.thumbnail, sizes: "192x192", type: "image/png" }] : [],
        });

        const audio = audioRef.current;

        navigator.mediaSession.setActionHandler("play", () => {
            audio.play();
            setIsPlaying(true);
        });

        navigator.mediaSession.setActionHandler("pause", () => {
            audio.pause();
            setIsPlaying(false);
        });

        navigator.mediaSession.setActionHandler("seekbackward", (details) => {
            audio.currentTime = Math.max(audio.currentTime - (details.seekOffset || 10), 0);
        });

        navigator.mediaSession.setActionHandler("seekforward", (details) => {
            audio.currentTime = Math.min(audio.currentTime + (details.seekOffset || 10), audio.duration || 0);
        });

        navigator.mediaSession.setActionHandler("seekto", (details) => {
                audio.currentTime = 0;
           
        });

        navigator.mediaSession.setActionHandler("stop", () => {
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
        });
    }
  }, [audioInfo, audioRef, url]); // Runs only when `audioInfo` is available
  
  //Handles Page Reload Smoothly 
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleBeforeUnload = () => {
        audio.pause();
        audio.src = ""; // Reset audio source to prevent stuck state
    };
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  
  /*Automatically starts audio playback when metadata is loaded*/
  const startAutoPlay = () =>{
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }
  
  /* audio control that toggles between play and pause */
  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            await audioRef.current.play();
            setIsPlaying(true);
        }
    } catch (error) {
        console.error("Playback error:", error);
    }
  };
   
  return (
    <AudioContext.Provider value={{ audioRef, audioInfo, isPlaying,setIsPlaying, togglePlay, onSkipNext,onSkipPrevious }}>
      <audio ref={audioRef} src={streamUrl} onLoadedMetadata={startAutoPlay}></audio>
      {children}
    </AudioContext.Provider>
  );
}


/* for maintaining Audio Queue and consistent audio playback */ 
export const AudioQueueContext = createContext({});

export const AudioQueueProvider = ({ children }) => {
    // Initialize audio queue from localStorage
    //TODO: write functions to manage skip next, skip previous control
    //TODO: write a function that automatically appends song urls to queue
    //TODO: write more advanced crud functions 
    const [audioQueue, setAudioQueue] = useState(() => {
        try {
            const storedQueue = JSON.parse(localStorage.getItem("audioQueue"));
            return Array.isArray(storedQueue) ? storedQueue : [];
        } catch {
            return [];
        }
    });

    // Function to add audio to queue (avoiding duplicates)
    const addToQueue = useCallback((url) => {
        setAudioQueue((prevQueue) => {
            const updatedQueue = [url, ...prevQueue];
            localStorage.setItem("audioQueue", JSON.stringify(updatedQueue));
            return updatedQueue;
        });
    }, []);

    // Sync queue across tabs (localStorage event listener)
    useEffect(() => {
        const syncQueue = () => {
            try {
                const storedQueue = JSON.parse(localStorage.getItem("audioQueue"));
                if (Array.isArray(storedQueue)) {
                    setAudioQueue(storedQueue);
                }
            } catch {
                setAudioQueue([]);
            }
        };

        window.addEventListener("storage", syncQueue);
        return () => window.removeEventListener("storage", syncQueue);
    }, []);

    return (
        <AudioQueueContext.Provider value={{ audioQueue, addToQueue }}>
            {children}
        </AudioQueueContext.Provider>
    );
};


/* Mini (popup) like audio player component */
export const AudioPlayerMini = ({ onExpand }) => {
  const { audioRef, audioInfo, togglePlay, isPlaying, setIsPlaying ,onSkipNext,onSkipPrevious} = useContext(AudioContext); // Access Context
  
  
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





/* full screen Audio Player Component */
export const AudioPlayer = ({ onClose }) => {
  const { audioRef, audioInfo, togglePlay, isPlaying } = useContext(AudioContext);
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bgImage, setBgImage] = useState(null);

  // Set background image when audio info is available
  useEffect(() => {
    setBgImage(audioInfo && audioInfo?.thumbnail ? audioInfo.thumbnail : null);
  }, [audioInfo]);

  // Update progress bar and current time
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const updateProgress = () => {
        if (audio.duration) {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        }
    };

    const updateMetadata = () => setAudioDuration(audio.duration || 0);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateMetadata);

    return () => {
        audio.removeEventListener("timeupdate", updateProgress);
        audio.removeEventListener("loadedmetadata", updateMetadata);
    };
}, [audioRef]); // Empty dependency array ensures it runs once after mount

  // Ensure duration is set properly
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.readyState > 0) {
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
  const handleSeek = useCallback((e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (e.target.value / 100) * (audio.duration || 1);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(e.target.value);
  }, []);

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


