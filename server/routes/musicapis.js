const express = require('express');
const axios = require("axios");


const router = express.Router();

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


/*Api for searching anything */
router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });

  try {
      const response = await axios.get(`${process.env.SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=track`, {
          headers: { 'Authorization': `Bearer ${req.authToken}` },
      });

      res.json(response.data);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

router.get('/browsecategories', async (req, res) => {
  try {
    let catId = req.query.catid;
    let browseApi = catId ? `${process.env.SPOTIFY_API_URL}/browse/categories/${catId}` : `${process.env.SPOTIFY_API_URL}/browse/categories/` ; 
    const response = await axios.get(browseApi, {
        headers: { 'Authorization': `Bearer ${req.authToken}` },
    });
    res.json(response.data);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

















module.exports = router;




