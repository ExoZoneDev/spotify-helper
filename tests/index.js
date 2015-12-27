'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const SpotifyHelper = require('../lib/index');

chai.should();
chai.use(chaiAsPromised);

let Spotify;

before(function (done) {
  Spotify = new SpotifyHelper();
  return Spotify.init().then(done);
});

describe('Spotify', function (done) {
  it('should respond with the status.', function () {
    return Spotify.getStatus(1).should.eventually.be.an('object');
  });

  it('should play a track.', function () {
    return Spotify.play('spotify:track:6H79Py5s5nzGOnRDVIU7eR').should.eventually.be.an('object').and.have.property('playing', true);
  });

  it('should pause the player.', function () {
    return Spotify.pause().should.eventually.be.an('object').and.have.property('playing', false);
  });

  it('should play the player.', function () {
    return Spotify.play().should.eventually.be.an('object').and.have.property('playing', true);
  });
});
