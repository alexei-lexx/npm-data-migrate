var Q = require('q');

var Migration = function(options) {
  this.options = options;
  this.version = this.options.version;
};

Migration.prototype.up = function() {
  return Q.fcall(function(self) {
    if (typeof self.options.up == 'function') {
      return self.options.up.call(self);
    }
  }, this);
};

Migration.prototype.down = function() {
  return Q.fcall(function(self) {
    if (typeof self.options.down == 'function') {
      return self.options.down.call(self);
    }
  }, this);
};

module.exports = Migration;
