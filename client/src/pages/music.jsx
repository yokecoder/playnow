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
    const { currentTrack, addToQueue, setCurrentTrack } = useTrackQueue();

    const openPlaylist = id => {
        setPlaylistId(id);
        setPlaylistOpen(true);
    };
    // Api endpoints for explore data

    const endpoints = ["/newsongs", "/trending", "/topmixes", "/topartists"];

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
            queryFn: () => fetchData(endpt),
            staleTime: 60 * 60 * 1000, // 60 minutes
            cacheTime: 60 * 60 * 1000 // 60 minutes
        }))
    });

    // Convert array of queries into a dictionary { endpoint: data }
    const exploreData = endpoints.reduce((acc, endpt, index) => {
        acc[endpt] = queries[index]?.data || []; // Ensure value is always an array
        return acc;
    }, {});

    const handleExplorePlay = data => {
        if (data?.type === "PLAYLIST" || data?.type === "ALBUM") {
            if (data?.playlistId) {
                openPlaylist(data?.playlistId);
            }
        } else if (data?.type === "VIDEO" || data?.type === "SONG") {
            if (data?.videoId) {
                setCurrentTrack(data?.videoId);
            }
        }
    };
    //useEffect(() => console.log(exploreData), []);
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
                        {exploreData["/newsongs"].length > 0 && (
                            <ExploreSection caption="New Releases">
                                {exploreData["/newsongs"].map(
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
                                                handlePlay={() =>
                                                    handleExplorePlay(data)
                                                }
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
                                                handlePlay={() =>
                                                    handleExplorePlay(data)
                                                }
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
                                                handlePlay={() =>
                                                    handleExplorePlay(data)
                                                }
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
                                                handlePlay={() =>
                                                    handleExplorePlay(data)
                                                }
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
