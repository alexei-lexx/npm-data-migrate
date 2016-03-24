var expect = require('expect.js-extra');
var shared = require('mocha-shared');
var fs = require('fs-extra');
var Cli = require('../lib/cli');
require('./shared/subcommand');

describe('Cli', function() {
  describe('.exec', function() {
    it('returns a promise', function() {
      expect(Cli.exec([])).to.be.a('promise');
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

      context('when a non-existent directory is given', function() {
        var dir = './non_existent_dir';
        var args = [ 'node', 'script', 'create', 'new_migration', '-d', dir ];

        it('creates this directory silently', function() {
          return expect(Cli.exec(args)).to
            .fulfill()
            .then(function() {
              var existent = fs.statSync(dir).isDirectory();
              expect(existent).to.be.ok();
            });
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

        it('creates a new file', function() {
          return expect(Cli.exec(args)).to
            .fulfill()
            .then(function() {
              var files = fs.readdirSync(process.cwd() + '/test/example/tmp');
              expect(files).to.have.length(1);
              expect(files[0]).to.contain('new_migration.js');
            });
        });
      });

      afterEach(function() {
        fs.removeSync(__dirname + '/example/tmp');
      });
    });
  });
});
