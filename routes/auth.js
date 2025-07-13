const express = require('express');
const router = express.Router();
const axios = require('axios');

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

// Step 1: Redirect to Spotify Login
// GET /auth/login
router.get('/login', (req, res) => {
  const scopes = 'user-read-currently-playing user-top-read user-modify-playback-state user-read-playback-state';
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
  const client_id = process.env.SPOTIFY_CLIENT_ID;

  const authUrl =
    'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id,
      scope: scopes,
      redirect_uri,
    }).toString();

  res.redirect(authUrl);
});

// Step 2: Handle callback, exchange code for token
// GET /auth/callback
router.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Print to console or store securely
    console.log('✅ ACCESS TOKEN:', access_token);
    console.log('✅ REFRESH TOKEN:', refresh_token);

    res.json({ access_token, refresh_token, expires_in });
  } catch (err) {
    console.error('Callback error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Token exchange failed' });
  }
});


module.exports = router;
