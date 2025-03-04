const express = require("express");
const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const YTMusic = require("ytmusic-api");
const play = require("play-dl");

const router = express.Router();

/*const youtubeHeadersMiddleware = (req, res, next) => {
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

router.use(youtubeHeadersMiddleware);*/

// Initialize YTMusic with cookies
const ytmusic = new YTMusic();
(async () => {
    try {
        await ytmusic.initialize({
            headers: {
                "User Agent":
                    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
                Referer: "https://www.youtube.com/",
                Cookie: "VISITOR_INFO1_LIVE=OgRU3YHghK8; YSC=gb2dKlvocOs; PREF=tz=Asia.Calcutta",
                "Accept-Language": "en-US,en;q=0.9",
                Connection: "keep-alive"
            }
        });
        console.log("YTMusic API initialized successfully with cookies!");
    } catch (error) {
        console.error("YTMusic API initialization failed:", error);
    }
})();

// 1. Search for Music
router.get("/ytmusic/search/", async (req, res) => {
    try {
        const query = req.query.query;
        if (!query)
            return res
                .status(400)
                .json({ error: "Query parameter is required" });

        const results = await ytmusic.search(query, "all");
        if (!results || results.length === 0)
            return res.status(404).json({ error: "No results found" });

        res.json(results);
    } catch (error) {
        console.error("Error in search:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 2. Advanced Search
router.get("/ytmusic/advsearch/", async (req, res) => {
    try {
        const query = req.query.query;
        const limit = parseInt(req.query.limit) || 50;
        if (!query)
            return res
                .status(400)
                .json({ error: "Query parameter is required" });

        const [trackResults, albumResults, playlistResults, artistResults] =
            await Promise.all([
                ytmusic.search(query, "songs", limit),
                ytmusic.search(query, "albums", limit),
                ytmusic.search(query, "playlists", limit),
                ytmusic.search(query, "artists", limit)
            ]);

        let allResults = [
            ...trackResults,
            ...albumResults,
            ...playlistResults,
            ...artistResults
        ];
        const uniqueResults = Array.from(
            new Map(
                allResults.map(item => [
                    item.videoId || item.playlistId || item.artistId,
                    item
                ])
            ).values()
        ).slice(0, limit);

        res.json(uniqueResults);
    } catch (error) {
        console.error("Error in advanced search:", error.message);
        res.status(500).json({ error: "An error occurred while searching." });
    }
});

// 3. Get Song Details
router.get("/ytmusic/track/:id", async (req, res) => {
    try {
        const songDetails = await ytmusic.getSong(req.params.id);
        res.json(songDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Playlist Details
router.get("/ytmusic/playlist/:id", async (req, res) => {
    try {
        const playlist = await play.playlist_info(
            `https://music.youtube.com/playlist?list=${req.params.id}`,
            { incomplete: true }
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

// 5. Artist Details
router.get("/ytmusic/artist/:id", async (req, res) => {
    try {
        const artistDetails = await ytmusic.getArtist(req.params.id);
        res.json(artistDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Album Details
router.get("/ytmusic/album/:id", async (req, res) => {
    try {
        const albumDetails = await ytmusic.getAlbum(req.params.id);
        res.json(albumDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. Stream Song
router.get("/ytmusic/stream/:id", async (req, res) => {
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
        
        }).pipe(res);
    } catch (error) {
        console.error("Stream error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 8. Category-based APIs
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
    router.get(`/ytmusic/${category}`, async (req, res) => {
        try {
            const results = await ytmusic.search(`${category} latest`, "all");
            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});

// 9. Dynamic Genre, Mood, and Language Search
router.get("/ytmusic/genres/:genre", async (req, res) => {
    try {
        const resp = await ytmusic.search(
            `${req.params.genre} genre latest`,
            "all"
        );
        res.json(resp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/moods/:mood", async (req, res) => {
    try {
        const resp = await ytmusic.search(
            `${req.params.mood} mood latest`,
            "all"
        );
        res.json(resp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/languages/:lang", async (req, res) => {
    try {
        const resp = await ytmusic.search(`${req.params.lang} latest`, "all");
        res.json(resp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
