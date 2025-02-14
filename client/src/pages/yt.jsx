import { useState, useEffect, useCallback } from "react";
import SearchBar from "../comps/searchbar";
import YtPlayer from "../comps/videoplayer";
import axios from "axios";

export default function Yt() {
  const [search, setSearch] = useState(""); // Input value
  const [videoQueue, setVideoQueue] = useState([]); // Queue for multiple videos
  const [loadedCount, setLoadedCount] = useState(0); // Smooth loading control

  // Memoized functions to determine search type
  const isLink = useCallback(() => /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(:\d+)?(\/\S*)?$/.test(search), [search]);
  const isPlaylist = useCallback(() => search.includes("list="), [search]);

  // Fetch all videos from a playlist
  const fetchPlaylist = useCallback(async () => {
    if (!isLink() || !isPlaylist()) return setVideoQueue([]);

    try {
      const { data } = await axios.post("https://server-playnow-production.up.railway.app/ytapis/playlistinfo", { url: search });
      if (!data.status) setVideoQueue(data.items);
    } catch (error) {
      console.error("Error fetching playlist:", error);
      setVideoQueue([]);
    }
  }, [search, isLink, isPlaylist]);

  // Fetch videos based on search query
  const fetchQuery = useCallback(async () => {
    if (!search || isLink()) return setVideoQueue([]);

    try {
      const { data } = await axios.get(`https://server-playnow-production.up.railway.app/ytapis/search?query=${search}`);
      if (!data.status) setVideoQueue(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setVideoQueue([]);
    }
  }, [search, isLink]);

  // Effect to fetch results based on input
  useEffect(() => {
    const delay = setTimeout(() => {
      if (isLink() && isPlaylist()) fetchPlaylist();
      else if (search && !isLink()) fetchQuery();
      else setVideoQueue([]);
    }, 300); // Debounced search effect

    return () => clearTimeout(delay); // Cleanup on re-render
  }, [search, fetchPlaylist, fetchQuery, isLink, isPlaylist]);

  // Smooth video loading effect
  useEffect(() => {
    if (loadedCount < videoQueue.length) {
      const timer = setTimeout(() => setLoadedCount((prev) => prev + 1), 250);
      return () => clearTimeout(timer);
    }
  }, [loadedCount, videoQueue]);

  return (
    <div>
      {/* Search Bar for YouTube Videos */}
      <SearchBar
        value={search}
        hint="Search or Paste video link"
        onChange={setSearch}
        onCancel={() => setSearch("")}
        onSearch={() => (isLink() && isPlaylist() ? fetchPlaylist() : fetchQuery())}
      />

      <div className="video-container">
        {!search && <p>Search videos or paste a video link to get started!</p>}

        {search && isLink() && !isPlaylist() && <YtPlayer url={search} />}

        {search && isLink() && isPlaylist() && videoQueue.length > 0 && 
          videoQueue.slice(0, loadedCount).map((video, index) => <YtPlayer key={index} url={video.shortUrl} />)}

        {search && !isLink() && !isPlaylist() && (
          <>
            <p>Crunching results...</p>
            {videoQueue.length > 0 &&
              videoQueue.slice(0, loadedCount).map((video, index) => (
                <YtPlayer key={index} url={video.id.playlistId ? `https://youtube.com/playlist?list=${video.id.playlistId}` : `https://youtube.com/watch?v=${video.id.videoId}`} />
              ))}
          </>
        )}
      </div>
    </div>
  );
}