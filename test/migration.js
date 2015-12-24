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
      expect(typeof migration[methodName]().then).to.be('function');
    });

    it('is resolved with no value', function(done) {
      migration[methodName]()
      .then(function(result) {
        expect(typeof result).to.be('undefined');
      })
      .catch(function() {
        expect().fail();
      })
      .then(done, done);
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
      expect(typeof migration[methodName]().then).to.be('function');
    });

    it('is resolved with the same value', function(done) {
      migration[methodName]()
      .then(function(result) {
        expect(result).to.be('A');
      })
      .catch(function() {
        expect().fail();
      })
      .then(done, done);
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
      expect(typeof migration[methodName]().then).to.be('function');
    });

    it('is rejected with the same reason', function(done) {
      migration[methodName]()
      .then(function() {
        expect().fail();
      })
      .catch(function(reason) {
        expect(reason).to.be('bad weather');
      })
      .then(done, done);
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
      expect(typeof migration[methodName]().then).to.be('function');
    });

    it('is resolved with the same value', function(done) {
      migration[methodName]()
      .then(function(result) {
        expect(result).to.be('B');
      })
      .catch(function() {
        expect().fail();
      })
      .then(done, done);
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
