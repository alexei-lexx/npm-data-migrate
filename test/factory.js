var Factory = require('rosie').Factory;
var Migration = require('../lib/migration');

Factory.define('migration', Migration)
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
