var Q = require('q');

var VersionBackend = function() {
  this.migrated = [];
};

VersionBackend.prototype.recordStatus = function(version, migrated) {
  var self = this;

  if (migrate) {
    return Q.fcall(function() {
      self.migrated.push(version);
    });
  } else {
    return Q.fcall(function() {
      var i = self.migrated.indexOf(version);
      self.migrated.splice(i, 1);
    });
  }
};

VersionBackend.prototype.getMigrated = function() {
  var self = this;

  return Q.fcall(function() {
    return self.migrated;
  });
};

module.exports = VersionBackend;
