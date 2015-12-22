var Q = require('q');

var Migrator = function(migrations) {
  this.migrations = migrations;
};

Migrator.prototype.migrate = function() {
  if (this.migrations.length > 0) {
    return this._migrateNext(this.migrations, 0);
  } else {
    return Q();
  }
};

Migrator.prototype.rollback = function() {
  if (this.migrations.length > 0) {
    var migration = this.migrations[this.migrations.length - 1];

    return Q.fcall(function() {
      if (typeof migration.down == 'function') {
        return migration.down();
      }
    });
  } else {
    return Q.reject(new Error('No migrations to rollback'));
  }
};

Migrator.prototype._migrateNext = function(migrations, position) {
  var migration = this.migrations[position];
  var self = this;

  return Q.fcall(function() {
    if (typeof migration.up == 'function') {
      return migration.up();
    }
  })
  .then(function() {
    position++;

    if (position < migrations.length) {
      return self._migrateNext(migrations, position);
    }
  });
};

module.exports = Migrator;
