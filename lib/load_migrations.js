var fs = require('fs');
var Q = require('q');
var Migration = require('./migration');

var regexp = /^(\d+)_.*\.js$/;

module.exports = function(dir) {
  return Q.fcall(function() {
    return fs.readdirSync(dir)
      .filter(function(fileName) {
        return fileName.match(regexp);
      })
      .sort()
      .map(function(fileName) {
        var options = require(dir + '/' + fileName);
        options.version = fileName.match(regexp)[1];

        return new Migration(options);
      });
  });
};
