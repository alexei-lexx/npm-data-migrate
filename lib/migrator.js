var Q = require('q');

var Migrator = function(migrations, currentVersion) {
  this.migrations = migrations;
  this.currentVersion = currentVersion || 0;
};

Migrator.prototype.migrate = function() {
  var currentVersion = this.currentVersion;

  var migrations = this.migrations.filter(function(migration) {
    return migration.version > currentVersion;
  });

  if (migrations.length > 0) {
    return this._migrateNext(migrations, 0);
  } else {
    return Q();
  }
};

Migrator.prototype.rollback = function() {
  var migrations;
  var currentVersion = this.currentVersion;

  if (currentVersion > 0) {
    migrations = this.migrations.filter(function(migration) {
      return migration.version == currentVersion;
    });
  } else {
    migrations = this.migrations;
  }

  if (migrations.length > 0) {
    var migration = migrations[migrations.length - 1];

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
