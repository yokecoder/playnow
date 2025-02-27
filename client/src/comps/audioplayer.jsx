import { useCallback, useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
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
        const [, trackId] = queryKey; // Extract trackId from queryKey
        if (!trackId) return null; // Prevent API call with undefined ID
        // Check localStorage for cached track info

        try {
            const response = await axios.get(
                `https://server-playnow-production.up.railway.app/musicapis/ytmusic/track/${trackId}`
            );

            return response.data;
        } catch (error) {
            console.log("Error fetching track info:", error);
            return null;
        }
    };

    // Fetch Track Info using React Query
    const { data: trackInfo, isLoading } = useQuery({
        queryKey: ["trackInfo", trackId],
        queryFn: fetchTrackInfo,
        enabled: !!trackId,
        cacheTime: 1000 * 60 * 30
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

    // Update duration when audio metadata loads
    const handleLoadedMetadata = () => {
        const audio = trackRef.current;
        if (audio) {
            setAudioDuration(audio.duration);
        }
    };

    // Update progress as the audio plays
    const handleTimeUpdate = () => {
        const audio = trackRef.current;
        if (audio) {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        }
    };

    // Handle Seeking of progress bar
    const handleSeek = e => {
        const audio = trackRef.current;
        if (!audio) return;
        const newTime = (e.target.value / 100) * (audio.duration || 1);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
        setProgress(e.target.value);
    };

    const togglePlay = () => {
        const audio = trackRef.current;
        if (!audio) return;

        if (!isPlaying) {
            audio.play();
        } else {
            audio.pause();
        }
        setIsPlaying(!isPlaying);
    };

    const startAutoPlay = () => {
        setIsPlaying(true);
        trackRef.current.play();
    };

    const streamUrl = `https://server-playnow-production.up.railway.app/musicapis/ytmusic/stream/${
        trackInfo?.videoId ?? trackId
    }`;

    useEffect(() => {
        if (!trackInfo || !trackRef.current) return;
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: trackInfo?.name || "Unknown Title",
                artist: trackInfo?.artist?.name || "Unknown Artist",
                album: "PlayNow Music",
                artwork: trackInfo?.thumbnails?.map(thumbnail => ({
                    src: thumbnail.url || "", // Ensure 'src' exists
                    sizes:
                        thumbnail.width && thumbnail.height
                            ? `${thumbnail.width}x${thumbnail.height}`
                            : "512x512",
                    type: "image/png" // Adjust based on the actual format
                })) || [
                    {
                        src: "fallback-image-url.png",
                        sizes: "512x512",
                        type: "image/png"
                    }
                ]
            });

            const audio = trackRef.current;
            navigator.mediaSession.setActionHandler("play", () => {
                audio.play();
                setIsPlaying(true);
            });
            navigator.mediaSession.setActionHandler("pause", () => {
                audio.pause();
                setIsPlaying(false);
            });
            navigator.mediaSession.setActionHandler("seekbackward", details => {
                audio.currentTime = Math.max(
                    audio.currentTime - (details.seekOffset || 10),
                    0
                );
            });
            navigator.mediaSession.setActionHandler("seekforward", details => {
                audio.currentTime = Math.min(
                    audio.currentTime + (details.seekOffset || 10),
                    audio.duration || 0
                );
            });
            navigator.mediaSession.setActionHandler("seekto", details => {
                if (details.seekTime !== undefined) {
                    audio.currentTime = details.seekTime;
                }
            });
            navigator.mediaSession.setActionHandler("stop", () => {
                audio.pause();
                audio.currentTime = 0;
                setIsPlaying(false);
            });
        }
    }, [trackInfo, trackRef, trackId]);

    useEffect(() => {
        const audio = trackRef.current;
        if (!audio) return;
        const handleBeforeUnload = () => {
            audio.pause();
            audio.src = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);
    return (
        <>
            <audio
                src={streamUrl}
                ref={trackRef}
                onLoadedMetadata={() => {
                    startAutoPlay();
                    handleLoadedMetadata();
                }}
                onEnded={skipToNext}
                onTimeUpdate={handleTimeUpdate}
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
                /* Full Screen Audio Player Component */
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
                                      ].url
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
                            <ArrowDropDownIcon className="control-btn-icon" />
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
                                <span>{trackInfo?.name}</span>
                                <span>{trackInfo?.artist?.name}</span>
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

    const fetchPlaylistInfo = async () => {
        if (!playlistId) return;

        try {
            const response = await axios.get(
                `https://server-playnow-production.up.railway.app/musicapis/ytmusic/playlist/${playlistId}`
            );
            if (response.data) {
                return response.data;
            }
        } catch (error) {
            console.error("Error fetching playlist info:", error);
            return;
        }
    };

    const { data: playlistInfo, isLoading } = useQuery({
        queryKey: ["playlistInfo", playlistId],
        queryFn: fetchPlaylistInfo,
        enabled: !!playlistId,
        cacheTime: 1000 * 60 * 30
    });
    const autoQueuePlaylist = () => {
        clearTrackQueue();
        setCurrentTrack(playlistInfo?.videos[0]?.id);
        if (playlistInfo?.videos?.length > 1) {
            playlistInfo.videos.slice(1).forEach((vid, idx) => {
                setTimeout(() => addToLast(vid.id), idx * 999);
            });
        }
    };

    useEffect(() => {
        autoQueuePlaylist();
    }, [playlistId, playlistInfo]);
    
    /* 
    Default function when the arrow down button is clicked 
    and onClose function is not defined.
  */
    const closePlaylist = () => setVisible(false);

    return (
        <>
            {isVisible && (
                <div className="playlist-container">
                    <div className="top-ctrls">
                        <IconButton
                            className="top-ctrl-btn"
                            onClick={onClose ? onClose : closePlaylist}>
                            <ArrowDropDownIcon className="icons-top" />
                        </IconButton>
                    </div>

                    <div className="playlist-info">
                        {playlistInfo && (
                            <>
                                <img
                                    className="thumbnail"
                                    src={playlistInfo?.thumbnail?.url}
                                    alt="Playlist Thumbnail"
                                />
                                <span className="title">
                                    {playlistInfo?.title}
                                </span>
                                <span>{playlistInfo?.channel?.name}</span>
                            </>
                        )}
                    </div>

                    <div className="playlist-ctrls">
                        <div onClick={autoQueuePlaylist} className="play-btn">
                            <PlayArrowIcon className="playbtn-icon" />
                            <span className="play-btn-text">Play</span>
                        </div>
                    </div>

                    <div className="music-list">
                        {playlistInfo?.videos?.map(vid => (
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
                                                backgroundPosition: "center",
                                                backgroundRepeat: "no-repeat",
                                                opacity: 0.5
                                            }}
                                        />
                                        {vid.id === currentTrack ? (
                                            <PauseIcon
                                                style={{
                                                    color: "var(--text-color)",
                                                    height: "30px",
                                                    width: "30px",
                                                    zIndex: 1
                                                }}
                                            />
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
                                        <span>{vid?.title}</span>
                                        <span>{vid?.channel?.name}</span>
                                    </div>
                                </div>
                                <div className="music-opts">
                                    <IconButton>
                                        <MoreVertIcon className="icon-btn" />
                                    </IconButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
