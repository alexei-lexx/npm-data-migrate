var expect = require('expect.js');
var rollbackMigrations = require('../lib/rollback_migrations');

describe('RollbackMigrations', function() {
  it('returns a promise', function() {
    var result = rollbackMigrations([]);

    expect(result).to.be.ok();
    expect(typeof result.then).to.be('function');
  });

  context('when a migration hasn\'t the #down method', function() {
    var migrations = [ {} ];

    it('is fulfilled', function(done) {
      rollbackMigrations(migrations)
      .then(function() {
        expect().not.fail();
      })
      .catch(function(err) {
        expect().fail();
      })
      .then(done, done);
    });
  });

  context('when no migrations are given', function() {
    var migrations = [];

    it('is rejected', function(done) {
      rollbackMigrations(migrations)
      .then(function() {
        expect().fail();
      })
      .catch(function(err) {
        expect(err.message).to.be('No migrations to rollback');
      })
      .then(done, done);
    });
  });

  context('when successful migrations are given', function() {
    var flag, migrations;

    beforeEach(function() {
      migrations = [
        { up: function() { flag = 'A'; }, down: function() { flag = null; } },
        { up: function() { flag = 'B'; }, down: function() { flag = 'A'; } },
        { up: function() { flag = 'C'; }, down: function() { flag = 'B'; } },
      ];
    });

    it('reverts the result of the last one', function(done) {
      rollbackMigrations(migrations)
      .then(function() {
        expect(flag).to.be('B');
      })
      .then(done, done);
    });
  });

  context('when the last migration fails on rollback', function() {
    var flag, migrations;

    beforeEach(function() {
      flag = 'B';

      migrations = [
        { up: function() { flag = 'A'; }, down: function() { flag = null; } },
        {
          up: function() { flag = 'B'; },
          down: function() { throw new Error(); },
        },
      ];
    });

    it('is rejected', function(done) {
      rollbackMigrations(migrations)
      .then(function() {
        expect().fail();
      })
      .catch(function(err) {
        expect().not.fail();
      })
      .then(done, done);
    });

    it('doesn\'t revert the changes of all migrations', function(done) {
      rollbackMigrations(migrations)
      .then(function() {
        expect().fail();
      })
      .catch(function(err) {
        expect(flag).to.be('B');
      })
      .then(done, done);
    });
  });
});
