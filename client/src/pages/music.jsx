import { useState, useEffect } from "react";
import SearchBar from "../comps/searchbar";
import ExploreSection, { ExploreCard } from "../comps/exploresection";
import AudioPlayer, { Playlist } from "../comps/audioplayer";
import useTrackQueue from "../utils/queue_manager.jsx";
import axios from "axios";

export default function Music() {
    const [search, setSearch] = useState("");
    const { currentTrack, trackQueue, prevTrackQueue, setCurrentTrack } =
        useTrackQueue();

    return (
        <>
            <SearchBar
                hint="Search for songs,playlist,albums, "
                value={search}
                onChange={setSearch}
                onCancel={() => setSearch("")}
            />

            {/*<Playlist playlistId="PLN3DeYs4ee1T2IZTJsOhKETCGCWvBMUxd" />**/}

            {currentTrack && <AudioPlayer trackId={currentTrack} />}
        </>
    );
}
