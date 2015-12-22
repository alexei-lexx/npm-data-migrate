var Factory = require('rosie').Factory;

Factory.define('migration')
  .sequence('version', function(i) {
    var year = 2000 + i;
    return year + '0101000000';
  })
  .attr('up', function() {
    return function() {};
  })
  .attr('down', function() {
    return function() {};
  });

Factory.define('migration without #up')
  .extend('migration')
  .after(function(migration) {
    delete(migration.up);
  });

Factory.define('migration without #down')
  .extend('migration')
  .after(function(migration) {
    delete(migration.down);
  });

Factory.define('migration with failed #up')
  .extend('migration')
  .attr('up', function() {
    return function() { throw new Error(); };
  });

Factory.define('migration with failed #down')
  .extend('migration')
  .attr('down', function() {
    return function() { throw new Error(); };
  });

module.exports = Factory;
