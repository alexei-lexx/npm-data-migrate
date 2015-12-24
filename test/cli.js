var expect = require('expect.js');
var shared = require('mocha-shared');
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
  });
});
