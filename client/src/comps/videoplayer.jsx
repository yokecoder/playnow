import { useState, useCallback } from "react";
import { Select, MenuItem } from "@mui/material";
import ReactPlayer from "react-player";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

const YtPlayer = ({ url }) => {
    const [format, setFormat] = useState("video");
    const [resolution, setResolution] = useState("480p");

    const downloadUrl = `https://server-playnow-production.up.railway.app/ytapis/dl?url=${encodeURIComponent(
        url
    )}&fmt=${format}&res=${resolution}`;
<<<<<<< HEAD
<<<<<<< HEAD

    // Memoized function to avoid unnecessary re-renders
    const getEmbedUrl = useCallback(vurl => {
        if (!vurl) return "";
        const match = vurl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
        return match
            ? `https://www.youtube-nocookie.com/embed/${match[1]}`
            : "";
    }, []);
=======
>>>>>>> parent of 7bdce1e (created explore apis)
=======
>>>>>>> parent of 7bdce1e (created explore apis)

    return (
        <div className="video-player">
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                theme="dark"
            />

<<<<<<< HEAD
<<<<<<< HEAD
            <ReactPlayer url={url} controls height="180px" width="320px" />

            <div className="player-actions">
                <Select
                    className="player-format-select"
                    value={format}
                    onChange={e => setFormat(e.target.value)}
                    sx={{ minWidth: 120, transition: "0.3s ease-in-out" }}>
                    <MenuItem value="audio">Audio</MenuItem>
                    <MenuItem value="video">Video</MenuItem>
                </Select>

                {format === "video" && (
=======
=======
>>>>>>> parent of 7bdce1e (created explore apis)
                <ReactPlayer url={url} controls height="180px" width="320px" />
                <div className="player-actions">
>>>>>>> parent of 7bdce1e (created explore apis)
                    <Select
                        className="player-format-select"
                        value={resolution}
                        onChange={e => setResolution(e.target.value)}
                        sx={{ minWidth: 100, transition: "0.3s ease-in-out" }}>
                        {["144p", "240p", "360p", "480p", "720p", "1080p"].map(
                            res => (
                                <MenuItem key={res} value={res}>
                                    {res}
                                </MenuItem>
                            )
                        )}
                    </Select>
                )}

                <a
                    className="link player-act-button"
                    href={downloadUrl}
                    onClick={() => toast("Starting Download...")}
                    style={{ transition: "0.3s ease-in-out" }}>
                    Download
                </a>
            </div>
        </div>
    );
};

export default YtPlayer;
