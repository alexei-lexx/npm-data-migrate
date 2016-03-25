var expect = require('expect.js-extra');
var shared = require('mocha-shared');
var Cli = require('../../lib/cli');

shared.scenario('any subcommand', function(subcommand) {
  describe('--dir', function() {
    context('when a wrong directory is given', function() {
      var args = [ 'node', 'script', subcommand, '-d', './wrong_dir' ];

      it('is rejected', function() {
        return expect(Cli.exec(args)).to.reject(/no such file or directory/);
      });
    });

    context('when an existent directory is given', function() {
      var args = [
        'node', 'script', subcommand, '-d', './test/example/migrations',
      ];

      it('is fulfilled', function() {
        return expect(Cli.exec(args)).to.fulfill();
      });
    });
  });

  describe('--env', function() {
    var tmpEnv;

    beforeEach(function() {
      tmpEnv = process.env.NODE_ENV;
    });

    afterEach(function() {
      process.env.NODE_ENV = tmpEnv;
    });

    context('when the env is given', function() {
      var args = [ 'node', 'script', subcommand, '-e', 'staging' ];

      it('sets the NODE_ENV', function() {
        return expect(Cli.exec(args)).to
          .reject()
          .then(function() {
            expect(process.env.NODE_ENV).to.be('staging');
          });
      });
    });

    context('when the env is not given', function() {
      var args = [ 'node', 'script', subcommand ];

      it('sets the NODE_ENV to development by default', function() {
        return expect(Cli.exec(args)).to
          .reject()
          .then(function() {
            expect(process.env.NODE_ENV).to.be('development');
          });
      });
    });
  });
});
