import { useContext } from "react"
import { ThemeContext } from "./theme"
import { Icon, IconButton } from "@mui/material"
import { DarkMode, LightMode } from "@mui/icons-material";
import  Logo from '../assets/file-RcN3rh6FcsMCoTS9i3KNUn.webp'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';




export default function TopNavBar() {
  const {theme, toggleTheme} = useContext(ThemeContext)
  
  return (
    <>
      <div className="top-nav">
        <div className="app-title">
          <Icon className="title-icon">
            <PlayCircleIcon />
          </Icon>
          <span className="title-text" >PlayNow</span>
        </div>
        <IconButton className="topnav-icon-btn" onClick={toggleTheme}>
          {theme === "dark" ? <LightMode/>:  <DarkMode/>}
        </IconButton>
      </div>
    </>
  )
}
