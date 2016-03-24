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
          new MigrationsSet([], wrongCurVersion);
        }).to.throwException('The version 1111 not found');
      });
    });
  });

  describe('#migrate', function() {
    it('returns a promise', function() {
      migrationsSet = new MigrationsSet([]);
      expect(migrationsSet.migrate()).to.be.a('promise');
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

        it('is fulfilled', function() {
          return expect(migrationsSet.migrate()).to.fulfill();
        });

        it('goes through all migrations', function() {
          return migrationsSet.migrate()
            .then(function() {
              expect(counter).to.be(3);
            });
        });
      });

      context('when the current version is given', function() {
        beforeEach(function() {
          var curVersion = migrations[0].version;
          migrationsSet = new MigrationsSet(migrations, curVersion);
        });

        it('goes through pending migrations only', function() {
          return migrationsSet.migrate()
            .then(function() {
              expect(counter).to.be(2);
            });
        });
      });

      context('when the version backend is given', function() {
        beforeEach(function() {
          migrationsSet = new MigrationsSet(migrations);
        });

        it('saves the last version as current', function() {
          var versionBackend = new VersionBackend();

          return migrationsSet.migrate(versionBackend)
            .then(function() {
              return versionBackend.getCurrent();
            })
            .then(function(currentVersion) {
              var expectedVersion = migrations[2].version;
              expect(currentVersion).to.be(expectedVersion);
            });
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

      it('is rejected', function() {
        return expect(migrationsSet.migrate()).to.reject();
      });

      it('doesn\'t go over the failed migration', function() {
        return migrationsSet.migrate()
          .catch(function(err) {
            expect(flag).to.be('B');
          });
      });

      context('when the version backend is given', function() {
        it('saves the last resolved version as current', function() {
          var versionBackend = new VersionBackend();

          return migrationsSet.migrate(versionBackend)
            .catch(function() {
              return versionBackend.getCurrent();
            })
            .then(function(currentVersion) {
              var expectedVersion = migrations[1].version;
              expect(currentVersion).to.be(expectedVersion);
            });
        });
      });
    });
  });

  describe('#rollback', function() {
    it('returns a promise', function() {
      migrationsSet = new MigrationsSet([]);
      expect(migrationsSet.rollback()).to.be.a('promise');
    });

    context('when no migrations are given', function() {
      beforeEach(function() {
        migrationsSet = new MigrationsSet([]);
      });

      it('is fulfilled', function() {
        return expect(migrationsSet.rollback()).to.fulfill();
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

      it('is fulfilled', function() {
        return expect(migrationsSet.rollback()).to.fulfill();
      });

      it('doesn\'t rollback any migration', function() {
        return migrationsSet.rollback()
          .then(function() {
            expect(flag).to.be('initial');
          });
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

      it('reverts the current migration', function() {
        return migrationsSet.rollback()
          .then(function() {
            expect(flag).to.be('B');
          });
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

      it('is rejected', function() {
        return expect(migrationsSet.rollback()).to.reject();
      });

      it('doesn\'t revert anything', function() {
        return migrationsSet.rollback()
          .catch(function(err) {
            expect(flag).to.be('initial');
          });
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

        it('sets the current version to null', function() {
          return migrationsSet.rollback(versionBackend)
            .then(function() {
              return versionBackend.getCurrent();
            })
            .then(function(currentVersion) {
              expect(currentVersion).to.be(null);
            });
        });
      });

      context('when there are several migrations to rollback', function() {
        beforeEach(function() {
          var curVersion = migrations[1].version;
          migrationsSet = new MigrationsSet(migrations, curVersion);
        });

        it('sets the current version to null', function() {
          return migrationsSet.rollback(versionBackend)
            .then(function() {
              return versionBackend.getCurrent();
            })
            .then(function(currentVersion) {
              var expectedVersion = migrations[0].version;
              expect(currentVersion).to.be(expectedVersion);
            });
        });
      });
    });
  });
});
