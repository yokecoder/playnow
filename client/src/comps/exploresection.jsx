import { IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import altThumbnail from "../assets/file-QNciSaNA8MjnmGcSFXo8UM.webp";

export default function ExploreSection({ caption, children }) {
    return (
        <div className="category">
            <div className="title">
                <span> {caption} </span>
                <ChevronRightIcon className="icon-btn" />
            </div>
            <div className="carousel">{children}</div>
        </div>
    );
}

export const ExploreCard = ({
    title,
    thumbnail,
    refUrl,
    type,
    artist,
    year
}) => {
    return (
        <div className="carousel-card-1">
            <img
                className="carousel-card-img"
                src={!thumbnail ? altThumbnail : thumbnail}
            />
            <span className="card-title">
                {title?.trim().split(/\s+/).slice(0, 3).join(" ")}
            </span>
            <span className="card-type">
                {type?.toLowerCase()} • {artist} {year}
            </span>
            <div className="card-ctrls">
                <IconButton onClick={handlePlay}>
                    <PlayArrowIcon className="icon-btn" />{" "}
                </IconButton>
            </div>
        </div>
    );
};
