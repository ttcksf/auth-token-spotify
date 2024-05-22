const dotenv = require('dotenv');
const express = require('express');
const port = 3000;
dotenv.config();
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URL,
});

app.get('/login', (req, res) => {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
  ];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.log('error', error);
    res.send(`Error:${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expiresIn = data.body['expires_in'];

      spotifyApi.setAccessToken[access_token];
      spotifyApi.setRefreshToken[refresh_token];

      console.log(access_token, refresh_token);
      res.send('Success');

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const accessTokenRefreshed = data.body['access_token'];
        spotifyApi.setAccessToken(accessTokenRefreshed);
      }, (expiresIn / 2) * 1000);
    })
    .catch((err) => {
      console.log('Error:', err);
      res.send('Error getting token');
    });
});

app.get('/search', (req, res) => {
  const { q } = query;
  spotifyApi
    .searchTracks(q)
    .then((searchData) => {
      const trackUrl = searchData.body.tracks.items[0].uri;
      res.send({ uri: trackUrl });
    })
    .catch((err) => {
      res.send(`Error searching ${err}`);
    });
});

app.get('/play', (req, res) => {
  const { uri } = req.query;
  spotifyApi
    .play({ uris: { uri } })
    .then(() => {
      res.send('playback started');
    })
    .catch((err) => {
      res.send(`Error playing ${err}`);
    });
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
