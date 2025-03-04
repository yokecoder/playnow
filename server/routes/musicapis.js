const express = require("express");
const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const YTMusic = require("ytmusic-api");
const play = require("play-dl");
const { HttpsProxyAgent } = require("https-proxy-agent");

const router = express.Router();
const youtubeHeadersMiddleware = (req, res, next) => {
    req.ytdlOptions = {
        requestOptions: {
            headers: {
                "User Agent":
                    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
                Referer: "https://www.youtube.com/",
                Cookie: "VISITOR_INFO1_LIVE=OgRU3YHghK8; YSC=gb2dKlvocOs; PREF=tz=Asia.Calcutta",
                "Accept-Language": "en-US,en;q=0.9",
                Connection: "keep-alive"
            }
        }
    };
    next();
};

router.use("/musicapis/ytmusic/", youtubeHeadersMiddleware);
// Proxy List (Replace with actual working proxies)
const proxyList = [
    "http://3.130.65.162:3128",
    "http://118.113.244.222:2324",
    "http://8.211.51.115:9050",
    "http://47.90.149.238:1036"
];

// Function to get a random proxy
const getRandomProxy = () =>
    proxyList[Math.floor(Math.random() * proxyList.length)];

// Proxy Middleware
const proxyMiddleware = (req, res, next) => {
    const proxyUrl = getRandomProxy();

    req.proxyAgent = new HttpsProxyAgent(proxyUrl);
    req.headers["User-Agent"] =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    req.headers["Referer"] = "https://music.youtube.com/";
    req.headers["Origin"] = "https://music.youtube.com";

    next();
};

// Initialize YTMusic with cookies
const ytmusic = new YTMusic();
(async () => {
    try {
        await ytmusic.initialize();
        console.log("YTMusic API initialized successfully with cookies!");
    } catch (error) {
        console.error("YTMusic API initialization failed:", error);
    }
})();

// Search for Music
router.get("/ytmusic/search", proxyMiddleware, async (req, res) => {
    try {
        const query = req.query.query;
        if (!query)
            return res
                .status(400)
                .json({ error: "Query parameter is required" });

        const results = await ytmusic.search(query, "all", {
            requestOptions: { agent: req.proxyAgent, headers: req.headers }
        });

        if (!results.length)
            return res.status(404).json({ error: "No results found" });

        res.json(results);
    } catch (error) {
        console.error("Error in search:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get Song Details
router.get("/ytmusic/track/:id", proxyMiddleware, async (req, res) => {
    try {
        const songDetails = await ytmusic.getSong(req.params.id, {
            requestOptions: { agent: req.proxyAgent, headers: req.headers }
        });
        res.json(songDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Playlist Details
router.get("/ytmusic/playlist/:id", proxyMiddleware, async (req, res) => {
    try {
        const playlist = await play.playlist_info(
            `https://music.youtube.com/playlist?list=${req.params.id}`,
            {
                incomplete: true,
                requestOptions: { agent: req.proxyAgent, headers: req.headers }
            }
        );
        if (!playlist || !playlist.title)
            return res
                .status(404)
                .json({ error: "Playlist not found or unavailable" });

        res.json(playlist);
    } catch (error) {
        console.error("Error fetching playlist:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Artist Details
router.get("/ytmusic/artist/:id", proxyMiddleware, async (req, res) => {
    try {
        const artistDetails = await ytmusic.getArtist(req.params.id, {
            requestOptions: { agent: req.proxyAgent, headers: req.headers }
        });
        res.json(artistDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Album Details
router.get("/ytmusic/album/:id", proxyMiddleware, async (req, res) => {
    try {
        const albumDetails = await ytmusic.getAlbum(req.params.id, {
            requestOptions: { agent: req.proxyAgent, headers: req.headers }
        });
        res.json(albumDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stream Song

// Category-based APIs
const categories = [
    "new",
    "trending",
    "topcharts",
    "topartists",
    "topmixes",
    "genres",
    "moods",
    "languages"
];
categories.forEach(category => {
    router.get(`/ytmusic/${category}`, proxyMiddleware, async (req, res) => {
        try {
            const results = await ytmusic.search(
                `${category} all latest`,
                "all",
                {
                    requestOptions: {
                        agent: req.proxyAgent,
                        headers: req.headers
                    }
                }
            );
            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});

// Dynamic Genre, Mood, and Language Search
router.get("/ytmusic/genres/:genre", proxyMiddleware, async (req, res) => {
    try {
        const resp = await ytmusic.search(
            `${req.params.genre} genre latest`,
            "all",
            {
                requestOptions: { agent: req.proxyAgent, headers: req.headers }
            }
        );
        res.json(resp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/moods/:mood", proxyMiddleware, async (req, res) => {
    try {
        const resp = await ytmusic.search(
            `${req.params.mood} mood latest`,
            "all",
            {
                requestOptions: { agent: req.proxyAgent, headers: req.headers }
            }
        );
        res.json(resp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/languages/:lang", proxyMiddleware, async (req, res) => {
    try {
        const resp = await ytmusic.search(`${req.params.lang} latest`, "all", {
            requestOptions: { agent: req.proxyAgent, headers: req.headers }
        });
        res.json(resp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/stream/:id", proxyMiddleware, async (req, res) => {
    try {
        const url = `https://www.youtube.com/watch?v=${req.params.id}`;
        res.set({
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Accept-Ranges": "bytes",
            "Transfer-Encoding": "chunked"
        });

        ytdl(url, {
            filter: "audioonly",
            quality: "highestaudio",
            highWaterMark: 24 * 1024,
            dlChunkSize: 32 * 1024,
            ...req.ytdlOptions
        }).pipe(res);
    } catch (error) {
        console.error("Stream error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
