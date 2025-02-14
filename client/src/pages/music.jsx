import { useState, useCallBack, useEffect } from "react";
import SearchBar from "../comps/searchbar.jsx";

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
      
      
    </div>
  )
  
}