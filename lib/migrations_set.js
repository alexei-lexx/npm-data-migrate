var Q = require('q');

var MigrationsSet = function(migrations, currentVersion) {
  var currentIndex = -1;

  if (typeof currentVersion !== 'undefined') {
    currentIndex = getPositionByVersion(currentVersion);

    if (typeof currentIndex === 'undefined') {
      throw new Error('The version ' + currentVersion + ' not found');
    }
  }

  this.migrate = migrate;
  this.rollback = rollback;

  function migrate(versionBackend) {
    if (currentIndex < migrations.length - 1) {
      var nextMigration = migrations[currentIndex + 1];

      return nextMigration.up()
      .then(function() {
        if (versionBackend) {
          return versionBackend.setCurrent(nextMigration.version);
        }
      })
      .then(function() {
        currentIndex++;
      })
      .then(function() {
        return migrate(versionBackend);
      });
    } else {
      return Q();
    }
  }

  function rollback(versionBackend) {
    if (currentIndex >= 0) {
      var currentMigration = migrations[currentIndex];

      return currentMigration.down()
      .then(function() {
        currentIndex--;
      })
      .then(function() {
        if (versionBackend) {
          if (currentIndex >= 0) {
            var currentVersion = migrations[currentIndex].version;
            return versionBackend.setCurrent(currentVersion);
          } else {
            return versionBackend.setCurrent(null);
          }
        }
      });
    } else {
      return Q();
    }
  }

  function getPositionByVersion(version) {
    for (var i = 0; i < migrations.length; i++) {
      if (migrations[i].version === version) {
        return i;
      }
    }
  }
};

module.exports = MigrationsSet;
