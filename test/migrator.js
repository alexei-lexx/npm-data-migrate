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
          expect(true).to.be(true);
        }, function(err) {
          expect(true).to.be(false);
        })
        .then(done, done);
      });
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

      it('sets the right position', function(done) {
        expect(migrator.position).to.be(-1);

        migrator.migrate()
        .then(function() {
          expect(migrator.position).to.be(2);
        })
        .then(done, done);
      });

      context('when it is called twice', function() {
        beforeEach(function(done) {
          migrator.migrate()
          .then(done, done);
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

        it('doesn\'t go through the migrations again', function(done) {
          migrator.migrate()
          .then(function() {
            expect(counter).to.be(3);
          })
          .then(done, done);
        });

        it('doesn\'t change the position', function(done) {
          expect(migrator.position).to.be(2);

          migrator.migrate()
          .then(function() {
            expect(migrator.position).to.be(2);
          })
          .then(done, done);
        });
      });
    });

    context('when one migration in the middle fails', function() {
      var flag;

      beforeEach(function() {
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

      it('sets the position of the last successful migration', function(done) {
        migrator.migrate()
        .then(function() {
          expect(true).to.be(false);
        }, function(err) {
          expect(migrator.position).to.be(1);
        })
        .then(done, done);
      });
    });
  });

  describe('#rollback', function() {
    it('returns a promise', function() {
      migrator = new Migrator([]);
      var result = migrator.rollback();

      expect(result).to.be.ok();
      expect(typeof result.then).to.be('function');
    });

    context('when a migration hasn\'t the #down method', function() {
      beforeEach(function(done) {
        migrator = new Migrator([ {} ]);
        migrator.migrate()
        .then(done, done);
      });

      it('is fulfilled', function(done) {
        migrator.rollback()
        .then(function() {
          expect(true).to.be(true);
        }, function(err) {
          expect(true).to.be(false);
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
          expect(true).to.be(false);
        }, function(err) {
          expect(err.message).to.be('No migrations to rollback');
        })
        .then(done, done);
      });
    });

    context('when successful migrations are given', function() {
      var flag;

      beforeEach(function() {
        var migrations = [
          { up: function() { flag = 'A'; }, down: function() { flag = null; } },
          { up: function() { flag = 'B'; }, down: function() { flag = 'A'; } },
          { up: function() { flag = 'C'; }, down: function() { flag = 'B'; } },
        ];

        migrator = new Migrator(migrations);
      });

      context('but they were not migrated yet', function() {
        it('is rejected', function(done) {
          migrator.rollback()
          .then(function() {
            expect(true).to.be(false);
          }, function(err) {
            expect(err.message).to.be('No migrations to rollback');
          })
          .then(done, done);
        });
      });

      context('and they all were already migrated', function() {
        beforeEach(function(done) {
          migrator.migrate()
          .then(done, done);
        });

        it('cancels the result of the last one', function(done) {
          migrator.rollback()
          .then(function() {
            expect(flag).to.be('B');
          })
          .then(done, done);
        });

        it('decrements the position', function(done) {
          expect(migrator.position).to.be(2);

          migrator.rollback()
          .then(function() {
            expect(migrator.position).to.be(1);
          })
          .then(done, done);
        });
      });
    });

    context('when the last migration fails on rollback', function() {
      var flag;

      beforeEach(function(done) {
        var migrations = [
          { up: function() { flag = 'A'; }, down: function() { flag = null; } },
          {
            up: function() { flag = 'B'; },
            down: function() { throw new Error(); },
          },
        ];

        migrator = new Migrator(migrations);
        migrator.migrate().then(done, done);
      });

      it('is rejected', function(done) {
        migrator.rollback()
        .then(function() {
          expect(true).to.be(false);
        }, function(err) {
          expect(true).to.be(true);
        })
        .then(done, done);
      });

      it('doesn\'t revert the changes of all migrations', function(done) {
        migrator.rollback()
        .then(function() {
          expect(true).to.be(false);
        }, function(err) {
          expect(flag).to.be('B');
        })
        .then(done, done);
      });

      it('doesn\'t decrement the position', function(done) {
        expect(migrator.position).to.be(1);

        migrator.rollback()
        .then(function() {
          expect(true).to.be(false);
        }, function(err) {
          expect(migrator.position).to.be(1);
        })
        .then(done, done);
      });
    });
  });
});
