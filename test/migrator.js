var expect = require('expect.js');
var Migrator = require('../lib/migrator');

describe('Migrator', function() {
  var migrator;

  describe('#migrate', function() {
    it('returns a promise', function() {
      migrator = new Migrator([]);
      var result = migrator.migrate();

      expect(result).to.be.ok();
      expect(typeof result.then).to.be('function');
    });

    context('when a migration hasn\'t the #up method', function() {
      beforeEach(function() {
        migrator = new Migrator([ {} ]);
      });

      it('is fulfilled', function(done) {
        migrator.migrate()
        .then(function() {
          expect().not.fail();
        })
        .catch(function(err) {
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

        migrator = new Migrator(migrations);
      });

      it('is fulfilled', function(done) {
        migrator.migrate()
        .then(function() {
          expect().not.fail();
        })
        .catch(function(err) {
          expect().fail();
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
      var flag, migrations;

      beforeEach(function() {
        migrations = [
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
          expect().fail();
        })
        .catch(function(err) {
          expect().not.fail();
        })
        .then(done, done);
      });

      it('doesn\'t go over the failed migration', function(done) {
        migrator.migrate()
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

  describe('rollback', function() {
    it('returns a promise', function() {
      var migrator = new Migrator([]);
      var result = migrator.rollback();

      expect(result).to.be.ok();
      expect(typeof result.then).to.be('function');
    });

    context('when a migration hasn\'t the #down method', function() {
      beforeEach(function() {
        migrator = new Migrator([ {} ]);
      });

      it('is fulfilled', function(done) {
        migrator.rollback()
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
      beforeEach(function() {
        migrator = new Migrator([]);
      });

      it('is rejected', function(done) {
        migrator.rollback()
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

        migrator = new Migrator(migrations);
      });

      it('reverts the result of the last one', function(done) {
        migrator.rollback()
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

        migrator = new Migrator(migrations);
      });

      it('is rejected', function(done) {
        migrator.rollback()
        .then(function() {
          expect().fail();
        })
        .catch(function(err) {
          expect().not.fail();
        })
        .then(done, done);
      });

      it('doesn\'t revert the changes of all migrations', function(done) {
        migrator.rollback()
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
});
