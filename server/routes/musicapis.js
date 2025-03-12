const express = require("express");
const YTMusic = require("ytmusic-api");
const playdl = require("play-dl");

const router = express.Router();
// Initialize YTMusic
const ytmusic = new YTMusic();
(async () => {
    try {
        const cookies = [
            { name: "YSC", value: "wtKBO-2MPTk" },
            { name: "VISITOR_INFO1_LIVE", value: "jvqwDcKwR2Y" },
            { name: "PREF", value: "f6=40000000&tz=Asia.Calcutta" },
            { name: "SAPISID", value: "cgYE6Db8lyWdIXkT/Aq95i-XenlfbMVGYi" },
            { name: "APISID", value: "d3cKjZfEDYGJCixX/AQdZ6lilLSPLbHWAJ" },
            { name: "SSID", value: "APeELpgPd2A0tLdUJ" },
            { name: "HSID", value: "A2OjpOunTAGC0Bz4X" },
            {
                name: "SID",
                value: "g.a000uQhIujuAisuvZTGF40187HWFDuoTAUMQ7gLrkx8R4hc7d2bvHvQToKOi9f0H1yXqoBWJSwACgYKAfcSARMSFQHGX2Mi0FafHzBuOl1xhANnzMN44xoVAUF8yKo5mp35hb8zL3MyK7ehRB6_0076"
            },
            {
                name: "LOGIN_INFO",
                value: "AFmmF2swRAIgXgzlpiWUXQI5BcYnpK2rp-6dbDzO1TQr1MccQT2FoZcCICwHci1C3W4rzrfHdMYuV8EWYSZ178lj0wEV5C2y2vf2:QUQ3MjNmeTFEME1sTUVvYXNpZjBCOTdEeWlOVk5qdjl6Q21tZFNRalY2SXRweEFJZmFKdGZSSFZhWVRVbko1RERDTnhEX2hfZkdZeGxwWlhnOGdGSnBlWDd3VTNaUTJ3emRGQzFQQ1RpdGk4TG5Ga0ZldHNZSFpOM2otVUtHQ25qcFNMUVExYUFVLUtwQ1lHOWZEcnJtYlRtenQzZGlRNUNB"
            },
            {
                name: "__Secure-3PAPISID",
                value: "cgYE6Db8lyWdIXkT/Aq95i-XenlfbMVGYi"
            },
            {
                name: "__Secure-3PSID",
                value: "g.a000uQhIujuAisuvZTGF40187HWFDuoTAUMQ7gLrkx8R4hc7d2bvFC3K4w1-VVi3LT9i2D9y2AACgYKAQMSARMSFQHGX2MiNWZI1R8XwpQMLKUhdXvnExoVAUF8yKraOjYV65xG7vPrdCxY76kw0076"
            },
            {
                name: "__Secure-3PSIDCC",
                value: "AKEyXzUyryPUiYTO03yg_3yZ0G_H29dv8Gesywt5pAxLGOPJMcsRMvWsmlY1Wu8pp75Uz394"
            },
            {
                name: "SIDCC",
                value: "AKEyXzUXePwbLFP7ih6iTfzNfRvBkwEoXVUBvdgooE2MUFXS8tMLx1YlsuvEfhmiXEGBfngf"
            }
        ];

        // Convert cookies array to a single cookie string
        const cookieString = cookies
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join("; ");

        // Initialize ytmusic with the cookies
        ytmusic.initialize(cookieString);

        console.log("YTMusic API initialized successfully with cookies!");
    } catch (error) {
        console.error("YTMusic API initialization failed:", error);
    }
})();

// Search for Music
router.get("/ytmusic/search", async (req, res) => {
    try {
        const query = req.query.query;
        if (!query)
            return res
                .status(400)
                .json({ error: "Query parameter is required" });

        const results = await ytmusic.search(query, "all");
        if (!results.length)
            return res.status(404).json({ error: "No results found" });

        res.json(results);
    } catch (error) {
        console.error("Error in search:", error.message);
        res.status(500).json(error);
    }
});

// Get Song Details
router.get("/ytmusic/track/:id", async (req, res) => {
    try {
        const songDetails = await ytmusic.getSong(req.params.id);
        res.json(songDetails);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get("/ytmusic/playlist/:id", async (req, res) => {
    try {
        const playlistUrl = `https://www.youtube.com/playlist?list=${req.params.id}`;
        const playlist = await playdl.playlist_info(playlistUrl, {
            incomplete: true
        });

        if (!playlist)
            return res
                .status(404)
                .json({ error: "Playlist not found or unavailable" });
        res.json(playlist);
    } catch (error) {
        console.error("Error fetching playlist:", error.message);
        res.status(500).json({
            error: "Failed to fetch playlist",
            details: error.message
        });
    }
});

// Artist Details
router.get("/ytmusic/artist/:id", async (req, res) => {
    try {
        const artistDetails = await ytmusic.getArtist(req.params.id);
        res.json(artistDetails);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Album Details
router.get("/ytmusic/album/:id", async (req, res) => {
    try {
        const albumDetails = await ytmusic.getAlbum(req.params.id);
        res.status(200).json(albumDetails);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Category-based APIs (Trending, New, Top Artists, Top Mixes)
const categories = {
    newsongs: "latest songs",
    trending: "trending music",
    topartists: "top artists",
    topmixes: "top mixes"
};

Object.entries(categories).forEach(([key, query]) => {
    router.get(`/ytmusic/${key}`, async (req, res) => {
        try {
            const results = await ytmusic.search(query, "all");
            res.status(200).json(results);
        } catch (error) {
            res.status(500).json(error);
        }
    });
});

// Dynamic Genre, Mood, and Language Search
router.get("/ytmusic/genres/:genre", async (req, res) => {
    try {
        const resp = await ytmusic.search(`${req.params.genre} genre`, "all");
        res.status(200).json(resp);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get("/ytmusic/moods/:mood", async (req, res) => {
    try {
        const resp = await ytmusic.search(`${req.params.mood} mood`, "all");
        res.status(200).json(resp);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get("/ytmusic/languages/:lang", async (req, res) => {
    try {
        const resp = await ytmusic.search(`${req.params.lang} music`, "all");
        res.status(200).json(resp);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
