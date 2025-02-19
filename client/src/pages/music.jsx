import { useState, useCallBack, useEffect } from "react";
import SearchBar from "../comps/searchbar.jsx";
import AudioPlayerContainer, {AudioPlayer,AudioPlayerMini} from "../comps/audioplayer.jsx"

export default function Music(){
  const [search, setSearch] = useState("")
  const [miniPlayer, setMiniPlayer] = useState(true);
  
  
  return (
    <div>
      <SearchBar
        value={search}
        hint="Search for songs,albums,artists"
        onChange={setSearch}
        onCancel={() => setSearch("")}
      />
   
      {/*
      <AudioPlayerContainer url="https://music.youtube.com/watch?v=R0sha8pUGeY&si=cbn4oWhwkddVhcXB">
        { miniPlayer ? <AudioPlayerMini onExpand={() => setMiniPlayer(false)} />: <AudioPlayer onClose={() => setMiniPlayer(true)} /> }
      </AudioPlayerContainer>
      */}
     
      
   
      
      
    </div>
  )
  
}