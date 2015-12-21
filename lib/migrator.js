var Q = require('q');

var Migrator = function(migrations) {
  this.migrations = migrations;
  this.position = -1;
};

Migrator.prototype.migrate = function() {
  if (this._hasNext()) {
    return this._migrateNext();
  } else {
    return Q();
  }
};

Migrator.prototype.rollback = function() {
  if (this.position >= 0) {
    var migration = this.migrations[this.position];
    var self = this;

    return Q.fcall(function() {
      if (typeof migration.down == 'function') {
        return migration.down();
      }
    })
    .then(function() {
      self.position--;
    });
  } else {
    return Q.reject(new Error('No migrations to rollback'));
  }
};

Migrator.prototype._migrateNext = function() {
  var migration = this.migrations[this.position + 1];
  var self = this;

  return Q.fcall(function() {
    if (typeof migration.up == 'function') {
      return migration.up();
    }
  })
  .then(function() {
    self.position++;

    if (self._hasNext()) {
      return self._migrateNext();
    }
  });
};

Migrator.prototype._hasNext = function() {
  return this.position < this.migrations.length - 1;
};

module.exports = Migrator;
