var Q = require('q');

var VersionBackend = function() {
  this.current = null;
};

VersionBackend.prototype.setCurrent = function(version) {
  return Q.fcall(function(self) {
    self.current = version;
  }, this);
};

VersionBackend.prototype.getCurrent = function() {
  return Q.fcall(function(self) {
    return self.current;
  }, this);
};

module.exports = VersionBackend;
