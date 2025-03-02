import { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SearchBar, { MusicSearch } from "../comps/searchbar";
import ExploreSection, { ExploreCard } from "../comps/exploresection";
import AudioPlayer, { Playlist } from "../comps/audioplayer";
import useTrackQueue from "../utils/queue_manager.jsx";
import axios from "axios";

export default function Music() {
    const [search, setSearch] = useState("");
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isPlaylistOpen, setPlaylistOpen] = useState(false);
    const [playlistId, setPlaylistId] = useState(null);
    const { currentTrack, trackQueue, prevTrackQueue, setCurrentTrack } =
        useTrackQueue();

    const openPlaylist = id => {
        setPlaylistId(id);
        setPlaylistOpen(true);
    };

    return (
        <>
            <div className="music-explore-bar">
                <h2>Explore Music</h2>
                <IconButton
                    className="icon-btn "
                    onClick={() => setSearchOpen(true)}>
                    <SearchIcon className="music-search-icon" />
                </IconButton>
            </div>

            <MusicSearch
                hint="Search for songs,playlist,albums,etc..."
                search={search}
                onChange={setSearch}
                isOpen={isSearchOpen}
                onClose={() => {
                    setSearchOpen(false);
                    setSearch("");
                }}
            />

            {isPlaylistOpen && (
                <Playlist
                    playlistId={playlistId}
                    onClose={() => setPlaylistOpen(false)}
                />
            )}
            {currentTrack && <AudioPlayer trackId={currentTrack} />}
        </>
    );
}
