var fs = require('fs');
var Q = require('q');

var regexp = /^(\d+)_.*\.js$/;

module.exports = function(dir) {
  return Q.fcall(function() {
    return fs.readdirSync(dir)
      .filter(function(fileName) {
        return fileName.match(regexp);
      })
      .sort()
      .map(function(fileName) {
        var migration = require(dir + '/' + fileName);
        migration.version = fileName.match(regexp)[1];
        return migration;
      });
  });
};
