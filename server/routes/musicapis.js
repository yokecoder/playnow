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

// 1. Search for Music (Songs, Albums, Playlists, Artists)
// * Working
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

        
        let allResults = [];

        // Perform multiple searches with slight variations
        const variations = [query, `${query} official audio`, `${query} lyrics`, `${query} HD`];

        for (let variation of variations) {
            let results = await ytmusic.search(variation, null, 15);
            allResults.push(...results);
            if (allResults.length >= limit) break; // Stop if we reach the limit
        }
        
       
       
        // Remove duplicates based on videoId or title
        const uniqueResults = Array.from(new Map(allResults.map(item => [item.videoId])).values());
        
        res.json(uniqueResults);
    } catch (error) {
        console.error("Error in search:", error.message);
        res.status(500).json({ error: error.message });
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
        console.error("❌ Stream error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get("/ytmusic/new", async (req, res) => {
    try {
        const releases = await ytmusic.search("new-releases", "songs");
        res.json(releases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
