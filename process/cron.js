var CronJob = require('cron').CronJob
  , watcher = require('./watcher')
  , log = require('../lib/logger')({ component: 'cron' })
  , moment = require('moment')
  , job

log('info', 'Starting cron')()
job = new CronJob(
  '0 0 */1 * * *'
, watcher
, function () {
    log('info', 'Exited watcher')()
  }
, true
, 'Europe/London'
)

