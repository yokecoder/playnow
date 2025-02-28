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
    const { currentTrack, trackQueue, prevTrackQueue, setCurrentTrack } =
        useTrackQueue();

    return (
        <>
            <SearchBar
                hint="Search for songs,playlist,albums, "
                value={search}
                onChange={setSearch}
                onCancel={() => setSearch("")}
                onFocus={() => setSearchOpen(true)}
            />

            <MusicSearch
                hint="Search for songs,playlist,albums"
                search={search}
                onChange={setSearch}
                isOpen={isSearchOpen}
                onClose={() => {
                    setSearchOpen(false);
                    setSearch("");
                }}
            />

            {currentTrack && <AudioPlayer trackId={currentTrack} />}
        </>
    );
}
