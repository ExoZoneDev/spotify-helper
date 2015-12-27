'use strict';

const request = require('request-promise');
const util = require('util');

const DEFAULT_RETURN_ON = ['login', 'logout', 'play', 'pause', 'error', 'ap'];
const DEFAULT_RETURN_AFTER = 59;
const ASCII = 'abcdefghijklmnopqrstuvwxyz'

class SpotifyHelper {

  /**
   * Constructor
   * @method constructor
   * @param  {number}    port The port number to use to connect to the player.
   */
  constructor(port) {
    this.port = port || 4370;
    this.localHeaders = {
      'Origin': 'https://open.spotify.com'
    }
  }

  /**
   * This method gets an OAuth token to use for the requests. (Note: These have short life spans you may need to re-run
   * this method to generate a new one)
   * @method getOauthToken
   */
  _getOauthToken() {
    let that = this;
    return this._request('GET', 'http://open.spotify.com/token')
      .then(function (res) {
        that.oauth = res.body.t;
      });
  }

  /**
   * This method gets the CSRF token to use for the internal requests.
   * @method getCSRFToken
   */
  _getCSRFToken() {
    let that = this;
    return that._request('GET', that._getUrl('simplecsrf/token.json'), {}, that.localHeaders)
      .then(function (res) {
        that.csrf = res.body.token;
      });
  }

  /**
   * This method generates the local Spotify player URL to use.
   * @method getUrl
   * @param  {string} uri The endpoint to hit on the player. (Internal web server)
   * @return {string}     The formatted URL.
   */
  _getUrl(uri) {
    let subdomain = '';
    for (let i = 0, length = 10; i < length; i++) {
      subdomain += ASCII.charAt(Math.floor(Math.random() * ASCII.length));
    }
    return util.format('https://%s:%d/%s', subdomain + '.spotilocal.com', this.port, uri);
  }

  /**
   * This method handles requests for various methods.
   * @method request
   * @param  {string} method  The method for the request.
   * @param  {string} uri     The URI to hit.
   * @param  {object} params  Additional parameters to send in the request (Query parameters)
   * @param  {object} headers Additional headers to send in the request.
   * @return {Request}        The request promise.
   */
  _request(method, uri, params, headers) {
    params = params || {};
    headers = headers || {};
    return request({
      method: method.toUpperCase(),
      url: uri,
      qs: params,
      json: true,
      headers: headers,
      resolveWithFullResponse: true,
      rejectUnauthorized: false
    });
  }

  /**
   * This method runs the request to get the toggle the player.
   * @method _togglePlaying
   * @param  {boolean}      state The state to toggle the paused state of the player.
   * @return {Request}            The request promise.
   */
  _togglePlaying(state) {
    return this._request('GET', this._getUrl('remote/pause.json'), {
      'oauth': this.oauth,
      'csrf': this.csrf,
      'pause': state
    }, this.localHeaders);
  }

  /**
   * This method runs the request to get the play a track / album.
   * @method _playTrack
   * @param  {string}   songUri The track / album Spotify to play.
   * @return {Request}          The request promise.
   */
  _playTrack(songUri) {
    return this._request('GET', this._getUrl('remote/play.json'), {
      'oauth': this.oauth,
      'csrf': this.csrf,
      'uri': songUri,
      'context': songUri
    }, this.localHeaders);
  }

  /**
   * This method runs the request to get the status.
   * @method _getStatus
   * @param  {number}   returnAfter The time to wait before returning (Polling request)
   * @param  {Array}    returnOn    The events to return on.
   * @return {Request}              The request promise.
   */
  _getStatus(returnAfter, returnOn) {
    return this._request('GET', this._getUrl('remote/status.json'), {
      'oauth': this.oauth,
      'csrf': this.csrf,
      'returnafter': returnAfter || DEFAULT_RETURN_AFTER,
      'returnon': (returnOn || DEFAULT_RETURN_ON).join(',')
    }, this.localHeaders);
  }

  /**
   * This method gets an OAuth token and an CSRF token to enable the usage of the module.
   * @method init
   */
  init() {
    let that = this;
    return that._getOauthToken()
      .then(function () {
        return that._getCSRFToken();
      });
  }

  /**
   * This method gets the current status of the player.
   * @method getStatus
   * @param  {number}  returnAfter The time to wait before returning (Polling request)
   * @param  {Array}  returnOn     What data events you want for returning (See defaults for the full list)
   * @return {object}              Object containing the status for the events you are tracking.
   */
  getStatus(returnAfter, returnOn) {
    return this._getStatus(returnAfter, returnOn)
      .then(function (res) {
        return res.body;
      });
  }

  /**
   * This method allows you to start the player or start playing a new track / album.
   * @method play
   * @param  {string} [songUri] The Spotify track/album URI to play.
   * @return {object}           The state of the player.
   */
  play(songUri) {
    if (songUri) {
      return this._playTrack(songUri)
        .then(function (res) {
          return res.body;
        });
    }
    return this._togglePlaying(false)
      .then(function (res) {
        return res.body;
      });
  }

  /**
   * This method stops / pauses the player.
   * @method pause
   * @return {object} Status of the player.
   */
  pause() {
    return this._togglePlaying(true)
      .then(function (res) {
        return res.body;
      });
  }
}

module.exports = SpotifyHelper;
