import { Routes, Route } from "react-router-dom";
import { AudioQueueProvider } from "./comps/audioplayer";
import TopNavBar from "./comps/topnav";
import BottomNavBar from "./comps/btmnav";
import Yt from "./pages/yt";
import Music from "./pages/music";
import Game from "./pages/game";
import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <TopNavBar />
      
      <div className="page-layout">
        <AudioQueueProvider>
          <Routes>
            <Route path="/" element={<Yt />} />
            <Route path="/music" element={<Music />} />
            <Route path="/games" element={<Game />} />
          </Routes>
        </AudioQueueProvider>
      </div>

      <BottomNavBar />
    </div>
  );
}

export default App;