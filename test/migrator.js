var expect = require('expect.js');
var Migrator = require('../lib/migrator');

describe('Migrator', function() {
  var migrator;

  describe('#migrate', function() {
    it('returns a promise', function() {
      migrator = new Migrator([]);
      var result = migrator.migrate();

      expect(typeof result.then).to.be('function');
    });

    context('when successful migrations are given', function() {
      var counter;

      beforeEach(function() {
        counter = 0;

        var migrations = [
          { up: function() { counter++; } },
          { up: function() { counter++; } },
          { up: function() { counter++; } },
        ];

        migrator = new Migrator(migrations);
      });

      it('is fulfilled', function(done) {
        migrator.migrate()
        .then(function() {
          expect(true).to.be(true);
        }, function(err) {
          expect(true).to.be(false);
        })
        .then(done, done);
      });

      it('goes through all migrations', function(done) {
        migrator.migrate()
        .then(function() {
          expect(counter).to.be(3);
        })
        .then(done, done);
      });
    });

    context('when one migration in the middle fails', function() {
      var flag;

      beforeEach(function() {
        counter = 0;

        var migrations = [
          { up: function() { flag = 'A'; } },
          { up: function() { flag = 'B'; } },
          { up: function() { throw new Error(); } },
          { up: function() { flag = 'C'; } },
          { up: function() { flag = 'D'; } },
        ];

        migrator = new Migrator(migrations);
      });

      it('is rejected', function(done) {
        migrator.migrate()
        .then(function() {
          expect(true).to.be(false);
        }, function(err) {
          expect(true).to.be(true);
        })
        .then(done, done);
      });

      it('doesn\'t go over the failed migration', function(done) {
        migrator.migrate()
        .then(function() {
          expect(true).to.be(false);
        }, function(err) {
          expect(flag).to.be('B');
        })
        .then(done, done);
      });
    });
  });
});
