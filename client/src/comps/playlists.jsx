import { useState, useEffect, useCallback, useContext} from "react";
import axios from "axios";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import { useAudioQueue } from "./audioplayer";


/*
Component: <Playlist />:
========================
params:
=======
url: playlist url of youtube music 
onClose: event to be occured when the playlist is closed 
Desc: 
=====
The <Playlist /> Component gives a smoother
experience when exploring playlists from explore section
or home page 
*/

/*todo: add more controls and options */
export default function Playlist({ url, onClose }){
  
  // functions for queue management in the current playlist 
  const { addToQueue, addToLast, audioQueue, clearAudioQueue } = useAudioQueue();
  
  /* Meta data about the current playlist url will
  be stored in localstorage as cache and retained when refereshed 
  the metadata will change when a new url is given */
  const [playlistInfo, setPlaylistInfo] = useState(()=>{
    const cachedInfo = localStorage.getItem("playlistInfo");
    return cachedInfo ? JSON.parse(cachedInfo) :null;
  });
  
  const [isVisible, setVisible] = useState(true);
  const fetchPlaylistinfo = useCallback(async () => {
    /*
    Retrives the playlist metadata using the url and /playlist api 
    and stores it in 'playlistInfo' state and localstorage as a cache 
    */
    const response = await axios.get(`https://server-playnow-production.up.railway.app/musicapis/ytmusic/playlist?url=${encodeURIComponent(url)}`);
    if (response.data) {
      setPlaylistInfo(response.data)
      localStorage.setItem("playlistInfo", JSON.stringify(response.data))
      //localStorage.setItem("recentlyPlayed", )
    }
  },[url]);
  
  useEffect(() => {
    /*Immediatly updates playlist info , resets the audioQueue
    and adds tracks one by one to the queue with a delay */
    if (!playlistInfo) fetchPlaylistinfo();
    if (playlistInfo) {
    clearAudioQueue();
    const existingUrls = new Set(); // To track added URLs
      playlistInfo.videos.forEach((vid, index) => {
        setTimeout(() => {
          if (!existingUrls.has(vid.url)) {
            addToLast(vid.url);
            existingUrls.add(vid.url);
          }
        }, index * 800); // Adds a 500ms delay between additions
      });
    }
  },[url]);
  /* 
    Default function  when arrow down button is clicked 
    and onClose Function is not defined 
  */
  const closePlaylist = () => {
    setVisible(!isVisible);
  }
  return (
    <>
      { isVisible &&
      <div className="playlist-container ">
        <div className="top-ctrls">
          <IconButton className="top-ctrl-btn" onClick={onClose? onClose : closePlaylist}> <ArrowDropDownIcon className="icons-top"/> </IconButton>
        </div>
        <div className="playlist-info">
          { playlistInfo && (
            <>
              <img className="thumbnail" src={ playlistInfo?.thumbnail?.url } />
              <span className="title">{ playlistInfo?.title }</span>
            </>
          )}
        </div>
        
        <div className="playlist-ctrls">
          <div className="play-btn"> 
            <PlayArrowIcon className="playbtn-icon"/>
            <span className="play-btn-text" > play </span>  
          </div>
        </div>
     
        <div className="music-list">
          { playlistInfo && (
            playlistInfo.videos.map((vid) => (
              <div key={vid.id}  className="music-card">
                <div onClick={()=> addToQueue(vid?.url)}  className="music-info">
                  <img className="thumbnail" src={vid?.thumbnail?.url} />
                  <div className="music-info-ttl">
                    <span>{vid?.title}</span>
                    <span>{vid?.channel?.name}</span>
                  </div>
                </div>
                <div className="music-opts">
                  <IconButton > <MoreVertIcon className="icon-btn"/> </IconButton>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      }
    </>
  )
}


