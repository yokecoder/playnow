import { useState } from "react";
import { Link } from "react-router-dom";
import { IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

export default function BottomNavBar() {
    return (
        <div className="bottom-nav">
            <Link className="link" to="/">
                <IconButton className="bottom-nav-icon">
                    <PlayArrowIcon />
                </IconButton>
            </Link>
            <Link className="link" to="/music">
                <IconButton className="bottom-nav-icon">
                    <MusicNoteIcon />
                </IconButton>
            </Link>
            <Link className="link" to="/games">
                <IconButton className="bottom-nav-icon">
                    <SportsEsportsIcon />
                </IconButton>
            </Link>
        </div>
    );
}
