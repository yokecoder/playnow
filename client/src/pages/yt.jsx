import { useState, useEffect, useCallback, useRef } from "react";
import SearchBar from "../comps/searchbar";
import YtPlayer from "../comps/videoplayer";
import axios from "axios";

export default function Yt() {
  const [search, setSearch] = useState(""); // Input value
  const [videoQueue, setVideoQueue] = useState([]); // Queue for multiple videos
  const [loadedCount, setLoadedCount] = useState(0); // Smooth loading control
  const timeoutRef = useRef(null);
  
  //Check for link and playlists
  const isLink = useCallback(() => /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(:\d+)?(\/\S*)?$/.test(search), [search]);
  const isPlaylist = useCallback(() => search.includes("list="), [search]);

  // Fetch videos based on input type (Playlist or Search Query)
  const fetchVideos = useCallback(async () => {
    if (!search) return setVideoQueue([]);

    const url = isLink() ? 
      (isPlaylist() ? "ytapis/playlistinfo" : null) : 
      `ytapis/search?query=${encodeURIComponent(search)}`;

    if (!url) return;

    try {
      const { data } = await axios({
        method: isPlaylist() ? "POST" : "GET",
        url: `https://server-playnow-production.up.railway.app/${url}`,
        data: isPlaylist() ? { url: search } : undefined,
      });

      setVideoQueue(data.status ? [] : isPlaylist() ? data.items : data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideoQueue([]);
    }
  }, [search, isLink, isPlaylist]);

  // Debounced search effect
  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(fetchVideos, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [search, fetchVideos]);

  // Smooth video loading effect
  useEffect(() => {
    if (loadedCount < videoQueue.length) {
      const timer = setTimeout(() => setLoadedCount((prev) => prev + 1), 250);
      return () => clearTimeout(timer);
    }
  }, [loadedCount, videoQueue]);

  return (
    <div>
      
      <SearchBar
        value={search}
        hint="Search or Paste video link"
        onChange={setSearch}
        onCancel={() => setSearch("")}
        onSearch={() => {
          setVideoQueue([]);
          fetchVideos();
        }}
      />

      <div className="video-container">
        {!search && <p>Search videos or paste a video link to get started!</p>}
        {search && isLink() && !isPlaylist() && <YtPlayer url={search} />}
        {search && isLink() && isPlaylist() && (
          <>
            {!videoQueue.length && <div className="loader"></div>}
            {videoQueue.length > 0 &&
              videoQueue.slice(0, loadedCount).map((video, index) => (
                  <YtPlayer key={index} url={video.shortUrl} />
              ))}
          </>
        )}
        
        {search && !isLink() && (
          <>
            {!videoQueue.length && <div className="loader"></div>}
            {videoQueue.length > 0 &&
              videoQueue.slice(0, loadedCount).map((video, index) => (
                <YtPlayer 
                  key={index} 
                  url={video.id.playlistId ? `https://youtube.com/playlist?list=${video.id.playlistId}&autoplay=0` : `https://youtube.com/watch?v=${video.id.videoId}`} 
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
}