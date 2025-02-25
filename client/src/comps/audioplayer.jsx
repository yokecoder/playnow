import  { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';



/*Context state for handling audio Metadata, audio source
and audio controls*/
const AudioContext = createContext();

/*
Component: <AudioPlayerContainer/>:
===================================
Params: 
=======
1. url = youtube music url to stream
2. children = child component that depends on audio information, audio source and controls
Desc:
=====
The <AudioPlayerContainer /> component is a context api 
that provides the audio metadata , audio source and 
audio control functions to child component that depends on it
*/
export default function AudioPlayerContainer({ url, children }) {
  
  /* video url that combined with stream source using api */
  const streamUrl = `https://server-playnow-production.up.railway.app/musicapis/ytmusic/stream?url=${encodeURIComponent(url)}`;
  const audioRef = useRef(null);
  const {skipToNext} = useAudioQueue();
  /* manages the audio metadata / caches data from localstorage in case of refresh */
  const [audioInfo, setAudioInfo] = useState(()=>{
    const cachedInfo = localStorage.getItem("audioInfo");
    return cachedInfo ? JSON.parse(cachedInfo) :null;
  });
  
  //Audio State whether it is playing or not 
  const [isPlaying, setIsPlaying] = useState(false);
  
  const fetchAudioInfo = useCallback(async () => {
    /* Retrieve Audio Metadata from the url using /track api
    and update it to audioInfo and localstorage cache */
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
    /* instatly updates the audio metadata */
    fetchAudioInfo();
  }, [url]);
  
  
  useEffect(() => {
    /* Notification Control Panel */
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
  
  useEffect(() => {
    //Handles Page Reload Smoothly 
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
  
  const startAutoPlay = () => {
    /*Automatically starts audio playback 
    when metadata is loaded*/
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
    <AudioContext.Provider value={{ audioRef, audioInfo, isPlaying,setIsPlaying, togglePlay}}>
      <audio ref={audioRef} src={streamUrl} onEnded={skipToNext} onLoadedMetadata={startAutoPlay} ></audio>
      {children}
    </AudioContext.Provider>
  );
}

/* for maintaining Audio Queue and consistent audio playback */ 
const AudioQueueContext = createContext({});

/*
Component: <AudioQueueProvider />:
===================================
Params: 
=======
1. children = child component that depends on audio Queue and queue operations 
Desc:
=====
The <AudioQueueProvider /> component is a context api 
that provides the audio queue , queue management functions to  
functions to child component that depends on it
*/

export const AudioQueueProvider = ({ children }) => {
    /* audio's urls that are previously listened 
    the prevAudioQueue state is also cached in localstorage */
    const [prevAudioQueue, setPrevAudioQueue] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem("prevAudioQueue")) || [];
      } catch {
        return [];
      }
    });
    /*primary audio queue that holds list of audio urls and 
    is being used for audio playback controls such as skipping to next audio
    also stored in localstorage as cache*/
    const [audioQueue, setAudioQueue] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem("audioQueue")) || [];
      } catch {
        return [];
      }
    });

    // Helper function to update localStorage
    const updateStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

    // Adds track url to the top of queue to start instant playback
    const addToQueue = useCallback((trackUrl) => {
      if (!trackUrl) return;
      
      setPrevAudioQueue((prev) => {
        const updatedPrev = [...prev, audioQueue[0]].filter(Boolean);
        updateStorage("prevAudioQueue", updatedPrev);
        return updatedPrev;
      });

      setAudioQueue((prev) => {
        const updatedQueue = [trackUrl, ...prev];
        updateStorage("recentlyPlayed",updatedQueue)
        updateStorage("audioQueue", updatedQueue);
        return updatedQueue;
      });
    }, [audioQueue]);

    // Add track to the end of the queue
    const addToLast = useCallback((trackUrl) => {
      if (!trackUrl) return;
      setAudioQueue((prev) => {
        const updatedQueue = [...prev, trackUrl];
        updateStorage("audioQueue", updatedQueue);
        return updatedQueue;
      });
    }, []);

    // Skip to next track
    const skipToNext = useCallback(() => {
      if (audioQueue.length === 0) return;
      setPrevAudioQueue((prev) => {
        const updatedPrev = [...prev, audioQueue[0]].filter(Boolean);
        updateStorage("prevAudioQueue", updatedPrev);
        return updatedPrev;
      });
      setAudioQueue((prev) => {
        const updatedQueue = prev.slice(1);
        updateStorage("audioQueue", updatedQueue);
        return updatedQueue;
      });
    }, [audioQueue]);

    // Skip to previous track
    const skipToPrevious = useCallback(() => {
      if (prevAudioQueue.length === 0) return;
      setAudioQueue((queue) => {
        const lastTrack = prevAudioQueue[prevAudioQueue.length - 1];
        const updatedQueue = [lastTrack, ...queue];
        updateStorage("audioQueue", updatedQueue);
        return updatedQueue;
      });
      setPrevAudioQueue((prev) => {
        const updatedPrev = prev.slice(0, -1);
        updateStorage("prevAudioQueue", updatedPrev);
        return updatedPrev;
      });
    }, [prevAudioQueue]);
    
    /* Reset Audio Queue */
    const clearAudioQueue = useCallback(() => {
      setAudioQueue([]);
      setPrevAudioQueue([])
      // Directly setting it to an empty array
      updateStorage('audioQueue', []);
      updateStorage('prevAudioQueue', [])
    }, []);
    
    // Sync queue across tabs
    useEffect(() => {
      const syncQueue = () => {
        try {
          const storedQueue = JSON.parse(localStorage.getItem("audioQueue")) || [];
          setAudioQueue(storedQueue);
        } catch {
          setAudioQueue([]);
        }
      };
      window.addEventListener("storage", syncQueue);
      return () => window.removeEventListener("storage", syncQueue);
    }, []);

    return (
        <AudioQueueContext.Provider value={{ audioQueue, addToQueue, addToLast, skipToNext, skipToPrevious, clearAudioQueue}}>
          {children}
        </AudioQueueContext.Provider>
    );
};
/* Audio Queue Context Object */
export const useAudioQueue = () => {
  return useContext(AudioQueueContext);
} 
/*
Component: <AudioPlayerMini />:
===================================
Params: 
=======
1.onExpand  = event to be occured when clicked on the component 
Desc:
=====
The <AudioPlayerMini /> component is a pop up like 
audio player that allows to controls the playback and 
shows audio information in a mini popup design 
*/

export const AudioPlayerMini = ({ onExpand }) => {
  const { audioRef, audioInfo, togglePlay, isPlaying, setIsPlaying } = useContext(AudioContext); // Access Context
  const { skipToNext, skipToPrevious  } = useContext(AudioQueueContext);
  
  return (
    <div  className="audio-player-mini">
      <div onClick={onExpand} className="infobox">
        <img className="thumbnail" src={audioInfo && audioInfo.thumbnail} />
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
        <IconButton onClick={skipToPrevious} className="control-btn" >
          <SkipPreviousIcon className="control-btn-icon" />
        </IconButton>
        <IconButton className="control-btn" onClick={togglePlay}>
          {isPlaying ? <PauseIcon className="control-btn-icon" /> : <PlayArrowIcon className="control-btn-icon" />}
        </IconButton>
        <IconButton onClick={skipToNext} className="control-btn" >
          <SkipNextIcon className="control-btn-icon" />
        </IconButton>
      </div>
    </div>
  );
}

/* full screen Audio Player Component */
export const AudioPlayer = ({ onClose }) => {
  const { audioRef, audioInfo, togglePlay, isPlaying } = useContext(AudioContext);
  const { skipToNext, skipToPrevious } = useContext(AudioQueueContext);
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
    }, [audioRef]); 

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
        <IconButton onClick={skipToPrevious} className="control-btn">
          <SkipPreviousIcon className="control-btn-icon" />
        </IconButton>
        <IconButton className="control-btn" onClick={togglePlay}>
          {isPlaying ? <PauseIcon className="control-btn-icon" /> : <PlayArrowIcon className="control-btn-icon" />}
        </IconButton>
        <IconButton onClick={skipToNext} className="control-btn">
          <SkipNextIcon className="control-btn-icon" />
        </IconButton>
      </div>
    </div>
  );
};


