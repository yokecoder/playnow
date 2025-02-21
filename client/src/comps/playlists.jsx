import { useState, useEffect, useCallback, useContext} from "react";
import axios from "axios";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import { AudioQueueContext } from "./audioplayer";

/* Component for rendering playlists */
export default function Playlist({ url, onClose }){
  const { addToQueue, audioQueue } = useContext(AudioQueueContext);
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [isVisible, setVisible] = useState(true);
  
  /* Obtain the Playlist Info */
  const fetchPlaylistinfo = useCallback(async () => {
    const response = await axios.get(`https://server-playnow-production.up.railway.app/musicapis/ytmusic/playlist?url=${encodeURIComponent(url)}`);
    if (response.data) {
      setPlaylistInfo(response.data)
    }
  },[url]);
  
  useEffect(() => {
    if (!playlistInfo) fetchPlaylistinfo();
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
          <IconButton> <QueueMusicIcon /> </IconButton>
          <div className="play-btn"> 
            <PlayArrowIcon className="playbtn-icon"/>
            <span className="play-btn-text" > play </span>  
          </div>
        </div>
     
        <div className="music-list">
          { playlistInfo && (
            playlistInfo.videos.map((vid) => (
              <div   className="music-card">
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


