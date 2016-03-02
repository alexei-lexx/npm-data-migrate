var Q = require('q');

var MigrationsSet = function(migrations, currentVersion) {
  this.migrations = migrations;

  if (typeof currentVersion === 'undefined') {
    this.currentIndex = -1;
  } else {
    this.currentIndex = this._getPositionByVersion(currentVersion);

    if (typeof this.currentIndex === 'undefined') {
      throw new Error('The version ' + currentVersion + ' not found');
    }
  }
};

MigrationsSet.prototype.migrate = function(versionBackend) {
  if (this.currentIndex < this.migrations.length - 1) {
    var self = this;
    var nextMigration = this.migrations[this.currentIndex + 1];

    return nextMigration.up()
    .then(function() {
      if (versionBackend) {
        return versionBackend.setCurrent(nextMigration.version);
      }
    })
    .then(function() {
      self.currentIndex++;
    })
    .then(function() {
      return self.migrate(versionBackend);
    });
  } else {
    return Q();
  }
};

MigrationsSet.prototype.rollback = function(versionBackend) {
  if (this.currentIndex >= 0) {
    var self = this;
    var currentMigration = this.migrations[this.currentIndex];

    return currentMigration.down()
    .then(function() {
      self.currentIndex--;
    })
    .then(function() {
      if (versionBackend) {
        if (self.currentIndex >= 0) {
          var currentVersion = self.migrations[self.currentIndex].version;
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
