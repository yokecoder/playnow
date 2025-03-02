import { useEffect, useState, useRef } from "react";
import { Select, MenuItem } from "@mui/material";
import axios from "axios";
import ReactPlayer from "react-player";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

const YtPlayer = ({ url }) => {
    ///const [isReady, setIsReady] = useState(false);
    const [format, setFormat] = useState("video");
    const [resolution, setResolution] = useState("480p");
    const downloadUrl = `https://server-playnow-production.up.railway.app/ytapis/dl?url=${encodeURIComponent(
        url
    )}&fmt=${format}&res=${resolution}`;
    const getEmbedUrl = vurl =>
        `https://www.youtube-nocookie.com/embed/${
            vurl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)[1]
        }`;

    return (
        <>
            <div className="video-player">
                <ToastContainer
                    position="top-center"
                    autoClose={7000}
                    hideProgressBar
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    theme="dark"
                />

                <ReactPlayer
                    url={getEmbedUrl(url)}
                    controls
                    height="180px"
                    width="320px"
                />
                <div className="player-actions">
                    <Select
                        className="player-format-select"
                        value={format}
                        onChange={e => setFormat(e.target.value)}>
                        <MenuItem value="audio">Audio</MenuItem>
                        <MenuItem value="video">Video</MenuItem>
                    </Select>

                    {format === "video" && (
                        <Select
                            className="player-format-select"
                            value={resolution}
                            onChange={e => setResolution(e.target.value)}>
                            <MenuItem value="144p">144p</MenuItem>
                            <MenuItem value="240p">240p</MenuItem>
                            <MenuItem value="360p">360</MenuItem>
                            <MenuItem value="480p">480p</MenuItem>
                            <MenuItem value="720p">720p</MenuItem>
                            <MenuItem value="1080p">1080p</MenuItem>
                        </Select>
                    )}

                    <a
                        className="link player-act-button"
                        href={downloadUrl}
                        onClick={() => {
                            toast("Starting Download....");
                        }}>
                        Download
                    </a>
                </div>
            </div>
        </>
    );
};

export default YtPlayer;
