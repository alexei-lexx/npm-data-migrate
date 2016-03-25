var expect = require('expect.js');
var Q = require('q');
var shared = require('mocha-shared');
var Migration = require('../lib/migration');

shared.scenario('migration method', function(methodName) {
  context('when the option is not given', function() {
    var migration;

    beforeEach(function() {
      migration = new Migration({});
    });

    it('returns a promise', function() {
      expect(migration[methodName]()).to.be.a('promise');
    });

    it('is resolved with no value', function() {
      return expect(migration[methodName]()).to
        .fulfill()
        .then(function(result) {
          expect(typeof result).to.be('undefined');
        });
    });
  });

  context('when the option returns a simple value', function() {
    var migration;

    beforeEach(function() {
      var options = {};
      options[methodName] = function() { return 'A'; };

      migration = new Migration(options);
    });

    it('returns a promise', function() {
      expect(migration[methodName]()).to.be.a('promise');
    });

    it('is resolved with the same value', function() {
      return expect(migration[methodName]()).to
        .fulfill()
        .then(function(result) {
          expect(result).to.be('A');
        });
    });
  });

  context('when the option returns a rejected promise', function() {
    var migration;

    beforeEach(function() {
      var options = {};
      options[methodName] = function() { return Q.reject('bad weather'); };

      migration = new Migration(options);
    });

    it('returns a promise', function() {
      expect(migration[methodName]()).to.be.a('promise');
    });

    it('is rejected with the same reason', function() {
      return expect(migration[methodName]()).to.reject('bad weather');
    });
  });

  context('when the option returns a resolved promise', function() {
    var migration;

    beforeEach(function() {
      var options = {};
      options[methodName] = function() {
        return Q.fcall(function() {
          return 'B';
        });
      };

      migration = new Migration(options);
    });

    it('returns a promise', function() {
      expect(migration[methodName]()).to.be.a('promise');
    });

    it('is resolved with the same value', function() {
      return expect(migration[methodName]()).to
        .fulfill()
        .then(function(result) {
          expect(result).to.be('B');
        });
    });
  });
});

describe('Migration', function() {
  describe('#up', function() {
    shared.scenario('migration method', 'up');
  });

  describe('#down', function() {
    shared.scenario('migration method', 'down');
  });
});
