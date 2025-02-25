const express = require("express");
const axios = require("axios");
const play = require("play-dl");
const ytdl = require("@distube/ytdl-core");
const YTMusic = require("ytmusic-api");

const youtubeHeadersMiddleware = (req, res, next) => {
    req.ytdlOptions = {
        requestOptions: {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://www.youtube.com/',
                'Cookie': 'VISITOR_INFO1_LIVE=OgRU3YHghK8; YSC=gb2dKlvocOs; PREF=tz=Asia.Calcutta',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
            },
        },
    };
    next();
};

// Apply middleware to relevant YouTube Music routes
router.get("/ytmusic/track", youtubeHeadersMiddleware, async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: "Missing URL parameter" });

        const info = await play.video_basic_info(url, req.ytdlOptions);

        res.json({
            title: info.video_details.title,
            author: info.video_details.channel.name,
            duration: info.video_details.durationRaw,
            thumbnail: info.video_details.thumbnails[info.video_details.thumbnails.length - 1].url, // Best available image
            others: info.video_details
        });
    } catch (error) {
        console.error("Track Info Error:", error);
        res.status(500).json({ error: "Failed to fetch track info" });
    }
});

router.get("/ytmusic/playlist", youtubeHeadersMiddleware, async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: "Missing URL parameter" });

        const playlist = await play.playlist_info(url, { incomplete: true, ...req.ytdlOptions });
        res.json(playlist);
    } catch (error) {
        console.error("Playlist Error:", error);
        res.status(500).json({ error: "Failed to fetch playlist details" });
    }
});

router.get("/ytmusic/stream", youtubeHeadersMiddleware, async (req, res) => {
    try {
        const { url } = req.query;
        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).json({ error: "Invalid or missing YouTube Music URL" });
        }

        res.set({
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Transfer-Encoding": "chunked"
        });

        ytdl(url, {
            filter: "audioonly",
            quality: "highestaudio",
            highWaterMark: 32 * 1024,
            requestOptions: req.ytdlOptions.requestOptions, // Pass custom headers
        })
            .on("error", err => {
                console.error("Stream Error:", err.message);
                res.status(500).json({ error: "Failed to stream audio" });
            })
            .pipe(res);
    } catch (error) {
        console.error("Stream Error:", error.message);
        res.status(500).json({ error: "Failed to stream audio" });
    }
});