import { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { MusicSearch } from "../comps/searchbar";
import ExploreSection, { ExploreCard } from "../comps/exploresection";
import AudioPlayer, { Playlist } from "../comps/audioplayer";
import useTrackQueue from "../utils/queue_manager.jsx";
import { useQueries } from "@tanstack/react-query";
import axios from "axios";

export default function Music() {
    const [search, setSearch] = useState("");
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isPlaylistOpen, setPlaylistOpen] = useState(false);
    const [playlistId, setPlaylistId] = useState(null);
    const { currentTrack, addToQueue } = useTrackQueue();

    const openPlaylist = id => {
        setPlaylistId(id);
        setPlaylistOpen(true);
    };
    // Api endpoints for explore data

    const endpoints = [
        "/new",
        "/trending",
        "/topcharts",
        "/topmixes",
        "/topartists",
        "/moods",
        "/genres",
        "/languages"
    ];

    // Helper function to fetch API data
    const fetchData = async endpoint => {
        try {
            const response = await axios.get(
                `https://server-playnow-production.up.railway.app/musicapis/ytmusic${endpoint}`
            );
            return response.data; // Use response.data for axios
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null; // Return null instead of undefined
        }
    };

    const queries = useQueries({
        queries: endpoints.map(endpt => ({
            queryKey: [endpt], // Use meaningful queryKey
            queryFn: () => fetchData(endpt)
        }))
    });

    // Convert array of queries into a dictionary { endpoint: data }
    const exploreData = endpoints.reduce((acc, endpt, index) => {
        acc[endpt] = queries[index]?.data || []; // Ensure value is always an array
        return acc;
    }, {});

    useEffect(() => console.log(exploreData), []);
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
            <div className="music-explore-container">
                {Object.values(exploreData).some(data => data.length === 0) ? (
                    <div className="loader-container">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <>
                        {exploreData["/new"].length > 0 && (
                            <ExploreSection caption="New Releases">
                                {exploreData["/new"].map(
                                    (data, idx) =>
                                        data.type !== "ARTIST" && (
                                            <ExploreCard
                                                key={idx}
                                                title={data.name}
                                                thumbnail={
                                                    data.thumbnails?.[
                                                        data.thumbnails.length -
                                                            1
                                                    ]?.url
                                                }
                                                desc={`${data.type?.toLowerCase()} • ${
                                                    data.artist?.name
                                                }`}
                                                
                                            />
                                        )
                                )}
                            </ExploreSection>
                        )}

                        {exploreData["/trending"].length > 0 && (
                            <ExploreSection caption="Discover what's Trending">
                                {exploreData["/trending"].map(
                                    (data, idx) =>
                                        data.type !== "ARTIST" && (
                                            <ExploreCard
                                                key={idx}
                                                title={data.name}
                                                thumbnail={
                                                    data.thumbnails?.[
                                                        data.thumbnails.length -
                                                            1
                                                    ]?.url
                                                }
                                                desc={`${data.type?.toLowerCase()} • ${
                                                    data.artist?.name
                                                }`}
                                            />
                                        )
                                )}
                            </ExploreSection>
                        )}
                        {exploreData["/topcharts"].length > 0 && (
                            <ExploreSection caption="Top Charts">
                                {exploreData["/topcharts"].map(
                                    (data, idx) =>
                                        data.type !== "ARTIST" && (
                                            <ExploreCard
                                                key={idx}
                                                title={data.name}
                                                thumbnail={
                                                    data.thumbnails?.[
                                                        data.thumbnails.length -
                                                            1
                                                    ]?.url
                                                }
                                                desc={`${data.type?.toLowerCase()} • ${
                                                    data.artist?.name
                                                }`}
                                            />
                                        )
                                )}
                            </ExploreSection>
                        )}
                        {exploreData["/topmixes"].length > 0 && (
                            <ExploreSection caption="Top Mixes">
                                {exploreData["/topmixes"].map(
                                    (data, idx) =>
                                        data.type !== "ARTIST" && (
                                            <ExploreCard
                                                key={idx}
                                                title={data.name}
                                                thumbnail={
                                                    data.thumbnails?.[
                                                        data.thumbnails.length -
                                                            1
                                                    ]?.url
                                                }
                                                desc={`${data.type?.toLowerCase()} • ${
                                                    data.artist?.name
                                                }`}
                                            />
                                        )
                                )}
                            </ExploreSection>
                        )}
                        {exploreData["/topartists"].length > 0 && (
                            <ExploreSection caption="From Favourite Artists">
                                {exploreData["/topartists"].map(
                                    (data, idx) =>
                                        data.type !== "ARTIST" && (
                                            <ExploreCard
                                                key={idx}
                                                title={data.name}
                                                thumbnail={
                                                    data.thumbnails?.[
                                                        data.thumbnails.length -
                                                            1
                                                    ]?.url
                                                }
                                                desc={`${data.type?.toLowerCase()} • ${
                                                    data.artist?.name
                                                }`}
                                            />
                                        )
                                )}
                            </ExploreSection>
                        )}
                        {exploreData["/genres"].length > 0 && (
                            <ExploreSection caption="Listen To Your Genre">
                                {exploreData["/genres"].map(
                                    (data, idx) =>
                                        data.type !== "ARTIST" && (
                                            <ExploreCard
                                                key={idx}
                                                title={data.name}
                                                thumbnail={
                                                    data.thumbnails?.[
                                                        data.thumbnails.length -
                                                            1
                                                    ]?.url
                                                }
                                                desc={`${data.type?.toLowerCase()} • ${
                                                    data.artist?.name
                                                }`}
                                            />
                                        )
                                )}
                            </ExploreSection>
                        )}
                        {exploreData["/moods"].length > 0 && (
                            <ExploreSection caption="Listen To Your Mood">
                                {exploreData["/moods"].map(
                                    (data, idx) =>
                                        data.type !== "ARTIST" && (
                                            <ExploreCard
                                                key={idx}
                                                title={data.name}
                                                thumbnail={
                                                    data.thumbnails?.[
                                                        data.thumbnails.length -
                                                            1
                                                    ]?.url
                                                }
                                                desc={`${data.type?.toLowerCase()} • ${
                                                    data.artist?.name
                                                }`}
                                            />
                                        )
                                )}
                            </ExploreSection>
                        )}
                        {exploreData["/languages"].length > 0 && (
                            <ExploreSection caption="Listen To Your Language">
                                {exploreData["/languages"].map(
                                    (data, idx) =>
                                        data.type !== "ARTIST" && (
                                            <ExploreCard
                                                key={idx}
                                                title={data.name}
                                                thumbnail={
                                                    data.thumbnails?.[
                                                        data.thumbnails.length -
                                                            1
                                                    ]?.url
                                                }
                                                desc={`${data.type?.toLowerCase()} • ${
                                                    data.artist?.name
                                                }`}
                                            />
                                        )
                                )}
                            </ExploreSection>
                        )}
                    </>
                )}
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
