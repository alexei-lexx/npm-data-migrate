var commander = require('commander');
var Q = require('q');
var path = require('path');
var loadMigrations = require('./load_migrations');
var Migrator = require('./migrator');

var Command = function() {
  var self = this;

  this.program = new commander.Command();
  var defaultDir = path.normalize(process.cwd() + '/migrations');

  this.program
    .option('-e, --env <env>'
          , 'Set the NODE_ENV environment (development by default)'
          , 'development')
    .option('-d, --dir <dir>', 'Set the migrations directory (./migrations)'
          , function(value) {
            return path.isAbsolute(value)
                        ? value
                        : path.normalize(process.cwd() + '/' + value);
          }
          , defaultDir);

  this.program
    .command('migrate')
    .description('Run pending migrations')
    .action(function() {
      self._migrate();
    });

  this.program
    .command('rollback')
    .description('Rollback the last migration')
    .action(function() {
      self._rollback();
    });
};

Command.prototype.run = function(args) {
  this.deferred = Q.defer();
  this.program.parse(args);
  return this.deferred.promise;
};

Command.prototype._migrate = function() {
  var deferred = this.deferred;

  process.env.NODE_ENV = this.program.env;

  loadMigrations(this.program.dir)
  .then(function(migrations) {
    var migrator = new Migrator(migrations);
    return migrator.migrate();
  })
  .then(function() {
    deferred.resolve();
  }, function(err) {
    deferred.reject(err);
  });
};

Command.prototype._rollback = function() {
  var deferred = this.deferred;

  process.env.NODE_ENV = this.program.env;

  loadMigrations(this.program.dir)
  .then(function(migrations) {
    var migrator = new Migrator(migrations);
    return migrator.rollback();
  })
  .then(function() {
    deferred.resolve();
  }, function(err) {
    deferred.reject(err);
  });
};

module.exports = Command;
