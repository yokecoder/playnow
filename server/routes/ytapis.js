const ytdl = require("@distube/ytdl-core");
const ytpl = require("ytpl");
const express = require("express");
const axios = require("axios");
const playdl = require("play-dl");
const YTDL_AGENT = require("../ytdlagent.js");

const router = express.Router();
//console.log(YTDL_AGENT);
// Return all the data fectched
router.get("/info", async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: "Url parameter is required" });
        }
        const options = { agent: YTDL_AGENT };
        const info = await ytdl.getInfo(url, options);
        res.json(info);
    } catch (error) {
        console.error("Error fetching video info:", error);
        res.status(500).json(error);
    }
});

//Direct downnload Url
router.get("/dl", async (req, res) => {
    try {
        const { url, res: resolution = "480p" } = req.query;

        if (!url || !ytdl.validateURL(url)) {
            return res
                .status(400)
                .json({ status: false, msg: "Invalid or missing URL" });
        }

        const videoInfo = await ytdl.getBasicInfo(url, { agent: YTDL_AGENT });

        // Sanitize and format the filename
        let videoTitle = videoInfo.videoDetails.title
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "_")
            .substring(0, 100)
            .trim();

        let filename = `${videoTitle}.mp4`;

        // Set headers for download
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );
        res.setHeader("Content-Type", "video/mp4");

        ytdl(url, {
            filter: "videoandaudio",
            qualityLabel: resolution,
            highWaterMark: 32 * 1024,
            agent: YTDL_AGENT
        }).pipe(res);

        // Choose correct format options
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: "Internal Server Error",
            details: error.message
        });
    }
});

router.get("/dlAudio", async (req, res) => {
    try {
        const { url } = req.query;

        if (!url || !ytdl.validateURL(url)) {
            return res
                .status(400)
                .json({ status: false, msg: "Invalid or missing URL" });
        }

        const videoInfo = await ytdl.getBasicInfo(url, { agent: YTDL_AGENT });

        // Sanitize and format the filename
        let videoTitle = videoInfo.videoDetails.title
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "_")
            .substring(0, 100)
            .trim();

        let filename = `${videoTitle}.mp3`;

        // Set headers for download
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );
        res.setHeader("Content-Type", "audio/mp3");

        ytdl(url, {
            filter: "audioonly",
            highWaterMark: 12 * 1024,
            agent: YTDL_AGENT
        }).pipe(res);

        // Choose correct format options
    } catch (error) {
        res.status(500).json({
            status: false,
            msg: "Internal Server Error",
            details: error.message
        });
    }
});

//api for streaming allows to play third-party restricted videos
router.get("/stream", (req, res) => {
    try {
        const { url, res: resolution = "480p" } = req.query;

        if (!url || !ytdl.validateURL(url)) {
            return res
                .status(400)
                .json({ error: "Invalid or missing YouTube Music URL" });
        }

        res.set({
            "Content-Type": "video/mp4",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Transfer-Encoding": "chunked"
        });

        ytdl(url, {
            filter: "videoandaudio",
            qualityLabel: resolution,
            highWaterMark: 16 * 512,
            agent: YTDL_AGENT
        }).pipe(res);
    } catch {
        res.status(500).json({ error: "Failed to stream video" });
    }
});

router.get("/streamAudio", async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) return res.status(400).json({ error: "Missing ID parameter" });

        const url = `https://www.youtube.com/watch?v=${id}`;

        // Fetch video info
        const info = await ytdl.getInfo(url, { agent: YTDL_AGENT });

        // Choose proper audio-only format
        const audioFormat = ytdl.chooseFormat(info.formats, {
            filter: f =>
                f.mimeType.includes("audio/") && !f.videoCodec && f.audioCodec
        });

        if (!audioFormat) {
            return res
                .status(404)
                .json({ error: "No valid audio format found" });
        }

        // Stream audio-only format
        const stream = ytdl(url, {
            format: audioFormat, 
            agent: YTDL_AGENT,
            highWaterMark: 1 * 1024 * 1024 
        });

        // Set headers
        res.setHeader("Content-Type", audioFormat.mimeType);
        res.setHeader("Content-Disposition", `inline; filename="${id}.webm"`);

        stream.pipe(res);

        // Handle errors
        stream.on("error", err => {
            console.error("Stream error:", err);
            res.status(500).json({ error: "Stream error" });
        });
    } catch (error) {
        console.error("Error streaming audio:", error);
        res.status(500).json({ error: "Failed to stream audio" });
    }
});
//information About a Playlist Url
router.post("/playlistinfo", async (req, res) => {
    const url = req.body.url;
    try {
        const playlist = await ytpl(url);
        res.json(playlist);
    } catch (error) {
        console.error("Error fetching playlist details:", error.message);
        res.json({ status: false, error });
    }
});

//Api for searching through youtube search
// apikey rotation to manage quota limits
const apiKeys = [process.env.YT_APIKEY, process.env.YT_APIKEY2];
let currentKeyIndex = 0;
//Uses Youtube Data Api v3 to findout searches
router.get("/search", async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res
            .status(400)
            .json({ error: "Query parameter 'query' is required" });
    }

    try {
        const apiKey = apiKeys[currentKeyIndex]; // Select the current key
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length; // Rotate keys

        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    part: "snippet",
                    q: query,
                    maxResults: 10,
                    type: "video,playlist",
                    key: apiKey
                }
            }
        );

        res.json(response.data.items);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch search results",
            details: error.message
        });
    }
});

module.exports = router;
