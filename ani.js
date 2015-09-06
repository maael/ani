#!/usr/bin/env node
var program = require('commander')
  , cli = require('./lib/cli')

program
  .version('0.0.1')

program
  .command('start')
  .description('start ani')
  .action(cli.start)

program
  .command('status')
  .alias('stat')
  .description('get ani stats')
  .action(function () {
    console.log('stats')
  })

program
  .command('configure')
  .alias('config')
  .description('configure MAL account')
  .action(cli.configMAL)

program
  .command('settings')
  .alias('set')
  .description('define options for ani')
  .action(function () {

  })

program
  .command('search [anime]')
  .alias('s')
  .description('search for anime on MAL')
  .action(cli.search)

program
  .command('list')
  .alias('ls')
  .description('list subscriptions')
  .option('-f --filter <filter>', 'Filter subscription lists')
  .action(cli.list)

program
  .command('exec <cmd>')
  .alias('ex')
  .description('execute the given remote cmd')
  .option('-e, --mode <mode>', 'Which exec mode to use')
  .action(function (cmd, options) {
    console.log('exec "%s" using %s mode', cmd, options.mode)
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ deploy exec sequential');
    console.log('    $ deploy exec async');
    console.log();
  });

program
  .command('*')
  .action(function (env) {
    console.log('deploying "%s"', env);
  });

program.parse(process.argv)
