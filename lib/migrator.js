var Q = require('q');

var Migrator = function(migrations, currentVersion) {
  this.migrations = migrations;
  this.currentVersion = currentVersion || 0;
};

Migrator.prototype.migrate = function() {
  var pendingMigrations = this._getPendingMigrations();

  if (pendingMigrations.length > 0) {
    return this._migrateNext(pendingMigrations, 0);
  } else {
    return Q();
  }
};

Migrator.prototype.rollback = function() {
  var migration;

  if (this.currentVersion > 0) {
    migration = this._findMigration(this.currentVersion);
  } else if (this.migrations.length > 0) {
    migration = this.migrations[this.migrations.length - 1];
  }

  if (migration) {
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
    var nextPosition = position + 1;

    if (nextPosition < migrations.length) {
      return self._migrateNext(migrations, nextPosition);
    }
  });
};

Migrator.prototype._getPendingMigrations = function() {
  var currentVersion = this.currentVersion;

  return this.migrations.filter(function(migration) {
    return migration.version > currentVersion;
  });
};

Migrator.prototype._findMigration = function(version) {
  for (var i = 0; i < this.migrations.length; i++) {
    if (this.migrations[i].version == version) {
      return this.migrations[i];
    }
  }

  return null;
};

module.exports = Migrator;
