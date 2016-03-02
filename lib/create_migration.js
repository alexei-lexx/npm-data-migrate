var sprintf = require('sprintf-js').sprintf;
var fs = require('fs');
var path = require('path');
var Q = require('q');

module.exports = function(dir, migrationName) {
  var now = new Date();
  var version = sprintf('%04d%02d%02d%02d%02d%02d', now.getFullYear(),
                                                    now.getMonth() + 1,
                                                    now.getDate(),
                                                    now.getHours(),
                                                    now.getMinutes(),
                                                    now.getSeconds());

  var normalizedName = migrationName.toLowerCase().replace(/\W/g, '_');
  var fileName = version + '_' + normalizedName + '.js';
  var targetFile = path.normalize(dir + '/' + fileName);

  var templateFile = __dirname + '/migration.tpl.js';
  var templateContent = fs.readFileSync(templateFile, 'utf8');

  return Q.fcall(function() {
    fs.writeFileSync(targetFile, templateContent, 'utf8');
  });
};
