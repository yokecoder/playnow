import { useCallback, useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import useTrackQueue from "../utils/queue_manager.jsx";

export default function AudioPlayer({ trackId }) {
    const trackRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [miniPlayer, setMiniPlayer] = useState(true);
    const { skipToPrevious, skipToNext } = useTrackQueue();

    const fetchTrackInfo = async ({ queryKey }) => {
        const [, trackId] = queryKey;
        if (!trackId) return null;
        try {
            const response = await axios.get(
                `https://server-playnow-production.up.railway.app/musicapis/ytmusic/track/${trackId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching track info:", error);
            return null;
        }
    };

    const { data: trackInfo, isLoading } = useQuery({
        queryKey: ["trackInfo", trackId],
        queryFn: fetchTrackInfo,
        enabled: !!trackId,
        cacheTime: 1000 * 60 * 30
    });

    const formatTime = seconds => {
        if (isNaN(seconds) || seconds <= 0) return "00:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
            2,
            "0"
        )}`;
    };
    const handleLoadedMetadata = () => {
        const audio = trackRef.current;
        if (!audio) return;

        setAudioDuration(audio.duration || 0);
        setIsPlaying(true);
        audio.play().catch(err => console.warn("Autoplay blocked:", err));
    };

    const handleTimeUpdate = () => {
        const audio = trackRef.current;
        if (audio) {
            setCurrentTime(audio.currentTime);
            const duration = audio.duration || 1; // Prevent division by zero
            setProgress((audio.currentTime / duration) * 100);
        }
    };

    const handleSeek = e => {
        const audio = trackRef.current;
        if (!audio) return;

        const newTime = (e.target.value / 100) * (audio.duration || 1);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
        setProgress(parseFloat(e.target.value) || 0);
    };

    const togglePlay = () => {
        const audio = trackRef.current;
        if (!audio) return;

        if (!isPlaying) {
            audio.play().catch(err => console.warn("Play failed:", err));
        } else {
            audio.pause();
        }
        setIsPlaying(!isPlaying);
    };

    // Handle media session updates
    useEffect(() => {
        if (!trackRef.current || !trackInfo) return;

        const audio = trackRef.current;

        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: trackInfo?.name || "Unknown Title",
                artist: trackInfo?.artist?.name || "Unknown Artist",
                album: "PlayNow Music",
                artwork: trackInfo?.thumbnails?.map(thumbnail => ({
                    src: thumbnail.url || "",
                    sizes: `${thumbnail.width || 512}x${
                        thumbnail.height || 512
                    }`,
                    type: "image/png"
                })) || [
                    {
                        src: "fallback-image-url.png",
                        sizes: "512x512",
                        type: "image/png"
                    }
                ]
            });

            navigator.mediaSession.setActionHandler("play", () => {
                audio.play();
                setIsPlaying(true);
            });

            navigator.mediaSession.setActionHandler("pause", () => {
                audio.pause();
                setIsPlaying(false);
            });

            navigator.mediaSession.setActionHandler(
                "seekbackward",
                ({ seekOffset = 10 }) => {
                    audio.currentTime = Math.max(
                        audio.currentTime - seekOffset,
                        0
                    );
                }
            );

            navigator.mediaSession.setActionHandler(
                "seekforward",
                ({ seekOffset = 10 }) => {
                    audio.currentTime = Math.min(
                        audio.currentTime + seekOffset,
                        audio.duration || 0
                    );
                }
            );

            navigator.mediaSession.setActionHandler(
                "seekto",
                ({ seekTime }) => {
                    if (seekTime !== undefined) audio.currentTime = seekTime;
                }
            );

            navigator.mediaSession.setActionHandler("stop", () => {
                audio.pause();
                audio.currentTime = 0;
                setIsPlaying(false);
            });

            navigator.mediaSession.setActionHandler("nexttrack", skipToNext);
            navigator.mediaSession.setActionHandler(
                "previoustrack",
                skipToPrevious
            );
        }
    }, [trackInfo, skipToNext, skipToPrevious]);

    // Handle track source updates
    useEffect(() => {
        if (!trackRef.current || !trackId) return;
        trackRef.current.src = `https://server-playnow-production.up.railway.app/ytapis/streamAudio?url=https://www.youtube.com/watch?v=${trackId}`;
    }, [trackId]);

    // Handle page unload cleanup
    useEffect(() => {
        const audio = trackRef.current;
        if (!audio) return;

        const handleBeforeUnload = () => {
            audio.pause();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    //const streamUrl = `https://server-playnow-production.up.railway.app/ytapis/streamAudio?url=https://www.youtube.com/watch?v=${trackId}`;

    return (
        <>
            <audio
                ref={trackRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={skipToNext}
                playsInline
            />

            {miniPlayer ? (
                <AudioPlayerMini
                    trackInfo={trackInfo}
                    onToggle={togglePlay}
                    onExpand={() => setMiniPlayer(false)}
                    isPlaying={isPlaying}
                    onSkipNext={skipToNext}
                    onSkipPrevious={skipToPrevious}
                />
            ) : (
                <div className="audio-player">
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "inherit",
                            height: "inherit",
                            backgroundImage: trackInfo?.thumbnails
                                ? `url("${
                                      trackInfo?.thumbnails?.[
                                          trackInfo?.thumbnails?.length - 1
                                      ]?.url
                                  }")`
                                : "",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: "blur(15px)",
                            opacity: 0.4,
                            zIndex: -1
                        }}
                    />
                    <div>
                        <IconButton
                            onClick={() => setMiniPlayer(true)}
                            className="control-btn">
                            <KeyboardArrowDownIcon className="control-btn-icon-top" />
                        </IconButton>
                    </div>
                    <div className="info">
                        {isLoading ? (
                            <div className="loader"></div>
                        ) : trackInfo ? (
                            <>
                                <img
                                    className="audio-thumbnail"
                                    src={
                                        trackInfo?.thumbnails?.[
                                            trackInfo?.thumbnails?.length - 1
                                        ]?.url
                                    }
                                    alt="thumbnail"
                                />
                                <span>
                                    {trackInfo?.name
                                        ?.trim()
                                        .split(/\s+/)
                                        .slice(0, 5)
                                        .join(" ")}
                                </span>
                                <span>{trackInfo?.artist?.name}</span>
                            </>
                        ) : (
                            <p>No track info available</p>
                        )}
                    </div>
                    <div className="audio-progress">
                        <span>{formatTime(currentTime)}</span>
                        <progress
                            className="progress-input"
                            type="range"
                            min="0"
                            max="100"
                            value={isNaN(progress) ? 0 : progress}
                            onChange={handleSeek}
                        />
                        <span>
                            {formatTime(trackInfo?.duration ?? audioDuration)}
                        </span>
                    </div>
                    <div className="controls">
                        <IconButton
                            onClick={skipToPrevious}
                            className="control-btn">
                            <SkipPreviousIcon className="control-btn-icon" />
                        </IconButton>
                        <IconButton
                            onClick={togglePlay}
                            className="control-btn">
                            {isPlaying ? (
                                <PauseIcon className="control-btn-icon" />
                            ) : (
                                <PlayArrowIcon className="control-btn-icon" />
                            )}
                        </IconButton>
                        <IconButton
                            onClick={skipToNext}
                            className="control-btn">
                            <SkipNextIcon className="control-btn-icon" />
                        </IconButton>
                    </div>
                </div>
            )}
        </>
    );
}
export const AudioPlayerMini = ({
    trackInfo,
    onToggle,
    isPlaying,
    onSkipPrevious,
    onSkipNext,
    onExpand
}) => {
    return (
        <div className="audio-player-mini">
            <div onClick={onExpand} className="infobox">
                {trackInfo ? (
                    <img
                        className="thumbnail"
                        src={
                            trackInfo?.thumbnails?.[
                                trackInfo?.thumbnails?.length - 1
                            ]?.url
                        }
                    />
                ) : (
                    <div className="loader-mini"></div>
                )}
                <div className="info">
                    {trackInfo && (
                        <>
                            <span>{trackInfo?.name}</span>
                            <span>{trackInfo?.artist?.name}</span>
                        </>
                    )}
                </div>
            </div>
            <div className="controls">
                <IconButton onClick={onSkipPrevious} className="control-btn">
                    <SkipPreviousIcon className="control-btn-icon" />
                </IconButton>
                <IconButton className="control-btn" onClick={onToggle}>
                    {isPlaying ? (
                        <PauseIcon className="control-btn-icon" />
                    ) : (
                        <PlayArrowIcon className="control-btn-icon" />
                    )}
                </IconButton>
                <IconButton onClick={onSkipNext} className="control-btn">
                    <SkipNextIcon className="control-btn-icon" />
                </IconButton>
            </div>
        </div>
    );
};

/*
Component: <Playlist />:
========================
params:
=======
url: playlist url of youtube music 
onClose: event to be occurred when the playlist is closed 
Desc: 
=====
The <Playlist /> Component gives a smoother
experience when exploring playlists from the explore section
or the home page.
*/

export const Playlist = ({ playlistId, onClose }) => {
    const [isVisible, setVisible] = useState(true);
    const {
        trackQueue,
        addToQueue,
        addToLast,
        clearTrackQueue,
        currentTrack,
        setCurrentTrack
    } = useTrackQueue();

    // Fetch playlist info
    const fetchPlaylistInfo = async () => {
        if (!playlistId) return null;
        try {
            const { data } = await axios.get(
                `https://server-playnow-production.up.railway.app/musicapis/ytmusic/playlist/${playlistId}`
            );
            return data;
        } catch (error) {
            console.error("Error fetching playlist info:", error);
            return null;
        }
    };

    const { data: playlistInfo, isLoading } = useQuery({
        queryKey: ["playlistInfo", playlistId],
        queryFn: fetchPlaylistInfo,
        enabled: !!playlistId,
        cacheTime: 1000 * 60 * 30
    });

    // Auto queue and play the first track
    const autoQueuePlaylist = () => {
        if (!playlistInfo?.videos?.length) return;

        clearTrackQueue();

        const [firstTrack, ...remainingTracks] = playlistInfo.videos;

        // Play the first track immediately
        setCurrentTrack(firstTrack.id);

        // Add the rest of the tracks to the queue
        remainingTracks.forEach(vid => addToLast(vid.id));
    };

    return (
        <>
            {isVisible && (
                <div className="playlist-container">
                    {/* Loading Animation */}
                    {isLoading && (
                        <div className="loader-container">
                            <div className="loader"></div>
                        </div>
                    )}

                    {/* Playlist UI */}
                    {!isLoading && playlistInfo && (
                        <>
                            <div className="top-ctrls">
                                <IconButton
                                    className="top-ctrl-btn"
                                    onClick={
                                        onClose || (() => setVisible(false))
                                    }>
                                    <KeyboardArrowDownIcon className="icons-top" />
                                </IconButton>
                            </div>

                            {/* Playlist Info */}
                            <div className="playlist-info">
                                <img
                                    className="thumbnail"
                                    src={
                                        playlistInfo.thumbnail?.url ||
                                        playlistInfo.videos?.[0]?.thumbnail?.url
                                    }
                                    alt="Playlist Thumbnail"
                                />
                                <span className="title">
                                    {playlistInfo.title
                                        ?.trim()
                                        .split(/\s+/)
                                        .slice(0, 6)
                                        .join(" ")}
                                </span>
                                <span>{playlistInfo.channel?.name}</span>

                                <div className="playlist-ctrls">
                                    <div
                                        onClick={autoQueuePlaylist}
                                        className="play-btn">
                                        <PlayArrowIcon className="playbtn-icon" />
                                        <span className="play-btn-text">
                                            Play
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Playlist Tracks */}
                            <div className="music-list">
                                {playlistInfo.videos.map(vid => (
                                    <div key={vid.id} className="music-card">
                                        <div className="music-info">
                                            <IconButton className="thumbnail">
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        height: "50px",
                                                        width: "50px",
                                                        borderRadius: "8px",
                                                        backgroundImage: `url(${vid.thumbnail.url})`,
                                                        backgroundSize: "cover",
                                                        backgroundPosition:
                                                            "center",
                                                        backgroundRepeat:
                                                            "no-repeat",
                                                        opacity: 0.5
                                                    }}
                                                />
                                                {vid.id === currentTrack ? (
                                                    <div className="waveform">
                                                        <div className="bar"></div>
                                                        <div className="bar"></div>
                                                        <div className="bar"></div>
                                                        <div className="bar"></div>
                                                    </div>
                                                ) : (
                                                    <PlayArrowIcon
                                                        onClick={() =>
                                                            addToQueue(vid.id)
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
                                                    {vid.title
                                                        ?.trim()
                                                        .replace(/\|$/, "")
                                                        .split(/\s+/)
                                                        .slice(0, 6)
                                                        .join(" ")}
                                                </span>
                                                <span>{vid.channel?.name}</span>
                                            </div>
                                        </div>
                                        <div className="music-info-duration">
                                            {vid.durationRaw}
                                        </div>
                                        <div className="music-opts">
                                            <IconButton>
                                                <MoreVertIcon className="icon-btn" />
                                            </IconButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};
