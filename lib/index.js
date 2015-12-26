'use strict';

const request = require('request-promise');
const util = require('util');

const DEFAULT_RETURN_ON = ['login', 'logout', 'play', 'pause', 'error', 'ap'];
const DEFAULT_RETURN_AFTER = 59;
const ASCII = 'abcdefghijklmnopqrstuvwxyz'

class SpotifyHelper {

  /**
   * [constructor description]
   * @method constructor
   * @param  {[type]}    port [description]
   * @return {[type]}         [description]
   */
  constructor(port) {
    this.port = port || 4370;
    this.localHeaders = {
      'Origin': 'https://open.spotify.com'
    }
  }

  /**
   * [init description]
   * @method init
   * @return {[type]} [description]
   */
  init() {
    let that = this;
    return that._getOauthToken()
      .then(function () {
        return that._getCSRFToken();
      });
  }

  /**
   * [getOauthToken description]
   * @method getOauthToken
   * @return {[type]}      [description]
   */
  _getOauthToken() {
    let that = this;
    return this._request('GET', 'http://open.spotify.com/token')
      .then(function (res) {
        that.oauth = res.body.t;
      })
  }

  /**
   * [getCSRFToken description]
   * @method getCSRFToken
   * @return {[type]}     [description]
   */
  _getCSRFToken() {
    let that = this;
    return that._request('GET', that._getUrl('simplecsrf/token.json'), {}, that.localHeaders)
      .then(function (res) {
        that.csrf = res.body.token;
      });
  }

  /**
   * [getUrl description]
   * @method getUrl
   * @param  {[type]} uri [description]
   * @return {[type]}     [description]
   */
  _getUrl(uri) {
    let subdomain = '';
    for (let i = 0, length = 10; i < length; i++) {
      subdomain += ASCII.charAt(Math.floor(Math.random() * ASCII.length));
    }
    return util.format('https://%s:%d/%s', subdomain + '.spotilocal.com', this.port, uri);
  }

  /**
   * [request description]
   * @method request
   * @param  {[type]} method  [description]
   * @param  {[type]} uri     [description]
   * @param  {[type]} params  [description]
   * @param  {[type]} headers [description]
   * @return {[type]}         [description]
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
   * [_togglePlaying description]
   * @method _togglePlaying
   * @param  {[type]}       state [description]
   * @return {[type]}             [description]
   */
  _togglePlaying(state) {
    return this._request('GET', this._getUrl('remote/pause.json'), {
      'oauth': this.oauth,
      'csrf': this.csrf,
      'pause': state
    }, this.localHeaders);
  }

  /**
   * [_playTrack description]
   * @method _playTrack
   * @param  {[type]}   songUri [description]
   * @return {[type]}           [description]
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
   * [_getStatus description]
   * @method _getStatus
   * @return {[type]}   [description]
   */
  _getStatus() {
    return this._request('GET', this._getUrl('remote/status.json'), {
      'oauth': this.oauth,
      'csrf': this.csrf,
      'returnafter': DEFAULT_RETURN_AFTER,
      'returnon': DEFAULT_RETURN_ON.join(',')
    }, this.localHeaders);
  }

  /**
   * [pause description]
   * @method pause
   * @return {[type]} [description]
   */
  pause() {
    return this._togglePlaying(true);
  }

  /**
   * This method allows you to start the player or start playing a new track / album.
   * @method play
   * @param  {string} [songUri] The Spotify track/album URI to play.
   * @return {object}           The state of the player.
   */
  play(songUri) {
    if (songUri) {
      return this._playTrack(songUri);
    }
    return this._togglePlaying(false);
  }

  /**
   * [getStatus description]
   * @method getStatus
   * @return {[type]}  [description]
   */
  getStatus() {
    return this._getStatus();
  }
}

module.exports = SpotifyHelper;
