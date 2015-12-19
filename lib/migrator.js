var Q = require('q');

var Migrator = function(migrations) {
  this.migrations = migrations;
};

Migrator.prototype.migrate = function() {
  if (this.migrations.length > 0) {
    return this._migrate(0);
  } else {
    return Q.fcall(function() {});
  }
};

Migrator.prototype._migrate = function(i) {
  var migration = this.migrations[i];
  var self = this;

  return Q.fcall(function() {
    return migration.up();
  })
  .then(function() {
    if (i < self.migrations.length - 1) {
      return self._migrate(i + 1);
    }
  });
};

module.exports = Migrator;
