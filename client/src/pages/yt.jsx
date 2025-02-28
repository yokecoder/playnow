import { useState, useEffect, useCallback } from "react";
import SearchBar from "../comps/searchbar";
import YtPlayer from "../comps/videoplayer";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export default function Yt() {
    const [search, setSearch] = useState("");

    // Check if input is a YouTube link or playlist
    const isLink = useCallback(() => search.startsWith("http"), [search]);
    const isPlaylist = useCallback(
        () => isLink() && search.includes("list="),
        [search]
    );

    // Delayed fetch to avoid frequent re-renders
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(prev => prev.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch videos
    const fetchVideos = async () => {
        if (!search) return [];

        let endpoint = "";
        let method = "GET";
        let requestData = null;

        if (isLink()) {
            if (isPlaylist()) {
                endpoint = "ytapis/playlistinfo";
                method = "POST";
                requestData = { url: search };
            } else {
                return [];
            }
        } else {
            endpoint = `ytapis/search?query=${encodeURIComponent(search)}`;
        }

        const { data } = await axios({
            method,
            url: `https://server-playnow-production.up.railway.app/${endpoint}`,
            data: requestData
        });

        return isPlaylist() ? data.items : data;
    };

    const { data: videoQueue = [], isFetching } = useQuery({
        queryKey: ["videos", search],
        queryFn: fetchVideos,
        enabled: !!search,
        staleTime: 1000 * 60 * 5
    });

    return (
        <div>
            <SearchBar
                value={search}
                hint="Search or Paste video link"
                onChange={setSearch}
                onCancel={() => setSearch("")}
            />

            <div className="video-container">
                {!search && (
                    <p>Search videos or paste a video link to get started!</p>
                )}

                {search && isLink() && !isPlaylist() && (
                    <YtPlayer url={search} />
                )}

                {isFetching && (
                    <div className="loader-container">
                        <div className="loader"></div>
                    </div>
                )}

                {search &&
                    isLink() &&
                    isPlaylist() &&
                    videoQueue.map((video, index) => (
                        <YtPlayer key={index} url={video.shortUrl} />
                    ))}

                {search &&
                    !isLink() &&
                    videoQueue.map((video, index) => {
                        const videoUrl = video.id.playlistId
                            ? `https://youtube.com/playlist?list=${video.id.playlistId}&autoplay=0`
                            : `https://youtube.com/watch?v=${video.id.videoId}`;
                        return <YtPlayer key={index} url={videoUrl} />;
                    })}
            </div>
        </div>
    );
}
