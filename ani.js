#!/usr/bin/env node
var program = require('commander')
  , db = require('./lib/db')

program
  .version('0.0.1')

program
  .command('start')
  .description('start ani watcher')
  .action(function () {
    console.log('started')
  })

program
  .command('list')
  .alias('ls')
  .description('list subscriptions')
  .action(function () {
    db
      .loadDB('subscriptions')
      .then(db.getSubscriptions)
      .then(function (subscriptions) {
        console.log(subscriptions)
      })
  })

program
  .command('add')
  .alias('a')
  .description('add a subscription')
  .action(function () {
    db
      .loadDB('subscriptions')
      .then(function () {
        db.dbs.subscriptions.remove({}, { multi: true })
      })
      .then(db.addSubscription.bind(null, { name: 'Robotics;Notes', downloadName: 'Robotics;Notes', group: 'Horrible Subs', quality: '720p' }))
      .then(db.addSubscription.bind(null, { name: 'Heavy Object', downloadName: 'Heavy Object', group: 'Horrible Subs', quality: '720p' }))
  })

program
  .parse(process.argv)
