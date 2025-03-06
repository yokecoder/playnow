const ytdl = require("@distube/ytdl-core");
const ytpl = require("ytpl");
const express = require("express");
const axios = require("axios");

const router = express.Router();
const cookies = [
    {
        name: "GPS",
        value: "1",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "YSC",
        value: "Ahn3kDsGSzs",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "VISITOR_INFO1_LIVE",
        value: "CRyw7TBoQdY",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "PREF",
        value: "f6=40000000&tz=Asia.Calcutta",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "VISITOR_PRIVACY_METADATA",
        value: "CgJJThIEGgAgZA%3D%3D",
        domain: ".youtube.com",
        path: "/",
        secure: true
    },
    {
        name: "__Secure-ROLLOUT_TOKEN",
        value: "CJ_FraW6i6OIXBCdhfmGsfSLAxjXyPSnsfSLAw%3D%3D",
        domain: ".youtube.com",
        path: "/",
        secure: true
    }
];

const YTDL_AGENT = ytdl.createAgent(cookies);

// Return all the data fectched
router.get("/info", async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ error: "Url parameter is required" });
        }

        const info = await ytdl.getInfo(url, { agent: YTDL_AGENT });
        res.json(info);
    } catch (error) {
        console.error("Error fetching video info:", error);
        res.status(500).json(error);
    }
});

//Direct downnload Url
router.get("/dl", async (req, res) => {
    const { url, fmt = "video", res: resolution = "480p" } = req.query;
    if (!url) {
        return res.status(400).json({ status: false, msg: "URL not found" });
    }

    try {
        // Fetch video info with YTDL_AGENT
        const videoInfo = await ytdl.getInfo(url, { agent: YTDL_AGENT });

        let videoTitle = videoInfo.videoDetails.title
            .normalize("NFKD")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "_")
            .substring(0, 100)
            .trim();
        let ext = fmt === "audio" ? "mp3" : "mp4";
        let filename = `${videoTitle}.${ext}`;

        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", `${fmt}/${ext}`);

        ytdl(url, {
            agent: YTDL_AGENT,
            filter: f => (fmt === "audio" ? f.hasAudio && !f.hasVideo : f.hasAudio && f.hasVideo),
            qualityLabel: fmt === "video" ? resolution : "",
            highWaterMark: 1024 * 1024 * 10
        }).pipe(res);
    } catch (error) {
        res.status(400).json({
            status: false,
            msg: "Internal Server Error",
            details: error.message
        });
    }
});

//api for streaming allows to play third-party restricted videos
router.get("/stream", async (req, res) => {
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
            agent: YTDL_AGENT,
            qualityLabel: resolution,
            highWaterMark: 24 * 1024
        })
            .on("error", err => {
                console.error("Stream Error:", err.message);
                res.status(500).json({ error: "Failed to stream video" });
            })
            .pipe(res);
    } catch (error) {
        console.error("Stream Error:", error.message);
        res.status(500).json({ error: "Failed to stream video" });
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
