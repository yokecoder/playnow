const express = require("express");
const YTMusic = require("ytmusic-api");

const router = express.Router();

// Initialize YTMusic
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

router.get("/ytmusic/stream/:id", (req, res) => {
    try {
        const streamId = req.params.id;
        const embedUrl = `https://www.youtube.com/embed/${streamId}`;
        res.status(200).json({streamId, embedUrl})
    } catch (error) {
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

// Playlist Details
router.get("/ytmusic/playlist/:id", async (req, res) => {
    try {
        const playlist = await ytmusic.getPlaylist(req.params.id);
        if (!playlist)
            return res
                .status(404)
                .json({ error: "Playlist not found or unavailable" });

        res.json(playlist);
    } catch (error) {
        console.error("Error fetching playlist:", error.message);
        res.status(500).json(error);
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
    newv: "latest songs",
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
