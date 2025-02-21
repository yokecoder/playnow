import { useState, useEffect, useCallback, useRef } from "react";
import SearchBar from "../comps/searchbar";
import YtPlayer from "../comps/videoplayer";
import axios from "axios";

export default function Yt() {
  const [search, setSearch] = useState(""); // Input value
  const [videoQueue, setVideoQueue] = useState([]); // Queue for multiple videos
  const [loadedCount, setLoadedCount] = useState(0); // Smooth loading control
  const timeoutRef = useRef(null);

  // Utility functions for input validation
  const isLink = useCallback(() => search.startsWith("http"), [search]);
  const isPlaylist = useCallback(() => search.includes("list="), [search]);

  // Fetch videos based on input type (Playlist or Search Query)
  const fetchVideos = useCallback(async () => {
    if (!search.trim()) {
      setVideoQueue([]);
      return;
    }

    const endpoint = isLink()
      ? isPlaylist()
        ? "ytapis/playlistinfo"
        : null
      : `ytapis/search?query=${encodeURIComponent(search)}`;

    if (!endpoint) return;

    try {
      const response = await axios({
        method: isPlaylist() ? "POST" : "GET",
        url: `https://server-playnow-production.up.railway.app/${endpoint}`,
        data: isPlaylist() ? { url: search } : undefined,
      });

      if (response.data?.status) {
        setVideoQueue([]);
      } else {
        setVideoQueue(isPlaylist() ? response.data.items : response.data);
      }
    } catch (error) {
      console.error("Error fetching videos:", error.message);
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

        {/* Handle Single Video Link */}
        {search && isLink() && !isPlaylist() && <YtPlayer url={search} />}

        {/* Handle Playlists */}
        {search && isLink() && isPlaylist() && (
          <>
            {!videoQueue.length && <div className="loader"></div>}
            {videoQueue.slice(0, loadedCount).map((video, index) => (
              <YtPlayer key={index} url={video.shortUrl} />
            ))}
          </>
        )}

        {/* Handle Search Results */}
        {search && !isLink() && (
          <>
            {!videoQueue.length && <div className="loader"></div>}
            {videoQueue.slice(0, loadedCount).map((video, index) => {
              const videoUrl = video.id.playlistId
                ? `https://youtube.com/playlist?list=${video.id.playlistId}&autoplay=0`
                : `https://youtube.com/watch?v=${video.id.videoId}`;

              return <YtPlayer key={index} url={videoUrl} />;
            })}
          </>
        )}
      </div>
    </div>
  );
}