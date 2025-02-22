const express = require('express');
const axios = require("axios");
const play = require("play-dl");
const ytdl = require('@distube/ytdl-core');





const router = express.Router();

/* Spotify Apis  */
/*Middleware configuration for Authentication */
let TOKEN = null;
let tokenExpiresAt = 0;

const authMiddleware = async (req, res, next) => {
  if (TOKEN && Date.now() < tokenExpiresAt){
    req.authToken = TOKEN;
    return next()
  }
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    TOKEN = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000;
    req.authToken = TOKEN;
    next();
    
  } catch (error) {
    console.error('Error fetching Spotify token:', error);
    res.status(500).json({ error: 'Spotify authentication failed' });
  }
  
};
router.use(authMiddleware);


/*This Route api handles  spotify web api endpoints dynamically*/
router.get('/spotifyapi', async (req, res) => {
  try{
    let { ep, ...queryParams } = req.query;
    if (!ep) return res.status(400).json({ error: 'Missing endpoint parameter' });
        
    const apiUrl = `${process.env.SPOTIFY_API_URL}${ep}`;

    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${req.authToken}` },
      params: queryParams,
    });
    res.json(response.data);
    
  } catch (error) {
    res.json({status:500, error:error.message})
  }
});

/*Spotify search api to get results from search on spotify as source*/ 
router.get('/spotifyapi/search', async  (req, res) => {
  try {
    const query = req.query.q;
    const type = req.query.type || "track,playlist,album,artist";
    let searchApi = `${process.env.SPOTIFY_API_URL}/search?q=${query}&type=${type}`;
    const response = await axios.get(searchApi, {
      headers: { Authorization: `Bearer ${req.authToken}` }
    });
    res.json(response.data)
  } catch (error) {
    res.json({status:500, error:error.message})
  }
});

/* Apis for fetching music information from youtube music */
//Gets the Youtube Music Result to Spotify Url of a track 
router.get("/ytmusic/spotify-to-yt", async (req, res) => {
  try {
    const { spotifyUrl } = req.query;
    if (!spotifyUrl) return res.status(400).json({ error: "Missing Spotify URL" });

    const trackId = spotifyUrl.split("/track/")[1]?.split("?")[0];
    if (!trackId) return res.status(400).json({ error: "Invalid Spotify track URL" });

    const Response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${req.authToken}` },
    });
    const trackData = Response.data;
    const trackName = trackData.name;
    const artistName = trackData.artists.map(artist => artist.name).join(" ");
    
    const ytResults = await play.search(`${trackName} ${artistName}`);

    if (ytResults.length === 0) {
      return res.status(404).json({ error: "No matching track found on YouTube Music" });
    }

    res.json({
      spotify_title: trackName,
      youtube_title: ytResults[0].title,
      youtube_url: ytResults[0].url,
      duration: ytResults[0].durationRaw,
      thumbnail: ytResults[0].thumbnails[0].url,
    });
  } catch (error) {
    console.error("spotify to YouTube Error:", error);
    res.status(500).json({ error: "Failed to convert Spotify track to YouTube Music" });
  }
});

/* This Api Searches for tracks from youtube based on query  */
router.get("/ytmusic/search", async (req, res) => {
  try {
    const query  = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query parameter" });

    const results = await play.search(query);
    res.json(results.map((track) => ({
      title: track.title,
      url: track.url,
      duration: track.durationRaw,
      thumbnail: track.thumbnails[0].url,
    })));
  } catch (error) {
    console.error("search Error:", error);
    res.status(500).json({ error: "Failed to search tracks" });
  }
});

/*This Api Fetches needed info of by track url */ 
router.get("/ytmusic/track", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Missing URL parameter" });

    const info = await play.video_basic_info(url);

    res.json({
      title: info.video_details.title,
      author: info.video_details.channel.name,
      duration: info.video_details.durationRaw,
      thumbnail: info.video_details.thumbnails[0].url,
      others:  info.video_details
    });
  } catch (error) {
    console.error("Track Info Error:", error);
    res.status(500).json({ error: "Failed to fetch track info" });
  }
});


/* This api fetches music based on  playlist url */
router.get("/ytmusic/playlist", async (req, res) => {
  try {
    
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Missing URL parameter" });
    const playlist = await play.playlist_info(url, { incomplete: true });
    res.json(playlist);
    
  } catch (error) {
    console.error("Playlist Error:", error);
    res.status(500).json({ error: "Failed to fetch playlist details" });
  }
});

//Api for streaming audio from youtube music
router.get("/ytmusic/stream", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid or missing YouTube Music URL" });
    }

    res.set({
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked",
    });

    // Stream only the highest-quality audio instantly
    ytdl(url, { filter: "audioonly", quality: "highestaudio", highWaterMark: 32 * 1024 })  
      .on("error", (err) => {
        console.error("stream Error:", err.message);
        res.status(500).json({ error: "Failed to stream audio" });
      })
      .pipe(res);
      
  } catch (error) {
    console.error("Stream Error:", error.message);
    res.status(500).json({ error: "Failed to stream audio" });
  }
});




module.exports = router;