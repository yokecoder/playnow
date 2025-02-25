import useTheme from "./theme";
import { Icon, IconButton } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

export default function TopNavBar() {
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            <div className="top-nav">
                <div className="app-title">
                    <Icon className="topnav-icon-btn">
                        <PlayCircleOutlineIcon />
                    </Icon>
                    <span className="title-text">PlayNow</span>
                </div>
                <IconButton className="topnav-icon-btn" onClick={toggleTheme}>
                    {theme === "dark" ? <LightMode /> : <DarkMode />}
                </IconButton>
            </div>
        </>
    );
}
