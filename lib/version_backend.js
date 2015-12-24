var Q = require('q');

var VersionBackend = function() {
  this.current = null;
};

VersionBackend.prototype.setCurrent = function(version) {
  var self = this;

  return Q.fcall(function() {
    self.current = version;
  });
};

VersionBackend.prototype.getCurrent = function() {
  var self = this;

  return Q.fcall(function() {
    return self.current;
  });
};

module.exports = VersionBackend;
