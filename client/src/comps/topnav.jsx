import { useContext } from "react"
import { ThemeContext } from "./theme"
import { IconButton } from "@mui/material"
import { DarkMode, LightMode } from "@mui/icons-material";


export default function TopNavBar() {
  const {theme, toggleTheme} = useContext(ThemeContext)
  
  return (
    <>
      <div className="top-nav">
        <span className="app-title">PlayNow</span>
        <IconButton className="topnav-icon-btn" onClick={toggleTheme}>
          {theme === "dark" ? <LightMode/>:  <DarkMode/>}
        </IconButton>
      </div>
    </>
  )
}
