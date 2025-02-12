const ytdl = require('@distube/ytdl-core');
const ytpl = require("ytpl");
const express = require('express');
const fs = require("fs");

const router = express.Router();



const youtubeHeadersMiddleware = (req, res, next) => {
  req.ytdlOptions = {
    requestOptions: {
      headers: {
        'User Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://www.youtube.com/',
        'Cookie': 'VISITOR_INFO1_LIVE=OgRU3YHghK8; YSC=gb2dKlvocOs; PREF=tz=Asia.Calcutta',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      },
    },
  };
  next();
};


router.use('/ytapis', youtubeHeadersMiddleware);

// Return all the data fectched
router.get('/info', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Url parameter is required' });
    }
    const info = await ytdl.getInfo(url, req.ytdlOptions);
    res.json(info);
  } catch (error) {
    console.error('Error fetching video info:', error.message);
    res.status(500).json({ error: 'Failed to retrieve video info', details: error.message });
  }
});

//Returns Available formats
router.post('/getformats', async (req, res)=> {
  const url = req.body.url
  if (!url) {
    res.status(400).json({status:false, msg:"missing url"})
  }
  const info = await ytdl.getInfo(url, req.ytdlOptions)
  res.json(info.formats)
});

//Direct downnload Url
router.get('/dl', async (req, res)=> {
  
    const url = req.query.url;
    const format = req.query.fmt || "video" ;
    const resolution = req.query.res || "480p" ;
  
    if (!url){
      res.status(400).json({status:false, msg:'url not found'})
    }
    
  try {
    const videoInfo = await ytdl.getInfo(url)
    let videoTitle = videoInfo.videoDetails.title
        .normalize("NFKD")                     // Normalize accents (e.g., é → e)
        .replace(/[^\w\s-]/g, '')               // Remove all non-ASCII characters
        .replace(/\s+/g, '_')                   // Replace spaces with underscores
        .substring(0, 100)                      // Limit length to 100 characters
        .trim();
    let ext = format === "audio" ? "mp3" : "mp4" ;
        
    let filename = `${videoTitle}.${ext}`
    //res.header('Content-Type', format === "video" ? "video/mp4" : "audio/webm")
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", `${format}/${ext}`); // or "video/mp4" if streaming video
    // Allows streaming chunks
    ytdl(url, {
        filter: f =>  format === 'audio' ? f.hasAudio && !f.hasVideo : f.hasAudio && f.hasVideo,
        qualityLabel: format === 'video' ? resolution : '',
        highWaterMark: 1024 * 1024 * 10,
        ...req.ytdlOptions
    }).pipe(res)
  } catch (error) {
    res.status(400).json({status:false, msg:'Internal Server Error', details: error.message})
  }

});

//information About a Playlist Url
router.post("/playlistinfo", async (req, res)=> {
  const url = req.body.url
  try {
    const playlist = await ytpl(url);
    res.json(playlist)
  } catch (error) {
    console.error("Error fetching playlist details:", error.message);
    res.json({status:false,error})
  }
});

router.get("")




//api for streaming allows to play third-party restricted videos 
router.get('/stream', async (req, res) => {
    try {
        const { url, resolution = "360p" } = req.query;
        if (!url) return res.status(400).send('Missing video URL');

        // Get video info and select format
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { qualityLabel: resolution });

        if (!format || !format.url) return res.status(404).send('No suitable format found');

        const videoUrl = format.url;
        const range = req.headers.range;

        if (range) {
            const videoSize = parseInt(format.contentLength) || 10 ** 8; // Estimate size if unknown
            const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunks
            const start = Number(range.replace(/\D/g, ''));
            const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${videoSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': end - start + 1,
                'Content-Type': 'video/mp4',
            });

            // Stream only the requested range from YouTube
            ytdl(url, {
                quality: format.itag,
                range: { start, end },
                ...req.ytdlOptions
            }).pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': format.contentLength || 10 ** 8,
                'Content-Type': 'video/mp4',
            });

            ytdl(url, { quality: format.itag }).pipe(res);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error streaming video');
    }
});






module.exports = router;