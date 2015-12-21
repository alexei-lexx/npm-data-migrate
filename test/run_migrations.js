var expect = require('expect.js');
var runMigrations = require('../lib/run_migrations');

describe('RunMigrations', function() {
  it('returns a promise', function() {
    var result = runMigrations([]);

    expect(result).to.be.ok();
    expect(typeof result.then).to.be('function');
  });

  context('when a migration hasn\'t the #up method', function() {
    var migrations = [ {} ];

    it('is fulfilled', function(done) {
      runMigrations(migrations)
      .then(function() {
        expect().not.fail();
      }, function(err) {
        expect().fail();
      })
      .then(done, done);
    });
  });

  context('when successful migrations are given', function() {
    var counter, migrations

    beforeEach(function() {
      counter = 0;

      migrations = [
        { up: function() { counter++; } },
        { up: function() { counter++; } },
        { up: function() { counter++; } },
      ];
    });

    it('is fulfilled', function(done) {
      runMigrations(migrations)
      .then(function() {
        expect().not.fail();
      }, function(err) {
        expect().fail();
      })
      .then(done, done);
    });

    it('goes through all migrations', function(done) {
      runMigrations(migrations)
      .then(function() {
        expect(counter).to.be(3);
      })
      .then(done, done);
    });
  });

  context('when one migration in the middle fails', function() {
    var flag, migrations;

    beforeEach(function() {
      migrations = [
        { up: function() { flag = 'A'; } },
        { up: function() { flag = 'B'; } },
        { up: function() { throw new Error(); } },
        { up: function() { flag = 'C'; } },
        { up: function() { flag = 'D'; } },
      ];
    });

    it('is rejected', function(done) {
      runMigrations(migrations)
      .then(function() {
        expect().fail();
      }, function(err) {
        expect().not.fail();
      })
      .then(done, done);
    });

    it('doesn\'t go over the failed migration', function(done) {
      runMigrations(migrations)
      .then(function() {
        expect().fail();
      }, function(err) {
        expect(flag).to.be('B');
      })
      .then(done, done);
    });
  });
});
