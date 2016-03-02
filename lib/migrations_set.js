var Q = require('q');

var MigrationsSet = function(migrations, currentVersion) {
  this.migrations = migrations;

  if (typeof currentVersion === 'undefined') {
    this.currentPosition = -1;
  } else {
    this.currentPosition = this._getPositionByVersion(currentVersion);

    if (typeof this.currentPosition === 'undefined') {
      throw new Error('The version ' + currentVersion + ' not found');
    }
  }
};

MigrationsSet.prototype.migrate = function(versionBackend) {
  if (this.currentPosition < this.migrations.length - 1) {
    var self = this;
    var nextMigration = this.migrations[this.currentPosition + 1];

    return nextMigration.up()
    .then(function() {
      if (versionBackend) {
        return versionBackend.setCurrent(nextMigration.version);
      }
    })
    .then(function() {
      self.currentPosition++;
    })
    .then(function() {
      return self.migrate(versionBackend);
    });
  } else {
    return Q();
  }
};

MigrationsSet.prototype.rollback = function(versionBackend) {
  if (this.currentPosition >= 0) {
    var self = this;

    var currentMigration = this.migrations[this.currentPosition];
    return currentMigration.down()
    .then(function() {
      self.currentPosition--;
    })
    .then(function() {
      if (versionBackend) {
        if (self.currentPosition >= 0) {
          var currentVersion = self.migrations[self.currentPosition].version;
          return versionBackend.setCurrent(currentVersion);
        } else {
          return versionBackend.setCurrent(null);
        }
      }
    });
  } else {
    return Q();
  }
};

MigrationsSet.prototype._getPositionByVersion = function(version) {
  for (var i = 0; i < this.migrations.length; i++) {
    if (this.migrations[i].version === version) {
      return i;
    }
  }
};

module.exports = MigrationsSet;
