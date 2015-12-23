var expect = require('expect.js');
var factory = require('./factory');
var Migrator = require('../lib/migrator');
var VersionBackend = require('../lib/version_backend');

describe('Migrator', function() {
  describe('#migrate', function() {
    it('returns a promise', function() {
      var migrator = new Migrator([]);
      var result = migrator.migrate();

      expect(result).to.be.ok();
      expect(typeof result.then).to.be('function');
    });

    context('when a migration hasn\'t the #up method', function() {
      var migrator;

      beforeEach(function() {
        migrator = new Migrator([ factory.build('migration without #up') ]);
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
      var counter, migrations;

      beforeEach(function() {
        var up = function() { counter++; };

        migrations = factory.buildList('migration', 3, { up: up });
        counter = 0;
      });

      context('when the current version is not given', function() {
        var migrator;

        beforeEach(function() {
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

      context('when the current version is given', function() {
        var migrator;

        beforeEach(function() {
          var curVersion = migrations[0].version;
          migrator = new Migrator(migrations, curVersion);
        });

        it('goes through pending migrations only', function(done) {
          migrator.migrate()
          .then(function() {
            expect(counter).to.be(2);
          })
          .then(done, done);
        });
      });
    });

    context('when one migration in the middle fails', function() {
      var flag, migrations, migrator;

      beforeEach(function() {
        migrations = [
          factory.build('migration', { up: function() { flag = 'A'; } }),
          factory.build('migration', { up: function() { flag = 'B'; } }),
          factory.build('migration with failed #up'),
          factory.build('migration', { up: function() { flag = 'C'; } }),
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

    context('when the backend is given', function() {
      var versionBackend = new VersionBackend();

      beforeEach(function() {
        var migrations = [
          factory.build('migration'),
          factory.build('migration'),
          factory.build('migration with failed #up'),
        ];

        migrator = new Migrator(migrations, 0, versionBackend);
      });

      it('saves all successful versions to the backend', function(done) {
        migrator.migrate()
        .then(function() {
          expect().fail();
        })
        .catch(function() {
          return versionBackend.getMigrated();
        })
        .then(function(migrated) {
          expect(migrated).to.have.length(2);
        })
        .then(done, done);
      });
    });
  });

  describe('#rollback', function() {
    it('returns a promise', function() {
      var migrator = new Migrator([]);
      var result = migrator.rollback();

      expect(result).to.be.ok();
      expect(typeof result.then).to.be('function');
    });

    context('when a migration hasn\'t the #down method', function() {
      var migrator;

      beforeEach(function() {
        migrator = new Migrator([ factory.build('migration without #down') ]);
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
      var migrator;

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
      var flag, migrations, migrator;

      beforeEach(function() {
        migrations = [
          factory.build('migration', { down: function() { flag = null; } }),
          factory.build('migration', { down: function() { flag = 'A'; } }),
          factory.build('migration', { down: function() { flag = 'B'; } }),
        ];
      });

      context('when the current version is not given', function() {
        beforeEach(function() {
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

      context('when the current version is given', function() {
        beforeEach(function() {
          var curVersion = migrations[1].version;
          migrator = new Migrator(migrations, curVersion);
        });

        it('reverts the current migration', function(done) {
          migrator.rollback()
          .then(function() {
            expect(flag).to.be('A');
          })
          .then(done, done);
        });
      });

      context('when the current version is wrong', function() {
        beforeEach(function() {
          var wrongCurVersion = 1111;
          migrator = new Migrator(migrations, wrongCurVersion);
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
      });
    });

    context('when the last migration fails on rollback', function() {
      var flag, migrations, migrator;

      beforeEach(function() {
        flag = 'B';

        migrations = [
          factory.build('migration'),
          factory.build('migration', { down: function() { flag = 'A'; } }),
          factory.build('migration with failed #down'),
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
