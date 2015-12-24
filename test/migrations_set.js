var expect = require('expect.js');
var factory = require('./factory');
var MigrationsSet = require('../lib/migrations_set');
var VersionBackend = require('../lib/version_backend');

describe('MigrationsSet', function() {
  describe('#constructor', function() {
    context('when the current version is wrong', function() {
      var wrongCurVersion = 1111;

      it('fails', function() {
        expect(function() {
          new MigrationsSet(migrations, wrongCurVersion);
        }).to.throwException('The version 1111 not found');
      });
    });
  });

  describe('#migrate', function() {
    it('returns a promise', function() {
      var migrationsSet = new MigrationsSet([]);
      var result = migrationsSet.migrate();

      expect(result).to.be.ok();
      expect(typeof result.then).to.be('function');
    });

    context('when successful migrations are given', function() {
      var counter, migrations;

      beforeEach(function() {
        var up = function() { counter++; };

        migrations = factory.buildList('migration', 3, { up: up });
        counter = 0;
      });

      context('when the current version is not given', function() {
        var migrationsSet;

        beforeEach(function() {
          migrationsSet = new MigrationsSet(migrations);
        });

        it('is fulfilled', function(done) {
          migrationsSet.migrate()
          .then(function() {
            expect().not.fail();
          })
          .catch(function(err) {
            expect().fail();
          })
          .then(done, done);
        });

        it('goes through all migrations', function(done) {
          migrationsSet.migrate()
          .then(function() {
            expect(counter).to.be(3);
          })
          .then(done, done);
        });
      });

      context('when the current version is given', function() {
        var migrationsSet;

        beforeEach(function() {
          var curVersion = migrations[0].version;
          migrationsSet = new MigrationsSet(migrations, curVersion);
        });

        it('goes through pending migrations only', function(done) {
          migrationsSet.migrate()
          .then(function() {
            expect(counter).to.be(2);
          })
          .then(done, done);
        });
      });
    });

    context('when one migration in the middle fails', function() {
      var flag, migrations, migrationsSet;

      beforeEach(function() {
        migrations = [
          factory.build('migration', { up: function() { flag = 'A'; } }),
          factory.build('migration', { up: function() { flag = 'B'; } }),
          factory.build('migration with failed #up'),
          factory.build('migration', { up: function() { flag = 'C'; } }),
        ];

        migrationsSet = new MigrationsSet(migrations);
      });

      it('is rejected', function(done) {
        migrationsSet.migrate()
        .then(function() {
          expect().fail();
        })
        .catch(function(err) {
          expect().not.fail();
        })
        .then(done, done);
      });

      it('doesn\'t go over the failed migration', function(done) {
        migrationsSet.migrate()
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

  describe('#rollback', function() {
    it('returns a promise', function() {
      var migrationsSet = new MigrationsSet([]);
      var result = migrationsSet.rollback();

      expect(result).to.be.ok();
      expect(typeof result.then).to.be('function');
    });

    context('when no migrations are given', function() {
      var migrationsSet;

      beforeEach(function() {
        migrationsSet = new MigrationsSet([]);
      });

      it('is rejected', function(done) {
        migrationsSet.rollback()
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
      var flag, migrations, migrationsSet;

      beforeEach(function() {
        migrations = [
          factory.build('migration', { down: function() { flag = null; } }),
          factory.build('migration', { down: function() { flag = 'A'; } }),
          factory.build('migration', { down: function() { flag = 'B'; } }),
        ];
      });

      context('when the current version is not given', function() {
        beforeEach(function() {
          migrationsSet = new MigrationsSet(migrations);
        });

        it('is rejected', function(done) {
          migrationsSet.rollback()
          .then(function() {
            expect().fail();
          })
          .catch(function(err) {
            expect(err.message).to.be('No migrations to rollback');
          })
          .then(done, done);
        });
      });

      context('when the current version is given', function() {
        beforeEach(function() {
          var curVersion = migrations[1].version;
          migrationsSet = new MigrationsSet(migrations, curVersion);
        });

        it('reverts the current migration', function(done) {
          migrationsSet.rollback()
          .then(function() {
            expect(flag).to.be('A');
          })
          .then(done, done);
        });
      });
    });

    context('when the current migration fails on rollback', function() {
      var flag, migrations, migrationsSet;

      beforeEach(function() {
        flag = 'B';

        migrations = [
          factory.build('migration'),
          factory.build('migration', { down: function() { flag = 'A'; } }),
          factory.build('migration with failed #down'),
        ];

        migrationsSet = new MigrationsSet(migrations, migrations[2].version);
      });

      it('is rejected', function(done) {
        migrationsSet.rollback()
        .then(function() {
          expect().fail();
        })
        .catch(function(err) {
          expect().not.fail();
        })
        .then(done, done);
      });

      it('doesn\'t revert anything', function(done) {
        migrationsSet.rollback()
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
