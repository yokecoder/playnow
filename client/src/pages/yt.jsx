import { useState } from "react";
import SearchBar from "../comps/searchbar"

export default function Yt(){
  const [search, setSearch] = useState("")
  return (
  <>
    <div>
      
      <SearchBar value={search} onChange={setSearch} onCancel={() => setSearch("")}  />
      <div className="search-results">
        
      </div>
    </div>
  </>
  )
  
}