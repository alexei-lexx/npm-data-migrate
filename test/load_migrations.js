var expect = require('expect.js');
var loadMigrations = require('../lib/load_migrations');

describe('LoadMigrations', function() {
  it('returns a promise', function() {
    expect(loadMigrations('.')).to.be.a('promise');
  });

  context('when a non-existent dir is given', function() {
    it('is rejected', function() {
      return expect(loadMigrations('./wrong-dir')).to.reject(/ENOENT/);
    });
  });

  context('when an existent dir is given', function() {
    var dir = process.cwd() + '/test/example/migrations';

    context('and the dir ends with /', function(done) {
      var dirWithSlash = dir + '/';

      it('is fulfilled', function() {
        return expect(loadMigrations(dirWithSlash)).to.fulfill();
      });
    });

    context('and the dir doesn\'t end with /', function(done) {
      it('is fulfilled', function() {
        return expect(loadMigrations(dir)).to.fulfill();
      });
    });

    it('filters out useless files', function() {
      return loadMigrations(dir)
        .then(function(migrations) {
          expect(migrations).to.have.length(3);
        });
    });

    it('returns an array of migrations', function() {
      return loadMigrations(dir)
        .then(function(migrations) {
          migrations.forEach(function(migration) {
            expect(migration.version).to.be.ok();
          });
        });
    });

    it('sorts the result by date', function() {
      return loadMigrations(dir)
        .then(function(migrations) {
          expect(migrations[0].version).to.be('20150101000000');
          expect(migrations[1].version).to.be('20150102000000');
          expect(migrations[2].version).to.be('20150201000000');
        });
    });
  });
});
