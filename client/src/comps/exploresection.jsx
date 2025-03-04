import { IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import altThumbnail from "../assets/file-QNciSaNA8MjnmGcSFXo8UM.webp";

export default function ExploreSection({ caption, children }) {
    return (
        <div className="explore-section">
            <div className="title">
                <span> {caption} </span>
            </div>
            <div className="carousel">{children}</div>
        </div>
    );
}

export const ExploreCard = ({
    title,
    thumbnail,
    desc,
    handlePlay,
    onThumbnailClick,
    ctrls = true
}) => {
    return (
        <div className="carousel-card-1">
            <img
                onClick={onThumbnailClick}
                className="carousel-card-img"
                src={!thumbnail ? altThumbnail : thumbnail}
            />
            <div className="card-info">
                <span className="card-title">
                    {title?.trim().split(/\s+/).slice(0, 5).join(" ")}
                </span>
                <span className="card-type">{desc}</span>
            </div>

            {ctrls && (
                <div className="card-ctrls">
                    <IconButton onClick={handlePlay}>
                        <PlayArrowIcon className="icon-btn" />{" "}
                    </IconButton>
                </div>
            )}
        </div>
    );
};
