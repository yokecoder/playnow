import { useState, useEffect } from "react";
import SearchBar from "../comps/searchbar";
import ExploreSection, { ExploreCard } from "../comps/exploresection";
import AudioPlayer from "../comps/audioplayer";
import axios from "axios";

export default function Music() {
    const [search, setSearch] = useState("");
    return (
        <>
            <SearchBar
                hint="Search for songs,playlist,albums, "
                value={search}
                onChange={setSearch}
                onCancel={() => setSearch("")}
            />

            <AudioPlayer
                url="https://music.youtube.com/watch?v=m87B0ulgN64&si=o7uDlXzv7ISUulGW"
                miniPlayer={false}
            />
        </>
    );
}
