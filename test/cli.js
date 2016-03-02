var expect = require('expect.js');
var shared = require('mocha-shared');
var fs = require('fs-extra');
var Cli = require('../lib/cli');
require('./shared/subcommand');

describe('Cli', function() {
  describe('.exec', function() {
    it('returns a promise', function() {
      var result = Cli.exec([]);

      expect(result).to.be.ok();
      expect(typeof result.then).to.be('function');
    });

    describe('migrate', function() {
      shared.scenario('any subcommand', 'migrate');
    });

    describe('rollback', function() {
      shared.scenario('any subcommand', 'rollback');
    });

    describe('create', function() {
      beforeEach(function() {
        fs.mkdirsSync(__dirname + '/example/tmp');
      });

      context('when a wrong directory is given', function() {
        var args = [
          'node', 'script', 'create', 'new_migration', '-d', './wrong_dir',
        ];

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
        var args = [
          'node', 'script', 'create', 'new_migration',
                            '-d', './test/example/tmp',
        ];

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

        it('creates a new file', function(done) {
          Cli.exec(args)
          .then(function() {
            var files = fs.readdirSync(process.cwd() + '/test/example/tmp');
            expect(files).to.have.length(1);
            expect(files[0]).to.contain('new_migration.js');
          })
          .then(done, done);
        });
      });

      afterEach(function() {
        fs.removeSync(__dirname + '/example/tmp');
      });
    });
  });
});
