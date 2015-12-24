var Q = require('q');

var Migrator = function(migrations, currentVersion) {
  this.migrations = migrations;

  if (typeof currentVersion == 'undefined') {
    this.currentPosition = -1;
  } else {
    for (var i = 0; i < this.migrations.length; i++) {
      if (this.migrations[i].version == currentVersion) {
        this.currentPosition = i;
        break;
      }
    }

    if (typeof this.currentPosition == 'undefined') {
      throw new Error('The version ' + currentVersion + ' not found');
    }
  }
};

Migrator.prototype.migrate = function() {
  if (this.currentPosition < this.migrations.length - 1) {
    var self = this;
    var nextMigration = this.migrations[this.currentPosition + 1];

    return nextMigration.up()
    .then(function() {
      self.currentPosition++;
      return self.migrate();
    });
  } else {
    return Q();
  }
};

Migrator.prototype.rollback = function() {
  if (this.currentPosition >= 0) {
    var migration = this.migrations[this.currentPosition];
    return migration.down();
  } else {
    return Q.reject(new Error('No migrations to rollback'));
  }
};

module.exports = Migrator;
