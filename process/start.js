var forever = require('forever-monitor')
  , log = require('../lib/logger')({ component: 'start' })
  , watcher = new (forever.Monitor)(__dirname + '/cron.js'
    , { max: 3
      , silent: true
      , args: []
      })
    .on('exit', log('info', 'watcher cron died after 3 restarts'))
  , mailer = new (forever.Monitor)(__dirname + '/mailer.js'
    , { max: 3
      , silent: true
      , args: []
      })
    .on('exit', log('info', 'mailer died after 3 restarts'))

watcher.start()
mailer.start()