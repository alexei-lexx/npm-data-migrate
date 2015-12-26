var commander = require('commander');
var Q = require('q');
var path = require('path');
var loadMigrations = require('./load_migrations');
var createMigration = require('./create_migration');
var MigrationsSet = require('./migrations_set');

var Cli = function(dir, env) {
  this.dir = path.isAbsolute(dir) ? dir
                                  : path.normalize(process.cwd() + '/' + dir);

  process.env.NODE_ENV = env;
};

Cli.prototype.migrate = function() {
  return loadMigrations(this.dir)
  .then(function(migrations) {
    var migrationsSet = new MigrationsSet(migrations);
    return migrationsSet.migrate();
  });
};

Cli.prototype.rollback = function() {
  return loadMigrations(this.dir)
  .then(function(migrations) {
    var migrationsSet = new MigrationsSet(migrations);
    return migrationsSet.rollback();
  });
};

Cli.prototype.create = function(migrationName) {
  return createMigration(this.dir, migrationName);
};

Cli.exec = function(args) {
  var program = new commander.Command();
  var deferred = Q.defer();

  program
    .option('-e, --env <env>'
          , 'Set the NODE_ENV environment (development by default)'
          , 'development')
    .option('-d, --dir <dir>'
          , 'Set the migrations directory (./migrations)'
          , './migrations');

  program
    .command('migrate')
    .description('Run pending migrations')
    .action(function() {
      var cli = new Cli(program.dir, program.env);
      cli.migrate()
      .then(deferred.resolve, deferred.reject);
    });

  program
    .command('rollback')
    .description('Rollback the last migration')
    .action(function() {
      var cli = new Cli(program.dir, program.env);
      cli.rollback()
      .then(deferred.resolve, deferred.reject);
    });

  program
    .command('create <name>')
    .description('Create a new migration')
    .action(function(migrationName) {
      var cli = new Cli(program.dir, program.env);
      cli.create(migrationName)
      .then(deferred.resolve, deferred.reject);
    });

  program.parse(args);

  return deferred.promise;
};

module.exports = Cli;
