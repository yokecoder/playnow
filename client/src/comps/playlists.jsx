import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import { useAudioQueue } from "./audioplayer";

/*
Component: <Playlist />:
========================
params:
=======
url: playlist url of youtube music 
onClose: event to be occurred when the playlist is closed 
Desc: 
=====
The <Playlist /> Component gives a smoother
experience when exploring playlists from the explore section
or the home page.
*/

/* todo: add more controls and options */
export default function Playlist({ url, onClose }) {
  
  // Functions for queue management in the current playlist 
  const { addToQueue, addToLast, clearAudioQueue } = useAudioQueue();
  
  /* Meta data about the current playlist url will
  be stored in localStorage as cache and retained when refreshed. 
  The metadata will change when a new url is given. */
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [isVisible, setVisible] = useState(true);

  /*
    Retrieves the playlist metadata using the URL and /playlist API,
    stores it in 'playlistInfo' state, and caches it in localStorage.
  */
  const fetchPlaylistInfo = useCallback(async () => {
    try {
      const response = await axios.get(`https://server-playnow-production.up.railway.app/musicapis/ytmusic/playlist?url=${encodeURIComponent(url)}`);
      if (response.data) {
        setPlaylistInfo(response.data);
        localStorage.setItem("playlistInfo", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error fetching playlist info:", error);
    }
  }, [url]);

  useEffect(() => {
    /* Immediately updates playlist info, resets the audio queue, 
       and adds tracks one by one with a delay. */
    
    if (!playlistInfo) {
      fetchPlaylistInfo();
    } else {
      clearAudioQueue();
      const existingUrls = new Set(); // To track added URLs and prevent duplicates
      
      playlistInfo?.videos?.forEach((vid, index) => {
        setTimeout(() => {
          if (!existingUrls.has(vid.url)) {
            addToLast(vid.url);
            existingUrls.add(vid.url);
          }
        }, index * 800); // Adds an 800ms delay between additions
      });
    }
  }, [url, fetchPlaylistInfo, playlistInfo, clearAudioQueue, addToLast]);

  /* 
    Default function when the arrow down button is clicked 
    and onClose function is not defined.
  */
  const closePlaylist = () => setVisible(false);

  return (
    <>
      {isVisible && (
        <div className="playlist-container">
          <div className="top-ctrls">
            <IconButton className="top-ctrl-btn" onClick={onClose ? onClose : closePlaylist}>
              <ArrowDropDownIcon className="icons-top" />
            </IconButton>
          </div>

          <div className="playlist-info">
            {playlistInfo && (
              <>
                <img className="thumbnail" src={playlistInfo?.thumbnail?.url} alt="Playlist Thumbnail" />
                <span className="title">{playlistInfo?.title}</span>
              </>
            )}
          </div>

          <div className="playlist-ctrls">
            <div className="play-btn" onClick={() => addToQueue(playlistInfo?.videos?.[0]?.url)}> 
              <PlayArrowIcon className="playbtn-icon" />
              <span className="play-btn-text">Play</span>  
            </div>
          </div>

          <div className="music-list">
            {playlistInfo?.videos?.map((vid) => (
              <div key={vid.id} className="music-card">
                <div onClick={() => addToQueue(vid?.url)} className="music-info">
                  <img className="thumbnail" src={vid?.thumbnail?.url} alt="Music Thumbnail" />
                  <div className="music-info-ttl">
                    <span>{vid?.title}</span>
                    <span>{vid?.channel?.name}</span>
                  </div>
                </div>
                <div className="music-opts">
                  <IconButton> <MoreVertIcon className="icon-btn" /> </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}