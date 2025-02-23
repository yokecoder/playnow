import { useState, useCallback, useEffect, useContext } from "react";
import SearchBar from "../comps/searchbar";
import IconButton from "@mui/material/IconButton";
import AudioPlayerContainer, { AudioPlayer, AudioPlayerMini, useAudioQueue } from "../comps/audioplayer";
import Playlist from "../comps/playlists";
import ExploreSection from "../comps/exploresection";
import axios from "axios";


/* The Component that handles music section overall */
/*
TODO: Design and Build Explore section with several categories 
TODO: Design and Build Search Section
*/
export default function Music() {
  const [search, setSearch] = useState("");
  const [miniPlayer, setMiniPlayer] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const { audioQueue } = useAudioQueue() // Ensure `audioQueue` is always an object
  const [genres , setGenres] = useState([])
  
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => 
    JSON.parse(localStorage.getItem("recentlyPlayed")) || []
  );

  // Sync recently played songs with localStorage
  useEffect(() => {
    localStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);
  
  useEffect(() => {
    const fetchGenres = async () => {
      const response = await axios.get("https://server-playnow-production.up.railway.app/musicapis/spotifyapi?ep=/browse/categories")
      if (response.data){
        setGenres(response.data?.categories)
      } else {
        setGenres([])
      }
    };
    
    fetchGenres();
    //console.log(genres.items)
  }, [])
  
  
  return (
    <div>
      {/* Search Bar */}
      <SearchBar
        value={search}
        hint="Search for songs, albums, artists"
        onChange={setSearch}
        onCancel={() => setSearch("")}
      />
      
      {/*Home Page Design for Exploring Songs, Playlists, Artists many more */}
      <div className="explore-section" >
        {/* Section of Genres */}
        <ExploreSection caption="Explore Genres">
          {genres?.items?.map((item, idx) => (
              <div key={idx} style={{ backgroundImage: item?.icons?.[0]?.url ? `url(${item.icons[0].url})` : "none" }} className="carousel-card">
                <span className="category-item-name" >{item?.name} </span>
              </div>
            ))}
        </ExploreSection>
        
        {/* Section for recently Played songs */}
        <ExploreSection caption="Recently Played">
          {recentlyPlayed.length === 0 && <span>No recent plays. Start exploring</span>}
        </ExploreSection>
        
        {/* Section for Trending Songs */}
        <ExploreSection caption="Trending Songs">
         
        </ExploreSection>
        
        <ExploreSection caption="Listen to your Language">
        
        </ExploreSection>
        
        <ExploreSection caption="Listen to you're Mood">
         
        </ExploreSection>
        
        <ExploreSection caption="Top Artists">
        
        </ExploreSection>
        
        
        
        
        
        
        
        
        
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