import { useState } from "react";
import SearchBar from "../comps/searchbar";
import VideoPlayer from "../comps/videoplayer";

export default function Yt(){
  const [search, setSearch] = useState("")
  
  
  
  return (
  <>
    <div>
      
      <SearchBar value={search} onChange={setSearch} onCancel={() => setSearch("")}  />
      <div className="search-results">
        <VideoPlayer url="https://www.youtube.com/embed/playlist?list=PLwheXbz_XBtltsxCn00Hkdc2Dqa9t6wNd&si=dzP4AGQb-8DMpBVs"/>
      </div>
    </div>
  </>
  )
  
}