var expect = require('expect.js');
var shared = require('mocha-shared');
var Cli = require('../../lib/cli');

shared.scenario('any subcommand', function(subcommand) {
  describe('--dir', function() {
    context('when a wrong directory is given', function() {
      var args = [ 'node', 'script', subcommand, '-d', './wrong_dir' ];

      it('is rejected', function(done) {
        Cli.exec(args)
        .then(function() {
          expect().fail();
        })
        .catch(function(err) {
          expect(err.message).contain('ENOENT, no such file or directory');
        })
        .then(done, done);
      });
    });

    context('when an existent directory is given', function() {
      var args = [ 'node', 'script', subcommand, '-d', './test/example/migrations' ];

      it('is fulfilled', function(done) {
        Cli.exec(args)
        .then(function() {
          expect().not.fail();
        })
        .catch(function() {
          expect().fail();
        })
        .then(done, done);
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

      it('sets the NODE_ENV', function(done) {
        Cli.exec(args)
        .then(function() {
          expect().fail();
        })
        .catch(function() {
          expect(process.env.NODE_ENV).to.be('staging');
        })
        .then(done, done);
      });
    });

    context('when the env is not given', function() {
      var args = [ 'node', 'script', subcommand ];

      it('sets the NODE_ENV to development by default', function(done) {
        Cli.exec(args)
        .then(function() {
          expect().fail();
        })
        .catch(function() {
          expect(process.env.NODE_ENV).to.be('development');
        })
        .then(done, done);
      });
    });
  });
});
