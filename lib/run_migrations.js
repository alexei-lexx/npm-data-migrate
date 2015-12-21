var Q = require('q');

module.exports = function(migrations) {
  var startPosition = -1;

  if (hasNext(migrations, startPosition)) {
    return migrateNext(migrations, startPosition);
  } else {
    return Q();
  }
};

function migrateNext(migrations, position) {
  var migration = migrations[position + 1];

  return Q.fcall(function() {
    if (typeof migration.up == 'function') {
      return migration.up();
    }
  })
  .then(function() {
    if (hasNext(migrations, position + 1)) {
      return migrateNext(migrations, position + 1);
    }
  });
};

function hasNext(migrations, position) {
  return position < migrations.length - 1;
};
