var program = require('commander');
var path = require('path');
var loadMigrations = require('./load_migrations');
var runMigrations = require('./run_migrations');
var rollbackMigrations = require('./rollback_migrations');

module.exports = function() {
  defineGlobalOptions();
  defineMigrateCommand();
  defineRollbackCommand();
  program.parse(process.argv);
};

function defineGlobalOptions() {
  program
    .option('-e, --env <env>'
          , 'Set the NODE_ENV environment (development by default)'
          , 'development')
    .option('-d, --dir <dir>', 'Set the migrations directory (./migrations)'
          , './migrations');
}

function defineMigrateCommand() {
  program
    .command('migrate')
    .description('Run pending migrations')
    .action(function() {
      process.env.NODE_ENV = program.env;

      var dir = getMigrationsDir();

      console.info('NODE_ENV is set to ' + process.env.NODE_ENV);
      console.info('Run pending migrations in ' + dir);

      loadMigrations(dir)
      .then(runMigrations)
      .then(function() {
        console.info('Completed');
        process.exit(0);
      }, function(err) {
        console.error('Failed: ', err);
        process.exit(1);
      });
    });
}

function defineRollbackCommand() {
  program
    .command('rollback')
    .description('Rollback the last migration')
    .action(function(options) {
      process.env.NODE_ENV = program.env;

      var dir = getMigrationsDir();

      console.info('NODE_ENV is set to ' + process.env.NODE_ENV);
      console.info('Rollback the last migration in ' + dir);

      loadMigrations(dir)
      .then(rollbackMigrations)
      .then(function() {
        console.info('Completed');
        process.exit(0);
      }, function(err) {
        console.error('Failed: ', err);
        process.exit(1);
      });
    });
}

function getMigrationsDir() {
  return path.isAbsolute(program.dir)
          ? program.dir
          : path.normalize(process.cwd() + '/' + program.dir);
}
