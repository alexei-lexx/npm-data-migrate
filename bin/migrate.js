#!/usr/bin/env node

var Cli = require('../lib/cli');

Cli.exec(process.argv)
.then(function() {
  console.info('Completed');
})
.catch(function(err) {
  console.info('Failed: ' + err);
});
