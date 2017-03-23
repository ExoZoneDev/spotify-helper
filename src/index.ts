import * as querystring from 'querystring';
import fetch, { Headers } from 'node-fetch';

/**
 * Hack around Fetch lowercasing header names.
 * 
 * Also because Spotify does not know how to handle headers right >.>
 */
Headers.prototype.set = function(name, value) {
  let header = name.toLowerCase();
  if (header === 'origin') {
    header = 'Origin';
  }
	this._headers[header] = [value];
};

const DEFAULT_RETURN_ON = ['login', 'logout', 'play', 'pause', 'error', 'ap'];
const DEFAULT_RETURN_AFTER = 59;
const ASCII = 'abcdefghijklmnopqrstuvwxyz'

export class SpotifyHelper {
  private headers = {
    Origin: 'https://open.spotify.com'
  };
  private oauth: string;
  private csrf: string;

  /**
   * Constructor
   */
  constructor(private port = 4370) {}

  /**
   * This method gets an OAuth token and an CSRF token to enable the usage of the module.
   */
  public async init() {
    await this.getOauthToken();
    await this.getCSRFToken();
  }

  /**
   * This method allows you to start the player or start playing a new track / album.
   */
  public play(songUri: string) {
    if (songUri) {
      return this.playTrack(songUri);
    }
    return this.togglePlaying(true);
  }

  /**
   * This method stops / pauses the player.
   */
  public pause() {
    return this.togglePlaying(false);
  }

  /**
   * This method gets an OAuth token to use for the requests. (Note: These have short life spans you may need to re-run
   * this method to generate a new one)
   */
  private async getOauthToken() {
    const { t } = await this.request('GET', 'https://open.spotify.com/token');
    this.oauth = t;
  }

  /**
   * This method gets the CSRF token to use for the internal requests.
   */
  private async getCSRFToken() {
    const { token } = await this.request('GET', this.getUrl('simplecsrf/token.json'), {}, this.headers); 
    this.csrf = token;
  }

  /**
   * This method generates the local Spotify player URL to use.
   */
  private getUrl(uri: string) {
    let subdomain = '';
    for (let i = 0, length = 10; i < length; i++) {
      subdomain += ASCII.charAt(Math.floor(Math.random() * ASCII.length));
    }
    return `https://${subdomain}.spotilocal.com:${this.port}/${uri}`;
  }

  /**
   * This method handles requests for various methods.
   */
  private async request(method: string, uri: string, params?: any, headers?: any) {
    params = params || {};
    headers = headers || {};
    const request = await fetch(`${uri}?${querystring.stringify(params)}`, { headers });
    return await request.json();
  }

  /**
   * This method runs the request to get the toggle the player.
   */
  private togglePlaying(state: boolean) {
    return this.request('GET', this.getUrl('remote/pause.json'), { oauth: this.oauth, csrf: this.csrf, pause: !state }, this.headers);
  }

  /**
   * This method runs the request to get the play a track / album.
   */
  private playTrack(uri: string) {
    return this.request('GET', this.getUrl('remote/play.json'), { oauth: this.oauth, csrf: this.csrf, uri, context: uri }, this.headers);
  }

  /**
   * This method gets the current status of the player.
   */
  private getStatus(returnafter = DEFAULT_RETURN_AFTER, returnOn = DEFAULT_RETURN_ON) {
    return this.request('GET', this.getUrl('remote/status.json'), { oauth: this.oauth, csrf: this.csrf, returnafter, returnon: returnOn.join(',')}, this.headers);
  }
}
