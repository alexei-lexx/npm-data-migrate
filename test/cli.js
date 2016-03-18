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

    describe.only('create', function() {
      beforeEach(function() {
        fs.mkdirsSync(__dirname + '/example/tmp');
      });

      context('when a non-existent directory is given', function() {
        var dir = './non_existent_dir';
        var args = [ 'node', 'script', 'create', 'new_migration', '-d', dir ];

        it('creates this directory silently', function(done) {
          Cli.exec(args)
          .then(function() {
            var existent = fs.statSync(dir).isDirectory();
            expect(existent).to.be.ok();
          })
          .catch(function(err) {
            expect().fail();
          })
          .then(done, done);
        });

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

        afterEach(function() {
          fs.removeSync(dir);
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
