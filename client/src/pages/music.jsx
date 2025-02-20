import { useState, useCallBack, useEffect } from "react";
import SearchBar from "../comps/searchbar.jsx";
import AudioPlayerContainer, {AudioPlayer,AudioPlayerMini} from "../comps/audioplayer.jsx"
import ExplorePanel from "../comps/explorepanel.jsx";


export default function Music(){
  const [search, setSearch] = useState("");
  const [miniPlayer, setMiniPlayer] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => 
    JSON.parse(localStorage.getItem("recentlyPlayed")) ?? null
  );

  const [audioQueue, setAudioQueue] = useState(()=> 
    JSON.parse(localStorage.getItem("recentlyPlayed")) ?? null
  );
  
  
  
  return (
    <div>
      <SearchBar
        value={search}
        hint="Search for songs,albums,artists"
        onChange={setSearch}
        onCancel={() => setSearch("")}
      />
      <div className="explore-panel-container">
        <ExplorePanel exploreCaption="Explore Geners"/>
        { recentlyPlayed && <ExplorePanel exploreCaption="Recently Played"/> }
      </div>
      
      { audioQueue && 
        <AudioPlayerContainer url>
          { miniPlayer ? <AudioPlayerMini onExpand={() => setMiniPlayer(false)} /> : <AudioPlayer onClose={() => setMiniPlayer(true)} /> }
        </AudioPlayerContainer> 
      }
     
  
    </div>
  )
  
}