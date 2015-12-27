# Spotify Helper
NPM helper module to control the Spotify player.

This module allows you to control the Spotify player. From changing player state or changing the song currently playing.

### Installing
```
npm install spotify-helper
```

### Simple Example

This example will show you how the pause the player.

```
const SpotifyHelper = require('spotify-helper');
let Spotify = new SpotifyHelper();

Spotify.init()
  .then(function () {
    return Spotify.pause();
  });
```

This example will show you how the play the player.

```
const SpotifyHelper = require('spotify-helper');
let Spotify = new SpotifyHelper();

Spotify.init()
  .then(function () {
    return Spotify.play();
  });
```

### Bugs
You can report bugs with the repo issue tracker.
