var expect = require('expect.js');
var factory = require('./factory');
var MigrationsSet = require('../lib/migrations_set');
var VersionBackend = require('../lib/version_backend');

describe('MigrationsSet', function() {
  var migrationsSet;

  beforeEach(function() {
    migrationsSet = null;
  });

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
      migrationsSet = new MigrationsSet([]);
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

      context('when the version backend is given', function() {
        beforeEach(function() {
          migrationsSet = new MigrationsSet(migrations);
        });

        it('saves the last version as current', function(done) {
          var versionBackend = new VersionBackend();

          migrationsSet.migrate(versionBackend)
          .catch(function() {
            expect().fail();
          })
          .then(function() {
            return versionBackend.getCurrent();
          })
          .then(function(savedVersion) {
            var lastVersion = migrations[2].version;
            expect(savedVersion).to.be(lastVersion);
          })
          .then(done, done);
        });
      });
    });

    context('when one migration in the middle fails', function() {
      var flag, migrations;

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

      context('when the version backend is given', function() {
        it('saves the last resolved version as current', function(done) {
          var versionBackend = new VersionBackend();

          migrationsSet.migrate(versionBackend)
          .then(function() {
            expect().fail();
          })
          .catch(function() {
            return versionBackend.getCurrent();
          })
          .then(function(savedVersion) {
            var lastVersion = migrations[1].version;
            expect(savedVersion).to.be(lastVersion);
          })
          .then(done, done);
        });
      });
    });
  });

  describe('#rollback', function() {
    it('returns a promise', function() {
      migrationsSet = new MigrationsSet([]);
      var result = migrationsSet.rollback();

      expect(result).to.be.ok();
      expect(typeof result.then).to.be('function');
    });

    context('when no migrations are given', function() {
      beforeEach(function() {
        migrationsSet = new MigrationsSet([]);
      });

      it('is fulfilled', function(done) {
        migrationsSet.rollback()
        .then(function() {
          expect().not.fail();
        })
        .catch(function() {
          expect().fail();
        })
        .then(done, done);
      });
    });

    context('when the current version is not given', function() {
      var flag;

      beforeEach(function() {
        var migrations = [
          factory.build('migration', { down: function() { flag = 'A'; } }),
          factory.build('migration', { down: function() { flag = 'B'; } }),
          factory.build('migration', { down: function() { flag = 'C'; } }),
        ];

        migrationsSet = new MigrationsSet(migrations);
        flag = 'initial';
      });

      it('is fulfilled', function(done) {
        migrationsSet.rollback()
        .then(function() {
          expect().not.fail();
        })
        .catch(function() {
          expect().fail();
        })
        .then(done, done);
      });

      it('doesn\'t rollback any migration', function(done) {
        migrationsSet.rollback()
        .then(function() {
          expect(flag).to.be('initial');
        })
        .then(done, done);
      });
    });

    context('when the current version is given', function() {
      var flag;

      beforeEach(function() {
        var migrations = [
          factory.build('migration', { down: function() { flag = 'A'; } }),
          factory.build('migration', { down: function() { flag = 'B'; } }),
          factory.build('migration', { down: function() { flag = 'C'; } }),
        ];
        var curVersion = migrations[1].version;

        migrationsSet = new MigrationsSet(migrations, curVersion);
        flag = 'initial';
      });

      it('reverts the current migration', function(done) {
        migrationsSet.rollback()
        .then(function() {
          expect(flag).to.be('B');
        })
        .then(done, done);
      });
    });

    context('when the current migration fails on rollback', function() {
      var flag;

      beforeEach(function() {
        var migrations = [
          factory.build('migration', { down: function() { flag = 'A'; } }),
          factory.build('migration with failed #down'),
        ];

        migrationsSet = new MigrationsSet(migrations, migrations[1].version);
        flag = 'initial';
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
          expect(flag).to.be('initial');
        })
        .then(done, done);
      });
    });

    context('when the version backend is given', function() {
      var migrations, versionBackend;

      beforeEach(function() {
        migrations = factory.buildList('migration', 2);
        versionBackend = new VersionBackend();
      });

      context('when there is only one migration to rollback', function() {
        beforeEach(function() {
          var curVersion = migrations[0].version;
          migrationsSet = new MigrationsSet(migrations, curVersion);
        });

        it('sets the current version to null', function(done) {
          migrationsSet.rollback(versionBackend)
          .then(function() {
            return versionBackend.getCurrent();
          })
          .then(function(savedVersion) {
            expect(savedVersion).to.be(null);
          })
          .then(done, done);
        });
      });

      context('when there are several migrations to rollback', function() {
        beforeEach(function() {
          var curVersion = migrations[1].version;
          migrationsSet = new MigrationsSet(migrations, curVersion);
        });

        it('sets the current version to null', function(done) {
          migrationsSet.rollback(versionBackend)
          .then(function() {
            return versionBackend.getCurrent();
          })
          .then(function(savedVersion) {
            var expectedVersion = migrations[0].version;
            expect(savedVersion).to.be(expectedVersion);
          })
          .then(done, done);
        });
      });
    });
  });
});
