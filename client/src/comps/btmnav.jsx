import { useState } from "react"
import { Link } from "react-router-dom";
import { IconButton } from "@mui/material"
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';


export default function BottomNavBar(){
  
  return (
    <>
      <div className="bottom-nav">
        <Link className="link" to="/">
          <IconButton className="bottom-nav-icon">
            <PlayArrowIcon />
          </IconButton>
        </Link>
        <Link className="link" to="/music" >
          <IconButton className="bottom-nav-icon">
            <LibraryMusicIcon />
          </IconButton>
        </Link>
        <Link className="link" to="/games" >
          <IconButton className="bottom-nav-icon">
            <SportsEsportsIcon />
          </IconButton>
        </Link>
      </div>
    </>
  )
  
}