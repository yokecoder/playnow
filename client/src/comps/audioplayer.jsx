import { useCallback, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function AudioPlayer({ url, miniPlayer = true }) {
    const trackRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [bgImage, setBgImage] = useState(null);

    const isPlaylist = useCallback(() => {
        return url.startsWith("http") && url.includes("list=");
    }, [url]);

    const streamUrl =
        !isPlaylist() &&
        `https://server-playnow-production.up.railway.app/musicapis/ytmusic/stream?url=${url}`;

    // Fetch Track Info using React Query
    const { data: trackInfo, isLoading: isTrackLoading } = useQuery({
        queryKey: ["trackInfo", url],
        queryFn: async () => {
            if (!isPlaylist()) {
                const response = await axios.get(
                    `https://server-playnow-production.up.railway.app/musicapis/ytmusic/track?url=${url}`
                );
                return response.data;
            }
            return null;
        },
        enabled: !isPlaylist() // Only fetch when it's a track
    });

    // Fetch Playlist Info using React Query
    const { data: playlistInfo, isLoading: isPlaylistLoading } = useQuery({
        queryKey: ["playlistInfo", url],
        queryFn: async () => {
            if (isPlaylist()) {
                const response = await axios.get(
                    `https://your-api-url/playlist`,
                    { params: { url } }
                );
                return response.data;
            }
            return null;
        },
        enabled: isPlaylist() // Only fetch when it's a playlist
    });

    // Format time to min:sec
    const formatTime = seconds => {
        if (isNaN(seconds) || seconds <= 0) return "00:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
            2,
            "0"
        )}`;
    };

    // Handle Seeking of progress bar
    const handleSeek = useCallback(e => {
        const audio = trackRef.current;
        if (!audio) return;
        const newTime = (e.target.value / 100) * (audio.duration || 1);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
        setProgress(e.target.value);
    }, []);

    return (
        <>
            <audio src={streamUrl} ref={trackRef} controls />
            {isPlaylist() ? (
                <div>
                    {isPlaylistLoading ? (
                        <p>Loading playlist...</p>
                    ) : (
                        <div>
                            <h3>Playlist: {playlistInfo?.title}</h3>
                            <ul>
                                {playlistInfo?.tracks.map((track, index) => (
                                    <li key={index}>{track.title}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : miniPlayer ? (
                <div>Mini Player</div>
            ) : (
                /* Full Screen Audio Player Component */
                <div className="audio-player">
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "inherit",
                            height: "inherit",
                            backgroundImage: `url("${bgImage}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: "blur(15px)",
                            opacity: 0.4,
                            zIndex: -1
                        }}
                    />
                    <div>
                        <IconButton className="control-btn">
                            <ArrowDropDownIcon className="control-btn-icon" />
                        </IconButton>
                    </div>
                    <div className="info">
                        {isTrackLoading ? (
                            <p>Loading track...</p>
                        ) : trackInfo ? (
                            <>
                                <img
                                    className="audio-thumbnail"
                                    src={trackInfo.thumbnail}
                                    alt="thumbnail"
                                />
                                <span>{trackInfo.title}</span>
                                <span>{trackInfo.author}</span>
                            </>
                        ) : (
                            <p>No track info available</p>
                        )}
                    </div>
                    <div className="audio-progress">
                        <span>{formatTime(currentTime)}</span>
                        <input
                            className="progress-input"
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={handleSeek}
                        />
                        <span>{formatTime(audioDuration)}</span>
                    </div>
                    <div className="controls">
                        <IconButton className="control-btn">
                            <SkipPreviousIcon className="control-btn-icon" />
                        </IconButton>
                        <IconButton
                            className="control-btn"
                            onClick={() => setIsPlaying(!isPlaying)}>
                            {isPlaying ? (
                                <PauseIcon className="control-btn-icon" />
                            ) : (
                                <PlayArrowIcon className="control-btn-icon" />
                            )}
                        </IconButton>
                        <IconButton className="control-btn">
                            <SkipNextIcon className="control-btn-icon" />
                        </IconButton>
                    </div>
                </div>
            )}
        </>
    );
}
