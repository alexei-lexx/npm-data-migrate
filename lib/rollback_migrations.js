var Q = require('q');

module.exports = function(migrations) {
  if (migrations.length > 0) {
    var migration = migrations[migrations.length - 1];

    return Q.fcall(function() {
      if (typeof migration.down == 'function') {
        return migration.down();
      }
    });
  } else {
    return Q.reject(new Error('No migrations to rollback'));
  }
};
