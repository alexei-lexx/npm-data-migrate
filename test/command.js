var expect = require('expect.js');
var shared = require('mocha-shared');
var Command = require('../lib/command');
require('./shared/subcommand');

describe('Command', function() {
  var command;

  beforeEach(function() {
    command = new Command();
  });

  describe('#run', function() {
    it('returns a promise', function() {
      var result = command.run([]);

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
