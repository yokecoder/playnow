import { useState, useCallback, useEffect, useContext } from "react";
import SearchBar from "../comps/searchbar";
import AudioPlayerContainer, { AudioPlayer, AudioPlayerMini, AudioQueueContext } from "../comps/audioplayer.jsx";
import ExplorePanel from "../comps/explorepanel";
import Playlist from "../comps/playlists";



/* The Component that handles music section overall */
/*
TODO: Design and Build Explore section with several categories 
TODO: Design and Build Search Section
*/
export default function Music() {
  const [search, setSearch] = useState("");
  const [miniPlayer, setMiniPlayer] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const { audioQueue } = useContext(AudioQueueContext) || {}; // Ensure `audioQueue` is always an object
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => 
    JSON.parse(localStorage.getItem("recentlyPlayed")) || []
  );

  // Sync recently played songs with localStorage
  useEffect(() => {
    localStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);
  
  return (
    <div>
      {/* Search Bar */}
      <SearchBar
        value={search}
        hint="Search for songs, albums, artists"
        onChange={setSearch}
        onCancel={() => setSearch("")}
      />

      {/* Explore Sections */}
      <div className="explore-panel-container">
        <ExplorePanel exploreCaption="Explore Genres" />
        {recentlyPlayed.length > 0 && <ExplorePanel exploreCaption="Recently Played" />}
      </div>

      {/* Plays audio only when audio Queue is available */}
      { audioQueue && audioQueue.length > 0 && 
        <AudioPlayerContainer url={audioQueue[0]}>
          {miniPlayer ? (
            <AudioPlayerMini onExpand={() => setMiniPlayer(false)} />
          ) : (
            <AudioPlayer onClose={() => setMiniPlayer(true)} />
          )}
        </AudioPlayerContainer>
      }
    </div>
  );
}