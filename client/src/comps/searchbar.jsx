import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import axios from "axios";
import ExploreSection, { ExploreCard } from "./exploresection";
import { Playlist } from "./audioplayer";
import useTrackQueue from "../utils/queue_manager";

export default function SearchBar({
    value,
    hint,
    onChange,
    onSearch,
    onCancel,
    onFocus
}) {
    //Visiblity function for cancel icon
    const [cancelIcon, setCancelIcon] = useState("hidden");
    const showCancelIcon = () => {
        const visibility = value !== "" ? "visible" : "hidden";
        setCancelIcon(visibility);
    };

    return (
        <>
            <div className="search-container">
                <div onClick={onFocus} className="search-bar">
                    <IconButton
                        className={`icon-btn ${cancelIcon}`}
                        onClick={onCancel}>
                        <CloseIcon />
                    </IconButton>
                    <input
                        className="search-input-box"
                        type="text"
                        value={value}
                        placeholder={hint}
                        onChange={e => onChange(e.target.value)}
                        onKeyUp={showCancelIcon}
                    />
                    <IconButton className="icon-btn" onClick={onSearch}>
                        <SearchIcon />
                    </IconButton>
                </div>
            </div>
        </>
    );
}

export const MusicSearch = ({ hint, search, onChange, isOpen, onClose }) => {
    const { currentTrack, addToQueue, setCurrentTrack } = useTrackQueue();
    const [playlisId, setPlaylistId] = useState(null);
    const [isPlaylist, setPlaylist] = useState(false);

    const fetchQueryResults = async () => {
        if (!search) return null;
        try {
            const response = await axios.get(
                `https://server-playnow-production.up.railway.app/musicapis/ytmusic/search?query=${search}`
            );
            return response.data;
        } catch (error) {
            console.log("Error fetching track info:", error);
            return null;
        }
    };

    // React Query for fetching search results (disabled by default)
    const {
        data: queryResults,
        isLoading: isResultsLoading,
        refetch
    } = useQuery({
        queryKey: ["queryResults", search],
        queryFn: fetchQueryResults,
        enabled: false, // Prevent auto-fetching on input change
        cacheTime: 1000 * 60 * 30
    });

    // Group results by type
    const groupedResults = queryResults?.reduce((acc, result) => {
        const type = result?.type?.toLowerCase();
        const key = type === "video" ? "song" : type; // Treat "video" as "song"

        if (!acc[key]) acc[key] = [];
        acc[key].push(result);
        return acc;
    }, {});

    //console.log(groupedResults);
    // Define sections with proper titles
    const openPlaylist = id => {
        setPlaylistId(id);
        setPlaylist(true);
    };

    return (
        <>
            {isOpen && (
                <div className="music-search-container">
                    {/* Search Bar */}
                    <div className="search-bar music-searchbar">
                        <IconButton onClick={onClose}>
                            <CancelIcon className="icon-btn" />
                        </IconButton>
                        <input
                            placeholder={hint}
                            value={search}
                            onChange={e => onChange(e.target.value)}
                            className="search-input-box music-search-input"
                        />
                        <IconButton onClick={refetch}>
                            <SearchIcon className="icon-btn" />
                        </IconButton>
                    </div>

                    {/* Search Results */}
                    <div className="search-results-container">
                        {isResultsLoading && (
                            <div className="loader-container">
                                <div className="loader"></div>
                            </div>
                        )}
                        {queryResults && (
                            <>
                                {groupedResults?.song?.length > 0 && (
                                    <div className="search-result-songs">
                                        <span className="title">Songs</span>
                                        {groupedResults?.song?.map(data => (
                                            <>
                                                <div
                                                    key={data?.videoId}
                                                    className="music-card">
                                                    <IconButton className="thumbnail">
                                                        <div
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                height: "50px",
                                                                width: "50px",
                                                                borderRadius:
                                                                    "8px",
                                                                backgroundImage: `url(${data?.thumbnails[0]?.url})`,
                                                                backgroundSize:
                                                                    "cover",
                                                                backgroundPosition:
                                                                    "center",
                                                                backgroundRepeat:
                                                                    "no-repeat",
                                                                opacity: 0.5
                                                            }}
                                                        />
                                                        {data?.videoId ===
                                                        currentTrack ? (
                                                            <div className="waveform">
                                                                <div className="bar"></div>
                                                                <div className="bar"></div>
                                                                <div className="bar"></div>
                                                                <div className="bar"></div>
                                                            </div>
                                                        ) : (
                                                            <PlayArrowIcon
                                                                onClick={() =>
                                                                    addToQueue(
                                                                        data?.videoId
                                                                    )
                                                                }
                                                                style={{
                                                                    color: "var(--text-color)",
                                                                    height: "30px",
                                                                    width: "30px",
                                                                    zIndex: 1
                                                                }}
                                                            />
                                                        )}
                                                    </IconButton>
                                                    <div className="music-info-ttl">
                                                        <span>
                                                            {data?.name
                                                                ?.trim()
                                                                .split(/\s+/)
                                                                .slice(0, 6)
                                                                .join(" ")}
                                                        </span>
                                                        <span>
                                                            {data?.artist?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        ))}
                                    </div>
                                )}
                                {groupedResults?.playlist?.length > 0 && (
                                    <ExploreSection caption="Playlists">
                                        {groupedResults?.playlist?.map(data => (
                                            <ExploreCard
                                                key={data?.playlistId}
                                                title={data?.name}
                                                thumbnail={
                                                    data.thumbnails?.[
                                                        data.thumbnails
                                                            ?.length - 1
                                                    ]?.url ||
                                                    data?.thumbnails?.[0]?.url
                                                }
                                                desc={`${data.type?.toLowerCase()} • ${
                                                    data.artist?.name
                                                }`}
                                                handlePlay={() =>
                                                    openPlaylist(
                                                        data?.playlistId
                                                    )
                                                }
                                            />
                                        ))}
                                    </ExploreSection>
                                )}
                                {groupedResults?.album?.length > 0 && (
                                    <ExploreSection caption="Albums">
                                        {groupedResults?.album?.map(data => (
                                            <ExploreCard
                                                key={data.id}
                                                title={data.name}
                                                thumbnail={
                                                    data.thumbnails[
                                                        data.thumbnails.length -
                                                            1
                                                    ].url ||
                                                    data?.thumbnails?.[0]?.url
                                                }
                                                desc={`${data.type?.toLowerCase()} • ${
                                                    data.artist?.name
                                                }`}
                                                handlePlay={() =>
                                                    openPlaylist(
                                                        data?.playlistId
                                                    )
                                                }
                                            />
                                        ))}
                                    </ExploreSection>
                                )}
                                {groupedResults?.artist?.length > 0 && (
                                    <ExploreSection caption="Artists">
                                        {groupedResults?.artist?.map(data => (
                                            <ExploreCard
                                                key={data.id}
                                                title={data?.name}
                                                thumbnail={
                                                    data.thumbnails[
                                                        data.thumbnails.length -
                                                            1
                                                    ].url
                                                }
                                                desc={data.type?.toLowerCase()}
                                                ctrls={false}
                                            />
                                        ))}
                                    </ExploreSection>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
            {isPlaylist && (
                <Playlist
                    playlistId={playlisId}
                    onClose={() => setPlaylist(false)}
                />
            )}
        </>
    );
};
