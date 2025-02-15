import { useState, useCallBack, useEffect } from "react";
import SearchBar from "../comps/searchbar.jsx";
import AudioPlayer from "../comps/audioplayer.jsx"
export default function Music(){
  
  const [search, setSearch] = useState("")
  
  
  
  return (
    <div>
      <SearchBar
        value={search}
        hint="Search for songs,albums,artists"
        onChange={setSearch}
        onCancel={() => setSearch("")}
      />
      {/*
      <AudioPlayer url="https://music.youtube.com/watch?v=qT4aMYKjYto&si=YOw_gsk_m7NVl45W"/>
      */}
      
      
    </div>
  )
  
}