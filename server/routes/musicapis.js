const express = require("express");
const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const YTMusic = require("ytmusic-api");
const play = require("play-dl");

const router = express.Router();

const ytmusic = new YTMusic();
// Initialize YTMusic
(async () => {
    try {
        await ytmusic.initialize();

        console.log("YTMusic API initialized successfully!");
    } catch (error) {
        console.error("YTMusic API initialization failed:", error);
    }
})();

// 1. Search for Music (Songs, Albums, Playlists, Artists
router.get("/ytmusic/search/", async (req, res) => {
    try {
        const query = req.query.query;
        
        if (!query) {
            return res
                .status(400)
                .json({ error: "Query parameter is required" });
        }

        // Ensure initialization

        // Use null or 'all' for mixed results and include the limit
        const results = await ytmusic.search(query, 'all');
        
        if (!results || results.length === 0) {
            return res.status(404).json({ error: "No results found" });
        }
        
        res.json(results);
    } catch (error) {
        console.error("Error in search:", error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/advsearch/", async (req, res) => {
    try {
        const query = req.query.query;
        const limit = parseInt(req.query.limit) || 50; // Ensure limit is a number

        if (!query) {
            return res.status(400).json({ error: "Query parameter is required" });
        }

        // Perform separate searches to get maximum results
        const [trackResults, albumResults, playlistResults, artistResults] = await Promise.all([
            ytmusic.search(query, "songs", limit),
            ytmusic.search(query, "albums", limit),
            ytmusic.search(query, "playlists", limit),
            ytmusic.search(query, "artists", limit),
        ]);

        // Combine all results into a single array
        let allResults = [...trackResults, ...albumResults, ...playlistResults, ...artistResults];

        // Remove duplicates based on `videoId`, `playlistId`, or `browseId`
        const uniqueResults = Array.from(new Map(
            allResults.map(item => [item.videoId || item.playlistId || item.artistId, item])
        ).values()).slice(0, limit); // Ensure the final results respect the limit

        res.json(uniqueResults);
    } catch (error) {
        console.error("Error in advanced search:", error.message);
        res.status(500).json({ error: "An error occurred while searching." });
    }
});



// 🎶 2. Get Song Details
router.get("/ytmusic/track/:id", async (req, res) => {
    try {
        const songId = req.params.id;
        const songDetails = await ytmusic.getSong(songId);
        res.json(songDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/playlist/:id", async (req, res) => {
    try {
        const playlistId = req.params.id;
        if (!playlistId) {
            return res.status(400).json({ error: "Playlist ID is required" });
        }
        const playlist = await play.playlist_info(
            `https://music.youtube.com/playlist?list=${playlistId}`,
            { incomplete: true }
        );

        if (!playlist || !playlist.title) {
            return res
                .status(404)
                .json({ error: "Playlist not found or unavailable" });
        }
        res.json(playlist);
    } catch (error) {
        console.error("Error fetching playlist:", error.message);
        res.status(500).json({ error: error.message });
    }
});

//3. Get Artist Details
// * workinh
router.get("/ytmusic/artist/:id", async (req, res) => {
    try {
        const artistId = req.params.id;
        const artistDetails = await ytmusic.getArtist(artistId);
        res.json(artistDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📀 6. Get Album Details
router.get("/ytmusic/album/:id", async (req, res) => {
    try {
        const albumId = req.params.id;
        const albumDetails = await ytmusic.getAlbum(albumId);
        res.json(albumDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/stream/:id", async (req, res) => {
    try {
        const songId = req.params.id;
        if (!songId)
            return res.status(400).json({ error: "Song ID is required" });

        const url = `https://www.youtube.com/watch?v=${songId}`;
        res.set({
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Accept-Ranges": "bytes",
            "Transfer-Encoding": "chunked"
        });

        // Stream the audio with minimal data preloading
        ytdl(url, {
            filter: "audioonly",
            quality: "highestaudio",
            highWaterMark: 24 * 1024,
            dlChunkSize: 32 * 1024
        }).pipe(res);
    } catch (error) {
        console.error(" Stream error:", error.message);
        res.status(500).json({ error: error.message });
    }
});


router.get("/ytmusic/new", async (req, res) => {
    try {
        const releases = await ytmusic.search("latest songs", "all");
        res.json(releases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/trending", async (req, res) => {
    try {
        const trending = await ytmusic.search("trending songs", "all");
        res.json(trending);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/topcharts", async (req, res) => {
    try {
        const topCharts = await ytmusic.search("top charts latest", "all");
        res.json(topCharts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/topartists", async (req, res) => {
    try {
        const topArtists = await ytmusic.search(" artists | singers", "artist");
        res.json(topArtists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/ytmusic/topmixes", async (req, res) => {
    try {
        const topMixes = await ytmusic.search("top mixes/remixes latest", "all");
        res.json(topMixes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/genres", async (req, res) => {
    try {
        const genres = await ytmusic.search("all genres latest", "all");
        res.json(genres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




router.get("/ytmusic/moods", async (req, res) => {
    try {
        const moods = await ytmusic.search("all moods latest", "all");
        res.json(moods);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/ytmusic/languages", async (req, res) => {
    try {
        const languages = await ytmusic.search("latest all languages", "all");
        res.json(languages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/genres/:genre", async (req, res) => {
    const genre = req.params.genre
    try {
        const resp = await ytmusic.search(`${type} genre latest`, "all");
        res.json(resp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/moods/:mood", async (req, res) => {
    const mood = req.params.mood
    try {
        const resp = await ytmusic.search(`${type} mood latest`, "all");
        res.json(resp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/languages/:lang", async (req, res) => {
    const lang = req.params.lang
    try {
        const resp= await ytmusic.search(`${lang} latest`, "all");
        res.json(resp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
