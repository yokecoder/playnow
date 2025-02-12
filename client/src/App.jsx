import { useState, useContext } from 'react';
import { Routes, Route } from "react-router-dom";
import ThemeProvider, { ThemeContext } from "./comps/theme";
import TopNavBar from "./comps/topnav";
import BottomNavBar from "./comps/btmnav";
import Yt from "./pages/yt";
import Music from "./pages/music.jsx";
import Game from "./pages/game.jsx";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { IconButton } from "@mui/material";
import './App.css';


function App() {
  
  return (
    <>
    
      <div className="app-layout">
        <TopNavBar />
        <div className="page-layout">
          <Routes>
            
            <Route path="/" element={<Yt />} />
            <Route path="/music" element={<Music />} />
            <Route path="/games" element={<Game />} />
            
          </Routes>
        </div>
        <BottomNavBar />
      </div>
  
    </>
  );
}

export default App;