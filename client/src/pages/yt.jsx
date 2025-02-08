import { useState } from "react";
import SearchBar from "../comps/searchbar";
import YtPlayer from "../comps/videoplayer";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




export default function Yt(){
  const [search, setSearch] = useState("")
  
  
  
  return (
  <>
    <div>
      
      <SearchBar value={search} onChange={setSearch} onCancel={() => setSearch("")}  />
      <div className="video-container">
        { search ? 
          <YtPlayer url={search} />
          : <p>Paste link to download</p>
        }
      </div>
    </div>
  </>
  )
  
}