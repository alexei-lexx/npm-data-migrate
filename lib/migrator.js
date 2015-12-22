var Q = require('q');

var Migrator = function(migrations) {
  this.migrations = migrations;
};

Migrator.prototype.migrate = function() {
  var startPosition = -1;

  if (this._hasNext(startPosition)) {
    return this._migrateNext(startPosition);
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

Migrator.prototype._migrateNext = function(position) {
  var migration = this.migrations[position + 1];
  var self = this;

  return Q.fcall(function() {
    if (typeof migration.up == 'function') {
      return migration.up();
    }
  })
  .then(function() {
    if (self._hasNext(position + 1)) {
      return self._migrateNext(position + 1);
    }
  });
};

Migrator.prototype._hasNext = function(position) {
  return position < this.migrations.length - 1;
};

module.exports = Migrator;
