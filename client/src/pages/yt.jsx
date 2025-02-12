import { useState , useEffect } from "react";
import SearchBar from "../comps/searchbar";
import YtPlayer from "../comps/videoplayer";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";



export default function Yt(){
  
  const [search, setSearch] = useState(""); //input value 
  const [videoQueue, setVideoQueue] = useState([]); //for handling multiple videos
  const [loadedCount, setLoadedCount] = useState(0); // for smoother loading 
  
  
  // to check whether search is an url
  const isLink = () => {
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(:\d+)?(\/\S*)?$/;
    return urlPattern.test(search);
  };
  
  //To check whether its a url of a playlist
  const isPlaylist = () => search.includes("list=");
  
  //Fetch all the videos in a playlist
  const fetchPlaylist = async () => {
    
    if (!isLink() && !isPlaylist()) { return }
    let playlistInfoApi = "https://server-playnow-production.up.railway.app/ytapis/playlistinfo"
    let response = await axios.post(playlistInfoApi, {url:search})
    setVideoQueue([])
    if (response && !response.data.status){
      setVideoQueue(response.data.items)
    }
  }
  // Fetch videos based on search
  const fetchQuery = async () => {
    if (search && !isLink()) {
      let searchQuery = `https://server-playnow-production.up.railway.app/ytapis/search?query=${search}`
      let response = await axios.get(searchQuery)
      setVideoQueue([])
      if (response && !response.data.status){
        setVideoQueue(response.data)
      }
    } else { return }
  }
  
  /* used to fetch multiple videos either 
  from a playlist or from normal search */
  
  useEffect(() => {
    if (search && isLink() && isPlaylist()) {
      fetchPlaylist();
    }
    else if (search && !isLink()){
      fetchQuery();
    }
  }, [search]);
  
  /*loades multiple videos smoothly */
  useEffect(() => {
    if (loadedCount < videoQueue.length) {
      const timer = setTimeout(() => {
        setLoadedCount((prev) => prev + 1);
      }, 250); // Adjust delay as needed
  
      return () => clearTimeout(timer);
    }
 }, [loadedCount, videoQueue]);


  return (
  <>
    <div>
      
      {/* Search Bar for Youtube videos */}
      <SearchBar value={search} onChange={setSearch} onCancel={() => setSearch("")} onSearch={() => {
        
        if (search && !isLink()){
          fetchQuery()
        }
        else if (search && isLink() && isPlaylist()) {
          fetchPlaylist()
        }
      } } />
      
      <div className="video-container">
      {!search && <p>Search Videos or Paste Video Link to Get Started !!</p>}
      
      {search && isLink() && !isPlaylist() && (
        <>
          <YtPlayer url={search} />
        </>
      )}
      
      {search && isLink() && isPlaylist() && (
        <>
          { videoQueue.length < 0 && <p>Fetching Playlist Details</p>}
          {videoQueue.length > 0 &&
            videoQueue.slice(0,loadedCount).map((video) => (
              <YtPlayer url={video.shortUrl} />
            ))
          }
          
          
        </>
      )}
      
      
      {search && !isLink() && (
       <>
        <p>Crunching results...</p>
        
        {videoQueue.length > 0 &&
          videoQueue.slice(0,loadedCount).map((video) => (
              <YtPlayer url={video.id.playlistId ? `https://youtube.com/playlist?list=${video.id.playlistId}`  : `https://youtube.com/watch?v=${video.id.videoId}`} />
          ))
        } 
       </>
      )}
        
      
      </div>
    </div>
  </>
  )
  
}