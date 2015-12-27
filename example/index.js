'use strict';

// Require our module.
const SpotifyHelper = require('../lib/index');

// Create the Helper.
let Spotify = new SpotifyHelper();

// Init the helper.
Spotify.init()
  .then(function () {
    // Tell the player to start playing this track.
    return Spotify.play('spotify:track:6H79Py5s5nzGOnRDVIU7eR');
  })
  .then(function (res) {
    console.log(res); // We get a status model back from the player about the change. (You will get these on most of the methods)
    return Spotify.pause(); // Lets pause the player.
  })
  .then(function () {
    return Spotify.play(); // Now play the player again.
  })
  .then(function () {
    /*
     * This will get the status of the player. The first parameter will tell the request to wait x seconds
     * before the player will send back the "current" status of the player. Otherwise while polling you will get a
     * response when the player state changes. I.E. New track / volume change etc... Play aroud with this method
     * and you'll find all the neat things you can get.
     */
    return Spotify.getStatus(1);
  })
  .catch(function (err) {
    console.error(err); // Catch any errors thrown from the methods.
  });
