import { useState } from "react"
import { IconButton } from "@mui/material"
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from "@mui/icons-material/Close";



export default function SearchBar({ value, onChange, onSearch, onCancel }){
  
  //Visiblity function for cancel icon 
  const [cancelIcon, setCancelIcon] = useState("hidden")
  const showCancelIcon = () => {
    const visibility = value !== ""  ? "visible" : "hidden";
    setCancelIcon(visibility)
  }
  
  


  
  
  
  
  return (
  <>
    <div className="search-container">
      <div className="search-bar">
        <IconButton className={`icon-btn ${cancelIcon}`} onClick={onCancel} >
          <CloseIcon />
        </IconButton>
        <input className="search-input-box" type="text" value={value} placeholder="search / paste video link"  onChange={(e) => onChange(e.target.value) } onKeyUp={showCancelIcon}/>
        <IconButton className="icon-btn" onClick={onSearch}>
          <SearchIcon />
        </IconButton>
      </div>
    </div>
  </>
  )
  
}