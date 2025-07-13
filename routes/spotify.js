const express = require('express');
const axios = require('axios');
const router = express.Router();
const { getAccessToken, refreshAccessToken } = require('../utils/spotifyAuth');

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Helper to call Spotify with auto-refresh support
async function fetchFromSpotify(url, method = 'GET', data = {}) {
  let token = await getAccessToken();

  try {
    const config = {
      method,
      url,
      headers: { Authorization: `Bearer ${token}` },
      ...(method !== 'GET' && { data })
    };

    const response = await axios(config);
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      // Token expired → refresh and retry
      token = await refreshAccessToken();
      try {
        const retryConfig = {
          method,
          url,
          headers: { Authorization: `Bearer ${token}` },
          ...(method !== 'GET' && { data })
        };
        const retryRes = await axios(retryConfig);
        return retryRes.data;
      } catch (retryErr) {
        throw retryErr;
      }
    }
    throw err;
  }
}

// 🎵 Get your top 10 tracks
router.get('/top-tracks', async (req, res) => {
  try {
    const data = await fetchFromSpotify(`${SPOTIFY_API_BASE}/me/top/tracks?limit=10`);
    res.json(data);
  } catch (error) {
    console.error('Top Tracks Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// 🎧 Get currently playing track
router.get('/currently-playing', async (req, res) => {
  try {
    const data = await fetchFromSpotify(`${SPOTIFY_API_BASE}/me/player/currently-playing`);
    res.json(data || { message: 'No track currently playing' });
  } catch (error) {
    console.error('Currently Playing Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch currently playing track' });
  }
});

// ⏹ Stop playback
router.post('/stop', async (req, res) => {
  try {
    await fetchFromSpotify(`${SPOTIFY_API_BASE}/me/player/pause`, 'PUT');
    res.json({ message: 'Playback stopped' });
  } catch (error) {
    console.error('Stop Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to stop playback' });
  }
});

// ▶️ Play a specific track
router.post('/play/:trackId', async (req, res) => {
  const { trackId } = req.params;
  try {
    await fetchFromSpotify(
      `${SPOTIFY_API_BASE}/me/player/play`,
      'PUT',
      { uris: [`spotify:track:${trackId}`] }
    );
    res.json({ message: 'Track started playing' });
  } catch (error) {
    console.error('Play Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to play track' });
  }
});

module.exports = router;
