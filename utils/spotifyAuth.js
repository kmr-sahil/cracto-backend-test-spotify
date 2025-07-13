const axios = require('axios');
require('dotenv').config();

let accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
let refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken() {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    accessToken = response.data.access_token;
    console.log('✅ Spotify token refreshed!');
    return accessToken;
  } catch (err) {
    console.error('❌ Failed to refresh token:', err.response?.data || err.message);
    throw new Error('Refresh token failed');
  }
}

module.exports = { getAccessToken, refreshAccessToken };
