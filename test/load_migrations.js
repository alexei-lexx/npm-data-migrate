var expect = require('expect.js');
var loadMigrations = require('../lib/load_migrations');

describe('LoadMigrations', function() {
  it('returns a promise', function() {
    var result = loadMigrations('.');

    expect(result).to.be.ok();
    expect(typeof result.then).to.be('function');
  });

  context('when a non-existent dir is given', function() {
    it('is rejected', function(done) {
      loadMigrations('./wrong-dir')
      .then(function() {
        expect().fail();
      })
      .catch(function(err) {
        expect(err.code).to.be('ENOENT')
      })
      .then(done, done);
    });
  });

  context('when an existent dir is given', function() {
    var dir = process.cwd() + '/test/example/migrations';

    context('and the dir ends with /', function(done) {
      it('is fulfilled', function(done) {
        loadMigrations(dir)
        .then(function() {
          expect().not.fail();
        })
        .catch(function(err) {
          expect().fail();
        })
        .then(done, done);
      });
    });

    context('and the dir doesn\'t end with /', function(done) {
      it('is fulfilled', function(done) {
        loadMigrations(dir)
        .then(function() {
          expect().not.fail();
        })
        .catch(function(err) {
          expect().fail();
        })
        .then(done, done);
      });
    });

    it('filters out useless files', function(done) {
      loadMigrations(dir)
      .then(function(migrations) {
        expect(migrations).to.have.length(3);
      })
      .then(done, done);
    });

    it('returns an array of migrations', function(done) {
      loadMigrations(dir)
      .then(function(migrations) {
        migrations.forEach(function(migration) {
          expect(migration.number).to.be.ok();
        });
      })
      .then(done, done);
    });

    it('sorts the result by date', function(done) {
      loadMigrations(dir)
      .then(function(migrations) {
        expect(migrations[0].number).to.be('20150101000000');
        expect(migrations[1].number).to.be('20150102000000');
        expect(migrations[2].number).to.be('20150201000000');
      })
      .then(done, done);
    });
  });
});
